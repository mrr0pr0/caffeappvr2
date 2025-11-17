// gloale variabler
const contentCache = {};
let supabaseClient = null;
let supabaseLoadAttempted = false;

// Funksjon for å tømme innholdscachen for raks editor av tekst
function clearContentCache() {
    Object.keys(contentCache).forEach(key => delete contentCache[key]);
    console.log('Content cache cleared');
}

// lager det tilgjengelig globalt for konsoll tilgang
window.clearContentCache = clearContentCache;

// funksjon for å laste innhold på nytt
async function reloadContent() {
    clearContentCache();
    await loadContent();
    console.log('Content reloaded');
}

// gjør funksjonen tilgjengelig globalt for konsoll tilgang
window.reloadContent = reloadContent;

// ser om det er nødvendig a laste innhold på nytt eller bypasse cache
function shouldBypassCache() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('nocache') || urlParams.has('refresh');
}

// sjekker om vi er i utviklings modus (localhost eller file://)
function isDevelopmentMode() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.protocol === 'file:';
}

/**
 * dynamisk import av Supabase klienten
 * 
 * hvis imorten mislykkes, returner null
 * 
 * @returns {Promise<SupabaseClient|null>} Supabase klienten eller null hvis ikke tilgjengelig
 */
async function getSupabaseClient() {
    // hvis vi allerede har prøvd å laste Supabase klienten, returner den lagrede verdien
    if (supabaseLoadAttempted) {
        return supabaseClient;
    }

    // marker at vi har prøvd å laste Supabase klienten
    supabaseLoadAttempted = true;

    try {
        // dynamisk import av Supabase klienten
        const { supabase } = await import('../lib/supabaseClient.js');
        // lagre den importerte klienten
        supabaseClient = supabase;
        // returner klienten
        return supabaseClient;
    } catch (error) {
        // hvis dynamisk import mislykkes, returner null
        console.log('Supabase client not available, will use local JSON files');
        return null;
    }
}

/**
 * laster innhold fra Supabase eller lokal fil med cache-busting
 * 
 * @param {string} filename - navnet på filen uten .json
 * @returns {Promise<Object|null>} - innholdet som et objekt, eller null hvis lasting mislykkes
 */
