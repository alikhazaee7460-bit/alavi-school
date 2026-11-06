import { createClient } from '@supabase/supabase-js';

// ما آدرس و کلید را مستقیم اینجا گذاشتیم تا مشکل فایل .env حل شود
const supabaseUrl = 'https://foeytlksbxocfcwhdyva.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvZXl0bGtzYnhvY2Zjd2hkeXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2NDM1ODgsImV4cCI6MjEwOTIxOTU4OH0.aoxPXnONZTl7nmcnkr7HF36ARdbaeviQf_phDVfzxt0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);