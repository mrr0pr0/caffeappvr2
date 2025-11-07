async function loadContent(section, file) {
    const response = await fetch(`assets/text/${file}.json`);
    const data = await response.json();
    
    const container = document.getElementById(section);
    
    if (section === "hero") {
      container.innerHTML = `
        <h1>${data.title}</h1>
        <p>${data.subtitle}</p>
        <button>${data.buttonText}</button>
      `;
    }
    
    if (section === "menu") {
      container.innerHTML = data.sections.map(sec => `
        <div class="menu-section">
          <h2>${sec.name}</h2>
          ${sec.items.map(item => `
            <div class="menu-item">
              <span>${item.name}</span>
              <span>$${item.price}</span>
            </div>
          `).join('')}
        </div>
      `).join('');
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    loadContent("hero", "hero");
    loadContent("menu", "menu");
  });
  