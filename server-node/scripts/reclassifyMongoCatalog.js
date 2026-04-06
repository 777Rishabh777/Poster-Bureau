const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env'), quiet: true });

const Poster = require('../models/Poster');
const { buildSeedPosters } = require('../repositories/posterRepository');

function isAutoSeedItem(item) {
    return String(item && item.slug ? item.slug : '').toLowerCase().startsWith('auto-');
}

async function run() {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.log('MONGO_URI not set. Skipping reclassification.');
        return;
    }

    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

    const seed = await buildSeedPosters();
    const seedByImage = new Map();
    for (const item of seed) {
        const imageKey = String(item.image_url || '').trim().toLowerCase();
        if (!imageKey) continue;
        const current = seedByImage.get(imageKey);
        if (!current) {
            seedByImage.set(imageKey, item);
            continue;
        }
        if (isAutoSeedItem(current) && !isAutoSeedItem(item)) {
            seedByImage.set(imageKey, item);
        }
    }

    const docs = await Poster.find(
        {},
        { image_url: 1, category: 1, kind: 1, series: 1, collection: 1, material: 1, accent: 1, tags: 1, sizes: 1 }
    ).lean();

    let updates = 0;

    for (const doc of docs) {
        const imageKey = String(doc.image_url || '').trim().toLowerCase();
        const match = seedByImage.get(imageKey);
        if (!match) continue;

        const currentTags = Array.isArray(doc.tags) ? doc.tags.map((tag) => String(tag)) : [];
        const nextTags = Array.isArray(match.tags) ? match.tags.map((tag) => String(tag)) : [];
        const currentSizes = Array.isArray(doc.sizes) ? doc.sizes.map((size) => String(size)) : [];
        const nextSizes = Array.isArray(match.sizes) ? match.sizes.map((size) => String(size)) : [];

        const sameTags = currentTags.length === nextTags.length && currentTags.every((value, index) => value === nextTags[index]);
        const sameSizes = currentSizes.length === nextSizes.length && currentSizes.every((value, index) => value === nextSizes[index]);

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

    console.log(`Mongo catalog records updated: ${updates}`);
}

run()
    .catch((error) => {
        console.error(`Reclassification failed: ${error && error.message ? error.message : error}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        try {
            await mongoose.disconnect();
        } catch {
            // ignore disconnect errors on exit
        }
    });
