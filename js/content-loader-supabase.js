// Innholdslaster for Supabase og lokale JSON-filer
// Dette scriptet håndterer lasting av dynamisk innhold fra enten Supabase database eller lokale JSON-filer

// Globale variabler for caching og Supabase tilkobling
const contentCache = {}; // Cache for å lagre lastet innhold og unngå gjentatte forespørsler
let supabaseClient = null; // Supabase klient instans
let supabaseLoadAttempted = false; // Flag for å spore om vi har prøvd å laste Supabase

/**
 * Funksjon for å tømme innholdscachen
 * Brukes for å tvinge gjeninnlasting av innhold, nyttig under utvikling
 */
function clearContentCache() {
    // Sletter alle nøkler fra cache objektet
    Object.keys(contentCache).forEach(key => delete contentCache[key]);
    console.log('Content cache cleared - Innholdscache tømt');
}

// Gjør funksjonen tilgjengelig globalt for konsoll tilgang under utvikling
window.clearContentCache = clearContentCache;

/**
 * Funksjon for å laste innhold på nytt
 * Tømmer cache og laster alt innhold på nytt
 */
async function reloadContent() {
    clearContentCache(); // Tøm cache først
    await loadContent(); // Last inn alt innhold på nytt
    console.log('Content reloaded - Innhold lastet på nytt');
}

// Gjør funksjonen tilgjengelig globalt for konsoll tilgang
window.reloadContent = reloadContent;

/**
 * Sjekker om vi skal bypasse cache basert på URL parametere
 * @returns {boolean} true hvis cache skal bypasses
 */
function shouldBypassCache() {
    const urlParams = new URLSearchParams(window.location.search);
    // Returner true hvis 'nocache' eller 'refresh' parameter er satt i URL
    return urlParams.has('nocache') || urlParams.has('refresh');
}

/**
 * Sjekker om vi er i utviklingsmodus
 * @returns {boolean} true hvis vi kjører lokalt eller fra fil
 */
function isDevelopmentMode() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.protocol === 'file:';
}

/**
 * Dynamisk import av Supabase klienten
 * Prøver å laste Supabase klient, returnerer null hvis ikke tilgjengelig
 * 
 * @returns {Promise<SupabaseClient|null>} Supabase klienten eller null hvis ikke tilgjengelig
 */
async function getSupabaseClient() {
    // Hvis vi allerede har prøvd å laste Supabase klienten, returner den lagrede verdien
    if (supabaseLoadAttempted) {
        return supabaseClient;
    }

    // Marker at vi har prøvd å laste Supabase klienten
    supabaseLoadAttempted = true;

    try {
        // Dynamisk import av Supabase klienten fra lib mappen
        const { supabase } = await import('../lib/supabaseClient.js');
        // Lagre den importerte klienten
        supabaseClient = supabase;
        // Returner klienten
        return supabaseClient;
    } catch (error) {
        // Hvis dynamisk import mislykkes, returner null og bruk lokale filer
        console.log('Supabase client not available, will use local JSON files - Supabase klient ikke tilgjengelig, bruker lokale JSON filer');
        return null;
    }
}

/**
 * Laster innhold fra Supabase eller lokal fil med cache-busting
 * 
 * @param {string} filename - navnet på filen uten .json utvidelse
 * @returns {Promise<Object|null>} - innholdet som et objekt, eller null hvis lasting mislykkes
 */
