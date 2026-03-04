process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('SUPABASE env not set for server functions');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('courses').select('*').eq('published', true).order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const body = req.body;
      if (!body || !body.title || !body.slug) {
        return res.status(400).json({ error: 'title and slug required' });
      }
      const { data, error } = await supabase.from('courses').insert([{ title: body.title, slug: body.slug, description: body.description || null, author: body.author || null, published: !!body.published }]).select();
      if (error) throw error;
      return res.status(201).json(data[0]);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).end('Method Not Allowed');
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || String(err) });
  }
};
