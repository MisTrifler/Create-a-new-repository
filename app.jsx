import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut as fbSignOut, onAuthStateChanged, updateProfile
} from "firebase/auth";
import {
  getFirestore, collection, addDoc, getDocs, deleteDoc,
  doc, query, orderBy, serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC-esKCj7Stl6D3HmoWJuT68ypbhtMfN6M",
  authDomain: "localdeal-26681.firebaseapp.com",
  projectId: "localdeal-26681",
  storageBucket: "localdeal-26681.firebasestorage.app",
  messagingSenderId: "84485130849",
  appId: "1:84485130849:web:287d1ad1a55b08f915f820",
  measurementId: "G-KMVLN44G38"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// Compress image to base64 under ~150KB
const compressImage = (file) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let w = img.width, h = img.height;
      const MAX = 800;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else { w = Math.round(w * MAX / h); h = MAX; }
      }
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #f7f5f2; color: #1a1a1a; }
  input, textarea, select, button { font-family: 'DM Sans', sans-serif; }
  ::placeholder { color: #aaa; }
  .spinner { width:32px;height:32px;border:3px solid #eee;border-top-color:#e8c547;border-radius:50%;animation:spin 0.7s linear infinite;margin:0 auto; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const s = {
  page: { minHeight: "100vh", background: "#f7f5f2" },
  nav: {
    background: "#1a1a1a", color: "#fff", padding: "0 32px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    height: "64px", position: "sticky", top: 0, zIndex: 100,
    boxShadow: "0 2px 20px rgba(0,0,0,0.3)"
  },
  logo: { fontFamily: "'Playfair Display', serif", fontSize: "24px", letterSpacing: "-0.5px", color: "#fff" },
  logoSpan: { color: "#e8c547" },
  navRight: { display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" },
  btn: { padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "14px", transition: "all 0.2s" },
  btnPrimary: { background: "#e8c547", color: "#1a1a1a" },
  btnOutline: { background: "transparent", color: "#fff", border: "1px solid #444" },
  btnDanger: { background: "#ff4444", color: "#fff" },
  btnGreen: { background: "#22c55e", color: "#fff" },
  hero: { background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)", color: "#fff", padding: "60px 32px", textAlign: "center" },
  heroTitle: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 56px)", marginBottom: "16px", lineHeight: 1.1 },
  heroSub: { color: "#aaa", fontSize: "18px", marginBottom: "32px" },
  searchBar: { display: "flex", gap: "12px", maxWidth: "600px", margin: "0 auto", background: "#fff", borderRadius: "12px", padding: "8px", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" },
  searchInput: { flex: 1, padding: "12px 16px", border: "none", outline: "none", fontSize: "16px", borderRadius: "8px", background: "transparent" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "32px 20px" },
  filters: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px", alignItems: "center" },
  filterLabel: { fontWeight: "600", fontSize: "14px", color: "#666", marginRight: "4px" },
  chip: { padding: "8px 16px", borderRadius: "20px", border: "1.5px solid #ddd", cursor: "pointer", fontSize: "13px", fontWeight: "500", background: "#fff", transition: "all 0.15s", whiteSpace: "nowrap" },
  chipActive: { background: "#1a1a1a", color: "#fff", border: "1.5px solid #1a1a1a" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" },
  card: { background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "all 0.2s", cursor: "pointer", border: "1px solid #eee" },
  cardImg: { width: "100%", height: "200px", background: "linear-gradient(135deg, #f0f0f0, #e0e0e0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" },
  cardBody: { padding: "16px" },
  cardTitle: { fontWeight: "600", fontSize: "16px", marginBottom: "6px" },
  cardPrice: { fontSize: "22px", fontWeight: "700", color: "#1a1a1a", marginBottom: "8px" },
  cardMeta: { fontSize: "13px", color: "#888", marginBottom: "12px" },
  badge: { display: "inline-block", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", marginRight: "6px" },
  badgeShip: { background: "#dbeafe", color: "#1d4ed8" },
  badgeLocal: { background: "#dcfce7", color: "#166534" },
  stars: { color: "#e8c547", fontSize: "14px" },
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px", backdropFilter: "blur(4px)" },
  modalBox: { background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.3)" },
  modalHead: { padding: "24px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  modalTitle: { fontFamily: "'Playfair Display', serif", fontSize: "22px" },
  modalBody: { padding: "0 28px 28px" },
  field: { marginBottom: "16px" },
  label: { display: "block", fontWeight: "600", fontSize: "13px", marginBottom: "6px", color: "#555" },
  input: { width: "100%", padding: "12px 14px", border: "1.5px solid #e5e5e5", borderRadius: "10px", fontSize: "15px", outline: "none", transition: "border 0.2s" },
  select: { width: "100%", padding: "12px 14px", border: "1.5px solid #e5e5e5", borderRadius: "10px", fontSize: "15px", outline: "none", background: "#fff" },
  authBox: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f5f2", padding: "20px" },
  authCard: { background: "#fff", borderRadius: "24px", padding: "48px 40px", width: "100%", maxWidth: "420px", boxShadow: "0 8px 40px rgba(0,0,0,0.1)" },
  authTitle: { fontFamily: "'Playfair Display', serif", fontSize: "32px", marginBottom: "8px", textAlign: "center" },
  authSub: { color: "#888", textAlign: "center", marginBottom: "32px", fontSize: "15px" },
  divider: { height: "1px", background: "#eee", margin: "20px 0" },
  emptyState: { textAlign: "center", padding: "80px 20px", color: "#888" },
  emptyIcon: { fontSize: "64px", marginBottom: "16px" },
  emptyTitle: { fontSize: "20px", fontWeight: "600", marginBottom: "8px", color: "#444" },
  detailModal: { background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "680px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.3)" },
  tag: { display: "inline-block", padding: "4px 12px", borderRadius: "20px", background: "#f0f0f0", fontSize: "12px", fontWeight: "600", marginRight: "6px" },
  errorBox: { background: "#fff0f0", border: "1px solid #fca5a5", borderRadius: "10px", padding: "12px 16px", color: "#dc2626", fontSize: "14px", marginBottom: "16px" },
  photoGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "8px" },
  photoThumb: { width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "8px", border: "1px solid #eee" },
  uploadBox: { display: "block", width: "100%", border: "2px dashed #ddd", borderRadius: "10px", padding: "20px", textAlign: "center", cursor: "pointer", color: "#888", fontSize: "14px", marginTop: "8px" },
};

const CATEGORIES = ["All", "Electronics", "Furniture", "Clothing", "Books", "Tools", "Sports", "Other"];
const CATEGORY_ICONS = { Electronics: "💻", Furniture: "🛋️", Clothing: "👕", Books: "📚", Tools: "🔧", Sports: "⚽", Other: "📦" };

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [delivery, setDelivery] = useState("all");
  const [showPost, setShowPost] = useState(false);
  const [showMyListings, setShowMyListings] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showMsg, setShowMsg] = useState(false);
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [photos, setPhotos] = useState([]); // base64 strings
  const [newItem, setNewItem] = useState({
    title: "", price: "", description: "", category: "Electronics",
    location: "", condition: "Good", shipsAnywhere: false, videoUrl: "", imageEmoji: "📦"
  });
  const photoInputRef = useRef();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setAuthLoading(false); });
    return unsub;
  }, []);

  useEffect(() => { loadListings(); }, []);

  const loadListings = async () => {
    setListingsLoading(true);
    try {
      const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setListings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    setListingsLoading(false);
  };

  const handleAuth = async () => {
    setAuthError("");
    if (!email || !password) return setAuthError("Please enter your email and password.");
    if (isSignUp) {
      if (!displayName.trim()) return setAuthError("Please enter your name.");
      if (password !== confirmPassword) return setAuthError("Passwords don't match — please check and try again.");
      if (password.length < 6) return setAuthError("Password must be at least 6 characters.");
    }
    setAuthBusy(true);
    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: displayName.trim() });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (e) {
      const msgs = {
        "auth/user-not-found": "No account found. Try signing up!",
        "auth/wrong-password": "Incorrect password.",
        "auth/email-already-in-use": "Email already registered. Try signing in.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/too-many-requests": "Too many attempts — please wait and try again.",
        "auth/invalid-credential": "Incorrect email or password.",
      };
      setAuthError(msgs[e.code] || e.message);
    }
    setAuthBusy(false);
  };

  const handleSignOut = () => fbSignOut(auth);

  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files).slice(0, 8 - photos.length);
    const compressed = await Promise.all(files.map(compressImage));
    setPhotos(prev => [...prev, ...compressed]);
  };

  const removePhoto = (i) => setPhotos(prev => prev.filter((_, idx) => idx !== i));

  const postItem = async () => {
    if (!newItem.title || !newItem.price) return setPostError("Please fill in title and price.");
    setPosting(true); setPostError("");
    try {
      await addDoc(collection(db, "listings"), {
        ...newItem,
        price: parseFloat(newItem.price),
        photos,
        seller: user.displayName || user.email.split("@")[0],
        sellerEmail: user.email,
        sellerId: user.uid,
        date: new Date().toLocaleDateString("en-GB"),
        createdAt: serverTimestamp()
      });
      await loadListings();
      setShowPost(false);
      setNewItem({ title: "", price: "", description: "", category: "Electronics", location: "", condition: "Good", shipsAnywhere: false, videoUrl: "", imageEmoji: "📦" });
      setPhotos([]);
    } catch (e) { setPostError("Failed to post: " + e.message); }
    setPosting(false);
  };

  const deleteItem = async (id) => {
    if (!confirm("Delete this listing?")) return;
    await deleteDoc(doc(db, "listings", id));
    await loadListings();
  };

  const filtered = listings.filter(l => {
    const matchSearch = l.title?.toLowerCase().includes(search.toLowerCase()) || l.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || l.category === category;
    const matchDel = delivery === "all" || (delivery === "ship" && l.shipsAnywhere) || (delivery === "local" && !l.shipsAnywhere);
    return matchSearch && matchCat && matchDel;
  });

  const myListings = listings.filter(l => l.sellerId === user?.uid);

  if (authLoading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f5f2" }}>
      <style>{STYLES}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", marginBottom: "24px" }}>Local<span style={{ color: "#e8c547" }}>Deal</span></div>
        <div className="spinner" />
      </div>
    </div>
  );

  if (!user) return (
    <>
      <Head><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6766161069412141" crossOrigin="anonymous"></script></Head>
      <style>{STYLES}</style>
      <div style={s.authBox}>
        <div style={s.authCard}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "48px", marginBottom: "8px" }}>🏪</div>
            <div style={s.authTitle}>Local<span style={{ color: "#e8c547" }}>Deal</span></div>
            <div style={s.authSub}>{isSignUp ? "Create your free account" : "Buy & sell locally. See first. Trust always."}</div>
          </div>
          {authError && <div style={s.errorBox}>⚠️ {authError}</div>}
          {isSignUp && (
            <div style={s.field}>
              <label style={s.label}>Your Name</label>
              <input style={s.input} type="text" placeholder="e.g. Vidyut" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>
          )}
          <div style={s.field}>
            <label style={s.label}>Email Address</label>
            <input style={s.input} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => !isSignUp && e.key === "Enter" && handleAuth()} />
          </div>
          {isSignUp && (
            <div style={s.field}>
              <label style={s.label}>Confirm Password</label>
              <input style={s.input} type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAuth()} />
            </div>
          )}
          <button style={{ ...s.btn, ...s.btnPrimary, width: "100%", padding: "14px", fontSize: "16px", borderRadius: "12px", opacity: authBusy ? 0.7 : 1 }} onClick={handleAuth} disabled={authBusy}>
            {authBusy ? "Please wait..." : isSignUp ? "Create Account →" : "Sign In →"}
          </button>
          <div style={s.divider} />
          <p style={{ textAlign: "center", fontSize: "14px", color: "#666" }}>
            {isSignUp ? "Already have an account? " : "New to LocalDeal? "}
            <span style={{ color: "#e8c547", fontWeight: "600", cursor: "pointer" }} onClick={() => { setIsSignUp(!isSignUp); setAuthError(""); }}>
              {isSignUp ? "Sign In" : "Create Account"}
            </span>
          </p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Head><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6766161069412141" crossOrigin="anonymous"></script></Head>
      <style>{STYLES}</style>
      <div style={s.page}>

        <nav style={s.nav}>
          <div style={s.logo}>Local<span style={s.logoSpan}>Deal</span></div>
          <div style={s.navRight}>
            <span style={{ color: "#888", fontSize: "14px" }}>Hi, {user.displayName || user.email.split("@")[0]}</span>
            <button style={{ ...s.btn, ...s.btnOutline }} onClick={() => setShowMyListings(true)}>My Listings</button>
            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setShowPost(true)}>+ Post Item</button>
            <button style={{ ...s.btn, ...s.btnOutline }} onClick={handleSignOut}>Sign Out</button>
          </div>
        </nav>

        <div style={s.hero}>
          <div style={s.heroTitle}>Buy & Sell <span style={{ color: "#e8c547" }}>Locally</span></div>
          <div style={s.heroSub}>Video inspections • Verified sellers • Ships anywhere</div>
          <div style={s.searchBar}>
            <span style={{ padding: "12px 8px 12px 16px", fontSize: "18px" }}>🔍</span>
            <input style={s.searchInput} placeholder="Search listings..." value={search} onChange={e => setSearch(e.target.value)} />
            <button style={{ ...s.btn, ...s.btnPrimary }}>Search</button>
          </div>
        </div>

        <div style={s.container}>
          <div style={s.filters}>
            <span style={s.filterLabel}>Delivery:</span>
            {[["all","📍 All"],["local","🚶 Local"],["ship","🚚 Ships"]].map(([val,label]) => (
              <button key={val} style={{ ...s.chip, ...(delivery===val?s.chipActive:{}) }} onClick={() => setDelivery(val)}>{label}</button>
            ))}
            <span style={{ ...s.filterLabel, marginLeft: "12px" }}>Category:</span>
            {CATEGORIES.map(c => (
              <button key={c} style={{ ...s.chip, ...(category===c?s.chipActive:{}) }} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>

          <div style={{ marginBottom: "24px", fontSize: "14px", color: "#888" }}>
            {listingsLoading ? "Loading listings..." : `${filtered.length} listing${filtered.length!==1?"s":""} found`}
          </div>

          {listingsLoading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>🏪</div>
              <div style={s.emptyTitle}>No listings yet</div>
              <p style={{ marginBottom: "24px" }}>Be the first to post something!</p>
              <button style={{ ...s.btn, ...s.btnPrimary, padding: "14px 28px", fontSize: "16px" }} onClick={() => setShowPost(true)}>+ Post First Item</button>
            </div>
          ) : (
            <div style={s.grid}>
              {filtered.map(item => (
                <div key={item.id} style={s.card} onClick={() => setSelectedListing(item)}
                  onMouseEnter={e => e.currentTarget.style.transform="translateY(-4px)"}
                  onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}>
                  {item.photos?.[0]
                    ? <img src={item.photos[0]} style={{ width:"100%", height:"200px", objectFit:"cover" }} alt={item.title} />
                    : <div style={s.cardImg}>{item.imageEmoji || CATEGORY_ICONS[item.category] || "📦"}</div>}
                  <div style={s.cardBody}>
                    <div style={s.cardTitle}>{item.title}</div>
                    <div style={s.cardPrice}>£{item.price}</div>
                    <div style={s.cardMeta}><span style={s.stars}>★★★★★</span> · {item.condition} · {item.location||"UK"}</div>
                    <div>
                      {item.shipsAnywhere ? <span style={{...s.badge,...s.badgeShip}}>🚚 Ships</span> : <span style={{...s.badge,...s.badgeLocal}}>📍 Local</span>}
                      <span style={{...s.badge, background:"#f3f4f6", color:"#374151"}}>{item.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* POST MODAL */}
        {showPost && (
          <div style={s.modal} onClick={e => e.target===e.currentTarget && setShowPost(false)}>
            <div style={s.modalBox}>
              <div style={s.modalHead}>
                <div style={s.modalTitle}>Post an Item</div>
                <button style={{...s.btn, background:"#f5f5f5", color:"#333"}} onClick={() => setShowPost(false)}>✕</button>
              </div>
              <div style={s.modalBody}>
                {postError && <div style={s.errorBox}>⚠️ {postError}</div>}

                <div style={s.field}>
                  <label style={s.label}>Photos (up to 8)</label>
                  {photos.length > 0 && (
                    <div style={s.photoGrid}>
                      {photos.map((src, i) => (
                        <div key={i} style={{ position:"relative" }}>
                          <img src={src} style={s.photoThumb} alt="" />
                          <button onClick={() => removePhoto(i)} style={{ position:"absolute", top:"2px", right:"2px", background:"rgba(0,0,0,0.6)", color:"#fff", border:"none", borderRadius:"50%", width:"20px", height:"20px", cursor:"pointer", fontSize:"11px" }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {photos.length < 8 && (
                    <>
                      <label style={s.uploadBox} htmlFor="photo-upload">📷 Click to add photos ({photos.length}/8)</label>
                      <input id="photo-upload" ref={photoInputRef} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={handlePhotoSelect} />
                    </>
                  )}
                </div>

                <div style={s.field}>
                  <label style={s.label}>Video URL (optional)</label>
                  <input style={s.input} placeholder="YouTube or Vimeo link" value={newItem.videoUrl} onChange={e => setNewItem({...newItem, videoUrl:e.target.value})} />
                </div>

                <div style={s.field}>
                  <label style={s.label}>Item Emoji Icon</label>
                  <select style={s.select} value={newItem.imageEmoji} onChange={e => setNewItem({...newItem, imageEmoji:e.target.value})}>
                    {["📦","💻","📱","🛋️","👕","📚","🔧","⚽","🎮","🚗","🏠","💍"].map(em => <option key={em} value={em}>{em}</option>)}
                  </select>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Title *</label>
                  <input style={s.input} placeholder="What are you selling?" value={newItem.title} onChange={e => setNewItem({...newItem, title:e.target.value})} />
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                  <div style={s.field}>
                    <label style={s.label}>Price (£) *</label>
                    <input style={s.input} type="number" placeholder="0.00" value={newItem.price} onChange={e => setNewItem({...newItem, price:e.target.value})} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Category</label>
                    <select style={s.select} value={newItem.category} onChange={e => setNewItem({...newItem, category:e.target.value})}>
                      {CATEGORIES.filter(c=>c!=="All").map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Description</label>
                  <textarea style={{...s.input, minHeight:"80px", resize:"vertical"}} placeholder="Describe your item..." value={newItem.description} onChange={e => setNewItem({...newItem, description:e.target.value})} />
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                  <div style={s.field}>
                    <label style={s.label}>Location</label>
                    <input style={s.input} placeholder="e.g. London, UK" value={newItem.location} onChange={e => setNewItem({...newItem, location:e.target.value})} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Condition</label>
                    <select style={s.select} value={newItem.condition} onChange={e => setNewItem({...newItem, condition:e.target.value})}>
                      {["New","Like New","Good","Fair","Poor"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{...s.field, display:"flex", alignItems:"center", gap:"12px"}}>
                  <input type="checkbox" id="ships" checked={newItem.shipsAnywhere} onChange={e => setNewItem({...newItem, shipsAnywhere:e.target.checked})} style={{ width:"18px", height:"18px", cursor:"pointer" }} />
                  <label htmlFor="ships" style={{ cursor:"pointer", fontWeight:"500" }}>🚚 This item can be shipped anywhere</label>
                </div>

                <button style={{...s.btn,...s.btnPrimary, width:"100%", padding:"14px", fontSize:"16px", borderRadius:"12px", opacity:posting?0.7:1}} onClick={postItem} disabled={posting}>
                  {posting ? "Posting..." : "Post Item →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MY LISTINGS MODAL */}
        {showMyListings && (
          <div style={s.modal} onClick={e => e.target===e.currentTarget && setShowMyListings(false)}>
            <div style={{...s.modalBox, maxWidth:"640px"}}>
              <div style={s.modalHead}>
                <div style={s.modalTitle}>My Listings ({myListings.length})</div>
                <button style={{...s.btn, background:"#f5f5f5", color:"#333"}} onClick={() => setShowMyListings(false)}>✕</button>
              </div>
              <div style={s.modalBody}>
                {myListings.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"40px 0", color:"#888" }}>
                    <div style={{ fontSize:"40px", marginBottom:"12px" }}>📭</div>
                    <p>You haven't posted anything yet.</p>
                    <button style={{...s.btn,...s.btnPrimary, marginTop:"16px"}} onClick={() => { setShowMyListings(false); setShowPost(true); }}>+ Post First Item</button>
                  </div>
                ) : myListings.map(item => (
                  <div key={item.id} style={{ display:"flex", gap:"12px", padding:"12px 0", borderBottom:"1px solid #eee", alignItems:"center" }}>
                    <div style={{ width:"60px", height:"60px", borderRadius:"8px", overflow:"hidden", flexShrink:0, background:"#f0f0f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"24px" }}>
                      {item.photos?.[0] ? <img src={item.photos[0]} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="" /> : (item.imageEmoji||"📦")}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:"600", fontSize:"15px" }}>{item.title}</div>
                      <div style={{ color:"#888", fontSize:"13px" }}>£{item.price} · {item.category} · {item.condition}</div>
                    </div>
                    <button style={{...s.btn,...s.btnDanger, padding:"8px 14px", fontSize:"13px"}} onClick={() => deleteItem(item.id)}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DETAIL MODAL */}
        {selectedListing && (
          <div style={s.modal} onClick={e => { if(e.target===e.currentTarget){setSelectedListing(null);setShowMsg(false);} }}>
            <div style={s.detailModal}>
              {selectedListing.photos?.length > 0 ? (
                <div style={{ display:"flex", gap:"4px", overflowX:"auto", borderRadius:"20px 20px 0 0", maxHeight:"280px" }}>
                  {selectedListing.photos.map((url,i) => (
                    <img key={i} src={url} style={{ height:"280px", minWidth:"280px", objectFit:"cover", borderRadius: i===0?"20px 0 0 0":i===selectedListing.photos.length-1?"0 20px 0 0":"0" }} alt="" />
                  ))}
                </div>
              ) : (
                <div style={{ width:"100%", height:"220px", background:"linear-gradient(135deg,#f0f0f0,#e0e0e0)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"80px", borderRadius:"20px 20px 0 0" }}>
                  {selectedListing.imageEmoji||"📦"}
                </div>
              )}
              <div style={{ padding:"28px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
                  <div>
                    <div style={{ fontFamily:"'Playfair Display', serif", fontSize:"26px", marginBottom:"4px" }}>{selectedListing.title}</div>
                    <div style={{ fontSize:"28px", fontWeight:"700" }}>£{selectedListing.price}</div>
                  </div>
                  <button style={{...s.btn, background:"#f5f5f5", color:"#333"}} onClick={() => { setSelectedListing(null); setShowMsg(false); }}>✕</button>
                </div>
                <div style={{ marginBottom:"16px" }}>
                  <span style={s.tag}>{selectedListing.category}</span>
                  <span style={s.tag}>{selectedListing.condition}</span>
                  {selectedListing.shipsAnywhere ? <span style={{...s.badge,...s.badgeShip}}>🚚 Ships Anywhere</span> : <span style={{...s.badge,...s.badgeLocal}}>📍 Local Pickup</span>}
                </div>
                {selectedListing.description && <p style={{ color:"#555", lineHeight:1.6, marginBottom:"16px" }}>{selectedListing.description}</p>}
                <div style={{ background:"#f7f5f2", borderRadius:"12px", padding:"16px", marginBottom:"20px" }}>
                  <div style={{ fontWeight:"600", marginBottom:"8px" }}>Seller Info</div>
                  <div style={{ color:"#666", fontSize:"14px" }}>👤 {selectedListing.seller}</div>
                  <div style={{ color:"#666", fontSize:"14px" }}>📍 {selectedListing.location||"UK"}</div>
                  <div style={{ color:"#666", fontSize:"14px" }}>📅 Listed {selectedListing.date}</div>
                </div>
                {selectedListing.videoUrl && (
                  <a href={selectedListing.videoUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display:"block", textAlign:"center", padding:"12px", background:"#1a1a1a", color:"#fff", borderRadius:"10px", textDecoration:"none", fontWeight:"600", marginBottom:"12px" }}>
                    🎥 Watch Video Inspection
                  </a>
                )}
                {selectedListing.sellerId !== user.uid ? (
                  !showMsg ? (
                    <button style={{...s.btn,...s.btnPrimary, width:"100%", padding:"14px", fontSize:"16px", borderRadius:"12px"}} onClick={() => setShowMsg(true)}>💬 Message Seller</button>
                  ) : (
                    <div>
                      <textarea style={{...s.input, minHeight:"80px", marginBottom:"10px"}} placeholder="Hi, I'm interested in your item..." value={message} onChange={e => setMessage(e.target.value)} />
                      <button style={{...s.btn,...s.btnGreen, width:"100%", padding:"14px", fontSize:"16px", borderRadius:"12px"}}
                        onClick={() => { alert(`Message sent to ${selectedListing.seller}!`); setShowMsg(false); setMessage(""); }}>
                        Send Message ✓
                      </button>
                    </div>
                  )
                ) : (
                  <button style={{...s.btn,...s.btnDanger, width:"100%", padding:"14px", fontSize:"16px", borderRadius:"12px"}}
                    onClick={() => { deleteItem(selectedListing.id); setSelectedListing(null); }}>
                    🗑️ Delete My Listing
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
