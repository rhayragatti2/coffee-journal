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
        <div style={{ color: theme.accent, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: '
