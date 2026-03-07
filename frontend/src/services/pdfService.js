import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

class PDFService {
  /**
   * Generate PDF from resume preview element
   * @param {HTMLElement} element - The resume preview element
   * @param {string} filename - PDF filename
   */
  async generatePDF(element, filename = 'resume.pdf') {
    try {
      // Ensure element is visible and rendered
      if (!element) {
        throw new Error('Resume preview element not found');
      }

      // Wait a moment for any pending renders
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the element as canvas with high quality
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        removeContainer: false,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('.resume-template');
          if (clonedElement) {
            clonedElement.style.minHeight = 'auto';
            clonedElement.style.height = 'auto';
            clonedElement.style.display = 'block';
            clonedElement.style.visibility = 'visible';
          }
        }
      });

      // Validate canvas
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Failed to capture resume content');
      }

      // Convert to image with proper format
      const imgData = canvas.toDataURL('image/jpeg', 0.95); // Use JPEG instead of PNG
      
      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      
      // Calculate image dimensions to fit A4
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      let heightLeft = imgHeight;
      let position = 0;
      let page = 1;

      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Add additional pages if content exceeds one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
        page++;
      }

      // Save PDF
      pdf.save(filename);
      
      return { success: true, pages: page };
    } catch (error) {
      console.error('PDF generation failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new PDFService();