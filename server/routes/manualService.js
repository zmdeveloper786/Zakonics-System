import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

import express from 'express';
import multer from 'multer';
import ManualServiceSubmission from '../models/ManualServiceSubmission.js';
import { deleteManyManualServices } from '../controllers/manualServiceController.js';

// Multer config for file uploads (store in /uploads)
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

const router = express.Router();
router.post('/:id/send-invoice', async (req, res) => {
  try {
    const submission = await ManualServiceSubmission.findById(req.params.id);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    if (!submission.email) return res.status(400).json({ error: 'No email found for this submission' });

    // Collect files: certificate, images, documents
    const files = [];
    // Add uploaded certificate if present
    if (submission.certificate) files.push({ path: path.join('uploads', submission.certificate), name: submission.certificate });

    // Collect images/documents from fields
    const fileExt = /\.(jpg|jpeg|png|pdf|docx?|xlsx?|xls|pptx?|ppt)$/i;
    const collectFiles = (val) => {
      if (typeof val === 'string' && fileExt.test(val)) {
        const cleanName = val.replace(/.*uploads[\\/]/, '');
        files.push({ path: path.join('uploads', cleanName), name: cleanName });
      } else if (Array.isArray(val)) {
        val.forEach(collectFiles);
      } else if (typeof val === 'object' && val !== null) {
        Object.values(val).forEach(collectFiles);
      }
    };
    if (submission.fields) {
      Object.values(submission.fields).forEach(collectFiles);
    }
    if (Array.isArray(submission.cnicGroups)) {
      submission.cnicGroups.forEach(group => {
        if (group.front) collectFiles(group.front);
        if (group.back) collectFiles(group.back);
      });
    }

    // Generate invoice PDF and add to files
    const invoiceFileName = `invoice-${submission._id}.pdf`;
    const invoiceFilePath = path.join('uploads', invoiceFileName);
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(invoiceFilePath);
    doc.pipe(writeStream);
    doc.fontSize(20).text('Zumar Law Firm Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Service: ${submission.serviceType || submission.service || ''}`);
    doc.text(`Name: ${submission.name || ''}`);
    doc.text(`Email: ${submission.email || ''}`);
    doc.text(`Phone: ${submission.phone || ''}`);
    doc.text(`CNIC: ${submission.cnic || ''}`);
    doc.text(`Status: ${submission.status || ''}`);
    doc.text(`Date: ${submission.createdAt ? new Date(submission.createdAt).toLocaleDateString() : ''}`);
    doc.moveDown();
    doc.text('Thank you for choosing Zumar Law Firm.');
    doc.end();
    await new Promise((resolve) => writeStream.on('finish', resolve));
    files.push({ path: invoiceFilePath, name: invoiceFileName });

    // Prepare attachments for email
    const attachments = files.map(f => ({ filename: f.name, path: f.path }));

    // Send email to user (Gmail, not SMTP)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: submission.email,
      subject: 'Your Service Invoice and Documents',
      text: 'Please find attached your invoice and related documents.',
      attachments
    });

    res.json({ message: 'Invoice and documents sent to user.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
// Assign employee to manual service submission
router.patch('/:id/assign', async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const updated = await ManualServiceSubmission.findByIdAndUpdate(
      req.params.id,
      { assignedTo },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Submission not found' });
    res.json({ message: 'Assigned employee updated', assignedTo });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign employee' });
  }
});

// Update status of manual service submission
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await ManualServiceSubmission.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Submission not found' });
    res.json({ message: 'Status updated', status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});
// Upload certificate for a single manual service submission
router.post('/:id/certificate', upload.single('certificate'), async (req, res) => {
  try {
    const submission = await ManualServiceSubmission.findById(req.params.id);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    if (!req.file) return res.status(400).json({ error: 'No certificate file uploaded' });
    // For future extensibility: support ?pending=true
    if (req.query.pending === 'true') {
      submission.certificatePending = req.file.filename;
    } else {
      submission.certificate = req.file.filename;
    }
    await submission.save();
    res.json({ message: 'Certificate uploaded', file: req.file.filename });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete many manual service submissions
router.post('/deleteMany', deleteManyManualServices);

// ...existing code...

// Accept manual service submission (DirectService.jsx)
router.post('/', upload.any(), async (req, res) => {
  try {
    const { serviceType, name, email, cnic, phone } = req.body;
    // Parse dynamic fields
    const fields = { ...req.body };
    delete fields.serviceType;
    delete fields.name;
    delete fields.email;
    delete fields.cnic;
    delete fields.phone;

    // Attach file paths to fields
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        // For CNIC groups
        if (file.fieldname.startsWith('cnic_group_')) {
          // handled below
        } else {
          fields[file.fieldname] = file.path;
        }
      });
    }

    // Handle CNIC groups
    let cnicGroups = [];
    if (req.files && req.files.length > 0) {
      const groupMap = {};
      req.files.forEach(file => {
        if (file.fieldname.startsWith('cnic_group_')) {
          // e.g. cnic_group_0_front
          const match = file.fieldname.match(/cnic_group_(\d+)_(front|back)/);
          if (match) {
            const idx = match[1];
            const side = match[2];
            if (!groupMap[idx]) groupMap[idx] = {};
            groupMap[idx][side] = file.path;
          }
        }
      });
      cnicGroups = Object.values(groupMap);
    }

    const submission = new ManualServiceSubmission({
      serviceType,
      name,
      email,
      cnic,
      phone,
      fields,
      cnicGroups
    });
    await submission.save();
    res.status(201).json({ message: 'Submission saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save submission' });
  }
});

// Get all manual service submissions (DirectService.jsx)
router.get('/', async (req, res) => {
  try {
    const submissions = await ManualServiceSubmission.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

export default router;