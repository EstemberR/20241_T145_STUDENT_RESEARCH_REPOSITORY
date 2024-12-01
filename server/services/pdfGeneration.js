import PDFDocument from 'pdfkit';

class PDFGenerator {
  constructor() {
    this.doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      bufferPages: true
    });
  }

  generateHeader() {
    this.doc.fontSize(24)
        .text('BUKSU', { align: 'center' })
        .fontSize(16)
        .text('Student Research Repository', { align: 'center' })
        .moveDown(0.5);

    // Add horizontal line
    this.doc.moveTo(50, this.doc.y)
        .lineTo(545, this.doc.y)
        .stroke()
        .moveDown();
  }

  generateTitle(startDate, endDate, course) {
    this.doc.fontSize(20)
        .text('Research Report', { align: 'center' })
        .fontSize(12)
        .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' })
        .moveDown(2);

    // Add filters section
    this.doc.fontSize(14)
        .text('Report Filters', { underline: true })
        .moveDown(0.5)
        .fontSize(12);

    if (startDate && endDate) {
      this.doc.text(`Date Range: ${startDate} - ${endDate}`);
    }

    if (course) {
      this.doc.text(`Course: ${course}`);
    }
    this.doc.moveDown(2);
  }

  generateResearchEntry(research, index) {
    // Add page break if needed
    if (index > 0 && this.doc.y > 700) {
      this.doc.addPage();
      // Add header to new page
      this.doc.fontSize(12)
          .text('Research Report (Continued)', { align: 'right' })
          .moveDown();
    }

    // Research entry box
    const yStart = this.doc.y;
    this.doc.rect(50, yStart, 495, 140)
        .stroke()
        .moveDown(0.5);

    // Title with background
    this.doc.fontSize(14)
        .fillColor('#000080')
        .text(research.title || 'Untitled', {
          width: 475,
          align: 'left',
          indent: 10
        })
        .fillColor('black');

    // Content with proper spacing
    this.doc.fontSize(11)
        .moveDown(0.5);

    const authors = Array.isArray(research.authors)
      ? research.authors.join(', ')
      : (typeof research.authors === 'string' ? research.authors : 'No authors listed');

    // Two-column layout for details
    const leftColumn = 60;
    const rightColumn = 150;
    const lineHeight = 20;

    this.doc.text('Authors:', leftColumn, this.doc.y)
        .text(authors, rightColumn, this.doc.y - lineHeight, { width: 375 })
        .moveDown(0.5);

    this.doc.text('Course:', leftColumn)
        .text(research.mongoId?.course || 'N/A', rightColumn, this.doc.y - lineHeight)
        .moveDown(0.5);

    this.doc.text('Adviser:', leftColumn)
        .text(research.adviser?.name || 'N/A', rightColumn, this.doc.y - lineHeight)
        .moveDown(0.5);

    this.doc.text('Status:', leftColumn)
        .text(research.status || 'N/A', rightColumn, this.doc.y - lineHeight)
        .moveDown(0.5);

    this.doc.text('Submitted:', leftColumn)
        .text(research.uploadDate ? new Date(research.uploadDate).toLocaleDateString() : 'N/A',
          rightColumn, this.doc.y - lineHeight)
        .moveDown(2);
  }

  generateSummary(filteredResearches, startDate, endDate, course) {
    this.doc.addPage();
    this.doc.fontSize(16)
        .text('Summary', { align: 'center' })
        .moveDown();

    // Add summary box
    const summaryY = this.doc.y;
    this.doc.rect(100, summaryY, 395, 100)
        .stroke();

    // Summary content
    this.doc.fontSize(12)
        .text('Total Research Papers:', 120, summaryY + 20)
        .text(filteredResearches.length.toString(), 300, summaryY + 20)
        .moveDown();

    if (course) {
      this.doc.text(`Course Filter:`, 120, summaryY + 40)
          .text(course, 300, summaryY + 40)
          .moveDown();
    }

    this.doc.text(`Date Range:`, 120, summaryY + 60)
        .text(`${startDate} - ${endDate}`, 300, summaryY + 60);
  }

  generateFooter() {
    const pageCount = this.doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      this.doc.switchToPage(i);
      
      // Add footer line
      this.doc.moveTo(50, 750)
          .lineTo(545, 750)
          .stroke();

      // Add page number
      this.doc.fontSize(10)
          .text(
            `Page ${i + 1} of ${pageCount}`,
            50,
            760,
            { align: 'center' }
          );
    }
  }

  generateReport(researches, startDate, endDate, course) {
    this.generateHeader();
    this.generateTitle(startDate, endDate, course);

    researches.forEach((research, index) => {
      this.generateResearchEntry(research, index);
    });

    this.generateSummary(researches, startDate, endDate, course);
    this.generateFooter();
    
    return this.doc;
  }
}

export default PDFGenerator;