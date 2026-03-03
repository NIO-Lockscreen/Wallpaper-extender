import { GoogleGenAI } from "@google/genai";

export interface GenerationOptions {
  type: 'ios' | 'pc';
  iosMode: 'balanced' | 'clock';
  pcRatio: '16:9' | '4:3';
  pcPosition: 'center' | 'left' | 'right';
}

export async function generateWallpaper(
  imageBase64: string,
  mimeType: string,
  options: GenerationOptions
): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
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
      throw new Error("No content generated");
    }

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image generated in response");
  } catch (error) {
    console.error("Error generating wallpaper:", error);
    throw error;
  }
}
