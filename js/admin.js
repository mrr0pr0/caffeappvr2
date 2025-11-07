import { supabase } from '../lib/supabaseClient.js';

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const registerScreen = document.getElementById('register-screen');
const adminDashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterBtn = document.getElementById('show-register');
const backToLoginBtn = document.getElementById('back-to-login');
const logoutBtn = document.getElementById('logout-btn');
const userEmailSpan = document.getElementById('user-email');
const jsonEditor = document.getElementById('json-editor');
const saveBtn = document.getElementById('save-btn');
const reloadBtn = document.getElementById('reload-btn');
const navBtns = document.querySelectorAll('.nav-btn');
const currentFileTitle = document.getElementById('current-file-title');
const saveStatus = document.getElementById('save-status');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const registerSuccess = document.getElementById('register-success');

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
}

function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Register form
    registerForm.addEventListener('submit', handleRegister);
    
    // Show/hide screens
    showRegisterBtn.addEventListener('click', () => {
        loginScreen.style.display = 'none';
        registerScreen.style.display = 'flex';
    });
    
    backToLoginBtn.addEventListener('click', () => {
        registerScreen.style.display = 'none';
        loginScreen.style.display = 'flex';
    });
    
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
        const normalizedMessage = (error?.message || '').toLowerCase();
        if (normalizedMessage.includes('invalid login credentials') || normalizedMessage.includes('password')) {
            loginError.textContent = 'Feil passord. Sjekk passordet og prøv igjen.';
        } else {
            loginError.textContent = 'Feil e-post eller passord. Prøv igjen.';
        }
        loginError.classList.add('show');
        console.error('Login error:', error);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const name = document.getElementById('reg-name').value;
    
    registerError.classList.remove('show');
    registerSuccess.classList.remove('show');
    registerError.textContent = '';
    registerSuccess.textContent = '';
    
    if (password.length < 6) {
        registerError.textContent = 'Passord må være minst 6 tegn.';
        registerError.classList.add('show');
        return;
    }
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name
                }
            }
        });
        
        if (error) throw error;
        
        registerSuccess.textContent = 'Registrering vellykket! Du kan nå logge inn.';
        registerSuccess.classList.add('show');
        
        // Clear form
        registerForm.reset();
        
        // Switch to login after 2 seconds
        setTimeout(() => {
            registerScreen.style.display = 'none';
            loginScreen.style.display = 'flex';
        }, 2000);
        
    } catch (error) {
        registerError.textContent = 'Registrering feilet: ' + error.message;
        registerError.classList.add('show');
        console.error('Register error:', error);
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
    registerScreen.style.display = 'none';
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