import ConvertedLead from '../models/ConvertedLead.js';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';

// Delete a converted lead by ID (hard delete)
export const deleteConvertedLead = async (req, res) => {
  try {
    const lead = await ConvertedLead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Helper to handle file fields
function extractFilesFromReq(req) {
  const files = {};
  if (req.files) {
    Object.keys(req.files).forEach(field => {
      if (Array.isArray(req.files[field])) {
        files[field] = req.files[field].map(f => f.filename);
      } else {
        files[field] = req.files[field].filename;
      }
    });
  }
  return files;
}

export const createConvertedLead = async (req, res) => {
  try {
    console.log('FILES:', req.files);
    console.log('BODY:', req.body);

    const { name, cnic, phone, email, assigned, service, status, ...rest } = req.body;
    const fields = { ...rest };

    // Check multer structure — log req.files and format if needed
    const files = {};
    if (req.files) {
      req.files.forEach(file => {
        if (!files[file.fieldname]) files[file.fieldname] = [];
        files[file.fieldname].push(file.filename);
      });
    }

    const lead = new ConvertedLead({
      name,
      cnic,
      phone,
      email,
      assigned,
      service,
      status,
      fields,
      files,
    });

    await lead.save();
    res.status(201).json({ success: true, lead });
  } catch (err) {
    console.error('❌ CREATE ERROR:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};


export const getAllConvertedLeads = async (req, res) => {
  try {
    const leads = await ConvertedLead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getConvertedLead = async (req, res) => {
  try {
    const lead = await ConvertedLead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send invoice (PDF only, links for files)
export const sendInvoice = async (req, res) => {
  try {
    const lead = await ConvertedLead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    // Use email from request body if provided, else from lead
    const recipientEmail = req.body.email || lead.email;
    if (!recipientEmail) {
      return res.status(400).json({ success: false, message: 'No recipient email found for this lead.' });
    }
    // Generate PDF invoice in memory
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfData = Buffer.concat(buffers);
      // Prepare download links for files
      let fileLinks = [];
      if (lead.files) {
        const base = `${req.protocol}://${req.get('host')}/uploads/`;
        Object.values(lead.files).forEach(f => {
          if (Array.isArray(f)) {
            f.forEach(file => fileLinks.push(base + encodeURIComponent(file)));
          } else if (typeof f === 'string') {
            fileLinks.push(base + encodeURIComponent(f));
          }
        });
      }
      // Send email
      const transporter = nodemailer.createTransport({
        // Configure as per your SMTP
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: `Your Invoice for ${lead.service || 'Service'}`,
        text: `Dear ${lead.name || 'User'},\n\nPlease find attached your invoice.\n\nDownload your files here:\n${fileLinks.join('\n')}`,
        attachments: [{ filename: 'invoice.pdf', content: pdfData }],
      });
      res.json({ success: true, message: 'Invoice sent' });
    });
    // Compose PDF content
    doc.fontSize(18).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Name: ${lead.name || ''}`);
    doc.text(`CNIC: ${lead.cnic || ''}`);
    doc.text(`Phone: ${lead.phone || ''}`);
    doc.text(`Email: ${lead.email || ''}`);
    doc.text(`Service: ${lead.service || ''}`);
    doc.text(`Status: ${lead.status || ''}`);
    doc.moveDown();
    doc.text('Thank you for using our service.');
    doc.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Upload certificate for a converted lead
export const uploadCertificate = async (req, res) => {
  try {
    const lead = await ConvertedLead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    lead.certificate = req.file.filename;
    await lead.save();
    res.json({ success: true, message: 'Certificate uploaded', certificate: req.file.filename });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update assigned field for a converted lead
export const updateAssigned = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned } = req.body;
    const lead = await ConvertedLead.findByIdAndUpdate(id, { assigned }, { new: true });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update status field for a converted lead
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const lead = await ConvertedLead.findByIdAndUpdate(id, { status }, { new: true });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// General update endpoint for a converted lead (PATCH for partial update)
export const updateConvertedLead = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const lead = await ConvertedLead.findByIdAndUpdate(id, update, { new: true });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};