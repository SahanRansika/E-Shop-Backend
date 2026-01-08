import { Request, Response } from 'express';
import Order from '../models/Order';
import { AuthRequest } from '../middleware/authMiddleware';

// 1. නව ඇණවුමක් සෑදීම
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { products, total, address } = req.body;
        const userId = req.user?.id; 

        if (!userId) {
            res.status(401).json({ message: "User not authenticated." });
            return;
        }

        const newOrder = new Order({
            user: userId,
            products: products,
            total: total,
            address: address,
            status: 'pending'
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error: any) {
        res.status(500).json({ message: "Order creation failed", error: error.message });
    }
};

// 2. සියලුම ඇණවුම් ලබා ගැනීම (Admin හෝ User සඳහා)
export const getOrders = async (req: AuthRequest, res: Response) => {
    try {
        // User ලොග් වී ඇත්නම් ඔහුට අදාළ ඒවා පමණක් පෙන්වීමට:
        const filter = req.user?.roles?.includes('admin') ? {} : { user: req.user?.id };
        const orders = await Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders" });
    }
};

// 3. ID එක අනුව ඇණවුමක් ලබා ගැනීම
export const getOrderById = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('products.product');
        
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

// 5. 🔥 විකුණුම්කරුගේ (Seller) ඇණවුම් ලබා ගැනීම
export const getSellerOrders = async (req: AuthRequest, res: Response) => {
    try {
        const sellerId = req.user?.id;

        // සියලුම ඇණවුම් ගෙන නිෂ්පාදන වල Seller ID එක සමඟ සසඳා filter කිරීම
        const allOrders = await Order.find()
            .populate('user', 'name email')
            .populate('products.product')
            .sort({ createdAt: -1 });

        const sellerOrders = allOrders.filter(order => 
            order.products.some((item: any) => 
                item.product && item.product.seller && item.product.seller.toString() === sellerId
            )
        );

        res.status(200).json(sellerOrders);
    } catch (error: any) {
        console.error("Seller Order Error:", error);
        res.status(500).json({ message: "Error fetching seller orders" });
    }
};

// 6. ඇණවුමක තත්ත්වය (Status) යාවත්කාලීන කිරීම
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        // වලංගු status වර්ග පමණක් ඇතුළත් කිරීමට වගබලා ගන්න
        const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        );
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: "Error updating status" });
    }
};