// Purpose: Agent routes — master chat endpoint and document upload (stubs wired to real agents)
'use strict';

const express  = require('express');
const multer   = require('multer');
const { z }    = require('zod');

const authMiddleware         = require('../middleware/auth.middleware');
const internalAuthMiddleware = require('../middleware/internalAuth.middleware');
const { loanApiLimiter }     = require('../middleware/rateLimiter');
const { validate }           = require('../middleware/validate.middleware');

const router = express.Router();

/* ── Multer: memory storage, 5MB limit, allow only pdf/jpeg/png ─────────── */
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF, JPEG, and PNG files are allowed'));
  },
});

/* ── Zod Schemas ─────────────────────────────────────────────────────────── */
const masterSchema = z.object({
  message:   z.string().min(1).max(2000),
  sessionId: z.string().uuid('sessionId must be a valid UUID'),
});

/* ── POST /api/v1/agent/master ───────────────────────────────────────────── */
// Lazy-require MasterAgent to avoid circular deps at startup
router.post('/master', authMiddleware, loanApiLimiter, validate(masterSchema), async (req, res, next) => {
  try {
    const MasterAgent = require('../agents/MasterAgent');
    const result = await MasterAgent.execute({
      message:   req.body.message,
      sessionId: req.body.sessionId,
      userId:    req.user.id,
    });
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/* ── POST /api/v1/agent/document-upload ─────────────────────────────────── */
router.post('/document-upload', authMiddleware, loanApiLimiter, upload.single('document'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'NO_FILE', message: 'No file uploaded' });
    }

    const DocumentVerificationAgent = require('../agents/workers/DocumentVerificationAgent');
    const result = await DocumentVerificationAgent.execute({
      file:          req.file,
      docType:       req.body.docType || 'UNKNOWN',
      applicationId: req.body.applicationId,
    });
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/* ── Worker Routes (internal only — protected by internalAuth) ───────────── */
router.post('/workers/underwriting', internalAuthMiddleware, async (req, res, next) => {
  try {
    const UnderwritingAgent = require('../agents/workers/UnderwritingAgent');
    const result = await UnderwritingAgent.execute(req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.post('/workers/credit-bureau', internalAuthMiddleware, async (req, res, next) => {
  try {
    const CreditBureauAgent = require('../agents/workers/CreditBureauAgent');
    const result = await CreditBureauAgent.execute(req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.post('/workers/compliance', internalAuthMiddleware, async (req, res, next) => {
  try {
    const ComplianceAgent = require('../agents/workers/ComplianceAgent');
    const result = await ComplianceAgent.execute(req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
