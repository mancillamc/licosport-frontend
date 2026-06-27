import { useState, useEffect, useCallback } from "react";

// ─── CONFIG API ───────────────────────────────────────────────────
const API = "https://licosport-backend-production.up.railway.app";

// ─── DESIGN TOKENS ────────────────────────────────────────────────
const T = {
  bgPage:     "#F5F7F5",
  bgWhite:    "#FFFFFF",
  bgSurface:  "#F0F4F1",
  green:      "#1A7A4A",
  greenMid:   "#2EAA68",
  greenLight: "#E8F5EE",
  greenText:  "#145C38",
  gold:       "#B8860B",
  goldLight:  "#FFF8E7",
  goldText:   "#7A5500",
  blue:       "#1A5EA8",
  blueLight:  "#EBF4FF",
  red:        "#C0392B",
  redLight:   "#FEF0EE",
  redText:    "#8B1A10",
  text:       "#1A2420",
  textMid:    "#4A6358",
  textLight:  "#8AA898",
  border:     "#D8E6DE",
  borderMid:  "#B8CEBC",
  sidebarBg:  "#0F3D26",
  sidebarText:"#C8E6D0",
  sidebarActive:"#2EAA68",
};

// ─── CATEGORÍAS ───────────────────────────────────────────────────
const CATS = [
  {id:"Licores",        icon:"🍾"},
  {id:"Cervezas",       icon:"🍺"},
  {id:"Vinos",          icon:"🍷"},
  {id:"Cigarros",       icon:"🚬"},
  {id:"Chicles/Dulces", icon:"🍬"},
  {id:"Chupetes",       icon:"🍭"},
  {id:"Bebidas",        icon:"🥤"},
  {id:"Energizantes",   icon:"⚡"},
  {id:"Snacks",         icon:"🍿"},
  {id:"Hoja de Coca",   icon:"🌿"},
  {id:"Higiene",        icon:"🧴"},
  {id:"Varios",         icon:"📦"},
];
const catIcon = (c) => CATS.find(x=>x.id===c)?.icon ?? "📦";

// ─── MÉTODOS DE PAGO ──────────────────────────────────────────────
const METODOS_PAGO = [
  {id:"efectivo",     label:"Efectivo",      icon:"💵"},
  {id:"transferencia",label:"Transferencia", icon:"📲"},
  {id:"credito",      label:"Crédito",       icon:"📋"},
  {id:"qr",           label:"QR",            icon:"🔲"},
];

// ─── DATOS DEMO (cuando no hay API) ───────────────────────────────
const DEMO = [
  {id:1, nombre:"Ron Millonario 1L",      cat:"Licores",      stock:8,  min:5,  pc:45,  pv:75,  u:"bot."},
  {id:2, nombre:"Cerveza Paceña 620ml",   cat:"Cervezas",     stock:48, min:24, pc:8,   pv:15,  u:"und."},
  {id:3, nombre:"Vino Casillero Diablo",  cat:"Vinos",        stock:3,  min:6,  pc:55,  pv:90,  u:"bot."},
  {id:4, nombre:"Cigarros Marlboro",      cat:"Cigarros",     stock:15, min:10, pc:18,  pv:25,  u:"atad."},
  {id:5, nombre:"Chicle Trident Menta",   cat:"Chicles/Dulces",stock:2, min:20, pc:1.5, pv:3,   u:"und."},
  {id:6, nombre:"Chupete Blow Pop",       cat:"Chupetes",     stock:30, min:15, pc:0.8, pv:2,   u:"und."},
  {id:7, nombre:"Red Bull 250ml",         cat:"Energizantes", stock:12, min:6,  pc:12,  pv:20,  u:"und."},
  {id:8, nombre:"Monster Energy",         cat:"Energizantes", stock:8,  min:6,  pc:14,  pv:22,  u:"und."},
  {id:9, nombre:"Papas Lays",             cat:"Snacks",       stock:20, min:10, pc:5,   pv:8,   u:"und."},
  {id:10,nombre:"Hoja de Coca 1/4",       cat:"Hoja de Coca", stock:10, min:5,  pc:15,  pv:25,  u:"paq."},
  {id:11,nombre:"Clinex",                 cat:"Higiene",      stock:15, min:5,  pc:3,   pv:6,   u:"und."},
  {id:12,nombre:"Alicán",                 cat:"Higiene",      stock:10, min:5,  pc:8,   pv:14,  u:"und."},
  {id:13,nombre:"Papel Higiénico",        cat:"Higiene",      stock:8,  min:4,  pc:5,   pv:9,   u:"rol."},
  {id:14,nombre:"Toallas Húmedas",        cat:"Higiene",      stock:6,  min:3,  pc:6,   pv:10,  u:"paq."},
  {id:15,nombre:"Toallas Femeninas",      cat:"Higiene",      stock:5,  min:3,  pc:8,   pv:14,  u:"paq."},
  {id:16,nombre:"Vasos Desechables",      cat:"Varios",       stock:20, min:5,  pc:3,   pv:6,   u:"paq."},
  {id:17,nombre:"Hielo",                  cat:"Varios",       stock:15, min:5,  pc:5,   pv:10,  u:"bol."},
  {id:18,nombre:"Singani Casa Real 750ml",cat:"Licores",      stock:6,  min:4,  pc:38,  pv:60,  u:"bot."},
  {id:19,nombre:"Coca Cola 2L",           cat:"Bebidas",      stock:12, min:10, pc:7,   pv:12,  u:"und."},
];

// ─── HELPERS ──────────────────────────────────────────────────────
const bs      = (n) => `Bs ${Number(n || 0).toFixed(2)}`;
const gan     = (p) => (p.pv||0) - (p.pc||0);
const mrg     = (p) => p.pc > 0 ? (((p.pv-p.pc)/p.pc)*100).toFixed(0) : 0;
const stockSt = (p) => p.stock === 0 ? "out" : p.stock <= p.min ? "low" : "ok";
const stColor = (st) => ({out:T.red, low:T.gold, ok:T.greenMid})[st];
const stLabel = (st) => ({out:"AGOTADO", low:"BAJO", ok:"OK"})[st];

