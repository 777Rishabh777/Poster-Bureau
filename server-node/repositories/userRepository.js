const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const User = require('../models/User');

const dataFilePath = path.join(__dirname, '..', 'data', 'users.json');

async function ensureDataFile() {
    try {
        await fs.access(dataFilePath);
    } catch {
        await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
        await fs.writeFile(dataFilePath, JSON.stringify([], null, 2), 'utf8');
    }
}

function normalizeUser(raw) {
    if (!raw) return null;
    if (raw._id) return { id: String(raw._id), email: raw.email, name: raw.name || '', createdAt: raw.createdAt };
    return { id: String(raw.id), email: raw.email, name: raw.name || '', createdAt: raw.createdAt };
}

function createUserRepository({ mode }) {
    if (mode === 'mongo') {
        return {
            async create({ email, password, name }) {
                const passwordHash = await bcrypt.hash(password, 10);
                const created = await User.create({ email, passwordHash, name: name || '' });
                return normalizeUser(created.toObject());
            },
            async findByEmail(email) {
                const doc = await User.findOne({ email }).lean();
                return doc ? { ...normalizeUser(doc), passwordHash: doc.passwordHash } : null;
            },
            async findAll() {
                const docs = await User.find({}).sort({ createdAt: -1 }).lean();
                return docs.map(normalizeUser);
            },
        };
    }

    return {
        async create({ email, password, name }) {
            await ensureDataFile();
            const users = JSON.parse(await fs.readFile(dataFilePath, 'utf8'));
            if (users.some((u) => String(u.email).toLowerCase() === String(email).toLowerCase())) {
                throw new Error('Email already exists');
            }
            const passwordHash = await bcrypt.hash(password, 10);
            const created = {
                id: crypto.randomUUID(),
                email,
                name: name || '',
                passwordHash,
                createdAt: new Date().toISOString(),
            };
            users.push(created);
            await fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), 'utf8');
            return normalizeUser(created);
        },
        async findByEmail(email) {
            await ensureDataFile();
            const users = JSON.parse(await fs.readFile(dataFilePath, 'utf8'));
            const found = users.find((u) => String(u.email).toLowerCase() === String(email).toLowerCase());
            return found ? { ...normalizeUser(found), passwordHash: found.passwordHash } : null;
        },
        async findAll() {
            await ensureDataFile();
            const users = JSON.parse(await fs.readFile(dataFilePath, 'utf8'));
            return users.map(normalizeUser);
        },
    };
}

module.exports = { createUserRepository };

