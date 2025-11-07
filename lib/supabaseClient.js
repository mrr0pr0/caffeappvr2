import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://zdbewjpdycmmfqdnmwrp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYmV3anBkeWNtbWZxZG5td3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTM5NDgsImV4cCI6MjA3ODA2OTk0OH0.2qC9JiNIpmGkmPYAh4ky83iG0od6o7H_tgiAn4jNf1s'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export { supabaseUrl, supabaseAnonKey }
