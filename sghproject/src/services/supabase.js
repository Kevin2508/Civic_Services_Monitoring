import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ewbnophpsihwjiwjhsmn.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3Ym5vcGhwc2lod2ppd2poc21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NzU4MjIsImV4cCI6MjA1ODA1MTgyMn0.HesEkaJY0DPP3oxIysegrMrKk41rPjxD5bO-NzxBHXI'; // Replace with your Supabase API Key

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;