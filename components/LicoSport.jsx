import { useState, useEffect, useCallback, useRef } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────
// Blanco limpio + verde esmeralda + dorado acento
const T = {
  // Backgrounds
  bgPage:    "#F5F7F5",   // gris verdoso muy suave
  bgWhite:   "#FFFFFF",
  bgSurface: "#F0F4F1",   // superficie cards
  // Verde esmeralda — el acento principal
  green:     "#1A7A4A",   // verde oscuro firme
  greenMid:  "#2EAA68",   // verde medio
  greenLight:"#E8F5EE",   // verde muy claro (fondos chips)
  greenText: "#145C38",   // texto verde oscuro
  // Dorado
  gold:      "#B8860B",
  goldLight: "#FFF8E7",
  goldText:  "#7A5500",
  // Rojo alertas
  red:       "#C0392B",
  redLight:  "#FEF0EE",
  redText:   "#8B1A10",
  // Neutros
  text:      "#1A2420",   // casi negro verdoso
  textMid:   "#4A6358",   // gris verdoso
  textLight: "#8AA898",   // muted
  border:    "#D8E6DE",   // borde suave
  borderMid: "#B8CEBC",
  // Sidebar
  sidebarBg: "#0F3D26",   // verde muy oscuro
  sidebarText:"#C8E6D0",
  sidebarActive:"#2EAA68",
};

// ─── ROLES ────────────────────────────────────────────────────────
const API = "https://licosport-backend-production.up.railway.app";
const ROLES = {
  admin:    { label:"Administrador", color:T.green,   icon:"👑", pin:"1234" },
  vendedor: { label:"Vendedor",      color:"#2980B9",  icon:"🛒", pin:"5678" },
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
  {id:"Otros",          icon:"📦"},
];
const catIcon = (c) => CATS.find(x=>x.id===c)?.icon ?? "📦";

// ─── DATOS DEMO ───────────────────────────────────────────────────
const DEMO = [
  {id:1,nombre:"Ron Millonario 1L",       cat:"Licores",        stock:8,  min:5,  pc:45,  pv:75,  u:"bot."},
  {id:2,nombre:"Cerveza Paceña 620ml",    cat:"Cervezas",       stock:48, min:24, pc:8,   pv:15,  u:"und."},
  {id:3,nombre:"Vino Casillero Diablo",   cat:"Vinos",          stock:3,  min:6,  pc:55,  pv:90,  u:"bot."},
  {id:4,nombre:"Cigarros Marlboro",       cat:"Cigarros",       stock:15, min:10, pc:18,  pv:25,  u:"atad."},
  {id:5,nombre:"Chicle Trident Menta",    cat:"Chicles/Dulces", stock:2,  min:20, pc:1.5, pv:3,   u:"und."},
  {id:6,nombre:"Chupete Blow Pop",        cat:"Chupetes",       stock:30, min:15, pc:0.8, pv:2,   u:"und."},
  {id:7,nombre:"Singani Casa Real 750ml", cat:"Licores",        stock:6,  min:4,  pc:38,  pv:60,  u:"bot."},
  {id:8,nombre:"Coca Cola 2L",            cat:"Bebidas",        stock:12, min:10, pc:7,   pv:12,  u:"und."},
];

// ─── HELPERS ──────────────────────────────────────────────────────
const bs      = (n) => `Bs ${Number(n).toFixed(2)}`;
const gan     = (p) => p.pv - p.pc;
const mrg     = (p) => p.pc > 0 ? (((p.pv-p.pc)/p.pc)*100).toFixed(0) : 0;
const stockSt = (p) => p.stock === 0 ? "out" : p.stock <= p.min ? "low" : "ok";
const stColor = (st) => ({out:T.red, low:T.gold, ok:T.greenMid})[st];
const stLabel = (st) => ({out:"AGOTADO", low:"BAJO", ok:"OK"})[st];

