// Purpose: Document verification security tests — magic bytes, MIME, size, filename sanitization
'use strict';

const { verifyDocument, _sanitizeFilename } = require('../src/services/documentVerify.service');

/* ── Mock file factory ───────────────────────────────────────── */
function makeMockFile(firstBytes, mimetype, size, filename) {
  const extra  = Math.max(0, size - firstBytes.length);
  const buffer = Buffer.concat([Buffer.from(firstBytes), Buffer.alloc(extra, 0)]);
  return { buffer, mimetype, size, originalname: filename };
}

const PDF_MAGIC  = [0x25, 0x50, 0x44, 0x46]; // %PDF
const JPEG_MAGIC = [0xFF, 0xD8, 0xFF];
const PNG_MAGIC  = [0x89, 0x50, 0x4E, 0x47];
const EXE_MAGIC  = [0x4D, 0x5A];              // MZ header (Windows executable)

describe('DocumentVerify Service — Security Tests', () => {

  /* ── File Size ──────────────────────────────────────────────── */
  describe('File Size (E001)', () => {
    const pdfWithText = [...PDF_MAGIC, ...Buffer.from('BT test content')];

    it('exactly 5MB → VALID', () => {
      const f = makeMockFile([...PDF_MAGIC, ...Buffer.from('BT')], 'application/pdf', 5 * 1024 * 1024, 'test.pdf');
      expect(verifyDocument(f, 'SALARY_SLIP').status).toBe('VALID');
    });
    it('1 byte over 5MB → INVALID E001', () => {
      const f = makeMockFile(pdfWithText, 'application/pdf', 5 * 1024 * 1024 + 1, 'large.pdf');
      const r = verifyDocument(f, 'SALARY_SLIP');
      expect(r.status).toBe('INVALID');
      expect(r.errorCode).toBe('E001');
    });
    it('10MB → INVALID E001', () => {
      const f = makeMockFile(pdfWithText, 'application/pdf', 10 * 1024 * 1024, 'huge.pdf');
      expect(verifyDocument(f, 'SALARY_SLIP').errorCode).toBe('E001');
    });
    it('0 bytes (empty file) → INVALID E001', () => {
      const f = makeMockFile([], 'application/pdf', 0, 'empty.pdf');
      expect(verifyDocument(f, 'SALARY_SLIP').status).toBe('INVALID');
    });
  });

  /* ── MIME Type (E002) ───────────────────────────────────────── */
  describe('MIME Type (E002)', () => {
    it('application/pdf, .pdf → passes E002', () => {
      const f = makeMockFile([...PDF_MAGIC, ...Buffer.from('BT')], 'application/pdf', 100, 'doc.pdf');
      expect(verifyDocument(f, 'PAN').status).toBe('VALID');
    });
    it('image/jpeg, .jpg → passes E002', () => {
      const f = makeMockFile(JPEG_MAGIC, 'image/jpeg', 100, 'id.jpg');
      expect(verifyDocument(f, 'AADHAAR').status).toBe('VALID');
    });
    it('application/javascript → INVALID E002', () => {
      const f = makeMockFile([0x3C, 0x73], 'application/javascript', 100, 'evil.js');
      expect(verifyDocument(f, 'SALARY_SLIP').errorCode).toBe('E002');
    });
    it('application/pdf with .exe extension → still checks magic (E003 catches it)', () => {
      // MIME: application/pdf (passes E002) but bytes are EXE (fails E003)
      const f = makeMockFile(EXE_MAGIC, 'application/pdf', 100, 'trojan.exe');
      expect(verifyDocument(f, 'SALARY_SLIP').errorCode).toBe('E003');
    });
  });

  /* ── Magic Bytes (E003) ─────────────────────────────────────── */
  describe('Magic Byte Sniffing — Security Audit (E003)', () => {
    it('real PDF bytes → passes E003', () => {
      const f = makeMockFile([...PDF_MAGIC, ...Buffer.from('BT text')], 'application/pdf', 200, 'salary.pdf');
      expect(verifyDocument(f, 'SALARY_SLIP').status).toBe('VALID');
    });
    it('EXE disguised as PDF → INVALID E003', () => {
      const f = makeMockFile(EXE_MAGIC, 'application/pdf', 200, 'disguised.pdf');
      expect(verifyDocument(f, 'SALARY_SLIP').errorCode).toBe('E003');
    });
    it('JPEG buffer with .pdf extension → INVALID E003', () => {
      const f = makeMockFile(JPEG_MAGIC, 'application/pdf', 200, 'photo_as_pdf.pdf');
      expect(verifyDocument(f, 'SALARY_SLIP').errorCode).toBe('E003');
    });
    it('PHP file with .jpg extension → INVALID E003', () => {
      const f = makeMockFile([0x3C, 0x3F, 0x70, 0x68], 'image/jpeg', 200, 'backdoor.php.jpg');
      expect(verifyDocument(f, 'AADHAAR').errorCode).toBe('E003');
    });
    it('empty buffer → INVALID E003', () => {
      const f = { buffer: Buffer.alloc(0), mimetype: 'application/pdf', size: 10, originalname: 'empty.pdf' };
      expect(verifyDocument(f, 'SALARY_SLIP').errorCode).toBe('E003');
    });
    it('JPEG magic bytes, image/jpeg MIME → VALID', () => {
      const f = makeMockFile(JPEG_MAGIC, 'image/jpeg', 500, 'aadhaar.jpg');
      expect(verifyDocument(f, 'AADHAAR').status).toBe('VALID');
    });
  });

  /* ── PDF Text Layer (E005) ──────────────────────────────────── */
  describe('PDF Text Layer (E005)', () => {
    it('PDF with "BT" marker → VALID', () => {
      const content = Buffer.from('%PDF-1.4 BT some text ET');
      const f = { buffer: content, mimetype: 'application/pdf', size: content.length, originalname: 'text.pdf' };
      expect(verifyDocument(f, 'SALARY_SLIP').status).toBe('VALID');
    });
    it('PDF with only image data (no BT or /Text) → REQUIRES_REUPLOAD E005', () => {
      const content = Buffer.concat([Buffer.from(PDF_MAGIC), Buffer.alloc(100, 0x00)]);
      const f = { buffer: content, mimetype: 'application/pdf', size: content.length, originalname: 'scanned.pdf' };
      const r = verifyDocument(f, 'SALARY_SLIP');
      expect(r.status).toBe('REQUIRES_REUPLOAD');
      expect(r.errorCode).toBe('E005');
    });
  });

  /* ── Filename Sanitization ──────────────────────────────────── */
  describe('Filename Sanitization (E004)', () => {
    it('../../../etc/passwd.pdf → sanitized, not rejected', () => {
      const cleaned = _sanitizeFilename('../../../etc/passwd.pdf');
      expect(cleaned).not.toContain('..');
      expect(cleaned).not.toContain('/');
    });
    it('<script>alert(1)</script>.pdf → tags stripped', () => {
      const cleaned = _sanitizeFilename('<script>alert(1)</script>.pdf');
      expect(cleaned).not.toContain('<');
    });
    it('spaces → underscores', () => {
      const cleaned = _sanitizeFilename('salary slip march 2024.pdf');
      expect(cleaned).toBe('salary_slip_march_2024.pdf');
    });
    it('valid filename unchanged', () => {
      const cleaned = _sanitizeFilename('my_salary_slip.pdf');
      expect(cleaned).toBe('my_salary_slip.pdf');
    });
  });

});
