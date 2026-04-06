const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { requireAdmin } = require('../middleware/requireAuth');

const DATA_DIR = path.join(__dirname, '..', 'data');
const OFFERS_FILE = path.join(DATA_DIR, 'offers.json');
const HELP_FILE = path.join(DATA_DIR, 'help-content.json');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback-photos.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readJSON(file, defaults) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch { fs.writeFileSync(file, JSON.stringify(defaults, null, 2)); return defaults; }
}

const defaultOffers = [
    { id: 1, text: 'Free Delivery for Prepaid Orders!', active: true },
    { id: 2, text: 'Buy 4 Get 3 Free!', active: true },
    { id: 3, text: 'Buy 5 Get 5 Free!', active: true },
    { id: 4, text: 'Buy 6 Get 12 Free!', active: true },
    { id: 5, text: 'Buy 10 Get 20 Free!', active: true },
    { id: 6, text: 'Buy 20 Get 50 Free!', active: true },
    { id: 7, text: 'Premium 300GSM Museum Paper', active: true }
];

router.get('/offers', (req, res) => {
    const offers = readJSON(OFFERS_FILE, defaultOffers);
    res.json(offers);
});

router.put('/offers', requireAdmin, (req, res) => {
    const offers = req.body;
    fs.writeFileSync(OFFERS_FILE, JSON.stringify(offers, null, 2));
    res.json({ success: true, offers });
});

router.post('/offers', requireAdmin, (req, res) => {
    const offers = readJSON(OFFERS_FILE, defaultOffers);
    const newOffer = { id: Date.now(), text: req.body.text, active: true };
    offers.push(newOffer);
    fs.writeFileSync(OFFERS_FILE, JSON.stringify(offers, null, 2));
    res.json({ success: true, offer: newOffer });
});

router.delete('/offers/:id', requireAdmin, (req, res) => {
    let offers = readJSON(OFFERS_FILE, defaultOffers);
    offers = offers.filter(o => o.id != req.params.id);
    fs.writeFileSync(OFFERS_FILE, JSON.stringify(offers, null, 2));
    res.json({ success: true });
});

const defaultHelp = {
    about: { title: 'About Us', lastEdited: new Date().toISOString() },
    contact: { title: 'Contact Us', lastEdited: new Date().toISOString() },
    terms: { title: 'Terms & Conditions', lastEdited: new Date().toISOString() },
    shipping: { title: 'Shipping & Cancellation', lastEdited: new Date().toISOString() },
    faq: { title: 'FAQs', lastEdited: new Date().toISOString() }
};

router.get('/help', (req, res) => {
    const help = readJSON(HELP_FILE, defaultHelp);
    res.json(help);
});

router.put('/help/:page', requireAdmin, (req, res) => {
    const help = readJSON(HELP_FILE, defaultHelp);
    const page = req.params.page;
    if (help[page]) {
        help[page] = { ...help[page], ...req.body, lastEdited: new Date().toISOString() };
        fs.writeFileSync(HELP_FILE, JSON.stringify(help, null, 2));
        res.json({ success: true, page: help[page] });
    } else {
        res.status(404).json({ error: 'Page not found' });
    }
});

const defaultPhotos = [
    { id: 1, url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&fit=crop', alt: 'Customer wall setup' },
    { id: 2, url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&fit=crop', alt: 'Customer wall setup' },
    { id: 3, url: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=600&fit=crop', alt: 'Customer wall setup' },
    { id: 4, url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=600&fit=crop', alt: 'Customer wall setup' },
    { id: 5, url: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?q=80&w=600&fit=crop', alt: 'Customer wall setup' },
    { id: 6, url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=600&fit=crop', alt: 'Customer wall setup' },
    { id: 7, url: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?q=80&w=600&fit=crop', alt: 'Customer wall setup' },
    { id: 8, url: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=600&fit=crop', alt: 'Customer wall setup' }
];

router.get('/feedback-photos', (req, res) => {
    const photos = readJSON(FEEDBACK_FILE, defaultPhotos);
    res.json(photos);
});

router.post('/feedback-photos', requireAdmin, (req, res) => {
    const photos = readJSON(FEEDBACK_FILE, defaultPhotos);
    const newPhoto = { id: Date.now(), url: req.body.url, alt: req.body.alt || 'Customer wall setup' };
    photos.push(newPhoto);
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(photos, null, 2));
    res.json({ success: true, photo: newPhoto });
});

router.delete('/feedback-photos/:id', requireAdmin, (req, res) => {
    let photos = readJSON(FEEDBACK_FILE, defaultPhotos);
    photos = photos.filter(p => p.id != req.params.id);
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(photos, null, 2));
    res.json({ success: true });
});

module.exports = router;
