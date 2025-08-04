import mongoose from 'mongoose';


const ServiceDetailSchema = new mongoose.Schema({
  serviceTitle: String,
  formFields: Object,
  personalId: { type: mongoose.Schema.Types.ObjectId, ref: 'PersonalDetail' },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'advance', 'full'],
    default: 'pending'
  },
  assignedTo: {
    type: String,
    default: ''
  },
  certificate: { type: String, default: null }, // uploaded certificate filename
  invoiceSent: { type: Boolean, default: false }, // track if invoice sent
  // isManualSubmission removed; manual and direct services are independent
}, { timestamps: true });

export default mongoose.model('ServiceDetail', ServiceDetailSchema);
