// Load Supabase from CDN
// const supabaseUrl = 'https://zdbewjpdycmmfqdnmwrp.supabase.co'
// const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYmV3anBkeWNtbWZxZG5td3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTM5NDgsImV4cCI6MjA3ODA2OTk0OH0.2qC9JiNIpmGkmPYAh4ky83iG0od6o7H_tgiAn4jNf1s'
const supabaseUrl = 'https://tidenes-supabase.cool.ropro.no/'
const supabaseAnonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2MjY4NDAyMCwiZXhwIjo0OTE4MzU3NjIwLCJyb2xlIjoiYW5vbiJ9.uMQOw5YloAPPLjr5NMSXJl70-e9hc-kEinpeMp_2Zz0'

// This will be initialized after the CDN script loads
export let supabase = null;

// Initialize Supabase client
export function initSupabase() {
    if (window.supabase && window.supabase.createClient) {
        supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        return supabase;
    }
    throw new Error('Supabase library not loaded');
}