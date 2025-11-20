import { GoogleGenAI } from "@google/genai";
import { ThumbnailStyle } from "../types";

const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:image/xyz;base64, prefix
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const generateThumbnail = async (
  imageFile: File,
  topic: string,
  style: ThumbnailStyle
): Promise<string | null> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  // Always create a new instance to ensure the latest key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Image = await getBase64(imageFile);

  // Construct a prompt that guides the model to create a YouTube thumbnail
  // specifically using the user's image as the source subject.
  const prompt = `
    Create a high-quality YouTube thumbnail (16:9 aspect ratio) based on the attached image.
    
    Context/Topic of the video: "${topic}".
    Visual Style: ${style}.
    
    Instructions:
    1. Use the person or main subject from the provided image.
    2. Transform the background and lighting to match the "${style}" style.
    3. The image should be eye-catching, high resolution, and suitable for a YouTube cover.
    4. If the topic implies a specific emotion (e.g., shock, happiness), modify the subject's expression subtly to match if possible, or enhance the lighting to convey the mood.
    5. Make it look like a professional YouTuber's thumbnail.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: imageFile.type,
              data: base64Image
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        imageConfig: {
           aspectRatio: "16:9",
           // Optional: Request higher resolution if needed, defaults to 1K.
           // imageSize: "2K" 
        }
      }
    });

    // Iterate through parts to find the image
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    throw error;
  }
};