const fs = require('fs')
const path = require('path')

const STORE = path.resolve(process.cwd(), 'tmp_notifications.json')
function load(){ try{ return JSON.parse(fs.readFileSync(STORE,'utf8')||'[]') }catch(e){ return [] } }
function save(d){ fs.writeFileSync(STORE, JSON.stringify(d, null, 2)) }

module.exports = async (req, res) => {
  try{
    if(req.method === 'GET'){
      const list = load().sort((a,b)=> b.created_at - a.created_at)
      return res.status(200).json(list)
    }

    if(req.method === 'POST'){
      const body = req.body || {}
      if(!body || !body.title) return res.status(400).json({ error: 'title required' })
      const list = load()
      const item = { id: Date.now().toString(), title: body.title, body: body.body || null, read: false, created_at: Date.now() }
      list.push(item)
      save(list)
      return res.status(201).json(item)
    }

    if(req.method === 'PATCH'){
      const body = req.body || {}
      if(!body || !body.id) return res.status(400).json({ error: 'id required' })
      const list = load()
      const idx = list.findIndex(x=> x.id === String(body.id))
      if(idx === -1) return res.status(404).json({ error: 'not found' })
      const item = Object.assign(list[idx], body)
      list[idx] = item
      save(list)
      return res.status(200).json(item)
    }

    if(req.method === 'DELETE'){
      const body = req.body || {}
      if(!body || !body.id) return res.status(400).json({ error: 'id required' })
      const list = load()
      const idx = list.findIndex(x=> x.id === String(body.id))
      if(idx === -1) return res.status(404).json({ error: 'not found' })
      const [removed] = list.splice(idx,1)
      save(list)
      return res.status(200).json({ ok:true, removed })
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
    return res.status(405).end('Method Not Allowed')
  }catch(err){
    console.error(err)
    return res.status(500).json({ error: err.message || String(err) })
  }
}
