const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');

const Order = require('../models/Order');

const dataFilePath = path.join(__dirname, '..', 'data', 'orders.json');
const allowedStatuses = new Set(['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled']);

async function ensureDataFile() {
    try {
        await fs.access(dataFilePath);
    } catch {
        await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
        await fs.writeFile(dataFilePath, JSON.stringify([], null, 2), 'utf8');
    }
}

function buildOrderNumber() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `BR-${date}-${suffix}`;
}

function normalizeItems(items) {
    return (Array.isArray(items) ? items : []).map((item) => ({
        productId: item.productId || item.product_id || item.id || '',
        title: String(item.title || '').trim(),
        image_url: item.image_url || '',
        size: String(item.size || '').trim(),
        quantity: Math.max(1, Number(item.quantity || 1)),
        unit_price: Number(item.unit_price),
        line_total: Number(item.line_total),
    }));
}

function normalizeOrder(raw) {
    if (!raw) return null;

    const base = raw._id
        ? {
            id: String(raw._id),
            orderNumber: raw.orderNumber,
            userId: raw.userId || '',
            userEmail: raw.userEmail || '',
            userName: raw.userName || '',
            shipping: raw.shipping || {},
            items: normalizeItems(raw.items),
            total: Number(raw.total || 0),
            status: raw.status || 'Pending',
            notes: raw.notes || '',
            paymentMethod: raw.paymentMethod || 'UPI',
            paymentStatus: raw.paymentStatus || 'Pending',
            createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : undefined,
            updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : undefined,
        }
        : {
            id: String(raw.id),
            orderNumber: raw.orderNumber,
            userId: raw.userId || '',
            userEmail: raw.userEmail || '',
            userName: raw.userName || '',
            shipping: raw.shipping || {},
            items: normalizeItems(raw.items),
            total: Number(raw.total || 0),
            status: raw.status || 'Pending',
            notes: raw.notes || '',
            paymentMethod: raw.paymentMethod || 'UPI',
            paymentStatus: raw.paymentStatus || 'Pending',
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        };

    return base;
}

function validateOrderPayload(payload) {
    const data = payload || {};
    if (!Array.isArray(data.items) || data.items.length === 0) {
        throw new Error('Order requires at least one item');
    }

    const items = data.items.map((item) => {
        const title = String(item.title || '').trim();
        const unitPrice = Number(item.unit_price !== undefined ? item.unit_price : item.price);
        const quantity = Math.max(1, Number(item.quantity || 1));

        if (!title) throw new Error('Each item requires a title');
        if (Number.isNaN(unitPrice) || unitPrice < 0) throw new Error('Invalid item price');

        return {
            productId: String(item.productId || item.product_id || item.id || ''),
            title,
            image_url: String(item.image_url || ''),
            size: String(item.size || '').trim(),
            quantity,
            unit_price: Number(unitPrice.toFixed(2)),
            line_total: Number((unitPrice * quantity).toFixed(2)),
        };
    });

    const shipping = {
        fullName: String(data.shipping && data.shipping.fullName || '').trim(),
        email: String(data.shipping && data.shipping.email || '').trim(),
        phone: String(data.shipping && data.shipping.phone || '').trim(),
        addressLine1: String(data.shipping && data.shipping.addressLine1 || '').trim(),
        addressLine2: String(data.shipping && data.shipping.addressLine2 || '').trim(),
        city: String(data.shipping && data.shipping.city || '').trim(),
        state: String(data.shipping && data.shipping.state || '').trim(),
        postalCode: String(data.shipping && data.shipping.postalCode || '').trim(),
        country: String(data.shipping && data.shipping.country || '').trim(),
    };

    for (const key of ['fullName', 'email', 'phone', 'addressLine1', 'city', 'state', 'postalCode', 'country']) {
        if (!shipping[key]) {
            throw new Error(`Missing shipping field: ${key}`);
        }
    }

    return {
        items,
        shipping,
        notes: String(data.notes || '').trim(),
        paymentMethod: String(data.paymentMethod || 'UPI').trim() || 'UPI',
        paymentStatus: String(data.paymentStatus || 'Pending').trim() || 'Pending',
        total: Number(items.reduce((sum, item) => sum + item.line_total, 0).toFixed(2)),
    };
}

