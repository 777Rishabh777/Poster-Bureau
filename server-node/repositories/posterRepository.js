const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');

const Poster = require('../models/Poster');

const dataFilePath = path.join(__dirname, '..', 'data', 'posters.json');
const clientImagesDirPath = path.join(__dirname, '..', '..', 'client', 'images');
const catalogImageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);

const posterLikeCategories = new Set(['anime', 'gaming', 'marvel', 'auto', 'general', 'poster', 'posters']);
const accentBySeries = {
    Naruto: 'orange',
    'One Piece': 'sky',
    'Demon Slayer': 'rose',
    'Jujutsu Kaisen': 'violet',
    'Solo Leveling': 'indigo',
    'Attack on Titan': 'amber',
    'Dragon Ball': 'yellow',
    Lifestyle: 'slate',
    'Manga Shelf': 'emerald',
    'Room Setup': 'fuchsia',
    'Poster Setup': 'cyan',
};

const curatedCatalog = [
    {
        slug: 'naruto-sage-mode-skyline',
        title: 'Naruto Sage Mode Skyline',
        subtitle: 'Orange chakra, night haze, clean hero framing.',
        description: 'A sharp Naruto wall piece built for main-character rooms, desk cams, and bold anime corners.',
        highlight: 'Naruto best poster energy',
        price: 16.99,
        image_url: '/images/narutosage.avif',
        category: 'Poster',
        kind: 'poster',
        series: 'Naruto',
        material: '300GSM matte print',
        accent: 'orange',
        featured: true,
        tags: ['Naruto', 'Poster', 'Hero Wall', 'Featured'],
        stock: 18,

    },
    {
        slug: 'ichiraku-break-time-poster',
        title: 'Ichiraku Break Time',
        subtitle: 'Soft ramen-core art for a warmer shelf wall.',
        description: 'A cozy Naruto poster with enough color pop to anchor kitchen nooks, study setups, or anime cafes.',
        highlight: 'Cozy ramen-core frame',
        price: 13.99,
        image_url: '/images/naturoramen.jpg',
        category: 'Poster',
        kind: 'poster',
        series: 'Naruto',
        material: '250GSM matte print',
        accent: 'orange',
        featured: false,
        tags: ['Naruto', 'Poster', 'Cozy Drop'],
        stock: 14,
    },
    {
        slug: 'team-7-rush-frame',
        title: 'Team 7 Rush Frame',
        subtitle: 'Fast composition, loud colors, legacy cast heat.',
        description: 'Built for Naruto fans who want a squad shot that still reads premium from across the room.',
        highlight: 'Legacy squad wall drop',
        price: 15.99,
        image_url: '/images/naruto3.jpg',
        category: 'Poster',
        kind: 'poster',
        series: 'Naruto',
        material: '300GSM matte print',
        accent: 'orange',
        featured: true,
        tags: ['Naruto', 'Poster', 'Squad Wall'],
        stock: 16,
    },
    {
        slug: 'gear-5-skybreak-poster',
        title: 'Gear 5 Skybreak',
        subtitle: 'Big motion, loud whites, peak pirate chaos.',
        description: 'A high-impact One Piece poster that brings the Gear 5 look into a bright, flex-heavy wall setup.',
        highlight: 'Luffy goes full skybreak',
        price: 17.99,
        image_url: '/images/One%20Piece2.jpg',
        category: 'Poster',
        kind: 'poster',
        series: 'One Piece',
        material: '300GSM matte print',
        accent: 'sky',
        featured: true,
        tags: ['One Piece', 'Poster', 'Featured'],
        stock: 20,
    },
    {
        slug: 'straw-hat-roll-call',
        title: 'Straw Hat Roll Call',
        subtitle: 'Crew energy with a clean collector feel.',
        description: 'A full crew composition that works as a center wall piece without feeling noisy or cheap.',
        highlight: 'Crew wall with clean flex',
        price: 16.49,
        image_url: '/images/One%20Piece1.avif',
        category: 'Poster',
        kind: 'poster',
        series: 'One Piece',
        material: '300GSM matte print',
        accent: 'sky',
        featured: false,
        tags: ['One Piece', 'Poster', 'Crew'],
        stock: 15,
    },
    {
        slug: 'tanjiro-water-burst',
        title: 'Tanjiro Water Burst',
        subtitle: 'Fluid blue movement with a premium matte finish.',
        description: 'Sharp action framing and colder tones make this a clean Demon Slayer starter poster.',
        highlight: 'Water breathing wall hit',
        price: 15.49,
        image_url: '/images/tanjiro.jpg',
        category: 'Poster',
        kind: 'poster',
        series: 'Demon Slayer',
        material: '300GSM matte print',
        accent: 'rose',
        featured: false,
        tags: ['Demon Slayer', 'Poster', 'Action'],
        stock: 12,
    },
    {
        slug: 'rengoku-flame-charge',
        title: 'Rengoku Flame Charge',
        subtitle: 'Warm flame tones with a sharp collector finish.',
        description: 'Made for statement walls, this print leans cinematic without losing that anime poster energy.',
        highlight: 'Flame hashira wall heat',
        price: 16.99,
        image_url: '/images/rengoku-cool-demon-slayer.jpg',
        category: 'Poster',
        kind: 'poster',
        series: 'Demon Slayer',
        material: '300GSM matte print',
        accent: 'rose',
        featured: true,
        tags: ['Demon Slayer', 'Poster', 'Featured'],
        stock: 16,
    },
    {
        slug: 'gojo-infinity-glow',
        title: 'Gojo Infinity Glow',
        subtitle: 'Cold blue glare for high-contrast setups.',
        description: 'A sleek Jujutsu Kaisen wall piece with enough space and contrast to work in both minimal and loud rooms.',
        highlight: 'Six Eyes room takeover',
        price: 16.99,
        image_url: '/images/gojo%20.jpg',
        category: 'Poster',
        kind: 'poster',
        series: 'Jujutsu Kaisen',
        material: '300GSM matte print',
        accent: 'violet',
        featured: true,
        tags: ['Jujutsu Kaisen', 'Poster', 'Featured'],
        stock: 14,
    },
    {
        slug: 'sukuna-domain-silence',
        title: 'Sukuna Domain Silence',
        subtitle: 'Dark wall art with richer reds and shadows.',
        description: 'For darker rooms and sharper anime tastes, this poster keeps the palette intense without losing detail.',
        highlight: 'Dark curse king framing',
        price: 15.99,
        image_url: '/images/sukuna.jpg',
        category: 'Poster',
        kind: 'poster',
        series: 'Jujutsu Kaisen',
        material: '300GSM matte print',
        accent: 'violet',
        featured: false,
        tags: ['Jujutsu Kaisen', 'Poster', 'Dark'],
        stock: 11,
    },
    {
        slug: 'shadow-monarch-rise',
        title: 'Shadow Monarch Rise',
        subtitle: 'Midnight tones, sharp edges, clean menace.',
        description: 'A Solo Leveling hero poster made for moody desk setups, LED rooms, and darker story walls.',
        highlight: 'Shadow army room glow',
        price: 17.49,
        image_url: '/images/solo-leveling-2.jpg',
        category: 'Poster',
        kind: 'poster',
        series: 'Solo Leveling',
        material: '300GSM matte print',
        accent: 'indigo',
        featured: true,
        tags: ['Solo Leveling', 'Poster', 'Featured'],
        stock: 19,
    },
    {
        slug: 'eren-final-signal',
        title: 'Eren Final Signal',
        subtitle: 'Tense framing and a colder apocalypse tone.',
        description: 'An Attack on Titan poster with enough scale and mood to carry a whole wall by itself.',
        highlight: 'Final season wall tension',
        price: 16.49,
        image_url: '/images/attack2.jpg',
        category: 'Poster',
        kind: 'poster',
        series: 'Attack on Titan',
        material: '300GSM matte print',
        accent: 'amber',
        featured: false,
        tags: ['Attack on Titan', 'Poster', 'Final Season'],
        stock: 10,
    },
    {
        slug: 'goku-ultra-aura',
        title: 'Goku Ultra Aura',
        subtitle: 'Silver-blue energy for bright anime walls.',
        description: 'A classic Dragon Ball flex print with enough contrast to work in gaming rooms and collector shelves.',
        highlight: 'Ultra instinct wall spark',
        price: 16.99,
        image_url: '/images/db1.jpg',
        category: 'Poster',
        kind: 'poster',
        series: 'Dragon Ball',
        material: '300GSM matte print',
        accent: 'yellow',
        featured: true,
        tags: ['Dragon Ball', 'Poster', 'Featured'],
        stock: 18,
    },
    {
        slug: 'hidden-leaf-chill-bottle',
        title: 'Hidden Leaf Chill Bottle',
        subtitle: 'A setup bottle with cleaner matte desk energy.',
        description: 'An insulated bottle for anime-heavy desks, library sessions, and creator setups that still want a styled accessory.',
        highlight: 'Desk setup bottle drop',
        price: 22.99,
        image_url: '/images/pexels-fotios-photos-4239023.jpg',
        category: 'Bottle',
        kind: 'product',
        series: 'Naruto',
        material: 'Insulated stainless steel',
        accent: 'orange',
        featured: true,
        tags: ['Naruto', 'Bottle', 'Desk Drop'],
        stock: 24,
    },
    {
        slug: 'shadow-monarch-oversized-tee',
        title: 'Shadow Monarch Oversized Tee',
        subtitle: 'Soft fit, loud print, easy streetwear pickup.',
        description: 'A Solo Leveling tee designed to look bold in real daylight, reels, and mirror shots.',
        highlight: 'Gen Z streetwear pickup',
        price: 28.99,
        image_url: '/images/2023-New-Solo-Leveling-T-Shirt-Cartoon-Anime-Men-3D-Printed-T-shirts-Casual-Harajuku-Summer.jpg',
        category: 'T-Shirt',
        kind: 'product',
        series: 'Solo Leveling',
        material: 'Oversized cotton blend',
        accent: 'indigo',
        featured: true,
        tags: ['Solo Leveling', 'T-Shirt', 'Streetwear'],
        stock: 20,
    },
    {
        slug: 'akatsuki-storm-duffle',
        title: 'Akatsuki Storm Duffle',
        subtitle: 'Travel-ready storage with anime gym energy.',
        description: 'A bold Naruto bag for campus, gym, or con runs with a louder merch presence than a basic tote.',
        highlight: 'Carry the fit with anime heat',
        price: 39.99,
        image_url: '/images/anime-gym-bag-856.webp',
        category: 'Bag',
        kind: 'product',
        series: 'Naruto',
        material: 'Water-resistant polyester',
        accent: 'orange',
        featured: true,
        tags: ['Naruto', 'Bag', 'Travel'],
        stock: 12,
    },
    {
        slug: 'jjk-crew-canvas-tote',
        title: 'JJK Crew Canvas Tote',
        subtitle: 'Daily-carry merch with lighter collector energy.',
        description: 'A sturdy canvas tote for manga runs, classes, and soft merch setups that still want character personality.',
        highlight: 'Soft carry, strong anime vibe',
        price: 24.99,
        image_url: '/images/il_fullxfull.6179809252_rkr4.webp',
        category: 'Bag',
        kind: 'product',
        series: 'Jujutsu Kaisen',
        material: 'Heavy canvas tote',
        accent: 'violet',
        featured: false,
        tags: ['Jujutsu Kaisen', 'Bag', 'Daily Carry'],
        stock: 16,
    },
    {
        slug: 'koi-metal-keychain',
        title: 'Koi Metal Keychain',
        subtitle: 'A small premium piece with a brushed metal finish.',
        description: 'Designed for keys, desk hooks, and bag clips, this is the accessory drop that makes a setup feel complete.',
        highlight: 'Small merch, premium finish',
        price: 14.99,
        image_url: '/images/pexels-coppertist-wu-313365563-15863770.jpg',
        category: 'Keychain',
        kind: 'product',
        series: 'Lifestyle',
        material: 'Metal alloy with plated ring',
        accent: 'slate',
        featured: false,
        tags: ['Lifestyle', 'Keychain', 'Desk Drop'],
        stock: 28,
    },
    {
        slug: 'silver-dragon-keychain',
        title: 'Silver Dragon Keychain',
        subtitle: 'Collector-style hardware with a sharper silhouette.',
        description: 'A polished metal keychain that works as a bag charm, key set flex, or shelf accent.',
        highlight: 'Pocket-size collector detail',
        price: 16.99,
        image_url: '/images/pexels-coppertist-wu-313365563-16329599.jpg',
        category: 'Keychain',
        kind: 'product',
        series: 'Lifestyle',
        material: 'Silver-tone metal',
        accent: 'slate',
        featured: true,
        tags: ['Lifestyle', 'Keychain', 'Featured'],
        stock: 22,
    },
    {
        slug: 'collector-manga-vol-01',
        title: 'Collector Manga Vol. 01',
        subtitle: 'Shelf-ready print with a clean front-face layout.',
        description: 'A starter manga pickup built for room shelves, reading stacks, and aesthetic flat-lays.',
        highlight: 'Shelf flex starts here',
        price: 14.49,
        image_url: '/images/9781974710027_p0_v1_s600x595.jpg',
        category: 'Manga',
        kind: 'product',
        series: 'Manga Shelf',
        material: 'Paperback edition',
        accent: 'emerald',
        featured: false,
        tags: ['Manga Shelf', 'Manga', 'Shelf Stack'],
        stock: 18,
    },
    {
        slug: 'collector-manga-vol-08',
        title: 'Collector Manga Vol. 08',
        subtitle: 'A brighter collector volume for cleaner shelf shots.',
        description: 'Built for stacked manga displays and clean bedside shelves, with a strong face-out cover look.',
        highlight: 'Collector stack upgrade',
        price: 15.49,
        image_url: '/images/9781975319434_p0_v1_s600x595.jpg',
        category: 'Manga',
        kind: 'product',
        series: 'Manga Shelf',
        material: 'Paperback edition',
        accent: 'emerald',
        featured: true,
        tags: ['Manga Shelf', 'Manga', 'Featured'],
        stock: 15,
    },
    {
        slug: 'shadow-figure-stand',
        title: 'Shadow Figure Stand',
        subtitle: 'Display merch for darker LED room setups.',
        description: 'A figure-style collectible with enough detail to anchor shelves around your poster wall.',
        highlight: 'Shelf hero for dark rooms',
        price: 49.99,
        image_url: '/images/1a8eb5185011365.655c82222e62f.jpg',
        category: 'Figure',
        kind: 'product',
        series: 'Solo Leveling',
        material: 'PVC display figure',
        accent: 'indigo',
        featured: true,
        tags: ['Solo Leveling', 'Figure', 'Featured'],
        stock: 8,
    },
    {
        slug: 'gallery-tapestry-drop',
        title: 'Gallery Tapestry Drop',
        subtitle: 'Large-format room texture for softer walls.',
        description: 'A fabric room piece for renters and creators who want art impact without a frame or pin-heavy install.',
        highlight: 'Soft wall texture, big vibe',
        price: 34.99,
        image_url: '/images/c3a12a6840654fa749a7b0346e1758e8.jpg',
        category: 'Accessory',
        kind: 'product',
        series: 'Room Setup',
        material: 'Printed wall tapestry',
        accent: 'fuchsia',
        featured: false,
        tags: ['Room Setup', 'Accessory', 'Wall Textile'],
        stock: 10,
    },
    {
        slug: 'ultra-aura-street-tee',
        title: 'Ultra Aura Street Tee',
        subtitle: 'Brighter print energy for louder anime fits.',
        description: 'A Dragon Ball tee with a fuller front hit that plays well in daylight and content shots.',
        highlight: 'Fit check with power-up energy',
        price: 32.99,
        image_url: '/images/F.webp',
        category: 'T-Shirt',
        kind: 'product',
        series: 'Dragon Ball',
        material: 'Premium cotton tee',
        accent: 'yellow',
        featured: true,
        tags: ['Dragon Ball', 'T-Shirt', 'Featured'],
        stock: 13,
    },
    {
        slug: 'clear-desk-bottle',
        title: 'Clear Desk Bottle',
        subtitle: 'Minimal hydration gear for clean setup shots.',
        description: 'A lighter bottle option for minimal desks, library days, and neutral room palettes.',
        highlight: 'Minimal desk-side flex',
        price: 18.99,
        image_url: '/images/pexels-minan1398-694740.jpg',
        category: 'Bottle',
        kind: 'product',
        series: 'Lifestyle',
        material: 'Glass bottle with sleeve',
        accent: 'slate',
        featured: false,
        tags: ['Lifestyle', 'Bottle', 'Minimal'],
        stock: 18,
    },
    {
        slug: 'collector-frame-kit',
        title: 'Collector Frame Kit',
        subtitle: 'A cleaner way to finish the wall without guessing.',
        description: 'A styled frame accessory for customers who want a finished room look around the print, not just the print alone.',
        highlight: 'Poster setup made cleaner',
        price: 44.99,
        image_url: '/images/b1ea0a281e520ee0b2849f11c9b60ed0.jpg',
        category: 'Accessory',
        kind: 'product',
        series: 'Poster Setup',
        material: 'Frame and mount kit',
        accent: 'cyan',
        featured: false,
        tags: ['Poster Setup', 'Accessory', 'Frame'],
        stock: 9,
    },
];

