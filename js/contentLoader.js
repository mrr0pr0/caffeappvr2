/**

* Laster innhold fra en JSON-fil og viser det i den angitte seksjonen.
*
* @param {string} section - HTML-seksjonen der innholdet skal vises.
* @param {string} file - Navnet på JSON-filen som skal lastes.
  */
  async function loadContent(section, file) { //
  const response = await fetch(`assets/text/${file}.json`);
  const data = await response.json();

  const container = document.getElementById(section);

  // Hvis seksjonen er hero-seksjonen, vis en hero-seksjon med tittel, undertittel og knapp.
  if (section === "hero") {
  container.innerHTML = `      <h1>${data.title}</h1>      <p>${data.subtitle}</p>      <button>${data.buttonText}</button>
     `;
  }

  // Hvis seksjonen er meny-seksjonen, vis en meny med seksjoner og elementer.
  if (section === "menu") {
  container.innerHTML = data.sections.map(sec => `     <div class="menu-section">        <h2>${sec.name}</h2>
         ${sec.items.map(item =>` <div class="menu-item"> <span>${item.name}</span> <span>$${item.price}</span> </div>
  `).join('')}      </div>
     `).join('');
  }
  }

document.addEventListener("DOMContentLoaded", () => {
loadContent("hero", "hero");
loadContent("menu", "menu");
});
