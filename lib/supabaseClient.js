// Supabase Klient Konfigurasjon
// Dette scriptet setter opp og eksporterer Supabase klienten for bruk i hele applikasjonen

// Laster Supabase fra CDN - kommenterte ut gamle URL og nøkkel
//const supabaseUrl = 'https://oymuerkvduvhazfdgkgj.supabase.co'
//const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95bXVlcmt2ZHV2aGF6ZmRna2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MjI3NzEsImV4cCI6MjA3ODk5ODc3MX0.ylrcmRCI8n0_d_4FNQ4_KCCKPwqFU2ca1Eo3kj45vsY'

// Aktuelle Supabase konfigurasjon - URL til database server
const supabaseUrl = 'https://tidenes-supabase.cool.ropro.no/'
// Anonym nøkkel for offentlig tilgang til databasen (kun lesing av offentlige data)
const supabaseAnonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2MjY4NDAyMCwiZXhwIjo0OTE4MzU3NjIwLCJyb2xlIjoiYW5vbiJ9.uMQOw5YloAPPLjr5NMSXJl70-e9hc-kEinpeMp_2Zz0'

// Supabase klient variabel - initialiseres som null og settes opp senere
// Dette vil bli initialisert etter at CDN scriptet er lastet
export let supabase = null;

/**
 * Initialiserer Supabase klient
 * 
 * Denne funksjonen sjekker om Supabase biblioteket er tilgjengelig fra CDN
 * og oppretter en ny klient instans med URL og nøkkel
 * 
 * @returns {Object} Supabase klient instans
 * @throws {Error} Hvis Supabase biblioteket ikke er lastet fra CDN
 */
export function initSupabase() {
    // Sjekker om Supabase biblioteket er tilgjengelig globalt fra CDN
    if (window.supabase && window.supabase.createClient) {
        // Oppretter ny Supabase klient med URL og anonym nøkkel
        supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        // Returnerer den opprettede klienten for bruk
        return supabase;
    }
    // Kaster feil hvis Supabase biblioteket ikke er tilgjengelig
    throw new Error('Supabase library not loaded');
}