function slugify(input) {
    return String(input || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'product';
}

function normalizeTags(tags) {
    return Array.isArray(tags)
        ? tags.map((tag) => String(tag || '').trim()).filter(Boolean)
        : [];
}

function normalizeSizes(sizes, kind) {
    if (Array.isArray(sizes)) {
        return sizes.map((size) => String(size || '').trim()).filter(Boolean);
    }
    if (typeof sizes === 'string') {
        return sizes.split(',').map((size) => size.trim()).filter(Boolean);
    }
    return kind === 'poster' ? ['A4', 'A3', '12x18', '13x19'] : ['One Size'];
}

function parseBoolean(value) {
    if (value === undefined) return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value > 0;
    const normalized = String(value).trim().toLowerCase();
    return ['true', '1', 'yes', 'on'].includes(normalized);
}

function normalizeKind(kind, category) {
    const normalizedKind = String(kind || '').trim().toLowerCase();
    if (normalizedKind === 'poster' || normalizedKind === 'product') return normalizedKind;

    const normalizedCategory = String(category || '').trim().toLowerCase();
    return posterLikeCategories.has(normalizedCategory) ? 'poster' : 'product';
}

function normalizeAccent(accent, series, kind) {
    if (accent) return String(accent).trim().toLowerCase();
    return accentBySeries[series] || (kind === 'poster' ? 'indigo' : 'amber');
}

function seedKey(item) {
    return String(item.slug || `${item.title}__${item.image_url}`)
        .trim()
        .toLowerCase();
}

function normalizeImagePathForMatch(imagePath) {
    const normalized = String(imagePath || '').trim();
    if (!normalized) return '';

    const [pathname] = normalized.split('?');
    try {
        return decodeURIComponent(pathname).toLowerCase();
    } catch {
        return pathname.toLowerCase();
    }
}

function fileNameFromImageUrl(imageUrl) {
    const normalized = normalizeImagePathForMatch(imageUrl);
    if (!normalized) return '';
    const parts = normalized.split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1] : '';
}

