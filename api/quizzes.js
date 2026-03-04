process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const courseId = req.query.courseId || (req.url && new URL(req.url, 'http://localhost').searchParams.get('courseId'));
      if (!courseId) return res.status(400).json({ error: 'courseId required' });
      const { data, error } = await supabase.from('quizzes').select('*').eq('course_id', courseId).order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const body = req.body;
      if (!body || !body.title || !body.course_id) {
        return res.status(400).json({ error: 'title and course_id required' });
      }
      const { data, error } = await supabase.from('quizzes').insert([{ title: body.title, course_id: body.course_id, meta: body.meta || {} }]).select();
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
