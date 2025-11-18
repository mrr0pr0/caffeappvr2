// Supabase Klient Konfigurasjon
// Dette scriptet setter opp og eksporterer Supabase klienten for bruk i hele applikasjonen

// Laster Supabase fra CDN - kommenterte ut gamle URL og nøkkel
// const supabaseUrl = 'https://zdbewjpdycmmfqdnmwrp.supabase.co'
// const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYmV3anBkeWNtbWZxZG5td3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTM5NDgsImV4cCI6MjA3ODA2OTk0OH0.2qC9JiNIpmGkmPYAh4ky83iG0od6o7H_tgiAn4jNf1s'

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