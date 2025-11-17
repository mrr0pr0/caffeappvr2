document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const body = document.body;

    if (hamburger && mobileMenuOverlay) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            mobileMenuOverlay.classList.toggle('active');
            body.style.overflow = mobileMenuOverlay.classList.contains('active') ? 'hidden' : '';
        });

        const mobileMenuLinks = mobileMenuOverlay.querySelectorAll('nav a');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                mobileMenuOverlay.classList.remove('active');
                body.style.overflow = '';
            });
        });
    }
});

// funsjonen for å lage meny kort til mobil denne er hentet fra et eldre prosjekt