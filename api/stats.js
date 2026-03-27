process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const sample = {
  metrics: { activeUsers: 12, totalCourses: 8, avgScore: 78 },
  series: [50,55,60,58,62,64,66,70,68,69,71,72]
}

const handler = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('SUPABASE env not set; returning sample stats')
    return res.status(200).json(sample)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  try {
    // overall metrics
    const [{ count: totalCourses }, { count: activeUsersRes }, avgRes] = await Promise.all([
      // count courses
      supabase.from('courses').select('id', { count: 'exact', head: true }),
      // distinct active users in last 7 days (attempts)
      supabase.rpc('count_distinct_user_recent', { days: 7 }).catch(()=>null),
      // average score across finished attempts
      supabase.from('attempts').select('score', { count: 'exact', head: true }).then(async ()=>{
        const { data, error } = await supabase.rpc('avg_score_recent', { days: 365 }).catch(()=>({ data: null, error: null }))
        return { data, error }
      }).catch(()=>({ data: null }))
    ])

    // Note: Not all environments will have the RPCs; fall back to queries
    let activeUsers = 0
    if (activeUsersRes && activeUsersRes.count !== undefined) activeUsers = activeUsersRes.count
    // fallback: count distinct user_id from attempts in last 7 days
    if (!activeUsers) {
      const { data: auData, error: auErr } = await supabase.from('attempts').select('user_id', { count: 'exact' }).gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      if (!auErr) activeUsers = auData ? auData.length : 0
    }

    const total = (totalCourses && totalCourses.count) || 0

    // average score
    let avgScore = null
    try{
      const { data: avgData, error: avgErr } = await supabase.from('attempts').select('score').not('score', 'is', null)
        .not('finished_at', 'is', null).limit(1000)
      if (!avgErr && avgData && avgData.length) {
        const sum = avgData.reduce((s, r) => s + Number(r.score || 0), 0)
        avgScore = sum / avgData.length
      }
    }catch(e){ console.warn('avg score query failed', e) }

    // series: daily average score for last 12 days
    const days = 12
    const since = new Date()
    since.setDate(since.getDate() - (days - 1))
    const sinceIso = since.toISOString()

    const { data: seriesRows, error: seriesErr } = await supabase.rpc('daily_avg_scores', { since: sinceIso }).catch(()=>({ data: null, error: null }))

    let series = []
    if (seriesRows && Array.isArray(seriesRows)) {
      // expect rows with { day, avg }
      const map = {}
      seriesRows.forEach(r => { map[r.day] = Number(r.avg || 0) })
      for (let i = 0; i < days; i++){
        const d = new Date()
        d.setDate(d.getDate() - (days - 1 - i))
        const key = d.toISOString().slice(0,10)
        series.push(Math.round((map[key] || 0)))
      }
    } else {
      // fallback simple series: last N attempts' average scores grouped by day
      const { data: attemptsData, error: attErr } = await supabase.from('attempts').select('finished_at,score').not('score','is',null).not('finished_at','is',null).gte('finished_at', sinceIso).order('finished_at', { ascending: true }).limit(10000)
      if (!attErr && attemptsData) {
        const buckets = {}
        attemptsData.forEach(a => {
          const day = a.finished_at.slice(0,10)
          buckets[day] = buckets[day] || { sum: 0, n: 0 }
          buckets[day].sum += Number(a.score || 0)
          buckets[day].n += 1
        })
        for (let i = 0; i < days; i++){
          const d = new Date()
          d.setDate(d.getDate() - (days - 1 - i))
          const key = d.toISOString().slice(0,10)
          const b = buckets[key]
          series.push(b ? Math.round(b.sum / b.n) : 0)
        }
      } else {
        series = sample.series
      }
    }

    const payload = {
      metrics: {
        activeUsers: activeUsers || 0,
        totalCourses: total || 0,
        avgScore: avgScore ? Math.round(avgScore) : null
      },
      series
    }

    return res.status(200).json(payload)
  } catch (err) {
    console.error('stats handler error', err)
    return res.status(200).json(sample)
  }
}

module.exports = handler
