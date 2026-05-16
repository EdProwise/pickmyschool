import { NextRequest, NextResponse } from 'next/server';
import { mkdir } from 'fs/promises';
import path from 'path';
import { existsSync, createWriteStream } from 'fs';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');

// ── Color Palette ────────────────────────────────────────────────────────────
const C = {
  navy:        '#1e3a8a',
  navyDark:    '#172554',
  teal:        '#0d9488',
  tealLight:   '#ccfbf1',
  gold:        '#d97706',
  goldLight:   '#fef3c7',
  purple:      '#7c3aed',
  purpleLight: '#ede9fe',
  rose:        '#e11d48',
  roseLight:   '#ffe4e6',
  cyan:        '#0891b2',
  cyanLight:   '#cffafe',
  green:       '#16a34a',
  greenLight:  '#dcfce7',
  orange:      '#ea580c',
  orangeLight: '#ffedd5',
  slate:       '#334155',
  slateLight:  '#f1f5f9',
  grayLight:   '#e2e8f0',
  white:       '#ffffff',
  gray:        '#64748b',
};

// ── Draw helpers ─────────────────────────────────────────────────────────────
function fillRect(doc: any, x: number, y: number, w: number, h: number, hex: string) {
  doc.save().rect(x, y, w, h).fill(hex).restore();
}

function roundedRect(doc: any, x: number, y: number, w: number, h: number, r: number, hex: string) {
  doc.save().roundedRect(x, y, w, h, r).fill(hex).restore();
}

function pageFooter(doc: any, schoolName: string, pageNum: number) {
  const y = 815;
  fillRect(doc, 0, y, 595, 28, C.navyDark);
  doc.fontSize(7.5).font('Helvetica').fillColor(C.white);
  doc.text(schoolName, 24, y + 9, { lineBreak: false });
  doc.text('Annual Fees Structure', 200, y + 9, { lineBreak: false, width: 195, align: 'center' });
  doc.text(`Page ${pageNum}`, 500, y + 9, { lineBreak: false });
}

// ── Group config ─────────────────────────────────────────────────────────────
const GROUPS = [
  { label: 'Kindergarten',   bg: C.gold,   light: C.goldLight,   keys: ['kg'] },
  { label: 'Primary (1–5)',  bg: C.teal,   light: C.tealLight,   keys: ['class1','class2','class3','class4','class5'] },
  { label: 'Middle (6–8)',   bg: C.cyan,   light: C.cyanLight,   keys: ['class6','class7','class8'] },
  { label: 'Secondary (9–10)', bg: C.purple, light: C.purpleLight, keys: ['class9','class10'] },
  { label: 'Senior Secondary (11–12)', bg: C.rose, light: C.roseLight, keys: ['class11','class12'] },
];

