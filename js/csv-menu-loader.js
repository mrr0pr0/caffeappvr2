// CSV Menu Data Loader
class CSVMenuLoader {
    constructor() {
        this.menuData = [];
    }

    async loadCSVData() {
        try {
            const response = await fetch('./data/menu_data.csv');
            const csvText = await response.text();
            return this.parseCSV(csvText);
        } catch (error) {
            console.error('Error loading CSV data:', error);
            return [];
        }
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        const headers = ['id', 'name', 'price', 'description', 'image'];
        const data = [];

        // Skip the first few lines that contain metadata
        const dataLines = lines.filter(line => {
            const trimmed = line.trim();
            return trimmed && 
                   !trimmed.startsWith('001|') && 
                   !trimmed.startsWith('002|') && 
                   !trimmed.includes('Showing head of the data') &&
                   !trimmed.includes('id                                   name');
        });

        dataLines.forEach(line => {
            // Remove line numbers and split by |
            const cleanLine = line.replace(/^\d{3}\|/, '');
            const values = cleanLine.split('|').map(val => val.trim());
            
            if (values.length >= 4) {
                const item = {
                    id: values[0] || '',
                    name: values[1] || '',
                    price: parseFloat(values[2]) || 0,
                    description: values[3] || '',
                    image: values[4] && values[4] !== 'NaN' ? values[4] : null
                };
                
                if (item.name) {
                    data.push(item);
                }
            }
        });

        return data;
    }

    getCategoryFromName(name) {
        const nameLower = (name || '').toLowerCase();
        
        // Coffee items
        if (nameLower.includes('kaffe') || nameLower.includes('coffee') || 
            nameLower.includes('espresso') || nameLower.includes('americano') ||
            nameLower.includes('latte') || nameLower.includes('cappuccino')) {
            return 'Kaffe';
        }
        
        // Bakery items
        if (nameLower.includes('bolle') || nameLower.includes('kake') || 
            nameLower.includes('cake') || nameLower.includes('bakst') ||
            nameLower.includes('cookie') || nameLower.includes('biscuit') ||
            nameLower.includes('mudcake') || nameLower.includes('chocolate')) {
            return 'Bakst';
        }
        
        // Food/Lunch items
        if (nameLower.includes('rundstykke') || nameLower.includes('focaccia') ||
            nameLower.includes('yoghurt') || nameLower.includes('salat') ||
            nameLower.includes('salami') || nameLower.includes('ost') ||
            nameLower.includes('cheese') || nameLower.includes('sandwich')) {
            return 'Mat';
        }
        
        return 'Annet';
    }

    groupByCategory(items) {
        const map = new Map();
        for (const item of items) {
            const category = this.getCategoryFromName(item.name);
            if (!map.has(category)) map.set(category, []);
            map.get(category).push(item);
        }
        return map;
    }

    createItemCard(item) {
        const card = document.createElement('div');
        card.className = 'menu-card';

        // Create image container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'menu-card-image-container';

        if (item.image && item.image !== 'NaN') {
            const img = document.createElement('img');
            img.className = 'menu-card-image';
            img.alt = item.name || 'Menybilde';
            img.src = item.image;
            img.onerror = function() {
                this.style.display = 'none';
                imageContainer.innerHTML = '<div class="menu-card-placeholder">📷</div>';
            };
            imageContainer.appendChild(img);
        } else {
            imageContainer.innerHTML = '<div class="menu-card-placeholder">🍽️</div>';
        }

        const body = document.createElement('div');
        body.className = 'menu-card-body';

        const header = document.createElement('div');
        header.className = 'menu-card-header';

        const title = document.createElement('h4');
        title.className = 'menu-card-title';
        title.textContent = item.name || '';

        const price = document.createElement('div');
        price.className = 'menu-card-price';
        if (item.price && item.price > 0) {
            price.textContent = `${item.price.toFixed(0)} kr`;
        }

        header.appendChild(title);
        header.appendChild(price);

        const desc = document.createElement('p');
        desc.className = 'menu-card-desc';
        desc.textContent = item.description || '';

        body.appendChild(header);
        if (desc.textContent) body.appendChild(desc);

        card.appendChild(imageContainer);
        card.appendChild(body);

        return card;
    }

    renderMenu(items, container) {
        if (!container) return;
        container.innerHTML = '';

        if (!items.length) {
            container.innerHTML = '<div class="empty-state">Ingen menyelementer tilgjengelig</div>';
            return;
        }

        const byCategory = this.groupByCategory(items);
        const categoryOrder = ['Kaffe', 'Mat', 'Bakst', 'Annet'];

        categoryOrder.forEach(categoryName => {
            if (byCategory.has(categoryName)) {
                const items = byCategory.get(categoryName);
                const section = document.createElement('div');
                section.className = 'menu-category';

                const h3 = document.createElement('h3');
                h3.className = 'menu-category-title';
                h3.textContent = categoryName;

                const itemsWrap = document.createElement('div');
                itemsWrap.className = 'menu-items-grid';

                // Sort by name alphabetically
                items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

                items.forEach(item => {
                    itemsWrap.appendChild(this.createItemCard(item));
                });

                section.appendChild(h3);
                section.appendChild(itemsWrap);
                container.appendChild(section);
            }
        });
    }
}

export { CSVMenuLoader };