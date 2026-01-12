import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import { Coffee, Plus, Star, ArrowLeft, Bean, Droplets, Camera, Image as ImageIcon, Loader2, Flame } from 'lucide-react'

const theme = {
  primary: '#6F4E37',
  secondary: '#A67B5B',
  accent: '#ECB159',
  bg: '#FDFBF7',
  card: '#FFFFFF',
  text: '#3C2A21'
}

export default function App() {
  const [view, setView] = useState('list')
  const [reviews, setReviews] = useState([])

  useEffect(() => { fetchReviews() }, [])

  async function fetchReviews() {
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false })
    if (data) setReviews(data)
  }

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', fontFamily: "sans-serif", color: theme.text }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', color: theme.primary }}>
            <Coffee size={28} /> COFFEE JOURNAL
          </h1>
          {view === 'list' && (
            <button onClick={() => setView('add')} style={{ background: theme.primary, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Novo
            </button>
          )}
        </header>

        {view === 'list' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reviews.length === 0 ? <p style={{ textAlign: 'center', opacity: 0.6 }}>Nenhum café registrado.</p> : 
              reviews.map(r => <ReviewCard key={r.id} review={r} />)}
          </div>
        ) : (
          <AddReview onSave={() => { setView('list'); fetchReviews(); }} onCancel={() => setView('list')} />
        )}
      </div>
    </div>
  )
}

function ReviewCard({ review }) {
  return (
    <div style={{ background: theme.card, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '10px' }}>
      {review.image_url && <img src={review.image_url} alt="Café" style={{ width: '100%', height: '250px', objectFit: 'cover' }} />}
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>{review.coffee_name}</h3>
          <div style={{ color: theme.accent, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {review.rating} <Star size={14} fill={theme.accent} />
          </div>
        </div>
        <p style={{ margin: '5px 0', color: theme.secondary, fontSize: '0.9rem' }}>{review.brand} • {review.origin}</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px', fontSize: '0.8rem', opacity: 0.8 }}>
          <span><Droplets size={12}/> Acidez: {review.acidity}/5</span>
          <span><Bean size={12}/> Corpo: {review.body}/5</span>
          <span><Flame size={12}/> Torra: {review.roast_level}</span>
          <span><Coffee size={12}/> {review.brew_method}</span>
        </div>

        {review.notes && <p style={{ marginTop: '15px', fontSize: '0.9rem', fontStyle: 'italic', borderLeft: `2px solid ${theme.accent}`, paddingLeft: '10px' }}>"{review.notes}"</p>}
      </div>
    </div>
  )
}

function AddReview({ onSave, onCancel }) {
  const [form, setForm] = useState({ coffee_name: '', brand: '', origin: '', brew_method: 'V60', roast_level: 'Média', rating: 5, notes: '', image_url: '', acidity: 3, body: 3 })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  async function handleFileUpload(e) {
    try {
      const file = e.target.files[0]
      if (!file) return
      setUploading(true)
      const fileName = `${Math.random()}.${file.name.split('.').pop()}`
      
      let { error: uploadError } = await supabase.storage.from('coffee-images').upload(fileName, file)
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('coffee-images').getPublicUrl(fileName)
      setForm({ ...form, image_url: data.publicUrl })
    } catch (error) {
      alert('Erro no upload!')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const { error } = await supabase.from('reviews').insert([form])
    if (!error) onSave()
    else alert('Erro ao salvar')
  }

  const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #ddd', boxSizing: 'border-box' }
  const labelStyle = { fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '5px', color: theme.secondary }

  return (
    <form onSubmit={handleSubmit} style={{ background: 'white', padding: '20px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
      <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', marginBottom: '15px', cursor: 'pointer' }}><ArrowLeft /></button>
      
      {/* Seção de Foto */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{ width: '100%', height: '180px', background: '#f8f8f8', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px dashed #eee', marginBottom: '10px' }}>
          {form.image_url ? <img src={form.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 
           uploading ? <Loader2 className="animate-spin" /> : <Coffee size={40} color="#ddd" />}
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={() => cameraInputRef.current.click()} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', border: `1px solid ${theme.primary}`, background: 'none', color: theme.primary, fontWeight: 'bold', cursor: 'pointer' }}>
            <Camera size={18} /> Tirar Foto
          </button>
          <button type="button" onClick={() => fileInputRef.current.click()} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', border: `1px solid ${theme.primary}`, background: 'none', color: theme.primary, fontWeight: 'bold', cursor: 'pointer' }}>
            <ImageIcon size={18} /> Galeria
          </button>
        </div>
        <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
      </div>

      <label style={labelStyle}>NOME DO CAFÉ</label>
      <input style={inputStyle} required placeholder="Ex: Catuaí Vermelho" onChange={e => setForm({...form, coffee_name: e.target.value})} />

      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>MARCA</label>
          <input style={inputStyle} placeholder="Ex: Orfeu" onChange={e => setForm({...form, brand: e.target.value})} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>ORIGEM</label>
          <input style={inputStyle} placeholder="Ex: Minas" onChange={e => setForm({...form, origin: e.target.value})} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>MÉTODO</label>
          <select style={inputStyle} onChange={e => setForm({...form, brew_method: e.target.value})}>
            <option>V60</option><option>Espresso</option><option>Prensa</option><option>Aeropress</option><option>Moka</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>TORRA</label>
          <select style={inputStyle} onChange={e => setForm({...form, roast_level: e.target.value})}>
            <option>Clara</option><option>Média</option><option>Escura</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={labelStyle}>ACIDEZ: {form.acidity}</label>
        <input type="range" min="1" max="5" style={{ width: '100%' }} value={form.acidity} onChange={e => setForm({...form, acidity: e.target.value})} />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={labelStyle}>CORPO: {form.body}</label>
        <input type="range" min="1" max="5" style={{ width: '100%' }} value={form.body} onChange={e => setForm({...form, body: e.target.value})} />
      </div>

      <label style={labelStyle}>NOTA GERAL (1-5)</label>
      <input type="number" min="1" max="5" style={inputStyle} value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} />

      <label style={labelStyle}>NOTAS SENSORIAIS</label>
      <textarea style={{ ...inputStyle, height: '70px' }} placeholder="Ex: Notas de nozes e mel..." onChange={e => setForm({...form, notes: e.target.value})}></textarea>

      <button type="submit" disabled={uploading} style={{ width: '100%', background: theme.primary, color: 'white', border: 'none', padding: '16px', borderRadius: '15px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
        {uploading ? 'Salvando Imagem...' : 'Salvar Review'}
      </button>
    </form>
  )
}