// ─── API HELPER ────────────────────────────────────────────────────
async function apiFetch(path, opts = {}) {
  if (!API) return null;
  const token = typeof window !== "undefined" ? localStorage.getItem("ls_token") : null;
  try {
    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...opts.headers,
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ─── HOOK RESPONSIVE ─────────────────────────────────────────────
function useIsMobile() {
  const [mob, setMob] = useState(false);
  useEffect(() => {
    const fn = () => setMob(window.innerWidth < 768);
    fn();
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mob;
}

// ══════════════════════════════════════════════════════════════════
// ─── LOGIN ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [step,     setStep]     = useState("role");
  const [role,     setRole]     = useState(null);
  const [vendedor, setVendedor] = useState(null);
  const [vendedores, setVendedores] = useState([]);
  const [digits,   setDigits]   = useState([]);
  const [shake,    setShake]    = useState(false);
  const [err,      setErr]      = useState("");
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    apiFetch("/vendedores").then(data => { if (data) setVendedores(data); });
  }, []);

  const selectAdmin = () => { setRole("admin"); setStep("pin"); setDigits([]); setErr(""); };
  const selectVend  = (v) => { setRole("vendedor"); setVendedor(v); setStep("pin"); setDigits([]); setErr(""); };

  const press = (d) => {
    if (digits.length >= 4) return;
    const next = [...digits, d];
    setDigits(next);
    if (next.length === 4) verify(next);
  };
  const del = () => setDigits(d => d.slice(0,-1));

  const verify = async (d) => {
    setLoading(true);
    const pin = d.join("");
    if (role === "admin") {
      const data = await apiFetch("/auth/pin", { method:"POST", body:{ pin } });
      if (data?.access_token) {
        if (typeof window !== "undefined") localStorage.setItem("ls_token", data.access_token);
        onLogin("admin", { nombre:"Administrador", color:T.green, icon:"👑" });
      } else { fail(); }
    } else {
      const data = await apiFetch("/vendedores/login", { method:"POST", body:{ pin } });
      if (data?.id) {
        onLogin("vendedor", { ...data, icon:"🛒" });
      } else { fail(); }
    }
    setLoading(false);
  };

  const fail = () => {
    setShake(true); setErr("PIN incorrecto");
    setTimeout(() => { setShake(false); setDigits([]); setErr(""); }, 900);
  };

  const KEYS = ["1","2","3","4","5","6","7","8","9","","0","⌫"];
  const roleColor = role === "admin" ? T.green : (vendedor?.color || T.blue);

  return (
    <div style={{ minHeight:"100vh", background:T.bgPage, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,-apple-system,sans-serif", padding:24 }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:44, marginBottom:6 }}>🍾</div>
          <div style={{ fontSize:30, fontWeight:800, letterSpacing:-1 }}>
            <span style={{ color:T.green }}>Lico</span><span style={{ color:T.gold }}>Sport</span>
          </div>
          <div style={{ color:T.textMid, fontSize:13, marginTop:4 }}>Sistema de Gestión</div>
        </div>

        <div style={{ background:T.bgWhite, borderRadius:20, padding:26, boxShadow:"0 2px 20px #0000000D", border:`1px solid ${T.border}` }}>
          {step === "role" && (
            <>
              <div style={{ color:T.textMid, fontSize:13, textAlign:"center", marginBottom:16 }}>¿Con qué perfil ingresas?</div>
              <button onClick={selectAdmin} style={{ width:"100%", padding:"14px 18px", marginBottom:10, background:T.bgSurface, border:`2px solid ${T.border}`, borderRadius:14, cursor:"pointer", display:"flex", alignItems:"center", gap:12, fontFamily:"inherit" }}>
                <div style={{ width:42, height:42, borderRadius:12, background:T.green+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>👑</div>
                <div style={{ textAlign:"left" }}>
                  <div style={{ color:T.text, fontWeight:700, fontSize:15 }}>Administrador</div>
                  <div style={{ color:T.textMid, fontSize:12 }}>Acceso completo</div>
                </div>
                <span style={{ marginLeft:"auto", color:T.textLight }}>›</span>
              </button>

              {vendedores.length > 0 && (
                <>
                  <div style={{ color:T.textMid, fontSize:12, textAlign:"center", margin:"12px 0 8px" }}>— Vendedores —</div>
                  {vendedores.map(v => (
                    <button key={v.id} onClick={() => selectVend(v)} style={{ width:"100%", padding:"12px 18px", marginBottom:8, background:T.bgSurface, border:`2px solid ${T.border}`, borderRadius:14, cursor:"pointer", display:"flex", alignItems:"center", gap:12, fontFamily:"inherit" }}>
                      <div style={{ width:38, height:38, borderRadius:10, background:v.color+"22", color:v.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800 }}>
                        {v.nombre.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                      </div>
                      <div style={{ textAlign:"left" }}>
                        <div style={{ color:T.text, fontWeight:600, fontSize:14 }}>{v.nombre}</div>
                        <div style={{ color:T.textMid, fontSize:11 }}>{v.turno || "Vendedor"}</div>
                      </div>
                      <span style={{ marginLeft:"auto", color:T.textLight }}>›</span>
                    </button>
                  ))}
                </>
              )}
            </>
          )}

          {step === "pin" && (
            <>
              <button onClick={() => setStep("role")} style={{ background:"none", border:"none", color:T.textMid, cursor:"pointer", fontSize:13, marginBottom:14, padding:0 }}>‹ Volver</button>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, padding:"12px 14px", background:roleColor+"14", borderRadius:12 }}>
                <span style={{ fontSize:22 }}>{role==="admin"?"👑":(vendedor?.color ? "🛒" : "🛒")}</span>
                <div>
                  <div style={{ color:roleColor, fontWeight:700, fontSize:14 }}>{role==="admin"?"Administrador":vendedor?.nombre}</div>
                  <div style={{ color:T.textMid, fontSize:12 }}>Ingresa tu PIN</div>
                </div>
              </div>

              <div style={{ display:"flex", justifyContent:"center", gap:14, marginBottom:24, animation: shake?"shake .5s":"none" }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ width:14, height:14, borderRadius:"50%", background: i<digits.length ? roleColor : "transparent", border:`2px solid ${i<digits.length ? roleColor : T.borderMid}`, transition:"all .15s" }}/>
                ))}
              </div>
              {err && <div style={{ color:T.red, fontSize:12, textAlign:"center", marginBottom:10 }}>{err}</div>}

              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                {KEYS.map((k,i) => {
                  if (k==="") return <div key={i}/>;
                  const isDel = k==="⌫";
                  return (
                    <button key={i} onClick={() => isDel ? del() : press(k)} disabled={loading} style={{ height:56, borderRadius:14, background: isDel ? T.bgSurface : T.bgWhite, border:`1.5px solid ${T.border}`, color: isDel ? T.red : T.text, fontSize:21, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                      {loading && digits.length===4 ? "…" : k}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────
function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  const bg = { success:T.green, error:T.red, warning:T.gold }[type] ?? T.green;
  return (
    <div style={{ position:"fixed", bottom:24, right:24, background:bg, color:"#fff", padding:"12px 20px", borderRadius:12, fontWeight:600, fontSize:14, zIndex:9999, boxShadow:"0 4px 16px #0003", animation:"slideIn .25s ease" }}>
      {msg}
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────
const NAV_ADMIN    = [{id:"home",icon:"🏠",l:"Inicio"},{id:"inv",icon:"📦",l:"Inventario"},{id:"venta",icon:"🛒",l:"Nueva Venta"},{id:"creditos",icon:"📋",l:"Créditos"},{id:"report",icon:"📊",l:"Reportes"},{id:"config",icon:"⚙️",l:"Config"}];
const NAV_VENDEDOR = [{id:"home",icon:"🏠",l:"Inicio"},{id:"venta",icon:"🛒",l:"Nueva Venta"},{id:"historial",icon:"🧾",l:"Mis Ventas"}];

// ─── SIDEBAR ──────────────────────────────────────────────────────
function Sidebar({ role, curUser, tab, onTab, onLogout, alertas, creditosCount }) {
  const nav = role === "admin" ? NAV_ADMIN : NAV_VENDEDOR;
  return (
    <aside style={{ width:220, minHeight:"100vh", background:T.sidebarBg, display:"flex", flexDirection:"column", position:"fixed", left:0, top:0, bottom:0, zIndex:100, fontFamily:"system-ui,sans-serif" }}>
      <div style={{ padding:"22px 18px 14px" }}>
        <div style={{ fontSize:21, fontWeight:800, letterSpacing:-.5 }}>
          <span style={{ color:T.greenMid }}>Lico</span><span style={{ color:T.gold }}>Sport</span>
        </div>
      </div>
      <div style={{ margin:"0 10px 14px", background:"#FFFFFF18", borderRadius:12, padding:"11px 13px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:(curUser?.color||T.green)+"44", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{curUser?.icon||"👤"}</div>
          <div>
            <div style={{ color:"#fff", fontWeight:700, fontSize:13 }}>{curUser?.nombre||"Usuario"}</div>
            <div style={{ color:T.sidebarText+"88", fontSize:10 }}>{role==="admin"?"Administrador":"Vendedor"}</div>
          </div>
        </div>
      </div>
      <nav style={{ flex:1, padding:"0 8px" }}>
        {nav.map(({id,icon,l}) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => onTab(id)} style={{ width:"100%", padding:"9px 12px", marginBottom:3, background: active ? T.sidebarActive+"33" : "transparent", border:"none", borderRadius:8, display:"flex", alignItems:"center", gap:9, color: active ? "#fff" : T.sidebarText, fontWeight: active?700:400, fontSize:13, cursor:"pointer", textAlign:"left", fontFamily:"inherit", position:"relative" }}>
              {active && <div style={{ position:"absolute", left:0, top:"20%", bottom:"20%", width:3, background:T.greenMid, borderRadius:2 }}/>}
              <span style={{ fontSize:16 }}>{icon}</span>{l}
              {id==="inv" && alertas>0 && <span style={{ marginLeft:"auto", background:T.red, color:"#fff", fontSize:9, fontWeight:700, borderRadius:8, padding:"1px 6px" }}>{alertas}</span>}
              {id==="creditos" && creditosCount>0 && <span style={{ marginLeft:"auto", background:T.gold, color:"#fff", fontSize:9, fontWeight:700, borderRadius:8, padding:"1px 6px" }}>{creditosCount}</span>}
            </button>
          );
        })}
      </nav>
      <button onClick={onLogout} style={{ margin:"10px 8px 16px", padding:"9px 12px", background:"#FFFFFF12", border:"1px solid #FFFFFF20", borderRadius:8, color:T.sidebarText, cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontSize:12, fontFamily:"inherit" }}>🔒 Cerrar sesión</button>
    </aside>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────
function BottomNav({ role, tab, onTab, alertas, creditosCount }) {
  const nav = role === "admin"
    ? [{id:"home",icon:"🏠",l:"Inicio"},{id:"inv",icon:"📦",l:"Stock"},{id:"venta",icon:"🛒",l:"Vender"},{id:"creditos",icon:"📋",l:"Créditos"},{id:"report",icon:"📊",l:"Reportes"}]
    : NAV_VENDEDOR;
  return (
    <nav style={{ position:"fixed", bottom:0, left:0, right:0, background:T.bgWhite, borderTop:`1px solid ${T.border}`, display:"flex", zIndex:800, paddingBottom:"env(safe-area-inset-bottom,0px)", boxShadow:"0 -2px 12px #00000010" }}>
      {nav.map(({id,icon,l}) => {
        const isSell = id==="venta";
        const active = tab === id;
        return (
          <button key={id} onClick={() => onTab(id)} style={{ flex:1, border:"none", background:"transparent", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding: isSell?0:"8px 0 6px", cursor:"pointer", position:"relative", fontFamily:"inherit" }}>
            {isSell ? (
              <div style={{ width:50, height:50, borderRadius:"50%", background:T.green, display:"flex", alignItems:"center", justifyContent:"center", fontSize:21, marginTop:-14, border:`3px solid ${T.bgPage}`, boxShadow:`0 2px 12px ${T.green}55` }}>{icon}</div>
            ) : (
              <>
                <span style={{ fontSize:19, lineHeight:1, position:"relative" }}>
                  {icon}
                  {id==="inv" && alertas>0 && <span style={{ position:"absolute", top:-4, right:-6, background:T.red, color:"#fff", fontSize:8, fontWeight:700, borderRadius:8, padding:"1px 4px" }}>{alertas}</span>}
                  {id==="creditos" && creditosCount>0 && <span style={{ position:"absolute", top:-4, right:-6, background:T.gold, color:"#fff", fontSize:8, fontWeight:700, borderRadius:8, padding:"1px 4px" }}>{creditosCount}</span>}
                </span>
                <span style={{ fontSize:10, color: active ? T.green : T.textLight, marginTop:3, fontWeight: active?700:400 }}>{l}</span>
                {active && <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:22, height:3, borderRadius:2, background:T.green }}/>}
              </>
            )}
          </button>
        );
      })}
    </nav>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────
function Card({ children, style={} }) {
  return <div style={{ background:T.bgWhite, borderRadius:16, border:`1px solid ${T.border}`, padding:"15px 17px", ...style }}>{children}</div>;
}

// ─── SHEET / DIALOG ───────────────────────────────────────────────
function Sheet({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"#0005", zIndex:1000, display:"flex", alignItems:"flex-end" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:T.bgWhite, borderRadius:"20px 20px 0 0", width:"100%", maxWidth:640, margin:"0 auto", maxHeight:"92vh", overflowY:"auto", border:`1px solid ${T.border}`, borderBottom:"none", animation:"sheetUp .2s ease" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"15px 18px 8px" }}>
          <span style={{ color:T.text, fontWeight:700, fontSize:16 }}>{title}</span>
          <button onClick={onClose} style={{ background:T.bgSurface, border:"none", color:T.textMid, fontSize:18, width:30, height:30, borderRadius:"50%", cursor:"pointer" }}>×</button>
        </div>
        <div style={{ padding:"0 18px 100px" }}>{children}</div>
      </div>
    </div>
  );
}

function Dialog({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"#0005", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:T.bgWhite, borderRadius:20, padding:26, width:"100%", maxWidth:500, maxHeight:"90vh", overflowY:"auto", border:`1px solid ${T.border}`, boxShadow:"0 8px 40px #0002", animation:"sheetUp .2s ease" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <span style={{ color:T.text, fontWeight:700, fontSize:17 }}>{title}</span>
          <button onClick={onClose} style={{ background:T.bgSurface, border:"none", color:T.textMid, fontSize:18, width:30, height:30, borderRadius:"50%", cursor:"pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── FIELD ────────────────────────────────────────────────────────
function Field({ label, value, onChange, type="text", readOnly=false }) {
  return (
    <div style={{ marginBottom:13 }}>
      <label style={{ color:T.textMid, fontSize:11, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:.7 }}>{label}</label>
      <input type={type} value={value} onChange={onChange} readOnly={readOnly} inputMode={type==="number"?"decimal":"text"}
        style={{ width:"100%", padding:"10px 13px", background: readOnly?T.bgSurface:T.bgWhite, border:`1.5px solid ${T.border}`, borderRadius:10, color: readOnly?T.textMid:T.text, fontSize:14, boxSizing:"border-box", fontFamily:"inherit" }}
      />
    </div>
  );
}

// ─── MODAL PRODUCTO ───────────────────────────────────────────────
function ModalProducto({ prod, isMobile, onClose, onSave }) {
  const [f, setF] = useState(prod ?? {nombre:"",cat:"Licores",stock:0,min:5,pc:0,pv:0,u:"und."});
  const set = (k,v) => setF(p => ({...p,[k]:v}));
  const gP = f.pv - f.pc;
  const mP = f.pc>0 ? (((f.pv-f.pc)/f.pc)*100).toFixed(0) : 0;
  const Wrap = isMobile ? Sheet : Dialog;

  return (
    <Wrap title={prod?"✏️ Editar Producto":"➕ Nuevo Producto"} onClose={onClose}>
      <Field label="Nombre del producto" value={f.nombre} onChange={e=>set("nombre",e.target.value)} />
      <div style={{ marginBottom:13 }}>
        <label style={{ color:T.textMid, fontSize:11, display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:.7 }}>Categoría</label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
          {CATS.map(({id,icon}) => (
            <button key={id} onClick={() => set("cat",id)} style={{ padding:"5px 11px", borderRadius:18, border:`1.5px solid ${f.cat===id?T.green:T.border}`, background: f.cat===id?T.greenLight:T.bgWhite, color: f.cat===id?T.greenText:T.textMid, fontSize:12, cursor:"pointer", fontWeight:f.cat===id?700:400, fontFamily:"inherit" }}>{icon} {id}</button>
          ))}
        </div>
      </div>
      <Field label="Unidad (und. / bot. / caja)" value={f.u} onChange={e=>set("u",e.target.value)} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:11 }}>
        <Field label="Stock actual"     type="number" value={f.stock} onChange={e=>set("stock",parseFloat(e.target.value)||0)} />
        <Field label="Stock mínimo"     type="number" value={f.min}   onChange={e=>set("min",parseFloat(e.target.value)||0)} />
        <Field label="Precio compra Bs" type="number" value={f.pc}    onChange={e=>set("pc",parseFloat(e.target.value)||0)} />
        <Field label="Precio venta Bs"  type="number" value={f.pv}    onChange={e=>set("pv",parseFloat(e.target.value)||0)} />
      </div>
      {f.pc>0 && f.pv>0 && (
        <div style={{ background: gP>=0?T.greenLight:T.redLight, borderRadius:10, padding:"11px 14px", marginBottom:14, border:`1px solid ${gP>=0?T.border:T.red+"44"}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
            <span style={{ color:T.textMid, fontSize:12 }}>Ganancia / unidad</span>
            <span style={{ color: gP>=0?T.greenText:T.red, fontWeight:700, fontFamily:"monospace" }}>{bs(gP)}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span style={{ color:T.textMid, fontSize:12 }}>Margen</span>
            <span style={{ color:T.gold, fontWeight:700 }}>{mP}%</span>
          </div>
        </div>
      )}
      <button onClick={() => f.nombre.trim() && onSave(f)} style={{ width:"100%", padding:13, background: f.nombre.trim()?T.green:T.borderMid, color:"#fff", border:"none", borderRadius:12, fontWeight:700, fontSize:15, cursor: f.nombre.trim()?"pointer":"not-allowed", fontFamily:"inherit" }}>
        {prod ? "Guardar cambios" : "Agregar producto"}
      </button>
    </Wrap>
  );
}

// ══════════════════════════════════════════════════════════════════
// ─── VISTAS ──────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════

// HOME
function Home({ role, curUser, productos, ventas, creditos, onAction }) {
  const alertas  = productos.filter(p => p.stock <= p.min);
  const totalInv = productos.reduce((s,p) => s+p.pc*p.stock, 0);
  const totalV   = ventas.reduce((s,v) => s+v.total, 0);
  const totalG   = ventas.reduce((s,v) => s+v.gan, 0);
  const isAdmin  = role === "admin";
  const pendCred = creditos.filter(c => !c.pagado).reduce((s,c) => s+c.monto, 0);

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ color:T.textMid, fontSize:12 }}>Bienvenido,</div>
        <div style={{ fontSize:24, fontWeight:800, letterSpacing:-.5, color:T.text }}>{curUser?.icon} {curUser?.nombre}</div>
        <div style={{ color:T.textMid, fontSize:12, marginTop:2 }}>{new Date().toLocaleDateString("es-BO",{weekday:"long",day:"2-digit",month:"long"})}</div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10, marginBottom:18 }}>
        <Card style={{ background:T.greenLight }}><div style={{ color:T.textMid, fontSize:10, marginBottom:3 }}>Ventas hoy</div><div style={{ color:T.green, fontWeight:800, fontSize:18, fontFamily:"monospace" }}>{bs(totalV)}</div></Card>
        {isAdmin && <Card style={{ background:T.goldLight }}><div style={{ color:T.textMid, fontSize:10, marginBottom:3 }}>Ganancia hoy</div><div style={{ color:T.gold, fontWeight:800, fontSize:18, fontFamily:"monospace" }}>{bs(totalG)}</div></Card>}
        {isAdmin && <Card style={{ background:T.bgSurface }}><div style={{ color:T.textMid, fontSize:10, marginBottom:3 }}>Valor stock</div><div style={{ color:T.text, fontWeight:800, fontSize:18, fontFamily:"monospace" }}>Bs {Math.round(totalInv)}</div></Card>}
        {isAdmin && pendCred > 0 && <Card style={{ background:T.blueLight }}><div style={{ color:T.textMid, fontSize:10, marginBottom:3 }}>Créditos pend.</div><div style={{ color:T.blue, fontWeight:800, fontSize:18, fontFamily:"monospace" }}>{bs(pendCred)}</div></Card>}
      </div>

      {isAdmin && alertas.length > 0 && (
        <div onClick={() => onAction("inv")} style={{ background:T.redLight, border:`1.5px solid ${T.red}44`, borderRadius:14, padding:"12px 16px", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" }}>
          <div>
            <div style={{ color:T.red, fontWeight:700, fontSize:13 }}>⚠️ {alertas.length} producto(s) con stock bajo</div>
            <div style={{ color:T.redText, fontSize:11, marginTop:2 }}>{alertas.slice(0,2).map(p=>p.nombre).join(", ")}{alertas.length>2?` y ${alertas.length-2} más`:""}</div>
          </div>
          <span style={{ color:T.red, fontSize:18 }}>›</span>
        </div>
      )}

      <div style={{ color:T.textLight, fontSize:10, marginBottom:9, textTransform:"uppercase", letterSpacing:1 }}>Acceso rápido</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:9, marginBottom:20 }}>
        <button onClick={() => onAction("venta")} style={{ padding:"14px 12px", background:T.green, border:"none", borderRadius:13, color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontFamily:"inherit" }}><span style={{ fontSize:18 }}>🛒</span> Nueva venta</button>
        {isAdmin && <>
          <button onClick={() => onAction("nuevo")} style={{ padding:"14px 12px", background:T.bgWhite, border:`1px solid ${T.border}`, borderRadius:13, color:T.text, fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontFamily:"inherit" }}><span style={{ fontSize:18 }}>➕</span> Stock</button>
          <button onClick={() => onAction("inv")} style={{ padding:"14px 12px", background:T.bgWhite, border:`1px solid ${T.border}`, borderRadius:13, color:T.text, fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontFamily:"inherit" }}><span style={{ fontSize:18 }}>📦</span> Inventario</button>
          <button onClick={() => onAction("creditos")} style={{ padding:"14px 12px", background:T.blueLight, border:`1px solid ${T.blue}44`, borderRadius:13, color:T.blue, fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontFamily:"inherit" }}><span style={{ fontSize:18 }}>📋</span> Créditos</button>
        </>}
      </div>

      {ventas.length > 0 && (
        <>
          <div style={{ color:T.textLight, fontSize:10, marginBottom:9, textTransform:"uppercase", letterSpacing:1 }}>Últimas ventas</div>
          {[...ventas].reverse().slice(0,4).map(v => (
            <Card key={v.id} style={{ marginBottom:8, padding:"11px 14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ color:T.text, fontSize:12, fontWeight:500 }}>{v.items.map(i=>`${i.nombre} ×${i.qty}`).join(", ").slice(0,48)}</div>
                  <div style={{ color:T.textMid, fontSize:10, marginTop:2 }}>
                    {v.hora} · {v.vendedor}
                    {v.metodoPago && <span style={{ marginLeft:8, background: v.metodoPago==="credito"?T.blueLight:T.greenLight, color: v.metodoPago==="credito"?T.blue:T.green, fontSize:9, fontWeight:700, padding:"1px 7px", borderRadius:8 }}>{METODOS_PAGO.find(m=>m.id===v.metodoPago)?.label||v.metodoPago}</span>}
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color: v.metodoPago==="credito"?T.blue:T.green, fontWeight:700, fontFamily:"monospace" }}>{bs(v.total)}</div>
                  {isAdmin && v.gan>0 && <div style={{ color:T.gold, fontSize:10, fontFamily:"monospace" }}>+{bs(v.gan)}</div>}
                </div>
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}

// INVENTARIO
function Inventario({ productos, onEditar, onEliminar, onNuevo }) {
  const [busq, setBusq] = useState("");
  const [cat,  setCat]  = useState("Todas");

  const lista = productos.filter(p => {
    const nb = p.nombre.toLowerCase().includes(busq.toLowerCase());
    const cb = cat==="Todas"||p.cat===cat;
    return nb&&cb;
  });

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <div style={{ color:T.text, fontWeight:800, fontSize:19 }}>📦 Inventario</div>
        <button onClick={onNuevo} style={{ background:T.green, border:"none", color:"#fff", fontWeight:700, fontSize:12, padding:"7px 16px", borderRadius:18, cursor:"pointer", fontFamily:"inherit" }}>+ Nuevo</button>
      </div>
      <div style={{ display:"flex", gap:9, marginBottom:13, flexWrap:"wrap" }}>
        <input placeholder="🔍 Buscar..." value={busq} onChange={e=>setBusq(e.target.value)} style={{ flex:1, minWidth:160, padding:"9px 13px", background:T.bgWhite, border:`1.5px solid ${T.border}`, borderRadius:10, color:T.text, fontSize:13, fontFamily:"inherit" }} />
        <select value={cat} onChange={e=>setCat(e.target.value)} style={{ padding:"9px 13px", background:T.bgWhite, border:`1.5px solid ${T.border}`, borderRadius:10, color:T.text, fontSize:13, fontFamily:"inherit" }}>
          <option>Todas</option>
          {CATS.map(c=><option key={c.id}>{c.id}</option>)}
        </select>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
        {[
          {l:`${productos.length} total`,c:T.text,bg:T.bgSurface},
          {l:`${productos.filter(p=>p.stock<=p.min&&p.stock>0).length} bajo`,c:T.gold,bg:T.goldLight},
          {l:`${productos.filter(p=>p.stock===0).length} agotado`,c:T.red,bg:T.redLight},
        ].map(({l,c,bg}) => (
          <span key={l} style={{ background:bg, color:c, fontSize:11, fontWeight:600, padding:"3px 11px", borderRadius:18, border:`1px solid ${T.border}` }}>{l}</span>
        ))}
      </div>
      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:T.bgSurface, borderBottom:`2px solid ${T.border}` }}>
                {["Producto","Cat.","Stock","Compra","Venta","Ganancia","%","Estado",""].map(h => (
                  <th key={h} style={{ padding:"10px 12px", color:T.textMid, textAlign:"left", fontWeight:600, fontSize:11, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.map((p,i) => {
                const st = stockSt(p); const sc = stColor(st); const pct = Math.min((p.stock/Math.max(p.min,1))*100,100);
                return (
                  <tr key={p.id} style={{ borderBottom:`1px solid ${T.border}`, background: i%2===0?T.bgWhite:T.bgSurface }}>
                    <td style={{ padding:"10px 12px", fontWeight:600, color:T.text }}>{catIcon(p.cat)} {p.nombre}</td>
                    <td style={{ padding:"10px 12px", color:T.textMid }}>{p.cat}</td>
                    <td style={{ padding:"10px 12px" }}>
                      <div style={{ color:sc, fontWeight:700, fontFamily:"monospace" }}>{p.stock} {p.u}</div>
                      <div style={{ background:T.border, borderRadius:2, height:3, marginTop:3, width:50 }}><div style={{ background:sc, width:`${pct}%`, height:"100%", borderRadius:2 }}/></div>
                    </td>
                    <td style={{ padding:"10px 12px", color:T.textMid, fontFamily:"monospace" }}>{bs(p.pc)}</td>
                    <td style={{ padding:"10px 12px", fontFamily:"monospace", fontWeight:600 }}>{bs(p.pv)}</td>
                    <td style={{ padding:"10px 12px", color:T.greenText, fontFamily:"monospace", fontWeight:700 }}>+{bs(gan(p))}</td>
                    <td style={{ padding:"10px 12px" }}><span style={{ color: parseFloat(mrg(p))>=30?T.green:T.gold, fontWeight:700 }}>{mrg(p)}%</span></td>
                    <td style={{ padding:"10px 12px" }}><span style={{ background:`${sc}18`, color:sc, fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:9 }}>{stLabel(st)}</span></td>
                    <td style={{ padding:"10px 12px" }}>
                      <div style={{ display:"flex", gap:5 }}>
                        <button onClick={() => onEditar(p)} style={{ background:T.bgSurface, border:`1px solid ${T.border}`, color:T.text, borderRadius:7, padding:"4px 9px", cursor:"pointer", fontSize:11, fontFamily:"inherit" }}>✏️</button>
                        <button onClick={() => onEliminar(p.id)} style={{ background:T.redLight, border:`1px solid ${T.red}44`, color:T.red, borderRadius:7, padding:"4px 9px", cursor:"pointer", fontSize:11, fontFamily:"inherit" }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {lista.length===0 && <div style={{ textAlign:"center", padding:28, color:T.textLight }}>Sin productos</div>}
        </div>
      </Card>
    </div>
  );
}

// VENTA (con método de pago + crédito)
function Venta({ role, curUser, productos, onConfirmar }) {
  const [busq,       setBusq]       = useState("");
  const [carrito,    setCarrito]    = useState([]);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [clienteNom, setClienteNom] = useState("");
  const isAdmin = role === "admin";

  const disp     = productos.filter(p => p.stock>0 && p.nombre.toLowerCase().includes(busq.toLowerCase()));
  const total    = carrito.reduce((s,i) => s+i.pv*i.qty, 0);
  const ganTotal = carrito.reduce((s,i) => s+(i.pv-i.pc)*i.qty, 0);
  const esCredito = metodoPago === "credito";

  const agregar = (p) => setCarrito(c => {
    const ex = c.find(i=>i.id===p.id);
    if (ex) return ex.qty>=p.stock ? c : c.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i);
    return [...c,{...p,qty:1}];
  });
  const restar = (id) => setCarrito(c => { const ex=c.find(i=>i.id===id); if(!ex||ex.qty<=1) return c.filter(i=>i.id!==id); return c.map(i=>i.id===id?{...i,qty:i.qty-1}:i); });
  const quitar = (id) => setCarrito(c=>c.filter(i=>i.id!==id));

  const confirmar = () => {
    if (esCredito && !clienteNom.trim()) { alert("Ingresa el nombre del cliente para crédito"); return; }
    onConfirmar(carrito, metodoPago, clienteNom);
    setCarrito([]); setBusq(""); setClienteNom(""); setMetodoPago("efectivo");
  };

  return (
    <div>
      <div style={{ color:T.text, fontWeight:800, fontSize:19, marginBottom:18 }}>🛒 Nueva Venta</div>
      <div style={{ display:"grid", gridTemplateColumns: carrito.length>0 ? "1fr 1fr" : "1fr", gap:18 }}>
        <div>
          <input placeholder="🔍 Buscar producto..." value={busq} onChange={e=>setBusq(e.target.value)}
            style={{ width:"100%", padding:"10px 13px", background:T.bgWhite, border:`1.5px solid ${T.border}`, borderRadius:10, color:T.text, fontSize:13, boxSizing:"border-box", marginBottom:9, fontFamily:"inherit" }}
          />
          <div style={{ maxHeight:380, overflowY:"auto" }}>
            {busq && disp.map(p => {
              const enC = carrito.find(i=>i.id===p.id);
              return (
                <Card key={p.id} style={{ marginBottom:7, padding:"11px 13px", cursor:"pointer", border:`1.5px solid ${enC?T.green+"66":T.border}` }} onClick={() => agregar(p)}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ color:T.text, fontWeight:600, fontSize:13 }}>{catIcon(p.cat)} {p.nombre}</div>
                      <div style={{ color:T.textMid, fontSize:11 }}>Stock: {p.stock} {p.u}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ color:T.green, fontWeight:800, fontFamily:"monospace" }}>{bs(p.pv)}</div>
                      {enC && <div style={{ color:T.gold, fontSize:10 }}>×{enC.qty}</div>}
                    </div>
                  </div>
                </Card>
              );
            })}
            {busq && disp.length===0 && <div style={{ color:T.textLight, textAlign:"center", padding:18 }}>Sin resultados</div>}
            {!busq && <div style={{ textAlign:"center", paddingTop:36, color:T.textLight }}><div style={{ fontSize:36, marginBottom:9 }}>🛒</div><div>Escribe para buscar</div></div>}
          </div>
        </div>

        {carrito.length > 0 && (
          <div>
            <div style={{ color:T.textMid, fontSize:11, textTransform:"uppercase", letterSpacing:1, marginBottom:9 }}>Carrito ({carrito.length})</div>
            <div style={{ maxHeight:240, overflowY:"auto", marginBottom:11 }}>
              {carrito.map(i => (
                <Card key={i.id} style={{ marginBottom:7, padding:"9px 11px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ color:T.text, fontSize:12, fontWeight:600 }}>{i.nombre}</div>
                      <div style={{ color:T.green, fontFamily:"monospace", fontSize:11 }}>{bs(i.pv)} × {i.qty} = {bs(i.pv*i.qty)}</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <button onClick={()=>restar(i.id)} style={{ width:26,height:26,borderRadius:"50%",background:T.bgSurface,border:`1px solid ${T.border}`,color:T.text,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit" }}>−</button>
                      <span style={{ color:T.text,fontWeight:700,minWidth:16,textAlign:"center",fontSize:12 }}>{i.qty}</span>
                      <button onClick={()=>agregar(i)} style={{ width:26,height:26,borderRadius:"50%",background:T.bgSurface,border:`1px solid ${T.border}`,color:T.green,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit" }}>+</button>
                      <button onClick={()=>quitar(i.id)} style={{ width:26,height:26,borderRadius:"50%",background:T.redLight,border:"none",color:T.red,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit" }}>×</button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Método de pago */}
            <div style={{ marginBottom:11 }}>
              <div style={{ color:T.textMid, fontSize:11, textTransform:"uppercase", letterSpacing:1, marginBottom:7 }}>Método de pago</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                {METODOS_PAGO.map(m => (
                  <button key={m.id} onClick={() => setMetodoPago(m.id)} style={{
                    padding:"8px 10px", borderRadius:10,
                    border:`1.5px solid ${metodoPago===m.id ? (m.id==="credito"?T.blue:T.green) : T.border}`,
                    background: metodoPago===m.id ? (m.id==="credito"?T.blueLight:T.greenLight) : T.bgWhite,
                    color: metodoPago===m.id ? (m.id==="credito"?T.blue:T.greenText) : T.textMid,
                    fontWeight: metodoPago===m.id?700:400, fontSize:12, cursor:"pointer", fontFamily:"inherit",
                    display:"flex", alignItems:"center", gap:6,
                  }}>{m.icon} {m.label}</button>
                ))}
              </div>
            </div>

            {/* Campo cliente para crédito */}
            {esCredito && (
              <div style={{ marginBottom:11 }}>
                <input placeholder="👤 Nombre del cliente (obligatorio)" value={clienteNom} onChange={e=>setClienteNom(e.target.value)}
                  style={{ width:"100%", padding:"10px 13px", background:T.blueLight, border:`1.5px solid ${T.blue}44`, borderRadius:10, color:T.text, fontSize:13, boxSizing:"border-box", fontFamily:"inherit" }}
                />
              </div>
            )}

            <Card style={{ background: esCredito?T.blueLight:T.greenLight, marginBottom:12 }}>
              {isAdmin && (
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ color:T.textMid, fontSize:12 }}>Ganancia estimada</span>
                  <span style={{ color:T.gold, fontWeight:700, fontFamily:"monospace" }}>{bs(ganTotal)}</span>
                </div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ color:T.text, fontWeight:700, fontSize:16 }}>TOTAL</span>
                <span style={{ color: esCredito?T.blue:T.green, fontWeight:900, fontFamily:"monospace", fontSize:20 }}>{bs(total)}</span>
              </div>
              {esCredito && <div style={{ color:T.blue, fontSize:11, marginTop:4 }}>📋 Se registrará como crédito pendiente</div>}
            </Card>

            <button onClick={confirmar} style={{ width:"100%", padding:14, background: esCredito?T.blue:T.green, color:"#fff", border:"none", borderRadius:12, fontWeight:800, fontSize:15, cursor:"pointer", boxShadow:`0 3px 14px ${esCredito?T.blue:T.green}44`, fontFamily:"inherit" }}>
              {esCredito ? `📋 Registrar crédito · ${bs(total)}` : `✅ Confirmar venta · ${bs(total)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// CRÉDITOS
function Creditos({ creditos, onPagar, onEliminar }) {
  const pendientes = creditos.filter(c => !c.pagado);
  const pagados    = creditos.filter(c => c.pagado);
  const totalPend  = pendientes.reduce((s,c) => s+c.monto, 0);

  return (
    <div>
      <div style={{ color:T.text, fontWeight:800, fontSize:19, marginBottom:18 }}>📋 Créditos</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:18 }}>
        <Card style={{ background:T.blueLight }}><div style={{ color:T.textMid, fontSize:10 }}>Pendientes</div><div style={{ color:T.blue, fontWeight:800, fontSize:18 }}>{pendientes.length}</div></Card>
        <Card style={{ background:T.blueLight }}><div style={{ color:T.textMid, fontSize:10 }}>Total pendiente</div><div style={{ color:T.blue, fontWeight:800, fontSize:16, fontFamily:"monospace" }}>{bs(totalPend)}</div></Card>
        <Card style={{ background:T.greenLight }}><div style={{ color:T.textMid, fontSize:10 }}>Cobrados</div><div style={{ color:T.green, fontWeight:800, fontSize:18 }}>{pagados.length}</div></Card>
      </div>

      {pendientes.length > 0 && (
        <>
          <div style={{ color:T.textLight, fontSize:10, textTransform:"uppercase", letterSpacing:1, marginBottom:9 }}>⏳ Pendientes de cobro</div>
          {pendientes.map(c => (
            <Card key={c.id} style={{ marginBottom:9, border:`1.5px solid ${T.blue}44` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ color:T.text, fontWeight:700, fontSize:14 }}>👤 {c.cliente}</div>
                  <div style={{ color:T.textMid, fontSize:11, marginTop:2 }}>{c.items} · {c.hora}</div>
                  <div style={{ color:T.textMid, fontSize:11 }}>Vendedor: {c.vendedor}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color:T.blue, fontWeight:800, fontFamily:"monospace", fontSize:16 }}>{bs(c.monto)}</div>
                  <div style={{ display:"flex", gap:6, marginTop:6 }}>
                    <button onClick={() => onPagar(c.id)} style={{ padding:"5px 12px", background:T.green, border:"none", color:"#fff", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>✅ Cobrar</button>
                    <button onClick={() => onEliminar(c.id)} style={{ padding:"5px 10px", background:T.redLight, border:`1px solid ${T.red}44`, color:T.red, borderRadius:8, cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>🗑️</button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </>
      )}

      {pagados.length > 0 && (
        <>
          <div style={{ color:T.textLight, fontSize:10, textTransform:"uppercase", letterSpacing:1, margin:"16px 0 9px" }}>✅ Cobrados</div>
          {pagados.slice(0,10).map(c => (
            <Card key={c.id} style={{ marginBottom:7, padding:"10px 14px", opacity:.7 }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <div>
                  <div style={{ color:T.text, fontSize:13 }}>👤 {c.cliente}</div>
                  <div style={{ color:T.textMid, fontSize:10 }}>{c.hora}</div>
                </div>
                <div style={{ color:T.green, fontWeight:700, fontFamily:"monospace" }}>{bs(c.monto)}</div>
              </div>
            </Card>
          ))}
        </>
      )}

      {creditos.length === 0 && (
        <Card><div style={{ color:T.textLight, textAlign:"center", padding:28 }}>No hay créditos registrados</div></Card>
      )}
    </div>
  );
}

// REPORTES
function Reportes({ productos, ventas }) {
  const totalV = ventas.reduce((s,v)=>s+v.total,0);
  const totalG = ventas.reduce((s,v)=>s+v.gan,0);
  const mGlob  = totalV>0 ? ((totalG/totalV)*100).toFixed(1) : 0;
  const topR   = [...productos].sort((a,b)=>parseFloat(mrg(b))-parseFloat(mrg(a))).slice(0,5);
  const porCat = CATS.map(({id,icon})=>{ const ps=productos.filter(p=>p.cat===id); return {id,icon,qty:ps.length,valor:ps.reduce((s,p)=>s+p.pc*p.stock,0),ganPot:ps.reduce((s,p)=>s+gan(p)*p.stock,0)}; }).filter(c=>c.qty>0);
  const porMetodo = METODOS_PAGO.map(m => ({ ...m, total: ventas.filter(v=>v.metodoPago===m.id).reduce((s,v)=>s+v.total,0), cant: ventas.filter(v=>v.metodoPago===m.id).length })).filter(m=>m.cant>0);

  return (
    <div>
      <div style={{ color:T.text, fontWeight:800, fontSize:19, marginBottom:18 }}>📊 Reportes</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
        <Card style={{ background:T.greenLight }}><div style={{ color:T.textMid, fontSize:10, marginBottom:3 }}>Ventas totales</div><div style={{ color:T.green, fontWeight:800, fontSize:16, fontFamily:"monospace" }}>{bs(totalV)}</div></Card>
        <Card style={{ background:T.goldLight }}><div style={{ color:T.textMid, fontSize:10, marginBottom:3 }}>Ganancia total</div><div style={{ color:T.gold, fontWeight:800, fontSize:16, fontFamily:"monospace" }}>{bs(totalG)}</div></Card>
        <Card style={{ background:T.bgSurface }}><div style={{ color:T.textMid, fontSize:10, marginBottom:3 }}>Margen</div><div style={{ color:T.text, fontWeight:800, fontSize:16 }}>{mGlob}%</div></Card>
      </div>

      {/* Por método de pago */}
      {porMetodo.length > 0 && (
        <div style={{ marginBottom:18 }}>
          <div style={{ color:T.textLight, fontSize:10, textTransform:"uppercase", letterSpacing:1, marginBottom:9 }}>💳 Por método de pago</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:9 }}>
            {porMetodo.map(m => (
              <Card key={m.id} style={{ background: m.id==="credito"?T.blueLight:T.greenLight }}>
                <div style={{ color:T.textMid, fontSize:10 }}>{m.icon} {m.label}</div>
                <div style={{ color: m.id==="credito"?T.blue:T.green, fontWeight:800, fontSize:15, fontFamily:"monospace" }}>{bs(m.total)}</div>
                <div style={{ color:T.textMid, fontSize:10 }}>{m.cant} ventas</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
        <div>
          <div style={{ color:T.textLight, fontSize:10, textTransform:"uppercase", letterSpacing:1, marginBottom:9 }}>🏆 Más rentables</div>
          <Card style={{ padding:0, overflow:"hidden" }}>
            {topR.map((p,i) => (
              <div key={p.id} style={{ display:"flex", justifyContent:"space-between", padding:"10px 14px", borderBottom: i<4?`1px solid ${T.border}`:"none", alignItems:"center" }}>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ fontSize:16 }}>{["🥇","🥈","🥉","4️⃣","5️⃣"][i]}</span>
                  <div><div style={{ color:T.text, fontSize:12, fontWeight:600 }}>{p.nombre}</div><div style={{ color:T.textMid, fontSize:10 }}>{p.cat}</div></div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color:T.gold, fontWeight:700, fontSize:12 }}>{mrg(p)}%</div>
                  <div style={{ color:T.green, fontSize:10, fontFamily:"monospace" }}>+{bs(gan(p))}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
        <div>
          <div style={{ color:T.textLight, fontSize:10, textTransform:"uppercase", letterSpacing:1, marginBottom:9 }}>📦 Por categoría</div>
          <Card style={{ padding:0, overflow:"hidden" }}>
            {porCat.map((c,i) => (
              <div key={c.id} style={{ padding:"10px 14px", borderBottom: i<porCat.length-1?`1px solid ${T.border}`:"none" }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:T.text, fontWeight:600, fontSize:12 }}>{c.icon} {c.id}</span>
                  <span style={{ color:T.textMid, fontSize:11 }}>{c.qty} prod.</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:2 }}>
                  <span style={{ color:T.textMid, fontSize:10 }}>Inv: <span style={{ color:T.text, fontFamily:"monospace" }}>{bs(c.valor)}</span></span>
                  <span style={{ color:T.textMid, fontSize:10 }}>Pot: <span style={{ color:T.green, fontFamily:"monospace" }}>{bs(c.ganPot)}</span></span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <div style={{ marginTop:18 }}>
        <div style={{ color:T.textLight, fontSize:10, textTransform:"uppercase", letterSpacing:1, marginBottom:9 }}>🧾 Historial ({ventas.length})</div>
        {ventas.length===0
          ? <Card><div style={{ color:T.textLight, textAlign:"center", padding:20 }}>Sin ventas</div></Card>
          : <Card style={{ padding:0, overflow:"hidden" }}>
              {[...ventas].reverse().map((v,i) => (
                <div key={v.id} style={{ display:"flex", justifyContent:"space-between", padding:"10px 14px", borderBottom: i<ventas.length-1?`1px solid ${T.border}`:"none", alignItems:"center" }}>
                  <div>
                    <div style={{ color:T.text, fontSize:12 }}>{v.items.map(i=>`${i.nombre} ×${i.qty}`).join(", ").slice(0,50)}</div>
                    <div style={{ color:T.textMid, fontSize:10, marginTop:2 }}>
                      {v.hora} · {v.vendedor}
                      {v.metodoPago && <span style={{ marginLeft:6, background:v.metodoPago==="credito"?T.blueLight:T.greenLight, color:v.metodoPago==="credito"?T.blue:T.green, fontSize:9, padding:"1px 6px", borderRadius:8, fontWeight:700 }}>{METODOS_PAGO.find(m=>m.id===v.metodoPago)?.label}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ color: v.metodoPago==="credito"?T.blue:T.green, fontWeight:700, fontFamily:"monospace", fontSize:12 }}>{bs(v.total)}</div>
                    <div style={{ color:T.gold, fontSize:10, fontFamily:"monospace" }}>+{bs(v.gan)}</div>
                  </div>
                </div>
              ))}
            </Card>
        }
      </div>
    </div>
  );
}

// HISTORIAL VENDEDOR
function HistorialVendedor({ ventas, curUser }) {
  const mias = ventas.filter(v => v.vendedor === curUser?.nombre);
  const totalV = mias.reduce((s,v)=>s+v.total,0);
  return (
    <div>
      <div style={{ color:T.text, fontWeight:800, fontSize:19, marginBottom:18 }}>🧾 Mis Ventas</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
        <Card style={{ background:T.greenLight }}><div style={{ color:T.textMid, fontSize:10 }}>Ventas</div><div style={{ color:T.green, fontWeight:800, fontSize:20 }}>{mias.length}</div></Card>
        <Card style={{ background:T.greenLight }}><div style={{ color:T.textMid, fontSize:10 }}>Total</div><div style={{ color:T.green, fontWeight:800, fontSize:16, fontFamily:"monospace" }}>{bs(totalV)}</div></Card>
      </div>
      {mias.length===0
        ? <Card><div style={{ color:T.textLight, textAlign:"center", padding:28 }}>Sin ventas aún</div></Card>
        : <Card style={{ padding:0, overflow:"hidden" }}>
            {[...mias].reverse().map((v,i) => (
              <div key={v.id} style={{ padding:"10px 14px", borderBottom: i<mias.length-1?`1px solid ${T.border}`:"none", display:"flex", justifyContent:"space-between" }}>
                <div>
                  <div style={{ color:T.text, fontSize:12 }}>{v.items.map(i=>`${i.nombre} ×${i.qty}`).join(", ").slice(0,44)}</div>
                  <div style={{ color:T.textMid, fontSize:10, marginTop:2 }}>{v.hora} · {v.metodoPago && <span style={{ color: v.metodoPago==="credito"?T.blue:T.green }}>{METODOS_PAGO.find(m=>m.id===v.metodoPago)?.label}</span>}</div>
                </div>
                <div style={{ color: v.metodoPago==="credito"?T.blue:T.green, fontWeight:700, fontFamily:"monospace", fontSize:13 }}>{bs(v.total)}</div>
              </div>
            ))}
          </Card>
      }
    </div>
  );
}

// CONFIG
function Config({ onCambiarPinAdmin, showToast }) {
  const [pinActual, setPinActual] = useState("");
  const [pinNuevo,  setPinNuevo]  = useState("");

  const cambiar = async () => {
    if (pinNuevo.length !== 4) { showToast("El PIN debe tener 4 dígitos","error"); return; }
    const data = await apiFetch("/auth/pin", { method:"PUT", body:{ pinActual, pinNuevo } });
    if (data?.ok) { showToast("✅ PIN actualizado"); setPinActual(""); setPinNuevo(""); }
    else showToast("PIN actual incorrecto","error");
  };

  return (
    <div>
      <div style={{ color:T.text, fontWeight:800, fontSize:19, marginBottom:18 }}>⚙️ Configuración</div>
      <Card style={{ marginBottom:14 }}>
        <div style={{ color:T.text, fontWeight:700, fontSize:14, marginBottom:13 }}>🔑 Cambiar PIN Administrador</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Field label="PIN actual" type="password" value={pinActual} onChange={e=>setPinActual(e.target.value)} />
          <Field label="PIN nuevo (4 dígitos)" type="number" value={pinNuevo} onChange={e=>setPinNuevo(e.target.value.slice(0,4))} />
        </div>
        <button onClick={cambiar} style={{ padding:"10px 20px", background:T.green, border:"none", color:"#fff", borderRadius:10, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Guardar PIN</button>
      </Card>
      <Card>
        <div style={{ color:T.text, fontWeight:700, fontSize:14, marginBottom:10 }}>ℹ️ Permisos</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, fontSize:12 }}>
          <div>
            <div style={{ color:T.textMid, fontWeight:600, marginBottom:5 }}>👑 Administrador</div>
            {["Todo el inventario","Ver precios de compra","Gestionar vendedores","Ver reportes completos","Gestionar créditos","Configurar PINs"].map(p=>(
              <div key={p} style={{ display:"flex", gap:5, marginBottom:3 }}><span style={{ color:T.green }}>✓</span><span style={{ color:T.text }}>{p}</span></div>
            ))}
          </div>
          <div>
            <div style={{ color:T.textMid, fontWeight:600, marginBottom:5 }}>🛒 Vendedor</div>
            {["Registrar ventas","Elegir método de pago","Ver historial propio","Consultar precios de venta"].map(p=>(
              <div key={p} style={{ display:"flex", gap:5, marginBottom:3 }}><span style={{ color:T.green }}>✓</span><span style={{ color:T.text }}>{p}</span></div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ─── APP ROOT ─────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════
export default function LicoSport() {
  const isMobile   = useIsMobile();
  const [role,     setRole]      = useState(null);
  const [curUser,  setCurUser]   = useState(null);
  const [tab,      setTab]       = useState("home");
  const [productos,setProductos] = useState(DEMO);
  const [ventas,   setVentas]    = useState([]);
  const [creditos, setCreditos]  = useState([]);
  const [modalProd,setModalProd] = useState(null);
  const [toast,    setToast]     = useState(null);
  const [apiOk,    setApiOk]     = useState(false);

  const alertasCount  = productos.filter(p=>p.stock<=p.min).length;
  const creditosPend  = creditos.filter(c=>!c.pagado).length;
  const showToast     = (msg, type="success") => setToast({msg,type});

  // Cargar productos desde API al hacer login
  const handleLogin = useCallback(async (r, user) => {
    setRole(r); setCurUser(user); setTab("home");
    const data = await apiFetch("/productos");
    if (data && data.length > 0) { setProductos(data); setApiOk(true); }
    else setApiOk(false);
  }, []);

  const guardar = async (f) => {
    if (f.id) {
      if (apiOk) await apiFetch(`/productos/${f.id}`, { method:"PUT", body:f });
      setProductos(ps => ps.map(p=>p.id===f.id?f:p));
      showToast("Producto actualizado");
    } else {
      let nuevo = { ...f, id:Date.now() };
      if (apiOk) { const r = await apiFetch("/productos", { method:"POST", body:f }); if (r?.id) nuevo=r; }
      setProductos(ps => [...ps, nuevo]);
      showToast("Producto agregado");
    }
    setModalProd(null);
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    if (apiOk) await apiFetch(`/productos/${id}`, { method:"DELETE" });
    setProductos(ps => ps.filter(p=>p.id!==id));
    showToast("Producto eliminado","error");
  };

  const confirmarVenta = async (carrito, metodoPago, clienteNom) => {
    const total = carrito.reduce((s,i)=>s+i.pv*i.qty, 0);
    const gan_  = carrito.reduce((s,i)=>s+(i.pv-i.pc)*i.qty, 0);

    // Descontar stock
    setProductos(ps => ps.map(p => {
      const it = carrito.find(i=>i.id===p.id);
      return it ? {...p, stock:p.stock-it.qty} : p;
    }));

    const venta = {
      id: Date.now(),
      hora: new Date().toLocaleTimeString("es-BO",{hour:"2-digit",minute:"2-digit"}),
      vendedor: curUser?.nombre || "?",
      metodoPago,
      items: carrito,
      total, gan: gan_,
    };
    setVentas(vs => [...vs, venta]);

    // Si es crédito, guardar en lista de créditos
    if (metodoPago === "credito") {
      const credito = {
        id: Date.now(),
        cliente: clienteNom,
        monto: total,
        items: carrito.map(i=>`${i.nombre} ×${i.qty}`).join(", "),
        hora: venta.hora,
        vendedor: curUser?.nombre || "?",
        pagado: false,
      };
      setCreditos(cs => [...cs, credito]);
      showToast(`📋 Crédito registrado para ${clienteNom} · ${bs(total)}`,"warning");
    } else {
      showToast(`✅ Venta registrada · ${bs(total)}`);
    }
    setTab("home");
  };

  const pagarCredito   = (id) => { setCreditos(cs => cs.map(c=>c.id===id?{...c,pagado:true}:c)); showToast("✅ Crédito cobrado"); };
  const eliminarCredito= (id) => { setCreditos(cs => cs.filter(c=>c.id!==id)); showToast("🗑️ Crédito eliminado","error"); };

  const handleAction = (action) => {
    if (action==="nuevo") { setModalProd({}); return; }
    setTab(action);
  };

  const logout = () => {
    setRole(null); setCurUser(null); setTab("home");
    if (typeof window !== "undefined") localStorage.removeItem("ls_token");
  };

  if (!role) return <LoginScreen onLogin={handleLogin} />;

  const renderContent = () => {
    if (tab==="home")     return <Home role={role} curUser={curUser} productos={productos} ventas={ventas} creditos={creditos} onAction={handleAction} />;
    if (tab==="inv")      return role==="admin" ? <Inventario productos={productos} onEditar={setModalProd} onEliminar={eliminar} onNuevo={()=>setModalProd({})} /> : null;
    if (tab==="venta")    return <Venta role={role} curUser={curUser} productos={productos} onConfirmar={confirmarVenta} />;
    if (tab==="creditos") return role==="admin" ? <Creditos creditos={creditos} onPagar={pagarCredito} onEliminar={eliminarCredito} /> : null;
    if (tab==="report")   return role==="admin" ? <Reportes productos={productos} ventas={ventas} /> : null;
    if (tab==="historial")return <HistorialVendedor ventas={ventas} curUser={curUser} />;
    if (tab==="config")   return role==="admin" ? <Config onCambiarPinAdmin={() => {}} showToast={showToast} /> : null;
    return null;
  };

  return (
    <div style={{ minHeight:"100vh", background:T.bgPage, fontFamily:"system-ui,-apple-system,sans-serif", color:T.text }}>
      {!apiOk && role && (
        <div style={{ background:T.goldLight, borderBottom:`1px solid ${T.gold}44`, padding:"6px 16px", textAlign:"center", fontSize:12, color:T.goldText }}>
          ⚡ Modo offline — los datos no se guardarán en el servidor
        </div>
      )}

      {!isMobile && (
        <>
          <Sidebar role={role} curUser={curUser} tab={tab} onTab={setTab} onLogout={logout} alertas={alertasCount} creditosCount={creditosPend} />
          <main style={{ marginLeft:220, padding:28, minHeight:"100vh" }}>
            <div style={{ maxWidth:1100, margin:"0 auto" }}>{renderContent()}</div>
          </main>
        </>
      )}

      {isMobile && (
        <>
          <div style={{ background:T.bgWhite, borderBottom:`1px solid ${T.border}`, padding:"11px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:700 }}>
            <div style={{ fontSize:17, fontWeight:800 }}><span style={{ color:T.green }}>Lico</span><span style={{ color:T.gold }}>Sport</span></div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ background:T.greenLight, color:T.greenText, fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:18 }}>{curUser?.icon} {curUser?.nombre}</span>
              <button onClick={logout} style={{ background:"none", border:"none", color:T.textMid, cursor:"pointer", fontSize:16 }}>🔒</button>
            </div>
          </div>
          <div style={{ padding:"14px 14px", paddingBottom:88 }}>{renderContent()}</div>
          <BottomNav role={role} tab={tab} onTab={setTab} alertas={alertasCount} creditosCount={creditosPend} />
        </>
      )}

      {modalProd!==null && (
        <ModalProducto prod={modalProd.id?modalProd:null} isMobile={isMobile} onClose={()=>setModalProd(null)} onSave={guardar} />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)} />}

      <style>{`
        * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
        input,button,select { font-family:inherit; }
        input:focus,select:focus { outline:2px solid ${T.green}; outline-offset:1px; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-thumb { background:${T.border}; border-radius:3px; }
        @keyframes sheetUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
