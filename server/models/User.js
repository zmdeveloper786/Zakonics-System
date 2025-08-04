// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   CNIC: { type: String, unique: true, required: false },
//   phoneNumber: String,
//   password: { type: String }, // hashed password
//   googleId: { type: String }, // for Google OAuth users
//   resetPasswordToken: String,
//   resetPasswordExpires: Date,
//   isActive: { type: Boolean, default: true }, // 👈 optional
//   services: { type: [String], default: [] }   // 👈 optional

// }, {
//   timestamps: true
// });

// export default mongoose.model('User', userSchema);

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  
  // CNIC now allows null/undefined but prevents duplicate key errors
  CNIC: { type: String, unique: true, sparse: true },

  phoneNumber: { type: String },
  
  // Only required for manual signup, not for Google users
  password: { type: String }, 

  googleId: { type: String }, // for Google OAuth users
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  isActive: { type: Boolean, default: true },
  services: { type: [String], default: [] }

}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);
