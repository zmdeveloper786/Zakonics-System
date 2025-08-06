import express from 'express';
import multer from 'multer';
import path from 'path';
import * as convertedLeadController from '../controllers/convertedLeadController.js';
const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

// Accept any file fields (dynamic)
const anyFiles = upload.any();

// POST /convertedService - create converted lead
router.post('/', anyFiles, convertedLeadController.createConvertedLead);
// GET /convertedService - get all converted leads
router.get('/', convertedLeadController.getAllConvertedLeads);

router.post('/:id/send-invoice', convertedLeadController.sendInvoice);


const singleCert = upload.single('certificate');
router.post('/:id/certificate', singleCert, convertedLeadController.uploadCertificate);

router.delete('/:id', convertedLeadController.deleteConvertedLead);
router.get('/:id', convertedLeadController.getConvertedLead);
router.put('/:id/assign', async (req, res) => {
  try {
    const lead = await convertedLeadController.updateAssigned(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const lead = await convertedLeadController.updateStatus(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const lead = await convertedLeadController.updateConvertedLead(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
