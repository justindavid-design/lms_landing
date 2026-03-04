import fs from 'fs'
import path from 'path'
try{
  await import('dotenv/config')
}catch(e){
  const envPath = path.resolve(process.cwd(), '.env')
  if (fs.existsSync(envPath)){
    const raw = fs.readFileSync(envPath, 'utf8')
    raw.split(/\r?\n/).forEach(line => {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m){
        let val = m[2]
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))){
          val = val.slice(1,-1)
        }
        process.env[m[1]] = val
      }
    })
  }
}

const { createClient } = await import('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment');
  process.exit(1);
}

const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
const admin = SUPABASE_SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null;

function makeEmail(){
  const ts = Date.now();
  return `test_user_${ts}@example.com`;
}

async function run(){
  const email = makeEmail();
  const password = 'Test1234!';
  console.log('Creating test user:', email);

  try{
    const { data: signData, error: signError } = await anon.auth.signUp({ email, password });
    if (signError){
      if (signError.message && signError.message.includes('already registered')){
        console.log('User already exists, attempting to sign in...')
      } else {
        console.warn('signUp failed:', signError.message || signError);
        if (admin && admin.auth && typeof admin.auth.admin?.createUser === 'function'){
          console.log('Attempting to create user via service role...')
          try{
            const { data: adminData, error: adminErr } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
            if (adminErr){
              console.error('admin.createUser error:', adminErr.message || adminErr);
              return;
            }
            console.log('admin.createUser success');
          }catch(e){
            console.error('admin.createUser exception:', e);
            return;
          }
        } else {
          console.log('No admin.createUser available; cannot create user programmatically.');
          return;
        }
      }
    } else {
      console.log('Sign up response:', signData?.user ? 'user created' : JSON.stringify(signData));
    }

    // sign in
    const { data: signInData, error: signInError } = await anon.auth.signInWithPassword({ email, password });
    if (signInError){
      console.error('signIn error:', signInError.message || signInError);
      return;
    }
    const user = signInData?.user;
    console.log('Signed in user id:', user?.id);

    if (admin && user){
      // ensure profile exists
      const profile = { id: user.id, display_name: 'Test User', role: 'student' };
      const { data, error } = await admin.from('profiles').upsert(profile, { returning: 'minimal' });
      if (error){
        console.error('upsert profile error:', error.message || error);
      } else {
        console.log('Profile upserted for', user.id);
      }
    } else if (!admin){
      console.log('No service role key found; profile not created. Add SUPABASE_SERVICE_ROLE_KEY to .env to allow creating profiles.');
    }

    console.log('Test auth flow completed. You can now try login in the browser with:', email, password);
    return;
  }catch(err){
    console.error('Exception:', err);
    return;
  }
}

run();
