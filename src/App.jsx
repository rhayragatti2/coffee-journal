import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Coffee, Plus, Star, ArrowLeft, Bean, Droplets, Image as ImageIcon } from 'lucide-react'

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
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', fontFamily: "'Segoe UI', Roboto, sans-serif", color: theme.text }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', color: theme.primary }}>
            <Coffee size={32} strokeWidth={2.5} /> COFFEE JOURNAL
          </h1>
          {view === 'list' && (
            <button onClick={() => setView('add')} style={{ background: theme.primary, color: 'white', border: 'none', padding: '12px 20px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(111, 78, 55, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Novo
            </button>
          )}
        </header>

        {view === 'list' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reviews.length === 0 ? <p style={{ textAlign: 'center', opacity: 0.6 }}>Nenhum café registrado ainda.</p> : 
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
    <div style={{ background: theme.card, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.03)' }}>
      {review.image_url && (
        <img src={review.image_url} alt={review.coffee_name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
             onError={(e) => e.target.style.display = 'none'} />
      )}
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>{review.coffee_name}</h3>
            <p style={{ margin: '4px 0', fontSize: '0.9rem', color: theme.secondary, fontWeight: '600' }}>{review.brand} • {review.origin}</p>
          </div>
          <div style={{ background: '#F8F1E9', padding: '5px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px', color: theme.primary, fontWeight: 'bold' }}>
            {review.rating} <Star size={14} fill={theme.primary} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', margin: '15px 0' }}>
          <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Droplets size={14}/> Acidez: {review.acidity}</div>
          <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Bean size={14}/> Corpo: {review.body}</div>
          <div style={{ fontSize: '0.8rem', background: '#f0f0f0', padding: '2px 8px', borderRadius: '5px' }}>{review.brew_method}</div>
        </div>

        {review.notes && <p style={{ margin: 0, fontSize: '0.9rem', fontStyle: 'italic', color: '#666', borderLeft: `3px solid ${theme.accent}`, paddingLeft: '10px' }}>"{review.notes}"</p>}
      </div>
    </div>
  )
}

function AddReview({ onSave, onCancel }) {
  const [form, setForm] = useState({ coffee_name: '', brand: '', origin: '', brew_method: 'V60', roast_level: 'Média', acidity: 3, body: 3, rating: 5, notes: '', image_url: '' })

  async function handleSubmit(e) {
    e.preventDefault();
    const { error } = await supabase.from('reviews').insert([form]);
    if (!error) onSave(); else alert('Erro ao salvar!');
  }

  const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #E0E0E0', boxSizing: 'border-box', fontSize: '1rem' }
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.85rem', color: theme.secondary }

  return (
    <form onSubmit={handleSubmit} style={{ background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
      <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', color: theme.secondary, display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}>
        <ArrowLeft size={18} /> Voltar
      </button>

      <label style={labelStyle}>NOME DO CAFÉ</label>
      <input style={inputStyle} required placeholder="Ex: Bourbon Amarelo" onChange={e => setForm({...form, coffee_name: e.target.value})} />

      <label style={labelStyle}>MARCA E ORIGEM</label>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input style={inputStyle} placeholder="Marca" onChange={e => setForm({...form, brand: e.target.value})} />
        <input style={inputStyle} placeholder="Origem" onChange={e => setForm({...form, origin: e.target.value})} />
      </div>

      <label style={labelStyle}><ImageIcon size={14} /> URL DA IMAGEM (OPCIONAL)</label>
      <input style={inputStyle} placeholder="https://link-da-foto.jpg" onChange={e => setForm({...form, image_url: e.target.value})} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={labelStyle}>MÉTODO</label>
          <select style={inputStyle} onChange={e => setForm({...form, brew_method: e.target.value})}>
            <option>V60</option><option>Espresso</option><option>Prensa</option><option>Aeropress</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>NOTA (1-5)</label>
          <input type="number" min="1" max="5" style={inputStyle} value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} />
        </div>
      </div>

      <label style={labelStyle}>NOTAS SENSORIAIS</label>
      <textarea style={{ ...inputStyle, height: '80px' }} placeholder="O que você sentiu?" onChange={e => setForm({...form, notes: e.target.value})}></textarea>

      <button type="submit" style={{ width: '100%', background: theme.primary, color: 'white', border: 'none', padding: '16px', borderRadius: '15px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '10px' }}>
        Finalizar Review
      </button>
    </form>
  )
}
