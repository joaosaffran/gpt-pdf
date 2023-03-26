import { PDFDocumentProxy } from "pdfjs-dist"
import { TextMarkedContent, type TextItem } from "pdfjs-dist/types/src/display/api"

export async function getPdfDocumentContentAsync(doc: PDFDocumentProxy) {
    const pageCount = getPdfDocumentPagesCount(doc);

    let holeContent: string = ""

    for (let i = 1; i < pageCount; i++) {
        const page = await doc.getPage(i)

        const content = await page.getTextContent({ includeMarkedContent: false, disableCombineTextItems: true })
        holeContent += content.items.map((it: TextItem | TextMarkedContent) => {
            if ('str' in it) {
                return it.str
            }
        }).join(" ")
    }

    return holeContent;
}

export function getPdfDocumentPagesCount(doc: PDFDocumentProxy): number {
    return doc.numPages;
}

export async function getPdfDocumentMetadaAsync(doc: PDFDocumentProxy) {
    const metadata = await doc.getMetadata()

    return metadata
}