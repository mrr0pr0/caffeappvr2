// Load Supabase from CDN
const supabaseUrl = 'https://zdbewjpdycmmfqdnmwrp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYmV3anBkeWNtbWZxZG5td3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTM5NDgsImV4cCI6MjA3ODA2OTk0OH0.2qC9JiNIpmGkmPYAh4ky83iG0od6o7H_tgiAn4jNf1s'

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