import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const A4_W_MM = 210;
const A4_H_MM = 295;   // 2 mm shorter than 297 to avoid orphan lines at page edges

/**
 * Renders the hidden #threat-brief-export element to a premium dark A4 PDF.
 * Strategy:
 *   1. Force the wrapper visible (still off-screen) so html2canvas can read styles.
 *   2. Capture with high-fidelity settings.
 *   3. Restore hidden state.
 *   4. Slice canvas into A4 pages and save.
 */
export async function exportThreatBriefPdf(
  elementRef: HTMLElement,
  filename: string,
): Promise<void> {
  // ── 1. Find the actual A4 content div ─────────────────────────────────────
  const element = document.getElementById('threat-brief-export') ?? elementRef;

  // ── 2. Find the wrapper (the fixed off-screen div that contains the element)
  const wrapper = element.closest<HTMLElement>('[data-brief-wrapper]') ?? element.parentElement as HTMLElement | null;

  // Save original styles so we can restore them
  const prevWrapperVisibility  = wrapper?.style.visibility  ?? '';
  const prevWrapperOpacity     = wrapper?.style.opacity     ?? '';
  const prevWrapperOverflow    = wrapper?.style.overflow     ?? '';
  const prevElementOverflow    = element.style.overflow;

  // ── 3. Force visible before capture (still far off-screen at left:-9999px) ─
  if (wrapper) {
    wrapper.style.visibility = 'visible';
    wrapper.style.opacity    = '1';
    wrapper.style.overflow   = 'visible';
  }
  element.style.overflow = 'visible';

  // Give the browser a frame to re-paint with the new visibility
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

  try {
    // ── 4. Capture ───────────────────────────────────────────────────────────
    const canvas = await html2canvas(element, {
      scale:           2,            // @2x for crisp text on retina
      useCORS:         true,
      allowTaint:      true,
      backgroundColor: '#020817',   // Deep navy — matches EchoTrace dark theme
      logging:         false,
      // Use the element's own scroll dimensions so nothing is clipped
      width:           element.scrollWidth,
      height:          element.scrollHeight,
      windowWidth:     element.scrollWidth,
      windowHeight:    element.scrollHeight,
      x:               0,
      y:               0,
    });

    // ── 5. Build PDF ─────────────────────────────────────────────────────────
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pdfW = pdf.internal.pageSize.getWidth();   // 210 mm
    const pdfH = pdf.internal.pageSize.getHeight();  // 297 mm

    // mm-per-pixel ratio
    const ratio   = pdfW / canvas.width;
    const totalMM = canvas.height * ratio;   // full content height in mm

    if (totalMM <= pdfH) {
      // ── Single page ────────────────────────────────────────────────────────
      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, totalMM);
    } else {
      // ── Multi-page: slice canvas into page-height chunks ───────────────────
      const pageHeightPx = Math.floor(A4_H_MM / ratio);  // pixels per PDF page
      let   srcY         = 0;

      while (srcY < canvas.height) {
        const sliceH = Math.min(pageHeightPx, canvas.height - srcY);

        // Create a temporary canvas for this slice
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width  = canvas.width;
        pageCanvas.height = sliceH;
        const ctx = pageCanvas.getContext('2d')!;

        // Fill dark background so no white flash on empty slice area
        ctx.fillStyle = '#020817';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

        const sliceData   = pageCanvas.toDataURL('image/png');
        const sliceHeightMM = sliceH * ratio;

        if (srcY > 0) pdf.addPage();
        pdf.addImage(sliceData, 'PNG', 0, 0, pdfW, sliceHeightMM);

        srcY += sliceH;
      }
    }

    pdf.save(`${filename}.pdf`);

  } finally {
    // ── 6. Restore hidden state ───────────────────────────────────────────────
    if (wrapper) {
      wrapper.style.visibility = prevWrapperVisibility;
      wrapper.style.opacity    = prevWrapperOpacity;
      wrapper.style.overflow   = prevWrapperOverflow;
    }
    element.style.overflow = prevElementOverflow;
  }
}
