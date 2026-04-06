const mongoose = require('mongoose');

const PosterSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, index: true },
    subtitle: { type: String, default: '' },
    description: { type: String, default: '' },
    highlight: { type: String, default: '' },
    price: { type: Number, required: true },
    image_url: { type: String, required: true },
    category: { type: String, default: 'Poster' },
    kind: { type: String, default: 'poster' },
    series: { type: String, default: 'Vault Select' },
    material: { type: String, default: '' },
    collection: { type: String, default: '' },
    comparePrice: { type: Number, default: 0 },
    sizes: { type: [String], default: [] },
    soldLastHours: { type: Number, default: 0 },
    viewingNow: { type: Number, default: 0 },
    sku: { type: String, default: '' },
    offerText: { type: String, default: '' },
    accent: { type: String, default: 'indigo' },
    featured: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    stock: { type: Number, default: 10 },
    createdAt: { type: Date, default: Date.now }
}, {
    minimize: false,
    suppressReservedKeysWarning: true,
});

module.exports = mongoose.model('Poster', PosterSchema);
