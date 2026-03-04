import fs from 'fs'
import path from 'path'
// load .env manually if dotenv not installed
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
        // strip quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))){
          val = val.slice(1,-1)
        }
        process.env[m[1]] = val
      }
    })
  }
}
const { createClient } = await import('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const tables = ['profiles','courses','quizzes','questions','options','attempts','attempt_answers'];

async function checkTable(name){
  try{
    const { count, error, data } = await supabase.from(name).select('*', { count: 'exact', head: false, limit: 1 });
    if (error) {
      // if table doesn't exist, PostgREST returns 404-like error
      console.log(`${name}: error — ${error.message}`);
      return { name, exists:false, error: error.message };
    }
    // count may be null if not available; do a head request
    const { count: headCount } = await supabase.from(name).select('*', { count: 'exact', head: true });
    console.log(`${name}: exists, rows=${headCount ?? 'unknown'}`);
    return { name, exists:true, rows: headCount };
  } catch (err){
    console.log(`${name}: exception — ${String(err)}`);
    return { name, exists:false, error: String(err) };
  }
}

async function run(){
  console.log('Checking Supabase tables at', SUPABASE_URL);
  for (const t of tables){
    // eslint-disable-next-line no-await-in-loop
    await checkTable(t);
  }
  process.exit(0);
}

run();
