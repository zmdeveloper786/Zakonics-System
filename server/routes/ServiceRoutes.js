import express from 'express';
import multer from 'multer';
import path from 'path';
import PersonalDetail from '../models/PersonalDetail.js';
import Service from '../models/Service.js';
import { verifyJWT } from '../middleware/authMiddleware.js';
import { sendInvoiceAndCertificate } from '../controllers/serviceController.js';

const router = express.Router();

// Multer Storage Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });


// 🟢 POST: Save Invoice Details + Files
router.post('/invoices', verifyJWT, upload.any(), async (req, res) => {
  try {
    const userId = req.user.id; // ✅ Set in verifyJWT middleware

    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in token' });
    }

    const rawFields = {};
    const files = {};

    // 🔽 Handle uploaded files
    req.files.forEach((file) => {
      if (!files[file.fieldname]) files[file.fieldname] = [];
      files[file.fieldname].push(file.filename);
    });

    // 🔽 Parse form fields
    for (const key in req.body) {
      try {
        rawFields[key] = JSON.parse(req.body[key]);
      } catch {
        rawFields[key] = req.body[key];
      }
    }

    // 🔽 Extract personal + service info
    const {
      personal_name,
      personal_email,
      personal_phone,
      personal_cnic,
      serviceTitle,
      ...dynamicFields
    } = rawFields;

    // 🔽 Save personal details
    const personal = new PersonalDetail({
      name: personal_name,
      email: personal_email,
      phone: personal_phone,
      cnic: personal_cnic,
    });
    await personal.save();

    // 🔽 Merge uploaded files into dynamicFields
    for (const key in files) {
      dynamicFields[key] = files[key].length === 1 ? files[key][0] : files[key];
    }

    // 🔽 Save main service entry

    // For direct service (AddServiceDetails.jsx), set isManualSubmission: false
    const service = new ServiceDetail({
      serviceTitle,
      formFields: dynamicFields,
      personalId: personal._id,
      userId: userId, // ✅ FIXED FIELD NAME
      status: 'pending',
      paymentStatus: 'pending',
      assignedTo: ''
    });

    await service.save();

    res.status(201).json({ message: 'Saved', invoiceId: service._id });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});



// 🟢 DELETE: Delete multiple by ID
router.post('/invoices/delete-multiple', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No IDs provided' });
    }

    await ServiceDetail.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ message: 'Deleted successfully' });

  } catch (err) {
    console.error('Deletion Error:', err);
    res.status(500).json({ error: 'Deletion failed' });
  }
});


// 🟢 GET: Admin fetch all services with personal details populated
// GET: Admin fetch all non-manual services with personal details populated
router.get('/admin/services', async (req, res) => {
  try {
    const entries = await ServiceDetail.find()
      .sort({ createdAt: -1 })
      .populate('personalId');
    res.json(entries);
  } catch (err) {
    console.error('Fetch Error:', err);
    if (err && err.stack) {
      console.error('Error stack:', err.stack);
    }
    res.status(500).json({ error: 'Unable to fetch services', details: err && err.message ? err.message : err });
  }
});
// 🟢 PATCH: Upload certificate for a service
router.patch('/admin/services/:id/certificate', verifyJWT, upload.single('certificate'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No certificate file uploaded' });
    }
    const updated = await ServiceDetail.findByIdAndUpdate(
      id,
      { certificate: req.file.filename },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Service not found' });
    res.json({ message: 'Certificate uploaded', certificate: req.file.filename });
  } catch (err) {
    console.error('Certificate upload error:', err);
    res.status(500).json({ error: 'Failed to upload certificate' });
  }
});
router.patch('/admin/services/:id/status', verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await ServiceDetail.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Service not found' });
    res.json({ message: 'Status updated', service: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});


// Send invoice and certificate to user (email + dashboard)
router.post('/admin/services/:id/send-invoice', verifyJWT, sendInvoiceAndCertificate);

export default router;
