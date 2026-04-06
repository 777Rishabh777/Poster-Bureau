const express = require('express');
const { requireAdmin } = require('../middleware/requireAuth');

const router = express.Router();

router.get('/', async (req, res) => {
    const repo = req.app.locals.posterRepo;
    const items = await repo.list();
    res.json(items);
});

router.get('/slug/:slug', async (req, res) => {
    const repo = req.app.locals.posterRepo;
    const item = await repo.getBySlug(req.params.slug);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
});

router.get('/:id', async (req, res) => {
    const repo = req.app.locals.posterRepo;
    const item = await repo.getById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
});

router.post('/', requireAdmin, async (req, res) => {
    const repo = req.app.locals.posterRepo;
    try {
        const created = await repo.create(req.body || {});
        res.status(201).json(created);
    } catch (err) {
        res.status(400).json({ error: err && err.message ? err.message : 'Invalid payload' });
    }
});

router.put('/:id', requireAdmin, async (req, res) => {
    const repo = req.app.locals.posterRepo;
    try {
        const updated = await repo.update(req.params.id, req.body || {});
        if (!updated) return res.status(404).json({ error: 'Not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err && err.message ? err.message : 'Invalid payload' });
    }
});

router.post('/classify', requireAdmin, async (req, res) => {
    const repo = req.app.locals.posterRepo;
    try {
        const profile = await repo.classify(req.body || {});
        res.json(profile);
    } catch (err) {
        res.status(400).json({ error: err && err.message ? err.message : 'Unable to classify item' });
    }
});

router.post('/reclassify-images', requireAdmin, async (req, res) => {
    const repo = req.app.locals.posterRepo;
    try {
        const force = Boolean(req.body && req.body.force);
        const result = await repo.reclassifyAll({ force });
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err && err.message ? err.message : 'Unable to reclassify catalog' });
    }
});

router.delete('/:id', requireAdmin, async (req, res) => {
    const repo = req.app.locals.posterRepo;
    const ok = await repo.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
});

module.exports = router;
