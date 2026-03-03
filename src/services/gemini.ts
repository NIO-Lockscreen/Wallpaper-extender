import { GoogleGenAI } from "@google/genai";

export interface GenerationOptions {
  type: 'ios' | 'pc';
  iosMode: 'balanced' | 'clock';
  pcRatio: '16:9' | '4:3';
  pcPosition: 'center' | 'left' | 'right';
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey) return false;
  try {
    const ai = new GoogleGenAI({ apiKey });
    // Use a lightweight model for validation
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "test",
    });
    return true;
  } catch (error) {
    console.error("API Key validation failed:", error);
    return false;
  }
}

export async function generateWallpaper(
  imageBase64: string,
  mimeType: string,
  options: GenerationOptions,
  userApiKey?: string
): Promise<string> {
  try {
    const apiKey = userApiKey || process.env.GEMINI_API_KEY;
    
    // Debug logging (masked)
    if (apiKey) {
      console.log(`Using API Key: ${apiKey.substring(0, 4)}... (Length: ${apiKey.length})`);
    } else {
      console.log("No API Key found.");
    }

    if (!apiKey) {
      throw new Error("API Key is missing. Please set GEMINI_API_KEY in your environment variables or provide it in the app.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Always use the free model as requested
    const model = "gemini-2.5-flash-image";
    
    const imageConfig: any = {
      aspectRatio: options.type === 'ios' ? "9:16" : options.pcRatio,
    };
    
    let promptText = "";
    
    if (options.type === 'ios') {
      if (options.iosMode === 'clock') {
        promptText = "Extend this image to fill the 9:16 aspect ratio. IMPORTANT: Add significant empty or clean space at the TOP of the image to allow room for the iOS lock screen clock. Push the main subject of the image downwards if necessary to create this top margin. Keep the extension seamless.";
      } else {
        promptText = "Extend this image to fill the 9:16 aspect ratio, adding seamless content to the top and bottom while preserving the original style and subject.";
      }
    } else {
      // PC Mode
      const positionPrompt = {
        'center': "Place the original subject in the CENTER of the new wide aspect ratio.",
        'left': "Place the original subject on the LEFT side of the new wide aspect ratio, extending the background to the right.",
        'right': "Place the original subject on the RIGHT side of the new wide aspect ratio, extending the background to the left."
      };
      
      promptText = `Extend this image to fill the ${options.pcRatio} aspect ratio. ${positionPrompt[options.pcPosition]} Ensure the extension is seamless and matches the original style.`;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            text: promptText,
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64,
            },
          },
        ],
      },
      config: {
        imageConfig: imageConfig,
      },
    });

    // The response structure for images in the new SDK:
    // It might be in candidates[0].content.parts
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      console.log("Full Response:", JSON.stringify(response, null, 2));
      throw new Error("The AI failed to generate an image. This might be due to safety filters or service load. Please try a different image.");
    }

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data found in the response.");
  } catch (error: any) {
    console.error("Error generating wallpaper:", error);
    // Return a user-friendly error message
    if (error.message.includes("API Key")) {
      throw error;
    }
    throw new Error(error.message || "Failed to generate wallpaper. Please try again.");
  }
}
