import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fhnhkewxljhovbfoqqmy.supabase.co';
const supabaseKey = 'sb_publishable_mfZAN6ZPYvIRmjgg-JpUYQ_V9uoMdmQ';

export const supabase = createClient(supabaseUrl, supabaseKey);
