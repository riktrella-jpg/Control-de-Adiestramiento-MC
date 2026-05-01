import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing task insertion...");
  const { data, error } = await supabase.from('tasks').insert([
    { user_id: 'test_user', pet_id: 'test_pet', label: 'Test task', done: false }
  ]).select();

  if (error) {
    console.error("Error type:", error.code);
    console.error("Error message:", error.message);
    console.error("Error details:", error.details);
  } else {
    console.log("Success:", data);
  }
}

test();
