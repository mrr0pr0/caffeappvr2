// Supabase Menu Data Loader
import { supabase } from '../lib/supabaseClient.js';

class SupabaseMenuLoader {
    constructor() {
        this.menuData = [];
    }

    async loadMenuData() {
        try {
            console.log('Loading menu data from Supabase...');
            
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .eq('is_available', true)
                .order('category')
                .order('sort_order')
                .order('name');

            if (error) {
                console.error('Supabase error:', error);
                throw new Error(`Database error: ${error.message}`);
            }

            console.log('Menu data loaded from Supabase:', data?.length || 0, 'items');
            return data || [];
            
        } catch (error) {
            console.error('Error loading menu data:', error);
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

    createItemCard(item) {
        const card = document.createElement('div');
        card.className = 'menu-card';

        // Create image container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'menu-card-image-container';

        if (item.image_url) {
            const img = document.createElement('img');
            img.className = 'menu-card-image';
            img.alt = item.name || 'Menybilde';
            img.src = item.image_url;
            img.onerror = function() {
                this.style.display = 'none';
                imageContainer.innerHTML = '<div class="menu-card-placeholder">📷</div>';
            };
            imageContainer.appendChild(img);
        } else {
            // Use category-specific icons
            let icon = '🍽️';
            if (item.category === 'Kaffe') icon = '☕';
            else if (item.category === 'Bakst') icon = '🥐';
            else if (item.category === 'Mat') icon = '🍽️';
            
            imageContainer.innerHTML = `<div class="menu-card-placeholder">${icon}</div>`;
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
            price.textContent = `${Math.round(item.price)} kr`;
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

                // Items are already sorted by sort_order and name from the query
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

export { SupabaseMenuLoader };