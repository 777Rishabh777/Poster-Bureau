(function () {
    const API_ORIGIN = (location.origin && location.origin !== 'null') ? location.origin : 'http://localhost:5000';
    const API_URL = `${API_ORIGIN}/api`;

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderOffers(offers) {
        const track = document.getElementById('offers-track');
        if (!track) return;

        const activeOffers = (Array.isArray(offers) ? offers : [])
            .filter((offer) => offer && offer.active !== false && offer.text)
            .map((offer) => String(offer.text).trim())
            .filter(Boolean);

        if (!activeOffers.length) return;

        const looped = activeOffers.concat(activeOffers);
        track.innerHTML = looped.map((text, index) => {
            const label = `<span class="offer-item">${escapeHtml(text)}</span>`;
            const separator = index === looped.length - 1
                ? ''
                : `<span class="offer-item"><span class="sep">&middot;</span></span>`;
            return `${label}${separator}`;
        }).join('');
    }

    function renderWall(photos) {
        const wall = document.getElementById('customer-wall');
        if (!wall) return;

        const items = (Array.isArray(photos) ? photos : []).filter((photo) => photo && photo.url);
        if (!items.length) return;

        wall.innerHTML = items.slice(0, 16).map((photo) => `
            <div class="wall-photo rounded-xl">
                <img src="${escapeHtml(photo.url)}" alt="${escapeHtml(photo.alt || 'Customer wall setup')}" loading="lazy">
            </div>
        `).join('');
    }

    async function bootSiteContent() {
        try {
            const offersRes = await fetch(`${API_URL}/content/offers`);
            if (offersRes.ok) {
                const offers = await offersRes.json();
                renderOffers(offers);
            }
        } catch {
            // Leave static fallback markup in place.
        }

        try {
            const photosRes = await fetch(`${API_URL}/content/feedback-photos`);
            if (photosRes.ok) {
                const photos = await photosRes.json();
                renderWall(photos);
            }
        } catch {
            // Leave static fallback markup in place.
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootSiteContent);
    } else {
        bootSiteContent();
    }
})();

