const Order = require('../models/orderModel');
const Product = require('../models/productModel');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Verify product availability and prices
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.name}`,
        });
      }

      // Check if item is in stock
      if (product.countInStock < item.quantity) {
        return res.status(400).json({
          message: `Not enough ${product.name} in stock. Available: ${product.countInStock}`,
        });
      }

      // Verify price
      if (product.price !== item.price) {
        return res.status(400).json({
          message: `Price mismatch for ${product.name}. Expected: ${product.price}`,
        });
      }
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    // Update product stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      product.countInStock -= item.quantity;
      product.sold = (product.sold || 0) + item.quantity;
      await product.save();
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'orderItems.product',
        select: 'name slug category',
        populate: { path: 'category', select: 'name slug' }
      });

    // Check if order exists
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Make sure the user is the owner or an admin
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to update this order
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if order is already paid
    if (order.isPaid) {
      return res.status(400).json({ message: 'Order already paid' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };
    
    // Update order status
    order.status = 'processing';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order is already delivered
    if (order.isDelivered) {
      return res.status(400).json({ message: 'Order already delivered' });
    }

    // Make sure order is paid before delivery
    if (!order.isPaid) {
      return res.status(400).json({ message: 'Order not paid yet' });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'delivered';
    
    if (req.body.trackingNumber) {
      order.trackingNumber = req.body.trackingNumber;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt'); // Sort by most recent first
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const { 
      limit = 10, 
      page = 1,
      status,
      user,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (user) {
      query.user = user;
    }
    
    // Build sort
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;
    
    const orders = await Order.find(query)
      .populate('user', 'id name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));
    
    // Get total
    const total = await Order.countDocuments(query);
    
    res.json({
      orders,
      page: Number(page),
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update fields
    if (status) {
      order.status = status;
      
      // Automatically update isPaid and isDelivered based on status
      if (status === 'delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      } else if (status === 'cancelled') {
        // If order is cancelled, restore product stock
        if (order.status !== 'cancelled') {
          for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
              product.countInStock += item.quantity;
              product.sold = Math.max(0, (product.sold || 0) - item.quantity);
              await product.save();
            }
          }
        }
      }
    }
    
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    
    if (notes) {
      order.notes = notes;
    }
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = async (req, res) => {
  try {
    // Count of orders by status
    const statusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Total sales
    const salesResult = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } }
    ]);
    
    const totalSales = salesResult.length > 0 ? salesResult[0].totalSales : 0;
    
    // Sales by date (last 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const salesByDate = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      statusCounts,
      totalSales,
      salesByDate
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Only the order owner or admin can cancel
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Only allow cancellation of orders that are not shipped, delivered or already cancelled
    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ 
        message: `Cannot cancel order in ${order.status} status` 
      });
    }
    
    // Update order status to cancelled
    order.status = 'cancelled';
    
    // Restore product stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.countInStock += item.quantity;
        product.sold = Math.max(0, (product.sold || 0) - item.quantity);
        await product.save();
      }
    }
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  getOrderStats,
  cancelOrder,
}; 