// Add your javascript here
import Alpine from 'alpinejs';
import collapse from '@alpinejs/collapse';
import intersect from '@alpinejs/intersect'

Alpine.plugin(collapse);
Alpine.plugin(intersect);

Alpine.store('theme', {
    init() {
        this.isDark = (() => {
            if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
                return localStorage.getItem('theme') === 'dark';
            }
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return true;
            }
            return false;
        })();
    },

    isDark: false,

    toggle() {
        this.isDark = !this.isDark;
        localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
    },
});
window.openAvailabilityModal = function(){
    if(document.getElementById('availability-modal')){
        document.getElementById('availability-modal').classList.remove('hidden'); 
    }
    document.documentElement.classList.add('overflow-hidden');
    window.dispatchEvent(new CustomEvent('modal-open', {}));
}

window.closeAvailabilityModal = function(){
    window.dispatchEvent(new CustomEvent('modal-close', {}));
    setTimeout(function(){
        if(document.getElementById('availability-modal')){
            document.getElementById('availability-modal').classList.add('hidden'); 
        }
        document.documentElement.classList.remove('overflow-hidden');
    }, 300);
}

window.openContactModal = function(){
    document.getElementById('contact-modal').classList.remove('hidden'); 
    document.documentElement.classList.add('overflow-hidden');
    window.dispatchEvent(new CustomEvent('modal-open-contact', {}));
}

window.closeContactModal = function(){
    window.dispatchEvent(new CustomEvent('modal-close-contact', {}));
    setTimeout(function(){
        document.getElementById('contact-modal').classList.add('hidden'); 
        document.documentElement.classList.remove('overflow-hidden');
    }, 300);
}

window.elementScrolledIntoPosition = function(element){
    pushURLState(element.id);
}

window.pushURLState = function(href){
    // let newHref = href;
    
    // if(newHref == 'home'){
    //     newHref = '/';
    // }
    // if (!newHref.startsWith('/')) {
    //     newHref = '/' + newHref;
    // }
    // history.pushState(null, null, newHref);
}

window.setMenuItemHovered = function(name){
    window.dispatchEvent(new CustomEvent('set-hovered', { detail: { id: name }}));
}

window.setMenuItemHoverAndActive = function(name){
    window.dispatchEvent(new CustomEvent('set-hovered', { detail: { id: name }}));
    window.dispatchEvent(new CustomEvent('set-active', { detail: { id: name }}));
}

