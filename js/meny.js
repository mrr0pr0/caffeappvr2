// Supabase Menu Data Loader
// const supabaseUrl = 'https://zdbewjpdycmmfqdnmwrp.supabase.co'
// const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYmV3anBkeWNtbWZxZG5td3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTM5NDgsImV4cCI6MjA3ODA2OTk0OH0.2qC9JiNIpmGkmPYAh4ky83iG0od6o7H_tgiAn4jNf1s'
const supabaseUrl = 'https://tidenes-supabase.cool.ropro.no/'
const supabaseAnonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2MjY4NDAyMCwiZXhwIjo0OTE4MzU3NjIwLCJyb2xlIjoiYW5vbiJ9.uMQOw5YloAPPLjr5NMSXJl70-e9hc-kEinpeMp_2Zz0'

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
                imageContainer.innerHTML = `<div class="menu-card-placeholder">${this.getCategoryIcon(item.category)}</div>`;
            }.bind(this);
            imageContainer.appendChild(img);
        } else {
            const icon = this.getCategoryIcon(item.category);
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
        
        // Get all categories dynamically and sort them
        // Priority order: Kaffe, Mat, Bakst, then alphabetically
        const priorityOrder = ['Kaffe', 'Mat', 'Bakst'];
        const allCategories = Array.from(byCategory.keys());
        
        const sortedCategories = allCategories.sort((a, b) => {
            const aIndex = priorityOrder.indexOf(a);
            const bIndex = priorityOrder.indexOf(b);
            
            // If both are in priority list, sort by priority
            if (aIndex !== -1 && bIndex !== -1) {
                return aIndex - bIndex;
            }
            // If only a is in priority, a comes first
            if (aIndex !== -1) return -1;
            // If only b is in priority, b comes first
            if (bIndex !== -1) return 1;
            // Otherwise sort alphabetically
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

            // Items are already sorted by sort_order and name from the query
            items.forEach(item => {
                itemsWrap.appendChild(this.createItemCard(item));
            });

            section.appendChild(h3);
            section.appendChild(itemsWrap);
            container.appendChild(section);
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