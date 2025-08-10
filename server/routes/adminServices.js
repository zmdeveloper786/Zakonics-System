import express from 'express';
import { verifyJWT } from '../middleware/authMiddleware.js';
import Service from '../models/Service.js';
import multer from 'multer';
import path from 'path';
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');// Make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Upload certificate (pending logic)
router.post('/services/:id/certificate', upload.single('certificate'), async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    if (req.query.pending === 'true') {
      service.certificatePending = req.file.filename;
    } else {
      service.certificate = req.file.filename;
    }
    await service.save();

    res.json({ message: 'Certificate uploaded', file: req.file.filename });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send invoice and all files to user, and make certificate visible
import nodemailer from 'nodemailer';
import fs from 'fs';
import PDFDocument from 'pdfkit';
router.post('/services/:id/send-invoice', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('personalId');
    if (!service) return res.status(404).json({ error: 'Service not found' });

    // Move pending certificate to main field
    if (service.certificatePending) {
      service.certificate = service.certificatePending;
      service.certificatePending = undefined;
      await service.save();
    }


    // Collect files: certificate, images, documents
    const files = [];
    // Add uploaded certificate
    if (service.certificate) files.push({ path: `uploads/${service.certificate}`, name: service.certificate });

    // Collect images/documents from formFields
    if (service.formFields) {
      const collectFiles = (val) => {
        if (typeof val === 'string' && val.match(/\.(jpg|jpeg|png|pdf|docx?|xlsx?|xls|pptx?|ppt)$/i)) {
          files.push({ path: `uploads/${val.replace(/.*uploads[\\/]/, '')}`, name: val.replace(/.*uploads[\\/]/, '') });
        } else if (Array.isArray(val)) {
          val.forEach(collectFiles);
        } else if (typeof val === 'object' && val !== null) {
          Object.values(val).forEach(collectFiles);
        }
      };
      Object.values(service.formFields).forEach(collectFiles);
    }

    // Generate invoice PDF and add to files
    const invoiceFileName = `invoice-${service._id}.pdf`;
    const invoiceFilePath = `uploads/${invoiceFileName}`;
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(invoiceFilePath);
    doc.pipe(writeStream);
    doc.fontSize(20).text('Zumar Law Firm Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Service: ${service.serviceTitle || ''}`);
    doc.text(`Name: ${service.personalId?.name || ''}`);
    doc.text(`Email: ${service.personalId?.email || ''}`);
    doc.text(`Phone: ${service.personalId?.phone || ''}`);
    doc.text(`CNIC: ${service.personalId?.cnic || ''}`);
    doc.text(`Status: ${service.status || ''}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    doc.text('Thank you for choosing Zumar Law Firm.');
    doc.end();
    await new Promise((resolve) => writeStream.on('finish', resolve));
    files.push({ path: invoiceFilePath, name: invoiceFileName });

    // Prepare attachments for email
    const attachments = files.map(f => ({
      filename: f.name,
      path: f.path
    }));


    // Send email to user (credentials from env)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: service.personalId.email,
      subject: 'Your Service Invoice and Documents',
      text: 'Please find attached your invoice, certificate, and related documents.',
      attachments
    });

    res.json({ message: 'Invoice, certificate, and documents sent to user and made visible on dashboard.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all services (with filter options)
router.get('/admin/services', verifyJWT, async (req, res) => {
  try {
    const { isManualSubmission } = req.query;

    // Build query based on parameters
    const query = {};
    if (isManualSubmission !== undefined) {
      query.isManualSubmission = isManualSubmission === 'true';
    }

    const services = await Service.find(query)
      .populate('personalId')
      .sort({ createdAt: -1 });

    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});
router.patch('/services/:id/assign', async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      { assignedTo },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Service not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.patch('/services/:id/payment-status', async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
