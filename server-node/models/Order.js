const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    productId: { type: String, default: '' },
    title: { type: String, required: true },
    image_url: { type: String, default: '' },
    size: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    unit_price: { type: Number, required: true, min: 0 },
    line_total: { type: Number, required: true, min: 0 },
}, { _id: false });

const ShippingSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: '', index: true },
    userEmail: { type: String, default: '', index: true },
    userName: { type: String, default: '' },
    shipping: { type: ShippingSchema, required: true },
    items: { type: [OrderItemSchema], default: [] },
    total: { type: Number, required: true, min: 0 },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
    notes: { type: String, default: '' },
    paymentMethod: { type: String, default: 'UPI' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema);
