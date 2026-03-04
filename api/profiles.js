process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

module.exports = async (req, res) => {
  try {
    const method = req.method;
    if (method === 'GET') {
      const id = req.query.id || (req.url && new URL(req.url, 'http://localhost').searchParams.get('id'));
      if (id) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (method === 'POST') {
      const body = req.body;
      if (!body || !body.id) return res.status(400).json({ error: 'profile id required (auth user id)' });
      const payload = {
        id: body.id,
        display_name: body.display_name || null,
        avatar_url: body.avatar_url || null,
        role: body.role || 'student'
      };
      const { data, error } = await supabase.from('profiles').upsert(payload, { onConflict: ['id'] }).select();
      if (error) throw error;
      return res.status(201).json(data[0]);
    }

    if (method === 'PUT' || method === 'PATCH') {
      const body = req.body;
      if (!body || !body.id) return res.status(400).json({ error: 'profile id required' });
      const updates = {};
      if ('display_name' in body) updates.display_name = body.display_name;
      if ('avatar_url' in body) updates.avatar_url = body.avatar_url;
      if ('role' in body) updates.role = body.role;
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', body.id).select();
      if (error) throw error;
      return res.status(200).json(data[0]);
    }

    res.setHeader('Allow', 'GET, POST, PUT, PATCH');
    return res.status(405).end('Method Not Allowed');
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || String(err) });
  }
};
