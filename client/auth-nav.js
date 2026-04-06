/**
 * Shared Auth + Navbar Script for The Poster Bureau
 * Checks login state via JWT in localStorage and shows "Hi, username 👋"
 * Include this script on every page.
 */

(function () {
    // Waving hand CSS injection
    const style = document.createElement('style');
    style.textContent = `
        @keyframes wave {
            0% { transform: rotate(0deg); }
            10% { transform: rotate(14deg); }
            20% { transform: rotate(-8deg); }
            30% { transform: rotate(14deg); }
            40% { transform: rotate(-4deg); }
            50% { transform: rotate(10deg); }
            60% { transform: rotate(0deg); }
            100% { transform: rotate(0deg); }
        }
        .wave-hand {
            display: inline-block;
            animation: wave 2.5s ease-in-out infinite;
            transform-origin: 70% 70%;
            font-size: 1.2em;
        }
        .auth-greeting {
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 700;
            font-size: 14px;
            text-decoration: none;
        }
        .auth-greeting .username {
            font-weight: 800;
        }
    `;
    document.head.appendChild(style);

    const TOKEN_KEY = 'bureau_user_token';

    // Decode JWT payload
    function decodeJwt(token) {
        try {
            const payload = token.split('.')[1];
            const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(json);
        } catch {
            return null;
        }
    }

    // Check auth state
    function checkAuth() {
        const authArea = document.getElementById('auth-area');
        if (!authArea) return;

        const token = localStorage.getItem(TOKEN_KEY);

        if (token) {
            const payload = decodeJwt(token);
            const name = (payload && payload.name) ? payload.name : (payload && payload.email) ? payload.email.split('@')[0] : 'User';

            // Determine text color based on parent context (dark hero vs light nav)
            const isDarkNav = authArea.classList.contains('text-slate-300');
            const textColor = isDarkNav ? 'color:#cbd5e1;' : 'color:#334155;';
            const accentColor = isDarkNav ? 'color:#a5b4fc;' : 'color:#4f46e5;';

            authArea.innerHTML = `
                <a href="account.html" class="auth-greeting" style="${textColor}">
                    <span>Hi,</span>
                    <span class="username" style="${accentColor}">${name}</span>
                    <span class="wave-hand">👋</span>
                </a>
            `;
        } else {
            // Not logged in — keep existing Login / Register link
            // (already set in HTML, but refresh just in case)
            const existingLink = authArea.querySelector('#auth-link');
            if (!existingLink) {
                const isDarkNav = authArea.classList.contains('text-slate-300');
                const linkClass = isDarkNav ? 'hover:text-white transition' : 'hover:text-indigo-600 transition font-semibold text-sm text-slate-700';
                authArea.innerHTML = `<a href="account.html" id="auth-link" class="${linkClass}">Login / Register</a>`;
            }
        }
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAuth);
    } else {
        checkAuth();
    }
})();

// ─── Help Center Dropdown: Click-to-toggle ───
(function () {
    function initHelpDropdown() {
        document.querySelectorAll('.help-trigger').forEach(trigger => {
            const btn = trigger.querySelector('button');
            if (!btn) return;

            // Click toggles the dropdown
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isOpen = trigger.classList.contains('open');
                // Close all others first
                document.querySelectorAll('.help-trigger.open').forEach(t => t.classList.remove('open'));
                if (!isOpen) trigger.classList.add('open');
            });
        });

        // Click outside closes any open dropdown
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.help-trigger')) {
                document.querySelectorAll('.help-trigger.open').forEach(t => t.classList.remove('open'));
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHelpDropdown);
    } else {
        initHelpDropdown();
    }
})();
