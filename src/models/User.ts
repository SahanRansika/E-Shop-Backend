import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface for TypeScript
export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  roles: string[]; // e.g., ['buyer'], ['seller'], ['admin']
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Mongoose Schema
const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    roles: {
      type: [String],
      enum: ['buyer', 'seller', 'admin'],
      default: ['buyer'],
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export model
const User: Model<UserDocument> = mongoose.models.User || mongoose.model<UserDocument>('User', userSchema);

export default User;