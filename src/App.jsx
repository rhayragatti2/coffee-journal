import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Coffee, Plus, Star, ArrowLeft } from 'lucide-react'

// Estilos inline simples para evitar criar muitos arquivos CSS
const styles = {
  container: { maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif', color: '#4a3b32' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  btn: { background: '#8B4513', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
  card: { border: '1px solid #e0e0e0', borderRadius: '10px', padding: '15px', marginBottom: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' },
  label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }
}

export default function App() {
  const [view, setView] = useState('list')
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    fetchReviews()
  }, [])

  async function fetchReviews() {
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false })
    if (data) setReviews(data)
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Coffee /> Coffee Journal
        </h1>
        {view === 'list' && (
          <button style={styles.btn} onClick={() => setView('add')}>
            <Plus size={16} /> Novo
          </button>
        )}
      </header>

      {view === 'list' ? (
        <ReviewList reviews={reviews} />
      ) : (
        <AddReview onSave={() => { setView('list'); fetchReviews(); }} onCancel={() => setView('list')} />
      )}
    </div>
  )
}

function ReviewList({ reviews }) {
  if (reviews.length === 0) return <p>Nenhum café registrado. Que tal passar um agora?</p>

  return (
    <div>
      {reviews.map((r) => (
        <div key={r.id} style={styles.card}>
          <h3 style={{ margin: '0 0 5px 0' }}>{r.coffee_name}</h3>
          <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>{r.brand} • {r.origin}</p>
          
          <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', marginBottom: '10px' }}>
            <span style={{ background: '#f0f0f0', padding: '3px 8px', borderRadius: '4px' }}>{r.brew_method}</span>
            <span style={{ background: '#f0f0f0', padding: '3px 8px', borderRadius: '4px' }}>Torra {r.roast_level}</span>
          </div>

          <p><strong>Nota: {r.rating}/5</strong> <Star size={12} fill="#8B4513" stroke="none"/></p>
          {r.notes && <p style={{ fontStyle: 'italic', color: '#555' }}>"{r.notes}"</p>}
        </div>
      ))}
    </div>
  )
}

function AddReview({ onSave, onCancel }) {
  const [form, setForm] = useState({
    coffee_name: '', brand: '', origin: '', brew_method: 'Coado',
    roast_level: 'Média', acidity: 3, body: 3, rating: 5, notes: ''
  })

  async function handleSubmit(e) {
    e.preventDefault()
    const { error } = await supabase.from('reviews').insert([form])
    if (!error) onSave()
    else alert('Erro ao salvar!')
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="button" onClick={onCancel} style={{ ...styles.btn, background: 'transparent', color: '#333', border: '1px solid #ccc', marginBottom: '15px' }}>
        <ArrowLeft size={16} /> Voltar
      </button>

      <label style={styles.label}>Nome do Café</label>
      <input style={styles.input} required placeholder="Ex: Bourbon Amarelo" onChange={e => setForm({...form, coffee_name: e.target.value})} />

      <label style={styles.label}>Marca / Torrefação</label>
      <input style={styles.input} placeholder="Ex: Orfeu, Coffee Lab..." onChange={e => setForm({...form, brand: e.target.value})} />

      <label style={styles.label}>Origem</label>
      <input style={styles.input} placeholder="Ex: Cerrado Mineiro" onChange={e => setForm({...form, origin: e.target.value})} />

      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Método</label>
          <select style={styles.input} onChange={e => setForm({...form, brew_method: e.target.value})}>
            <option>Coado (V60/Melitta)</option><option>Espresso</option><option>Prensa Francesa</option><option>Aeropress</option><option>Moka</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Torra</label>
          <select style={styles.input} onChange={e => setForm({...form, roast_level: e.target.value})}>
            <option>Clara</option><option>Média</option><option>Escura</option>
          </select>
        </div>
      </div>

      <label style={styles.label}>Acidez (1 = Baixa, 5 = Cítrica/Alta)</label>
      <input type="range" min="1" max="5" style={{ width: '100%', marginBottom: '15px' }} value={form.acidity} onChange={e => setForm({...form, acidity: e.target.value})} />

      <label style={styles.label}>Corpo (1 = Água, 5 = Xarope)</label>
      <input type="range" min="1" max="5" style={{ width: '100%', marginBottom: '15px' }} value={form.body} onChange={e => setForm({...form, body: e.target.value})} />

      <label style={styles.label}>Sua Nota (1 a 5)</label>
      <input type="number" min="1" max="5" style={styles.input} value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} />

      <label style={styles.label}>Notas Sensoriais (Opcional)</label>
      <textarea style={{ ...styles.input, height: '80px' }} placeholder="Senti notas de chocolate, caramelo..." onChange={e => setForm({...form, notes: e.target.value})}></textarea>

      <button type="submit" style={{ ...styles.btn, width: '100%', justifyContent: 'center', fontSize: '1.1rem' }}>Salvar Review</button>
    </form>
  )
}
