import asyncHandler from '../middleware/asyncHandler.js';
import { Order, OrderItem, User, Product, sequelize } from '../models/sql/index.js';
import { Op } from 'sequelize';

// @desc    Create new order (renamed from createOrder to addOrderItems)
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { 
    orderItems, 
    shippingAddress, 
    paymentMethod, 
    // itemsPrice, // Will be calculated
    taxPrice, 
    shippingPrice, 
    // totalPrice // Will be calculated
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  const t = await sequelize.transaction();

  try {
    const order = await Order.create({
      userId: req.user.id,
      shippingAddress_address: shippingAddress.address,
      shippingAddress_city: shippingAddress.city,
      shippingAddress_postalCode: shippingAddress.postalCode,
      shippingAddress_country: shippingAddress.country,
      shippingAddress_fullName: shippingAddress.fullName,
      shippingAddress_phone: shippingAddress.phone,
      paymentMethod,
      taxPrice: Number(taxPrice) || 0,
      shippingPrice: Number(shippingPrice) || 0,
      // itemsPrice and totalPrice are calculated by instance method
    }, { transaction: t });

    const orderItemsToCreate = orderItems.map(item => ({
      orderId: order.id,
      productId: item.product, // Assuming item.product is product ID
      name: item.name,
      qty: item.qty,
      price: item.price,
      image: item.image,
    }));
    await OrderItem.bulkCreate(orderItemsToCreate, { transaction: t });

    // Update product stock
    for (const item of orderItems) {
      const product = await Product.findByPk(item.product, { transaction: t });
      if (product) {
        if (product.countInStock < item.qty) {
          throw new Error(`Not enough stock for product: ${product.name}`);
        }
        product.countInStock -= item.qty;
        await product.save({ transaction: t });
      } else {
        throw new Error(`Product with ID ${item.product} not found`);
      }
    }

    await order.calculatePrices(orderItems); // Pass original orderItems for price calculation
    await order.save({ transaction: t });

    await t.commit();

    // Refetch order with items to return
    const createdOrder = await Order.findByPk(order.id, {
      include: [OrderItem]
    });
    res.status(201).json(createdOrder);

  } catch (error) {
    await t.rollback();
    res.status(400); // Use 400 for client errors like not enough stock
    throw new Error(error.message || 'Failed to create order');
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [
      { model: User, attributes: ['name', 'email'] },
      {
        model: OrderItem,
        include: [{ model: Product, attributes: ['id', 'name', 'images', 'slug'] }]
      }
    ]
  });

  if (order) {
    // Check if the user is authorized to view this order
    if (order.userId === req.user.id || req.user.isAdmin) {
      res.json(order);
    } else {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);

  if (order) {
    // Check if the user is authorized (owner or admin)
    // Note: Original Mongoose logic was `order.user.toString() === req.user._id.toString()`.
    // For Sequelize, assuming req.user.id and order.userId are comparable (e.g. numbers)
    if (order.userId === req.user.id || req.user.isAdmin) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult_id = req.body.id;
      order.paymentResult_status = req.body.status;
      order.paymentResult_update_time = req.body.update_time;
      order.paymentResult_email_address = req.body.email_address; // Changed from payer.email_address

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(403);
      throw new Error('Not authorized to update this order payment status');
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    where: { userId: req.user.id },
    include: [OrderItem] // Include items for better display on frontend
  });
  res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    include: [
      { model: User, attributes: ['id', 'name'] },
      OrderItem // Include items for summary display
    ]
  });
  res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber } = req.body; // notes field removed as it's not in Sequelize Order model

  const order = await Order.findByPk(req.params.id, { include: [OrderItem] }); // Include OrderItems for stock update

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const oldStatus = order.status;
  if (status) {
    order.status = status;
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    } else if (status === 'cancelled' && oldStatus !== 'cancelled') {
      // If order is cancelled, restore product stock
      // Ideally, this also uses a transaction if multiple products, but following existing pattern
      for (const item of order.OrderItems) { // Access associated items via order.OrderItems
        const product = await Product.findByPk(item.productId);
        if (product) {
          product.countInStock += item.qty;
          await product.save();
        }
      }
    }
  }

  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  }

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});


// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = asyncHandler(async (req, res) => {
  // Mongoose aggregation translation to Sequelize can be complex.
  // This requires specific Sequelize functions (e.g. sequelize.fn, sequelize.col) or raw queries.
  // Commenting out for now and returning 501 Not Implemented.
  res.status(501).json({ message: 'Order statistics endpoint not implemented for Sequelize yet.' });
});

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, { include: [OrderItem] }); // Include OrderItems for stock update

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.userId !== req.user.id && !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized to cancel this order');
  }

  if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
    res.status(400);
    throw new Error(`Cannot cancel order in ${order.status} status`);
  }

  const oldStatus = order.status;
  order.status = 'cancelled';

  // Restore product stock if not already cancelled
  if (oldStatus !== 'cancelled') {
    // Ideally, this also uses a transaction if multiple products
    for (const item of order.OrderItems) {
      const product = await Product.findByPk(item.productId);
      if (product) {
        product.countInStock += item.qty;
        await product.save();
      }
    }
  }

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

export {
  addOrderItems, // Renamed from createOrder
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  getOrderStats, // Kept, but returns 501
  cancelOrder,   // Kept and refactored
}; 