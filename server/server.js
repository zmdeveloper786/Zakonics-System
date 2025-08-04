import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/userRoutes.js';
import cookieParser from 'cookie-parser';
import invoiceRoutes from './routes/ServiceRoutes.js';
import roleRoutes from './routes/roles.routes.js'; // make sure to add `.js` here
import employeeRoutes from './routes/employee.routes.js';
import employeeAuthRoutes from './routes/employeeAuth.js';
import userPanelRoutes from './routes/userpanel.routes.js';
import payrollsRoutes from './routes/payrolls.js';
import payrollDropdownsRoutes from './routes/payrollDropdowns.js';
import leadsRoutes from './routes/leads.js'; // Import leads routes
import adminServiceRoutes from './routes/adminServices.js';

import manualServiceRoutes from './routes/manualService.js';
import convertedServiceRoutes from './routes/convertedService.js';


import './config/passport.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultSecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use('/admin', roleRoutes);

app.use(cookieParser());
app.use('/uploads', express.static('uploads'));
app.use('/admin', manualServiceRoutes);
app.use('/admin', adminServiceRoutes);

// Routes
app.use('/employee-login', employeeRoutes);
app.use('/', employeeAuthRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', invoiceRoutes);
app.use('/', userRoutes);
app.use('/userpanel', userPanelRoutes); // ✅ Now your route is mounted correctly
app.use('/', payrollDropdownsRoutes);
app.use('/payrolls', payrollsRoutes);
app.use('/leads', leadsRoutes); // Register leads routes

app.use('/manualService', manualServiceRoutes);
app.use('/admin/services/converted', convertedServiceRoutes);
app.use('/convertedService', convertedServiceRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
});

// Connect MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

export default app;
