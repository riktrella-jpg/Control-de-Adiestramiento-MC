
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAddTask() {
  console.log("Testing task insertion...");
  // Note: This will likely fail RLS because we are not authenticated, 
  // but it will tell us if the table/columns are correct if we get a specific error.
  const { data, error } = await supabase.from('tasks').insert({
    id: `test-${Date.now()}`,
    user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
    label: 'Test Task',
    done: false
  });

  if (error) {
    console.log("Error type:", error.code);
    console.log("Error message:", error.message);
    console.log("Error details:", error.details);
  } else {
    console.log("Success (unexpected without auth, check RLS):", data);
  }
}

testAddTask();
