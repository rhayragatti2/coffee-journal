import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import { 
  Plus, Star, ArrowLeft, Bean, Droplets, Camera, 
  Loader2, Flame, Trash2, Edit3, Search, 
  Heart, LayoutGrid, BarChart3, Clock, Coffee, Package, ShoppingCart, CheckCircle2, Pause, Play, RotateCcw,
  BrainCircuit, ChevronLeft, ChevronRight
} from 'lucide-react'

const theme = {
  primary: '#6F4E37',
  secondary: '#A67B5B',
  accent: '#ECB159',
  bg: '#FDFBF7',
  card: '#FFFFFF',
  text: '#3C2A21'
}

// GUIA DE SABORES EXPANDIDO
const flavorWheel = {
  "Frutado": ["Limão", "Laranja", "Maçã Verde", "Morango", "Mirtilo", "Uva", "Pêssego", "Manga"],
  "Floral": ["Jasmim", "Flor de Laranjeira", "Rosa", "Hibisco", "Chá Verde"],
  "Doce": ["Caramelo", "Mel", "Açúcar Mascavo", "Baunilha", "Melaço"],
  "Chocolate": ["Chocolate Amargo", "Chocolate ao Leite", "Cacau", "Trufa"],
  "Castanhas": ["Amêndoa", "Avelã", "Nozes", "Amendoim", "Castanha-do-Pará"],
  "Especiarias": ["Canela", "Cravo", "Noz-moscada", "Cardamomo", "Pimenta"],
  "Fermentado": ["Vinho Tinto", "Whisky", "Frutas Passas", "Cerveja Artesanal"]
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home') 
  const [view, setView] = useState('list') 
  const [reviews, setReviews] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentReview, setCurrentReview] = useState(null)

  useEffect(() => { fetchReviews() }, [])

  async function fetchReviews() {
    const { data } = await supabase.from('reviews').select('*')
      .order('is_favorite', { ascending: false })
      .order('created_at', { ascending: false })
    if (data) setReviews(data)
  }

  const filteredReviews = reviews.filter(r => 
    r.coffee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', paddingBottom: '100px', color: theme.text, fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
        {view === 'list' ? (
          <>
            {activeTab === 'home' && (
              <HomeTab reviews={filteredReviews} searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
                onEdit={(r) => { setCurrentReview(r); setView('edit'); }} 
                onDelete={async (id) => {
                  if(window.confirm("Excluir review?")) {
                    await supabase.from('reviews').delete().eq('id', id);
                    fetchReviews();
                  }
                }}
                onToggleFavorite={async (id, status) => {
                  await supabase.from('reviews').update({ is_favorite: !status }).eq('id', id);
                  fetchReviews();
                }}
              />
            )}
            {activeTab === 'stats' && <StatsTab reviews={reviews} />}
            {activeTab === 'brew' && <BrewToolsTab />}
            {activeTab === 'pantry' && <PantryTab />}
          </>
        ) : (
          <ReviewForm 
            mode={view} 
            initialData={currentReview} 
            onSave={() => { setView('list'); fetchReviews(); setCurrentReview(null); }} 
            onCancel={() => { setView('list'); setCurrentReview(null); }} 
          />
        )}
      </div>

      {view === 'list' && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: '80px',
          backgroundColor: '#FFF', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
          alignItems: 'center', boxShadow: '0 -5px 20px rgba(0,0,0,0.05)', zIndex: 1000,
          paddingBottom: 'env(safe-area-inset-bottom)', borderTop: '1px solid #EEE'
        }}>
          <NavButton icon={<LayoutGrid size={22}/>} label="Início" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavButton icon={<BarChart3 size={22}/>} label="Stats" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <button onClick={() => setView('add')} style={{
              width: '56px', height: '56px', borderRadius: '50%', backgroundColor: theme.primary,
              color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: '-35px', boxShadow: `0 8px 15px ${theme.primary}44`, cursor: 'pointer'
            }}><Plus size={28} /></button>
          </div>
          <NavButton icon={<Clock size={22}/>} label="Preparo" active={activeTab === 'brew'} onClick={() => setActiveTab('brew')} />
          <NavButton icon={<Package size={22}/>} label="Despensa" active={activeTab === 'pantry'} onClick={() => setActiveTab('pantry')} />
        </nav>
      )}
    </div>
  )
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '4px', color: active ? theme.primary : '#A0A0A0',
      fontSize: '10px', fontWeight: active ? 'bold' : '500', cursor: 'pointer'
    }}>{icon}<span>{label}</span></button>
  )
}

