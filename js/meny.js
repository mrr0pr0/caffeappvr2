// Supabase Meny Data Laster
// const supabaseUrl = 'https://zdbewjpdycmmfqdnmwrp.supabase.co'
// const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYmV3anBkeWNtbWZxZG5td3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTM5NDgsImV4cCI6MjA3ODA2OTk0OH0.2qC9JiNIpmGkmPYAh4ky83iG0od6o7H_tgiAn4jNf1s'
const supabaseUrl = 'https://kafe-aroma-supabase.cool.ropro.no/'
const supabaseAnonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2MjY4NDAyMCwiZXhwIjo0OTE4MzU3NjIwLCJyb2xlIjoiYW5vbiJ9.uMQOw5YloAPPLjr5NMSXJl70-e9hc-kEinpeMp_2Zz0'

// Instansierer supabase klient
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

class SupabaseMenuLoader {
    constructor() {
        this.menuData = [];
    }

    async loadMenuData() {
        try {
            console.log('Laster menydata fra Supabase...');
            
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .eq('is_available', true)
                .order('category')
                .order('sort_order')
                .order('name');

            if (error) {
                console.error('Supabase feil:', error);
                throw new Error(`Databasefeil: ${error.message}`);
            }

            console.log('Menydata lastet fra Supabase:', data?.length || 0, 'elementer');
            return data || [];
            
        } catch (error) {
            console.error('Feil ved lasting av menydata:', error);
            throw error;
        }
    }

    groupByCategory(items) {
        const map = new Map();
        for (const item of items) {
            const category = item.category || 'Annet';
            if (!map.has(category)) map.set(category, []);
            map.get(category).push(item);
        }
        return map;
    }

    getCategoryIcon(category) {
        const icons = {
            'Kaffe': '☕',
            'Mat': '🍽️',
            'Bakst': '🥐',
            'Drikke': '🥤',
            'Dessert': '🍰',
            'Annet': '✨'
        };
        return icons[category] || '✨';
    }


    /**
     * Lager nye konsept kort element fra meny element data.
     * @param {Object} item - Meny element data.
     * @returns {HTMLElement} - Det opprettede meny kort elementet.
     */
    createItemCard(item) {
        const card = document.createElement('div');
        card.className = 'menu-card';

        // Lager bilde beholder
        const imageContainer = document.createElement('div');
        imageContainer.className = 'menu-card-image-container';

        // Ser om bilde er tilgjengelig
        if (item.image_url) {
            const img = document.createElement('img');
            img.className = 'menu-card-image';
            img.alt = item.name || 'Menybilde';
            img.src = item.image_url;

            // Håndterer bildelastingsfeil
            img.onerror = function() {
                this.style.display = 'none';
                // Bruker kategori-spesifikke ikoner hvis bilde-URL ikke er tilgjengelig
                imageContainer.innerHTML = `<div class="menu-card-placeholder">${this.getCategoryIcon(item.category)}</div>`;
            }.bind(this);

            imageContainer.appendChild(img);
        } else {
            // Bruker kategori-spesifikke ikoner hvis bilde-URL ikke er tilgjengelig
            const icon = this.getCategoryIcon(item.category);
            imageContainer.innerHTML = `<div class="menu-card-placeholder">${icon}</div>`;
        }

        // Lager innholdsbeholder
        const body = document.createElement('div');
        body.className = 'menu-card-body';

        // Lager topptekstbeholder
        const header = document.createElement('div');
        header.className = 'menu-card-header';

        // Lager tittelelement
        const title = document.createElement('h4');
        title.className = 'menu-card-title';
        title.textContent = item.name || '';

        // Lager priselement
        const price = document.createElement('div');
        price.className = 'menu-card-price';
        if (item.price && item.price > 0) {
            price.textContent = `${Math.round(item.price)} kr`;
        }

        // Legger til elementer i topptekstbeholder
        header.appendChild(title);
        header.appendChild(price);

        // Lager beskrivelseelement
        const desc = document.createElement('p');
        desc.className = 'menu-card-desc';
        desc.textContent = item.description || '';

        // Legger til elementer i innholdsbeholder
        body.appendChild(header);
        if (desc.textContent) body.appendChild(desc);

        // Legger til elementer i kortbeholder
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
        
        // Henter alle kategorier dynamisk og sorterer dem
        // Prioriteringsrekkefølge: Kaffe, Mat, Bakst, deretter alfabetisk
        const priorityOrder = ['Kaffe', 'Mat', 'Bakst'];
        const allCategories = Array.from(byCategory.keys());
        
        const sortedCategories = allCategories.sort((a, b) => {
            const aIndex = priorityOrder.indexOf(a);
            const bIndex = priorityOrder.indexOf(b);
            
            // Hvis begge er i prioriteringslisten, sorter etter prioritet
            if (aIndex !== -1 && bIndex !== -1) {
                return aIndex - bIndex;
            }
            // Hvis bare a er i prioriteringslisten, kommer a først
            if (aIndex !== -1) return -1;
            // Hvis bare b er i prioriteringslisten, kommer b først
            if (bIndex !== -1) return 1;
            // Ellers sorter alfabetisk
            return a.localeCompare(b, 'no');
        });

        sortedCategories.forEach(categoryName => {
            const items = byCategory.get(categoryName);
            const section = document.createElement('div');
            section.className = 'menu-category';

            const h3 = document.createElement('h3');
            h3.className = 'menu-category-title';
            h3.setAttribute('data-category', categoryName);
            h3.textContent = categoryName;

            const itemsWrap = document.createElement('div');
            itemsWrap.className = 'menu-items-grid';

            // Elementer er allerede sortert etter sort_order og navn fra spørringen
            items.forEach(item => {
                itemsWrap.appendChild(this.createItemCard(item));
            });

            section.appendChild(h3);
            section.appendChild(itemsWrap);
            container.appendChild(section);
        });
    }
}

// Initialiserer og laster meny når DOM er klar
document.addEventListener('DOMContentLoaded', async () => {
    const menuContainer = document.getElementById('menu-root');
    const emptyState = document.getElementById('menu-empty');
    const errorState = document.getElementById('menu-error');
    
    if (!menuContainer) {
        console.error('Menybeholder ikke funnet');
        return;
    }

    const loader = new SupabaseMenuLoader();
    
    try {
        // Viser lastingstilstand
        menuContainer.innerHTML = '<div style="text-align:center; padding:40px 0;">Laster meny... pass på du er på et nett med åpen internett trafikk</div>';
        
        // Laster menydata
        const menuItems = await loader.loadMenuData();
        
        // Viser meny
        if (menuItems && menuItems.length > 0) {
            loader.renderMenu(menuItems, menuContainer);
            if (emptyState) emptyState.style.display = 'none';
            if (errorState) errorState.style.display = 'none';
        } else {
            menuContainer.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Kunne ikke laste meny:', error);
        menuContainer.innerHTML = '';
        if (errorState) {
            errorState.textContent = 'Kunne ikke laste meny. skjekk at du er på et nett med åpent nett trafikk';
            errorState.style.display = 'block';
        }
    }
});

export { SupabaseMenuLoader };