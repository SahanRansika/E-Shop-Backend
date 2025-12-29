import multer from 'multer';
import { cloudinary } from '../config/cloudinary';

// Library එක ඇතුළත ඇති සියල්ල ලබා ගැනීම
const CloudinaryStorageLib = require('multer-storage-cloudinary');

// Constructor එක නිවැරදිව තෝරා ගැනීම (වර්ෂන් කිහිපයකටම ගැලපෙන ලෙස)
const CloudinaryStorage = CloudinaryStorageLib.CloudinaryStorage || CloudinaryStorageLib;

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    return {
      folder: 'e-shop',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      public_id: `${file.originalname.split('.')[0]}-${Date.now()}`,
    };
  },
});

export const upload = multer({ storage });

export const cloudinaryUpload = async (file: any) => {
  return await cloudinary.uploader.upload(file, {
    folder: 'e-shop',
  });
};