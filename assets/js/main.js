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

window.Alpine = Alpine;
Alpine.start();