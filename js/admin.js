import { initSupabase } from '../lib/supabaseClient.js';

// Initialize Supabase
let supabase = null;

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const adminDashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const userEmailSpan = document.getElementById('user-email');
const jsonEditor = document.getElementById('json-editor');
const saveBtn = document.getElementById('save-btn');
const reloadBtn = document.getElementById('reload-btn');
const navBtns = document.querySelectorAll('.nav-btn');
const currentFileTitle = document.getElementById('current-file-title');
const saveStatus = document.getElementById('save-status');
const loginError = document.getElementById('login-error');

let currentFile = 'content';
let currentUser = null;

// File name mapping
const fileNames = {
    'content': 'Hovedside',
    'about': 'Om Oss',
    'location': 'Sted',
    'contact-page': 'Kontakt'
};

// Initialize
async function init() {
    try {
        // Initialize Supabase client
        supabase = initSupabase();
        
        // Check if user is already logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            currentUser = session.user;
            showDashboard();
        } else {
            loginScreen.style.display = 'flex';
        }

        // Setup event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Initialization error:', error);
        loginError.textContent = 'Kunne ikke koble til Supabase. Sjekk nettverkstilkoblingen.';
        loginError.classList.add('show');
        loginScreen.style.display = 'flex';
    }
}

function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navigation
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFile = btn.dataset.file;
            loadFileContent();
        });
    });
    
    // Save and reload
    saveBtn.addEventListener('click', saveContent);
    reloadBtn.addEventListener('click', loadFileContent);
}

// Authentication handlers
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    loginError.classList.remove('show');
    loginError.textContent = '';
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        currentUser = data.user;
        showDashboard();
    } catch (error) {
        const errorMessage = (error?.message || '').toLowerCase();
        
        if (errorMessage.includes('invalid login credentials')) {
            loginError.textContent = '❌ Bruker ikke funnet eller feil passord. Sjekk e-post og passord.';
        } else if (errorMessage.includes('email not confirmed')) {
            loginError.textContent = '❌ E-post er ikke bekreftet. Sjekk innboksen din.';
        } else if (errorMessage.includes('user not found')) {
            loginError.textContent = '❌ Bruker ikke funnet. Kontakt administrator for å få tilgang.';
        } else if (errorMessage.includes('invalid password')) {
            loginError.textContent = '❌ Feil passord. Prøv igjen.';
        } else {
            loginError.textContent = '❌ Kunne ikke logge inn: ' + error.message;
        }
        loginError.classList.add('show');
        console.error('Login error:', error);
    }
}

async function handleLogout() {
    try {
        await supabase.auth.signOut();
        currentUser = null;
        adminDashboard.style.display = 'none';
        loginScreen.style.display = 'flex';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Dashboard functions
function showDashboard() {
    loginScreen.style.display = 'none';
    adminDashboard.style.display = 'block';
    
    userEmailSpan.textContent = currentUser.email;
    loadFileContent();
}

async function loadFileContent() {
    currentFileTitle.textContent = `Rediger ${fileNames[currentFile]}`;
    saveStatus.classList.remove('show');
    
    try {
        // First try to load from Supabase
        const { data, error } = await supabase
            .from('json_files')
            .select('content')
            .eq('filename', currentFile)
            .single();
        
        if (data && data.content) {
            // Use Supabase version
            jsonEditor.value = JSON.stringify(data.content, null, 2);
        } else {
            // Load from local file as fallback
            const response = await fetch(`./assets/text/${currentFile}.json`);
            const content = await response.json();
            jsonEditor.value = JSON.stringify(content, null, 2);
        }
    } catch (error) {
        // If no Supabase data, load from local file
        try {
            const response = await fetch(`./assets/text/${currentFile}.json`);
            const content = await response.json();
            jsonEditor.value = JSON.stringify(content, null, 2);
        } catch (fileError) {
            showStatus('Kunne ikke laste fil.', 'error');
            console.error('Load error:', fileError);
        }
    }
}

async function saveContent() {
    saveStatus.classList.remove('show');
    
    try {
        // Validate JSON
        const content = JSON.parse(jsonEditor.value);
        
        // Save to Supabase
        const { data, error } = await supabase
            .from('json_files')
            .upsert({
                filename: currentFile,
                content: content,
                updated_at: new Date().toISOString(),
                updated_by: currentUser.email
            }, {
                onConflict: 'filename'
            });
        
        if (error) throw error;
        
        showStatus('✅ Endringer lagret! Innholdet er nå tilgjengelig for alle brukere.', 'success');
        
    } catch (error) {
        if (error instanceof SyntaxError) {
            showStatus('❌ Ugyldig JSON-format. Sjekk syntaksen din.', 'error');
        } else {
            showStatus('❌ Kunne ikke lagre endringer: ' + error.message, 'error');
        }
        console.error('Save error:', error);
    }
}

function showStatus(message, type) {
    saveStatus.textContent = message;
    saveStatus.className = 'status-message show ' + type;
    
    if (type === 'success') {
        setTimeout(() => {
            saveStatus.classList.remove('show');
        }, 5000);
    }
}

// Initialize app
init();