function titleFromFilename(fileName) {
    const base = path.parse(fileName).name;
    const cleaned = base
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\b\d{2,6}\b/g, ' ')
        .trim();

    if (!cleaned) return 'Vault Poster';
    return cleaned
        .split(' ')
        .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : ''))
        .join(' ')
        .trim();
}

function inferSeriesFromText(text) {
    const lower = String(text || '').toLowerCase();

    if (/naruto|akatsuki|ichiraku|sage mode|hidden leaf/.test(lower)) return 'Naruto';
    if (/one\s?piece|luffy|straw\s?hat|zoro|sanji/.test(lower)) return 'One Piece';
    if (/demon\s?slayer|tanjiro|nezuko|rengoku|akaza/.test(lower)) return 'Demon Slayer';
    if (/jujutsu|gojo|sukuna|itadori|megumi|jjk/.test(lower)) return 'Jujutsu Kaisen';
    if (/solo\s?leveling|shadow monarch|jin\s?woo|sung\s?jin/.test(lower)) return 'Solo Leveling';
    if (/attack\s?on\s?titan|eren|levi|survey corps|aot/.test(lower)) return 'Attack on Titan';
    if (/dragon\s?ball|goku|vegeta|ultra instinct|dbz/.test(lower)) return 'Dragon Ball';
    if (/marvel|avengers|spider|captain|strange|loki|thanos|iron\s?man|thor|deadpool|wolverine/.test(lower)) return 'Marvel';
    if (/bike|superbike|motorcycle|ducati|yamaha|kawasaki|royal\s?enfield/.test(lower)) return 'Super Bikes';
    if (/car|ferrari|mustang|amg|porsche|bmw|nissan|supra|lamborghini|audi/.test(lower)) return 'Super Cars';
    if (/football|cricket|sport|f1|formula/.test(lower)) return 'Sports Icons';
    if (/cartoon|doraemon|shin|hattori|chibi|sanrio/.test(lower)) return 'Cartoon Classics';

    return 'Vault Select';
}

