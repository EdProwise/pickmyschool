import { NextRequest, NextResponse } from 'next/server';
import { mkdir } from 'fs/promises';

import path from 'path';
import { existsSync, createWriteStream } from 'fs';
import connectToDatabase from '@/lib/mongodb';
import { School, Result, Alumni, News, User } from '@/lib/models';
import jwt from 'jsonwebtoken';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ── Color Palette ──────────────────────────────────────────────────────────────
const C = {
  navy:      '#1e3a8a',
  navyDark:  '#172554',
  teal:      '#0d9488',
  tealLight: '#ccfbf1',
  gold:      '#d97706',
  goldLight: '#fef3c7',
  purple:    '#7c3aed',
  purpleLight:'#ede9fe',
  rose:      '#e11d48',
  roseLight: '#ffe4e6',
  slate:     '#334155',
  slateLight:'#f1f5f9',
  white:     '#ffffff',
  gray:      '#64748b',
  grayLight: '#e2e8f0',
  green:     '#16a34a',
  red:       '#dc2626',
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function fillRect(doc: any, x: number, y: number, w: number, h: number, hex: string) {
  doc.save().rect(x, y, w, h).fill(hex).restore();
}

function roundedRect(doc: any, x: number, y: number, w: number, h: number, r: number, hex: string) {
  doc.save().roundedRect(x, y, w, h, r).fill(hex).restore();
}

function sectionHeader(doc: any, title: string, bgColor: string, _icon?: string) {
  const y = doc.y;
  fillRect(doc, 0, y, 595, 52, bgColor);
  // Decorative left accent
  fillRect(doc, 0, y, 6, 52, C.gold);
  // Small decorative square bullet before title
  fillRect(doc, 18, y + 19, 10, 14, C.gold);
  doc.fontSize(20).font('Helvetica-Bold').fillColor(C.white)
     .text(title, 36, y + 15, { lineBreak: false });
  doc.moveDown(0.1);
  doc.y = y + 60;
}

function pageFooter(doc: any, schoolName: string, pageNum: number, website?: string) {
  const y = 815;
  fillRect(doc, 0, y, 595, 28, C.navy);
  doc.fontSize(7.5).font('Helvetica').fillColor(C.white);
  doc.text(schoolName, 24, y + 8, { lineBreak: false });
  if (website) doc.text(website, 200, y + 8, { lineBreak: false, align: 'center' });
  doc.text(`Page ${pageNum}`, 500, y + 8, { lineBreak: false });
}

function statBox(doc: any, x: number, y: number, w: number, label: string, value: string, bg: string) {
  roundedRect(doc, x, y, w, 58, 6, bg);
  doc.fontSize(18).font('Helvetica-Bold').fillColor(C.navy)
     .text(value, x, y + 8, { width: w, align: 'center', lineBreak: false });
  doc.fontSize(8).font('Helvetica').fillColor(C.gray)
     .text(label, x, y + 34, { width: w, align: 'center', lineBreak: false });
}

function facilityCheck(doc: any, x: number, y: number, label: string, hasIt: boolean) {
  const iconColor = hasIt ? C.green : C.red;
  roundedRect(doc, x, y, 170, 26, 4, hasIt ? '#f0fdf4' : '#fff1f2');
  // Draw a small colored badge instead of emoji
  roundedRect(doc, x + 4, y + 5, 18, 16, 3, iconColor);
  doc.fontSize(8).font('Helvetica-Bold').fillColor(C.white)
     .text(hasIt ? 'YES' : 'NO', x + 4, y + 8, { width: 18, align: 'center', lineBreak: false });
  doc.fontSize(9).font('Helvetica').fillColor(C.slate)
     .text(label, x + 28, y + 8, { lineBreak: false, width: 138 });
}

function categoryHeader(doc: any, x: number, y: number, label: string, color: string) {
  roundedRect(doc, x, y, 555, 22, 3, color);
  doc.fontSize(10).font('Helvetica-Bold').fillColor(C.white)
     .text(label, x + 10, y + 5, { lineBreak: false });
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Resolve schoolId from user record
    const userRecord = await User.findById(decoded.userId);
    if (!userRecord?.schoolId) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const school = await School.findById(userRecord.schoolId).lean() as any;
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const schoolNumericId = school.id;

    // Fetch related data in parallel
    const [results, alumni, news] = await Promise.all([
      Result.find({ schoolId: schoolNumericId }).sort({ year: -1 }).limit(10).lean(),
      Alumni.find({ schoolId: schoolNumericId }).sort({ batchYear: -1, displayOrder: 1 }).limit(12).lean(),
      News.find({ schoolId: schoolNumericId, isPublished: true }).sort({ publishDate: -1 }).limit(8).lean(),
    ]);

    // ── Start PDF ──────────────────────────────────────────────────────────────
    const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: false });

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'brochures');
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

    const filename = `${schoolNumericId}-brochure-${Date.now()}.pdf`;
    const filePath = path.join(uploadDir, filename);
    const writeStream = createWriteStream(filePath);
    doc.pipe(writeStream);

    let pageNum = 0;

    // ════════════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER
    // ════════════════════════════════════════════════════════════════════════════
    doc.addPage();
    pageNum++;

    // Full-page navy gradient top half
    fillRect(doc, 0, 0, 595, 330, C.navyDark);
    // Diagonal decorative stripe
    fillRect(doc, 0, 280, 595, 10, C.gold);
    fillRect(doc, 0, 290, 595, 4, C.teal);

    // School initials badge (top-right)
    const initials = school.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
    roundedRect(doc, 460, 30, 100, 100, 12, C.teal);
    doc.fontSize(38).font('Helvetica-Bold').fillColor(C.white)
       .text(initials, 460, 55, { width: 100, align: 'center', lineBreak: false });

    // School name
    const nameSize = school.name.length > 40 ? 26 : school.name.length > 25 ? 30 : 36;
    doc.fontSize(nameSize).font('Helvetica-Bold').fillColor(C.white)
       .text(school.name, 30, 60, { width: 400, align: 'left' });

    // Tagline
    doc.fontSize(12).font('Helvetica').fillColor('#94a3b8')
       .text('Excellence in Education — Building Tomorrow\'s Leaders', 30, 130, { width: 400 });

    // Location & year row
    const locLine = [school.city, school.state].filter(Boolean).join(', ');
    // Location pin icon (drawn as small filled circle)
    roundedRect(doc, 30, 169, 10, 10, 5, C.gold);
    doc.fontSize(11).font('Helvetica').fillColor(C.gold)
       .text(`${locLine}${school.establishmentYear ? `   |   Est. ${school.establishmentYear}` : ''}`, 46, 165, { width: 380 });

    // Board & type chips
    let chipX = 30;
    const chipY = 195;
    for (const chip of [school.board, school.schoolType, school.k12Level].filter(Boolean)) {
      const chipW = doc.widthOfString(chip) + 20;
      roundedRect(doc, chipX, chipY, chipW, 22, 11, C.teal);
      doc.fontSize(9).font('Helvetica-Bold').fillColor(C.white)
         .text(chip, chipX + 10, chipY + 6, { lineBreak: false });
      chipX += chipW + 8;
    }

    // "SCHOOL BROCHURE" label
    fillRect(doc, 30, 235, 200, 30, C.gold);
    doc.fontSize(13).font('Helvetica-Bold').fillColor(C.white)
       .text('SCHOOL BROCHURE', 30, 242, { width: 200, align: 'center', lineBreak: false });

    // ── Stats row ──
    const statsY = 310;
    fillRect(doc, 0, statsY, 595, 100, C.slateLight);
    const stats = [
      { label: 'STUDENTS', value: school.totalStudents || '—' },
      { label: 'TEACHERS', value: school.totalTeachers ? String(school.totalTeachers) : '—' },
      { label: 'RATING', value: school.rating ? `${school.rating}/5` : '—' },
      { label: 'REVIEWS', value: school.reviewCount ? String(school.reviewCount) : '—' },
    ];
    stats.forEach((s, i) => {
      statBox(doc, 20 + i * 143, statsY + 20, 130, s.label, s.value, C.white);
    });

    // ── About block ──
    const aboutY = 430;
    doc.y = aboutY;
    roundedRect(doc, 20, aboutY, 555, 2, 0, C.grayLight);
    doc.moveDown(0.5);
    doc.fontSize(13).font('Helvetica-Bold').fillColor(C.navy).text('About Our School', 30, aboutY + 14);
    const aboutText = school.aboutSchool || school.description || 'A premier educational institution committed to academic excellence, character development, and holistic learning.';
    doc.fontSize(10).font('Helvetica').fillColor(C.slate)
       .text(aboutText.substring(0, 650), 30, aboutY + 34, { width: 535, align: 'justify' });

    // ── Key highlights ──
    const hlY = doc.y + 16;
    const highlights = [
      ['Classroom Type', school.classroomType || 'Smart Classrooms'],
      ['Medium', school.medium || school.languages || '—'],
      ['Gender Policy', school.gender || '—'],
      ['Classes Offered', school.classesOffered || school.k12Level || '—'],
    ];
    highlights.forEach(([label, value], i) => {
      const hx = 20 + (i % 2) * 285;
      const hy = hlY + Math.floor(i / 2) * 34;
      roundedRect(doc, hx, hy, 268, 28, 4, C.slateLight);
      doc.fontSize(8).font('Helvetica').fillColor(C.gray).text(label, hx + 10, hy + 5, { lineBreak: false });
      doc.fontSize(10).font('Helvetica-Bold').fillColor(C.navy).text(String(value), hx + 10, hy + 14, { lineBreak: false });
    });

    // Generated date
    doc.fontSize(8).font('Helvetica').fillColor(C.gray)
       .text(`Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 30, 785);
    pageFooter(doc, school.name, pageNum, school.website);

    // ════════════════════════════════════════════════════════════════════════════
    // PAGE 2 — CONTACT INFORMATION
    // ════════════════════════════════════════════════════════════════════════════
    doc.addPage();
    pageNum++;

    sectionHeader(doc, 'Contact Information', C.teal, '📞');

    const contactY = doc.y + 10;
    // Left column: address + contact
    const contacts = [
      { abbr: 'ADDR', label: 'Address', value: [school.address, school.city, school.state, school.pincode].filter(Boolean).join(', ') },
      { abbr: 'TEL', label: 'Phone', value: school.contactNumber || school.contactPhone || '—' },
      { abbr: 'WA', label: 'WhatsApp', value: school.whatsappNumber || '—' },
      { abbr: 'MAIL', label: 'Email', value: school.email || school.contactEmail || '—' },
      { abbr: 'WEB', label: 'Website', value: school.website || '—' },
      { abbr: 'PIN', label: 'Pincode', value: school.pincode || '—' },
    ];

    contacts.forEach((c, i) => {
      const cy = contactY + i * 70;
      roundedRect(doc, 20, cy, 555, 60, 6, i % 2 === 0 ? C.white : C.slateLight);
      // Colored icon badge (drawn, no emoji)
      roundedRect(doc, 28, cy + 12, 36, 36, 6, C.teal);
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor(C.white)
         .text(c.abbr, 28, cy + 24, { width: 36, align: 'center', lineBreak: false });
      doc.fontSize(9).font('Helvetica').fillColor(C.gray).text(c.label, 76, cy + 14, { lineBreak: false });
      doc.fontSize(11).font('Helvetica-Bold').fillColor(C.navy).text(c.value || '—', 76, cy + 28, { width: 460, lineBreak: false });
    });

    // Social media row
    const socY = contactY + contacts.length * 70 + 20;
    fillRect(doc, 20, socY, 555, 44, C.navyDark);
    roundedRect(doc, 20, socY, 555, 44, 6, C.navyDark);
    doc.fontSize(11).font('Helvetica-Bold').fillColor(C.gold).text('Social Media', 30, socY + 14, { lineBreak: false });
    const socials = [
      school.facebookUrl && 'Facebook',
      school.instagramUrl && 'Instagram',
      school.linkedinUrl && 'LinkedIn',
      school.youtubeUrl && 'YouTube',
    ].filter(Boolean);
    if (socials.length > 0) {
      doc.fontSize(9).font('Helvetica').fillColor(C.white)
         .text(socials.join('   ·   '), 150, socY + 16, { lineBreak: false });
    } else {
      doc.fontSize(9).font('Helvetica').fillColor('#94a3b8').text('—', 150, socY + 16, { lineBreak: false });
    }

    pageFooter(doc, school.name, pageNum, school.website);

    // ════════════════════════════════════════════════════════════════════════════
    // PAGE 3 — FACILITIES & INFRASTRUCTURE
    // ════════════════════════════════════════════════════════════════════════════
    doc.addPage();
    pageNum++;

    sectionHeader(doc, 'Facilities & Infrastructure', C.purple, '🏫');

    const facY = doc.y + 8;
    const facilityGroups = [
      {
        name: 'Academic Facilities', color: C.navy,
        items: [
          ['Library', school.hasLibrary],
          ['Computer Lab', school.hasComputerLab],
          ['Physics Lab', school.hasPhysicsLab],
          ['Chemistry Lab', school.hasChemistryLab],
          ['Biology Lab', school.hasBiologyLab],
          ['Maths Lab', school.hasMathsLab],
          ['Language Lab', school.hasLanguageLab],
          ['Robotics Lab', school.hasRoboticsLab],
          ['STEM Lab', school.hasStemLab],
          ['Auditorium', school.hasAuditorium],
        ]
      },
      {
        name: 'Technology & Digital', color: C.teal,
        items: [
          ['Smart Boards', school.hasSmartBoard],
          ['Wi-Fi Campus', school.hasWifi],
          ['CCTV Surveillance', school.hasCctv],
          ['E-Learning', school.hasElearning],
          ['AC Classrooms', school.hasAcClassrooms],
          ['AI Tools', school.hasAiTools],
        ]
      },
      {
        name: 'Sports & Fitness', color: C.green,
        items: [
          ['Playground', school.hasPlayground],
          ['Swimming Pool', school.hasSwimmingPool],
          ['Fitness Centre', school.hasFitnessCentre],
          ['Yoga', school.hasYoga],
          ['Martial Arts', school.hasMartialArts],
          ['Music & Dance', school.hasMusicDance],
          ['Horse Riding', school.hasHorseRiding],
        ]
      },
      {
        name: 'Transport', color: C.gold,
        items: [
          ['Transport Available', school.hasTransport],
          ['GPS-equipped Buses', school.hasGpsBuses],
          ['CCTV in Buses', school.hasCctvBuses],
          ['Bus Caretaker', school.hasBusCaretaker],
        ]
      },
      {
        name: 'Health & Safety', color: C.rose,
        items: [
          ['Medical Room', school.hasMedicalRoom],
          ['Doctor/Nurse', school.hasDoctorNurse],
          ['Fire Safety', school.hasFireSafety],
          ['Clean Water', school.hasCleanWater],
          ['Security Guards', school.hasSecurityGuards],
          ['Air Purifier', school.hasAirPurifier],
        ]
      },
      {
        name: 'Boarding & Dining', color: C.purple,
        items: [
          ['Hostel', school.hasHostel],
          ['Mess / Cafeteria', school.hasMess || school.hasCafeteria],
          ['Study Room in Hostel', school.hasHostelStudyRoom],
          ['AC Hostel', school.hasAcHostel],
        ]
      },
    ];

    let curY = facY;
    for (const group of facilityGroups) {
      if (curY > 720) { doc.addPage(); pageNum++; curY = 30; }
      categoryHeader(doc, 20, curY, group.name, group.color);
      curY += 28;
      let col = 0;
      for (const [label, val] of group.items) {
        const fx2 = [20, 200, 380][col];
        facilityCheck(doc, fx2, curY, String(label), Boolean(val));
        col++;
        if (col === 3) { col = 0; curY += 30; }
      }
      if (col > 0) curY += 30;
      curY += 10;
    }

    // Sports facilities text
    if (school.sportsFacilities) {
      if (curY > 740) { doc.addPage(); pageNum++; curY = 30; }
      roundedRect(doc, 20, curY, 555, 40, 6, C.goldLight);
      doc.fontSize(9).font('Helvetica-Bold').fillColor(C.gold).text('Additional Sports Facilities', 30, curY + 6, { lineBreak: false });
      doc.fontSize(9).font('Helvetica').fillColor(C.slate).text(school.sportsFacilities, 30, curY + 18, { width: 535, lineBreak: false });
      curY += 50;
    }

    pageFooter(doc, school.name, pageNum, school.website);

    // ════════════════════════════════════════════════════════════════════════════
    // PAGE 4 — ACADEMIC RESULTS
    // ════════════════════════════════════════════════════════════════════════════
    doc.addPage();
    pageNum++;

    sectionHeader(doc, 'Academic Results & Achievements', C.gold, '🏆');

    if (results.length === 0) {
      doc.fontSize(13).font('Helvetica').fillColor(C.gray).text('No results data available.', 30, doc.y + 20, { align: 'center' });
    } else {
      // Table header
      const tHeaders = ['Year', 'Exam', 'Class', 'Total Students', 'Pass %', 'Distinction', '1st Class'];
      const tWidths  = [50,    90,    50,    90,              60,      70,           70];
      const tX = [20, 70, 160, 210, 300, 360, 430];
      const thY = doc.y + 10;

      fillRect(doc, 20, thY, 555, 26, C.navy);
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(C.white);
      tHeaders.forEach((h, i) => {
        doc.text(h, tX[i] + 2, thY + 8, { width: tWidths[i], align: 'center', lineBreak: false });
      });

      let rowY = thY + 26;
      results.forEach((r: any, idx: number) => {
        const bg = idx % 2 === 0 ? C.white : C.slateLight;
        fillRect(doc, 20, rowY, 555, 26, bg);
        doc.fontSize(8.5).font('Helvetica').fillColor(C.slate);
        const cells = [
          String(r.year || '—'),
          String(r.examType || '—'),
          String(r.classLevel || '—'),
          String(r.totalStudents || '—'),
          r.passPercentage != null ? `${r.passPercentage}%` : '—',
          r.distinction != null ? String(r.distinction) : '—',
          r.firstClass != null ? String(r.firstClass) : '—',
        ];
        cells.forEach((cell, i) => {
          doc.text(cell, tX[i] + 2, rowY + 8, { width: tWidths[i], align: 'center', lineBreak: false });
        });

        // Toppers under this row
        if (r.toppers && r.toppers.length > 0) {
          rowY += 26;
          fillRect(doc, 20, rowY, 555, 20, C.goldLight);
          const topperText = r.toppers.map((t: any) => `${t.name || t.studentName || 'Topper'} (${t.marks || t.percentage || ''})`).join('  ·  ');
          doc.fontSize(7.5).font('Helvetica-Bold').fillColor(C.gold).text('Toppers: ', 26, rowY + 5, { lineBreak: false });
          doc.fontSize(7.5).font('Helvetica').fillColor(C.slate).text(topperText, 75, rowY + 5, { width: 490, lineBreak: false });
        }

        // Achievement note
        if (r.achievements) {
          rowY += 26;
          roundedRect(doc, 26, rowY, 543, 18, 3, C.purpleLight);
          doc.fontSize(7.5).font('Helvetica').fillColor(C.purple).text(`>>  ${r.achievements}`, 32, rowY + 4, { width: 535, lineBreak: false });
        }

        rowY += 28;
        if (rowY > 770) { doc.addPage(); pageNum++; rowY = 30; }
      });
    }

    pageFooter(doc, school.name, pageNum, school.website);

    // ════════════════════════════════════════════════════════════════════════════
    // PAGE 5 — NOTABLE ALUMNI
    // ════════════════════════════════════════════════════════════════════════════
    doc.addPage();
    pageNum++;

    sectionHeader(doc, 'Our Distinguished Alumni', C.navyDark, '🎓');

    if (alumni.length === 0) {
      doc.fontSize(13).font('Helvetica').fillColor(C.gray).text('No alumni data available.', 30, doc.y + 20, { align: 'center' });
    } else {
      let alY = doc.y + 12;
      alumni.forEach((a: any, idx: number) => {
        if (alY > 750) { doc.addPage(); pageNum++; alY = 30; }
        const cardBg = [C.slateLight, C.tealLight, C.goldLight, C.purpleLight][idx % 4];
        const accentColor = [C.navy, C.teal, C.gold, C.purple][idx % 4];
        roundedRect(doc, 20, alY, 555, 68, 8, cardBg);
        // Left color strip
        fillRect(doc, 20, alY, 5, 68, accentColor);

        // Initials avatar
        const alInitials = a.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
        roundedRect(doc, 34, alY + 14, 40, 40, 20, accentColor);
        doc.fontSize(14).font('Helvetica-Bold').fillColor(C.white)
           .text(alInitials, 34, alY + 24, { width: 40, align: 'center', lineBreak: false });

        // Name & batch
        doc.fontSize(13).font('Helvetica-Bold').fillColor(C.navy)
           .text(a.name, 88, alY + 8, { lineBreak: false });
        doc.fontSize(9).font('Helvetica').fillColor(C.gray)
           .text(`Batch of ${a.batchYear || '—'}${a.classLevel ? `  ·  ${a.classLevel}` : ''}`, 88, alY + 26, { lineBreak: false });

        // Position & company
        if (a.currentPosition || a.company) {
          const posText = [a.currentPosition, a.company].filter(Boolean).join(' @ ');
          doc.fontSize(10).font('Helvetica-Bold').fillColor(accentColor)
             .text(posText, 88, alY + 42, { lineBreak: false, width: 380 });
        }

        // Quote
        if (a.quote) {
          const qX = 480;
          doc.fontSize(7.5).font('Helvetica').fillColor(C.gray)
             .text(`"${a.quote.substring(0, 60)}${a.quote.length > 60 ? '...' : ''}"`, qX, alY + 18, { width: 88, lineBreak: true });
        }

        alY += 76;
      });
    }

    pageFooter(doc, school.name, pageNum, school.website);

    // ════════════════════════════════════════════════════════════════════════════
    // PAGE 6 — NEWS & UPDATES
    // ════════════════════════════════════════════════════════════════════════════
    doc.addPage();
    pageNum++;

    sectionHeader(doc, 'Latest News & Updates', C.rose, '📰');

    if (news.length === 0) {
      doc.fontSize(13).font('Helvetica').fillColor(C.gray).text('No news data available.', 30, doc.y + 20, { align: 'center' });
    } else {
      let nY = doc.y + 12;
      const categoryColors: Record<string, string> = {
        Event: C.teal, Achievement: C.gold, Announcement: C.navy,
        Activity: C.purple, Sports: C.green, Academic: C.rose,
      };

      news.forEach((n: any, idx: number) => {
        if (nY > 750) { doc.addPage(); pageNum++; nY = 30; }
        const catColor = categoryColors[n.category] || C.navy;
        roundedRect(doc, 20, nY, 555, 76, 6, idx % 2 === 0 ? C.white : C.slateLight);
        fillRect(doc, 20, nY, 4, 76, catColor);

        // Category pill
        const catW = doc.widthOfString(n.category || 'General') + 16;
        roundedRect(doc, 32, nY + 8, catW, 18, 9, catColor);
        doc.fontSize(8).font('Helvetica-Bold').fillColor(C.white)
           .text(n.category || 'General', 32 + 8, nY + 12, { lineBreak: false });

        // Date
        const dateStr = n.publishDate ? new Date(n.publishDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
        doc.fontSize(8).font('Helvetica').fillColor(C.gray)
           .text(dateStr, 500, nY + 12, { lineBreak: false });

        // Title
        doc.fontSize(11).font('Helvetica-Bold').fillColor(C.navy)
           .text(n.title || '', 32, nY + 32, { width: 520, lineBreak: false });

        // Content excerpt
        const excerpt = (n.content || '').replace(/<[^>]+>/g, '').substring(0, 120);
        doc.fontSize(9).font('Helvetica').fillColor(C.gray)
           .text(`${excerpt}${n.content && n.content.length > 120 ? '...' : ''}`, 32, nY + 49, { width: 520, lineBreak: false });

        nY += 84;
      });
    }

    pageFooter(doc, school.name, pageNum, school.website);

    // ════════════════════════════════════════════════════════════════════════════
    // BACK COVER
    // ════════════════════════════════════════════════════════════════════════════
    doc.addPage();
    pageNum++;
    fillRect(doc, 0, 0, 595, 842, C.navyDark);
    fillRect(doc, 0, 200, 595, 6, C.gold);
    fillRect(doc, 0, 206, 595, 3, C.teal);

    // Large school initials
    doc.fontSize(90).font('Helvetica-Bold').fillColor('#ffffff1a')
       .text(initials, 0, 100, { width: 595, align: 'center', lineBreak: false });

    doc.fontSize(28).font('Helvetica-Bold').fillColor(C.white)
       .text(school.name, 30, 240, { width: 535, align: 'center' });
    doc.fontSize(12).font('Helvetica').fillColor(C.gold)
       .text('Excellence · Integrity · Innovation', 30, 290, { width: 535, align: 'center' });

    // Contact quick-ref box
    roundedRect(doc, 80, 340, 435, 120, 10, '#ffffff15');
    doc.fontSize(10).font('Helvetica-Bold').fillColor(C.gold).text('Get In Touch', 80, 356, { width: 435, align: 'center', lineBreak: false });
    const bcContacts = [
      school.contactNumber || school.contactPhone,
      school.email || school.contactEmail,
      school.website,
      [school.city, school.state].filter(Boolean).join(', '),
    ].filter(Boolean);
    bcContacts.forEach((line, i) => {
      doc.fontSize(10).font('Helvetica').fillColor(C.white)
         .text(String(line), 80, 376 + i * 18, { width: 435, align: 'center', lineBreak: false });
    });

    doc.fontSize(9).font('Helvetica').fillColor('#475569')
       .text(`This brochure was generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 30, 790, { width: 535, align: 'center' });

    // Finalize
    doc.end();

    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    const publicUrl = `/uploads/brochures/${filename}`;

    // Save brochureUrl back to school record
    await School.findByIdAndUpdate(userRecord.schoolId, { brochureUrl: publicUrl });

    return NextResponse.json({ success: true, url: publicUrl, pages: pageNum });

  } catch (error: any) {
    console.error('Brochure generation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate brochure' }, { status: 500 });
  }
}
