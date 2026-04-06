const jwt = require('jsonwebtoken');

const DEFAULT_SECRET = 'dev_secret_change_me';

function parseBearerHeader(header) {
    const [type, token] = String(header || '').split(' ');
    if (type !== 'Bearer' || !token) return null;
    return token;
}

function verifyTokenFromRequest(req) {
    const token = parseBearerHeader(req.headers.authorization);
    if (!token) return { error: 'Missing Bearer token' };

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || DEFAULT_SECRET);
        return { payload };
    } catch {
        return { error: 'Invalid token' };
    }
}

function requireAuth(req, res, next) {
    const { payload, error } = verifyTokenFromRequest(req);
    if (error) return res.status(401).json({ error });

    req.user = payload;
    return next();
}

function requireAdmin(req, res, next) {
    const { payload, error } = verifyTokenFromRequest(req);
    if (error) return res.status(401).json({ error });
    if (!payload || payload.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = payload;
    return next();
}

module.exports = { requireAuth, requireAdmin };
