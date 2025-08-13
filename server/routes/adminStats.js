import express from 'express';
import Lead from '../models/Lead.js';
// import Service from '../models/Service.js';
import Service from '../models/Service.js';
import ManualService from '../models/ManualServiceSubmission.js';
import ConvertedLead from '../models/ConvertedLead.js';
import { servicePrices } from '../data/servicePrices.js';
const router = express.Router();

// GET /admin/leads/count
router.get('/leads/count', async (req, res) => {
  try {
    const count = await Lead.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leads count' });
  }
});

// router.get('/services/count', async (req, res) => {
//   try {
//     const mainCompleted = await Service.countDocuments({ status: 'completed' });
//     const manualCompleted = await ManualService.countDocuments({ status: 'completed' });
//     const convertedCompleted = await ConvertedLead.countDocuments({ status: 'completed' });
//     const count = mainCompleted + manualCompleted + convertedCompleted;
//     res.json({ count });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch services count' });
//   }
// });

router.get('/services/pending/count', async (req, res) => {
  try {
    // 1. Service.js
    const allServices = await Service.find();
    // 2. ManualServiceSubmission.js
    const allManual = await ManualService.find();
    // 3. ConvertedLead.js
    const allConverted = await ConvertedLead.find();

    // Filter pending
    const pendingServices = allServices.filter(s => s.status === 'pending');
    const pendingManual = allManual.filter(s => s.status === 'pending');
    const pendingConverted = allConverted.filter(s => s.status === 'pending');

    // Total count
    const count = pendingServices.length + pendingManual.length + pendingConverted.length;
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending cases count' });
  }
});

// GET /admin/services/completed/paymentsum
router.get('/services/completed/paymentsum', async (req, res) => {
  try {
    // Main Service
    const completedServices = await Service.find({ status: 'completed' });
    // Manual Service
    const completedManual = await ManualService.find({ status: 'completed' });
    // Converted Service
    const completedConverted = await ConvertedLead.find({ status: 'completed' });

    // Helper to get amount
    const getAmount = (s, type) => {
      if (s.paymentAmount && !isNaN(parseFloat(s.paymentAmount))) {
        return parseFloat(s.paymentAmount);
      }
      let key = '';
      if (type === 'main') {
        key = s.serviceTitle;
      } else if (type === 'manual') {
        key = s.serviceType;
      } else if (type === 'converted') {
        key = s.service;
      }
      if (key && servicePrices[key]) {
        return servicePrices[key];
      }
      return 0;
    };

    const sumMain = completedServices.reduce((acc, s) => acc + getAmount(s, 'main'), 0);
    const sumManual = completedManual.reduce((acc, s) => acc + getAmount(s, 'manual'), 0);
    const sumConverted = completedConverted.reduce((acc, s) => acc + getAmount(s, 'converted'), 0);

    const sum = sumMain + sumManual + sumConverted;
    res.json({ sum });
  } catch (err) {
    console.error('Error in /services/completed/paymentsum:', err);
    res.status(500).json({ error: 'Failed to fetch payment sum' });
  }
});

// GET /admin/services/booked/count
// Returns the total number of services (all records) from:
// 1. Service.js
// 2. ManualServiceSubmission.js
// 3. ConvertedLead.js
router.get('/services/count', async (req, res) => {
  try {
    const mainTotal = await Service.countDocuments();
    const manualTotal = await ManualService.countDocuments();
    const convertedTotal = await ConvertedLead.countDocuments();
    const count = mainTotal + manualTotal + convertedTotal;
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch total booked services count' });
  }
});

// GET /admin/leads/latest
// Returns the latest leads, sorted by createdAt descending, limit by query param
router.get('/leads/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const leads = await Lead.find().sort({ createdAt: -1 }).limit(limit);
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch latest leads' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const filter = req.query.filter || 'day';
    const now = new Date();
    let start;
    let useDateFilter = true;
    switch (filter) {
      case 'day':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - 6);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
        useDateFilter = false;
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    let serviceQuery = useDateFilter ? { createdAt: { $gte: start, $lte: now } } : {};
    // Completed services
    const completedServices = await Service.find({ ...serviceQuery, status: 'completed' });
    const completedManual = await ManualService.find({ ...serviceQuery, status: 'completed' });
    const completedConverted = await ConvertedLead.find({ ...serviceQuery, status: 'completed' });
    // Pending services
    const pendingServices = await Service.find({ ...serviceQuery, status: 'pending' });
    const pendingManual = await ManualService.find({ ...serviceQuery, status: 'pending' });
    const pendingConverted = await ConvertedLead.find({ ...serviceQuery, status: 'pending' });
    // Total leads (all models)
    const totalLeads = await Service.countDocuments(serviceQuery)
      + await ManualService.countDocuments(serviceQuery)
      + await ConvertedLead.countDocuments(serviceQuery);
    // Payment sum for completed
      // Helper to get price from servicePrices
      const getPrice = (s, type) => {
        if (s.paymentAmount && !isNaN(parseFloat(s.paymentAmount))) {
          return parseFloat(s.paymentAmount);
        }
        let key = '';
        if (type === 'main') {
          key = s.serviceTitle;
        } else if (type === 'manual') {
          key = s.serviceType;
        } else if (type === 'converted') {
          key = s.service;
        }
        if (key && servicePrices[key]) {
          return servicePrices[key];
        }
        return 0;
      };

      // Calculate prices for completed services
      const completedServicePrices = completedServices.map(s => ({
        id: s._id,
        type: 'main',
        title: s.serviceTitle,
        price: getPrice(s, 'main')
      }));
      const completedManualPrices = completedManual.map(s => ({
        id: s._id,
        type: 'manual',
        title: s.serviceType,
        price: getPrice(s, 'manual')
      }));
      const completedConvertedPrices = completedConverted.map(s => ({
        id: s._id,
        type: 'converted',
        title: s.service,
        price: getPrice(s, 'converted')
      }));

      const allCompletedPrices = [
        ...completedServicePrices,
        ...completedManualPrices,
        ...completedConvertedPrices
      ];

      const paymentSum = allCompletedPrices.reduce((acc, s) => acc + s.price, 0);

      res.json([
        { title: 'Completed Services', value: completedServices.length + completedManual.length + completedConverted.length },
        { title: 'Pending Services', value: pendingServices.length + pendingManual.length + pendingConverted.length },
        { title: 'Total Leads', value: totalLeads },
        { title: 'Payment of Completed', value: paymentSum },
        { title: 'Completed Service Prices', value: allCompletedPrices }
      ]);
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

export default router;
