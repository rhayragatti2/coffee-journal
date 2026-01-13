import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import { 
  Plus, Star, ArrowLeft, Bean, Droplets, Camera, 
  Loader2, Flame, Trash2, Edit3, Search, 
  Heart, LayoutGrid, BarChart3, Clock, Coffee, Package, ShoppingCart, CheckCircle2, Pause, Play, RotateCcw,
  BrainCircuit, ChevronLeft, ChevronRight, Wind
} from 'lucide-react'

const theme = {
  primary: '#6F4E37',
  secondary: '#A67B5B',
  accent: '#ECB159',
  bg: '#FDFBF7',
  card: '#FFFFFF',
  text: '#3C2A21'
}

const flavorWheel = {
  "Frutado": ["Limão", "Laranja", "Maçã Verde", "Morango", "Mirtilo", "Uva", "Pêssego", "Manga"],
  "Floral": ["Jasmim", "Flor de Laranjeira", "Rosa", "Hibisco", "Chá Verde"],
  "Doce": ["Caramelo", "Mel", "Açúcar Mascavo", "Baunilha", "Melaço"],
  "Chocolate": ["Chocolate Amargo", "Chocolate ao Leite", "Cacau", "Trufa"],
  "Castanhas": ["Amêndoa", "Avelã", "Nozes", "Amendoim", "Castanha-do-Pará"],
  "Especiarias": ["Canela", "Cravo", "Noz-moscada", "Cardamomo", "Pimenta"],
  "Fermentado": ["Vinho Tinto", "Whisky", "Frutas Passas", "Cerveja Artesanal"]
};

