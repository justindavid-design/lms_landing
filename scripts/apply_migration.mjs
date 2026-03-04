import fs from 'fs'
import path from 'path'
import { Client } from 'pg'

function loadEnv(){
  const envPath = path.resolve(process.cwd(), '.env')
  const env = {}
  if (fs.existsSync(envPath)){
    const raw = fs.readFileSync(envPath,'utf8')
    raw.split(/\r?\n/).forEach(line => {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m){
        let val = m[2]
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))){
          val = val.slice(1,-1)
        }
        env[m[1]] = val
      }
    })
  }
  return env
}

async function run(){
  const env = loadEnv()
  const password = env.DB_PASSWORD || env.POSTGRES_PASSWORD || env.SUPABASE_DB_PASSWORD || env.PG_PASSWORD || env.SUPABASE_DB_PASS || env.SUPABASE_SERVICE_ROLE_KEY_PASSWORD || env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL
  if (!supabaseUrl) {
    console.error('SUPABASE_URL is missing in .env')
    process.exit(1)
  }

  // attempt to construct db host from SUPABASE_URL
  const url = new URL(supabaseUrl)
  const hostParts = url.hostname.split('.')
  const projectRef = hostParts[0]
  const dbHost = `db.${projectRef}.supabase.co`

  if (!password) {
    console.error('No DB password found in environment (.env). Please add PGPASSWORD or SUPABASE_DB_PASSWORD or similar.')
    process.exit(1)
  }

  const connectionString = `postgresql://postgres:${encodeURIComponent(password)}@${dbHost}:5432/postgres?sslmode=require`
  console.log('Connecting to', connectionString.replace(/:[^@]+@/, ':*****@'))

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })
  await client.connect()
  const sql = fs.readFileSync(path.join(process.cwd(),'supabase','001_init.sql'),'utf8')
  try {
    console.log('Running migration...')
    await client.query(sql)
    console.log('Migration completed successfully')
  } catch (err) {
    console.error('Migration failed:', err.message||err)
  } finally {
    await client.end()
  }
}

run().catch(err=>{ console.error(err); process.exit(1) })
