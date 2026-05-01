import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mmteqrpbrjykzhplpkzr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_xS3t5OgkRsfxDnkGUsN8JQ_r1zVLa0w';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function cleanupDuplicatePets() {
  console.log('🔍 Fetching all pets...');

  const { data: pets, error } = await supabase
    .from('pets')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error fetching pets:', error.message);
    return;
  }

  console.log(`📋 Total pets found: ${pets.length}`);
  pets.forEach(p => console.log(`  - [${p.id}] ${p.name} | user: ${p.user_id} | created: ${p.created_at}`));

  // Group by user_id + name, keep only the FIRST (oldest) of each group
  const seen = new Map(); // key: "userId|name"
  const toDelete = [];

  for (const pet of pets) {
    const key = `${pet.user_id}|${pet.name}`;
    if (seen.has(key)) {
      toDelete.push(pet.id);
    } else {
      seen.set(key, pet.id);
    }
  }

  if (toDelete.length === 0) {
    console.log('✅ No duplicates found. Nothing to delete.');
    return;
  }

  console.log(`\n🗑️  Deleting ${toDelete.length} duplicate(s): ${toDelete.join(', ')}`);

  const { error: deleteError } = await supabase
    .from('pets')
    .delete()
    .in('id', toDelete);

  if (deleteError) {
    console.error('❌ Error deleting pets:', deleteError.message);
  } else {
    console.log('✅ Duplicates deleted successfully!');
  }

  // Show remaining pets
  const { data: remaining } = await supabase.from('pets').select('*').order('created_at', { ascending: true });
  console.log(`\n📋 Remaining pets (${remaining.length}):`);
  remaining.forEach(p => console.log(`  ✔ [${p.id}] ${p.name}`));
}

cleanupDuplicatePets();
