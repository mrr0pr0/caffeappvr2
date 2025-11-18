// Mobile Menu Controller - Håndterer hamburger meny for mobile enheter
// Dette scriptet kontrollerer åpning og lukking av mobile navigasjonsmeny

// Venter til DOM er ferdig lastet før vi setter opp event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Henter hamburger knapp element (tre streker ikon)
    const hamburger = document.querySelector('.hamburger');
    // Henter mobile meny overlay som dekker hele skjermen
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    // Henter body element for å kontrollere scrolling
    const body = document.body;

    // Sjekker at både hamburger knapp og meny overlay finnes på siden
    if (hamburger && mobileMenuOverlay) {
        // Legger til click event listener på hamburger knappen
        hamburger.addEventListener('click', function() {
            // Toggle (av/på) active klasse på hamburger knappen for animasjon
            hamburger.classList.toggle('active');
            // Toggle (av/på) active klasse på meny overlay for å vise/skjule meny
            mobileMenuOverlay.classList.toggle('active');
            // Forhindrer scrolling på body når meny er åpen, tillater når lukket
            body.style.overflow = mobileMenuOverlay.classList.contains('active') ? 'hidden' : '';
        });

        // Henter alle navigasjonslenker inne i mobile menu overlay
        const mobileMenuLinks = mobileMenuOverlay.querySelectorAll('nav a');
        // Legger til click event listener på hver navigasjonslenke
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Når bruker klikker på en lenke, lukk menyen automatisk
                hamburger.classList.remove('active'); // Fjern active klasse fra hamburger
                mobileMenuOverlay.classList.remove('active'); // Fjern active klasse fra overlay
                body.style.overflow = ''; // Tillat scrolling igjen
            });
        });
    }
});

// Funksjon for å lage meny kort til mobil - denne er hentet fra et eldre prosjekt
// Denne kommentaren indikerer at det kan være mer funksjonalitet som ikke er implementert ennå