import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import { Coffee, Plus, Star, ArrowLeft, Bean, Droplets, Camera, Image as ImageIcon, Loader2, Flame, Trash2, Edit3, Search } from 'lucide-react'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [currentReview, setCurrentReview] = useState(null)

  useEffect(() => { fetchReviews() }, [])

  async function fetchReviews() {
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false })
    if (data) setReviews(data)
  }

  const filteredReviews = reviews.filter(r => 
    r.coffee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (review) => {
    setCurrentReview(review)
    setView('edit')
  }

  const handleDelete = async (id) => {
    if (window.confirm("Deseja realmente excluir este review?")) {
      const { error } = await supabase.from('reviews').delete().eq('id', id)
      if (!error) fetchReviews()
      else alert("Erro ao excluir")
    }
  }

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', fontFamily: "sans-serif", color: theme.text }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', color: theme.primary }}>
            <Coffee size={28} /> COFFEE JOURNAL
          </h1>
          {view === 'list' && (
            <button onClick={() => setView('add')} style={{ background: theme.primary, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Novo
            </button>
          )}
        </header>

        {view === 'list' && (
          <div style={{ position: 'relative', marginBottom: '25px' }}>
            <Search size={18} color={theme.secondary} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Buscar por grão, marca ou notas..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', padding: '12px 12px 12px 45px', borderRadius: '15px', border: 'none', 
                backgroundColor: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', boxSizing: 'border-box',
                fontSize: '0.9rem', outline: 'none'
              }} 
            />
          </div>
        )}

        {view === 'list' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredReviews.length === 0 ? (
              <p style={{ textAlign: 'center', opacity: 0.6, marginTop: '20px' }}>
                {searchTerm ? 'Nenhum café encontrado.' : 'Nenhum café registrado.'}
              </p>
            ) : (
              filteredReviews.map(r => (
                <ReviewCard key={r.id} review={r} onEdit={() => handleEdit(r)} onDelete={() => handleDelete(r.id)} />
              ))
            )}
          </div>
        ) : (
          <ReviewForm 
            mode={view} 
            initialData={currentReview} 
            onSave={() => { setView('list'); fetchReviews(); setCurrentReview(null); }} 
            onCancel={() => { setView('list'); setCurrentReview(null); }} 
          />
        )}
      </div>
    </div>
  )
}

function ReviewCard({ review, onEdit, onDelete }) {
  return (
    <div style={{ background: theme.card, borderRadius: '25px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.04)', marginBottom: '5px', position: 'relative' }}>
      {review.image_url && <img src={review.image_url} alt="Café" style={{ width: '100%', height: '250px', objectFit: 'cover' }} />}
      
      <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ color: theme.accent, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          {review.rating} <Star size={14} fill={theme.accent} stroke="none" />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onEdit} style={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', cursor: 'pointer', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Edit3 size={16} color={theme.primary} />
          </button>
          <button onClick={onDelete} style={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', cursor: 'pointer', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Trash2 size={16} color="#d9534f" />
          </button>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', paddingRight: '130px' }}>{review.coffee_name}</h3>
        <p style={{ margin: '4px 0', color: theme.secondary, fontSize: '0.9rem', fontWeight: '500' }}>{review.brand} • {review.origin}</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '18px', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666' }}><Droplets size={14} color={theme.secondary}/> Acidez: {review.acidity}/5</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666' }}><Bean size={14} color={theme.secondary}/> Corpo: {review.body}/5</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666' }}><Flame size={14} color={theme.secondary}/> Torra: {review.roast_level}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666' }}><Coffee size={14} color={theme.secondary}/> {review.brew_method}</div>
        </div>

        {review.notes && (
          <div style={{ marginTop: '18px', padding: '12px', background: '#F9F9F9', borderRadius: '15px', fontSize: '0.85rem', fontStyle: 'italic', borderLeft: `3px solid ${theme.accent}` }}>
            "{review.notes}"
          </div>
        )}
      </div>
    </div>
  )
}

