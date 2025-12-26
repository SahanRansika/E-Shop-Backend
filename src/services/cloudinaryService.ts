import cloudinary from '../config/cloudinary';

// Example service method
export const uploadImage = async (file: any) => {
  return await cloudinary.uploader.upload(file.path);
};