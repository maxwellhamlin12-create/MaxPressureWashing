// Shared Supabase connection details, used by services.js (public site)
// and admin/admin.js (admin tool). The anon/publishable key below is safe
// to expose in client-side code — it can only do what the database's
// row-level security rules allow (public read, sign-in required to edit).
export const SUPABASE_URL = "https://nngonrrmxjmpyzfztmku.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uZ29ucnJteGptcHl6Znp0bWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NjgzNTUsImV4cCI6MjA5OTU0NDM1NX0.P7wjV4y0tTy5OEToYqK-j5qa7BjLd90L3mm7B4YD5R0";
