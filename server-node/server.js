const path = require('path');
const net = require('net');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const posterRoutes = require('./routes/posterRoutes');
const { createPosterRepository, buildSeedPosters } = require('./repositories/posterRepository');
const userRoutes = require('./routes/userRoutes');
const { createUserRepository } = require('./repositories/userRepository');
const { createOrderRepository } = require('./repositories/orderRepository');
const contentRoutes = require('./routes/contentRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = Number(process.env.PORT || 5000);
const mongoURI = process.env.MONGO_URI;
const isVercelRuntime = Boolean(process.env.VERCEL);

let storageMode = 'file';
let storageLabel = 'File DB';
let initPromise = null;

function ensurePortAvailable(port) {
    return new Promise((resolve, reject) => {
        const probe = net.createServer();

        probe.once('error', (err) => {
            if (err && err.code === 'EADDRINUSE') {
                const portError = new Error(`Port ${port} is already in use. Stop the other server or set PORT to a different value.`);
                portError.code = 'EADDRINUSE';
                reject(portError);
                return;
            }
            reject(err);
        });

        probe.once('listening', () => {
            probe.close((closeErr) => {
                if (closeErr) {
                    reject(closeErr);
                    return;
                }
                resolve();
            });
        });

        probe.listen(port);
    });
}

function seedSyncKey(item) {
    return String(item.slug || `${item.title}__${item.image_url}`)
        .trim()
        .toLowerCase();
}

function isAutoSeedItem(item) {
    return String(item && item.slug ? item.slug : '').toLowerCase().startsWith('auto-');
}

async function syncMongoSeedCatalog() {
    const Poster = require('./models/Poster');
    const seed = await buildSeedPosters();
    const docs = await Poster.find({}, { title: 1, image_url: 1, slug: 1, category: 1, kind: 1, series: 1, collection: 1, material: 1, accent: 1, tags: 1, sizes: 1 }).lean();
    const existing = new Set(docs.map(seedSyncKey));
    const inserts = seed.filter((item) => !existing.has(seedSyncKey(item)));
    const seedByImage = new Map();
    for (const item of seed) {
        const imageKey = String(item.image_url || '').trim().toLowerCase();
        if (!imageKey) continue;
        const current = seedByImage.get(imageKey);
        if (!current) {
            seedByImage.set(imageKey, item);
            continue;
        }
        // Prefer curated entries over auto-import entries when image files overlap.
        if (isAutoSeedItem(current) && !isAutoSeedItem(item)) {
            seedByImage.set(imageKey, item);
        }
    }

    let updates = 0;

    for (const doc of docs) {
        const imageKey = String(doc.image_url || '').trim().toLowerCase();
        if (!imageKey) continue;
        const match = seedByImage.get(imageKey);
        if (!match) continue;

        const currentTags = Array.isArray(doc.tags) ? doc.tags.map((tag) => String(tag)) : [];
        const nextTags = Array.isArray(match.tags) ? match.tags.map((tag) => String(tag)) : [];
        const currentSizes = Array.isArray(doc.sizes) ? doc.sizes.map((size) => String(size)) : [];
        const nextSizes = Array.isArray(match.sizes) ? match.sizes.map((size) => String(size)) : [];

        const sameTags = currentTags.length === nextTags.length
            && currentTags.every((value, index) => value === nextTags[index]);
        const sameSizes = currentSizes.length === nextSizes.length
            && currentSizes.every((value, index) => value === nextSizes[index]);

        const needsUpdate = String(doc.category || '') !== String(match.category || '')
            || String(doc.kind || '') !== String(match.kind || '')
            || String(doc.series || '') !== String(match.series || '')
            || String(doc.collection || '') !== String(match.collection || '')
            || String(doc.material || '') !== String(match.material || '')
            || String(doc.accent || '') !== String(match.accent || '')
            || !sameTags
            || !sameSizes;

        if (!needsUpdate) continue;

        await Poster.updateOne(
            { _id: doc._id },
            {
                $set: {
                    category: match.category,
                    kind: match.kind,
                    series: match.series,
                    collection: match.collection,
                    material: match.material,
                    accent: match.accent,
                    tags: nextTags,
                    sizes: nextSizes,
                },
            }
        );
        updates += 1;
    }

    if (inserts.length) {
        await Poster.insertMany(inserts.map(({ id, ...item }) => ({
            ...item,
            createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        })));
    }

    return { inserted: inserts.length, updated: updates };
}

async function initializeStorage() {
    if (app.locals.posterRepo && app.locals.userRepo && app.locals.orderRepo) {
        return { mode: storageMode, storageLabel };
    }

    if (!initPromise) {
        initPromise = (async () => {
            let mode = 'file';
            let nextStorageLabel = 'File DB';

            if (mongoURI) {
                try {
                    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 2500 });
                    mode = 'mongo';
                    nextStorageLabel = `MongoDB (${mongoURI})`;
                } catch (err) {
                    console.warn('[startup] MongoDB unavailable. Falling back to file storage.');
                    console.warn(`[startup] ${err && err.message ? err.message : err}`);
                }
            } else {
                console.warn('[startup] MONGO_URI not set. Using file storage.');
            }

            // Vercel functions use a read-only deployment filesystem, so persistent writes require MongoDB.
            if (isVercelRuntime && mode !== 'mongo') {
                throw new Error('MONGO_URI is required in Vercel deployments. Configure MongoDB Atlas and set MONGO_URI in Vercel environment variables.');
            }

            app.locals.posterRepo = createPosterRepository({ mode });
            app.locals.userRepo = createUserRepository({ mode });
            app.locals.orderRepo = createOrderRepository({ mode });

            if (mode === 'mongo') {
                try {
                    const syncResult = await syncMongoSeedCatalog();
                    const inserted = Number(syncResult && syncResult.inserted ? syncResult.inserted : 0);
                    const updated = Number(syncResult && syncResult.updated ? syncResult.updated : 0);
                    if (inserted > 0 || updated > 0) {
                        console.log(`[startup] Mongo catalog sync: inserted ${inserted}, updated ${updated}`);
                    }
                } catch (err) {
                    console.warn(`[startup] Mongo catalog sync skipped: ${err && err.message ? err.message : err}`);
                }
            }

            storageMode = mode;
            storageLabel = nextStorageLabel;

            return { mode: storageMode, storageLabel };
        })();
    }

    try {
        return await initPromise;
    } catch (err) {
        initPromise = null;
        throw err;
    }
}

