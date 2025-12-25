import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB  = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI as string, {
            dbName: process.env.DB_NAME,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection error:`, error);
        process.exit(1);
    }
};

mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', ()=> {
    console.log('MongoDB disconnected');
});

export default connectDB;