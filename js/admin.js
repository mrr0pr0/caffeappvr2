import { initSupabase } from '../lib/supabaseClient.js';

// Initialize Supabase
let supabase = null;

// DOM Elements
const loginScreen = document.getElementById('login-screen'); // Login screen container
const adminDashboard = document.getElementById('admin-dashboard'); // Admin dashboard container
const loginForm = document.getElementById('login-form'); // Login form
const logoutBtn = document.getElementById('logout-btn'); // Logout button
const userEmailSpan = document.getElementById('user-email'); // til å vise brukerens e-post
const jsonEditor = document.getElementById('json-editor'); // JSON editor textarea
const saveBtn = document.getElementById('save-btn'); // Save button
const reloadBtn = document.getElementById('reload-btn'); // Reload button
const navBtns = document.querySelectorAll('.nav-btn'); // navtigasjon knapper
const currentFileTitle = document.getElementById('current-file-title'); // Tittel for nåværende fil
const saveStatus = document.getElementById('save-status'); // Save status message
const loginError = document.getElementById('login-error'); // Login error message

let currentFile = 'content'; // Default file
let currentUser = null; // Logged in user

// File name mapping
const fileNames = { //  filnavn mapping
    'content': 'Hovedside',
    'about': 'Om Oss',
    'location': 'Sted',
    'contact-page': 'Kontakt'
};
// er for å vise hvilken fil som redigeres
// instansiering av appen
async function init() {
    try {
        // inlastet til Supabase client
        supabase = initSupabase();
        
        // ser om bruker er logget inn
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            currentUser = session.user;
            showDashboard();
        } else {
            loginScreen.style.display = 'flex';
        }

        // sett opp event liseteners
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
    
    // Log ut button
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navigasjons knapper
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFile = btn.dataset.file;
            loadFileContent();
        });
    });
    
    // lagre og last inn knapper
    saveBtn.addEventListener('click', saveContent);
    reloadBtn.addEventListener('click', loadFileContent);
}

// inloggings funksjon
async function handleLogin(e) {
    e.preventDefault();
    // hent e-post og passord fra subabase
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
        // Tilpassede feilmeldinger basert på feiltype i Supabase respons hjulpet med AI til å skrive fielmeinderen
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

/**
 * Handle logout event
 * 
 * Signs out user from Supabase Auth,
 * resets currentUser til null,
 * fjerner admin dashboard og viser login skjermen.
 * 
 * @throws {Error} if logout fails
 */
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

/**
 * viser admin dashboard
 * 
 * @function showDashboard
 */
function showDashboard() {
    // skjul login skjerm og vis admin dashboard
    loginScreen.style.display = 'none';
    adminDashboard.style.display = 'block'; 
    
    // vis brukerens e-post
    userEmailSpan.textContent = currentUser.email;
    
    // last inn innhold for standard fil
    loadFileContent();
}

/**
 * laster inn innhold for valgt fil
 * 
 * prøver å hente fra Supabase først, hvis ikke tilgjengelig, så fra lokal fil
 * 
 *  @throws {Error} hvis lasting fra Supabase mislykkes
 *  @throws {Error} hvis lasting fra lokal fil mislykkes
 */
async function loadFileContent() {
    currentFileTitle.textContent = `Rediger ${fileNames[currentFile]}`;
    saveStatus.classList.remove('show');
    
    try {
        // Først prøv å hente fra Supabase
        const { data, error } = await supabase
            .from('json_files')
            .select('content')
            .eq('filename', currentFile)
            .single();
        
        if (data && data.content) {
            // riktig data fra Supabase
            jsonEditor.value = JSON.stringify(data.content, null, 2);
        } else {
            // hent fra lokal fil hvis ingen data i Supabase
            const response = await fetch(`./assets/text/${currentFile}.json`);
            const content = await response.json();
            jsonEditor.value = JSON.stringify(content, null, 2);
        }
    } catch (error) {
        // hvis feil ved henting fra Supabase, prøv lokal fil
        try {
            const response = await fetch(`./assets/text/${currentFile}.json`);
            const content = await response.json();
            jsonEditor.value = JSON.stringify(content, null, 2);
        } catch (fileError) {
            // If loading from local file fails, show an error message
            showStatus('Kunne ikke laste fil.', 'error');
            console.error('Load error:', fileError);
        }
    }
}

/**
 * lagrer innholdet i editoren til Supabase
 * 
 * @throws {Error} hvis JSON er ugyldig
 * @throws {Error} hvis lagring til Supabase mislykkes
 */
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
        
        // viser suksess melding i 5 sekunder
        showStatus('✅ Endringer lagret! Innholdet er nå tilgjengelig for alle brukere.', 'success');
        
    } catch (error) {
        if (error instanceof SyntaxError) {
            // hvis ugyldig JSON melding
            showStatus('❌ Ugyldig JSON-format. Sjekk syntaksen din.', 'error');
        } else {
            // hvis lagrings feil melding
            showStatus('❌ Kunne ikke lagre endringer: ' + error.message, 'error');
        }
        // logg feil til konsollen for debugging
        console.error('Save error:', error);
    }
}

/**
 * Viser en statusmelding i 5 sekunder
 * @param {string} message - Statusmelding som skal vises
 * @param {string} type - Type av statusmelding. 'success' eller 'error'
 */
function showStatus(message, type) {
    // Viser statusmelding
    saveStatus.textContent = message;
    saveStatus.className = 'status-message show ' + type;
    
    // Fjern statusmelding etter 5 sekunder hvis det er en suksess-melding
    if (type === 'success') {
        setTimeout(() => {
            // Fjern statusmelding
            saveStatus.classList.remove('show');
        }, 5000);
    }
}
// Start appen
init();