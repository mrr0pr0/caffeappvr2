import { CSVMenuLoader } from './csv-menu-loader.js';

const menuRoot = document.getElementById('menu-root');
const emptyState = document.getElementById('menu-empty');
const errorBox = document.getElementById('menu-error');

function showError(message) {
    if (!errorBox) return;
    errorBox.textContent = message;
    errorBox.style.display = 'block';
}

function clearError() {
    if (!errorBox) return;
    errorBox.textContent = '';
    errorBox.style.display = 'none';
}

function showLoading() {
    if (!menuRoot) return;
    menuRoot.innerHTML = '<div class="status-message loading"><div class="loading-spinner"></div> Laster meny...</div>';
}

async function loadMenu() {
    clearError();
    showLoading();
    
    try {
        const csvLoader = new CSVMenuLoader();
        const menuData = await csvLoader.loadCSVData();
        
        console.log('Menu data loaded from CSV:', menuData.length, 'items');
        
        if (menuData.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            if (menuRoot) menuRoot.innerHTML = '';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        csvLoader.renderMenu(menuData, menuRoot);
        
    } catch (err) {
        console.error('Could not load menu:', err);
        const errorMessage = err.message || 'Kunne ikke laste menyen akkurat nå. Prøv igjen senere.';
        showError(`Feil: ${errorMessage}`);
        if (menuRoot) menuRoot.innerHTML = '';
    }
}

// Initialize menu loading
loadMenu();