// ─── HOOK RESPONSIVE ─────────────────────────────────────────────
function useIsMobile() {
  const [mob, setMob] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMob(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mob;
}

// ══════════════════════════════════════════════════════════════════
// ─── LOGIN SCREEN ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [step, setStep]   = useState("role"); // role | pin
  const [role, setRole]   = useState(null);
  const [digits, setDigits] = useState([]);
  const [shake, setShake]  = useState(false);
  const [err, setErr]      = useState("");

  const selectRole = (r) => { setRole(r); setStep("pin"); setDigits([]); setErr(""); };

  const press = (d) => {
    if (digits.length >= 4) return;
    const next = [...digits, d];
    setDigits(next);
    if (next.length === 4) verify(next);
  };
  const del = () => setDigits(d => d.slice(0,-1));

  const verify = (d) => {
    if (d.join("") === ROLES[role].pin) {
      onLogin(role);
    } else {
      setShake(true);
      setErr("PIN incorrecto");
      setTimeout(() => { setShake(false); setDigits([]); setErr(""); }, 900);
    }
  };

  const KEYS = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  return (
    <div style={{
      minHeight:"100vh", background:T.bgPage,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"system-ui,-apple-system,sans-serif", padding:24,
    }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>🍾</div>
          <div style={{ fontSize:32, fontWeight:800, letterSpacing:-1 }}>
            <span style={{ color:T.green }}>Lico</span>
            <span style={{ color:T.gold }}>Sport</span>
          </div>
          <div style={{ color:T.textMid, fontSize:14, marginTop:4 }}>Sistema de Gestión</div>
        </div>

        <div style={{ background:T.bgWhite, borderRadius:20, padding:28, boxShadow:"0 2px 20px #0000000D", border:`1px solid ${T.border}` }}>
          {step === "role" ? (
            <>
              <div style={{ color:T.textMid, fontSize:13, textAlign:"center", marginBottom:20 }}>¿Con qué perfil vas a ingresar?</div>
              {Object.entries(ROLES).map(([key, r]) => (
                <button key={key} onClick={() => selectRole(key)} style={{
                  width:"100%", padding:"16px 20px", marginBottom:12,
                  background:T.bgSurface, border:`2px solid ${T.border}`,
                  borderRadius:14, cursor:"pointer", display:"flex", alignItems:"center", gap:14,
                  transition:"border-color .15s", fontFamily:"inherit",
                }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:r.color+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{r.icon}</div>
                  <div style={{ textAlign:"left" }}>
                    <div style={{ color:T.text, fontWeight:700, fontSize:16 }}>{r.label}</div>
                    <div style={{ color:T.textMid, fontSize:12, marginTop:2 }}>
                      {key==="admin" ? "Acceso completo al sistema" : "Solo ventas y consultas"}
                    </div>
                  </div>
                  <div style={{ marginLeft:"auto", color:T.textLight, fontSize:20 }}>›</div>
                </button>
              ))}
            </>
          ) : (
            <>
              <button onClick={() => setStep("role")} style={{ background:"none", border:"none", color:T.textMid, cursor:"pointer", fontSize:13, marginBottom:16, padding:0, display:"flex", alignItems:"center", gap:6 }}>
                ‹ Cambiar perfil
              </button>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24, padding:"12px 16px", background:T.greenLight, borderRadius:12 }}>
                <span style={{ fontSize:24 }}>{ROLES[role].icon}</span>
                <div>
                  <div style={{ color:T.greenText, fontWeight:700, fontSize:15 }}>{ROLES[role].label}</div>
                  <div style={{ color:T.greenMid, fontSize:12 }}>Ingresa tu PIN de 4 dígitos</div>
                </div>
              </div>

              {/* Dots */}
              <div style={{ display:"flex", justifyContent:"center", gap:14, marginBottom:28, animation: shake ? "shake .5s" : "none" }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{
                    width:14, height:14, borderRadius:"50%",
                    background: i<digits.length ? ROLES[role].color : "transparent",
                    border:`2px solid ${i<digits.length ? ROLES[role].color : T.borderMid}`,
                    transition:"all .15s",
                  }}/>
                ))}
              </div>

              {err && <div style={{ color:T.red, fontSize:12, textAlign:"center", marginBottom:12 }}>{err}</div>}

              {/* Teclado */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                {KEYS.map((k,i) => {
                  if (k==="") return <div key={i}/>;
                  const isDel = k==="⌫";
                  return (
                    <button key={i} onClick={() => isDel ? del() : press(k)} style={{
                      height:58, borderRadius:14,
                      background: isDel ? T.bgSurface : T.bgWhite,
                      border:`1.5px solid ${T.border}`,
                      color: isDel ? T.red : T.text,
                      fontSize:22, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                      transition:"transform .1s, background .1s",
                    }}
                    onMouseDown={e => e.currentTarget.style.transform="scale(.94)"}
                    onMouseUp={e => e.currentTarget.style.transform="scale(1)"}
                    >{k}</button>
                  );
                })}
              </div>

              <div style={{ color:T.textLight, fontSize:11, textAlign:"center", marginTop:20 }}>
                Admin: 1234 · Vendedor: 5678
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
  const bg = { success: T.green, error: T.red, warning: T.gold }[type] ?? T.green;
  return (
    <div style={{
      position:"fixed", bottom:24, right:24,
      background:bg, color:"#fff",
      padding:"12px 20px", borderRadius:12, fontWeight:600, fontSize:14,
      zIndex:9999, boxShadow:"0 4px 16px #0003",
      animation:"slideIn .25s ease",
    }}>{msg}
    <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ─── SIDEBAR (desktop) ────────────────────────────────────────────
const NAV_ADMIN    = [{id:"home",icon:"🏠",l:"Inicio"},{id:"inv",icon:"📦",l:"Inventario"},{id:"venta",icon:"🛒",l:"Nueva Venta"},{id:"report",icon:"📊",l:"Reportes"},{id:"config",icon:"⚙️",l:"Configuración"}];
const NAV_VENDEDOR = [{id:"home",icon:"🏠",l:"Inicio"},{id:"venta",icon:"🛒",l:"Nueva Venta"},{id:"historial",icon:"🧾",l:"Mis Ventas"}];

function Sidebar({ role, tab, onTab, onLogout, alertas }) {
  const nav = role === "admin" ? NAV_ADMIN : NAV_VENDEDOR;
  return (
    <aside style={{
      width:220, minHeight:"100vh", background:T.sidebarBg,
      display:"flex", flexDirection:"column", position:"fixed", left:0, top:0, bottom:0,
      zIndex:100, fontFamily:"system-ui,sans-serif",
    }}>
      {/* Logo */}
      <div style={{ padding:"24px 20px 16px" }}>
        <div style={{ fontSize:22, fontWeight:800, letterSpacing:-.5 }}>
          <span style={{ color:T.greenMid }}>Lico</span><span style={{ color:T.gold }}>Sport</span>
        </div>
        <div style={{ color:T.sidebarText+"88", fontSize:11, marginTop:2 }}>Sistema de Gestión</div>
      </div>

      {/* Perfil */}
      <div style={{ margin:"0 12px 16px", background:"#FFFFFF18", borderRadius:12, padding:"12px 14px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:ROLES[role].color+"44", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{ROLES[role].icon}</div>
          <div>
            <div style={{ color:"#fff", fontWeight:700, fontSize:13 }}>{ROLES[role].label}</div>
            <div style={{ color:T.sidebarText+"88", fontSize:11 }}>Sesión activa</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"0 10px" }}>
        {nav.map(({id,icon,l}) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => onTab(id)} style={{
              width:"100%", padding:"10px 14px", marginBottom:4,
              background: active ? T.sidebarActive+"33" : "transparent",
              border:"none", borderRadius:10,
              display:"flex", alignItems:"center", gap:10,
              color: active ? "#fff" : T.sidebarText,
              fontWeight: active ? 700 : 400, fontSize:14,
              cursor:"pointer", textAlign:"left", fontFamily:"inherit",
              transition:"background .15s",
              position:"relative",
            }}>
              {active && <div style={{ position:"absolute", left:0, top:"20%", bottom:"20%", width:3, background:T.greenMid, borderRadius:2 }}/>}
              <span style={{ fontSize:18 }}>{icon}</span>{l}
              {id==="inv" && alertas > 0 && (
                <span style={{ marginLeft:"auto", background:T.red, color:"#fff", fontSize:10, fontWeight:700, borderRadius:10, padding:"2px 7px" }}>{alertas}</span>
              )}
            </button>
          );
        })}
      </nav>

      <button onClick={onLogout} style={{
        margin:"12px 10px 20px", padding:"10px 14px",
        background:"#FFFFFF12", border:"1px solid #FFFFFF20",
        borderRadius:10, color:T.sidebarText, cursor:"pointer",
        display:"flex", alignItems:"center", gap:10, fontSize:13,
        fontFamily:"inherit",
      }}>🔒 Cerrar sesión</button>
    </aside>
  );
}

