import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
export async function POST(req: NextRequest) {
  try {
    const { company, totalScore, stage, dimensionScores } = await req.json();

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Header
    pdf.setFillColor(59, 130, 246);
    pdf.rect(0, 0, 210, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.text('Apex Digital Africa', 105, 20, { align: 'center' });
    pdf.setFontSize(16);
    pdf.text('Growth Scorecard Report', 105, 30, { align: 'center' });

    // Company Info
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(18);
    pdf.text(`Company: ${company}`, 20, 60);
    pdf.text(`Overall Score: ${totalScore}/100`, 20, 70);
    pdf.text(`Growth Stage: ${stage}`, 20, 80);

    // Dimensions
    pdf.setFontSize(14);
    pdf.text('Dimension Breakdown:', 20, 100);
    
    let yPos = 110;
    dimensionScores.forEach((dim: any) => {
      if (yPos > 270) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setFontSize(12);
      pdf.text(`${dim.name}: ${dim.percentage}%`, 20, yPos);
      
      // Progress bar
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(80, yPos - 2, 100, 4);
      pdf.setFillColor(59, 130, 246);
      pdf.rect(80, yPos - 2, dim.percentage, 4, 'F');
      
      yPos += 15;
    });

    // Footer
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Generated ${new Date().toLocaleDateString()} - Page ${i}/${pageCount}`, 105, 290, { align: 'center' });
    }

    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Apex-Growth-Scorecard-${company}-${totalScore}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  }
}
