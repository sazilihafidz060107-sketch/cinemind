import { jsPDF } from 'jspdf';
import { Letter } from '../types';

export function generateOfficialLetterPDF(letter: Letter): jsPDF {
  // A4 dimensions: 210mm x 297mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const margin = 25; // 25mm left & right margins as per standard administrative guidelines
  const contentWidth = pageWidth - margin * 2;
  let currentY = 22;

  // 1. KOP SURAT
  if (letter.hasKop) {
    // Cinematic camera / film icon placeholder or decorative crest
    doc.setDrawColor(229, 9, 20); // #E50914 (Director's Red)
    doc.setFillColor(229, 9, 20);
    doc.rect(margin, currentY, 5, 20, 'F');

    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text('HIMPUNAN MAHASISWA FILM & SINEMATOGRAFI', margin + 9, currentY + 4);

    doc.setFontSize(16);
    doc.setTextColor(229, 9, 20);
    doc.text('CINEMIND', margin + 9, currentY + 11);

    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text('INSTITUT TEKNOLOGI & BISNIS BINA SARANA GLOBAL', margin + 9, currentY + 16);
    doc.setFontSize(8);
    doc.text('Sekretariat: Gedung Creative Hub Lt. 3 | Surel: sekretariat.cinemind@gmail.com', margin + 9, currentY + 20);

    currentY += 25;

    // Double rule lines
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(0.8);
    doc.line(margin, currentY, margin + contentWidth, currentY);
    doc.setLineWidth(0.2);
    doc.line(margin, currentY + 1.2, margin + contentWidth, currentY + 1.2);

    currentY += 8;
  }

  // 2. TANGGAL SURAT (Right aligned)
  const formattedDate = formatDateIndonesian(letter.letterDate);
  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(20, 20, 20);
  const cityDate = `Tangerang, ${formattedDate}`;
  const dateWidth = doc.getTextWidth(cityDate);
  doc.text(cityDate, margin + contentWidth - dateWidth, currentY);

  currentY += 7;

  // 3. HEADER SURAT (Nomor, Lampiran, Perihal)
  doc.text(`Nomor     : ${letter.letterNumber}`, margin, currentY);
  currentY += 5.5;
  doc.text(`Lampiran : -`, margin, currentY);
  currentY += 5.5;
  doc.setFont('times', 'bold');
  doc.text(`Perihal    : ${letter.subject}`, margin, currentY);
  doc.setFont('times', 'normal');

  currentY += 9;

  // 4. TUJUAN SURAT
  doc.text('Kepada Yth.', margin, currentY);
  currentY += 5;
  doc.setFont('times', 'bold');
  doc.text(letter.recipient, margin, currentY);
  doc.setFont('times', 'normal');
  currentY += 5;
  if (letter.recipientAddress) {
    doc.text(letter.recipientAddress, margin, currentY);
    currentY += 5;
  }
  doc.text('Di tempat', margin, currentY);

  currentY += 9;

  // 5. SALAM PEMBUKA
  doc.text('Dengan hormat,', margin, currentY);
  currentY += 6;

  // 6. ISI SURAT (Split into paragraphs with standard indentation and line height)
  const paragraphs = letter.content.split('\n').filter(p => p.trim() !== '');

  for (const para of paragraphs) {
    // Standard 12mm first-line indent
    const lines = doc.splitTextToSize(para.trim(), contentWidth);
    
    // Check page overflow
    if (currentY + lines.length * 5 > 250) {
      doc.addPage();
      currentY = 25;
    }

    doc.text(lines, margin, currentY);
    currentY += lines.length * 5 + 4;
  }

  // 7. SALAM PENUTUP
  if (currentY + 50 > 270) {
    doc.addPage();
    currentY = 25;
  }

  currentY += 2;
  const closingText = letter.closing || 'Demikian surat permohonan ini kami sampaikan. Atas perhatian, dukungan, dan kerja sama yang diberikan, kami ucapkan terima kasih.';
  const closingLines = doc.splitTextToSize(closingText, contentWidth);
  doc.text(closingLines, margin, currentY);
  currentY += closingLines.length * 5 + 8;

  // 8. TANDA TANGAN (BPH & SEKRETARIS / PENGURUS)
  if (currentY + 45 > 270) {
    doc.addPage();
    currentY = 25;
  }

  const signColWidth = contentWidth / 2;

  // If two signers (e.g., Ketua & Sekretaris)
  if (letter.secondarySignerName) {
    const leftX = margin;
    const rightX = margin + signColWidth;

    // Left signer (Sekretaris / Pengusul)
    doc.text(letter.signerRole || 'Sekretaris Umum,', leftX, currentY);
    // Right signer (Ketua / Mengetahui)
    doc.text(letter.secondarySignerRole || 'Mengetahui,\nKetua Umum Cinemind,', rightX, currentY);

    // Primary Signature image
    if (letter.signatureImageUrl && letter.signatureImageUrl.startsWith('data:image')) {
      try {
        doc.addImage(letter.signatureImageUrl, 'PNG', leftX, currentY + 3, 35, 18);
      } catch (e) {
        console.warn('Failed to embed primary signature image into PDF', e);
      }
    }

    // Secondary Signature image
    if (letter.secondarySignatureImageUrl && letter.secondarySignatureImageUrl.startsWith('data:image')) {
      try {
        doc.addImage(letter.secondarySignatureImageUrl, 'PNG', rightX, currentY + 3, 35, 18);
      } catch (e) {
        console.warn('Failed to embed secondary signature image into PDF', e);
      }
    }

    const nameY = currentY + 25;
    doc.setFont('times', 'bold');
    doc.text(letter.signerName, leftX, nameY);
    doc.text(letter.secondarySignerName, rightX, nameY);
    
    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    doc.text(`NIM. ${letter.signerNim}`, leftX, nameY + 4.5);
    doc.text(`NIM. ${letter.secondarySignerNim || '-'}`, rightX, nameY + 4.5);

  } else {
    // Single signer (Aligned right)
    const signX = margin + contentWidth - 65;
    doc.text(letter.signerRole || 'Hormat kami,\nSekretaris Umum,', signX, currentY);

    if (letter.signatureImageUrl && letter.signatureImageUrl.startsWith('data:image')) {
      try {
        doc.addImage(letter.signatureImageUrl, 'PNG', signX, currentY + 4, 38, 20);
      } catch (e) {
        console.warn('Failed to embed signature into PDF', e);
      }
    }

    const nameY = currentY + 26;
    doc.setFont('times', 'bold');
    doc.text(letter.signerName, signX, nameY);
    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    doc.text(`NIM. ${letter.signerNim}`, signX, nameY + 4.5);
  }

  // Administrative verification stamp badge footer
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(140, 140, 140);
  const verifyText = `[SIM CINEMIND OFFICIAL DOCS - ID: ${letter.id.slice(0, 8).toUpperCase()} - VERIFIED]`;
  doc.text(verifyText, margin, 287);

  return doc;
}

export function formatDateIndonesian(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}
