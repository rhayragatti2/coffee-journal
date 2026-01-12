import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Coffee, Plus, Star, ArrowLeft, Bean, Droplets, Camera, Loader2 } from 'lucide-react'

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
    <div style={{ background: theme.card, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      {review.image_url && (
        <img src={review.image_url} alt="Café" style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
      )}
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>{review.coffee_name}</h3>
          <div style={{ color: theme.accent, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {review.rating} <Star size={14} fill={theme.accent} />
          </div>
        </div>
        <p style={{ margin: '5px 0', color: theme.secondary, fontSize: '0.9rem' }}>{review.brand} • {review.origin}</p>
        <div style={{ display: 'flex', gap: '15px', marginTop: '10px', fontSize: '0.8rem', opacity: 0.8 }}>
          <span><Droplets size={12}/> Acidez: {review.acidity}</span>
          <span><Bean size={12}/> Corpo: {review.body}</span>
        </div>
        {review.notes && <p style={{ marginTop: '15px', fontSize: '0.9rem', fontStyle: 'italic' }}>"{review.notes}"</p>}
      </div>
    </div>
  )
}

function AddReview({ onSave, onCancel }) {
  const [form, setForm] = useState({ coffee_name: '', brand: '', origin: '', brew_method: 'V60', rating: 5, notes: '', image_url: '', acidity: 3, body: 3 })
  const [uploading, setUploading] = useState(false)

  async function handleFileUpload(e) {
    try {
      setUploading(true)
      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload para o bucket 'coffee-images'
      let { error: uploadError } = await supabase.storage
        .from('coffee-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Pega a URL pública
      const { data } = supabase.storage.from('coffee-images').getPublicUrl(filePath)
      setForm({ ...form, image_url: data.publicUrl })
    } catch (error) {
      alert('Erro no upload da imagem!')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const { error } = await supabase.from('reviews').insert([form])
    if (!error) onSave()
    else alert('Erro ao salvar review')
  }

  const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #ddd', boxSizing: 'border-box' }

  return (
    <form onSubmit={handleSubmit} style={{ background: 'white', padding: '20px', borderRadius: '24px' }}>
      <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', marginBottom: '15px', cursor: 'pointer' }}><ArrowLeft /></button>
      
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <label style={{ 
          width: '100%', height: '150px', border: '2px dashed #ddd', borderRadius: '15px', 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', overflow: 'hidden', position: 'relative'
        }}>
          {form.image_url ? (
            <img src={form.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <>
              {uploading ? <Loader2 className="animate-spin" /> : <Camera size={30} color={theme.secondary} />}
              <span style={{ fontSize: '0.8rem', color: theme.secondary, marginTop: '5px' }}>Tirar foto do café</span>
            </>
          )}
          <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
      </div>

      <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>NOME DO CAFÉ</label>
      <input style={inputStyle} required onChange={e => setForm({...form, coffee_name: e.target.value})} />

      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>MARCA</label>
          <input style={inputStyle} onChange={e => setForm({...form, brand: e.target.value})} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>NOTA (1-5)</label>
          <input type="number" min="1" max="5" style={inputStyle} value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} />
        </div>
      </div>

      <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>NOTAS SENSORIAIS</label>
      <textarea style={{ ...inputStyle, height: '80px' }} onChange={e => setForm({...form, notes: e.target.value})}></textarea>

      <button type="submit" disabled={uploading} style={{ width: '100%', background: theme.primary, color: 'white', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold' }}>
        {uploading ? 'Enviando imagem...' : 'Salvar Avaliação'}
      </button>
    </form>
  )
}
