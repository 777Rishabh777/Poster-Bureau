(function () {
    const API_ORIGIN = (location.origin && location.origin !== 'null') ? location.origin : 'http://localhost:5000';
    const API_URL = `${API_ORIGIN}/api`;
    const CART_KEY = 'bureau_cart_v1';

    const accentHexMap = {
        orange: '#f97316',
        sky: '#0ea5e9',
        rose: '#f43f5e',
        violet: '#8b5cf6',
        indigo: '#4f46e5',
        amber: '#f59e0b',
        yellow: '#eab308',
        emerald: '#10b981',
        fuchsia: '#d946ef',
        cyan: '#06b6d4',
        slate: '#475569',
    };

    const posterLikeCategories = new Set(['anime', 'gaming', 'marvel', 'auto', 'general', 'poster', 'posters']);
    const merchTypeMap = {
        't shirts': 'T-Shirt',
        't-shirt': 'T-Shirt',
        tshirt: 'T-Shirt',
        tshirts: 'T-Shirt',
        bags: 'Bag',
        bottles: 'Bottle',
        keychains: 'Keychain',
        figures: 'Figure',
        accessories: 'Accessory',
        posters: 'Poster',
    };

    const seriesKeywords = [
        { name: 'Naruto', keys: ['naruto', 'ichiraku', 'akatsuki', 'sage mode', 'team 7', 'hidden leaf'] },
        { name: 'One Piece', keys: ['one piece', 'gear 5', 'straw hat', 'luffy'] },
        { name: 'Demon Slayer', keys: ['demon slayer', 'tanjiro', 'rengoku', 'nezuko', 'akaza'] },
        { name: 'Jujutsu Kaisen', keys: ['jujutsu', 'gojo', 'sukuna', 'jjk'] },
        { name: 'Solo Leveling', keys: ['solo leveling', 'shadow monarch', 'sung jin', 'jin-woo'] },
        { name: 'Attack on Titan', keys: ['attack on titan', 'eren', 'survey corps'] },
        { name: 'Dragon Ball', keys: ['dragon ball', 'goku', 'vegeta', 'ultra instinct'] },
        { name: 'Manga Shelf', keys: ['manga', 'collector manga'] },
        { name: 'Poster Setup', keys: ['frame', 'poster setup'] },
        { name: 'Room Setup', keys: ['tapestry', 'room setup'] },
        { name: 'Lifestyle', keys: ['keychain', 'bottle', 'desk', 'lifestyle'] },
    ];

    const fallbackCatalog = [
        {
            id: 'naruto-sage-mode-skyline',
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
            id: 'ichiraku-break-time-poster',
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
            id: 'team-7-rush-frame',
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
            id: 'gear-5-skybreak-poster',
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
            id: 'straw-hat-roll-call',
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
            id: 'tanjiro-water-burst',
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
            id: 'rengoku-flame-charge',
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
            id: 'gojo-infinity-glow',
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
            id: 'sukuna-domain-silence',
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
            id: 'shadow-monarch-rise',
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
            id: 'eren-final-signal',
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
            id: 'goku-ultra-aura',
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
            id: 'hidden-leaf-chill-bottle',
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
            id: 'shadow-monarch-oversized-tee',
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
            id: 'akatsuki-storm-duffle',
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
            id: 'jjk-crew-canvas-tote',
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
            id: 'koi-metal-keychain',
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
            id: 'silver-dragon-keychain',
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
            id: 'collector-manga-vol-01',
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
            id: 'collector-manga-vol-08',
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
            id: 'shadow-figure-stand',
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
            id: 'gallery-tapestry-drop',
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
            id: 'ultra-aura-street-tee',
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
            id: 'clear-desk-bottle',
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
            id: 'collector-frame-kit',
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

    function titleCase(value) {
        return String(value || '')
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');
    }

    function money(value) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2,
        }).format(Number(value || 0));
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

    function sourceText(raw) {
        const imagePath = String(raw.image_url || raw.image || '').replace(/[_-]+/g, ' ');
        return [
            raw.title,
            raw.subtitle,
            raw.description,
            raw.category,
            raw.kind,
            raw.series,
            raw.collection,
            imagePath,
            ...(Array.isArray(raw.tags) ? raw.tags : []),
        ].join(' ').toLowerCase();
    }

    function inferKindFromSource(raw) {
        const text = sourceText(raw);
        if (/bag|backpack|purse|crossbody|duffle|tote|satchel|sling|wallet/.test(text)) return 'product';
        if (/t\s?-?shirt|tee|hoodie|jersey/.test(text)) return 'product';
        if (/bottle|flask|tumbler/.test(text)) return 'product';
        if (/keychain|key\s?ring|charm/.test(text)) return 'product';
        if (/figure|figurine|statue|model|collectible/.test(text)) return 'product';
        if (/manga|comic|volume|vol\.?\s?\d+/.test(text)) return 'product';
        if (/tapestry|frame kit|sticker|mouse\s?pad|desk\s?mat|accessory/.test(text)) return 'product';
        return 'poster';
    }

    function inferCategoryFromSource(raw, kind) {
        if (kind === 'poster') return 'Poster';
        const text = sourceText(raw);
        if (/bag|backpack|purse|crossbody|duffle|tote|satchel|sling|wallet/.test(text)) return 'Bag';
        if (/t\s?-?shirt|tee|hoodie|jersey/.test(text)) return 'T-Shirt';
        if (/bottle|flask|tumbler/.test(text)) return 'Bottle';
        if (/keychain|key\s?ring|charm/.test(text)) return 'Keychain';
        if (/figure|figurine|statue|model|collectible/.test(text)) return 'Figure';
        if (/manga|comic|volume|vol\.?\s?\d+/.test(text)) return 'Manga';
        return 'Accessory';
    }

    function normalizeKind(raw) {
        const inferred = inferKindFromSource(raw);
        const explicit = String(raw.kind || '').trim().toLowerCase();
        if (explicit === 'poster' || explicit === 'product') {
            if (explicit === 'poster' && inferred === 'product') return 'product';
            return explicit;
        }

        const category = String(raw.category || '').trim().toLowerCase();
        if (posterLikeCategories.has(category)) return 'poster';

        const tags = normalizeTags(raw.tags).map((tag) => tag.toLowerCase());
        if (tags.includes('poster') && inferred !== 'product') return 'poster';
        return inferred;
    }

    function normalizeType(raw, kind) {
        if (kind === 'poster') return 'Poster';
        const inferredCategory = inferCategoryFromSource(raw, kind);
        const category = String(raw.category || inferredCategory || 'Accessory').trim().toLowerCase();
        return merchTypeMap[category] || titleCase(category || 'Accessory');
    }

    function inferSeries(raw, kind) {
        if (raw.series) return String(raw.series).trim();

        const haystack = [raw.title, raw.subtitle, raw.description, ...(raw.tags || [])]
            .join(' ')
            .toLowerCase();

        for (const entry of seriesKeywords) {
            if (entry.keys.some((key) => haystack.includes(key))) {
                return entry.name;
            }
        }

        if (kind === 'poster' && raw.category && !posterLikeCategories.has(String(raw.category).toLowerCase())) {
            return titleCase(raw.category);
        }

        return kind === 'poster' ? 'Vault Select' : 'Lifestyle';
    }

    function defaultMaterial(type, kind) {
        if (kind === 'poster') return '300GSM matte print';
        const materialMap = {
            'T-Shirt': 'Premium cotton blend',
            Bag: 'Structured carry fabric',
            Bottle: 'Insulated bottle finish',
            Keychain: 'Metal hardware',
            Manga: 'Paperback edition',
            Figure: 'Collector display material',
            Accessory: 'Curated room accessory',
        };
        return materialMap[type] || 'Curated merch finish';
    }

    function defaultSubtitle(kind, series, type) {
        if (kind === 'poster') return `${series} wall art with bold room energy.`;
        return `${series} ${type.toLowerCase()} drop for shelves, desks, and daily carry.`;
    }

    function defaultHighlight(kind, series, type) {
        if (kind === 'poster') return `${series} wall drop`;
        return `${series} ${type.toLowerCase()} flex`;
    }

    function normalizeProduct(raw) {
        const kind = normalizeKind(raw);
        const type = normalizeType(raw, kind);
        const series = inferSeries(raw, kind);
        const accent = String(raw.accent || '').trim().toLowerCase() || 'indigo';
        const tags = normalizeTags(raw.tags);
        const featured = Boolean(raw.featured) || tags.some((tag) => ['featured', 'new'].includes(tag.toLowerCase()));
        const title = String(raw.title || 'Untitled product').trim();
        const slug = String(raw.slug || slugify(title)).trim();

        return {
            id: String(raw.id || raw._id || slug),
            slug,
            title,
            subtitle: String(raw.subtitle || defaultSubtitle(kind, series, type)).trim(),
            description: String(raw.description || `${title} is a curated ${type.toLowerCase()} designed for collectors who want a cleaner, more story-driven room setup.`).trim(),
            highlight: String(raw.highlight || defaultHighlight(kind, series, type)).trim(),
            price: Number(raw.price || 0),
            image_url: String(raw.image_url || raw.image || '').trim(),
            category: String(raw.category || inferCategoryFromSource(raw, kind) || type).trim() || type,
            kind,
            type,
            series,
            collection: String(raw.collection || series).trim(),
            material: String(raw.material || defaultMaterial(type, kind)).trim(),
            comparePrice: Number(raw.comparePrice || 0),
            sizes: normalizeSizes(raw.sizes, kind),
            soldLastHours: typeof raw.soldLastHours === 'number' ? raw.soldLastHours : Number(raw.soldLastHours || 0),
            viewingNow: typeof raw.viewingNow === 'number' ? raw.viewingNow : Number(raw.viewingNow || 0),
            sku: String(raw.sku || `${slug.toUpperCase()}-A4`).trim(),
            offerText: String(raw.offerText || 'Free shipping on prepaid orders').trim(),
            accent,
            accentHex: accentHexMap[accent] || accentHexMap.indigo,
            featured,
            tags,
            stock: typeof raw.stock === 'number' ? raw.stock : Number(raw.stock || 0),
            createdAt: raw.createdAt || null,
            searchText: [title, series, type, String(raw.description || ''), tags.join(' ')].join(' ').toLowerCase(),
        };
    }

    function sortCatalog(items) {
        return [...items].sort((a, b) => {
            if (Number(b.featured) !== Number(a.featured)) return Number(b.featured) - Number(a.featured);
            if (a.kind !== b.kind) return a.kind === 'poster' ? -1 : 1;
            return a.title.localeCompare(b.title);
        });
    }

    function dedupeCatalog(items) {
        const pick = new Map();

        for (const item of (Array.isArray(items) ? items : [])) {
            const imageKey = String(item.image_url || '').trim().toLowerCase();
            const slugKey = String(item.slug || '').trim().toLowerCase();
            const key = imageKey || slugKey || String(item.id || '').trim().toLowerCase();
            if (!key) continue;

            const current = pick.get(key);
            if (!current) {
                pick.set(key, item);
                continue;
            }

            const currentAuto = String(current.slug || '').toLowerCase().startsWith('auto-');
            const nextAuto = String(item.slug || '').toLowerCase().startsWith('auto-');
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
        }

        return Array.from(pick.values());
    }

    async function fetchCatalog() {
        try {
            const response = await fetch(`${API_URL}/posters`);
            if (!response.ok) throw new Error('catalog unavailable');
            const items = await response.json();
            return sortCatalog(dedupeCatalog(items.map(normalizeProduct)));
        } catch {
            return sortCatalog(dedupeCatalog(fallbackCatalog.map(normalizeProduct)));
        }
    }

    async function fetchBySlug(slug) {
        if (!slug) return null;

        try {
            const response = await fetch(`${API_URL}/posters/slug/${encodeURIComponent(slug)}`);
            if (!response.ok) throw new Error('item unavailable');
            const item = await response.json();
            return normalizeProduct(item);
        } catch {
            const item = fallbackCatalog.find((entry) => entry.slug === slug);
            return item ? normalizeProduct(item) : null;
        }
    }

    async function fetchById(id) {
        if (!id) return null;

        try {
            const response = await fetch(`${API_URL}/posters/${encodeURIComponent(id)}`);
            if (!response.ok) throw new Error('item unavailable');
            const item = await response.json();
            return normalizeProduct(item);
        } catch {
            const item = fallbackCatalog.find((entry) => String(entry.id) === String(id));
            return item ? normalizeProduct(item) : null;
        }
    }

    function getPosters(items) {
        return items.filter((item) => item.kind === 'poster');
    }

    function getProducts(items) {
        return items.filter((item) => item.kind !== 'poster');
    }

    function getSeriesList(items, kind) {
        const filtered = kind ? items.filter((item) => item.kind === kind) : items;
        return [...new Set(filtered.map((item) => item.series).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    }

    function filterItems(items, { kind, series, type, query } = {}) {
        const normalizedQuery = String(query || '').trim().toLowerCase();
        return items.filter((item) => {
            if (kind && item.kind !== kind) return false;
            if (series && series !== 'All' && item.series !== series) return false;
            if (type && type !== 'All' && item.type !== type) return false;
            if (normalizedQuery && !item.searchText.includes(normalizedQuery)) return false;
            return true;
        });
    }

    function getCollectionItems(items, collection) {
        const target = String(collection || '').trim().toLowerCase();
        if (!target || target === 'all') return items;

        return items.filter((item) => {
            const c = String(item.collection || '').toLowerCase();
            const s = String(item.series || '').toLowerCase();
            const cat = String(item.category || '').toLowerCase();
            const tags = (item.tags || []).map((tag) => String(tag).toLowerCase());
            return c === target || s === target || cat === target || tags.includes(target);
        });
    }

    function buildProductUrl(item) {
        const slug = encodeURIComponent(item.slug || 'product');
        const id = encodeURIComponent(item.id || '');
        return `product.html?slug=${slug}${id ? `&id=${id}` : ''}`;
    }

    function readCart() {
        try {
            const raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
            return Array.isArray(raw) ? raw : [];
        } catch {
            return [];
        }
    }

    function writeCart(items) {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
    }

    function toCartLine(item, options = {}) {
        const selectedSize = String(options.size || item.size || '').trim();
        return {
            id: item.id,
            slug: item.slug,
            title: item.title,
            price: Number(item.price || 0),
            image_url: item.image_url,
            size: selectedSize || undefined,
        };
    }

    function addToCart(item, options = {}) {
        const cart = readCart();
        cart.push(toCartLine(item, options));
        writeCart(cart);
        return cart;
    }

    function removeCartIndex(index) {
        const cart = readCart();
        cart.splice(index, 1);
        writeCart(cart);
        return cart;
    }

    function cartSummary() {
        const cart = readCart();
        return {
            items: cart,
            count: cart.length,
            total: cart.reduce((sum, item) => sum + Number(item.price || 0), 0),
        };
    }

    window.BureauCatalog = {
        API_ORIGIN,
        API_URL,
        CART_KEY,
        accentHexMap,
        fallbackCatalog: fallbackCatalog.map(normalizeProduct),
        slugify,
        money,
        normalizeProduct,
        fetchCatalog,
        fetchById,
        fetchBySlug,
        getPosters,
        getProducts,
        getSeriesList,
        filterItems,
        getCollectionItems,
        buildProductUrl,
        readCart,
        writeCart,
        addToCart,
        removeCartIndex,
        cartSummary,
    };
})();
