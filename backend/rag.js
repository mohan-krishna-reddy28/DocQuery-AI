import fs from "fs";

export async function extractText(filePath, mimeType) {
  if (mimeType.includes("pdf")) {
    const buffer = fs.readFileSync(filePath);
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text;
  }
  return "";
}

export function chunkText(text, size = 500, overlap = 100) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    chunks.push(text.slice(start, start + size));
    start += size - overlap;
  }
  return chunks;
}