function arrayEquals(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    return a.every((value, index) => String(value) === String(b[index]));
}

function isAutoGeneratedCatalogItem(item) {
    const slug = String(item?.slug || '').trim().toLowerCase();
    const subtitle = String(item?.subtitle || '').trim().toLowerCase();
    return slug.startsWith('auto-') || subtitle.includes('auto-imported from uploaded image library');
}

function inferAutoCatalogMeta(fileName) {
    const lower = String(fileName || '')
        .toLowerCase()
        .replace(/%20/g, ' ')
        .replace(/[_-]+/g, ' ');
    const series = inferSeriesFromText(lower);

    if (/bag|backpack|purse|crossbody|duffle|tote|satchel|sling|wallet/.test(lower)) {
        return {
            category: 'Bag',
            kind: 'product',
            series: series === 'Vault Select' ? 'Lifestyle' : series,
            collection: 'Accessories',
            accent: 'amber',
            tags: ['Bag', 'Accessory'],
            material: 'Water-resistant polyester',
            price: 29.99,
        };
    }
    if (/t\s?-?shirt|tee|hoodie|jersey/.test(lower)) {
        return {
            category: 'T-Shirt',
            kind: 'product',
            series: series === 'Vault Select' ? 'Lifestyle' : series,
            collection: 'Apparel',
            accent: 'indigo',
            tags: ['T-Shirt', 'Apparel'],
            material: 'Cotton blend',
            price: 28.99,
        };
    }
    if (/bottle|flask|tumbler/.test(lower)) {
        return {
            category: 'Bottle',
            kind: 'product',
            series: series === 'Vault Select' ? 'Lifestyle' : series,
            collection: 'Desk Essentials',
            accent: 'emerald',
            tags: ['Bottle', 'Accessory'],
            material: 'Insulated stainless steel',
            price: 22.99,
        };
    }
    if (/keychain|key\s?ring|charm/.test(lower)) {
        return {
            category: 'Keychain',
            kind: 'product',
            series: series === 'Vault Select' ? 'Lifestyle' : series,
            collection: 'Accessories',
            accent: 'slate',
            tags: ['Keychain', 'Accessory'],
            material: 'Metal alloy',
            price: 14.99,
        };
    }
    if (/figure|figurine|statue|model|collectible/.test(lower)) {
        return {
            category: 'Figure',
            kind: 'product',
            series: series === 'Vault Select' ? 'Lifestyle' : series,
            collection: 'Collectibles',
            accent: 'fuchsia',
            tags: ['Figure', 'Collectible'],
            material: 'PVC display figure',
            price: 49.99,
        };
    }
    if (/manga|comic|volume|vol\.?\s?\d+/.test(lower)) {
        return {
            category: 'Manga',
            kind: 'product',
            series: 'Manga Shelf',
            collection: 'Manga Shelf',
            accent: 'emerald',
            tags: ['Manga', 'Reading'],
            material: 'Paperback edition',
            price: 14.99,
        };
    }
    if (/tapestry|frame|sticker|mouse\s?pad|desk\s?mat|accessory/.test(lower)) {
        return {
            category: 'Accessory',
            kind: 'product',
            series: series === 'Vault Select' ? 'Lifestyle' : series,
            collection: 'Accessories',
            accent: 'cyan',
            tags: ['Accessory'],
            material: 'Mixed accessory materials',
            price: 19.99,
        };
    }

    // Marketplace-style filenames often represent merch photos, not posters.
    if (/fullxfull|ul1500|ssll|_ac_|amazon|aoibox|imgrc|img\s?ca/.test(lower)) {
        return {
            category: 'Accessory',
            kind: 'product',
            series: series === 'Vault Select' ? 'Lifestyle' : series,
            collection: 'Accessories',
            accent: 'slate',
            tags: ['Accessory'],
            material: 'Curated accessory finish',
            price: 19.99,
        };
    }

    if (/marvel|avengers|spider|captain|strange|loki|thanos|iron\s?man|thor|deadpool|wolverine/.test(lower)) {
        return {
            category: 'Poster',
            kind: 'poster',
            series: 'Marvel',
            collection: 'Marvel Poster',
            accent: 'cyan',
            tags: ['Marvel', 'Poster', 'Superhero'],
            material: '300GSM matte print',
            price: 15.99,
        };
    }
    if (/bike|superbike|motorcycle|ducati|yamaha|kawasaki|royal\s?enfield/.test(lower)) {
        return {
            category: 'Poster',
            kind: 'poster',
            series: 'Super Bikes',
            collection: 'Bike Poster',
            accent: 'amber',
            tags: ['Bike', 'Poster', 'Motorcycle'],
            material: '300GSM matte print',
            price: 15.99,
        };
    }
    if (/car|ferrari|mustang|amg|porsche|bmw|nissan|supra|racing|lamborghini|audi/.test(lower)) {
        return {
            category: 'Poster',
            kind: 'poster',
            series: 'Super Cars',
            collection: 'Car Poster',
            accent: 'cyan',
            tags: ['Car', 'Poster', 'Automobile'],
            material: '300GSM matte print',
            price: 15.99,
        };
    }
    if (/football|cricket|sport|f1|formula/.test(lower)) {
        return {
            category: 'Poster',
            kind: 'poster',
            series: 'Sports Icons',
            collection: 'Sports Poster',
            accent: 'emerald',
            tags: ['Sports', 'Poster'],
            material: '300GSM matte print',
            price: 15.99,
        };
    }
    if (/cartoon|doraemon|shin|hattori|chibi|sanrio/.test(lower)) {
        return {
            category: 'Poster',
            kind: 'poster',
            series: 'Cartoon Classics',
            collection: 'Cartoon Poster',
            accent: 'fuchsia',
            tags: ['Cartoon', 'Poster', 'Animated'],
            material: '300GSM matte print',
            price: 15.99,
        };
    }
    if (/movie|cinema|hollywood|bollywood|film/.test(lower)) {
        return {
            category: 'Poster',
            kind: 'poster',
            series: 'Cinema Club',
            collection: 'Movie Poster',
            accent: 'indigo',
            tags: ['Movie', 'Poster'],
            material: '300GSM matte print',
            price: 15.99,
        };
    }
    if (/naruto|one piece|demon|jujutsu|gojo|sukuna|dragon ball|anime|otaku|solo leveling|attack|titan|nezuko/.test(lower)) {
        return {
            category: 'Poster',
            kind: 'poster',
            series: series === 'Vault Select' ? 'Anime Mix' : series,
            collection: 'Anime Poster',
            accent: 'violet',
            tags: ['Anime', 'Poster'],
            material: '300GSM matte print',
            price: 15.99,
        };
    }

    return {
        category: 'Poster',
        kind: 'poster',
        series: 'Vault Select',
        collection: 'Anime Poster',
        accent: 'indigo',
        tags: ['Poster'],
        material: '300GSM matte print',
        price: 15.99,
    };
}