function HomeTab({ reviews, searchTerm, setSearchTerm, onEdit, onDelete, onToggleFavorite }) {
  return (
    <>
      <header style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: '800', color: theme.primary }}>COFFEE JOURNAL</h1>
      </header>
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={18} color={theme.secondary} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
        <input type="text" placeholder="Buscar café..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '15px', border: 'none', backgroundColor: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', boxSizing: 'border-box', outline: 'none' }} 
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {reviews.map(r => (
          <ReviewCard key={r.id} review={r} onEdit={() => onEdit(r)} onDelete={() => onDelete(r.id)} onToggleFavorite={() => onToggleFavorite(r.id, r.is_favorite)} />
        ))}
      </div>
    </>
  )
}

function ReviewCard({ review, onEdit, onDelete, onToggleFavorite }) {
  const hasImage = !!review.image_url;
  return (
    <div style={{ background: theme.card, borderRadius: '25px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.04)', position: 'relative' }}>
      {hasImage && <img src={review.image_url} alt="Café" style={{ width: '100%', height: '220px', objectFit: 'cover' }} />}
      <div style={{ position: hasImage ? 'absolute' : 'relative', top: hasImage ? '15px' : '0', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', boxSizing: 'border-box', zIndex: 10 }}>
        <button onClick={onToggleFavorite} style={{ background: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
          <Heart size={18} fill={review.is_favorite ? "#d9534f" : "none"} color={review.is_favorite ? "#d9534f" : theme.secondary} />
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ background: 'white', padding: '5px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 'bold', color: theme.accent, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            {review.rating} <Star size={12} fill={theme.accent} stroke="none" />
          </div>
          <button onClick={onEdit} style={{ background: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer' }}><Edit3 size={14} color={theme.primary} /></button>
          <button onClick={onDelete} style={{ background: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer' }}><Trash2 size={14} color="#d9534f" /></button>
        </div>
      </div>
      <div style={{ padding: '5px 20px 20px 20px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{review.coffee_name}</h3>
        <p style={{ margin: '4px 0 15px 0', color: theme.secondary, fontSize: '0.85rem' }}>{review.brand} • {review.origin}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem', color: '#666' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Droplets size={14} color={theme.secondary}/> Acidez: {review.acidity}/5</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Bean size={14} color={theme.secondary}/> Corpo: {review.body}/5</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Flame size={14} color={theme.secondary}/> Torra: {review.roast_level}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Coffee size={14} color={theme.secondary}/> {review.brew_method}</div>
        </div>
        {review.notes && (
          <div style={{ 
            marginTop: '15px', padding: '12px', background: '#F9F9F9', borderRadius: '12px', 
            borderLeft: `3px solid ${theme.accent}`, fontSize: '0.85rem', fontStyle: 'italic',
            wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap'
          }}>
            "{review.notes}"
          </div>
        )}
      </div>
    </div>
  )
}

function PantryTab() {
  const [items, setItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [wishInput, setWishInput] = useState('');

  useEffect(() => { fetchPantry(); fetchWishlist(); }, []);

  async function fetchPantry() {
    const { data } = await supabase.from('inventory').select('*').order('created_at', { ascending: false });
    if (data) setItems(data);
  }

  async function fetchWishlist() {
    const { data } = await supabase.from('wishlist').select('*').order('created_at', { ascending: false });
    if (data) setWishlist(data);
  }

  async function addInventory() {
    if (!newItemName) return;
    await supabase.from('inventory').insert([{ name: newItemName, brand: '', weight_total: 250, weight_current: 250 }]);
    setNewItemName('');
    fetchPantry();
  }

  async function addWish() {
    if (!wishInput) return;
    await supabase.from('wishlist').insert([{ item_name: wishInput }]);
    setWishInput('');
    fetchWishlist();
  }

  async function updateWeight(id, newWeight) {
    await supabase.from('inventory').update({ weight_current: Math.max(0, newWeight) }).eq('id', id);
    fetchPantry();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <section>
        <h2 style={{ fontSize: '1.3rem', color: theme.primary, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}><Package size={22}/> Estoque</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #EEE', outline: 'none' }} placeholder="Novo café..." value={newItemName} onChange={e => setNewItemName(e.target.value)} />
          <button onClick={addInventory} style={{ background: theme.primary, color: 'white', border: 'none', padding: '12px', borderRadius: '12px' }}><Plus/></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map(item => (
            <div key={item.id} style={{ background: 'white', padding: '15px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                <span style={{ fontSize: '0.8rem', color: theme.secondary }}>{item.weight_current}g / {item.weight_total}g</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#F0F0F0', borderRadius: '10px', marginBottom: '15px' }}>
                <div style={{ width: `${(item.weight_current / item.weight_total) * 100}%`, height: '100%', background: theme.secondary, borderRadius: '10px' }}></div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => updateWeight(item.id, item.weight_current - 18)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #EEE', background: 'none', fontSize: '0.75rem', fontWeight: '600' }}>-18g (1 dose)</button>
