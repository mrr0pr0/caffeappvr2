// Determine which JSON file to load based on current page
function getContentFile() {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
      case 'om-oss.html':
        return './assets/text/about.json';
      case 'sted.html':
        return './assets/text/location.json';
      case 'kontakt.html':
        return './assets/text/contact-page.json';
      default:
        return './assets/text/content.json';
    }
  }
  
  // Load content from JSON
  async function loadContent() {
    try {
      const contentFile = getContentFile();
      const response = await fetch(contentFile);
      const content = await response.json();
      
      const currentPage = window.location.pathname.split('/').pop();
      
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
        default:
          populateHomePage(content);
          break;
      }
    } catch (error) {
      console.error('Error loading content:', error);
    }
  }
  
  // Populate common elements (header, footer)
  function populateCommonElements(content) {
    // Announcement bar
    const announcementBar = document.querySelector('.announcement-bar');
    if (announcementBar) {
      announcementBar.textContent = content.announcement;
    }
  
    // Navigation
    const logo = document.querySelector('.logo');
    if (logo) {
      logo.textContent = content.nav.logo;
    }
    
    const navLinks = document.querySelectorAll('.nav-menu li a');
    if (navLinks.length >= 5) {
      navLinks[0].textContent = content.nav.home;
      navLinks[1].textContent = content.nav.menu;
      navLinks[2].textContent = content.nav.about;
      navLinks[3].textContent = content.nav.location;
      navLinks[4].textContent = content.nav.contact;
    }
    
    const bookTableBtn = document.querySelector('.nav-actions a');
    if (bookTableBtn) {
      bookTableBtn.textContent = content.nav.bookTable;
    }
  
    // Footer
    const footerSections = document.querySelectorAll('.footer-section');
    if (footerSections.length >= 4 && content.footer) {
      content.footer.sections.forEach((section, index) => {
        if (footerSections[index]) {
          const title = footerSections[index].querySelector('h3');
          if (title) title.textContent = section.title;
          
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
      const newsletterTitle = document.querySelector('.newsletter h3');
      const newsletterDesc = document.querySelector('.newsletter p');
      const newsletterInput = document.querySelector('.newsletter input');
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
  
    // Hero section
    const heroTitle = document.querySelector('.hero h1');
    const heroSubtitle = document.querySelector('.hero p');
    const heroCta = document.querySelector('.hero .cta-button');
    
    if (heroTitle) heroTitle.textContent = content.hero.title;
    if (heroSubtitle) heroSubtitle.textContent = content.hero.subtitle;
    if (heroCta) heroCta.textContent = content.hero.cta;
  
    // Category cards
    const categoryCards = document.querySelectorAll('.category-card');
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
  
    // Menu section
    const menuTitle = document.querySelector('.menu-section .section-title');
    const menuSubtitle = document.querySelector('.menu-section .section-subtitle');
    
    if (menuTitle) menuTitle.textContent = content.menu.title;
    if (menuSubtitle) menuSubtitle.textContent = content.menu.subtitle;
  
    // Menu categories
    const menuCategories = document.querySelectorAll('.menu-category');
    const menuData = [content.menu.categories.coffee, content.menu.categories.bakery, content.menu.categories.lunch];
    
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
  
    // CTA section
    const ctaTitle = document.querySelector('.app-section h2');
    const ctaDesc = document.querySelector('.app-section p');
    const ctaBtn = document.querySelector('.app-section .cta-button');
    
    if (ctaTitle) ctaTitle.textContent = content.cta.title;
    if (ctaDesc) ctaDesc.textContent = content.cta.description;
    if (ctaBtn) ctaBtn.textContent = content.cta.button;
  }
  
  // Populate about page (om-oss.html)
  function populateAboutPage(content) {
    populateCommonElements(content);
  
    // Hero section
    const heroTitle = document.querySelector('.about-hero h1');
    const heroSubtitle = document.querySelector('.about-hero p');
    
    if (heroTitle) heroTitle.textContent = content.hero.title;
    if (heroSubtitle) heroSubtitle.textContent = content.hero.subtitle;
  
    // Story section
    const storyTitle = document.querySelector('.about-story h2');
    const storyParagraphs = document.querySelectorAll('.about-story p');
    
    if (storyTitle) storyTitle.textContent = content.story.title;
    content.story.paragraphs.forEach((paragraph, index) => {
      if (storyParagraphs[index]) {
        storyParagraphs[index].textContent = paragraph;
      }
    });
  
    // Values section
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
  
    // Team section
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
  
    // Mission section
    const missionTitle = document.querySelector('.about-mission h2');
    const missionParagraphs = document.querySelectorAll('.about-mission p');
    
    if (missionTitle) missionTitle.textContent = content.mission.title;
    content.mission.paragraphs.forEach((paragraph, index) => {
      if (missionParagraphs[index]) {
        missionParagraphs[index].textContent = paragraph;
      }
    });
  }
  
  // Populate location page (sted.html)
  function populateLocationPage(content) {
    populateCommonElements(content);
  
    // Hero section
    const heroTitle = document.querySelector('.location-hero h1');
    const heroSubtitle = document.querySelector('.location-hero p');
    
    if (heroTitle) heroTitle.textContent = content.hero.title;
    if (heroSubtitle) heroSubtitle.textContent = content.hero.subtitle;
  
    // Address section
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
  
    // Opening hours
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
  
    // Features section
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
  
    // Directions section
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
  
    // Nearby section
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
  
    // Map section
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
  
  // Populate contact page (kontakt.html)
  function populateContactPage(content) {
    populateCommonElements(content);
  
    // Hero section
    const heroTitle = document.querySelector('.contact-hero h1');
    const heroSubtitle = document.querySelector('.contact-hero p');
    
    if (heroTitle) heroTitle.textContent = content.hero.title;
    if (heroSubtitle) heroSubtitle.textContent = content.hero.subtitle;
  
    // Contact info section
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
  
    // Contact form
    const formTitle = document.querySelector('.contact-form-container h2');
    if (formTitle) formTitle.textContent = content.contactForm.title;
  
    // Form fields
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
  
    // Subject options
    const subjectOptions = document.querySelectorAll('#subject option');
    content.contactForm.fields.subject.options.forEach((option, index) => {
      if (subjectOptions[index]) {
        subjectOptions[index].textContent = option.text;
        subjectOptions[index].value = option.value;
      }
    });
  
    // Map section
    const mapTitle = document.querySelector('.map-section h2');
    const mapContent = document.querySelectorAll('.map-placeholder p');
    
    if (mapTitle) mapTitle.textContent = content.map.title;
    content.map.content.forEach((text, index) => {
      if (mapContent[index]) {
        mapContent[index].textContent = text;
      }
    });
  }
  
  // Load content when DOM is ready
  document.addEventListener('DOMContentLoaded', loadContent);