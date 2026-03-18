import Tesseract from "tesseract.js";

export async function extractTextFromImage(
  imageBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const {
    data: { text },
  } = await Tesseract.recognize(imageBuffer, "fra", {
    logger: () => {},
  });

  return text;
}
