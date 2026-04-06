const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Hardcoded admin credentials per project request
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.ADMIN_USER || 'admin@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

router.post('/login', (req, res) => {
    const { username, email, password } = req.body || {};
    const loginId = String(email || username || '').trim().toLowerCase();

    if (loginId !== String(ADMIN_EMAIL).toLowerCase() || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { sub: ADMIN_EMAIL, role: 'admin', email: ADMIN_EMAIL },
        process.env.JWT_SECRET || 'dev_secret_change_me',
        { expiresIn: '12h' }
    );

    return res.json({ token, user: { email: ADMIN_EMAIL, role: 'admin' } });
});

module.exports = router;