function initCookieConsent() {
    const root = document.querySelector('[data-cookie-consent]');
    if (!root) return;

    const storageKey = 'redwoodTreeCookieConsent';
    const policyVersion = 1;
    const maxAge = 180 * 24 * 60 * 60 * 1000;
    const banner = root.querySelector('[data-cookie-banner]');
    const settingsDialog = root.querySelector('[data-cookie-settings]');
    const settingsPanel = root.querySelector('.cookie-settings__panel');
    const status = root.querySelector('[data-cookie-status]');
    const toggles = Array.from(root.querySelectorAll('input[data-cookie-category]'));
    const gpcEnabled = navigator.globalPrivacyControl === true;
    const defaults = { necessary: true, functional: false, analytics: false, marketing: false };
    let preferences = { ...defaults };
    let savedPreferences = null;
    let settingsTrigger = null;

    function readPreferences() {
        try {
            const value = JSON.parse(localStorage.getItem(storageKey) || 'null');
            if (!value || value.version !== policyVersion || !value.savedAt || Date.now() - value.savedAt > maxAge) return null;
            return { ...defaults, ...value.categories, marketing: gpcEnabled ? false : Boolean(value.categories.marketing) };
        } catch (error) { return null; }
    }

    function writePreferences(categories) {
        try { localStorage.setItem(storageKey, JSON.stringify({ version: policyVersion, savedAt: Date.now(), categories })); } catch (error) {}
    }

    function activateScript(source) {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            Array.from(source.attributes).forEach((attribute) => {
                if (!['type', 'data-cookie-src', 'data-cookie-category'].includes(attribute.name)) script.setAttribute(attribute.name, attribute.value);
            });
            const externalSource = source.dataset.cookieSrc;
            if (externalSource) {
                script.src = externalSource;
                script.onload = resolve;
                script.onerror = resolve;
            } else {
                script.textContent = source.textContent;
            }
            script.dataset.cookieActivated = 'true';
            source.replaceWith(script);
            if (!externalSource) resolve();
        });
    }

    async function applyPreferences() {
        document.querySelectorAll('[data-cookie-src]:not(script)').forEach((element) => {
            const allowed = Boolean(preferences[element.dataset.cookieCategory]);
            if (allowed && !element.getAttribute('src')) element.setAttribute('src', element.dataset.cookieSrc);
            if (!allowed && element.getAttribute('src')) element.removeAttribute('src');
        });
        for (const script of Array.from(document.querySelectorAll('script[type="text/plain"][data-cookie-category]'))) {
            if (preferences[script.dataset.cookieCategory]) await activateScript(script);
        }
        document.querySelectorAll('[data-cookie-placeholder]').forEach((placeholder) => {
            placeholder.hidden = Boolean(preferences[placeholder.dataset.cookiePlaceholder]);
        });
        window.dispatchEvent(new CustomEvent('cookieconsentchange', { detail: { ...preferences, globalPrivacyControl: gpcEnabled } }));
    }

    function syncToggles() {
        toggles.forEach((toggle) => {
            const category = toggle.dataset.cookieCategory;
            toggle.checked = Boolean(preferences[category]);
            if (category === 'marketing') toggle.disabled = gpcEnabled;
        });
    }

    function showBanner() {
        root.hidden = false;
        banner.hidden = false;
        requestAnimationFrame(() => banner.querySelector('[data-cookie-action="reject"]').focus());
    }

    function hideBanner() {
        banner.hidden = true;
        if (settingsDialog.hidden) root.hidden = true;
    }

    function openSettings(trigger) {
        settingsTrigger = trigger instanceof HTMLElement ? trigger : document.activeElement;
        root.hidden = false;
        settingsDialog.hidden = false;
        syncToggles();
        document.body.classList.add('overflow-hidden');
        requestAnimationFrame(() => settingsPanel.focus());
    }

    function closeSettings() {
        settingsDialog.hidden = true;
        document.body.classList.remove('overflow-hidden');
        if (banner.hidden) root.hidden = true;
        if (settingsTrigger && typeof settingsTrigger.focus === 'function') settingsTrigger.focus();
    }

    async function commit(nextPreferences, message) {
        const previousPreferences = { ...preferences };
        preferences = { ...defaults, ...nextPreferences, marketing: gpcEnabled ? false : Boolean(nextPreferences.marketing) };
        const requiresReload = ['functional', 'analytics', 'marketing'].some((category) => previousPreferences[category] && !preferences[category]);
        savedPreferences = { ...preferences };
        writePreferences(preferences);
        syncToggles();
        await applyPreferences();
        hideBanner();
        closeSettings();
        status.textContent = message;
        if (requiresReload) window.location.reload();
    }

    document.addEventListener('click', (event) => {
        const settingsButton = event.target.closest('[data-cookie-settings-trigger]');
        if (settingsButton) { event.preventDefault(); openSettings(settingsButton); }
    });

    root.addEventListener('click', (event) => {
        const button = event.target.closest('[data-cookie-action]');
        if (!button) return;
        const action = button.dataset.cookieAction;
        if (action === 'accept') commit({ necessary: true, functional: true, analytics: true, marketing: !gpcEnabled }, 'Optional services accepted.');
        if (action === 'reject') commit(defaults, 'Optional services rejected.');
        if (action === 'settings') openSettings(button);
        if (action === 'close') closeSettings();
        if (action === 'save') {
            const selected = { ...defaults };
            toggles.forEach((toggle) => { selected[toggle.dataset.cookieCategory] = toggle.checked; });
            commit(selected, 'Privacy choices saved.');
        }
    });

    settingsPanel.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') { event.preventDefault(); closeSettings(); return; }
        if (event.key !== 'Tab') return;
        const focusable = Array.from(settingsPanel.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((element) => element.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });

    root.querySelectorAll('[data-cookie-gpc-message]').forEach((message) => { message.hidden = !gpcEnabled; });
    savedPreferences = readPreferences();
    if (savedPreferences) preferences = savedPreferences;
    syncToggles();
    applyPreferences();
    if (!savedPreferences) showBanner();
    window.RedwoodTreeCookieConsent = { openSettings: () => openSettings(document.activeElement), getPreferences: () => ({ ...preferences, globalPrivacyControl: gpcEnabled }) };
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initCookieConsent);
else initCookieConsent();

window.Alpine = Alpine;
Alpine.start();
