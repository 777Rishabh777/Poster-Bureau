(function () {
    const NAV_LINKS = [
        { key: 'story', label: 'Story', href: 'index.html', icon: 'fa-compass' },
        { key: 'vault', label: 'Poster Vault', href: 'collections.html', icon: 'fa-images' },
        { key: 'discover', label: 'Discover', href: 'discover.html', icon: 'fa-sparkles' },
        { key: 'store', label: 'Store', href: 'store.html', icon: 'fa-store' },
        { key: 'help', label: 'Help Center', href: 'help-center.html', icon: 'fa-life-ring' }
    ];

    const VAULT_MENU = [
        { label: 'All Posters', href: 'collections.html?collection=All' },
        { label: 'Anime Poster', href: 'collections.html?collection=Anime%20Poster' },
        { label: 'Car Poster', href: 'collections.html?collection=Car%20Poster' },
        { label: 'Bike Poster', href: 'collections.html?collection=Bike%20Poster' },
        { label: 'Marvel Poster', href: 'collections.html?collection=Marvel%20Poster' },
        { label: 'Cartoon Poster', href: 'collections.html?collection=Cartoon%20Poster' },
        { label: 'Movie Poster', href: 'collections.html?collection=Movie%20Poster' },
        { label: 'Sports Poster', href: 'collections.html?collection=Sports%20Poster' }
    ];

    const HELP_MENU = [
        { label: 'About Us', href: 'about.html' },
        { label: 'Contact Us', href: 'contact.html' },
        { label: 'Terms & Conditions', href: 'terms.html' },
        { label: 'Shipping & Cancellation', href: 'shipping.html' },
        { label: 'FAQs', href: 'faq.html' }
    ];

    function ensureToastHost() {
        let host = document.getElementById('bureau-toast-host');
        if (host) return host;

        host = document.createElement('div');
        host.id = 'bureau-toast-host';
        host.style.position = 'fixed';
        host.style.right = '20px';
        host.style.bottom = '20px';
        host.style.display = 'grid';
        host.style.gap = '12px';
        host.style.zIndex = '120';
        document.body.appendChild(host);
        return host;
    }

    function toast(message) {
        const host = ensureToastHost();
        const item = document.createElement('div');
        item.className = 'smoke-card';
        item.style.padding = '0.9rem 1rem';
        item.style.minWidth = '240px';
        item.style.maxWidth = '320px';
        item.innerHTML = `<div style="display:flex;align-items:center;gap:0.7rem;"><span class="pill" style="background:rgba(79,70,229,0.1);color:#4338ca;">Vault</span><span style="font-weight:800;color:#0f172a;">${message}</span></div>`;
        host.appendChild(item);
        requestAnimationFrame(() => {
            item.style.transform = 'translateY(0)';
            item.style.opacity = '1';
        });
        setTimeout(() => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(10px)';
            setTimeout(() => item.remove(), 220);
        }, 1800);
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderOffersToTrack(track, offers) {
        if (!track) return;
        const lines = (Array.isArray(offers) ? offers : [])
            .filter((offer) => offer && offer.active !== false && offer.text)
            .map((offer) => String(offer.text).trim())
            .filter(Boolean);

        const fallback = [
            'Free Delivery for Prepaid Orders',
            'Buy 4 Get 3 Free',
            'Premium 300GSM Museum Paper'
        ];

        const active = lines.length ? lines : fallback;
        const looped = active.concat(active);

        // Keep ticker visuals consistent even on pages that do not load storefront.css.
        const bar = track.parentElement;
        if (bar) {
            bar.style.background = 'linear-gradient(90deg, rgba(8, 17, 31, 0.98), rgba(30, 41, 59, 0.98), rgba(8, 17, 31, 0.98))';
            bar.style.color = '#e2e8f0';
            bar.style.overflow = 'hidden';
            bar.style.whiteSpace = 'nowrap';
            bar.style.position = 'sticky';
            bar.style.top = '0';
            bar.style.zIndex = '60';
        }
        track.style.display = 'flex';
        track.style.minWidth = 'max-content';
        track.style.animation = 'offersTicker 34s linear infinite';

        track.innerHTML = looped.map((text, index) => {
            const label = `<span class="offer-item" style="display:inline-flex;align-items:center;gap:0.55rem;padding:0 1.2rem;min-height:2.4rem;font-size:0.78rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;">${escapeHtml(text)}</span>`;
            const separator = index === looped.length - 1 ? '' : '<span class="offer-item" style="display:inline-flex;align-items:center;gap:0.55rem;padding:0 1.2rem;min-height:2.4rem;font-size:0.78rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;"><span class="sep" style="color:#f97316;">&middot;</span></span>';
            return `${label}${separator}`;
        }).join('');
    }

    async function ensureSharedOffers() {
        if (document.body && document.body.dataset.disableSharedOffers === 'true') return;

        let track = document.getElementById('offers-track');
        if (!track) {
            const bar = document.createElement('div');
            bar.className = 'offers-bar';
            bar.style.background = 'linear-gradient(90deg, rgba(8, 17, 31, 0.98), rgba(30, 41, 59, 0.98), rgba(8, 17, 31, 0.98))';
            bar.style.color = '#e2e8f0';
            bar.style.overflow = 'hidden';
            bar.style.whiteSpace = 'nowrap';
            bar.style.position = 'sticky';
            bar.style.top = '0';
            bar.style.zIndex = '60';
            bar.innerHTML = '<div class="offers-track" id="offers-track"></div>';
            document.body.insertBefore(bar, document.body.firstChild);
            track = document.getElementById('offers-track');
        }

        if (track) {
            track.style.display = 'flex';
            track.style.minWidth = 'max-content';
            track.style.animation = 'offersTicker 34s linear infinite';
        }

        if (!track || track.dataset.loaded === 'true') return;
        track.dataset.loaded = 'true';

        const apiOrigin = (location.origin && location.origin !== 'null') ? location.origin : 'http://localhost:5000';
        try {
            const response = await fetch(`${apiOrigin}/api/content/offers`);
            if (!response.ok) throw new Error('offers unavailable');
            const offers = await response.json();
            renderOffersToTrack(track, offers);
        } catch {
            renderOffersToTrack(track, []);
        }
    }

    function ensureSharedFooter() {
        if (document.querySelector('footer')) return;
        if (!document.body || !document.body.dataset.page) return;

        const footer = document.createElement('footer');
        footer.className = 'py-12 md:py-16 bureau-shared-footer';
        footer.innerHTML = `
            <div class="site-shell smoke-card p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div class="font-display text-2xl font-bold tracking-[-0.06em]">BUREAU.</div>
                    <p class="text-slate-500 mt-2">Poster vault, discovery, and merch all connected from one catalog.</p>
                </div>
                <div class="flex flex-wrap gap-3">
                    <a href="collections.html" class="action-btn secondary">Poster Vault</a>
                    <a href="discover.html" class="action-btn secondary">Discover</a>
                    <a href="store.html" class="action-btn">Store</a>
                </div>
            </div>
        `;
        document.body.appendChild(footer);
    }

    function renderNavLinks(currentKey, options = {}) {
        const mobile = options.mobile === true;
        return NAV_LINKS.map((link) => {
            const active = currentKey === link.key;

            if (link.key === 'vault') {
                if (mobile) {
                    return `
                        <div class="bureau-nav-dropdown-mobile ${active ? 'is-active' : ''}">
                            <a href="${link.href}" class="nav-link bureau-nav-link bureau-nav-link-mobile ${active ? 'is-active' : ''}" data-close-menu>
                                <i class="fa-solid ${link.icon} nav-link-icon" aria-hidden="true"></i>
                                <span>${link.label}</span>
                            </a>
                            <div class="bureau-nav-submenu-mobile">
                                ${VAULT_MENU.map((entry) => `<a href="${entry.href}" class="nav-link bureau-nav-link bureau-nav-link-mobile bureau-nav-sublink" data-close-menu>${entry.label}</a>`).join('')}
                            </div>
                        </div>
                    `;
                }

                return `
                    <div class="bureau-nav-dropdown ${active ? 'is-active' : ''}">
                        <button type="button" class="nav-link bureau-nav-link bureau-nav-dropdown-toggle ${active ? 'is-active' : ''}" data-nav-dropdown-toggle aria-expanded="false">
                            <i class="fa-solid ${link.icon} nav-link-icon" aria-hidden="true"></i>
                            <span>${link.label}</span>
                            <i class="fa-solid fa-angle-down bureau-nav-caret" aria-hidden="true"></i>
                        </button>
                        <div class="bureau-nav-dropdown-menu">
                            ${VAULT_MENU.map((entry) => `<a href="${entry.href}" class="bureau-nav-dropdown-item">${entry.label}</a>`).join('')}
                        </div>
                    </div>
                `;
            }

            if (link.key === 'help') {
                if (mobile) {
                    return `
                        <div class="bureau-nav-dropdown-mobile ${active ? 'is-active' : ''}">
                            <a href="${link.href}" class="nav-link bureau-nav-link bureau-nav-link-mobile ${active ? 'is-active' : ''}" data-close-menu>
                                <i class="fa-solid ${link.icon} nav-link-icon" aria-hidden="true"></i>
                                <span>${link.label}</span>
                            </a>
                            <div class="bureau-nav-submenu-mobile">
                                ${HELP_MENU.map((entry) => `<a href="${entry.href}" class="nav-link bureau-nav-link bureau-nav-link-mobile bureau-nav-sublink" data-close-menu>${entry.label}</a>`).join('')}
                            </div>
                        </div>
                    `;
                }

                return `
                    <div class="bureau-nav-dropdown ${active ? 'is-active' : ''}">
                        <button type="button" class="nav-link bureau-nav-link bureau-nav-dropdown-toggle ${active ? 'is-active' : ''}" data-nav-dropdown-toggle aria-expanded="false">
                            <i class="fa-solid ${link.icon} nav-link-icon" aria-hidden="true"></i>
                            <span>${link.label}</span>
                            <i class="fa-solid fa-angle-down bureau-nav-caret" aria-hidden="true"></i>
                        </button>
                        <div class="bureau-nav-dropdown-menu">
                            ${HELP_MENU.map((entry) => `<a href="${entry.href}" class="bureau-nav-dropdown-item">${entry.label}</a>`).join('')}
                        </div>
                    </div>
                `;
            }

            const classes = [
                'nav-link',
                'bureau-nav-link',
                active ? 'is-active' : '',
                mobile ? 'bureau-nav-link-mobile' : ''
            ].filter(Boolean).join(' ');
            const current = active ? ' aria-current="page"' : '';
            const close = mobile ? ' data-close-menu' : '';

            return `
                <a href="${link.href}" class="${classes}"${current}${close}>
                    <i class="fa-solid ${link.icon} nav-link-icon" aria-hidden="true"></i>
                    <span>${link.label}</span>
                </a>
            `;
        }).join('');
    }

    function hydrateNavigation(options = {}) {
        ensureSharedOffers();
        ensureSharedFooter();

        const current = options.current || document.body.dataset.page || '';
        const desktopHost = document.querySelector('[data-shared-nav]');
        const mobileHost = document.querySelector('[data-shared-mobile-nav]');

        if (desktopHost) {
            desktopHost.innerHTML = renderNavLinks(current);
        }

        if (mobileHost) {
            mobileHost.innerHTML = `
                ${renderNavLinks(current, { mobile: true })}
                <a href="account.html" data-close-menu class="nav-link bureau-nav-link bureau-nav-link-mobile font-bold">
                    <i class="fa-solid fa-user nav-link-icon" aria-hidden="true"></i>
                    <span>Account</span>
                </a>
            `;
        }

        const dropdowns = document.querySelectorAll('.bureau-nav-dropdown');
        dropdowns.forEach((dropdown) => {
            const toggle = dropdown.querySelector('[data-nav-dropdown-toggle]');
            if (!toggle) return;
            toggle.addEventListener('click', (event) => {
                event.preventDefault();
                const isOpen = dropdown.classList.contains('is-open');
                dropdowns.forEach((node) => {
                    node.classList.remove('is-open');
                    const btn = node.querySelector('[data-nav-dropdown-toggle]');
                    if (btn) btn.setAttribute('aria-expanded', 'false');
                });
                if (!isOpen) {
                    dropdown.classList.add('is-open');
                    toggle.setAttribute('aria-expanded', 'true');
                }
            });
        });

        document.addEventListener('click', (event) => {
            if (!event.target.closest('.bureau-nav-dropdown')) {
                dropdowns.forEach((node) => {
                    node.classList.remove('is-open');
                    const btn = node.querySelector('[data-nav-dropdown-toggle]');
                    if (btn) btn.setAttribute('aria-expanded', 'false');
                });
            }
        });
    }

    function mountSharedNavShell(options = {}) {
        const host = document.querySelector('[data-shared-nav-shell]');
        if (!host) {
            hydrateNavigation(options);
            mountMobileMenu();
            return mountCart();
        }

        host.innerHTML = `
            <div class="site-shell pt-4">
                <nav class="glass-nav rounded-[28px] px-4 md:px-6 py-3 flex items-center justify-between gap-4 sticky top-4 z-50">
                    <a href="index.html" class="font-display text-xl md:text-2xl font-bold tracking-[-0.08em] text-slate-950">BUREAU.</a>
                    <div class="hidden lg:flex items-center gap-2 text-sm font-bold" data-shared-nav></div>
                    <div class="flex items-center gap-2 md:gap-3">
                        <div id="auth-area" class="hidden md:flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <a href="account.html" id="auth-link" class="nav-link">Login / Register</a>
                        </div>
                        <button id="mobile-menu-open" class="icon-btn lg:hidden" aria-label="Open menu"><i class="fas fa-bars"></i></button>
                        <button class="icon-btn relative" type="button" data-cart-toggle aria-label="Open cart">
                            <i class="fas fa-bag-shopping"></i>
                            <span id="cart-count" class="absolute -right-1 -top-1 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-black flex items-center justify-center">0</span>
                        </button>
                    </div>
                </nav>
            </div>

            <div id="mobile-menu-overlay" class="hidden fixed inset-0 bg-slate-950/40 z-[65]"></div>
            <aside id="mobile-menu-panel" class="fixed top-0 right-0 h-full w-[88vw] max-w-sm translate-x-full transition-transform duration-300 z-[75] bg-white border-l border-slate-200 shadow-2xl p-5 flex flex-col gap-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div class="font-display text-xl font-bold tracking-[-0.08em]">BUREAU.</div>
                    <button id="mobile-menu-close" class="icon-btn" type="button" aria-label="Close menu"><i class="fas fa-xmark"></i></button>
                </div>
                <div data-shared-mobile-nav class="flex flex-col gap-1"></div>
            </aside>

            <div id="cart-backdrop" class="cart-backdrop"></div>
            <aside id="cart-panel" class="cart-panel">
                <div class="h-full bg-white border-l border-slate-200 shadow-2xl p-5 flex flex-col gap-4">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div>
                            <div class="section-kicker">Cart</div>
                            <h2 class="font-display text-2xl font-bold mt-3 tracking-[-0.05em]">Your setup bag</h2>
                        </div>
                        <button type="button" class="icon-btn" data-cart-close aria-label="Close cart"><i class="fas fa-xmark"></i></button>
                    </div>
                    <div id="cart-items" class="flex-1 overflow-y-auto space-y-3 pr-1"></div>
                    <div class="smoke-card p-4">
                        <div class="flex items-center justify-between text-sm font-bold text-slate-500 uppercase tracking-[0.16em]">
                            <span>Subtotal</span>
                            <span id="cart-total">$0.00</span>
                        </div>
                        <a href="checkout.html" class="action-btn w-full mt-4">Checkout</a>
                    </div>
                </div>
            </aside>
        `;

        hydrateNavigation(options);
        mountMobileMenu();
        return mountCart();
    }

    function itemIconClass(item) {
        const type = String(item && (item.type || item.kind || '')).toLowerCase();
        if (item && item.kind === 'poster') return 'fa-image';
        if (type.includes('manga')) return 'fa-book-open';
        if (type.includes('shirt') || type.includes('tee')) return 'fa-shirt';
        if (type.includes('bag') || type.includes('tote')) return 'fa-bag-shopping';
        if (type.includes('bottle')) return 'fa-bottle-water';
        if (type.includes('key')) return 'fa-key';
        if (type.includes('figure')) return 'fa-cube';
        return 'fa-star';
    }

    function mountMobileMenu(options = {}) {
        const openId = options.openId || 'mobile-menu-open';
        const closeId = options.closeId || 'mobile-menu-close';
        const overlayId = options.overlayId || 'mobile-menu-overlay';
        const panelId = options.panelId || 'mobile-menu-panel';
        const openButton = document.getElementById(openId);
        const closeButton = document.getElementById(closeId);
        const overlay = document.getElementById(overlayId);
        const panel = document.getElementById(panelId);
        if (!openButton || !closeButton || !overlay || !panel) return;

        function openMenu() {
            overlay.classList.remove('hidden');
            panel.classList.remove('translate-x-full');
            document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
            overlay.classList.add('hidden');
            panel.classList.add('translate-x-full');
            document.body.style.overflow = '';
        }

        openButton.addEventListener('click', openMenu);
        closeButton.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);
        panel.querySelectorAll('[data-close-menu]').forEach((link) => link.addEventListener('click', closeMenu));

        return { openMenu, closeMenu };
    }

    function mountTiltCards(selector = '.tilt-card') {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        document.querySelectorAll(selector).forEach((card) => {
            let frame = null;

            function reset() {
                card.style.transform = '';
            }

            card.addEventListener('pointermove', (event) => {
                const bounds = card.getBoundingClientRect();
                const x = (event.clientX - bounds.left) / bounds.width;
                const y = (event.clientY - bounds.top) / bounds.height;
                const rotateY = (x - 0.5) * 10;
                const rotateX = (0.5 - y) * 10;

                if (frame) cancelAnimationFrame(frame);
                frame = requestAnimationFrame(() => {
                    card.style.transform = `perspective(1400px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
                });
            });

            card.addEventListener('pointerleave', reset);
            card.addEventListener('pointercancel', reset);
        });
    }

    function mountCart(options = {}) {
        const toggleSelector = options.toggleSelector || '[data-cart-toggle]';
        const backdropId = options.backdropId || 'cart-backdrop';
        const panelId = options.panelId || 'cart-panel';
        const countId = options.countId || 'cart-count';
        const itemsId = options.itemsId || 'cart-items';
        const totalId = options.totalId || 'cart-total';
        const backdrop = document.getElementById(backdropId);
        const panel = document.getElementById(panelId);
        const count = document.getElementById(countId);
        const items = document.getElementById(itemsId);
        const total = document.getElementById(totalId);
        if (!backdrop || !panel || !count || !items || !total) return null;

        function openCart() {
            backdrop.classList.add('open');
            panel.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function closeCart() {
            backdrop.classList.remove('open');
            panel.classList.remove('open');
            document.body.style.overflow = '';
        }

        function render() {
            const summary = window.BureauCatalog.cartSummary();
            count.textContent = String(summary.count);
            total.textContent = window.BureauCatalog.money(summary.total);

            if (!summary.items.length) {
                items.innerHTML = '<div class="empty-card" style="padding:1.5rem;">Your cart is empty. Build a better wall first.</div>';
                return summary;
            }

            items.innerHTML = summary.items.map((item, index) => `
                <div class="smoke-card" style="padding:1rem;display:flex;gap:0.9rem;align-items:center;">
                    <img src="${item.image_url || ''}" alt="${item.title}" style="width:64px;height:64px;border-radius:18px;object-fit:cover;">
                    <div style="flex:1;min-width:0;">
                        <div style="font-weight:800;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.title}</div>
                        <div style="color:#64748b;font-size:0.9rem;">${window.BureauCatalog.money(item.price)}</div>
                        ${item.size ? `<div style="color:#64748b;font-size:0.76rem;font-weight:700;">Size: ${item.size}</div>` : ''}
                    </div>
                    <button type="button" data-cart-remove="${index}" class="icon-btn" style="width:2.5rem;height:2.5rem;">&times;</button>
                </div>
            `).join('');

            items.querySelectorAll('[data-cart-remove]').forEach((button) => {
                button.addEventListener('click', () => {
                    window.BureauCatalog.removeCartIndex(Number(button.getAttribute('data-cart-remove')));
                    render();
                });
            });

            return summary;
        }

        function add(item, addOptions = {}) {
            const open = addOptions.open !== false;
            window.BureauCatalog.addToCart(item, { size: addOptions.size || '' });
            render();
            toast(`${item.title} added to cart`);
            if (open) openCart();
        }

        backdrop.addEventListener('click', closeCart);
        document.querySelectorAll(toggleSelector).forEach((button) => button.addEventListener('click', openCart));
        panel.querySelectorAll('[data-cart-close]').forEach((button) => button.addEventListener('click', closeCart));
        render();

        return { openCart, closeCart, render, add };
    }

    window.BureauUI = {
        toast,
        hydrateNavigation,
        ensureSharedOffers,
        ensureSharedFooter,
        mountSharedNavShell,
        itemIconClass,
        mountMobileMenu,
        mountTiltCards,
        mountCart
    };

    window.posterBureauMountNav = function posterBureauMountNav(options = {}) {
        return mountSharedNavShell(options);
    };
})();
