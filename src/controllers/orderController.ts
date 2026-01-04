import { Request, Response } from 'express';
import Order from '../models/Order';
import { AuthRequest } from '../middleware/authMiddleware';

// 1. නව ඇණවුමක් සෑදීම (Create Order)
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { products, total, address } = req.body;
        
        // Middleware එකෙන් ලැබෙන user id එක ලබා ගැනීම
        const userId = req.user?.id; 

        if (!userId) {
            res.status(401).json({ message: "User not authenticated. ID missing." });
            return;
        }

        const newOrder = new Order({
            user: userId, // Auth Middleware එකෙන් ලැබෙන ID එක
            products: products,
            total: total,
            address: {
                street: address.street,
                city: address.city,
                zipCode: address.zipCode,
                phone: address.phone 
            },
            status: 'pending'
        });

        const savedOrder = await newOrder.save();
        console.log(`✅ Order Created: ${savedOrder._id}`);
        res.status(201).json(savedOrder);

    } catch (error: any) {
        console.error("❌ Order Creation Error:", error);
        res.status(500).json({ 
            message: "Order validation failed", 
            error: error.message 
        });
    }
};

// 2. සියලුම ඇණවුම් ලබා ගැනීම
export const getOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find().populate('user', 'name email');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders" });
    }
};

// 3. ID එක අනුව ඇණවුමක් ලබා ගැනීම
export const getOrderById = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id).populate('products.product');
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Error fetching order" });
    }
};

// 4. ඇණවුමක් අවලංගු කිරීම
export const cancelOrder = async (req: Request, res: Response) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: "Error cancelling order" });
    }
};

// 5. විකුණුම්කරුගේ ඇණවුම් ලබා ගැනීම
export const getSellerOrders = async (req: Request, res: Response) => {
    try {
        res.json({ message: "Seller orders fetched" });
    } catch (error) {
        res.status(500).json({ message: "Error fetching seller orders" });
    }
};

// 6. ඇණවුමක තත්ත්වය යාවත්කාලීන කිරීම
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: "Error updating status" });
    }
};