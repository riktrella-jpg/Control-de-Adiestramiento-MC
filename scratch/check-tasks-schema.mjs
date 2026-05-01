import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTasks() {
  // Query tasks without pet_id filter
  const { data, error } = await supabase.from('tasks').select('*').limit(1);
  console.log("Without pet_id:", { data, error });

  // Query tasks with pet_id filter
  const { data: data2, error: error2 } = await supabase.from('tasks').select('*').eq('pet_id', 'some_id').limit(1);
  console.log("With pet_id:", { data: data2, error: error2 });
}

checkTasks();
