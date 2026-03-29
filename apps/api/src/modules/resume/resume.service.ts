import { PDFParse } from "pdf-parse";

/**
 * Extracts text content from a PDF buffer.
 * @param buffer - The PDF file as a Buffer object
 * @returns A promise that resolves to the extracted text content, trimmed of whitespace
 * @throws {Error} If PDF parsing fails
 * @example
 * ```typescript
 * const pdfBuffer = fs.readFileSync('document.pdf');
 * const text = await extractTextFromPdfBuffer(pdfBuffer);
 * console.log(text);
 * ```
 */
export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text.trim();
  } finally {
    await parser.destroy();
  }
}