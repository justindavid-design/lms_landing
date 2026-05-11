process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

async function findUserByEmail(email) {
  const pageSize = 1000;
  for (let page = 1; page <= 100; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: pageSize });
    if (error) throw error;

    const users = data?.users || [];
    const match = users.find((user) => normalizeEmail(user.email) === email);
    if (match) return match;
    if (users.length < pageSize) return null;
  }

  return null;
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!supabase) {
      return res.status(500).json({ error: 'Supabase service role is not configured' });
    }

    const body = req.body || {};
    const email = normalizeEmail(body.email);
    const password = String(body.password || '');
    const displayName = String(body.displayName || '').trim() || email.split('@')[0];

    if (!email || !email.includes('@') || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'This email is already registered. Try logging in instead.' });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: displayName,
        full_name: displayName,
      },
    });

    if (error) {
      const raw = String(error.message || '').toLowerCase();
      if (raw.includes('already registered') || raw.includes('already been registered') || raw.includes('already exists')) {
        return res.status(409).json({ error: 'This email is already registered. Try logging in instead.' });
      }
      throw error;
    }

    const user = data?.user;
    if (!user) {
      return res.status(500).json({ error: 'Registration failed' });
    }

    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        display_name: displayName,
        role: 'student',
      }, { onConflict: 'id' });
    } catch (profileError) {
      console.warn('Profile creation failed:', profileError);
    }

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        display_name: displayName,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
};