function createOrderRepository({ mode }) {
    if (mode === 'mongo') {
        return {
            async create(payload, { user }) {
                const data = validateOrderPayload(payload);
                const created = await Order.create({
                    orderNumber: buildOrderNumber(),
                    userId: String(user && user.sub || ''),
                    userEmail: String(user && user.email || data.shipping.email || ''),
                    userName: String(user && user.name || data.shipping.fullName || ''),
                    shipping: data.shipping,
                    items: data.items,
                    total: data.total,
                    status: 'Pending',
                    notes: data.notes,
                    paymentMethod: data.paymentMethod,
                    paymentStatus: data.paymentStatus,
                });
                return normalizeOrder(created.toObject());
            },
            async listByUser(user) {
                const query = { $or: [] };
                if (user && user.sub) query.$or.push({ userId: String(user.sub) });
                if (user && user.email) query.$or.push({ userEmail: String(user.email) });
                if (query.$or.length === 0) return [];

                const docs = await Order.find(query).sort({ createdAt: -1 }).lean();
                return docs.map(normalizeOrder);
            },
            async listAll() {
                const docs = await Order.find({}).sort({ createdAt: -1 }).lean();
                return docs.map(normalizeOrder);
            },
            async updateStatus(id, status) {
                if (!allowedStatuses.has(status)) throw new Error('Invalid status');
                const updated = await Order.findByIdAndUpdate(
                    id,
                    { $set: { status, updatedAt: new Date() } },
                    { new: true }
                ).lean();
                return normalizeOrder(updated);
            },
        };
    }

    return {
        async create(payload, { user }) {
            await ensureDataFile();
            const data = validateOrderPayload(payload);
            const orders = JSON.parse(await fs.readFile(dataFilePath, 'utf8'));
            const now = new Date().toISOString();
            const created = {
                id: crypto.randomUUID(),
                orderNumber: buildOrderNumber(),
                userId: String(user && user.sub || ''),
                userEmail: String(user && user.email || data.shipping.email || ''),
                userName: String(user && user.name || data.shipping.fullName || ''),
                shipping: data.shipping,
                items: data.items,
                total: data.total,
                status: 'Pending',
                notes: data.notes,
                paymentMethod: data.paymentMethod,
                paymentStatus: data.paymentStatus,
                createdAt: now,
                updatedAt: now,
            };
            orders.unshift(created);
            await fs.writeFile(dataFilePath, JSON.stringify(orders, null, 2), 'utf8');
            return normalizeOrder(created);
        },
        async listByUser(user) {
            await ensureDataFile();
            const orders = JSON.parse(await fs.readFile(dataFilePath, 'utf8'));
            return orders
                .filter((order) => {
                    const byId = user && user.sub && String(order.userId) === String(user.sub);
                    const byEmail = user && user.email && String(order.userEmail).toLowerCase() === String(user.email).toLowerCase();
                    return byId || byEmail;
                })
                .map(normalizeOrder);
        },
        async listAll() {
            await ensureDataFile();
            const orders = JSON.parse(await fs.readFile(dataFilePath, 'utf8'));
            return orders.map(normalizeOrder);
        },
        async updateStatus(id, status) {
            if (!allowedStatuses.has(status)) throw new Error('Invalid status');
            await ensureDataFile();
            const orders = JSON.parse(await fs.readFile(dataFilePath, 'utf8'));
            const idx = orders.findIndex((order) => String(order.id) === String(id));
            if (idx < 0) return null;

            orders[idx] = {
                ...orders[idx],
                status,
                updatedAt: new Date().toISOString(),
            };
            await fs.writeFile(dataFilePath, JSON.stringify(orders, null, 2), 'utf8');
            return normalizeOrder(orders[idx]);
        },
    };
}

module.exports = { createOrderRepository };