function inferCatalogProfile(input = {}) {
    const tags = normalizeTags(input.tags);
    const imageFile = fileNameFromImageUrl(input.image_url || input.image || '');
    const source = [
        input.title,
        input.subtitle,
        input.description,
        input.category,
        input.kind,
        input.series,
        input.collection,
        imageFile,
        ...tags,
    ].join(' ');
    const inferred = inferAutoCatalogMeta(source);

    const preferredKind = String(input.kind || '').trim().toLowerCase();
    let kind = normalizeKind(preferredKind || inferred.kind, inferred.category);
    if (preferredKind === 'poster' && inferred.kind === 'product') {
        kind = 'product';
    }

    const inputCategory = String(input.category || '').trim();
    const inputCategoryPosterLike = posterLikeCategories.has(inputCategory.toLowerCase());
    const category = kind === 'poster'
        ? 'Poster'
        : ((inputCategory && !inputCategoryPosterLike ? inputCategory : '') || inferred.category || 'Accessory');

    const series = String(input.series || '').trim() || inferred.series || (kind === 'poster' ? 'Vault Select' : 'Lifestyle');
    const collection = String(input.collection || '').trim() || (kind === 'poster' ? inferred.collection : (inferred.collection || 'Accessories'));
    const material = String(input.material || '').trim() || inferred.material || (kind === 'poster' ? '300GSM matte print' : 'Curated merch finish');
    const accent = normalizeAccent(input.accent || inferred.accent, series, kind);
    const sizes = normalizeSizes(input.sizes, kind);

    return {
        kind,
        category,
        series,
        collection,
        material,
        accent,
        sizes,
        tags: tags.length ? tags : normalizeTags(inferred.tags),
    };
}

function shouldReclassifyRecord(record, profile, force) {
    if (force) return true;
    if (isAutoGeneratedCatalogItem(record)) return true;

    const currentKind = normalizeKind(record.kind, record.category);
    if (currentKind === 'poster' && profile.kind === 'product') return true;
    if (!String(record.collection || '').trim() || String(record.collection || '').trim() === 'Vault Select') return true;
    if (!String(record.series || '').trim() || String(record.series || '').trim() === 'Vault Select') return true;
    return false;
}

function applyCatalogProfile(record, profile) {
    const next = { ...record };
    next.kind = profile.kind;
    next.category = profile.category;
    next.series = profile.series;
    next.collection = profile.collection;
    next.material = profile.material;
    next.accent = profile.accent;
    next.sizes = profile.sizes;
    if (!normalizeTags(next.tags).length) {
        next.tags = profile.tags;
    }
    return next;
}

function dedupeCatalogEntries(items) {
    const entries = Array.isArray(items) ? items : [];
    const pick = new Map();

    for (const item of entries) {
        const imageKey = normalizeImagePathForMatch(item && item.image_url);
        const slugKey = String(item && item.slug ? item.slug : '').trim().toLowerCase();
        const key = imageKey || slugKey || String(item && item.id ? item.id : '').trim().toLowerCase();
        if (!key) continue;

        const current = pick.get(key);
        if (!current) {
            pick.set(key, item);
            continue;
        }

        const currentAuto = isAutoGeneratedCatalogItem(current);
        const nextAuto = isAutoGeneratedCatalogItem(item);
        if (currentAuto && !nextAuto) {
            pick.set(key, item);
            continue;
        }

        const currentFeatured = Boolean(current.featured);
        const nextFeatured = Boolean(item.featured);
        if (!currentFeatured && nextFeatured) {
            pick.set(key, item);
            continue;
        }

        const currentTime = current.createdAt ? new Date(current.createdAt).getTime() : 0;
        const nextTime = item.createdAt ? new Date(item.createdAt).getTime() : 0;
        if (nextTime > currentTime) {
            pick.set(key, item);
        }
    }

    return Array.from(pick.values());
}