async function loadContentFromSupabase(filename) {
    // Sjekk cache først med mindre vi skal bypasse cache
    if (!shouldBypassCache() && contentCache[filename]) {
        console.log(`Loading ${filename} from cache - Laster ${filename} fra cache`);
        return contentCache[filename];
    }
    
    // Hvis vi skal bypasse cache, fjern fra cache
    if (shouldBypassCache()) {
        delete contentCache[filename];
        console.log(`Cache bypassed for ${filename} - Cache hoppet over for ${filename}`);
    }
    
    // Sjekk om vi skal laste fra Supabase eller lokale filer
    // Sjekk URL parametere og utviklingsmodus
    const urlParams = new URLSearchParams(window.location.search);
    const useLocal = urlParams.has('useLocal') || (isDevelopmentMode() && !urlParams.has('useSupabase'));
    
    // Prøv å laste fra Supabase hvis ikke tvunget til lokale filer
    if (!useLocal) {
        const supabase = await getSupabaseClient();
        if (supabase) {
            try {
                console.log(`Attempting to load ${filename} from Supabase - Prøver å laste ${filename} fra Supabase`);
                // Hent data fra json_files tabellen i Supabase
                const { data, error } = await supabase
                    .from('json_files')
                    .select('content')
                    .eq('filename', filename)
                    .single();
                
                if (data && data.content) {
                    console.log(`Successfully loaded ${filename} from Supabase - Vellykket lasting av ${filename} fra Supabase`);
                    contentCache[filename] = data.content;
                    return data.content;
                }
            } catch (error) {
                console.log(`Supabase not available for ${filename}, loading from local file - Supabase ikke tilgjengelig for ${filename}, laster fra lokal fil`);
            }
        }
    }
    
    // Last fra lokal fil hvis Supabase ikke er tilgjengelig eller useLocal er satt
    try {
        console.log(`Loading ${filename} from local file - Laster ${filename} fra lokal fil`);
        // Legg til cache-busting parameter for å unngå browser cache
        const cacheBuster = shouldBypassCache() ? `?t=${Date.now()}` : `?v=${Math.floor(Date.now() / 1000)}`;
        const response = await fetch(`./assets/text/${filename}.json${cacheBuster}`, {
            cache: shouldBypassCache() ? 'no-cache' : 'no-store'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch ${filename}.json: ${response.status}`);
        }
        
        const content = await response.json();
        contentCache[filename] = content;
        console.log(`Successfully loaded ${filename} from local file - Vellykket lasting av ${filename} fra lokal fil`);
        return content;
    } catch (error) {
        console.error(`Error loading content for ${filename} - Feil ved lasting av innhold for ${filename}:`, error);
        return null;
    }
}

/**
 * Bestemmer hvilken innholdsfil som skal lastes basert på gjeldende side
 * 
 * @returns {string} navnet på innholdsfilen uten .json utvidelse
 */
function getContentFile() {
    const path = window.location.pathname || window.location.href;
    const currentPage = path.split('/').pop().split('?')[0]; // Fjern eventuelle URL parametere
    
    console.log('Current page detected - Gjeldende side oppdaget:', currentPage);
    
    // Returner riktig innholdsfil basert på side navn
    switch(currentPage) {
        case 'om-oss.html':
            return 'about'; // Om oss siden bruker about.json
        case 'sted.html':
            return 'location'; // Sted siden bruker location.json
        case 'kontakt.html':
            return 'contact-page'; // Kontakt siden bruker contact-page.json
        case 'index.html':
        case '':
        default:
            return 'content'; // Hovedsiden og default bruker content.json
    }
}

/**
 * Hovedfunksjon for innholdslasting
 * 
 * Laster innhold fra Supabase eller lokale JSON filer avhengig av gjeldende side
 * 
 * @returns {Promise<void>} - løses når innhold er lastet, avvises ved feil
 */
async function loadContent() {
    try {
        console.log('Loading content... - Laster innhold...');
        const contentFile = getContentFile();
        console.log('Content file - Innholdsfil:', contentFile);
        
        // Last inn innholdet fra valgt fil
        const content = await loadContentFromSupabase(contentFile);
        
        if (!content) {
            console.error('No content loaded for file - Ingen innhold lastet for fil:', contentFile);
            return;
        }
        
        console.log('Content loaded successfully - Innhold lastet vellykket:', content);
        
        // Bestem hvilken side vi er på og populer riktig innhold
        const path = window.location.pathname || window.location.href;
        const currentPage = path.split('/').pop().split('?')[0];
        
        // Kall riktig populer funksjon basert på side
        switch(currentPage) {
            case 'om-oss.html':
                populateAboutPage(content);
                break;
            case 'sted.html':
                populateLocationPage(content);
                break;
            case 'kontakt.html':
                populateContactPage(content);
                break;
            case 'index.html':
            case '':
            default:
                populateHomePage(content);
                break;
        }
        
        console.log('Content populated successfully - Innhold populert vellykket');
    } catch (error) {
        console.error('Error loading content - Feil ved lasting av innhold:', error);
        console.error('Stack trace:', error.stack);
    }
}

/**
 * Populerer felles elementer som finnes på alle sider
 * Dette inkluderer header, footer, navigasjon og nyhetsbrev
 * 
 * @param {Object} content - innholdsobjekt fra JSON fil
 */
function populateCommonElements(content) {
    // Announcement Bar - kunngjøringsbar øverst på siden
    const announcementBar = document.querySelector('.announcement-bar');
    if (announcementBar && content.announcement) {
        announcementBar.textContent = content.announcement;
    }

    // Navigation - hovednavigasjon
    // Sett nettstedstittel ved siden av logoen, uten å fjerne bilde
    const siteTitleEl = document.querySelector('.site-title');
    if (siteTitleEl && content.nav) {
        siteTitleEl.textContent = content.nav.siteTitle || '';
    }
    
    // Oppdater alle navigasjonslenker med riktig tekst
    const navLinks = document.querySelectorAll('.nav-menu li a');
    if (navLinks.length >= 5 && content.nav) {
        navLinks[0].textContent = content.nav.home; // Hjem lenke
        navLinks[1].textContent = content.nav.menu; // Meny lenke
        navLinks[2].textContent = content.nav.about; // Om oss lenke
        navLinks[3].textContent = content.nav.location; // Sted lenke
        navLinks[4].textContent = content.nav.contact; // Kontakt lenke
    }
    
    // Oppdater "Bestill bord" knappen i navigasjonen
    const bookTableBtn = document.querySelector('.nav-actions a');
    if (bookTableBtn && content.nav) {
        bookTableBtn.textContent = content.nav.bookTable;
    }

    // Footer - bunntekst med lenker og informasjon
    const footerSections = document.querySelectorAll('.footer-section');
    if (footerSections.length >= 4 && content.footer) {
        // Loop gjennom hver footer seksjon og sett innholdet
        content.footer.sections.forEach((section, index) => {
            if (footerSections[index]) {
                // Sett seksjonstittel
                const title = footerSections[index].querySelector('h3');
                if (title) title.textContent = section.title;
                
                // Sett alle lenker i seksjonen
                const links = footerSections[index].querySelectorAll('li');
                section.links.forEach((link, linkIndex) => {
                    if (links[linkIndex]) {
                        const anchor = links[linkIndex].querySelector('a');
                        if (anchor) {
                            // Hvis det er en lenke, sett tekst og URL
                            anchor.textContent = link.text;
                            anchor.href = link.url;
                        } else {
                            // Hvis det bare er tekst, sett tekst direkte
                            links[linkIndex].textContent = link.text;
                        }
                    }
                });
            }
        });

        // Newsletter - nyhetsbrev seksjon
        const newsletterTitle = document.querySelector('.newsletter h3');
        const newsletterDesc = document.querySelector('.newsletter p');
        const newsletterInput = document.querySelector('.newsletter input');
        const newsletterBtn = document.querySelector('.newsletter button');
        
        // Sett nyhetsbrev innhold hvis tilgjengelig
        if (newsletterTitle) newsletterTitle.textContent = content.footer.newsletter.title;
        if (newsletterDesc) newsletterDesc.textContent = content.footer.newsletter.description;
        if (newsletterInput) newsletterInput.placeholder = content.footer.newsletter.placeholder;
        if (newsletterBtn) newsletterBtn.textContent = content.footer.newsletter.button;
    }
}

/**
 * Populerer hovedsiden (index.html) med innhold
 * 
 * @param {Object} content - innholdsobjekt fra content.json
 */
function populateHomePage(content) {
    // Populer felles elementer først
    populateCommonElements(content);

    // Hero seksjon - hovedbanner øverst på siden
    const heroTitle = document.querySelector('.hero h1');
    const heroSubtitle = document.querySelector('.hero p');
    const heroCta = document.querySelector('.hero .cta-button');
    
    if (heroTitle && content.hero) heroTitle.textContent = content.hero.title;
    if (heroSubtitle && content.hero) heroSubtitle.textContent = content.hero.subtitle;
    if (heroCta && content.hero) heroCta.textContent = content.hero.cta;

    // Category cards - kategorikort som viser hovedkategorier
    const categoryCards = document.querySelectorAll('.category-card');
    if (content.categories) {
        content.categories.forEach((cat, index) => {
            if (categoryCards[index]) {
                const title = categoryCards[index].querySelector('h3');
                const desc = categoryCards[index].querySelector('p');
                const link = categoryCards[index].querySelector('.category-link');
                
                if (title) title.textContent = cat.title;
                if (desc) desc.textContent = cat.description;
                if (link) link.textContent = cat.link;
            }
        });
    }

    // Menu section - meny seksjon med utvalgte menyelementer
    const menuTitle = document.querySelector('.menu-section .section-title');
    const menuSubtitle = document.querySelector('.menu-section .section-subtitle');
    
    if (menuTitle && content.menu) menuTitle.textContent = content.menu.title;
    if (menuSubtitle && content.menu) menuSubtitle.textContent = content.menu.subtitle;

    // Populer meny kategorier og elementer
    const menuCategories = document.querySelectorAll('.menu-category');
    if (content.menu && content.menu.categories) {
        // Data for hver meny kategori (kaffe, bakeri, lunsj)
        const menuData = [
            content.menu.categories.coffee, 
            content.menu.categories.bakery, 
            content.menu.categories.lunch
        ];
        
        // Loop gjennom hver meny kategori og sett innholdet
        menuCategories.forEach((category, index) => {
            if (menuData[index]) {
                // Sett kategori tittel
                const categoryTitle = category.querySelector('h3');
                if (categoryTitle) categoryTitle.textContent = menuData[index].title;
                
                // Sett alle menyelementer i kategorien
                const menuItems = category.querySelectorAll('.menu-item');
                menuData[index].items.forEach((item, itemIndex) => {
                    if (menuItems[itemIndex]) {
                        const itemName = menuItems[itemIndex].querySelector('h4');
                        const itemPrice = menuItems[itemIndex].querySelector('.price');
                        
                        if (itemName) itemName.textContent = item.name;
                        if (itemPrice) itemPrice.textContent = item.price;
                    }
                });
            }
        });
    }

    // App section - call-to-action seksjon
    const ctaTitle = document.querySelector('.app-section h2');
    const ctaDesc = document.querySelector('.app-section p');
    const ctaBtn = document.querySelector('.app-section .cta-button');
    
    if (ctaTitle && content.cta) ctaTitle.textContent = content.cta.title;
    if (ctaDesc && content.cta) ctaDesc.textContent = content.cta.description;
    if (ctaBtn && content.cta) ctaBtn.textContent = content.cta.button;
}

/**
 * Populerer om oss siden (om-oss.html) med innhold
 * 
 * @param {Object} content - innholdsobjekt fra about.json
 */
function populateAboutPage(content) {
    populateCommonElements(content);

    if (!content.hero) return;

    // Hero seksjon for om oss siden
    const heroTitle = document.querySelector('.about-hero h1');
    const heroSubtitle = document.querySelector('.about-hero p');
    
    if (heroTitle) heroTitle.textContent = content.hero.title;
    if (heroSubtitle) heroSubtitle.textContent = content.hero.subtitle;

    // Vår historie seksjon
    if (content.story) {
        const storyTitle = document.querySelector('.about-story h2');
        const storyParagraphs = document.querySelectorAll('.about-story p');
        
        if (storyTitle) storyTitle.textContent = content.story.title;
        content.story.paragraphs.forEach((paragraph, index) => {
            if (storyParagraphs[index]) {
                storyParagraphs[index].textContent = paragraph;
            }
        });
    }

    // Våre verdier seksjon
    if (content.values) {
        const valuesTitle = document.querySelector('.about-values h2');
        const valueCards = document.querySelectorAll('.value-card');
        
        if (valuesTitle) valuesTitle.textContent = content.values.title;
        content.values.items.forEach((value, index) => {
            if (valueCards[index]) {
                const valueTitle = valueCards[index].querySelector('h3');
                const valueDesc = valueCards[index].querySelector('p');
                
                if (valueTitle) valueTitle.textContent = `${value.icon} ${value.title}`;
                if (valueDesc) valueDesc.textContent = value.description;
            }
        });
    }

    // Vårt team seksjon
    if (content.team) {
        const teamTitle = document.querySelector('.about-team h2');
        const teamMembers = document.querySelectorAll('.team-member');
        
        if (teamTitle) teamTitle.textContent = content.team.title;
        content.team.members.forEach((member, index) => {
            if (teamMembers[index]) {
                const memberName = teamMembers[index].querySelector('h3');
                const memberRole = teamMembers[index].querySelector('.role');
                const memberDesc = teamMembers[index].querySelector('p:not(.role)');
                
                if (memberName) memberName.textContent = member.name;
                if (memberRole) memberRole.textContent = member.role;
                if (memberDesc) memberDesc.textContent = member.description;
            }
        });
    }

    // Vårt oppdrag seksjon
    if (content.mission) {
        const missionTitle = document.querySelector('.about-mission h2');
        const missionParagraphs = document.querySelectorAll('.about-mission p');
        
        if (missionTitle) missionTitle.textContent = content.mission.title;
        content.mission.paragraphs.forEach((paragraph, index) => {
            if (missionParagraphs[index]) {
                missionParagraphs[index].textContent = paragraph;
            }
        });
    }
}

/**
 * Populerer sted siden (sted.html) med innhold
 * 
 * @param {Object} content - innholdsobjekt fra location.json
 */
function populateLocationPage(content) {
    populateCommonElements(content);

    if (!content.hero) return;

    // Hero seksjon for sted siden
    const heroTitle = document.querySelector('.location-hero h1');
    const heroSubtitle = document.querySelector('.location-hero p');
    
    if (heroTitle) heroTitle.textContent = content.hero.title;
    if (heroSubtitle) heroSubtitle.textContent = content.hero.subtitle;

    // Adresse informasjon
    if (content.address) {
        const addressTitle = document.querySelector('.location-info h2');
        const addressName = document.querySelector('.address-card h3');
        const addressStreet = document.querySelector('.address-card p:first-of-type');
        const phoneLink = document.querySelector('.address-card p:nth-of-type(2) a');
        const emailLink = document.querySelector('.address-card p:nth-of-type(3) a');
        
        if (addressTitle) addressTitle.textContent = content.address.title;
        if (addressName) addressName.textContent = content.address.name;
        if (addressStreet) addressStreet.innerHTML = `${content.address.street}<br>${content.address.city}`;
        if (phoneLink) {
            phoneLink.textContent = content.address.phone;
            phoneLink.href = content.address.phoneUrl;
        }
        if (emailLink) {
            emailLink.textContent = content.address.email;
            emailLink.href = content.address.emailUrl;
        }
    }

    // Åpningstider
    if (content.hours) {
        const hoursTitle = document.querySelector('.opening-hours h2');
        const dayHours = document.querySelectorAll('.day-hours');
        
        if (hoursTitle) hoursTitle.textContent = content.hours.title;
        content.hours.schedule.forEach((schedule, index) => {
            if (dayHours[index]) {
                const daySpan = dayHours[index].querySelector('.day');
                const hoursSpan = dayHours[index].querySelector('.hours');
                
                if (daySpan) daySpan.textContent = schedule.day;
                if (hoursSpan) hoursSpan.textContent = schedule.hours;
                
                // Legg til weekend klasse hvis det er helg
                if (schedule.weekend) {
                    dayHours[index].classList.add('weekend');
                }
            }
        });
    }

    // Stedets egenskaper
    if (content.features) {
        const featuresTitle = document.querySelector('.location-features h2');
        const featureCards = document.querySelectorAll('.feature-card');
        
        if (featuresTitle) featuresTitle.textContent = content.features.title;
        content.features.items.forEach((feature, index) => {
            if (featureCards[index]) {
                const featureTitle = featureCards[index].querySelector('h3');
                const featureDesc = featureCards[index].querySelector('p');
                
                if (featureTitle) featureTitle.textContent = `${feature.icon} ${feature.title}`;
                if (featureDesc) featureDesc.textContent = feature.description;
            }
        });
    }

    // Veibeskrivelse
    if (content.directions) {
        const directionsTitle = document.querySelector('.directions h2');
        const transportCards = document.querySelectorAll('.transport-card');
        
        if (directionsTitle) directionsTitle.textContent = content.directions.title;
        content.directions.transport.forEach((transport, index) => {
            if (transportCards[index]) {
                const transportTitle = transportCards[index].querySelector('h3');
                const transportOptions = transportCards[index].querySelectorAll('li');
                
                if (transportTitle) transportTitle.textContent = `${transport.icon} ${transport.title}`;
                transport.options.forEach((option, optionIndex) => {
                    if (transportOptions[optionIndex]) {
                        transportOptions[optionIndex].textContent = option;
                    }
                });
            }
        });
    }

    // Nærliggende steder
    if (content.nearby) {
        const nearbyTitle = document.querySelector('.nearby h2');
        const nearbyItems = document.querySelectorAll('.nearby-item');
        
        if (nearbyTitle) nearbyTitle.textContent = content.nearby.title;
        content.nearby.places.forEach((place, index) => {
            if (nearbyItems[index]) {
                const placeName = nearbyItems[index].querySelector('h3');
                const placeDesc = nearbyItems[index].querySelector('p');
                
                if (placeName) placeName.textContent = place.name;
                if (placeDesc) placeDesc.textContent = place.description;
            }
        });
    }

    // Kart seksjon
    if (content.map) {
        const mapTitle = document.querySelector('.map-section h2');
        const mapName = document.querySelector('.map-content h3');
        const mapAddress = document.querySelector('.map-content p:first-of-type strong');
        const mapDesc = document.querySelector('.map-content p:nth-of-type(2)');
        const mapAccess = document.querySelector('.map-content p:nth-of-type(3)');
        const mapLink = document.querySelector('.map-link');
        
        if (mapTitle) mapTitle.textContent = content.map.title;
        if (mapName) mapName.textContent = content.map.name;
        if (mapAddress) mapAddress.textContent = content.map.address;
        if (mapDesc) mapDesc.textContent = content.map.description;
        if (mapAccess) mapAccess.textContent = content.map.accessibility;
        if (mapLink) {
            mapLink.textContent = content.map.mapLinkText;
            mapLink.href = content.map.mapLink;
        }
    }
}

/**
 * Populerer kontakt siden (kontakt.html) med innhold
 * 
 * @param {Object} content - innholdsobjekt fra contact-page.json
 */
function populateContactPage(content) {
    populateCommonElements(content);

    if (!content.hero) return;

    // Hero seksjon for kontakt siden
    const heroTitle = document.querySelector('.contact-hero h1');
    const heroSubtitle = document.querySelector('.contact-hero p');
    
    if (heroTitle) heroTitle.textContent = content.hero.title;
    if (heroSubtitle) heroSubtitle.textContent = content.hero.subtitle;

    // Kontaktinformasjon
    if (content.contactInfo) {
        const contactTitle = document.querySelector('.contact-info h2');
        const contactItems = document.querySelectorAll('.contact-item');
        
        if (contactTitle) contactTitle.textContent = content.contactInfo.title;
        content.contactInfo.items.forEach((item, index) => {
            if (contactItems[index]) {
                const itemTitle = contactItems[index].querySelector('h3');
                const itemContent = contactItems[index].querySelector('p');
                
                if (itemTitle) itemTitle.textContent = `${item.icon} ${item.title}`;
                if (itemContent) {
                    if (item.url) {
                        // Hvis det er en lenke, oppdater lenken
                        const link = itemContent.querySelector('a');
                        if (link) {
                            link.textContent = item.content;
                            link.href = item.url;
                        }
                    } else {
                        // Hvis det bare er tekst, sett HTML innhold
                        itemContent.innerHTML = item.content;
                    }
                }
            }
        });
    }

    // Kontaktskjema
    if (content.contactForm) {
        const formTitle = document.querySelector('.contact-form-container h2');
        if (formTitle) formTitle.textContent = content.contactForm.title;

        // Oppdater alle skjema etiketter
        const nameLabel = document.querySelector('label[for="name"]');
        const emailLabel = document.querySelector('label[for="email"]');
        const phoneLabel = document.querySelector('label[for="phone"]');
        const subjectLabel = document.querySelector('label[for="subject"]');
        const messageLabel = document.querySelector('label[for="message"]');
        const submitBtn = document.querySelector('.submit-btn');
        
        if (nameLabel) nameLabel.textContent = content.contactForm.fields.name.label;
        if (emailLabel) emailLabel.textContent = content.contactForm.fields.email.label;
        if (phoneLabel) phoneLabel.textContent = content.contactForm.fields.phone.label;
        if (subjectLabel) subjectLabel.textContent = content.contactForm.fields.subject.label;
        if (messageLabel) messageLabel.textContent = content.contactForm.fields.message.label;
        if (submitBtn) submitBtn.textContent = content.contactForm.submitButton;

        // Oppdater dropdown alternativer for emne
        const subjectOptions = document.querySelectorAll('#subject option');
        content.contactForm.fields.subject.options.forEach((option, index) => {
            if (subjectOptions[index]) {
                subjectOptions[index].textContent = option.text;
                subjectOptions[index].value = option.value;
            }
        });
    }

    // Kart seksjon
    if (content.map) {
        const mapTitle = document.querySelector('.map-section h2');
        const mapContent = document.querySelectorAll('.map-placeholder p');
        
        if (mapTitle) mapTitle.textContent = content.map.title;
        content.map.content.forEach((text, index) => {
            if (mapContent[index]) {
                mapContent[index].textContent = text;
            }
        });
    }
}

// Start innholdslasting når DOM er klar
if (document.readyState === 'loading') {
    // DOM er ikke klar ennå, vent på DOMContentLoaded event
    document.addEventListener('DOMContentLoaded', loadContent);
} else {
    // DOM er allerede klar, start lasting umiddelbart
    loadContent();
}