// Supabase Menu Data Loader
const supabaseUrl = 'https://zdbewjpdycmmfqdnmwrp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYmV3anBkeWNtbWZxZG5td3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTM5NDgsImV4cCI6MjA3ODA2OTk0OH0.2qC9JiNIpmGkmPYAh4ky83iG0od6o7H_tgiAn4jNf1s';

// Initialize Supabase client from CDN
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

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

// Initialize and load menu when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const menuContainer = document.getElementById('menu-root');
    const emptyState = document.getElementById('menu-empty');
    const errorState = document.getElementById('menu-error');
    
    if (!menuContainer) {
        console.error('Menu container not found');
        return;
    }

    const loader = new SupabaseMenuLoader();
    
    try {
        // Show loading state
        menuContainer.innerHTML = '<div style="text-align:center; padding:40px 0;">Laster meny...</div>';
        
        // Load menu data
        const menuItems = await loader.loadMenuData();
        
        // Render menu
        if (menuItems && menuItems.length > 0) {
            loader.renderMenu(menuItems, menuContainer);
            if (emptyState) emptyState.style.display = 'none';
            if (errorState) errorState.style.display = 'none';
        } else {
            menuContainer.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Failed to load menu:', error);
        menuContainer.innerHTML = '';
        if (errorState) {
            errorState.textContent = 'Kunne ikke laste meny. Vennligst prøv igjen senere.';
            errorState.style.display = 'block';
        }
    }
});

export { SupabaseMenuLoader };