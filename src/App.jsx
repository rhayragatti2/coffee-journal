import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import { 
  Coffee, Plus, Star, ArrowLeft, Bean, Droplets, Camera, 
  Image as ImageIcon, Loader2, Flame, Trash2, Edit3, Search, 
  Heart, LayoutGrid, BarChart3, BookOpen, Clock, Calculator, ChevronRight
} from 'lucide-react'

const theme = {
  primary: '#6F4E37',
  secondary: '#A67B5B',
  accent: '#ECB159',
  bg: '#FDFBF7',
  card: '#FFFFFF',
  text: '#3C2A21'
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home') // home, stats, brew, guide
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
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', paddingBottom: '90px', color: theme.text }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
        
        {view === 'list' ? (
          <>
            {activeTab === 'home' && (
              <HomeTab reviews={filteredReviews} searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
                onEdit={(r) => { setCurrentReview(r); setView('edit'); }} 
                onToggleFavorite={async (id, status) => {
                  await supabase.from('reviews').update({ is_favorite: !status }).eq('id', id);
                  fetchReviews();
                }}
              />
            )}
            {activeTab === 'stats' && <StatsTab reviews={reviews} />}
            {activeTab === 'brew' && <BrewToolsTab />}
            {activeTab === 'guide' && <GuideTab />}
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

      {/* NAVEGAÇÃO INFERIOR */}
      {view === 'list' && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: '75px',
          backgroundColor: '#FFF', display: 'flex', justifyContent: 'space-around',
          alignItems: 'center', boxShadow: '0 -5px 20px rgba(0,0,0,0.05)', zIndex: 1000,
          paddingBottom: 'env(safe-area-inset-bottom)', borderTop: '1px solid #EEE'
        }}>
          <NavButton icon={<LayoutGrid size={22}/>} label="Início" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavButton icon={<BarChart3 size={22}/>} label="Stats" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
          
          <button onClick={() => setView('add')} style={{
            width: '56px', height: '56px', borderRadius: '50%', backgroundColor: theme.primary,
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: '-35px', boxShadow: `0 8px 15px ${theme.primary}44`, border: 'none'
          }}><Plus size={28} /></button>

          <NavButton icon={<Calculator size={22}/>} label="Preparo" active={activeTab === 'brew'} onClick={() => setActiveTab('brew')} />
          <NavButton icon={<BookOpen size={22}/>} label="Guias" active={activeTab === 'guide'} onClick={() => setActiveTab('guide')} />
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
      fontSize: '10px', fontWeight: active ? 'bold' : '500', transition: '0.2s'
    }}>{icon}<span>{label}</span></button>
  )
}

// --- ABA: FERRAMENTAS DE PREPARO (CALCULADORA) ---
function BrewToolsTab() {
  const [coffee, setCoffee] = useState(15);
  const [ratio, setRatio] = useState(15); // 1:15 default

  const water = coffee * ratio;

  return (
    <div>
      <h2 style={{ fontSize: '1.4rem', color: theme.primary, marginBottom: '20px' }}>Calculadora de Proporção</h2>
      <div style={{ background: 'white', padding: '25px', borderRadius: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: theme.secondary }}>QUANTIDADE DE CAFÉ (g)</label>
          <input type="number" value={coffee} onChange={(e) => setCoffee(e.target.value)} 
            style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #EEE', marginTop: '8px', fontSize: '1.2rem', fontWeight: 'bold' }} />
        </div>
        <div style={{ marginBottom: '25px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: theme.secondary }}>PROPORÇÃO (1:{ratio})</label>
          <input type="range" min="10" max="20" value={ratio} onChange={(e) => setRatio(e.target.value)} 
            style={{ width: '100%', accentColor: theme.primary, marginTop: '10px' }} />
        </div>
        <div style={{ textAlign: 'center', padding: '20px', backgroundColor: theme.bg, borderRadius: '15px' }}>
          <span style={{ fontSize: '0.9rem', color: theme.secondary }}>Você precisará de:</span>
          <h1 style={{ margin: '5px 0', color: theme.primary }}>{water}ml <span style={{ fontSize: '1rem' }}>de água</span></h1>
        </div>
      </div>
      <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', background: '#F0EBE3', borderRadius: '15px', color: theme.primary }}>
        <Clock size={20} />
        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Em breve: Temporizador de Extração</span>
      </div>
    </div>
  )
}

// --- ABA: GUIAS DE PREPARO ---
function GuideTab() {
  const guides = [
    { name: 'Hario V60', ratio: '1:15', grind: 'Média-Fina', temp: '92-96°C' },
    { name: 'Prensa Francesa', ratio: '1:12', grind: 'Grossa', temp: '94°C' },
    { name: 'Aeropress', ratio: '1:13', grind: 'Média', temp: '85-90°C' },
    { name: 'Moka (Italiana)', ratio: '1:10', grind: 'Fina', temp: 'Água quente' }
  ];

  return (
    <div>
      <h2 style={{ fontSize: '1.4rem', color: theme.primary, marginBottom: '20px' }}>Guia de Preparo</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {guides.map(g => (
          <div key={g.name} style={{ background: 'white', padding: '18px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
            <div>
              <h4 style={{ margin: 0, color: theme.primary }}>{g.name}</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: theme.secondary }}>Moagem: {g.grind} • Temp: {g.temp}</p>
            </div>
            <ChevronRight size={18} color={theme.secondary} />
          </div>
        ))}
      </div>
    </div>
  )
}

// --- ABA: HOME (LISTA) ---
function HomeTab({ reviews, searchTerm, setSearchTerm, onEdit, onToggleFavorite }) {
  return (
    <>
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={18} color={theme.secondary} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
        <input type="text" placeholder="Buscar café..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '15px', border: 'none', backgroundColor: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', boxSizing: 'border-box' }} 
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {reviews.map(r => (
          <ReviewCard key={r.id} review={r} onEdit={() => onEdit(r)} onToggleFavorite={() => onToggleFavorite(r.id, r.is_favorite)} />
        ))}
      </div>
    </>
  )
}

// --- ABA: STATS (SIMPLIFICADA POR ENQUANTO) ---
function StatsTab({ reviews }) {
  const total = reviews.length;
  const favs = reviews.filter(r => r.is_favorite).length;
  return (
    <div>
      <h2 style={{ fontSize: '1.4rem', color: theme.primary, marginBottom: '20px' }}>Estatísticas</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.7rem', color: theme.secondary, fontWeight: 'bold' }}>TOTAL</span>
          <h2 style={{ margin: '5px 0', color: theme.primary }}>{total}</h2>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.7rem', color: theme.secondary, fontWeight: 'bold' }}>FAVORITOS</span>
          <h2 style={{ margin: '5px 0', color: theme.accent }}>{favs}</h2>
        </div>
      </div>
      <p style={{ textAlign: 'center', marginTop: '30px', color: theme.secondary, fontStyle: 'italic', fontSize: '0.8rem' }}>
        Em breve: Gráficos de métodos e histórico de aprendizado.
      </p>
    </div>
  )
}

// (Mantenha os componentes ReviewCard e ReviewForm que já corrigimos anteriormente)
// Nota: Certifique-se de que o ReviewCard usa o layout corrigido para quando não há imagem.
