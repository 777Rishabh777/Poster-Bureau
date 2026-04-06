const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/requireAuth');

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
    const repo = req.app.locals.orderRepo;

    try {
        const created = await repo.create(req.body || {}, { user: req.user || {} });
        res.status(201).json(created);
    } catch (err) {
        res.status(400).json({ error: err && err.message ? err.message : 'Invalid order payload' });
    }
});

router.get('/my', requireAuth, async (req, res) => {
    const repo = req.app.locals.orderRepo;
    const items = await repo.listByUser(req.user || {});
    res.json(items);
});

router.get('/', requireAdmin, async (req, res) => {
    const repo = req.app.locals.orderRepo;
    const items = await repo.listAll();
    res.json(items);
});

router.patch('/:id/status', requireAdmin, async (req, res) => {
    const repo = req.app.locals.orderRepo;

    try {
        const updated = await repo.updateStatus(req.params.id, req.body && req.body.status);
        if (!updated) return res.status(404).json({ error: 'Not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err && err.message ? err.message : 'Invalid status' });
    }
});

module.exports = router;
