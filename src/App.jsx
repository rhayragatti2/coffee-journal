import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import { 
  Coffee, Plus, Star, ArrowLeft, Bean, Droplets, Camera, 
  Image as ImageIcon, Loader2, Flame, Trash2, Edit3, Search, 
  Heart, LayoutGrid, BarChart3, BookOpen, Clock, Calculator, ChevronRight
} from 'lucide-react'

const theme = {
  primary: '#6F4E37',import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import { 
  Coffee, Plus, Star, ArrowLeft, Bean, Droplets, Camera, 
  Image as ImageIcon, Loader2, Flame, Trash2, Edit3, Search, 
  Heart, LayoutGrid, BarChart3, BookOpen, Clock, Calculator, ChevronRight, Play, Pause, RotateCcw
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
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', paddingBottom: '90px', color: theme.text, fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
        
        {view === 'list' ? (
          <>
            {activeTab === 'home' && (
              <HomeTab reviews={filteredReviews} searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
                onEdit={(r) => { setCurrentReview(r); setView('edit'); }} 
                onDelete={async (id) => {
                  if(window.confirm("Eliminar review?")) {
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

      {/* NAVEGAÇÃO INFERIOR FIXA */}
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
            color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: '-35px', boxShadow: `0 8px 15px ${theme.primary}44`, cursor: 'pointer'
          }}><Plus size={28} /></button>

          <NavButton icon={<Clock size={22}/>} label="Preparo" active={activeTab === 'brew'} onClick={() => setActiveTab('brew')} />
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
      fontSize: '10px', fontWeight: active ? 'bold' : '500', cursor: 'pointer'
    }}>{icon}<span>{label}</span></button>
  )
}

// --- ABA: FERRAMENTAS DE PREPARO (CALCULADORA + TIMER) ---
function BrewToolsTab() {
  const [coffee, setCoffee] = useState(15);
  const [ratio, setRatio] = useState(15);
  
  // Lógica do Timer
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      <section>
        <h2 style={{ fontSize: '1.3rem', color: theme.primary, marginBottom: '15px' }}>Temporizador</h2>
        <div style={{ background: 'white', padding: '30px', borderRadius: '25px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '4rem', fontWeight: '800', fontFamily: 'monospace', color: theme.primary, marginBottom: '20px' }}>
            {formatTime(time)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <button onClick={handleReset} style={{ background: '#F5F5F5', border: 'none', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <RotateCcw size={20} color={theme.secondary} />
            </button>
            <button onClick={() => setIsRunning(!isRunning)} style={{ background: theme.primary, border: 'none', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: `0 4px 10px ${theme.primary}44` }}>
              {isRunning ? <Pause size={24} color="white" /> : <Play size={24} color="white" style={{ marginLeft: '4px' }} />}
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.3rem', color: theme.primary, marginBottom: '15px' }}>Calculadora</h2>
        <div style={{ background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: theme.secondary }}>CAFÉ (g)</label>
          <input type="number" value={coffee} onChange={(e) => setCoffee(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #EEE', margin: '8px 0 20px 0', fontSize: '1.1rem', outline: 'none' }} />
          <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: theme.secondary }}>PROPORÇÃO (1:{ratio})</label>
          <input type="range" min="10" max="20" value={ratio} onChange={(e) => setRatio(e.target.value)} style={{ width: '100%', accentColor: theme.primary, margin: '10px 0 20px 0' }} />
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: theme.bg, borderRadius: '15px' }}>
            <h2 style={{ margin: 0, color: theme.primary }}>{coffee * ratio}ml <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>água</span></h2>
          </div>
        </div>
      </section>
    </div>
  )
}

// --- RESTANTES COMPONENTES (IGUAIS AO ANTERIOR) ---
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
        {reviews.length === 0 ? (
          <p style={{ textAlign: 'center', color: theme.secondary, marginTop: '20px' }}>Nenhum café registado.</p>
        ) : (
          reviews.map(r => (
            <ReviewCard key={r.id} review={r} onEdit={() => onEdit(r)} onDelete={() => onDelete(r.id)} onToggleFavorite={() => onToggleFavorite(r.id, r.is_favorite)} />
          ))
        )}
      </div>
    </>
  )
}

function ReviewCard({ review, onEdit, onDelete, onToggleFavorite }) {
  const hasImage = !!review.image_url;
  return (
    <div style={{ background: theme.card, borderRadius: '25px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.04)', position: 'relative' }}>
      {hasImage && <img src={review.image_url} alt="Café" style={{ width: '100%', height: '220px', objectFit: 'cover' }} />}
      <div style={{ position: hasImage ? 'absolute' : 'relative', top: hasImage ? '15px' : '0', padding: hasImage ? '0 15px' : '15px 15px 0 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', boxSizing: 'border-box', zIndex: 10 }}>
        <button onClick={onToggleFavorite} style={{ background: 'white', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
          <Heart size={18} fill={review.is_favorite ? "#d9534f" : "none"} color={review.is_favorite ? "#d9534f" : theme.secondary} />
        </button>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '5px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 'bold', color: theme.accent, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            {review.rating} <Star size={12} fill={theme.accent} stroke="none" />
          </div>
          <button onClick={onEdit} style={{ background: 'white', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer' }}><Edit3 size={14} color={theme.primary} /></button>
          <button onClick={onDelete} style={{ background: 'white', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer' }}><Trash2 size={14} color="#d9534f" /></button>
        </div>
      </div>
      <div style={{ padding: '15px 20px 20px 20px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{review.coffee_name}</h3>
        <p style={{ margin: '2px 0 15px 0', color: theme.secondary, fontSize: '0.85rem' }}>{review.brand} • {review.origin}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.75rem', color: '#666' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Droplets size={12} color={theme.secondary}/> Acidez: {review.acidity}/5</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Bean size={12} color={theme.secondary}/> Corpo: {review.body}/5</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Flame size={12} color={theme.secondary}/> Torra: {review.roast_level}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Coffee size={12} color={theme.secondary}/> {review.brew_method}</div>
        </div>
      </div>
    </div>
  )
}

function StatsTab({ reviews }) {
  const total = reviews.length;
  const favs = reviews.filter(r => r.is_favorite).length;
  secondary: '#A67B5B',
  accent: '#ECB159',
  bg: '#FDFBF7',
  card: '#FFFFFF',
  text: '#3C2A21'
}

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
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', paddingBottom: '90px', color: theme.text, fontFamily: 'sans-serif' }}>
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

      {/* NAVEGAÇÃO INFERIOR FIXA */}
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
            color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: '-35px', boxShadow: `0 8px 15px ${theme.primary}44`, cursor: 'pointer'
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
      
      {/* Container de Ícones Superiores */}
      <div style={{ 
        position: hasImage ? 'absolute' : 'relative', 
        top: hasImage ? '15px' : '0', 
        padding: hasImage ? '0 15px' : '15px 15px 0 15px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', boxSizing: 'border-box', zIndex: 10 
      }}>
        <button onClick={onToggleFavorite} style={{ background: 'white', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
          <Heart size={18} fill={review.is_favorite ? "#d9534f" : "none"} color={review.is_favorite ? "#d9534f" : theme.secondary} />
        </button>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '5px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 'bold', color: theme.accent, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            {review.rating} <Star size={12} fill={theme.accent} stroke="none" />
          </div>
          <button onClick={onEdit} style={{ background: 'white', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer' }}><Edit3 size={14} color={theme.primary} /></button>
          <button onClick={onDelete} style={{ background: 'white', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer' }}><Trash2 size={14} color="#d9534f" /></button>
        </div>
      </div>

      <div style={{ padding: '15px 20px 20px 20px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{review.coffee_name}</h3>
        <p style={{ margin: '2px 0 15px 0', color: theme.secondary, fontSize: '0.85rem' }}>{review.brand} • {review.origin}</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.75rem', color: '#666' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Droplets size={12} color={theme.secondary}/> Acidez: {review.acidity}/5</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Bean size={12} color={theme.secondary}/> Corpo: {review.body}/5</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Flame size={12} color={theme.secondary}/> Torra: {review.roast_level}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Coffee size={12} color={theme.secondary}/> {review.brew_method}</div>
        </div>

        {review.notes && (
          <div style={{ marginTop: '15px', padding: '10px', background: '#F9F9F9', borderRadius: '12px', borderLeft: `3px solid ${theme.accent}`, fontSize: '0.8rem', fontStyle: 'italic' }}>
            "{review.notes}"
          </div>
        )}
      </div>
    </div>
  )
}

function StatsTab({ reviews }) {
  const total = reviews.length;
  const favs = reviews.filter(r => r.is_favorite).length;
  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', color: theme.primary, marginBottom: '20px' }}>Estatísticas</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.7rem', color: theme.secondary, fontWeight: 'bold' }}>TOTAL</span>
          <h2 style={{ margin: '5px 0' }}>{total}</h2>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.7rem', color: theme.secondary, fontWeight: 'bold' }}>FAVORITOS</span>
          <h2 style={{ margin: '5px 0', color: theme.accent }}>{favs}</h2>
        </div>
      </div>
    </div>
  )
}

function BrewToolsTab() {
  const [coffee, setCoffee] = useState(15);
  const [ratio, setRatio] = useState(15);
  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', color: theme.primary, marginBottom: '20px' }}>Calculadora</h2>
      <div style={{ background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: theme.secondary }}>CAFÉ (g)</label>
        <input type="number" value={coffee} onChange={(e) => setCoffee(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #EEE', margin: '8px 0 20px 0', fontSize: '1.1rem' }} />
        <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: theme.secondary }}>PROPORÇÃO (1:{ratio})</label>
        <input type="range" min="10" max="20" value={ratio} onChange={(e) => setRatio(e.target.value)} style={{ width: '100%', accentColor: theme.primary, margin: '10px 0 20px 0' }} />
        <div style={{ textAlign: 'center', padding: '15px', backgroundColor: theme.bg, borderRadius: '15px' }}>
          <h2 style={{ margin: 0, color: theme.primary }}>{coffee * ratio}ml <span style={{ fontSize: '0.9rem' }}>água</span></h2>
        </div>
      </div>
    </div>
  )
}

function GuideTab() {
  const guides = [
    { name: 'Hario V60', ratio: '1:15', grind: 'Média-Fina' },
    { name: 'Prensa Francesa', ratio: '1:12', grind: 'Grossa' },
    { name: 'Aeropress', ratio: '1:13', grind: 'Média' }
  ];
  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', color: theme.primary, marginBottom: '20px' }}>Guias</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {guides.map(g => (
          <div key={g.name} style={{ background: 'white', padding: '15px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
            <div><h4 style={{ margin: 0 }}>{g.name}</h4><p style={{ margin: 0, fontSize: '0.7rem', color: theme.secondary }}>{g.grind} • {g.ratio}</p></div>
            <ChevronRight size={16} color={theme.secondary} />
          </div>
        ))}
      </div>
    </div>
  )
}

function ReviewForm({ mode, initialData, onSave, onCancel }) {
  const [form, setForm] = useState(initialData || { coffee_name: '', brand: '', origin: '', brew_method: 'Coado (V60/Melitta)', roast_level: 'Média', rating: 5, notes: '', image_url: '', acidity: 3, body: 3, is_favorite: false })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('coffee-images').upload(fileName, file);
    if (!error) {
      const { data } = supabase.storage.from('coffee-images').getPublicUrl(fileName);
      setForm({ ...form, image_url: data.publicUrl });
    }
    setUploading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { error } = mode === 'edit' 
      ? await supabase.from('reviews').update(form).eq('id', initialData.id)
      : await supabase.from('reviews').insert([form]);
    if (!error) onSave();
  }

  const inputS = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', border: '1px solid #EEE', boxSizing: 'border-box' }

  return (
    <form onSubmit={handleSubmit} style={{ background: 'white', padding: '20px', borderRadius: '25px' }}>
      <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', marginBottom: '15px' }}><ArrowLeft /></button>
      <div onClick={() => fileInputRef.current.click()} style={{ width: '100%', height: '180px', background: '#F5F5F5', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', overflow: 'hidden', cursor: 'pointer' }}>
        {form.image_url ? <img src={form.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : uploading ? <Loader2 className="animate-spin" /> : <Camera color="#CCC" />}
      </div>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
      
      <input style={inputS} placeholder="Nome do Café" required value={form.coffee_name} onChange={e => setForm({...form, coffee_name: e.target.value})} />
      <input style={inputS} placeholder="Marca" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} />
      <input style={inputS} placeholder="Origem" value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} />
      
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', fontSize: '0.9rem' }}>
        <input type="checkbox" checked={form.is_favorite} onChange={e => setForm({...form, is_favorite: e.target.checked})} /> Favorito ❤️
      </label>

      <button type="submit" style={{ width: '100%', background: theme.primary, color: 'white', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold' }}>Salvar</button>
    </form>
  )
}