const CLASS_LABELS: Record<string, string> = {
  kg: 'Kindergarten (KG)',
  class1: 'Class 1', class2: 'Class 2', class3: 'Class 3',
  class4: 'Class 4', class5: 'Class 5', class6: 'Class 6',
  class7: 'Class 7', class8: 'Class 8', class9: 'Class 9',
  class10: 'Class 10', class11: 'Class 11', class12: 'Class 12',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schoolId, schoolName, feesStructure } = body;

    if (!schoolId || !schoolName || !feesStructure) {
      return NextResponse.json(
        { error: 'Missing required fields: schoolId, schoolName, feesStructure' },
        { status: 400 }
      );
    }

    const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: false });

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'fees');
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const rand = Math.random().toString(36).substring(2, 8);
    const filename = `${schoolId}-fees-${timestamp}-${rand}.pdf`;
    const filePath = path.join(uploadDir, filename);
    const writeStream = createWriteStream(filePath);
    doc.pipe(writeStream);

    let pageNum = 0;

    // Collect all numeric fee values for stats
    const allFees: number[] = [];
    for (const grp of GROUPS) {
      for (const key of grp.keys) {
        const val = feesStructure[key];
        if (val && typeof val === 'object') {
          Object.values(val).forEach(v => { if (v) allFees.push(Number(v)); });
        } else if (val) {
          allFees.push(Number(val));
        }
      }
    }
    const minFee = allFees.length ? Math.min(...allFees) : 0;
    const maxFee = allFees.length ? Math.max(...allFees) : 0;
    const totalEntries = allFees.length;

    // ═══════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER
    // ═══════════════════════════════════════════════════════════════════════
    doc.addPage();
    pageNum++;

    // Navy top band
    fillRect(doc, 0, 0, 595, 300, C.navyDark);
    fillRect(doc, 0, 295, 595, 8, C.gold);
    fillRect(doc, 0, 303, 595, 4, C.teal);

    // School initials badge
    const initials = schoolName.split(' ').slice(0, 2).map((w: string) => w[0] || '').join('').toUpperCase();
    roundedRect(doc, 450, 28, 110, 110, 14, C.teal);
    doc.fontSize(42).font('Helvetica-Bold').fillColor(C.white)
       .text(initials, 450, 55, { width: 110, align: 'center', lineBreak: false });

    // Title text
    const nameSize = schoolName.length > 40 ? 24 : schoolName.length > 25 ? 28 : 34;
    doc.fontSize(nameSize).font('Helvetica-Bold').fillColor(C.white)
       .text(schoolName, 30, 50, { width: 400 });

    // "FEES STRUCTURE" badge
    fillRect(doc, 30, 150, 220, 34, C.gold);
    doc.fontSize(14).font('Helvetica-Bold').fillColor(C.white)
       .text('ANNUAL FEES STRUCTURE', 30, 158, { width: 220, align: 'center', lineBreak: false });

    // Year
    doc.fontSize(11).font('Helvetica').fillColor('#94a3b8')
       .text(`Academic Year ${new Date().getFullYear()}–${new Date().getFullYear() + 1}`, 30, 200, { lineBreak: false });

    // ── Stats bar ────────────────────────────────────────────────────────
    const statsY = 316;
    fillRect(doc, 0, statsY, 595, 90, C.slateLight);

    const stats = [
      { label: 'TOTAL ENTRIES', value: String(totalEntries), color: C.navy },
      { label: 'MINIMUM FEE', value: minFee ? `₹${minFee.toLocaleString('en-IN')}` : '—', color: C.teal },
      { label: 'MAXIMUM FEE', value: maxFee ? `₹${maxFee.toLocaleString('en-IN')}` : '—', color: C.purple },
      { label: 'GENERATED ON', value: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), color: C.gold },
    ];
    stats.forEach((s, i) => {
      const sx = 20 + i * 140;
      roundedRect(doc, sx, statsY + 12, 128, 60, 6, C.white);
      doc.fontSize(17).font('Helvetica-Bold').fillColor(s.color)
         .text(s.value, sx, statsY + 22, { width: 128, align: 'center', lineBreak: false });
      doc.fontSize(7).font('Helvetica').fillColor(C.gray)
         .text(s.label, sx, statsY + 46, { width: 128, align: 'center', lineBreak: false });
    });

    // ── About box ───────────────────────────────────────────────────────
    const aboutY = 428;
    roundedRect(doc, 20, aboutY, 555, 80, 8, C.white);
    fillRect(doc, 20, aboutY, 6, 80, C.teal);
    doc.fontSize(12).font('Helvetica-Bold').fillColor(C.navy)
       .text('About This Document', 38, aboutY + 12, { lineBreak: false });
    doc.fontSize(9.5).font('Helvetica').fillColor(C.slate)
       .text(
         'This document presents the official annual fee structure for all classes offered by the school. ' +
         'Fees are listed class-wise and stream-wise for senior secondary classes. ' +
         'All amounts are in Indian Rupees (₹) and represent annual charges.',
         38, aboutY + 30, { width: 525, align: 'justify' }
       );

    // ── Legend ──────────────────────────────────────────────────────────
    const legY = 530;
    doc.fontSize(10).font('Helvetica-Bold').fillColor(C.navy).text('Fee Category Colors', 30, legY);
    GROUPS.forEach((g, i) => {
      const lx = 30 + (i % 3) * 185;
      const ly = legY + 18 + Math.floor(i / 3) * 26;
      roundedRect(doc, lx, ly, 14, 14, 3, g.bg);
      doc.fontSize(9).font('Helvetica').fillColor(C.slate)
         .text(g.label, lx + 20, ly + 2, { lineBreak: false });
    });

    // ── Divider ─────────────────────────────────────────────────────────
    fillRect(doc, 20, 620, 555, 1, C.grayLight);

    // ── Important note ──────────────────────────────────────────────────
    roundedRect(doc, 20, 630, 555, 50, 6, C.goldLight);
    fillRect(doc, 20, 630, 5, 50, C.gold);
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor(C.gold).text('Important Notice', 34, 640, { lineBreak: false });
    doc.fontSize(8).font('Helvetica').fillColor(C.slate)
       .text(
         'Fees are subject to revision. Please contact the school administration for the most current information. ' +
         'This document is auto-generated and for reference purposes only.',
         34, 653, { width: 525, lineBreak: false }
       );

    pageFooter(doc, schoolName, pageNum);

    // ═══════════════════════════════════════════════════════════════════════
    // PAGE 2+ — FEES TABLE
    // ═══════════════════════════════════════════════════════════════════════
    doc.addPage();
    pageNum++;

    // Page header band
    fillRect(doc, 0, 0, 595, 56, C.navyDark);
    fillRect(doc, 0, 52, 595, 4, C.gold);
    doc.fontSize(18).font('Helvetica-Bold').fillColor(C.white)
       .text('Class-wise Fee Schedule', 24, 16, { lineBreak: false });
    doc.fontSize(9).font('Helvetica').fillColor('#94a3b8')
       .text(schoolName, 24, 38, { lineBreak: false });

    // Column headers
    const COL = { grade: 30, stream: 220, fee: 400 };
    const COL_W = { grade: 185, stream: 175, fee: 165 };
    const headerY = 68;
    fillRect(doc, 20, headerY, 555, 26, C.navy);
    doc.fontSize(9).font('Helvetica-Bold').fillColor(C.white);
    doc.text('Class / Grade', COL.grade, headerY + 8, { width: COL_W.grade, lineBreak: false });
    doc.text('Stream / Category', COL.stream, headerY + 8, { width: COL_W.stream, lineBreak: false });
    doc.text('Annual Fee (₹)', COL.fee, headerY + 8, { width: COL_W.fee, align: 'right', lineBreak: false });

    let curY = headerY + 26;

    for (const grp of GROUPS) {
      // Check if any entry exists in this group
      const hasEntries = grp.keys.some(key => {
        const val = feesStructure[key];
        if (!val) return false;
        if (typeof val === 'object') return Object.values(val).some(Boolean);
        return true;
      });
      if (!hasEntries) continue;

      // Page break check
      if (curY > 750) { doc.addPage(); pageNum++; curY = 20; }

      // ── Group header ──
      roundedRect(doc, 20, curY, 555, 26, 5, grp.bg);
      fillRect(doc, 20, curY + 13, 555, 13, grp.bg); // square bottom
      doc.fontSize(10).font('Helvetica-Bold').fillColor(C.white)
         .text(grp.label, COL.grade, curY + 8, { lineBreak: false });
      curY += 26;

      let rowIdx = 0;
      for (const key of grp.keys) {
        const val = feesStructure[key];
        if (!val) continue;

        const rowBg = rowIdx % 2 === 0 ? C.white : grp.light;

        if (typeof val === 'object' && (key === 'class11' || key === 'class12')) {
          // Stream-wise rows
          const streamEntries = Object.entries(val).filter(([, v]) => v);
          if (streamEntries.length === 0) continue;

          streamEntries.forEach(([stream, fee], si) => {
            if (curY > 760) { doc.addPage(); pageNum++; curY = 20; }
            const bg = (rowIdx + si) % 2 === 0 ? C.white : grp.light;
            fillRect(doc, 20, curY, 555, 28, bg);

            // Left accent stripe
            fillRect(doc, 20, curY, 4, 28, grp.bg);

            doc.fontSize(9.5).font(si === 0 ? 'Helvetica-Bold' : 'Helvetica').fillColor(C.slate)
               .text(si === 0 ? CLASS_LABELS[key] : '', COL.grade, curY + 8, { width: COL_W.grade, lineBreak: false });

            // Stream pill
            roundedRect(doc, COL.stream, curY + 6, 80, 16, 8, grp.bg);
            doc.fontSize(8).font('Helvetica-Bold').fillColor(C.white)
               .text(stream.charAt(0).toUpperCase() + stream.slice(1), COL.stream + 4, curY + 10, { width: 72, lineBreak: false });

            // Fee value
            const feeAmt = Number(fee);
            doc.fontSize(11).font('Helvetica-Bold').fillColor(grp.bg)
               .text(`₹${feeAmt.toLocaleString('en-IN')}`, COL.fee, curY + 8, { width: COL_W.fee, align: 'right', lineBreak: false });

            // Thin border
            doc.save().moveTo(20, curY + 28).lineTo(575, curY + 28).strokeColor(C.grayLight).lineWidth(0.5).stroke().restore();
            curY += 28;
          });
          rowIdx++;
        } else if (val) {
          // Single fee row
          if (curY > 760) { doc.addPage(); pageNum++; curY = 20; }
          fillRect(doc, 20, curY, 555, 28, rowBg);
          fillRect(doc, 20, curY, 4, 28, grp.bg);

          doc.fontSize(9.5).font('Helvetica-Bold').fillColor(C.slate)
             .text(CLASS_LABELS[key] || key, COL.grade, curY + 8, { width: COL_W.grade, lineBreak: false });
          doc.fontSize(9).font('Helvetica').fillColor(C.gray)
             .text('—', COL.stream, curY + 9, { width: COL_W.stream, lineBreak: false });

          const feeAmt = Number(val);
          doc.fontSize(11).font('Helvetica-Bold').fillColor(grp.bg)
             .text(`₹${feeAmt.toLocaleString('en-IN')}`, COL.fee, curY + 8, { width: COL_W.fee, align: 'right', lineBreak: false });

          doc.save().moveTo(20, curY + 28).lineTo(575, curY + 28).strokeColor(C.grayLight).lineWidth(0.5).stroke().restore();
          curY += 28;
          rowIdx++;
        }
      }
      curY += 8; // group spacing
    }

    // ── Summary total bar ─────────────────────────────────────────────
    if (curY < 760) {
      curY += 10;
      roundedRect(doc, 20, curY, 555, 38, 6, C.navy);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(C.white)
         .text('Summary', COL.grade, curY + 12, { lineBreak: false });
      doc.fontSize(10).font('Helvetica').fillColor(C.tealLight)
         .text(`${totalEntries} fee entr${totalEntries === 1 ? 'y' : 'ies'}`, COL.stream, curY + 12, { lineBreak: false });
      if (minFee && maxFee) {
        doc.fontSize(10).font('Helvetica-Bold').fillColor(C.gold)
           .text(`₹${minFee.toLocaleString('en-IN')} – ₹${maxFee.toLocaleString('en-IN')}`, COL.fee, curY + 12, { width: COL_W.fee, align: 'right', lineBreak: false });
      }
      curY += 38;
    }

    pageFooter(doc, schoolName, pageNum);

    // ═══════════════════════════════════════════════════════════════════════
    // BACK COVER
    // ═══════════════════════════════════════════════════════════════════════
    doc.addPage();
    pageNum++;

    fillRect(doc, 0, 0, 595, 842, C.navyDark);
    fillRect(doc, 0, 220, 595, 8, C.gold);
    fillRect(doc, 0, 228, 595, 4, C.teal);
    fillRect(doc, 0, 232, 595, 4, C.purple);

    // Watermark initials
    doc.fontSize(180).font('Helvetica-Bold').fillColor('#1e3a8a')
       .text(initials, 0, 50, { width: 595, align: 'center', lineBreak: false });

    doc.fontSize(32).font('Helvetica-Bold').fillColor(C.white)
       .text(schoolName, 30, 260, { width: 535, align: 'center' });
    doc.fontSize(13).font('Helvetica').fillColor(C.gold)
       .text('Annual Fees Structure', 30, 308, { width: 535, align: 'center' });
    doc.fontSize(11).font('Helvetica').fillColor('#94a3b8')
       .text(`Academic Year ${new Date().getFullYear()}–${new Date().getFullYear() + 1}`, 30, 332, { width: 535, align: 'center' });

    // Color stripe decoration
    const stripeY = 380;
    const stripeColors = [C.gold, C.teal, C.cyan, C.purple, C.rose];
    stripeColors.forEach((col, i) => {
      fillRect(doc, 20 + i * 113, stripeY, 108, 6, col);
    });

    // Contact reminder box
    roundedRect(doc, 80, 410, 435, 100, 10, '#1e3a8a');
    doc.fontSize(10).font('Helvetica-Bold').fillColor(C.gold)
       .text('For Admissions & Fee Enquiries', 80, 428, { width: 435, align: 'center', lineBreak: false });
    doc.fontSize(9).font('Helvetica').fillColor(C.white)
       .text('Please contact the school administration directly.', 80, 448, { width: 435, align: 'center', lineBreak: false });
    doc.fontSize(9).font('Helvetica').fillColor('#94a3b8')
       .text('Fees are subject to change. This document is for reference only.', 80, 466, { width: 435, align: 'center', lineBreak: false });
    doc.fontSize(9).font('Helvetica').fillColor('#64748b')
       .text(`Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 80, 488, { width: 435, align: 'center', lineBreak: false });

    // Bottom stripe
    fillRect(doc, 0, 800, 595, 42, C.navy);
    doc.fontSize(9).font('Helvetica').fillColor(C.white)
       .text(schoolName, 24, 818, { lineBreak: false });
    doc.fontSize(9).font('Helvetica').fillColor(C.gold)
       .text('Annual Fees Structure', 400, 818, { lineBreak: false });

    // Finalize
    doc.end();

    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    return NextResponse.json({ success: true, url: `/uploads/fees/${filename}` });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