// ─── BOTTOM NAV (mobile) ──────────────────────────────────────────
function BottomNav({ role, tab, onTab, onLogout, alertas }) {
  const nav = role === "admin" ? NAV_ADMIN.slice(0,4) : NAV_VENDEDOR;
  return (
    <nav style={{
      position:"fixed", bottom:0, left:0, right:0,
      background:T.bgWhite, borderTop:`1px solid ${T.border}`,
      display:"flex", zIndex:800,
      paddingBottom:"env(safe-area-inset-bottom,0px)",
      boxShadow:"0 -2px 12px #00000010",
    }}>
      {nav.map(({id,icon,l}) => {
        const isSell = id==="venta";
        const active = tab === id;
        return (
          <button key={id} onClick={() => onTab(id)} style={{
            flex:1, border:"none", background:"transparent",
            display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", padding: isSell ? 0 : "8px 0 6px",
            cursor:"pointer", position:"relative", fontFamily:"inherit",
          }}>
            {isSell ? (
              <div style={{
                width:52, height:52, borderRadius:"50%",
                background:T.green,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:22, marginTop:-16,
                border:`3px solid ${T.bgPage}`,
                boxShadow:`0 2px 12px ${T.green}55`,
              }}>{icon}</div>
            ) : (
              <>
                <span style={{ fontSize:20, lineHeight:1, position:"relative" }}>
                  {icon}
                  {id==="inv" && alertas>0 && (
                    <span style={{ position:"absolute", top:-4, right:-6, background:T.red, color:"#fff", fontSize:8, fontWeight:700, borderRadius:8, padding:"1px 4px" }}>{alertas}</span>
                  )}
                </span>
                <span style={{ fontSize:10, color: active ? T.green : T.textLight, marginTop:3, fontWeight: active?700:400 }}>{l}</span>
                {active && <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:24, height:3, borderRadius:2, background:T.green }}/>}
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
  return (
    <div style={{ background:T.bgWhite, borderRadius:16, border:`1px solid ${T.border}`, padding:"16px 18px", ...style }}>
      {children}
    </div>
  );
}

// ─── BOTTOM SHEET (mobile modal) ──────────────────────────────────
function Sheet({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"#0005", zIndex:1000, display:"flex", alignItems:"flex-end" }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{
        background:T.bgWhite, borderRadius:"20px 20px 0 0",
        width:"100%", maxWidth:640, margin:"0 auto",
        maxHeight:"92vh", overflowY:"auto",
        border:`1px solid ${T.border}`, borderBottom:"none",
        animation:"sheetUp .2s ease",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px 10px" }}>
          <span style={{ color:T.text, fontWeight:700, fontSize:17 }}>{title}</span>
          <button onClick={onClose} style={{ background:T.bgSurface, border:"none", color:T.textMid, fontSize:18, width:32, height:32, borderRadius:"50%", cursor:"pointer" }}>×</button>
        </div>
        <div style={{ padding:"0 20px 100px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── DIALOG (desktop modal) ───────────────────────────────────────
function Dialog({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"#0005", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{
        background:T.bgWhite, borderRadius:20, padding:28,
        width:"100%", maxWidth:500,
        maxHeight:"90vh", overflowY:"auto",
        border:`1px solid ${T.border}`, boxShadow:"0 8px 40px #0002",
        animation:"sheetUp .2s ease",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <span style={{ color:T.text, fontWeight:700, fontSize:18 }}>{title}</span>
          <button onClick={onClose} style={{ background:T.bgSurface, border:"none", color:T.textMid, fontSize:18, width:32, height:32, borderRadius:"50%", cursor:"pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── FIELD ────────────────────────────────────────────────────────
function Field({ label, value, onChange, type="text", readOnly=false }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ color:T.textMid, fontSize:12, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:.7 }}>{label}</label>
      <input type={type} value={value} onChange={onChange} readOnly={readOnly}
        inputMode={type==="number"?"decimal":"text"}
        style={{
          width:"100%", padding:"11px 14px", background: readOnly ? T.bgSurface : T.bgWhite,
          border:`1.5px solid ${T.border}`, borderRadius:10,
          color: readOnly ? T.textMid : T.text, fontSize:15, boxSizing:"border-box",
          fontFamily:"inherit",
        }}
      />
    </div>
  );
}

// ─── MODAL PRODUCTO (admin only) ─────────────────────────────────
function ModalProducto({ prod, isMobile, onClose, onSave }) {
  const [f, setF] = useState(prod ?? {nombre:"",cat:"Licores",stock:0,min:5,pc:0,pv:0,u:"und."});
  const set = (k,v) => setF(p => ({...p,[k]:v}));
  const gP  = f.pv - f.pc;
  const mP  = f.pc>0 ? (((f.pv-f.pc)/f.pc)*100).toFixed(0) : 0;
  const Wrap = isMobile ? Sheet : Dialog;

  const content = (
    <>
      <Field label="Nombre del producto" value={f.nombre} onChange={e=>set("nombre",e.target.value)} />
      <div style={{ marginBottom:14 }}>
        <label style={{ color:T.textMid, fontSize:12, display:"block", marginBottom:8, textTransform:"uppercase", letterSpacing:.7 }}>Categoría</label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
          {CATS.map(({id,icon}) => (
            <button key={id} onClick={() => set("cat",id)} style={{
              padding:"6px 12px", borderRadius:20,
              border:`1.5px solid ${f.cat===id ? T.green : T.border}`,
              background: f.cat===id ? T.greenLight : T.bgWhite,
              color: f.cat===id ? T.greenText : T.textMid,
              fontSize:12, cursor:"pointer", fontWeight: f.cat===id?700:400, fontFamily:"inherit",
            }}>{icon} {id}</button>
          ))}
        </div>
      </div>
      <Field label="Unidad (und. / bot. / caja)" value={f.u} onChange={e=>set("u",e.target.value)} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Field label="Stock actual"     type="number" value={f.stock} onChange={e=>set("stock",parseFloat(e.target.value)||0)} />
        <Field label="Stock mínimo"     type="number" value={f.min}   onChange={e=>set("min",parseFloat(e.target.value)||0)} />
        <Field label="Precio compra Bs" type="number" value={f.pc}    onChange={e=>set("pc",parseFloat(e.target.value)||0)} />
        <Field label="Precio venta Bs"  type="number" value={f.pv}    onChange={e=>set("pv",parseFloat(e.target.value)||0)} />
      </div>
      {f.pc>0 && f.pv>0 && (
        <div style={{ background: gP>=0 ? T.greenLight : T.redLight, borderRadius:10, padding:"12px 16px", marginBottom:16, border:`1px solid ${gP>=0?T.border:T.red+"44"}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
            <span style={{ color:T.textMid, fontSize:13 }}>Ganancia / unidad</span>
            <span style={{ color: gP>=0 ? T.greenText : T.red, fontWeight:700, fontFamily:"monospace" }}>{bs(gP)}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span style={{ color:T.textMid, fontSize:13 }}>Margen</span>
            <span style={{ color:T.gold, fontWeight:700 }}>{mP}%</span>
          </div>
        </div>
      )}
      <button onClick={() => f.nombre.trim() && onSave(f)} style={{
        width:"100%", padding:14, background: f.nombre.trim() ? T.green : T.borderMid,
        color:"#fff", border:"none", borderRadius:12, fontWeight:700, fontSize:15,
        cursor: f.nombre.trim()?"pointer":"not-allowed", fontFamily:"inherit",
      }}>{prod ? "Guardar cambios" : "Agregar producto"}</button>
    </>
  );

  return <Wrap title={prod?"✏️ Editar Producto":"➕ Nuevo Producto"} onClose={onClose}>{content}</Wrap>;
}

// ══════════════════════════════════════════════════════════════════
// ─── VISTAS ──────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════

// HOME
function Home({ role, productos, ventas, onAction }) {
  const alertas   = productos.filter(p => p.stock <= p.min);
  const totalInv  = productos.reduce((s,p) => s+p.pc*p.stock, 0);
  const totalV    = ventas.reduce((s,v) => s+v.total, 0);
  const totalG    = ventas.reduce((s,v) => s+v.gan, 0);
  const isAdmin   = role === "admin";

  const kpis = isAdmin
    ? [
        {l:"Ventas hoy",      v:bs(totalV),           c:T.green,  bg:T.greenLight},
        {l:"Ganancia hoy",    v:bs(totalG),            c:T.gold,   bg:T.goldLight},
        {l:"Valor en stock",  v:bs(totalInv),          c:T.text,   bg:T.bgSurface},
        {l:"Productos",       v:String(productos.length), c:T.text, bg:T.bgSurface},
      ]
    : [
        {l:"Ventas realizadas", v:String(ventas.length), c:T.green, bg:T.greenLight},
        {l:"Total vendido",     v:bs(totalV),            c:T.green, bg:T.greenLight},
      ];

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom:24 }}>
        <div style={{ color:T.textMid, fontSize:13 }}>Bienvenido,</div>
        <div style={{ fontSize:26, fontWeight:800, letterSpacing:-.5, color:T.text }}>
          {ROLES[role].icon} {ROLES[role].label}
        </div>
        <div style={{ color:T.textMid, fontSize:13, marginTop:2 }}>
          {new Date().toLocaleDateString("es-BO",{weekday:"long",day:"2-digit",month:"long"})}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginBottom:20 }}>
        {kpis.map(({l,v,c,bg}) => (
          <Card key={l} style={{ background:bg }}>
            <div style={{ color:T.textMid, fontSize:11, marginBottom:4 }}>{l}</div>
            <div style={{ color:c, fontWeight:800, fontSize:20, fontFamily:"monospace" }}>{v}</div>
          </Card>
        ))}
      </div>

      {/* Alerta stock (solo admin) */}
      {isAdmin && alertas.length > 0 && (
        <div onClick={() => onAction("inv")} style={{
          background:T.redLight, border:`1.5px solid ${T.red}44`,
          borderRadius:14, padding:"14px 18px", marginBottom:20,
          display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer",
        }}>
          <div>
            <div style={{ color:T.red, fontWeight:700, fontSize:14 }}>⚠️ {alertas.length} productos con stock bajo</div>
            <div style={{ color:T.redText, fontSize:12, marginTop:2 }}>{alertas.slice(0,2).map(p=>p.nombre).join(", ")}{alertas.length>2?` y ${alertas.length-2} más`:""}</div>
          </div>
          <span style={{ color:T.red, fontSize:20 }}>›</span>
        </div>
      )}

      {/* Accesos rápidos */}
      <div style={{ color:T.textLight, fontSize:11, marginBottom:10, textTransform:"uppercase", letterSpacing:1 }}>Acceso rápido</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:10, marginBottom:24 }}>
        <button onClick={() => onAction("venta")} style={{ padding:"16px 14px", background:T.green, border:"none", borderRadius:14, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", gap:10, fontFamily:"inherit" }}>
          <span style={{ fontSize:20 }}>🛒</span> Nueva venta
        </button>
        {isAdmin && <>
          <button onClick={() => onAction("nuevo")} style={{ padding:"16px 14px", background:T.bgWhite, border:`1px solid ${T.border}`, borderRadius:14, color:T.text, fontWeight:700, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", gap:10, fontFamily:"inherit" }}>
            <span style={{ fontSize:20 }}>➕</span> Agregar stock
          </button>
          <button onClick={() => onAction("inv")} style={{ padding:"16px 14px", background:T.bgWhite, border:`1px solid ${T.border}`, borderRadius:14, color:T.text, fontWeight:700, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", gap:10, fontFamily:"inherit" }}>
            <span style={{ fontSize:20 }}>📦</span> Inventario
          </button>
          <button onClick={() => onAction("report")} style={{ padding:"16px 14px", background:T.bgWhite, border:`1px solid ${T.border}`, borderRadius:14, color:T.text, fontWeight:700, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", gap:10, fontFamily:"inherit" }}>
            <span style={{ fontSize:20 }}>📊</span> Reportes
          </button>
        </>}
      </div>

      {/* Últimas ventas */}
      {ventas.length > 0 && (
        <>
          <div style={{ color:T.textLight, fontSize:11, marginBottom:10, textTransform:"uppercase", letterSpacing:1 }}>Últimas ventas</div>
          {[...ventas].reverse().slice(0,5).map(v => (
            <Card key={v.id} style={{ marginBottom:8, padding:"12px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ color:T.text, fontSize:13, fontWeight:500 }}>{v.items.map(i=>`${i.nombre} ×${i.qty}`).join(", ").slice(0,50)}</div>
                  <div style={{ color:T.textMid, fontSize:11, marginTop:3 }}>{v.hora} · {v.vendedor}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color:T.green, fontWeight:700, fontFamily:"monospace" }}>{bs(v.total)}</div>
                  {isAdmin && <div style={{ color:T.gold, fontSize:11, fontFamily:"monospace" }}>+{bs(v.gan)}</div>}
                </div>
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}

// INVENTARIO (solo admin)
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
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ color:T.text, fontWeight:800, fontSize:20 }}>📦 Inventario</div>
        <button onClick={onNuevo} style={{ background:T.green, border:"none", color:"#fff", fontWeight:700, fontSize:13, padding:"8px 18px", borderRadius:20, cursor:"pointer", fontFamily:"inherit" }}>+ Nuevo producto</button>
      </div>

      {/* Filtros */}
      <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
        <input placeholder="🔍 Buscar..." value={busq} onChange={e=>setBusq(e.target.value)}
          style={{ flex:1, minWidth:180, padding:"10px 14px", background:T.bgWhite, border:`1.5px solid ${T.border}`, borderRadius:10, color:T.text, fontSize:14, fontFamily:"inherit" }}
        />
        <select value={cat} onChange={e=>setCat(e.target.value)}
          style={{ padding:"10px 14px", background:T.bgWhite, border:`1.5px solid ${T.border}`, borderRadius:10, color:T.text, fontSize:14, fontFamily:"inherit" }}>
          <option>Todas</option>
          {CATS.map(c=><option key={c.id}>{c.id}</option>)}
        </select>
      </div>

      {/* Chips resumen */}
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        {[
          {l:`${productos.length} total`, c:T.text,    bg:T.bgSurface},
          {l:`${productos.filter(p=>p.stock<=p.min&&p.stock>0).length} bajo`, c:T.gold, bg:T.goldLight},
          {l:`${productos.filter(p=>p.stock===0).length} agotado`, c:T.red,  bg:T.redLight},
        ].map(({l,c,bg}) => (
          <span key={l} style={{ background:bg, color:c, fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20, border:`1px solid ${T.border}` }}>{l}</span>
        ))}
      </div>

      {/* Tabla escritorio / cards mobile */}
      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:T.bgSurface, borderBottom:`2px solid ${T.border}` }}>
                {["Producto","Categoría","Stock","Compra","Venta","Ganancia","Margen","Estado",""].map(h => (
                  <th key={h} style={{ padding:"12px 14px", color:T.textMid, textAlign:"left", fontWeight:600, whiteSpace:"nowrap", fontSize:12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.map((p, i) => {
                const st = stockSt(p);
                const sc = stColor(st);
                const pct= Math.min((p.stock/Math.max(p.min,1))*100,100);
                return (
                  <tr key={p.id} style={{ borderBottom:`1px solid ${T.border}`, background: i%2===0?T.bgWhite:T.bgSurface }}>
                    <td style={{ padding:"12px 14px", fontWeight:600, color:T.text }}>{catIcon(p.cat)} {p.nombre}</td>
                    <td style={{ padding:"12px 14px", color:T.textMid }}>{p.cat}</td>
                    <td style={{ padding:"12px 14px" }}>
                      <div style={{ color:sc, fontWeight:700, fontFamily:"monospace" }}>{p.stock} {p.u}</div>
                      <div style={{ background:T.border, borderRadius:2, height:4, marginTop:4, width:60 }}>
                        <div style={{ background:sc, width:`${pct}%`, height:"100%", borderRadius:2 }}/>
                      </div>
                    </td>
                    <td style={{ padding:"12px 14px", color:T.textMid, fontFamily:"monospace" }}>{bs(p.pc)}</td>
                    <td style={{ padding:"12px 14px", color:T.text, fontFamily:"monospace", fontWeight:600 }}>{bs(p.pv)}</td>
                    <td style={{ padding:"12px 14px", color:T.greenText, fontFamily:"monospace", fontWeight:700 }}>+{bs(gan(p))}</td>
                    <td style={{ padding:"12px 14px" }}>
                      <span style={{ color: parseFloat(mrg(p))>=30 ? T.green : T.gold, fontWeight:700 }}>{mrg(p)}%</span>
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      <span style={{ background:`${sc}18`, color:sc, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:10 }}>{stLabel(st)}</span>
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={() => onEditar(p)} style={{ background:T.bgSurface, border:`1px solid ${T.border}`, color:T.text, borderRadius:8, padding:"5px 10px", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>✏️</button>
                        <button onClick={() => onEliminar(p.id)} style={{ background:T.redLight, border:`1px solid ${T.red}44`, color:T.red, borderRadius:8, padding:"5px 10px", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {lista.length===0 && <div style={{ textAlign:"center", padding:30, color:T.textLight }}>Sin productos</div>}
        </div>
      </Card>
    </div>
  );
}

// VENTA
function Venta({ role, productos, onConfirmar }) {
  const [busq,    setBusq]    = useState("");
  const [carrito, setCarrito] = useState([]);

  const disp = productos.filter(p => p.stock>0 && p.nombre.toLowerCase().includes(busq.toLowerCase()));
  const total    = carrito.reduce((s,i) => s+i.pv*i.qty, 0);
  const ganTotal = carrito.reduce((s,i) => s+(i.pv-i.pc)*i.qty, 0);
  const isAdmin  = role==="admin";

  const agregar = (p) => setCarrito(c => {
    const ex = c.find(i=>i.id===p.id);
    if (ex) return ex.qty>=p.stock ? c : c.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i);
    return [...c,{...p,qty:1}];
  });
  const restar = (id) => setCarrito(c => {
    const ex=c.find(i=>i.id===id);
    if(!ex||ex.qty<=1) return c.filter(i=>i.id!==id);
    return c.map(i=>i.id===id?{...i,qty:i.qty-1}:i);
  });
  const quitar = (id) => setCarrito(c=>c.filter(i=>i.id!==id));

  return (
    <div>
      <div style={{ color:T.text, fontWeight:800, fontSize:20, marginBottom:20 }}>🛒 Nueva Venta</div>

      <div style={{ display:"grid", gridTemplateColumns: carrito.length>0 ? "1fr 1fr" : "1fr", gap:20 }}>
        {/* Búsqueda */}
        <div>
          <input placeholder="🔍 Buscar producto..." value={busq} onChange={e=>setBusq(e.target.value)}
            style={{ width:"100%", padding:"11px 14px", background:T.bgWhite, border:`1.5px solid ${T.border}`, borderRadius:10, color:T.text, fontSize:14, boxSizing:"border-box", marginBottom:10, fontFamily:"inherit" }}
          />
          <div style={{ maxHeight:380, overflowY:"auto" }}>
            {busq && disp.map(p => {
              const enC = carrito.find(i=>i.id===p.id);
              return (
                <Card key={p.id} style={{ marginBottom:8, padding:"12px 14px", cursor:"pointer", border:`1.5px solid ${enC?T.green+"66":T.border}` }}
                  onClick={() => agregar(p)}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ color:T.text, fontWeight:600, fontSize:14 }}>{catIcon(p.cat)} {p.nombre}</div>
                      <div style={{ color:T.textMid, fontSize:12 }}>Stock: {p.stock} {p.u}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ color:T.green, fontWeight:800, fontFamily:"monospace" }}>{bs(p.pv)}</div>
                      {enC && <div style={{ color:T.gold, fontSize:11 }}>×{enC.qty} agregado</div>}
                    </div>
                  </div>
                </Card>
              );
            })}
            {busq && disp.length===0 && <div style={{ color:T.textLight, textAlign:"center", padding:20 }}>Sin resultados</div>}
            {!busq && (
              <div style={{ textAlign:"center", paddingTop:40, color:T.textLight }}>
                <div style={{ fontSize:40, marginBottom:10 }}>🛒</div>
                <div>Escribe para buscar un producto</div>
              </div>
            )}
          </div>
        </div>

        {/* Carrito */}
        {carrito.length > 0 && (
          <div>
            <div style={{ color:T.textMid, fontSize:12, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>Carrito ({carrito.length})</div>
            <div style={{ maxHeight:280, overflowY:"auto", marginBottom:12 }}>
              {carrito.map(i => (
                <Card key={i.id} style={{ marginBottom:8, padding:"10px 12px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ color:T.text, fontSize:13, fontWeight:600 }}>{i.nombre}</div>
                      <div style={{ color:T.green, fontFamily:"monospace", fontSize:12 }}>{bs(i.pv)} × {i.qty} = {bs(i.pv*i.qty)}</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <button onClick={()=>restar(i.id)} style={{ width:28,height:28,borderRadius:"50%",background:T.bgSurface,border:`1px solid ${T.border}`,color:T.text,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit" }}>−</button>
                      <span style={{ color:T.text,fontWeight:700,minWidth:18,textAlign:"center" }}>{i.qty}</span>
                      <button onClick={()=>agregar(i)} style={{ width:28,height:28,borderRadius:"50%",background:T.bgSurface,border:`1px solid ${T.border}`,color:T.green,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit" }}>+</button>
                      <button onClick={()=>quitar(i.id)} style={{ width:28,height:28,borderRadius:"50%",background:T.redLight,border:"none",color:T.red,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit" }}>×</button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card style={{ background:T.greenLight, marginBottom:14 }}>
              {isAdmin && (
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ color:T.textMid, fontSize:13 }}>Ganancia estimada</span>
                  <span style={{ color:T.gold, fontWeight:700, fontFamily:"monospace" }}>{bs(ganTotal)}</span>
                </div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ color:T.text, fontWeight:700, fontSize:18 }}>TOTAL</span>
                <span style={{ color:T.green, fontWeight:900, fontFamily:"monospace", fontSize:22 }}>{bs(total)}</span>
              </div>
            </Card>

            <button onClick={() => { onConfirmar(carrito); setCarrito([]); setBusq(""); }} style={{
              width:"100%", padding:15, background:T.green, color:"#fff",
              border:"none", borderRadius:12, fontWeight:800, fontSize:16, cursor:"pointer",
              boxShadow:`0 3px 14px ${T.green}44`, fontFamily:"inherit",
            }}>
              ✅ Confirmar venta · {bs(total)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// REPORTES (admin)
function Reportes({ productos, ventas }) {
  const totalV  = ventas.reduce((s,v)=>s+v.total,0);
  const totalG  = ventas.reduce((s,v)=>s+v.gan,0);
  const mGlob   = totalV>0 ? ((totalG/totalV)*100).toFixed(1) : 0;
  const topR    = [...productos].sort((a,b)=>parseFloat(mrg(b))-parseFloat(mrg(a))).slice(0,5);
  const porCat  = CATS.map(({id,icon})=>{
    const ps=productos.filter(p=>p.cat===id);
    return {id,icon,qty:ps.length,valor:ps.reduce((s,p)=>s+p.pc*p.stock,0),ganPot:ps.reduce((s,p)=>s+gan(p)*p.stock,0)};
  }).filter(c=>c.qty>0);

  return (
    <div>
      <div style={{ color:T.text, fontWeight:800, fontSize:20, marginBottom:20 }}>📊 Reportes</div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
        {[
          {l:"Ventas totales",  v:bs(totalV),     c:T.green, bg:T.greenLight},
          {l:"Ganancia total",  v:bs(totalG),     c:T.gold,  bg:T.goldLight},
          {l:"Margen promedio", v:`${mGlob}%`,    c:T.text,  bg:T.bgSurface},
        ].map(({l,v,c,bg}) => (
          <Card key={l} style={{ background:bg }}>
            <div style={{ color:T.textMid, fontSize:11, marginBottom:4 }}>{l}</div>
            <div style={{ color:c, fontWeight:800, fontSize:18, fontFamily:"monospace" }}>{v}</div>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        {/* Top rentables */}
        <div>
          <div style={{ color:T.textLight, fontSize:11, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>🏆 Más rentables</div>
          <Card style={{ padding:0, overflow:"hidden" }}>
            {topR.map((p,i) => (
              <div key={p.id} style={{ display:"flex", justifyContent:"space-between", padding:"12px 16px", borderBottom: i<4?`1px solid ${T.border}`:"none", alignItems:"center" }}>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <span style={{ fontSize:18 }}>{["🥇","🥈","🥉","4️⃣","5️⃣"][i]}</span>
                  <div>
                    <div style={{ color:T.text, fontSize:13, fontWeight:600 }}>{p.nombre}</div>
                    <div style={{ color:T.textMid, fontSize:11 }}>{p.cat}</div>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color:T.gold, fontWeight:700 }}>{mrg(p)}%</div>
                  <div style={{ color:T.green, fontSize:11, fontFamily:"monospace" }}>+{bs(gan(p))}/ud</div>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Por categoría */}
        <div>
          <div style={{ color:T.textLight, fontSize:11, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>📦 Por categoría</div>
          <Card style={{ padding:0, overflow:"hidden" }}>
            {porCat.map((c,i) => (
              <div key={c.id} style={{ padding:"11px 16px", borderBottom: i<porCat.length-1?`1px solid ${T.border}`:"none" }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:T.text, fontWeight:600, fontSize:13 }}>{c.icon} {c.id}</span>
                  <span style={{ color:T.textMid, fontSize:12 }}>{c.qty} productos</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}>
                  <span style={{ color:T.textMid, fontSize:11 }}>Inv: <span style={{ color:T.text, fontFamily:"monospace" }}>{bs(c.valor)}</span></span>
                  <span style={{ color:T.textMid, fontSize:11 }}>Pot: <span style={{ color:T.green, fontFamily:"monospace" }}>{bs(c.ganPot)}</span></span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Historial */}
      <div style={{ marginTop:20 }}>
        <div style={{ color:T.textLight, fontSize:11, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>🧾 Historial de ventas ({ventas.length})</div>
        {ventas.length===0
          ? <Card><div style={{ color:T.textLight, textAlign:"center", padding:20 }}>Sin ventas registradas</div></Card>
          : <Card style={{ padding:0, overflow:"hidden" }}>
              {[...ventas].reverse().map((v,i) => (
                <div key={v.id} style={{ display:"flex", justifyContent:"space-between", padding:"12px 16px", borderBottom: i<ventas.length-1?`1px solid ${T.border}`:"none", alignItems:"center" }}>
                  <div>
                    <div style={{ color:T.text, fontSize:13 }}>{v.items.map(i=>`${i.nombre} ×${i.qty}`).join(", ").slice(0,50)}</div>
                    <div style={{ color:T.textMid, fontSize:11, marginTop:2 }}>{v.hora} · {v.vendedor}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ color:T.green, fontWeight:700, fontFamily:"monospace" }}>{bs(v.total)}</div>
                    <div style={{ color:T.gold, fontSize:11, fontFamily:"monospace" }}>+{bs(v.gan)}</div>
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
function HistorialVendedor({ ventas, role }) {
  const mias = ventas.filter(v => v.vendedor === ROLES[role].label);
  const totalV = mias.reduce((s,v)=>s+v.total,0);
  return (
    <div>
      <div style={{ color:T.text, fontWeight:800, fontSize:20, marginBottom:20 }}>🧾 Mis Ventas</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
        <Card style={{ background:T.greenLight }}>
          <div style={{ color:T.textMid, fontSize:11 }}>Ventas realizadas</div>
          <div style={{ color:T.green, fontWeight:800, fontSize:22 }}>{mias.length}</div>
        </Card>
        <Card style={{ background:T.greenLight }}>
          <div style={{ color:T.textMid, fontSize:11 }}>Total vendido</div>
          <div style={{ color:T.green, fontWeight:800, fontSize:18, fontFamily:"monospace" }}>{bs(totalV)}</div>
        </Card>
      </div>
      {mias.length===0
        ? <Card><div style={{ color:T.textLight, textAlign:"center", padding:30 }}>Aún no has registrado ventas</div></Card>
        : <Card style={{ padding:0, overflow:"hidden" }}>
            {[...mias].reverse().map((v,i) => (
              <div key={v.id} style={{ padding:"12px 16px", borderBottom: i<mias.length-1?`1px solid ${T.border}`:"none" }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ color:T.text, fontSize:13 }}>{v.items.map(i=>`${i.nombre} ×${i.qty}`).join(", ").slice(0,44)}</div>
                    <div style={{ color:T.textMid, fontSize:11, marginTop:2 }}>{v.hora}</div>
                  </div>
                  <div style={{ color:T.green, fontWeight:700, fontFamily:"monospace" }}>{bs(v.total)}</div>
                </div>
              </div>
            ))}
          </Card>
      }
    </div>
  );
}

// CONFIG (admin)
function Config({ onCambiarPin }) {
  const [nuevoPin, setNuevoPin] = useState({admin:"", vendedor:""});
  return (
    <div>
      <div style={{ color:T.text, fontWeight:800, fontSize:20, marginBottom:20 }}>⚙️ Configuración</div>
      <Card style={{ marginBottom:16 }}>
        <div style={{ color:T.text, fontWeight:700, fontSize:15, marginBottom:14 }}>🔑 Cambiar PINs de acceso</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {Object.entries(ROLES).map(([key,r]) => (
            <div key={key}>
              <div style={{ color:T.textMid, fontSize:12, marginBottom:6, textTransform:"uppercase", letterSpacing:.7 }}>{r.label}</div>
              <div style={{ display:"flex", gap:8 }}>
                <input
                  type="number" placeholder="Nuevo PIN" maxLength={4}
                  value={nuevoPin[key]}
                  onChange={e=>setNuevoPin(p=>({...p,[key]:e.target.value.slice(0,4)}))}
                  style={{ flex:1, padding:"10px 12px", background:T.bgWhite, border:`1.5px solid ${T.border}`, borderRadius:10, color:T.text, fontSize:15, fontFamily:"inherit" }}
                />
                <button onClick={() => { onCambiarPin(key, nuevoPin[key]); setNuevoPin(p=>({...p,[key]:""})); }} style={{
                  padding:"10px 14px", background:T.green, border:"none", color:"#fff", borderRadius:10, fontWeight:700, cursor:"pointer", fontSize:13, fontFamily:"inherit"
                }}>Guardar</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div style={{ color:T.text, fontWeight:700, fontSize:15, marginBottom:10 }}>ℹ️ Permisos por perfil</div>
        {[
          {r:"Administrador", perms:["Ver inventario completo","Agregar / editar / eliminar productos","Ver precios de compra y ganancias","Ver todos los reportes","Configurar el sistema","Registrar ventas"]},
          {r:"Vendedor", perms:["Registrar ventas","Ver su historial de ventas","Consultar precios de venta","Ver productos disponibles"]},
        ].map(({r,perms}) => (
          <div key={r} style={{ marginBottom:16 }}>
            <div style={{ color:T.textMid, fontWeight:600, fontSize:13, marginBottom:6 }}>{r}</div>
            {perms.map(p => (
              <div key={p} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
                <span style={{ color:T.green, fontSize:13 }}>✓</span>
                <span style={{ color:T.text, fontSize:13 }}>{p}</span>
              </div>
            ))}
          </div>
        ))}
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ─── APP ROOT ─────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════
export default function LicoSport() {
  const isMobile = useIsMobile();
  const [role,     setRole]     = useState(null);
  const [tab,      setTab]      = useState("home");
  const [productos,setProductos]= useState(DEMO);
  const [ventas,   setVentas]   = useState([]);
  const [modalProd,setModalProd]= useState(null);
  const [toast,    setToast]    = useState(null);
  const [pins,     setPins]     = useState({admin:"1234", vendedor:"5678"});

  // Inyectar pins dinámicos en ROLES
  ROLES.admin.pin    = pins.admin;
  ROLES.vendedor.pin = pins.vendedor;

  const alertasCount = productos.filter(p=>p.stock<=p.min).length;
  const showToast = (msg, type="success") => setToast({msg,type});

  const guardar = (f) => {
    if (f.id) {
      setProductos(ps => ps.map(p=>p.id===f.id?f:p));
      showToast("Producto actualizado");
    } else {
      setProductos(ps => [...ps, {...f, id:Date.now()}]);
      showToast("Producto agregado");
    }
    setModalProd(null);
  };

  const eliminar = (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    setProductos(ps => ps.filter(p=>p.id!==id));
    showToast("Producto eliminado", "error");
  };

  const confirmarVenta = (carrito) => {
    const total = carrito.reduce((s,i)=>s+i.pv*i.qty, 0);
    const gan_  = carrito.reduce((s,i)=>s+(i.pv-i.pc)*i.qty, 0);
    setProductos(ps => ps.map(p => {
      const it = carrito.find(i=>i.id===p.id);
      return it ? {...p, stock:p.stock-it.qty} : p;
    }));
    setVentas(vs => [...vs, {
      id:Date.now(),
      hora: new Date().toLocaleTimeString("es-BO",{hour:"2-digit",minute:"2-digit"}),
      vendedor: ROLES[role].label,
      items:carrito, total, gan:gan_,
    }]);
    setTab("home");
    showToast(`Venta registrada · ${bs(total)}`);
  };

  const handleAction = (action) => {
    if (action==="nuevo") { setModalProd({}); return; }
    setTab(action);
  };

  const cambiarPin = (r, newPin) => {
    if (newPin.length !== 4) { showToast("El PIN debe tener 4 dígitos","error"); return; }
    setPins(p => ({...p, [r]:newPin}));
    showToast(`PIN de ${ROLES[r].label} actualizado`);
  };

  if (!role) return <LoginScreen onLogin={r => { setRole(r); setTab("home"); }} />;

  const navItems = role==="admin" ? NAV_ADMIN : NAV_VENDEDOR;

  const renderContent = () => {
    if (tab==="home")     return <Home role={role} productos={productos} ventas={ventas} onAction={handleAction} />;
    if (tab==="inv")      return role==="admin" ? <Inventario productos={productos} onEditar={setModalProd} onEliminar={eliminar} onNuevo={()=>setModalProd({})} /> : null;
    if (tab==="venta")    return <Venta role={role} productos={productos} onConfirmar={confirmarVenta} />;
    if (tab==="report")   return role==="admin" ? <Reportes productos={productos} ventas={ventas} /> : null;
    if (tab==="historial")return role==="vendedor" ? <HistorialVendedor ventas={ventas} role={role} /> : null;
    if (tab==="config")   return role==="admin" ? <Config onCambiarPin={cambiarPin} /> : null;
    return null;
  };

  return (
    <div style={{ minHeight:"100vh", background:T.bgPage, fontFamily:"system-ui,-apple-system,sans-serif", color:T.text }}>

      {/* Desktop layout */}
      {!isMobile && (
        <>
          <Sidebar role={role} tab={tab} onTab={setTab} onLogout={()=>setRole(null)} alertas={alertasCount} />
          <main style={{ marginLeft:220, padding:32, minHeight:"100vh" }}>
            <div style={{ maxWidth:1100, margin:"0 auto" }}>
              {renderContent()}
            </div>
          </main>
        </>
      )}

      {/* Mobile layout */}
      {isMobile && (
        <>
          {/* Header mobile */}
          <div style={{ background:T.bgWhite, borderBottom:`1px solid ${T.border}`, padding:"12px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:700 }}>
            <div style={{ fontSize:18, fontWeight:800 }}>
              <span style={{ color:T.green }}>Lico</span><span style={{ color:T.gold }}>Sport</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ background:T.greenLight, color:T.greenText, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>{ROLES[role].icon} {ROLES[role].label}</span>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding:"16px 16px", paddingBottom:90 }}>
            {renderContent()}
          </div>

          <BottomNav role={role} tab={tab} onTab={setTab} onLogout={()=>setRole(null)} alertas={alertasCount} />
        </>
      )}

      {/* Modal producto */}
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
