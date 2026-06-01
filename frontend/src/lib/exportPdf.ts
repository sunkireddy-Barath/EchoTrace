import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Captures `element` with html2canvas and saves it as a multi-page A4 PDF.
 * @param element  The hidden threat-brief template DOM node
 * @param filename Desired filename (without extension)
 */
export async function exportThreatBriefPdf(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,           // Retina quality
    useCORS: true,
    backgroundColor: '#0a0e1a',
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfW = pdf.internal.pageSize.getWidth();   // 210 mm
  const pdfH = pdf.internal.pageSize.getHeight();  // 297 mm

  const ratio      = pdfW / canvas.width;
  const scaledH    = canvas.height * ratio;

  if (scaledH <= pdfH) {
    // Single page
    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, scaledH);
  } else {
    // Multi-page: slice the canvas into page-height chunks
    let yOffset = 0;
    let remaining = scaledH;

    while (remaining > 0) {
      pdf.addImage(imgData, 'PNG', 0, -yOffset, pdfW, scaledH);
      yOffset   += pdfH;
      remaining -= pdfH;
      if (remaining > 0) pdf.addPage();
    }
  }

  pdf.save(`${filename}.pdf`);
}
