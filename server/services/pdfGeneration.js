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
    // Add BukSU Logo (if available)
    // this.doc.image('path/to/logo.png', 250, 50, { width: 100 });
    
    // University Name and Title
    this.doc.fontSize(16)
        .text('BUKIDNON STATE UNIVERSITY', { align: 'center' })
        .fontSize(14)
        .text('Student Research Repository', { align: 'center' })
        .moveDown(0.5);

    // Decorative lines
    this.doc.moveTo(50, this.doc.y)
        .lineTo(545, this.doc.y)
        .lineWidth(2)
        .stroke()
        .moveDown();
  }

  generateTitle(startDate, endDate, course) {
    // Report Title
    this.doc.fontSize(18)
        .text('RESEARCH REPORT', { align: 'center' })
        .moveDown();

    // Report Details Box
    const boxY = this.doc.y;
    this.doc.rect(100, boxY, 395, 80)
        .lineWidth(1)
        .stroke();

    this.doc.fontSize(11);
    
    // Report Details Content
    this.doc.text('Report Details:', 120, boxY + 15)
        .moveDown(0.5);
    
    this.doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 120, this.doc.y);
    
    if (startDate && endDate) {
      this.doc.text(`Period Covered: ${startDate} to ${endDate}`, 120, this.doc.y + 15);
    }

    if (course) {
      this.doc.text(`Course: ${course}`, 120, this.doc.y + 15);
    }

    this.doc.moveDown(3);
  }

  generateResearchEntry(research, index) {
    // Add page break if needed
    if (index > 0 && this.doc.y > 650) {
      this.doc.addPage();
      this.generateHeader();
    }

    // Research Entry Container
    const entryY = this.doc.y;
    this.doc.rect(50, entryY, 495, 150)
        .lineWidth(1)
        .stroke();

    // Title Section with blue background
    this.doc.fillColor('#f0f0f0')  // Light gray background
        .rect(51, entryY + 1, 493, 30)
        .fill();

    // Title Text
    this.doc.fillColor('#000080')  // Navy blue text
        .fontSize(12)
        .text(research.title || 'Untitled', 60, entryY + 10, {
          width: 475,
          align: 'left'
        });

    // Reset color and move to content section
    this.doc.fillColor('black')
        .fontSize(10);

    // Content Grid
    const leftCol = 60;
    const rightCol = 160;
    let contentY = entryY + 40;
    const lineHeight = 20;

    // Format authors
    const authors = Array.isArray(research.authors)
      ? research.authors.join(', ')
      : (typeof research.authors === 'string' ? research.authors : 'No authors listed');

    // Details with consistent spacing
    const details = [
      { label: 'Authors:', value: authors },
      { label: 'Course:', value: research.mongoId?.course || 'N/A' },
      { label: 'Adviser:', value: research.adviser?.name || 'N/A' },
      { label: 'Status:', value: research.status || 'N/A' },
      { label: 'Submitted:', value: research.uploadDate ? 
        new Date(research.uploadDate).toLocaleDateString() : 'N/A' }
    ];

    details.forEach((detail, i) => {
      this.doc
          .text(detail.label, leftCol, contentY + (i * lineHeight))
          .text(detail.value, rightCol, contentY + (i * lineHeight), { width: 375 });
    });

    this.doc.moveDown(4);  // Space between entries
  }

  generateSummary(filteredResearches, startDate, endDate, course) {
    this.doc.addPage();
    this.generateHeader();

    // Summary Title
    this.doc.fontSize(16)
        .text('SUMMARY REPORT', { align: 'center' })
        .moveDown(2);

    // Summary Box
    const boxY = this.doc.y;
    this.doc.rect(100, boxY, 395, 120)
        .lineWidth(1)
        .stroke();

    // Summary Header
    this.doc.fillColor('#f0f0f0')
        .rect(101, boxY + 1, 393, 25)
        .fill();

    this.doc.fillColor('black')
        .fontSize(12)
        .text('Report Statistics', 120, boxY + 8)
        .moveDown();

    // Summary Content
    const contentY = boxY + 35;
    this.doc.fontSize(11);

    const details = [
      { label: 'Total Research Papers:', value: filteredResearches.length.toString() },
      { label: 'Course Filter:', value: course || 'All Courses' },
      { label: 'Date Range:', value: `${startDate} to ${endDate}` }
    ];

    details.forEach((detail, i) => {
      this.doc
          .text(detail.label, 120, contentY + (i * 25))
          .text(detail.value, 300, contentY + (i * 25));
    });
  }

  generateFooter() {
    const pageCount = this.doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      this.doc.switchToPage(i);

      // Footer line
      this.doc.moveTo(50, 750)
          .lineTo(545, 750)
          .lineWidth(1)
          .stroke();

      // Footer text
      this.doc.fontSize(8)
          .text(
            'Bukidnon State University - Student Research Repository',
            50,
            760,
            { align: 'left' }
          )
          .text(
            `Page ${i + 1} of ${pageCount}`,
            50,
            760,
            { align: 'right' }
          );
    }
  }

  generateReport(researches, startDate, endDate, course) {
    this.generateHeader();
    this.generateTitle(startDate, endDate, course);

    // Section Title for Research Entries
    this.doc.fontSize(14)
        .text('RESEARCH ENTRIES', { align: 'left' })
        .moveDown();

    researches.forEach((research, index) => {
      this.generateResearchEntry(research, index);
    });

    this.generateSummary(researches, startDate, endDate, course);
    this.generateFooter();
    
    return this.doc;
  }
}

export default PDFGenerator;