// COMPONENTE DO GRÁFICO RADAR (SVG)
function RadarChart({ data, size = 150, showLabels = true }) {
  const points = [
    { label: "Acidez", value: data.acidity },
    { label: "Corpo", value: data.body },
    { label: "Doçura", value: data.sweetness || 3 },
    { label: "Amargor", value: data.bitterness || 2 },
    { label: "Aroma", value: data.aroma || 4 }
  ];

  const center = size / 2;
  const radius = (size / 2) * 0.7;
  const angleStep = (Math.PI * 2) / points.length;

  const getCoordinates = (val, i) => {
    const r = (val / 5) * radius;
    const angle = i * angleStep - Math.PI / 2;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const pathData = points.map((p, i) => {
    const { x, y } = getCoordinates(p.value, i);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ') + ' Z';

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        {/* Teia de fundo */}
        {[1, 2, 3, 4, 5].map(tick => (
          <polygon key={tick}
            points={points.map((_, i) => {
              const { x, y } = getCoordinates(tick, i);
              return `${x},${y}`;
            }).join(' ')}
            fill="none" stroke="#EEE" strokeWidth="1"
          />
        ))}
        {/* Eixos */}
        {points.map((_, i) => {
          const { x, y } = getCoordinates(5, i);
          return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#EEE" />;
        })}
        {/* Área preenchida */}
        <path d={pathData} fill={`${theme.accent}44`} stroke={theme.accent} strokeWidth="2" />
        {/* Labels */}
        {showLabels && points.map((p, i) => {
          const { x, y } = getCoordinates(5.8, i);
          return (
            <text key={i} x={x} y={y} fontSize="10" fontWeight="bold" fill={theme.secondary} textAnchor="middle" dominantBaseline="middle">
              {p.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
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

      <div style={{ padding: '5px 20px 20px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{review.coffee_name}</h3>
          <p style={{ margin: '4px 0 15px 0', color: theme.secondary, fontSize: '0.85rem' }}>{review.brand} • {review.origin}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', fontSize: '0.8rem', color: '#666' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Flame size={14} color={theme.secondary}/> Torra: {review.roast_level}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Coffee size={14} color={theme.secondary}/> {review.brew_method}</div>
          </div>
        </div>
        {/* MINI RADAR NO CARD */}
        <div style={{ marginLeft: '10px', opacity: 0.8 }}>
          <RadarChart data={review} size={100} showLabels={false} />
        </div>
      </div>

      {review.notes && (
        <div style={{ 
          margin: '0 20px 20px 20px', padding: '12px', background: '#F9F9F9', borderRadius: '12px', 
          borderLeft: `3px solid ${theme.accent}`, fontSize: '0.85rem', fontStyle: 'italic'
        }}>
          "{review.notes}"
        </div>
      )}
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
                <button onClick={async () => { if(confirm("Excluir?")) { await supabase.from('inventory').delete().eq('id', item.id); fetchPantry(); } }} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: '#f8d7da', color: '#721c24' }}><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: '#FFF7ED', padding: '20px', borderRadius: '25px', border: '1px dashed #ECB159' }}>
        <h2 style={{ fontSize: '1.3rem', color: theme.primary, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}><ShoppingCart size={22}/> Wishlist</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #ECB15944', outline: 'none' }} placeholder="O que quer provar?" value={wishInput} onChange={e => setWishInput(e.target.value)} />
          <button onClick={addWish} style={{ background: theme.accent, color: 'white', border: 'none', padding: '10px', borderRadius: '10px' }}><Plus/></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {wishlist.map(wish => (
            <div key={wish.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '10px 15px', borderRadius: '12px', fontSize: '0.9rem' }}>
              <span>{wish.item_name}</span>
              <button onClick={async () => { await supabase.from('wishlist').delete().eq('id', wish.id); fetchWishlist(); }} style={{ background: 'none', border: 'none', color: theme.secondary }}><CheckCircle2 size={18}/></button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function BrewToolsTab() {
  const [water, setWater] = useState(250);
  const [ratio, setRatio] = useState(15);
  const [coffeeInput, setCoffeeInput] = useState(18); 
  
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const coffeeNeeded = (water / ratio).toFixed(1);
  const waterNeeded = (coffeeInput * ratio).toFixed(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      <section>
        <h2 style={{ fontSize: '1.3rem', color: theme.primary, marginBottom: '15px' }}>Temporizador</h2>
        <div style={{ background: 'white', padding: '30px', borderRadius: '25px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '4rem', fontWeight: '800', fontFamily: 'monospace', color: theme.primary, marginBottom: '20px' }}>{formatTime(time)}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <button onClick={() => {setIsRunning(false); setTime(0)}} style={{ background: '#F5F5F5', border: 'none', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><RotateCcw size={20} color={theme.secondary} /></button>
            <button onClick={() => setIsRunning(!isRunning)} style={{ background: theme.primary, border: 'none', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              {isRunning ? <Pause size={24} color="white" /> : <Play size={24} color="white" style={{ marginLeft: '4px' }} />}
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.3rem', color: theme.primary, marginBottom: '15px' }}>Calculadora</h2>
        <div style={{ background: 'white', padding: '20px', borderRadius: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: theme.secondary }}>ÁGUA (ml)</label>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: theme.primary }}>{water}ml</span>
            </div>
            <input type="range" min="50" max="1000" step="10" value={water} onChange={(e) => setWater(Number(e.target.value))} style={{ width: '100%', accentColor: theme.primary, margin: '10px 0' }} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: theme.secondary }}>PROPORÇÃO (1:{ratio})</label>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: theme.primary }}>1:{ratio}</span>
            </div>
            <input type="range" min="10" max="22" step="1" value={ratio} onChange={(e) => setRatio(Number(e.target.value))} style={{ width: '100%', accentColor: theme.secondary, margin: '10px 0' }} />
          </div>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#FDFBF7', borderRadius: '15px', border: '1px solid #EEE' }}>
            <span style={{ fontSize: '0.7rem', color: theme.secondary, fontWeight: 'bold', display: 'block' }}>VOCÊ PRECISA DE</span>
            <h2 style={{ margin: '5px 0 0 0', color: theme.primary }}>{coffeeNeeded}g <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>de café</span></h2>
          </div>
          <hr style={{ border: 'none', borderTop: '1px dashed #EEE', margin: '5px 0' }} />
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: theme.secondary }}>TENHO ESTA QUANTIA DE CAFÉ (g):</label>
            <input type="number" value={coffeeInput} onChange={(e) => setCoffeeInput(Number(e.target.value))} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #EEE', marginTop: '8px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#FFF7ED', borderRadius: '15px', border: '1px solid #ECB15944' }}>
            <span style={{ fontSize: '0.7rem', color: '#A67B5B', fontWeight: 'bold', display: 'block' }}>USE ESTA QUANTIA DE ÁGUA</span>
            <h2 style={{ margin: '5px 0 0 0', color: '#6F4E37' }}>{waterNeeded}ml <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>de água</span></h2>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatsTab({ reviews }) {
  const total = reviews.length;
  const avgRating = total > 0 ? (reviews.reduce((acc, r) => acc + Number(r.rating), 0) / total).toFixed(1) : 0;

  const getInsight = () => {
    if (total < 3) return "Continue avaliando para gerar insights sobre seu paladar.";
    const roastStats = reviews.reduce((acc, r) => {
      acc[r.roast_level] = (acc[r.roast_level] || { sum: 0, count: 0 });
      acc[r.roast_level].sum += Number(r.rating);
      acc[r.roast_level].count += 1;
      return acc;
    }, {});
    const topRoast = Object.entries(roastStats).sort((a, b) => (b[1].sum/b[1].count) - (a[1].sum/a[1].count))[0];
    return `Seu paladar está evoluindo! Você tende a preferir cafés de Torra ${topRoast[0]}. Que tal buscar origens da Etiópia na próxima compra?`;
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', color: theme.primary, marginBottom: '20px', fontWeight: '800' }}>O Seu Perfil</h2>
      <div style={{ background: 'linear-gradient(135deg, #6F4E37 0%, #3C2A21 100%)', padding: '20px', borderRadius: '25px', marginBottom: '25px', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <BrainCircuit size={40} style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.2 }} />
        <h3 style={{ fontSize: '0.8rem', margin: '0 0 10px 0', opacity: 0.8, textTransform: 'uppercase' }}>Curva de Aprendizado</h3>
        <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '500' }}>{getInsight()}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '25px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: theme.secondary, fontWeight: 'bold' }}>TOTAL</span>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '1.8rem' }}>{total}</h2>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '25px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: theme.secondary, fontWeight: 'bold' }}>MÉDIA</span>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '1.8rem', color: theme.accent }}>{avgRating} <Star size={18} fill={theme.accent} stroke="none" /></h2>
        </div>
      </div>
    </div>
  )
}

function ReviewForm({ mode, initialData, onSave, onCancel }) {
  const [form, setForm] = useState(initialData || { 
    coffee_name: '', brand: '', origin: '', brew_method: 'Coado (V60/Melitta)', 
    roast_level: 'Média', rating: 5, notes: '', image_url: '', 
    acidity: 3, body: 3, sweetness: 3, bitterness: 2, aroma: 4, 
    is_favorite: false 
  })
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const toggleNote = (note) => {
    const currentNotes = form.notes ? form.notes.split(', ') : [];
    const newNotes = currentNotes.includes(note) ? currentNotes.filter(n => n !== note) : [...currentNotes, note];
    setForm({...form, notes: newNotes.join(', ')});
  }

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
    const { error } = mode === 'edit' ? await supabase.from('reviews').update(form).eq('id', initialData.id) : await supabase.from('reviews').insert([form]);
    if (!error) onSave();
  }

  const sliderStyle = { width: '100%', accentColor: theme.primary, marginBottom: '15px' };

  return (
    <form onSubmit={handleSubmit} style={{ background: 'white', padding: '20px', borderRadius: '25px' }}>
      <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', marginBottom: '15px' }}><ArrowLeft /></button>
      
      <div onClick={() => fileInputRef.current.click()} style={{ width: '100%', height: '180px', background: '#F5F5F5', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', overflow: 'hidden', cursor: 'pointer' }}>
        {form.image_url ? <img src={form.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : uploading ? <Loader2 className="animate-spin" /> : <Camera color="#CCC" />}
      </div>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
      
      <input style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', border: '1px solid #EEE' }} placeholder="Nome do Café" required value={form.coffee_name} onChange={e => setForm({...form, coffee_name: e.target.value})} />
      
      {/* GRÁFICO RADAR NO FORMULÁRIO */}
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#FDFBF7', borderRadius: '20px', border: '1px solid #EEE' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: theme.secondary, display: 'block', marginBottom: '20px', textAlign: 'center' }}>PERFIL SENSORIAL</label>
        <RadarChart data={form} size={200} />
        
        <div style={{ marginTop: '30px' }}>
          {['acidity', 'body', 'sweetness', 'bitterness', 'aroma'].map(attr => (
            <div key={attr}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 'bold' }}>
                <span style={{ textTransform: 'uppercase' }}>{attr === 'acidity' ? 'Acidez' : attr === 'body' ? 'Corpo' : attr === 'sweetness' ? 'Doçura' : attr === 'bitterness' ? 'Amargor' : 'Aroma'}</span>
                <span>{form[attr]}/5</span>
              </div>
              <input type="range" min="1" max="5" step="0.5" value={form[attr]} onChange={e => setForm({...form, [attr]: Number(e.target.value)})} style={sliderStyle} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', background: '#FDFBF7', borderRadius: '15px', border: '1px solid #EEE' }}>
        <label style={{ fontSize: '0.7rem', color: theme.secondary, fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>GUIA DE SABORES</label>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px' }}>
          {Object.keys(flavorWheel).map(cat => (
            <button key={cat} type="button" onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)} style={{ padding: '6px 12px', borderRadius: '20px', border: 'none', background: selectedCategory === cat ? theme.primary : '#EEE', color: selectedCategory === cat ? 'white' : theme.text, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{cat}</button>
          ))}
        </div>
        {selectedCategory && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px', padding: '10px', background: 'white', borderRadius: '10px' }}>
            {flavorWheel[selectedCategory].map(note => (
              <button key={note} type="button" onClick={() => toggleNote(note)} style={{ padding: '4px 10px', borderRadius: '8px', border: `1px solid ${form.notes.includes(note) ? theme.accent : '#EEE'}`, background: form.notes.includes(note) ? '#FFF7ED' : 'none', color: theme.text, fontSize: '0.75rem' }}>{note}</button>
            ))}
          </div>
        )}
        <textarea style={{ width: '100%', padding: '10px', minHeight: '60px', marginTop: '10px', fontSize: '0.85rem', border: '1px solid #EEE', borderRadius: '8px' }} placeholder="Notas..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
      </div>

      <label style={{ fontSize: '0.7rem', color: theme.secondary, fontWeight: 'bold' }}>MÉTODO</label>
      <select style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', border: '1px solid #EEE' }} value={form.brew_method} onChange={e => setForm({...form, brew_method: e.target.value})}>
        <option>Coado (V60/Melitta)</option><option>Prensa Francesa</option><option>Espresso</option><option>Aeropress</option><option>Moka</option>
      </select>

      <label style={{ fontSize: '0.7rem', color: theme.secondary, fontWeight: 'bold' }}>TORRA</label>
      <select style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', border: '1px solid #EEE' }} value={form.roast_level} onChange={e => setForm({...form, roast_level: e.target.value})}>
        <option>Clara</option><option>Média</option><option>Escura</option>
      </select>

      <label style={{ fontSize: '0.7rem', color: theme.secondary, fontWeight: 'bold' }}>NOTA GERAL (1-5)</label>
      <input type="number" min="1" max="5" style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', border: '1px solid #EEE' }} value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} />

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <input type="checkbox" checked={form.is_favorite} onChange={e => setForm({...form, is_favorite: e.target.checked})} /> Favorito ❤️
      </label>
      
      <button type="submit" disabled={uploading} style={{ width: '100%', background: theme.primary, color: 'white', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold' }}>
        {uploading ? 'Salvando...' : 'Salvar Review'}
      </button>
    </form>
  )
}