async function loadContentFromSupabase(filename) {
    // sjekk cache først med mindre vi skal bypasse cache
    if (!shouldBypassCache() && contentCache[filename]) {
        return contentCache[filename];
    }
    
    // hvis vi skal bypasse cache, fjern fra cache
    if (shouldBypassCache()) {
        delete contentCache[filename];
    }
    
    // sjekk om vi skal laste fra Supabase
    // sjekk URL parametere og utviklingsmodus
    // hvis useLocal er satt, eller vi er i utviklingsmodus uten useSupabase, bruk lokal fil
    const urlParams = new URLSearchParams(window.location.search);
    const useLocal = urlParams.has('useLocal') || (isDevelopmentMode() && !urlParams.has('useSupabase'));
    
    if (!useLocal) {
        const supabase = await getSupabaseClient();
        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('json_files')
                    .select('content')
                    .eq('filename', filename)
                    .single();
                
                if (data && data.content) {
                    contentCache[filename] = data.content;
                    return data.content;
                }
            } catch (error) {
                console.log('Supabase not available, loading from local file');
            }
        }
    }
    
    // laste fra lokal fil hvis Supabase ikke er tilgjengelig eller useLocal er satt
    try {
        // legg til cache-busting parameter
        // bruk tidsstempel for nocache, eller sekund-basert versjon for refresh
        const cacheBuster = shouldBypassCache() ? `?t=${Date.now()}` : `?v=${Math.floor(Date.now() / 1000)}`;
        const response = await fetch(`./assets/text/${filename}.json${cacheBuster}`, {
            cache: shouldBypassCache() ? 'no-cache' : 'no-store'  // altid cache-busting for no-cache
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch ${filename}.json: ${response.status}`);
        }
        const content = await response.json();
        contentCache[filename] = content;
        return content;
    } catch (error) {
        console.error('Error loading content:', error);
        return null;
    }
}

/**
 * bestemmer hvilken innholdsfil som skal lastes basert på gjeldende side
 * 
 * @returns {string} navnet på innholdsfilen uten .json
 */
function getContentFile() {
    const path = window.location.pathname || window.location.href;
    const currentPage = path.split('/').pop().split('?')[0]; // fjern eventuelle URL parametere
    
    console.log('Current page detected:', currentPage);
    
    switch(currentPage) {
        case 'om-oss.html':
            return 'about';
        case 'sted.html':
            return 'location';
        case 'kontakt.html':
            return 'contact-page';
        case 'index.html':
        case '':
        default:
            return 'content';
    }
}

/**
 * Main content loader function
 * 
 * Loads content from Supabase or local JSON files depending on the current page
 * 
 * @returns {Promise<void>} - resolves when content is loaded, rejects when there is an error
 */
async function loadContent() {
    try {
        console.log('Loading content...');
        const contentFile = getContentFile();
        console.log('Content file:', contentFile);
        
        const content = await loadContentFromSupabase(contentFile);
        
        if (!content) {
            console.error('No content loaded for file:', contentFile);
            return;
        }
        
        console.log('Content loaded successfully:', content);
        
        const path = window.location.pathname || window.location.href; // få path uten URL parametere
        const currentPage = path.split('/').pop().split('?')[0];
        
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
        
        console.log('Content populated successfully');
    } catch (error) {
        console.error('Error loading content:', error);
        console.error('Stack trace:', error.stack);
    }
}


// Populate common elements (header, footer)
// This function populates the common elements of the page such as the announcement bar, navigation, footer and newsletter.
function populateCommonElements(content) {
    // får felles elementer
    // Announcement Bar
    const announcementBar = document.querySelector('.announcement-bar');
    // hvis announcement bar finnes og det er innhold for det
    if (announcementBar && content.announcement) {
        // sette innhold
        announcementBar.textContent = content.announcement;
    }

    // Navigation
    // sett nettstedstittel ved siden av logoen, uten å fjerne bilde
    const siteTitleEl = document.querySelector('.site-title');
    if (siteTitleEl && content.nav) {
        siteTitleEl.textContent = content.nav.siteTitle || '';
    }
    
    // få alle navigasjons lenkene
    const navLinks = document.querySelectorAll('.nav-menu li a');
    // hvis det er nok navigasjons lenker og det er innhold for det
    if (navLinks.length >= 5 && content.nav) {
        // set tekst innholdet for hver lenke
        navLinks[0].textContent = content.nav.home;
        navLinks[1].textContent = content.nav.menu;
        navLinks[2].textContent = content.nav.about;
        navLinks[3].textContent = content.nav.location;
        navLinks[4].textContent = content.nav.contact;
    }
    
    // få book table knappen
    const bookTableBtn = document.querySelector('.nav-actions a');
    // hvis book table knappen finnes og det er innhold for det
    if (bookTableBtn && content.nav) {
        // set tekst innholdet
        bookTableBtn.textContent = content.nav.bookTable;
    }

    // Footer
    // få alle footer seksjonene
    const footerSections = document.querySelectorAll('.footer-section');
    // hvis det er nok footer seksjoner og det er innhold for det
    if (footerSections.length >= 4 && content.footer) {
        // loop gjennom hver footer seksjon og sett innholdet
        content.footer.sections.forEach((section, index) => {
            // sjekk om footer seksjonen finnes
            if (footerSections[index]) {
                // få tittelen til footer seksjonen
                const title = footerSections[index].querySelector('h3');
                // hvis tittelen finnes, sett tekst innholdet
                if (title) title.textContent = section.title;
                
                // få alle lenkene i seksjonen
                const links = footerSections[index].querySelectorAll('li');
                section.links.forEach((link, linkIndex) => {
                    if (links[linkIndex]) {
                        const anchor = links[linkIndex].querySelector('a');
                        if (anchor) {
                            anchor.textContent = link.text;
                            anchor.href = link.url;
                        } else {
                            links[linkIndex].textContent = link.text;
                        }
                    }
                });
            }
        });

        // Newsletter
        // få newsletter elementet
        const newsletterTitle = document.querySelector('.newsletter h3');

        const newsletterDesc = document.querySelector('.newsletter p');
// få newsletter input element
        const newsletterInput = document.querySelector('.newsletter input');
// få newsletter knapp element
        const newsletterBtn = document.querySelector('.newsletter button');
        
        if (newsletterTitle) newsletterTitle.textContent = content.footer.newsletter.title;
        if (newsletterDesc) newsletterDesc.textContent = content.footer.newsletter.description;
        if (newsletterInput) newsletterInput.placeholder = content.footer.newsletter.placeholder;
        if (newsletterBtn) newsletterBtn.textContent = content.footer.newsletter.button;
    }
}


// Populate home page (index.html)
function populateHomePage(content) {
    populateCommonElements(content);

// Hero sesjon
    const heroTitle = document.querySelector('.hero h1'); // få hero tittel
    const heroSubtitle = document.querySelector('.hero p'); // få hero undertittel
    const heroCta = document.querySelector('.hero .cta-button'); // få hero call-to-action knapp
    
    if (heroTitle && content.hero) heroTitle.textContent = content.hero.title; // sett hero tittel
    if (heroSubtitle && content.hero) heroSubtitle.textContent = content.hero.subtitle; // sett hero undertittel
    if (heroCta && content.hero) heroCta.textContent = content.hero.cta; // sett hero call-to-action knapp

    // Category cards og plasserer innhold 
    const categoryCards = document.querySelectorAll('.category-card'); // få alle kategori kortene
    if (content.categories) { // hvis det er innhold for kategorier
         // loop gjennom hver kategori og sett innholdet
        content.categories.forEach((cat, index) => { // for hver kategori
            if (categoryCards[index]) { // sjekk om kategori kortet finnes
                 // få tittel, beskrivelse og lenke elementene
                const title = categoryCards[index].querySelector('h3'); // få tittel element
                const desc = categoryCards[index].querySelector('p'); // få beskrivelse element
                const link = categoryCards[index].querySelector('.category-link'); // få lenke element
                
                if (title) title.textContent = cat.title; // sett tittel tekst
                if (desc) desc.textContent = cat.description; //    sett beskrivelse tekst
                if (link) link.textContent = cat.link; //    sett lenke tekst
            }
        });
    }

    // hovedmeny seksjon
    const menuTitle = document.querySelector('.menu-section .section-title'); // få meny tittel
    const menuSubtitle = document.querySelector('.menu-section .section-subtitle');
    
    if (menuTitle && content.menu) menuTitle.textContent = content.menu.title; // sett meny tittel
    if (menuSubtitle && content.menu) menuSubtitle.textContent = content.menu.subtitle; // sett meny undertittel

    // fyller meny kategorier og elementer
    const menuCategories = document.querySelectorAll('.menu-category'); // få alle meny kategoriene
    if (content.menu && content.menu.categories) { // hvis det er innhold for meny kategorier
         // data for hver meny kategori
        const menuData = [content.menu.categories.coffee, content.menu.categories.bakery, content.menu.categories.lunch]; // meny data for hver kategori
         // loop gjennom hver meny kategori og sett innholdet
        // for hver meny kategori
        menuCategories.forEach((category, index) => {
            if (menuData[index]) {
                const categoryTitle = category.querySelector('h3');
                if (categoryTitle) categoryTitle.textContent = menuData[index].title;
                
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

    // app seksjon
    const ctaTitle = document.querySelector('.app-section h2');
    const ctaDesc = document.querySelector('.app-section p');
    const ctaBtn = document.querySelector('.app-section .cta-button');
    
    if (ctaTitle && content.cta) ctaTitle.textContent = content.cta.title;
    if (ctaDesc && content.cta) ctaDesc.textContent = content.cta.description;
    if (ctaBtn && content.cta) ctaBtn.textContent = content.cta.button;
}






/**
 * 
 * Populate about page (om-oss.html)   
 * dette er populate for alle sidene dette var skrevet med ai gjenom å ha intraktivted plassert. dette er kun for populat delene jeg har fått forklart den foroje og gjør ikke på alle 
 * 
 * 
 */






function populateAboutPage(content) {
    populateCommonElements(content);

    if (!content.hero) return;

    const heroTitle = document.querySelector('.about-hero h1');
    const heroSubtitle = document.querySelector('.about-hero p');
    
    if (heroTitle) heroTitle.textContent = content.hero.title;
    if (heroSubtitle) heroSubtitle.textContent = content.hero.subtitle;

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

// Populate location page (sted.html)
function populateLocationPage(content) {
    populateCommonElements(content);

    if (!content.hero) return;

    const heroTitle = document.querySelector('.location-hero h1');
    const heroSubtitle = document.querySelector('.location-hero p');
    
    if (heroTitle) heroTitle.textContent = content.hero.title;
    if (heroSubtitle) heroSubtitle.textContent = content.hero.subtitle;

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
                
                if (schedule.weekend) {
                    dayHours[index].classList.add('weekend');
                }
            }
        });
    }

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

// Populate contact page (kontakt.html)
function populateContactPage(content) {
    populateCommonElements(content);

    if (!content.hero) return;

    const heroTitle = document.querySelector('.contact-hero h1');
    const heroSubtitle = document.querySelector('.contact-hero p');
    
    if (heroTitle) heroTitle.textContent = content.hero.title;
    if (heroSubtitle) heroSubtitle.textContent = content.hero.subtitle;

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
                        const link = itemContent.querySelector('a');
                        if (link) {
                            link.textContent = item.content;
                            link.href = item.url;
                        }
                    } else {
                        itemContent.innerHTML = item.content;
                    }
                }
            }
        });
    }

    if (content.contactForm) {
        const formTitle = document.querySelector('.contact-form-container h2');
        if (formTitle) formTitle.textContent = content.contactForm.title;

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

        const subjectOptions = document.querySelectorAll('#subject option');
        content.contactForm.fields.subject.options.forEach((option, index) => {
            if (subjectOptions[index]) {
                subjectOptions[index].textContent = option.text;
                subjectOptions[index].value = option.value;
            }
        });
    }

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

// Load content when DOM is ready
if (document.readyState === 'loading') { // DOM not ready yet
    document.addEventListener('DOMContentLoaded', loadContent); // vent for DOM ready
} else {
    // DOM is already ready
    loadContent();
}