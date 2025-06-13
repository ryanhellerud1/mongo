import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database.js';

class Order extends Model {
  // Instance method to calculate prices (can be called from controller)
  async calculatePrices(orderItemsData) {
    // orderItemsData should be an array of objects like { price: X, qty: Y }
    // or fetched via this.getOrderItems() if they are already associated and saved.
    let calculatedItemsPrice = 0;
    if (orderItemsData && orderItemsData.length > 0) {
        calculatedItemsPrice = orderItemsData.reduce((acc, item) => acc + Number(item.price) * Number(item.qty), 0);
    } else {
        const items = await this.getOrderItems();
        calculatedItemsPrice = items.reduce((acc, item) => acc + Number(item.price) * Number(item.qty), 0);
    }
    this.itemsPrice = calculatedItemsPrice.toFixed(2);

    const shippingPrice = Number(this.shippingPrice) || 0;
    const taxPrice = Number(this.taxPrice) || 0;
    this.totalPrice = (Number(this.itemsPrice) + shippingPrice + taxPrice).toFixed(2);
  }

  // Virtual for orderNumber
  get orderNumber() {
    // Ensure ID is available. This might not be set before creation.
    return this.id ? `ORD-${this.id.toString().slice(-8).toUpperCase()}` : null;
  }
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // shippingAddress fields
    shippingAddress_address: { type: DataTypes.STRING, allowNull: false },
    shippingAddress_city: { type: DataTypes.STRING, allowNull: false },
    shippingAddress_postalCode: { type: DataTypes.STRING, allowNull: false },
    shippingAddress_country: { type: DataTypes.STRING, allowNull: false },
    shippingAddress_fullName: { type: DataTypes.STRING, allowNull: false },
    shippingAddress_phone: { type: DataTypes.STRING, allowNull: false },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // paymentResult fields
    paymentResult_id: { type: DataTypes.STRING },
    paymentResult_status: { type: DataTypes.STRING },
    paymentResult_update_time: { type: DataTypes.STRING },
    paymentResult_email_address: { type: DataTypes.STRING },
    itemsPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    taxPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    shippingPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    paidAt: {
      type: DataTypes.DATE,
    },
    isDelivered: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    deliveredAt: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    trackingNumber: {
      type: DataTypes.STRING,
    },
    // userId will be added via association
  },
  {
    sequelize,
    modelName: 'Order',
    timestamps: true,
    // Removed the beforeSave hook for price calculation here.
    // It's better to call the instance method explicitly in the controller
    // after order items are prepared.
  }
);

class OrderItem extends Model {}

OrderItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    qty: { type: DataTypes.INTEGER, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    // orderId and productId will be added via associations
  },
  {
    sequelize,
    modelName: 'OrderItem',
    timestamps: false,
  }
);

export { Order, OrderItem };