function ReviewForm({ mode, initialData, onSave, onCancel }) {
  const [form, setForm] = useState(initialData || { coffee_name: '', brand: '', origin: '', brew_method: 'Coado (V60/Melitta)', roast_level: 'Média', rating: 5, notes: '', image_url: '', acidity: 3, body: 3 })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  async function handleFileUpload(e) {
  try {
    const file = e.target.files[0]
    if (!file) return
    
    setUploading(true)
    
    // Gera um nome único usando timestamp + número aleatório
    const fileExt = file.name ? file.name.split('.').pop() : 'jpg'
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`
    const filePath = fileName

    let { error: uploadError } = await supabase.storage
      .from('coffee-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('coffee-images')
      .getPublicUrl(filePath)
      
    setForm({ ...form, image_url: data.publicUrl })
  } catch (error) {
    console.error('Erro detalhado:', error)
    alert('Erro no upload! Verifique se o Bucket "coffee-images" é público no Supabase.')
  } finally {
    setUploading(false)
  }
}

  async function handleSubmit(e) {
    e.preventDefault()
    let error;
    if (mode === 'edit') {
      const { error: editError } = await supabase.from('reviews').update(form).eq('id', initialData.id)
      error = editError
    } else {
      const { error: addError } = await supabase.from('reviews').insert([form])
      error = addError
    }
    if (!error) onSave()
    else alert('Erro ao salvar')
  }

  const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #eee', boxSizing: 'border-box', backgroundColor: '#F9F9F9' }
  const labelStyle = { fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '5px', color: theme.secondary }

  return (
    <form onSubmit={handleSubmit} style={{ background: 'white', padding: '25px', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
      <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', marginBottom: '15px', cursor: 'pointer', padding: 0 }}><ArrowLeft color={theme.primary} /></button>
      
      <div style={{ marginBottom: '25px' }}>
        <div style={{ width: '100%', height: '200px', background: '#F5F5F5', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px dashed #eee', marginBottom: '12px' }}>
          {form.image_url ? <img src={form.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 
           uploading ? <Loader2 className="animate-spin" /> : <Coffee size={40} color="#CCC" />}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={() => cameraInputRef.current.click()} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '12px', border: `1px solid ${theme.primary}`, background: 'none', color: theme.primary, fontWeight: 'bold', fontSize: '0.8rem' }}>
            <Camera size={16} /> Câmera
          </button>
          <button type="button" onClick={() => fileInputRef.current.click()} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '12px', border: `1px solid ${theme.primary}`, background: 'none', color: theme.primary, fontWeight: 'bold', fontSize: '0.8rem' }}>
            <ImageIcon size={16} /> Galeria
          </button>
        </div>
        <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
      </div>

      <label style={labelStyle}>NOME DO CAFÉ</label>
      <input style={inputStyle} required value={form.coffee_name} onChange={e => setForm({...form, coffee_name: e.target.value})} />

      <label style={labelStyle}>MARCA / TORREFAÇÃO</label>
      <input style={inputStyle} value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} />

      <label style={labelStyle}>ORIGEM</label>
      <input style={inputStyle} value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} />

      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>MÉTODO</label>
          <select style={inputStyle} value={form.brew_method} onChange={e => setForm({...form, brew_method: e.target.value})}>
            <option>Coado (V60/Melitta)</option><option>Espresso</option><option>Prensa</option><option>Aeropress</option><option>Moka</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>TORRA</label>
          <select style={inputStyle} value={form.roast_level} onChange={e => setForm({...form, roast_level: e.target.value})}>
            <option>Clara</option><option>Média</option><option>Escura</option>
          </select>
        </div>
      </div>

      <label style={labelStyle}>ACIDEZ: {form.acidity}/5</label>
      <input type="range" min="1" max="5" style={{ width: '100%', accentColor: theme.primary, marginBottom: '20px' }} value={form.acidity} onChange={e => setForm({...form, acidity: e.target.value})} />

      <label style={labelStyle}>CORPO: {form.body}/5</label>
      <input type="range" min="1" max="5" style={{ width: '100%', accentColor: theme.primary, marginBottom: '20px' }} value={form.body} onChange={e => setForm({...form, body: e.target.value})} />

      <label style={labelStyle}>SUA NOTA (1 A 5)</label>
      <input type="number" min="1" max="5" style={inputStyle} value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} />

      <label style={labelStyle}>NOTAS SENSORIAIS</label>
      <textarea style={{ ...inputStyle, height: '80px', resize: 'none' }} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}></textarea>

      <button type="submit" disabled={uploading} style={{ width: '100%', background: theme.primary, color: 'white', border: 'none', padding: '16px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
        {uploading ? 'Aguarde...' : 'Salvar Review'}
      </button>
    </form>
  )
}
