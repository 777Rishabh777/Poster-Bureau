const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { requireAdmin } = require('../middleware/requireAuth');

const router = express.Router();

function signUserToken(user) {
    return jwt.sign(
        { sub: user.id, email: user.email, name: user.name, role: 'user' },
        process.env.JWT_SECRET || 'dev_secret_change_me',
        { expiresIn: '7d' }
    );
}

router.post('/register', async (req, res) => {
    const repo = req.app.locals.userRepo;
    const { email, password, name } = req.body || {};

    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
    if (String(password).length < 6) return res.status(400).json({ error: 'Password must be 6+ characters' });

    try {
        const user = await repo.create({ email: String(email).trim(), password: String(password), name: String(name || '').trim() });
        const token = signUserToken(user);
        res.status(201).json({ token, user });
    } catch (err) {
        res.status(400).json({ error: err && err.message ? err.message : 'Register failed' });
    }
});

router.post('/login', async (req, res) => {
    const repo = req.app.locals.userRepo;
    const { email, password } = req.body || {};

    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    const user = await repo.findByEmail(String(email).trim());
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signUserToken(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

router.get('/', requireAdmin, async (req, res) => {
    try {
        const repo = req.app.locals.userRepo;
        const users = await repo.findAll();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

module.exports = router;