async function buildAutoImageCatalog(existingCount) {
    let fileNames = [];

    try {
        fileNames = await fs.readdir(clientImagesDirPath);
    } catch {
        return [];
    }

    const imageFiles = fileNames
        .filter((name) => catalogImageExtensions.has(path.extname(name).toLowerCase()))
        .sort((a, b) => a.localeCompare(b));

    const now = Date.now();
    return imageFiles.map((fileName, index) => {
        const title = titleFromFilename(fileName);
        const slugBase = slugify(title);
        const hash = crypto.createHash('md5').update(fileName).digest('hex').slice(0, 6);
        const slug = `auto-${slugBase}-${hash}`;
        const image_url = `/images/${encodeURIComponent(fileName)}`;
        const inferred = inferAutoCatalogMeta(fileName);

        return {
            id: slug,
            slug,
            title,
            subtitle: 'Auto-imported from uploaded image library.',
            description: 'Generated catalog item from image assets uploaded to the storefront image folder.',
            highlight: 'Fresh upload added to vault',
            price: inferred.price,
            image_url,
            category: inferred.category,
            kind: inferred.kind,
            series: inferred.series,
            material: inferred.material,
            collection: inferred.collection,
            comparePrice: 0,
            sizes: normalizeSizes(undefined, inferred.kind),
            soldLastHours: 0,
            viewingNow: 0,
            sku: `${slug.toUpperCase()}-A4`,
            offerText: '',
            accent: inferred.accent,
            featured: false,
            tags: inferred.tags,
            stock: 12,
            createdAt: new Date(now - ((existingCount + index) * 60000)).toISOString(),
        };
    });
}

function normalizePoster(raw) {
    if (!raw) return null;

    const id = raw._id ? String(raw._id) : String(raw.id || raw.slug || crypto.randomUUID());
    const title = String(raw.title || '').trim();
    const rawCategory = String(raw.category || 'Poster').trim() || 'Poster';
    const normalizedRawKind = normalizeKind(raw.kind, rawCategory);
    const sourceToken = `${fileNameFromImageUrl(raw.image_url)} ${title}`.trim();
    const inferred = inferAutoCatalogMeta(sourceToken);
    const forceMerch = normalizedRawKind === 'poster' && inferred.kind === 'product';

    const category = forceMerch ? inferred.category : rawCategory;
    const kind = forceMerch ? 'product' : normalizeKind(raw.kind, category);
    const series = String(forceMerch ? inferred.series : (raw.series || 'Vault Select')).trim() || 'Vault Select';
    const createdAt = raw.createdAt ? new Date(raw.createdAt).toISOString() : undefined;

    return {
        id,
        slug: String(raw.slug || slugify(title)).trim() || slugify(title),
        title,
        subtitle: String(raw.subtitle || '').trim(),
        description: String(raw.description || '').trim(),
        highlight: String(raw.highlight || '').trim(),
        price: Number(raw.price || 0),
        image_url: String(raw.image_url || '').trim(),
        category,
        kind,
        series,
        material: String(raw.material || (forceMerch ? inferred.material : '')).trim(),
        collection: String(raw.collection || (forceMerch ? inferred.collection : series) || '').trim(),
        comparePrice: Number(raw.comparePrice || 0),
        sizes: normalizeSizes(raw.sizes, kind),
        soldLastHours: typeof raw.soldLastHours === 'number' ? raw.soldLastHours : Number(raw.soldLastHours || 0),
        viewingNow: typeof raw.viewingNow === 'number' ? raw.viewingNow : Number(raw.viewingNow || 0),
        sku: String(raw.sku || `${String(raw.slug || slugify(title)).toUpperCase()}-A4`).trim(),
        offerText: String(raw.offerText || '').trim(),
        accent: normalizeAccent(raw.accent || (forceMerch ? inferred.accent : ''), series, kind),
        featured: Boolean(raw.featured),
        tags: normalizeTags(raw.tags && raw.tags.length ? raw.tags : (forceMerch ? inferred.tags : [])),
        stock: typeof raw.stock === 'number' ? raw.stock : Number(raw.stock || 0),
        createdAt,
    };
}

function validatePayload(payload, { partial } = { partial: false }) {
    const data = payload || {};

    const required = ['title', 'price', 'image_url'];
    if (!partial) {
        for (const key of required) {
            if (data[key] === undefined || data[key] === null || data[key] === '') {
                throw new Error(`Missing field: ${key}`);
            }
        }
    }

    if (data.price !== undefined && (Number.isNaN(Number(data.price)) || Number(data.price) < 0)) {
        throw new Error('Invalid price');
    }
    if (data.stock !== undefined && (Number.isNaN(Number(data.stock)) || Number(data.stock) < 0)) {
        throw new Error('Invalid stock');
    }
    if (data.comparePrice !== undefined && (Number.isNaN(Number(data.comparePrice)) || Number(data.comparePrice) < 0)) {
        throw new Error('Invalid comparePrice');
    }
    if (data.soldLastHours !== undefined && (Number.isNaN(Number(data.soldLastHours)) || Number(data.soldLastHours) < 0)) {
        throw new Error('Invalid soldLastHours');
    }
    if (data.viewingNow !== undefined && (Number.isNaN(Number(data.viewingNow)) || Number(data.viewingNow) < 0)) {
        throw new Error('Invalid viewingNow');
    }
    if (data.tags !== undefined && !Array.isArray(data.tags)) {
        throw new Error('tags must be an array');
    }

    const title = data.title !== undefined ? String(data.title || '').trim() : undefined;
    const category = data.category !== undefined ? String(data.category || '').trim() || 'Poster' : undefined;
    const kind = normalizeKind(data.kind, category);
    const series = data.series !== undefined ? String(data.series || '').trim() || 'Vault Select' : undefined;

    return {
        title,
        slug: data.slug !== undefined ? slugify(data.slug) : (title ? slugify(title) : undefined),
        subtitle: data.subtitle !== undefined ? String(data.subtitle || '').trim() : undefined,
        description: data.description !== undefined ? String(data.description || '').trim() : undefined,
        highlight: data.highlight !== undefined ? String(data.highlight || '').trim() : undefined,
        price: data.price !== undefined ? Number(data.price) : undefined,
        image_url: data.image_url !== undefined ? String(data.image_url || '').trim() : undefined,
        category,
        kind,
        series,
        material: data.material !== undefined ? String(data.material || '').trim() : undefined,
        collection: data.collection !== undefined ? String(data.collection || '').trim() : undefined,
        comparePrice: data.comparePrice !== undefined ? Number(data.comparePrice) : undefined,
        sizes: data.sizes !== undefined ? normalizeSizes(data.sizes, kind) : undefined,
        soldLastHours: data.soldLastHours !== undefined ? Number(data.soldLastHours) : undefined,
        viewingNow: data.viewingNow !== undefined ? Number(data.viewingNow) : undefined,
        sku: data.sku !== undefined ? String(data.sku || '').trim() : undefined,
        offerText: data.offerText !== undefined ? String(data.offerText || '').trim() : undefined,
        accent: data.accent !== undefined ? normalizeAccent(data.accent, series, kind) : undefined,
        featured: parseBoolean(data.featured),
        tags: normalizeTags(data.tags),
        stock: data.stock !== undefined ? Number(data.stock) : undefined,
    };
}