app.use('/api', async (req, res, next) => {
    try {
        await initializeStorage();
        next();
    } catch (err) {
        next(err);
    }
});

app.get('/api/health', (req, res) => {
    res.json({ ok: true, mode: storageMode, time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/posters', posterRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/content', contentRoutes);

const clientDir = path.join(__dirname, '..', 'client');
app.use(express.static(clientDir));
app.get('/admin', (req, res) => res.sendFile(path.join(clientDir, 'admin.html')));
app.get('/login', (req, res) => res.sendFile(path.join(clientDir, 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(clientDir, 'register.html')));
app.get('/account', (req, res) => res.sendFile(path.join(clientDir, 'account.html')));
app.get('/checkout', (req, res) => res.sendFile(path.join(clientDir, 'checkout.html')));
app.get('/store', (req, res) => res.sendFile(path.join(clientDir, 'store.html')));
app.get('/discover', (req, res) => res.sendFile(path.join(clientDir, 'discover.html')));
app.get('/collections', (req, res) => res.sendFile(path.join(clientDir, 'collections.html')));
app.get('/product', (req, res) => res.sendFile(path.join(clientDir, 'product.html')));
app.get('/help-center', (req, res) => res.sendFile(path.join(clientDir, 'help-center.html')));
app.get('/about', (req, res) => res.sendFile(path.join(clientDir, 'about.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(clientDir, 'contact.html')));
app.get('/terms', (req, res) => res.sendFile(path.join(clientDir, 'terms.html')));
app.get('/shipping', (req, res) => res.sendFile(path.join(clientDir, 'shipping.html')));
app.get('/faq', (req, res) => res.sendFile(path.join(clientDir, 'faq.html')));
app.get('/', (req, res) => res.sendFile(path.join(clientDir, 'index.html')));

app.use((err, req, res, next) => {
    const message = err && err.message ? err.message : 'Unexpected server error';
    console.error(`[server] ${message}`);
    if (res.headersSent) {
        next(err);
        return;
    }
    res.status(500).json({ error: message });
});

async function startServer() {
    await initializeStorage();
    await ensurePortAvailable(PORT);

    const baseUrl = `http://localhost:${PORT}`;
    const server = app.listen(PORT, () => {
        console.log('');
        console.log('Poster Bureau API ready');
        console.log(`- Server: ${baseUrl}`);
        console.log(`- Health: ${baseUrl}/api/health`);
        console.log(`- Storage: ${storageLabel}`);
    });

    server.on('error', (err) => {
        console.error(`[startup] Failed to start server: ${err && err.message ? err.message : err}`);
        process.exit(1);
    });
}

function handleStartupError(err) {
    if (err && err.code === 'EADDRINUSE') {
        console.error(`[startup] ${err.message}`);
        process.exit(1);
    }

    console.error('[startup] Fatal startup error.');
    console.error(err && err.stack ? err.stack : err);
    process.exit(1);
}

if (require.main === module) {
    startServer().catch(handleStartupError);
}

module.exports = app;
module.exports.app = app;
module.exports.initializeStorage = initializeStorage;
module.exports.startServer = startServer;

