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

window.Alpine = Alpine;
Alpine.start();