async function ensureDataFile() {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });

    let exists = true;
    try {
        await fs.access(dataFilePath);
    } catch {
        exists = false;
    }

    if (!exists) {
        const seed = await buildSeedPosters();
        await fs.writeFile(dataFilePath, JSON.stringify(seed, null, 2), 'utf8');
        return;
    }

    try {
        const raw = JSON.parse(await fs.readFile(dataFilePath, 'utf8'));
        const current = Array.isArray(raw) ? raw : [];
        const seed = await buildSeedPosters();
        const autoCatalog = await buildAutoImageCatalog(current.length + seed.length);
        const have = new Set(current.map(seedKey));
        const haveImage = new Set(current.map((item) => normalizeImagePathForMatch(item.image_url)).filter(Boolean));
        let changed = false;

        for (const item of seed) {
            const key = seedKey(item);
            if (have.has(key)) continue;
            current.push(item);
            have.add(key);
            haveImage.add(normalizeImagePathForMatch(item.image_url));
            changed = true;
        }

        for (const item of autoCatalog) {
            const imageKey = normalizeImagePathForMatch(item.image_url);
            if (!imageKey || haveImage.has(imageKey)) continue;
            const key = seedKey(item);
            if (have.has(key)) continue;
            current.push(item);
            have.add(key);
            haveImage.add(imageKey);
            changed = true;
        }

        for (const item of current) {
            if (!isAutoGeneratedCatalogItem(item)) continue;

            const fileName = fileNameFromImageUrl(item.image_url);
            if (!fileName) continue;

            const inferred = inferAutoCatalogMeta(fileName);
            const nextKind = normalizeKind(inferred.kind, inferred.category);
            const nextSizes = normalizeSizes(item.sizes, nextKind);
            const nextAccent = normalizeAccent(inferred.accent, inferred.series, nextKind);
            const nextTags = normalizeTags(inferred.tags);

            const needsUpdate = item.category !== inferred.category
                || normalizeKind(item.kind, item.category) !== nextKind
                || String(item.series || '') !== inferred.series
                || String(item.collection || '') !== inferred.collection
                || String(item.material || '') !== inferred.material
                || String(item.accent || '') !== nextAccent
                || !arrayEquals(normalizeTags(item.tags), nextTags)
                || !arrayEquals(normalizeSizes(item.sizes, normalizeKind(item.kind, item.category)), nextSizes);

            if (!needsUpdate) continue;

            item.category = inferred.category;
            item.kind = nextKind;
            item.series = inferred.series;
            item.collection = inferred.collection;
            item.material = inferred.material;
            item.sizes = nextSizes;
            item.accent = nextAccent;
            item.tags = nextTags;
            changed = true;
        }

        if (changed) {
            await fs.writeFile(dataFilePath, JSON.stringify(current, null, 2), 'utf8');
        }
    } catch {
        const seed = await buildSeedPosters();
        await fs.writeFile(dataFilePath, JSON.stringify(seed, null, 2), 'utf8');
    }
}

async function buildSeedPosters() {
    const now = Date.now();
    const autoCatalog = await buildAutoImageCatalog(curatedCatalog.length);
    const mergedCatalog = curatedCatalog.concat(autoCatalog);

    return mergedCatalog.map((item, index) => {
        const kind = normalizeKind(item.kind, item.category);
        const series = item.series || 'Vault Select';
        return {
            id: item.slug,
            slug: item.slug,
            title: item.title,
            subtitle: item.subtitle || '',
            description: item.description || '',
            highlight: item.highlight || '',
            price: Number(item.price || 0),
            image_url: item.image_url,
            category: item.category || 'Poster',
            kind,
            series,
            material: item.material || '',
            collection: item.collection || series,
            comparePrice: Number(item.comparePrice || 0),
            sizes: normalizeSizes(item.sizes, kind),
            soldLastHours: typeof item.soldLastHours === 'number' ? item.soldLastHours : 0,
            viewingNow: typeof item.viewingNow === 'number' ? item.viewingNow : 0,
            sku: item.sku || `${String(item.slug || slugify(item.title)).toUpperCase()}-A4`,
            offerText: item.offerText || '',
            accent: normalizeAccent(item.accent, series, kind),
            featured: Boolean(item.featured),
            tags: normalizeTags(item.tags),
            stock: typeof item.stock === 'number' ? item.stock : 10,
            createdAt: new Date(now - (index * 60000)).toISOString(),
        };
    });
}

function createPosterRepository({ mode }) {
    if (mode === 'mongo') {
        return {
            async list() {
                const docs = await Poster.find().sort({ featured: -1, createdAt: -1 }).lean();
                return dedupeCatalogEntries(docs.map(normalizePoster));
            },
            async getById(id) {
                if (!id) return null;
                const doc = await Poster.findById(id).lean();
                return normalizePoster(doc);
            },
            async getBySlug(slug) {
                if (!slug) return null;
                const doc = await Poster.findOne({ slug: String(slug).trim() }).lean();
                return normalizePoster(doc);
            },
            async create(payload) {
                const data = validatePayload(payload, { partial: false });
                const created = await Poster.create({
                    title: data.title,
                    slug: data.slug,
                    subtitle: data.subtitle || '',
                    description: data.description || '',
                    highlight: data.highlight || '',
                    price: data.price,
                    image_url: data.image_url,
                    category: data.category || 'Poster',
                    kind: data.kind,
                    series: data.series || 'Vault Select',
                    material: data.material || '',
                    collection: data.collection || data.series || 'Vault Select',
                    comparePrice: Number(data.comparePrice || 0),
                    sizes: normalizeSizes(data.sizes, data.kind),
                    soldLastHours: typeof data.soldLastHours === 'number' ? data.soldLastHours : 0,
                    viewingNow: typeof data.viewingNow === 'number' ? data.viewingNow : 0,
                    sku: data.sku || `${String(data.slug || slugify(data.title)).toUpperCase()}-A4`,
                    offerText: data.offerText || '',
                    accent: normalizeAccent(data.accent, data.series || 'Vault Select', data.kind),
                    featured: Boolean(data.featured),
                    tags: normalizeTags(data.tags),
                    stock: typeof data.stock === 'number' ? data.stock : 10,
                });
                return normalizePoster(created.toObject());
            },
            async update(id, payload) {
                if (!id) return null;
                const data = validatePayload(payload, { partial: true });
                const update = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
                if (update.kind || update.category || update.series || update.accent) {
                    update.kind = normalizeKind(update.kind, update.category);
                    update.accent = normalizeAccent(update.accent, update.series || 'Vault Select', update.kind);
                }
                const updated = await Poster.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
                return normalizePoster(updated);
            },
            async classify(payload) {
                return inferCatalogProfile(payload || {});
            },
            async reclassifyAll(options = {}) {
                const force = Boolean(options.force);
                const docs = await Poster.find().lean();
                let updatedCount = 0;

                for (const doc of docs) {
                    const profile = inferCatalogProfile(doc);
                    if (!shouldReclassifyRecord(doc, profile, force)) continue;
                    const next = applyCatalogProfile(doc, profile);

                    const changed = String(doc.kind || '') !== String(next.kind || '')
                        || String(doc.category || '') !== String(next.category || '')
                        || String(doc.series || '') !== String(next.series || '')
                        || String(doc.collection || '') !== String(next.collection || '')
                        || String(doc.material || '') !== String(next.material || '')
                        || String(doc.accent || '') !== String(next.accent || '')
                        || !arrayEquals(normalizeSizes(doc.sizes, normalizeKind(doc.kind, doc.category)), normalizeSizes(next.sizes, next.kind));

                    if (!changed) continue;

                    await Poster.updateOne(
                        { _id: doc._id },
                        {
                            $set: {
                                kind: next.kind,
                                category: next.category,
                                series: next.series,
                                collection: next.collection,
                                material: next.material,
                                accent: next.accent,
                                sizes: normalizeSizes(next.sizes, next.kind),
                                tags: normalizeTags(next.tags),
                            },
                        }
                    );
                    updatedCount += 1;
                }

                return { updatedCount, mode: 'mongo' };
            },
            async remove(id) {
                if (!id) return false;
                const result = await Poster.deleteOne({ _id: id });
                return result.deletedCount > 0;
            },
        };
    }

    return {
        async list() {
            await ensureDataFile();
            const raw = JSON.parse(await fs.readFile(dataFilePath, 'utf8'));
            return dedupeCatalogEntries(raw.map(normalizePoster)).sort((a, b) => Number(b.featured) - Number(a.featured) || String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
        },
        async getById(id) {
            await ensureDataFile();
            const raw = JSON.parse(await fs.readFile(dataFilePath, 'utf8'));
            const found = raw.find((item) => String(item.id) === String(id));
            return normalizePoster(found);
        },
        async getBySlug(slug) {
            await ensureDataFile();
            const raw = JSON.parse(await fs.readFile(dataFilePath, 'utf8'));
            const found = raw.find((item) => String(item.slug || slugify(item.title)) === String(slug));
            return normalizePoster(found);
        },
        async create(payload) {
            await ensureDataFile();
            const data = validatePayload(payload, { partial: false });
            const raw = JSON.parse(await fs.readFile(dataFilePath, 'utf8'));
            const created = {
                id: crypto.randomUUID(),
                title: data.title,
                slug: data.slug,
                subtitle: data.subtitle || '',
                description: data.description || '',
                highlight: data.highlight || '',
                price: data.price,
                image_url: data.image_url,
                category: data.category || 'Poster',
                kind: data.kind,
                series: data.series || 'Vault Select',
                material: data.material || '',
                collection: data.collection || data.series || 'Vault Select',
                comparePrice: Number(data.comparePrice || 0),
                sizes: normalizeSizes(data.sizes, data.kind),
                soldLastHours: typeof data.soldLastHours === 'number' ? data.soldLastHours : 0,
                viewingNow: typeof data.viewingNow === 'number' ? data.viewingNow : 0,
                sku: data.sku || `${String(data.slug || slugify(data.title)).toUpperCase()}-A4`,
                offerText: data.offerText || '',
                accent: normalizeAccent(data.accent, data.series || 'Vault Select', data.kind),
                featured: Boolean(data.featured),
                tags: normalizeTags(data.tags),
                stock: typeof data.stock === 'number' ? data.stock : 10,
                createdAt: new Date().toISOString(),
            };
            raw.unshift(created);
            await fs.writeFile(dataFilePath, JSON.stringify(raw, null, 2), 'utf8');
            return normalizePoster(created);
        },
        async update(id, payload) {
            await ensureDataFile();
            const data = validatePayload(payload, { partial: true });
            const raw = JSON.parse(await fs.readFile(dataFilePath, 'utf8'));
            const index = raw.findIndex((item) => String(item.id) === String(id));
            if (index < 0) return null;

            const update = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
            if (update.kind || update.category || update.series || update.accent) {
                update.kind = normalizeKind(update.kind, update.category);
                update.accent = normalizeAccent(update.accent, update.series || raw[index].series || 'Vault Select', update.kind);
            }

            raw[index] = { ...raw[index], ...update };
            await fs.writeFile(dataFilePath, JSON.stringify(raw, null, 2), 'utf8');
            return normalizePoster(raw[index]);
        },
        async classify(payload) {
            return inferCatalogProfile(payload || {});
        },
        async reclassifyAll(options = {}) {
            await ensureDataFile();
            const force = Boolean(options.force);
            const raw = JSON.parse(await fs.readFile(dataFilePath, 'utf8'));
            let updatedCount = 0;

            for (let i = 0; i < raw.length; i += 1) {
                const item = raw[i];
                const profile = inferCatalogProfile(item);
                if (!shouldReclassifyRecord(item, profile, force)) continue;
                const next = applyCatalogProfile(item, profile);

                const changed = String(item.kind || '') !== String(next.kind || '')
                    || String(item.category || '') !== String(next.category || '')
                    || String(item.series || '') !== String(next.series || '')
                    || String(item.collection || '') !== String(next.collection || '')
                    || String(item.material || '') !== String(next.material || '')
                    || String(item.accent || '') !== String(next.accent || '')
                    || !arrayEquals(normalizeSizes(item.sizes, normalizeKind(item.kind, item.category)), normalizeSizes(next.sizes, next.kind));

                if (!changed) continue;

                raw[i] = {
                    ...item,
                    kind: next.kind,
                    category: next.category,
                    series: next.series,
                    collection: next.collection,
                    material: next.material,
                    accent: next.accent,
                    sizes: normalizeSizes(next.sizes, next.kind),
                    tags: normalizeTags(next.tags),
                };
                updatedCount += 1;
            }

            if (updatedCount > 0) {
                await fs.writeFile(dataFilePath, JSON.stringify(raw, null, 2), 'utf8');
            }

            return { updatedCount, mode: 'file' };
        },
        async remove(id) {
            await ensureDataFile();
            const raw = JSON.parse(await fs.readFile(dataFilePath, 'utf8'));
            const next = raw.filter((item) => String(item.id) !== String(id));
            if (next.length === raw.length) return false;
            await fs.writeFile(dataFilePath, JSON.stringify(next, null, 2), 'utf8');
            return true;
        },
    };
}

module.exports = { createPosterRepository, buildSeedPosters, slugify };


