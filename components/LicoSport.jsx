import { useState, useEffect, useCallback } from "react";

const API_URL = "https://licosport-backend-production.up.railway.app";

const T = {
  bgPage:"#F5F7F5",bgWhite:"#FFFFFF",bgSurface:"#F0F4F1",
  green:"#1A7A4A",greenMid:"#2EAA68",greenLight:"#E8F5EE",greenText:"#145C38",
  gold:"#B8860B",goldLight:"#FFF8E7",
  blue:"#1A5EA8",blueLight:"#EBF4FF",
  red:"#C0392B",redLight:"#FEF0EE",redText:"#8B1A10",
  text:"#1A2420",textMid:"#4A6358",textLight:"#8AA898",
  border:"#D8E6DE",borderMid:"#B8CEBC",
  sidebarBg:"#0F3D26",sidebarText:"#C8E6D0",sidebarAct:"#2EAA68",
};

const CATS = [
  {id:"Licores",icon:"🍾"},{id:"Cervezas",icon:"🍺"},{id:"Vinos",icon:"🍷"},
  {id:"Cigarros",icon:"🚬"},{id:"Chicles/Dulces",icon:"🍬"},{id:"Chupetes",icon:"🍭"},
  {id:"Bebidas",icon:"🥤"},{id:"Energizantes",icon:"⚡"},{id:"Snacks",icon:"🍿"},
  {id:"Hoja de Coca",icon:"🌿"},{id:"Higiene",icon:"🧴"},{id:"Varios",icon:"📦"},
];
const catIcon = (c) => CATS.find(x=>x.id===c)?.icon??"📦";

const PAGOS = [
  {id:"efectivo",label:"Efectivo",icon:"💵"},
  {id:"transferencia",label:"Transferencia",icon:"📲"},
  {id:"qr",label:"QR",icon:"🔲"},
  {id:"credito",label:"Crédito",icon:"📋"},
];

const DEMO = [
  {id:1,nombre:"Ron Millonario 1L",cat:"Licores",stock:8,min:5,pc:45,pv:75,u:"bot."},
  {id:2,nombre:"Cerveza Paceña 620ml",cat:"Cervezas",stock:48,min:24,pc:8,pv:15,u:"und."},
  {id:3,nombre:"Vino Casillero Diablo",cat:"Vinos",stock:3,min:6,pc:55,pv:90,u:"bot."},
  {id:4,nombre:"Cigarros Marlboro",cat:"Cigarros",stock:15,min:10,pc:18,pv:25,u:"atad."},
  {id:5,nombre:"Chicle Trident Menta",cat:"Chicles/Dulces",stock:25,min:20,pc:1.5,pv:3,u:"und."},
  {id:6,nombre:"Chupete Blow Pop",cat:"Chupetes",stock:30,min:15,pc:0.8,pv:2,u:"und."},
  {id:7,nombre:"Red Bull 250ml",cat:"Energizantes",stock:12,min:6,pc:12,pv:20,u:"und."},
  {id:8,nombre:"Monster Energy",cat:"Energizantes",stock:8,min:6,pc:14,pv:22,u:"und."},
  {id:9,nombre:"Papas Lays",cat:"Snacks",stock:20,min:10,pc:5,pv:8,u:"und."},
  {id:10,nombre:"Hoja de Coca 1/4",cat:"Hoja de Coca",stock:10,min:5,pc:15,pv:25,u:"paq."},
  {id:11,nombre:"Clinex",cat:"Higiene",stock:15,min:5,pc:3,pv:6,u:"und."},
  {id:12,nombre:"Alicán",cat:"Higiene",stock:10,min:5,pc:8,pv:14,u:"und."},
  {id:13,nombre:"Papel Higiénico",cat:"Higiene",stock:8,min:4,pc:5,pv:9,u:"rol."},
  {id:14,nombre:"Toallas Húmedas",cat:"Higiene",stock:6,min:3,pc:6,pv:10,u:"paq."},
  {id:15,nombre:"Toallas Femeninas",cat:"Higiene",stock:5,min:3,pc:8,pv:14,u:"paq."},
  {id:16,nombre:"Vasos Desechables",cat:"Varios",stock:20,min:5,pc:3,pv:6,u:"paq."},
  {id:17,nombre:"Hielo",cat:"Varios",stock:15,min:5,pc:5,pv:10,u:"bol."},
  {id:18,nombre:"Singani Casa Real 750ml",cat:"Licores",stock:6,min:4,pc:38,pv:60,u:"bot."},
  {id:19,nombre:"Coca Cola 2L",cat:"Bebidas",stock:12,min:10,pc:7,pv:12,u:"und."},
];

const bs      = (n) => `Bs ${Number(n||0).toFixed(2)}`;
const ganP    = (p) => (p.pv||0)-(p.pc||0);
const mrgP    = (p) => p.pc>0?(((p.pv-p.pc)/p.pc)*100).toFixed(0):0;
const stockSt = (p) => p.stock===0?"out":p.stock<=p.min?"low":"ok";
const stColor = (s) => ({out:T.red,low:T.gold,ok:T.greenMid})[s];
const stLabel = (s) => ({out:"AGOTADO",low:"BAJO",ok:"OK"})[s];

// ─── API ──────────────────────────────────────────────────────────
async function api(path, opts={}, ctx={}) {
  try {
    const token = ctx.token || (typeof window!=="undefined"?localStorage.getItem("ls_tok"):null);
    const res = await fetch(`${API_URL}${path}`,{
      ...opts,
      headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{}),...opts.headers},
      body:opts.body?JSON.stringify(opts.body):undefined,
    });
    if(!res.ok) return null;
    return res.json();
  } catch { return null; }
}

// ─── PRESENTACIONES API ───────────────────────────────────────────
async function getPresentaciones(productoId) {
  const token = typeof window!=="undefined"?localStorage.getItem("ls_tok"):null;
  if(!token) return [];
  try {
    const res = await fetch(`${API_URL}/presentaciones/producto/${productoId}`,{headers:{Authorization:`Bearer ${token}`}});
    if(!res.ok) return [];
    return res.json();
  } catch { return []; }
}
async function savePresentacion(data, id=null) {
  const token = typeof window!=="undefined"?localStorage.getItem("ls_tok"):null;
  if(!token) return null;
  try {
    const res = await fetch(`${API_URL}/presentaciones${id?`/${id}`:""}`,{
      method:id?"PUT":"POST",
      headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
      body:JSON.stringify(data),
    });
    if(!res.ok) return null;
    return res.json();
  } catch { return null; }
}
async function deletePresentacion(id) {
  const token = typeof window!=="undefined"?localStorage.getItem("ls_tok"):null;
  if(!token) return;
  await fetch(`${API_URL}/presentaciones/${id}`,{method:"DELETE",headers:{Authorization:`Bearer ${token}`}});
}

// ─── HOOK MOBILE ─────────────────────────────────────────────────
function useIsMobile() {
  const [mob,setMob]=useState(false);
  useEffect(()=>{
    const fn=()=>setMob(window.innerWidth<768);
    fn(); window.addEventListener("resize",fn);
    return ()=>window.removeEventListener("resize",fn);
  },[]);
  return mob;
}

// ─── LOGIN ────────────────────────────────────────────────────────
function Login({onLogin}) {
  const [step,setStep]=useState("role");
  const [vendedores,setVendedores]=useState([]);
  const [selVend,setSelVend]=useState(null);
  const [isAdmin,setIsAdmin]=useState(false);
  const [digits,setDigits]=useState([]);
  const [shake,setShake]=useState(false);
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  useEffect(()=>{api("/vendedores").then(d=>{if(d?.length)setVendedores(d);});},[]);

  const goPin=(admin,vend=null)=>{setIsAdmin(admin);setSelVend(vend);setStep("pin");setDigits([]);setErr("");};
  const press=(d)=>{
    if(digits.length>=4)return;
    const next=[...digits,d];setDigits(next);
    if(next.length===4)verify(next);
  };
  const del=()=>setDigits(d=>d.slice(0,-1));
  const verify=async(d)=>{
    setLoading(true);
    const pin=d.join("");
   if(isAdmin){
  const r=await api("/auth/pin",{method:"POST",body:{pin}});
  if(r?.access_token){
    window.localStorage.setItem("ls_tok",r.access_token);
    onLogin("admin",{nombre:"Administrador",color:T.green,icon:"👑"},r.access_token);
  } else fail();
} else {
  const r=await api("/vendedores/login",{method:"POST",body:{pin}});
  if(r?.id)onLogin("vendedor",{...r,icon:"🛒"});
  else fail();
}
    setLoading(false);
  };
  const fail=()=>{setShake(true);setErr("PIN incorrecto");setTimeout(()=>{setShake(false);setDigits([]);setErr("");},900);};
  const KEYS=["1","2","3","4","5","6","7","8","9","","0","⌫"];
  const roleColor=isAdmin?T.green:(selVend?.color||T.blue);

  return (
    <div style={{minHeight:"100vh",background:T.bgPage,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif",padding:20}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <img src="/logo.png" alt="LicoSport" style={{width:160,height:160,objectFit:"contain",display:"block",margin:"0 auto 10px",borderRadius:20}}/>
          <div style={{color:T.textMid,fontSize:13}}>Sistema de Gestión</div>
        </div>
        <div style={{background:T.bgWhite,borderRadius:20,padding:24,boxShadow:"0 2px 20px #00000010",border:`1px solid ${T.border}`}}>
          {step==="role"&&(
            <>
              <div style={{color:T.textMid,fontSize:13,textAlign:"center",marginBottom:16}}>¿Con qué perfil ingresas?</div>
              <button onClick={()=>goPin(true)} style={{width:"100%",padding:"14px 16px",marginBottom:10,background:T.bgSurface,border:`2px solid ${T.border}`,borderRadius:14,cursor:"pointer",display:"flex",alignItems:"center",gap:12,fontFamily:"inherit"}}>
                <div style={{width:42,height:42,borderRadius:12,background:T.green+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>👑</div>
                <div style={{textAlign:"left"}}><div style={{color:T.text,fontWeight:700,fontSize:15}}>Administrador</div><div style={{color:T.textMid,fontSize:12}}>Acceso completo</div></div>
                <span style={{marginLeft:"auto",color:T.textLight,fontSize:18}}>›</span>
              </button>
              {vendedores.length>0&&(
                <>{
                  <div style={{color:T.textMid,fontSize:12,textAlign:"center",margin:"12px 0 8px"}}>— Vendedores —</div>
                }{vendedores.map(v=>(
                  <button key={v.id} onClick={()=>goPin(false,v)} style={{width:"100%",padding:"12px 16px",marginBottom:8,background:T.bgSurface,border:`2px solid ${T.border}`,borderRadius:14,cursor:"pointer",display:"flex",alignItems:"center",gap:12,fontFamily:"inherit"}}>
                    <div style={{width:40,height:40,borderRadius:10,background:v.color+"22",color:v.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,flexShrink:0}}>
                      {v.nombre.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                    </div>
                    <div style={{textAlign:"left"}}><div style={{color:T.text,fontWeight:600,fontSize:14}}>{v.nombre}</div><div style={{color:T.textMid,fontSize:11}}>{v.turno||"Vendedor"}</div></div>
                    <span style={{marginLeft:"auto",color:T.textLight,fontSize:18}}>›</span>
                  </button>
                ))}</>
              )}
              {vendedores.length===0&&<div style={{color:T.textLight,fontSize:12,textAlign:"center",padding:"10px 0"}}>Cargando vendedores...</div>}
            </>
          )}
          {step==="pin"&&(
            <>
              <button onClick={()=>setStep("role")} style={{background:"none",border:"none",color:T.textMid,cursor:"pointer",fontSize:13,marginBottom:14,padding:0}}>‹ Volver</button>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,padding:"12px 14px",background:roleColor+"14",borderRadius:12}}>
                <span style={{fontSize:22}}>{isAdmin?"👑":"🛒"}</span>
                <div><div style={{color:roleColor,fontWeight:700,fontSize:14}}>{isAdmin?"Administrador":selVend?.nombre}</div><div style={{color:T.textMid,fontSize:12}}>Ingresa tu PIN de 4 dígitos</div></div>
              </div>
              <div style={{display:"flex",justifyContent:"center",gap:14,marginBottom:20,animation:shake?"shake .5s":"none"}}>
                {[0,1,2,3].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:i<digits.length?roleColor:"transparent",border:`2px solid ${i<digits.length?roleColor:T.borderMid}`,transition:"all .15s"}}/>)}
              </div>
              {err&&<div style={{color:T.red,fontSize:12,textAlign:"center",marginBottom:10}}>{err}</div>}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9}}>
                {KEYS.map((k,i)=>{
                  if(k==="")return<div key={i}/>;
                  const isDel=k==="⌫";
                  return(<button key={i} onClick={()=>isDel?del():press(k)} disabled={loading} style={{height:56,borderRadius:14,background:isDel?T.bgSurface:T.bgWhite,border:`1.5px solid ${T.border}`,color:isDel?T.red:T.text,fontSize:21,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{loading&&digits.length===4?"…":k}</button>);
                })}
              </div>
              <div style={{color:T.textLight,fontSize:11,textAlign:"center",marginTop:14}}>Admin PIN: 1234</div>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────
function Toast({msg,type,onDone}) {
  useEffect(()=>{const t=setTimeout(onDone,2800);return()=>clearTimeout(t);},[]);
  const bg={success:T.green,error:T.red,warning:T.gold}[type]??T.green;
  return(<div style={{position:"fixed",bottom:24,right:24,background:bg,color:"#fff",padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:14,zIndex:9999,boxShadow:"0 4px 16px #0003",animation:"sIn .25s ease"}}>{msg}<style>{`@keyframes sIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style></div>);
}

// ─── NAV ──────────────────────────────────────────────────────────
const NAV_ADMIN=[{id:"home",icon:"🏠",l:"Inicio"},{id:"inv",icon:"📦",l:"Inventario"},{id:"venta",icon:"🛒",l:"Nueva Venta"},{id:"creditos",icon:"📋",l:"Créditos"},{id:"report",icon:"📊",l:"Reportes"},{id:"usuarios",icon:"👥",l:"Vendedores"},{id:"config",icon:"⚙️",l:"Config"}];
const NAV_VEND=[{id:"home",icon:"🏠",l:"Inicio"},{id:"venta",icon:"🛒",l:"Vender"},{id:"historial",icon:"🧾",l:"Mis Ventas"}];

// ─── SIDEBAR ──────────────────────────────────────────────────────
function Sidebar({role,curUser,tab,onTab,onLogout,alertas,credPend}) {
  const nav=role==="admin"?NAV_ADMIN:NAV_VEND;
  return(
    <aside style={{width:220,minHeight:"100vh",background:T.sidebarBg,display:"flex",flexDirection:"column",position:"fixed",left:0,top:0,bottom:0,zIndex:100,fontFamily:"system-ui,sans-serif"}}>
      <div style={{padding:"16px 16px 10px",display:"flex",alignItems:"center",gap:10}}>
        <img src="/logo.png" alt="LS" style={{width:40,height:40,objectFit:"contain",borderRadius:10}}/>
        <div><div style={{fontSize:14,fontWeight:800,letterSpacing:-.3}}><span style={{color:T.sidebarAct}}>Lico</span><span style={{color:T.gold}}>Sport</span></div><div style={{color:T.sidebarText+"77",fontSize:9}}>Sistema de Gestión</div></div>
      </div>
      <div style={{margin:"0 10px 14px",background:"#FFFFFF18",borderRadius:12,padding:"10px 12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:34,height:34,borderRadius:9,background:(curUser?.color||T.green)+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{curUser?.icon||"👤"}</div>
          <div><div style={{color:"#fff",fontWeight:700,fontSize:12}}>{curUser?.nombre}</div><div style={{color:T.sidebarText+"88",fontSize:10}}>{role==="admin"?"Administrador":"Vendedor"}</div></div>
        </div>
      </div>
      <nav style={{flex:1,padding:"0 8px"}}>
        {nav.map(({id,icon,l})=>{
          const active=tab===id;
          return(<button key={id} onClick={()=>onTab(id)} style={{width:"100%",padding:"9px 12px",marginBottom:3,background:active?T.sidebarAct+"33":"transparent",border:"none",borderRadius:8,display:"flex",alignItems:"center",gap:9,color:active?"#fff":T.sidebarText,fontWeight:active?700:400,fontSize:13,cursor:"pointer",textAlign:"left",fontFamily:"inherit",position:"relative"}}>
            {active&&<div style={{position:"absolute",left:0,top:"20%",bottom:"20%",width:3,background:T.sidebarAct,borderRadius:2}}/>}
            <span style={{fontSize:16}}>{icon}</span>{l}
            {id==="inv"&&alertas>0&&<span style={{marginLeft:"auto",background:T.red,color:"#fff",fontSize:9,fontWeight:700,borderRadius:8,padding:"1px 6px"}}>{alertas}</span>}
            {id==="creditos"&&credPend>0&&<span style={{marginLeft:"auto",background:T.gold,color:"#fff",fontSize:9,fontWeight:700,borderRadius:8,padding:"1px 6px"}}>{credPend}</span>}
          </button>);
        })}
      </nav>
      <button onClick={onLogout} style={{margin:"10px 8px 16px",padding:"9px 12px",background:"#FFFFFF12",border:"1px solid #FFFFFF20",borderRadius:8,color:T.sidebarText,cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontSize:12,fontFamily:"inherit"}}>🔒 Cerrar sesión</button>
    </aside>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────
function BottomNav({role,tab,onTab,alertas,credPend}) {
  const nav=role==="admin"?[{id:"home",icon:"🏠",l:"Inicio"},{id:"inv",icon:"📦",l:"Stock"},{id:"venta",icon:"🛒",l:"Vender"},{id:"creditos",icon:"📋",l:"Créditos"},{id:"report",icon:"📊",l:"Reportes"}]:NAV_VEND;
  return(
    <nav style={{position:"fixed",bottom:0,left:0,right:0,background:T.bgWhite,borderTop:`1px solid ${T.border}`,display:"flex",zIndex:800,paddingBottom:"env(safe-area-inset-bottom,0px)",boxShadow:"0 -2px 12px #00000010"}}>
      {nav.map(({id,icon,l})=>{
        const isSell=id==="venta",active=tab===id;
        return(<button key={id} onClick={()=>onTab(id)} style={{flex:1,border:"none",background:"transparent",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:isSell?0:"8px 0 6px",cursor:"pointer",position:"relative",fontFamily:"inherit"}}>
          {isSell?(<div style={{width:50,height:50,borderRadius:"50%",background:T.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:21,marginTop:-14,border:`3px solid ${T.bgPage}`,boxShadow:`0 2px 12px ${T.green}55`}}>{icon}</div>):(
            <><span style={{fontSize:19,lineHeight:1,position:"relative"}}>{icon}
              {id==="inv"&&alertas>0&&<span style={{position:"absolute",top:-4,right:-6,background:T.red,color:"#fff",fontSize:8,fontWeight:700,borderRadius:8,padding:"1px 4px"}}>{alertas}</span>}
              {id==="creditos"&&credPend>0&&<span style={{position:"absolute",top:-4,right:-6,background:T.gold,color:"#fff",fontSize:8,fontWeight:700,borderRadius:8,padding:"1px 4px"}}>{credPend}</span>}
            </span>
            <span style={{fontSize:10,color:active?T.green:T.textLight,marginTop:3,fontWeight:active?700:400}}>{l}</span>
            {active&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:22,height:3,borderRadius:2,background:T.green}}/>}
            </>
          )}
        </button>);
      })}
    </nav>
  );
}

// ─── UI BASE ──────────────────────────────────────────────────────
function Card({children,style={}}) {
  return<div style={{background:T.bgWhite,borderRadius:16,border:`1px solid ${T.border}`,padding:"15px 17px",...style}}>{children}</div>;
}
function Sheet({title,onClose,children}) {
  return(
    <div style={{position:"fixed",inset:0,background:"#0005",zIndex:1000,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:T.bgWhite,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:640,margin:"0 auto",maxHeight:"92vh",overflowY:"auto",border:`1px solid ${T.border}`,borderBottom:"none",animation:"shUp .2s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"15px 18px 8px"}}>
          <span style={{color:T.text,fontWeight:700,fontSize:16}}>{title}</span>
          <button onClick={onClose} style={{background:T.bgSurface,border:"none",color:T.textMid,fontSize:18,width:30,height:30,borderRadius:"50%",cursor:"pointer"}}>×</button>
        </div>
        <div style={{padding:"0 18px 100px"}}>{children}</div>
      </div>
    </div>
  );
}
function Dialog({title,onClose,children}) {
  return(
    <div style={{position:"fixed",inset:0,background:"#0005",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:T.bgWhite,borderRadius:20,padding:24,width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto",border:`1px solid ${T.border}`,boxShadow:"0 8px 40px #0002",animation:"shUp .2s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <span style={{color:T.text,fontWeight:700,fontSize:17}}>{title}</span>
          <button onClick={onClose} style={{background:T.bgSurface,border:"none",color:T.textMid,fontSize:18,width:30,height:30,borderRadius:"50%",cursor:"pointer"}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Fld({label,value,onChange,type="text",readOnly=false}) {
  return(
    <div style={{marginBottom:13}}>
      <label style={{color:T.textMid,fontSize:11,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:.7}}>{label}</label>
      <input type={type} value={value} onChange={onChange} readOnly={readOnly} inputMode={type==="number"?"decimal":"text"}
        style={{width:"100%",padding:"10px 13px",background:readOnly?T.bgSurface:T.bgWhite,border:`1.5px solid ${T.border}`,borderRadius:10,color:readOnly?T.textMid:T.text,fontSize:14,boxSizing:"border-box",fontFamily:"inherit"}}
      />
    </div>
  );
}

// ─── MODAL PRESENTACIONES ─────────────────────────────────────────
function ModalPresentaciones({producto,onClose}) {
  const [lista,setLista]=useState([]);
  const [form,setForm]=useState({nombre:"Unidad",equivaleUnidades:1,precioCompra:0,precioVenta:0,codigoBarras:""});
  const [editId,setEditId]=useState(null);
  const [loading,setLoading]=useState(false);

  useEffect(()=>{getPresentaciones(producto.id).then(setLista);},[producto.id]);

  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const resetForm=()=>{setForm({nombre:"Unidad",equivaleUnidades:1,precioCompra:0,precioVenta:0,codigoBarras:""});setEditId(null);};

  const guardar=async()=>{
    if(!form.nombre.trim())return;
    setLoading(true);
    const data={...form,productoId:producto.id,equivaleUnidades:parseFloat(form.equivaleUnidades)||1,precioCompra:parseFloat(form.precioCompra)||0,precioVenta:parseFloat(form.precioVenta)||0};
    const r=await savePresentacion(data,editId);
    if(r){if(editId)setLista(l=>l.map(p=>p.id===editId?r:p));else setLista(l=>[...l,r]);resetForm();}
    setLoading(false);
  };

  const editar=(p)=>{setForm({nombre:p.nombre,equivaleUnidades:p.equivaleUnidades,precioCompra:p.precioCompra,precioVenta:p.precioVenta,codigoBarras:p.codigoBarras||""});setEditId(p.id);};
  const eliminar=async(id)=>{await deletePresentacion(id);setLista(l=>l.filter(p=>p.id!==id));};

  const ganPres=(p)=>p.precioVenta-p.precioCompra;
  const mrgPres=(p)=>p.precioCompra>0?(((p.precioVenta-p.precioCompra)/p.precioCompra)*100).toFixed(0):0;

  return(
    <Dialog title={`📦 Presentaciones — ${producto.nombre}`} onClose={onClose}>
      {lista.length>0&&(
        <div style={{marginBottom:16}}>
          {lista.map(p=>(
            <div key={p.id} style={{background:T.bgSurface,borderRadius:10,padding:"10px 13px",marginBottom:8,border:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{color:T.text,fontWeight:700,fontSize:13}}>{p.nombre} <span style={{color:T.textMid,fontSize:11}}>× {p.equivaleUnidades} ud.</span></div>
                <div style={{color:T.textMid,fontSize:11,marginTop:2}}>
                  Compra: <span style={{fontFamily:"monospace"}}>{bs(p.precioCompra)}</span> · Venta: <span style={{fontFamily:"monospace",color:T.green}}>{bs(p.precioVenta)}</span> · Gan: <span style={{fontFamily:"monospace",color:T.gold}}>+{bs(ganPres(p))} ({mrgPres(p)}%)</span>
                </div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>editar(p)} style={{background:T.bgSurface,border:`1px solid ${T.border}`,borderRadius:8,padding:"4px 9px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>✏️</button>
                <button onClick={()=>eliminar(p.id)} style={{background:T.redLight,border:`1px solid ${T.red}44`,color:T.red,borderRadius:8,padding:"4px 9px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{background:T.greenLight,borderRadius:12,padding:"14px 16px",border:`1px solid ${T.border}`}}>
        <div style={{color:T.greenText,fontWeight:700,fontSize:13,marginBottom:12}}>{editId?"✏️ Editar presentación":"➕ Nueva presentación"}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Fld label="Nombre (Unidad, Caja x12...)" value={form.nombre} onChange={e=>set("nombre",e.target.value)}/>
          <Fld label="Equivale a (unidades)" type="number" value={form.equivaleUnidades} onChange={e=>set("equivaleUnidades",e.target.value)}/>
          <Fld label="Precio compra Bs" type="number" value={form.precioCompra} onChange={e=>set("precioCompra",e.target.value)}/>
          <Fld label="Precio venta Bs" type="number" value={form.precioVenta} onChange={e=>set("precioVenta",e.target.value)}/>
        </div>
        <Fld label="Código de barras (opcional)" value={form.codigoBarras} onChange={e=>set("codigoBarras",e.target.value)}/>
        <div style={{display:"flex",gap:9,marginTop:4}}>
          {editId&&<button onClick={resetForm} style={{padding:"10px 14px",background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>Cancelar</button>}
          <button onClick={guardar} disabled={loading} style={{flex:1,padding:"10px 14px",background:T.green,color:"#fff",border:"none",borderRadius:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>
            {loading?"Guardando...":editId?"Guardar cambios":"Agregar presentación"}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

// ─── MODAL PRODUCTO ───────────────────────────────────────────────
function ModalProd({prod,isMob,onClose,onSave}) {
  const [f,setF]=useState(prod??{nombre:"",cat:"Licores",stock:0,min:5,pc:0,pv:0,u:"und."});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const gP=f.pv-f.pc, mP=f.pc>0?(((f.pv-f.pc)/f.pc)*100).toFixed(0):0;
  const Wrap=isMob?Sheet:Dialog;
  return(
    <Wrap title={prod?"✏️ Editar":"➕ Nuevo Producto"} onClose={onClose}>
      <Fld label="Nombre" value={f.nombre} onChange={e=>set("nombre",e.target.value)}/>
      <div style={{marginBottom:13}}>
        <label style={{color:T.textMid,fontSize:11,display:"block",marginBottom:7,textTransform:"uppercase",letterSpacing:.7}}>Categoría</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
          {CATS.map(({id,icon})=>(<button key={id} onClick={()=>set("cat",id)} style={{padding:"5px 11px",borderRadius:18,border:`1.5px solid ${f.cat===id?T.green:T.border}`,background:f.cat===id?T.greenLight:T.bgWhite,color:f.cat===id?T.greenText:T.textMid,fontSize:12,cursor:"pointer",fontWeight:f.cat===id?700:400,fontFamily:"inherit"}}>{icon} {id}</button>))}
        </div>
      </div>
      <Fld label="Unidad base (und./bot./caja)" value={f.u} onChange={e=>set("u",e.target.value)}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Fld label="Stock actual" type="number" value={f.stock} onChange={e=>set("stock",parseFloat(e.target.value)||0)}/>
        <Fld label="Stock mínimo" type="number" value={f.min} onChange={e=>set("min",parseFloat(e.target.value)||0)}/>
        <Fld label="Precio compra Bs" type="number" value={f.pc} onChange={e=>set("pc",parseFloat(e.target.value)||0)}/>
        <Fld label="Precio venta Bs" type="number" value={f.pv} onChange={e=>set("pv",parseFloat(e.target.value)||0)}/>
      </div>
      {f.pc>0&&f.pv>0&&(
        <div style={{background:gP>=0?T.greenLight:T.redLight,borderRadius:10,padding:"11px 14px",marginBottom:14,border:`1px solid ${gP>=0?T.border:T.red+"44"}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{color:T.textMid,fontSize:12}}>Ganancia/unidad</span><span style={{color:gP>=0?T.greenText:T.red,fontWeight:700,fontFamily:"monospace"}}>{bs(gP)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:T.textMid,fontSize:12}}>Margen</span><span style={{color:T.gold,fontWeight:700}}>{mP}%</span></div>
        </div>
      )}
      <button onClick={()=>f.nombre.trim()&&onSave(f)} style={{width:"100%",padding:13,background:f.nombre.trim()?T.green:T.borderMid,color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:15,cursor:f.nombre.trim()?"pointer":"not-allowed",fontFamily:"inherit"}}>
        {prod?"Guardar cambios":"Agregar producto"}
      </button>
    </Wrap>
  );
}

// ─── MODAL VENDEDOR ───────────────────────────────────────────────
const COLORS_V=["#1A7A4A","#1A5EA8","#8B1A8B","#C0392B","#B8860B","#1A6A8A","#2C7A2C","#8B4A1A"];
function ModalVendedor({vend,onClose,onSave}) {
  const [f,setF]=useState(vend??{nombre:"",pin:"",color:COLORS_V[0],turno:""});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const initials=(n)=>n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  return(
    <Dialog title={vend?"✏️ Editar Vendedor":"➕ Nuevo Vendedor"} onClose={onClose}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
        <div style={{width:56,height:56,borderRadius:16,background:f.color+"22",color:f.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800}}>{f.nombre?initials(f.nombre):"?"}</div>
      </div>
      <Fld label="Nombre del vendedor" value={f.nombre} onChange={e=>set("nombre",e.target.value)}/>
      <div style={{marginBottom:13}}>
        <label style={{color:T.textMid,fontSize:11,display:"block",marginBottom:7,textTransform:"uppercase",letterSpacing:.7}}>Color</label>
        <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>{COLORS_V.map(c=>(<button key={c} onClick={()=>set("color",c)} style={{width:30,height:30,borderRadius:"50%",background:c,border:f.color===c?"3px solid #000":"2px solid transparent",cursor:"pointer"}}/>))}</div>
      </div>
      <Fld label="PIN de acceso (4 dígitos)" type="number" value={f.pin} onChange={e=>set("pin",e.target.value.slice(0,4))}/>
      <Fld label="Turno / nota (opcional)" value={f.turno} onChange={e=>set("turno",e.target.value)}/>
      <div style={{display:"flex",gap:9}}>
        <button onClick={onClose} style={{flex:1,padding:12,background:T.bgSurface,border:`1px solid ${T.border}`,borderRadius:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>
        <button onClick={()=>{ if(f.nombre.trim()&&f.pin.length===4) onSave(f); }} style={{flex:2,padding:12,background:f.nombre.trim()&&f.pin.length===4?T.green:T.borderMid,color:"#fff",border:"none",borderRadius:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
          {vend?"Guardar cambios":"Crear vendedor"}
        </button>
      </div>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════
// VISTAS
// ═══════════════════════════════════════════════════════════════════

// HOME
function Home({role,curUser,productos,ventas,creditos,onAction}) {
  const alertas=productos.filter(p=>p.stock<=p.min);
  const totalV=ventas.reduce((s,v)=>s+v.total,0);
  const totalG=ventas.reduce((s,v)=>s+v.gan,0);
  const totalI=productos.reduce((s,p)=>s+p.pc*p.stock,0);
  const pendCr=creditos.filter(c=>!c.pagado).reduce((s,c)=>s+c.monto,0);
  const isAdmin=role==="admin";
  return(
    <div>
      <div style={{marginBottom:18}}>
        <div style={{color:T.textMid,fontSize:12}}>Bienvenido,</div>
        <div style={{fontSize:22,fontWeight:800,letterSpacing:-.5,color:T.text}}>{curUser?.icon} {curUser?.nombre}</div>
        <div style={{color:T.textMid,fontSize:12,marginTop:2}}>{new Date().toLocaleDateString("es-BO",{weekday:"long",day:"2-digit",month:"long"})}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:16}}>
        <Card style={{background:T.greenLight}}><div style={{color:T.textMid,fontSize:10,marginBottom:3}}>Ventas hoy</div><div style={{color:T.green,fontWeight:800,fontSize:18,fontFamily:"monospace"}}>{bs(totalV)}</div></Card>
        {isAdmin&&<Card style={{background:T.goldLight}}><div style={{color:T.textMid,fontSize:10,marginBottom:3}}>Ganancia hoy</div><div style={{color:T.gold,fontWeight:800,fontSize:18,fontFamily:"monospace"}}>{bs(totalG)}</div></Card>}
        {isAdmin&&<Card style={{background:T.bgSurface}}><div style={{color:T.textMid,fontSize:10,marginBottom:3}}>Valor stock</div><div style={{color:T.text,fontWeight:800,fontSize:18,fontFamily:"monospace"}}>Bs {Math.round(totalI)}</div></Card>}
        {isAdmin&&pendCr>0&&<Card style={{background:T.blueLight}}><div style={{color:T.textMid,fontSize:10,marginBottom:3}}>Créditos pend.</div><div style={{color:T.blue,fontWeight:800,fontSize:18,fontFamily:"monospace"}}>{bs(pendCr)}</div></Card>}
      </div>
      {isAdmin&&alertas.length>0&&(
        <div onClick={()=>onAction("inv")} style={{background:T.redLight,border:`1.5px solid ${T.red}44`,borderRadius:14,padding:"12px 16px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
          <div><div style={{color:T.red,fontWeight:700,fontSize:13}}>⚠️ {alertas.length} producto(s) con stock bajo</div><div style={{color:T.redText,fontSize:11,marginTop:2}}>{alertas.slice(0,2).map(p=>p.nombre).join(", ")}{alertas.length>2?` y ${alertas.length-2} más`:""}</div></div>
          <span style={{color:T.red}}>›</span>
        </div>
      )}
      <div style={{color:T.textLight,fontSize:10,marginBottom:9,textTransform:"uppercase",letterSpacing:1}}>Acceso rápido</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:9,marginBottom:18}}>
        <button onClick={()=>onAction("venta")} style={{padding:"13px 10px",background:T.green,border:"none",borderRadius:13,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:7,fontFamily:"inherit"}}><span>🛒</span>Nueva venta</button>
        {isAdmin&&<>
          <button onClick={()=>onAction("nuevo")} style={{padding:"13px 10px",background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:13,color:T.text,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:7,fontFamily:"inherit"}}><span>➕</span>Stock</button>
          <button onClick={()=>onAction("inv")} style={{padding:"13px 10px",background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:13,color:T.text,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:7,fontFamily:"inherit"}}><span>📦</span>Inventario</button>
          <button onClick={()=>onAction("creditos")} style={{padding:"13px 10px",background:T.blueLight,border:`1px solid ${T.blue}44`,borderRadius:13,color:T.blue,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:7,fontFamily:"inherit"}}><span>📋</span>Créditos</button>
        </>}
      </div>
      {ventas.length>0&&(
        <>
          <div style={{color:T.textLight,fontSize:10,marginBottom:9,textTransform:"uppercase",letterSpacing:1}}>Últimas ventas</div>
          {[...ventas].reverse().slice(0,4).map(v=>(
            <Card key={v.id} style={{marginBottom:8,padding:"11px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{color:T.text,fontSize:12}}>{v.items.map(i=>`${i.nombre}${i.presentacion?` (${i.presentacion})`:""} ×${i.qty}`).join(", ").slice(0,48)}</div>
                  <div style={{color:T.textMid,fontSize:10,marginTop:2}}>{v.hora} · {v.vendedor}{v.metodoPago&&<span style={{marginLeft:7,background:v.metodoPago==="credito"?T.blueLight:T.greenLight,color:v.metodoPago==="credito"?T.blue:T.green,fontSize:9,fontWeight:700,padding:"1px 7px",borderRadius:8}}>{PAGOS.find(m=>m.id===v.metodoPago)?.label}</span>}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{color:v.metodoPago==="credito"?T.blue:T.green,fontWeight:700,fontFamily:"monospace"}}>{bs(v.total)}</div>
                  {isAdmin&&v.gan>0&&<div style={{color:T.gold,fontSize:10,fontFamily:"monospace"}}>+{bs(v.gan)}</div>}
                </div>
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}

// INVENTARIO con botón de presentaciones
function Inventario({productos,onEditar,onEliminar,onNuevo,onPresentaciones}) {
  const [busq,setBusq]=useState("");
  const [cat,setCat]=useState("Todas");
  const lista=productos.filter(p=>p.nombre.toLowerCase().includes(busq.toLowerCase())&&(cat==="Todas"||p.cat===cat));
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{color:T.text,fontWeight:800,fontSize:19}}>📦 Inventario</div>
        <button onClick={onNuevo} style={{background:T.green,border:"none",color:"#fff",fontWeight:700,fontSize:12,padding:"7px 16px",borderRadius:18,cursor:"pointer",fontFamily:"inherit"}}>+ Nuevo</button>
      </div>
      <div style={{display:"flex",gap:9,marginBottom:12,flexWrap:"wrap"}}>
        <input placeholder="🔍 Buscar..." value={busq} onChange={e=>setBusq(e.target.value)} style={{flex:1,minWidth:160,padding:"9px 13px",background:T.bgWhite,border:`1.5px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:13,fontFamily:"inherit"}}/>
        <select value={cat} onChange={e=>setCat(e.target.value)} style={{padding:"9px 13px",background:T.bgWhite,border:`1.5px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:13,fontFamily:"inherit"}}>
          <option>Todas</option>{CATS.map(c=><option key={c.id}>{c.id}</option>)}
        </select>
      </div>
      <div style={{display:"flex",gap:7,marginBottom:13,flexWrap:"wrap"}}>
        {[{l:`${productos.length} total`,c:T.text,bg:T.bgSurface},{l:`${productos.filter(p=>p.stock<=p.min&&p.stock>0).length} bajo`,c:T.gold,bg:T.goldLight},{l:`${productos.filter(p=>p.stock===0).length} agotado`,c:T.red,bg:T.redLight}].map(({l,c,bg})=>(
          <span key={l} style={{background:bg,color:c,fontSize:11,fontWeight:600,padding:"3px 11px",borderRadius:18,border:`1px solid ${T.border}`}}>{l}</span>
        ))}
      </div>
      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr style={{background:T.bgSurface,borderBottom:`2px solid ${T.border}`}}>
              {["Producto","Cat.","Stock","Compra","Venta","Ganancia","%","Estado",""].map(h=>(
                <th key={h} style={{padding:"10px 12px",color:T.textMid,textAlign:"left",fontWeight:600,fontSize:11,whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {lista.map((p,i)=>{
                const st=stockSt(p),sc=stColor(st),pct=Math.min((p.stock/Math.max(p.min,1))*100,100);
                return(
                  <tr key={p.id} style={{borderBottom:`1px solid ${T.border}`,background:i%2===0?T.bgWhite:T.bgSurface}}>
                    <td style={{padding:"10px 12px",fontWeight:600,color:T.text}}>{catIcon(p.cat)} {p.nombre}</td>
                    <td style={{padding:"10px 12px",color:T.textMid}}>{p.cat}</td>
                    <td style={{padding:"10px 12px"}}>
                      <div style={{color:sc,fontWeight:700,fontFamily:"monospace"}}>{p.stock} {p.u}</div>
                      <div style={{background:T.border,borderRadius:2,height:3,marginTop:3,width:50}}><div style={{background:sc,width:`${pct}%`,height:"100%",borderRadius:2}}/></div>
                    </td>
                    <td style={{padding:"10px 12px",color:T.textMid,fontFamily:"monospace"}}>{bs(p.pc)}</td>
                    <td style={{padding:"10px 12px",fontFamily:"monospace",fontWeight:600}}>{bs(p.pv)}</td>
                    <td style={{padding:"10px 12px",color:T.greenText,fontFamily:"monospace",fontWeight:700}}>+{bs(ganP(p))}</td>
                    <td style={{padding:"10px 12px"}}><span style={{color:parseFloat(mrgP(p))>=30?T.green:T.gold,fontWeight:700}}>{mrgP(p)}%</span></td>
                    <td style={{padding:"10px 12px"}}><span style={{background:`${sc}18`,color:sc,fontSize:10,fontWeight:700,padding:"2px 9px",borderRadius:9}}>{stLabel(st)}</span></td>
                    <td style={{padding:"10px 12px"}}>
                      <div style={{display:"flex",gap:5}}>
                        <button onClick={()=>onPresentaciones(p)} style={{background:T.blueLight,border:`1px solid ${T.blue}44`,color:T.blue,borderRadius:7,padding:"4px 9px",cursor:"pointer",fontSize:10,fontFamily:"inherit",whiteSpace:"nowrap"}}>📦 Present.</button>
                        <button onClick={()=>onEditar(p)} style={{background:T.bgSurface,border:`1px solid ${T.border}`,color:T.text,borderRadius:7,padding:"4px 9px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>✏️</button>
                        <button onClick={()=>onEliminar(p.id)} style={{background:T.redLight,border:`1px solid ${T.red}44`,color:T.red,borderRadius:7,padding:"4px 9px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {lista.length===0&&<div style={{textAlign:"center",padding:28,color:T.textLight}}>Sin productos</div>}
        </div>
      </Card>
    </div>
  );
}

// VENTA con presentaciones
function Venta({role,curUser,productos,onConfirmar}) {
  const [busq,setBusq]=useState("");
  const [selProd,setSelProd]=useState(null);
  const [presentaciones,setPresentaciones]=useState([]);
  const [carrito,setCarrito]=useState([]);
  const [metodo,setMetodo]=useState("efectivo");
  const [cliente,setCliente]=useState("");
  const isAdmin=role==="admin";

  const disp=productos.filter(p=>p.stock>0&&p.nombre.toLowerCase().includes(busq.toLowerCase()));
  const total=carrito.reduce((s,i)=>s+i.pvPres*i.qty,0);
  const ganT=carrito.reduce((s,i)=>s+(i.pvPres-i.pcPres)*i.qty,0);
  const esCred=metodo==="credito";

  const selectProd=async(p)=>{
    setSelProd(p);
    setBusq(p.nombre);
    const defecto=[{id:"default",nombre:"Unidad",equivaleUnidades:1,precioCompra:p.pc||0,precioVenta:p.pv||0}];
    setPresentaciones(defecto);
    const pres=await getPresentaciones(p.id);
    if(pres&&pres.length>0) setPresentaciones(pres);
  };

  const addToCart=(prod,pres)=>{
    const key=`${prod.id}_${pres.id}`;
    const unidsNuevas=pres.equivaleUnidades||1;
    const unidsEnCarrito=carrito.filter(i=>i.prodId===prod.id).reduce((s,i)=>s+i.qty*(i.equivUnids||1),0);
    if(unidsEnCarrito+unidsNuevas>prod.stock) return;
    setCarrito(c=>{
      const ex=c.find(i=>i.key===key);
      if(ex) return c.map(i=>i.key===key?{...i,qty:i.qty+1}:i);
      return[...c,{
        key,prodId:prod.id,nombre:prod.nombre,cat:prod.cat,
        presentacion:pres.nombre,equivUnids:pres.equivaleUnidades||1,
        pcPres:pres.precioCompra||0,pvPres:pres.precioVenta||0,
        stock:prod.stock,qty:1
      }];
    });
    setSelProd(null);setPresentaciones([]);setBusq("");
  };

  const less=(key)=>setCarrito(c=>{
    const ex=c.find(i=>i.key===key);
    if(!ex||ex.qty<=1) return c.filter(i=>i.key!==key);
    return c.map(i=>i.key===key?{...i,qty:i.qty-1}:i);
  });
  const rem=(key)=>setCarrito(c=>c.filter(i=>i.key!==key));

  const confirmar=()=>{
    if(esCred&&!cliente.trim()){alert("Ingresa el nombre del cliente");return;}
    onConfirmar(carrito,metodo,cliente);
    setCarrito([]);setBusq("");setCliente("");setMetodo("efectivo");
    setSelProd(null);setPresentaciones([]);
  };

  return(
    <div>
      <div style={{color:T.text,fontWeight:800,fontSize:19,marginBottom:16}}>🛒 Nueva Venta</div>
      <div style={{display:"grid",gridTemplateColumns:carrito.length>0?"1fr 1fr":"1fr",gap:16}}>
        <div>
          {!selProd&&(
            <>
              <input placeholder="🔍 Buscar producto..." value={busq} onChange={e=>{setBusq(e.target.value);}}
                style={{width:"100%",padding:"10px 13px",background:T.bgWhite,border:`1.5px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:13,boxSizing:"border-box",marginBottom:9,fontFamily:"inherit"}}
              />
              <div style={{maxHeight:380,overflowY:"auto"}}>
                {busq&&disp.map(p=>(
                  <Card key={p.id} style={{marginBottom:7,padding:"11px 13px",cursor:"pointer"}} onClick={()=>selectProd(p)}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div><div style={{color:T.text,fontWeight:600,fontSize:13}}>{catIcon(p.cat)} {p.nombre}</div><div style={{color:T.textMid,fontSize:11}}>Stock: {p.stock} {p.u}</div></div>
                      <div style={{textAlign:"right"}}><div style={{color:T.green,fontWeight:800,fontFamily:"monospace"}}>{bs(p.pv)}</div><div style={{color:T.textMid,fontSize:10}}>Toca para elegir presentación</div></div>
                    </div>
                  </Card>
                ))}
                {busq&&disp.length===0&&<div style={{color:T.textLight,textAlign:"center",padding:18}}>Sin resultados</div>}
                {!busq&&<div style={{textAlign:"center",paddingTop:36,color:T.textLight}}><div style={{fontSize:36,marginBottom:9}}>🛒</div><div>Escribe para buscar un producto</div></div>}
              </div>
            </>
          )}

          {selProd&&(
            <div>
              <button onClick={()=>{setSelProd(null);setPresentaciones([]);setBusq("");}} style={{background:"none",border:"none",color:T.textMid,cursor:"pointer",fontSize:13,marginBottom:12,padding:0}}>‹ Cambiar producto</button>
              <Card style={{marginBottom:12,background:T.greenLight}}>
                <div style={{color:T.greenText,fontWeight:700,fontSize:14}}>{catIcon(selProd.cat)} {selProd.nombre}</div>
                <div style={{color:T.textMid,fontSize:11,marginTop:2}}>Stock: {selProd.stock} {selProd.u}</div>
              </Card>
              <div style={{color:T.textMid,fontSize:12,fontWeight:600,marginBottom:9}}>Elige la presentación:</div>
              {presentaciones.map(pres=>(
                <Card key={pres.id} style={{marginBottom:9,cursor:"pointer"}} onClick={()=>addToCart(selProd,pres)}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{color:T.text,fontWeight:700,fontSize:14}}>{pres.nombre}</div>
                      <div style={{color:T.textMid,fontSize:11,marginTop:2}}>× {pres.equivaleUnidades||1} unidad{(pres.equivaleUnidades||1)>1?"es":""}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{color:T.green,fontWeight:900,fontFamily:"monospace",fontSize:16}}>{bs(pres.precioVenta)}</div>
                      <div style={{color:T.gold,fontSize:10}}>+{bs((pres.precioVenta||0)-(pres.precioCompra||0))} gan.</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {carrito.length>0&&(
          <div>
            <div style={{color:T.textMid,fontSize:11,textTransform:"uppercase",letterSpacing:1,marginBottom:9}}>Carrito ({carrito.length})</div>
            <div style={{maxHeight:220,overflowY:"auto",marginBottom:11}}>
              {carrito.map(i=>(
                <Card key={i.key} style={{marginBottom:7,padding:"9px 11px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <div style={{flex:1}}>
                      <div style={{color:T.text,fontSize:12,fontWeight:600}}>{i.nombre}</div>
                      <div style={{color:T.textMid,fontSize:10}}>{i.presentacion}</div>
                      <div style={{color:T.green,fontFamily:"monospace",fontSize:11}}>{bs(i.pvPres)} × {i.qty} = {bs(i.pvPres*i.qty)}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <button onClick={()=>less(i.key)} style={{width:26,height:26,borderRadius:"50%",background:T.bgSurface,border:`1px solid ${T.border}`,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                      <span style={{fontWeight:700,minWidth:16,textAlign:"center",fontSize:12}}>{i.qty}</span>
                      <button onClick={()=>setCarrito(c=>{const ex=c.find(x=>x.key===i.key);if(!ex)return c;const unidsTotal=c.filter(x=>x.prodId===ex.prodId).reduce((s,x)=>s+x.qty*(x.equivUnids||1),0);if(unidsTotal+(ex.equivUnids||1)>ex.stock)return c;return c.map(x=>x.key===i.key?{...x,qty:x.qty+1}:x);})} style={{width:26,height:26,borderRadius:"50%",background:T.bgSurface,border:`1px solid ${T.border}`,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.green}}>+</button>
                      <button onClick={()=>rem(i.key)} style={{width:26,height:26,borderRadius:"50%",background:T.redLight,border:"none",color:T.red,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div style={{marginBottom:11}}>
              <div style={{color:T.textMid,fontSize:11,textTransform:"uppercase",letterSpacing:1,marginBottom:7}}>Método de pago</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                {PAGOS.map(m=>(
                  <button key={m.id} onClick={()=>setMetodo(m.id)} style={{padding:"8px 9px",borderRadius:10,border:`1.5px solid ${metodo===m.id?(m.id==="credito"?T.blue:T.green):T.border}`,background:metodo===m.id?(m.id==="credito"?T.blueLight:T.greenLight):T.bgWhite,color:metodo===m.id?(m.id==="credito"?T.blue:T.greenText):T.textMid,fontWeight:metodo===m.id?700:400,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>{m.icon} {m.label}</button>
                ))}
              </div>
            </div>
            {esCred&&(
              <input placeholder="👤 Nombre del cliente (requerido)" value={cliente} onChange={e=>setCliente(e.target.value)}
                style={{width:"100%",padding:"10px 13px",background:T.blueLight,border:`1.5px solid ${T.blue}44`,borderRadius:10,color:T.text,fontSize:13,boxSizing:"border-box",marginBottom:11,fontFamily:"inherit"}}
              />
            )}
            <Card style={{background:esCred?T.blueLight:T.greenLight,marginBottom:12}}>
              {isAdmin&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{color:T.textMid,fontSize:12}}>Ganancia estimada</span><span style={{color:T.gold,fontWeight:700,fontFamily:"monospace"}}>{bs(ganT)}</span></div>}
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{color:T.text,fontWeight:700,fontSize:16}}>TOTAL</span>
                <span style={{color:esCred?T.blue:T.green,fontWeight:900,fontFamily:"monospace",fontSize:20}}>{bs(total)}</span>
              </div>
              {esCred&&<div style={{color:T.blue,fontSize:11,marginTop:4}}>📋 Se registrará como crédito pendiente</div>}
            </Card>
            <button onClick={confirmar} style={{width:"100%",padding:14,background:esCred?T.blue:T.green,color:"#fff",border:"none",borderRadius:12,fontWeight:800,fontSize:15,cursor:"pointer"}}>
              {esCred?`📋 Registrar crédito · ${bs(total)}`:`✅ Confirmar venta · ${bs(total)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// CRÉDITOS
function Creditos({creditos,onPagar,onEliminar}) {
  const pend=creditos.filter(c=>!c.pagado);
  const pagado=creditos.filter(c=>c.pagado);
  const totP=pend.reduce((s,c)=>s+c.monto,0);
  return(
    <div>
      <div style={{color:T.text,fontWeight:800,fontSize:19,marginBottom:16}}>📋 Créditos</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        <Card style={{background:T.blueLight}}><div style={{color:T.textMid,fontSize:10}}>Pendientes</div><div style={{color:T.blue,fontWeight:800,fontSize:18}}>{pend.length}</div></Card>
        <Card style={{background:T.blueLight}}><div style={{color:T.textMid,fontSize:10}}>Total pend.</div><div style={{color:T.blue,fontWeight:800,fontSize:16,fontFamily:"monospace"}}>{bs(totP)}</div></Card>
        <Card style={{background:T.greenLight}}><div style={{color:T.textMid,fontSize:10}}>Cobrados</div><div style={{color:T.green,fontWeight:800,fontSize:18}}>{pagado.length}</div></Card>
      </div>
      {pend.length>0&&(
        <>{<div style={{color:T.textLight,fontSize:10,textTransform:"uppercase",letterSpacing:1,marginBottom:9}}>⏳ Pendientes</div>}
        {pend.map(c=>(
          <Card key={c.id} style={{marginBottom:9,border:`1.5px solid ${T.blue}44`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{color:T.text,fontWeight:700,fontSize:14}}>👤 {c.cliente}</div>
                <div style={{color:T.textMid,fontSize:11,marginTop:2}}>{c.itemsStr} · {c.hora}</div>
                <div style={{color:T.textMid,fontSize:11}}>Vendedor: {c.vendedor}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:T.blue,fontWeight:800,fontFamily:"monospace",fontSize:16}}>{bs(c.monto)}</div>
                <div style={{display:"flex",gap:6,marginTop:6}}>
                  <button onClick={()=>onPagar(c.id)} style={{padding:"5px 12px",background:T.green,border:"none",color:"#fff",borderRadius:8,fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>✅ Cobrar</button>
                  <button onClick={()=>onEliminar(c.id)} style={{padding:"5px 10px",background:T.redLight,border:`1px solid ${T.red}44`,color:T.red,borderRadius:8,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>🗑️</button>
                </div>
              </div>
            </div>
          </Card>
        ))}</>
      )}
      {pagado.length>0&&(
        <>{<div style={{color:T.textLight,fontSize:10,textTransform:"uppercase",letterSpacing:1,margin:"14px 0 9px"}}>✅ Cobrados</div>}
        {pagado.slice(0,10).map(c=>(
          <Card key={c.id} style={{marginBottom:7,padding:"10px 14px",opacity:.7}}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <div><div style={{color:T.text,fontSize:13}}>👤 {c.cliente}</div><div style={{color:T.textMid,fontSize:10}}>{c.hora}</div></div>
              <div style={{color:T.green,fontWeight:700,fontFamily:"monospace"}}>{bs(c.monto)}</div>
            </div>
          </Card>
        ))}</>
      )}
      {creditos.length===0&&<Card><div style={{color:T.textLight,textAlign:"center",padding:28}}>No hay créditos</div></Card>}
    </div>
  );
}

// REPORTES
function Reportes({productos,ventas}) {
  const totalV=ventas.reduce((s,v)=>s+v.total,0),totalG=ventas.reduce((s,v)=>s+v.gan,0);
  const mGlob=totalV>0?((totalG/totalV)*100).toFixed(1):0;
  const topR=[...productos].sort((a,b)=>parseFloat(mrgP(b))-parseFloat(mrgP(a))).slice(0,5);
  const porCat=CATS.map(({id,icon})=>{const ps=productos.filter(p=>p.cat===id);return{id,icon,qty:ps.length,valor:ps.reduce((s,p)=>s+p.pc*p.stock,0),ganPot:ps.reduce((s,p)=>s+ganP(p)*p.stock,0)};}).filter(c=>c.qty>0);
  const porM=PAGOS.map(m=>({...m,total:ventas.filter(v=>v.metodoPago===m.id).reduce((s,v)=>s+v.total,0),cant:ventas.filter(v=>v.metodoPago===m.id).length})).filter(m=>m.cant>0);
  return(
    <div>
      <div style={{color:T.text,fontWeight:800,fontSize:19,marginBottom:16}}>📊 Reportes</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18}}>
        <Card style={{background:T.greenLight}}><div style={{color:T.textMid,fontSize:10,marginBottom:3}}>Ventas totales</div><div style={{color:T.green,fontWeight:800,fontSize:16,fontFamily:"monospace"}}>{bs(totalV)}</div></Card>
        <Card style={{background:T.goldLight}}><div style={{color:T.textMid,fontSize:10,marginBottom:3}}>Ganancia total</div><div style={{color:T.gold,fontWeight:800,fontSize:16,fontFamily:"monospace"}}>{bs(totalG)}</div></Card>
        <Card style={{background:T.bgSurface}}><div style={{color:T.textMid,fontSize:10,marginBottom:3}}>Margen</div><div style={{color:T.text,fontWeight:800,fontSize:16}}>{mGlob}%</div></Card>
      </div>
      {porM.length>0&&(
        <div style={{marginBottom:18}}>
          <div style={{color:T.textLight,fontSize:10,textTransform:"uppercase",letterSpacing:1,marginBottom:9}}>💳 Por método de pago</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:9}}>
            {porM.map(m=>(<Card key={m.id} style={{background:m.id==="credito"?T.blueLight:T.greenLight}}><div style={{color:T.textMid,fontSize:10}}>{m.icon} {m.label}</div><div style={{color:m.id==="credito"?T.blue:T.green,fontWeight:800,fontSize:14,fontFamily:"monospace"}}>{bs(m.total)}</div><div style={{color:T.textMid,fontSize:10}}>{m.cant} ventas</div></Card>))}
          </div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div>
          <div style={{color:T.textLight,fontSize:10,textTransform:"uppercase",letterSpacing:1,marginBottom:9}}>🏆 Más rentables</div>
          <Card style={{padding:0,overflow:"hidden"}}>
            {topR.map((p,i)=>(<div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",borderBottom:i<4?`1px solid ${T.border}`:"none",alignItems:"center"}}>
              <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:15}}>{["🥇","🥈","🥉","4️⃣","5️⃣"][i]}</span><div><div style={{color:T.text,fontSize:12,fontWeight:600}}>{p.nombre}</div><div style={{color:T.textMid,fontSize:10}}>{p.cat}</div></div></div>
              <div style={{textAlign:"right"}}><div style={{color:T.gold,fontWeight:700,fontSize:12}}>{mrgP(p)}%</div><div style={{color:T.green,fontSize:10,fontFamily:"monospace"}}>+{bs(ganP(p))}</div></div>
            </div>))}
          </Card>
        </div>
        <div>
          <div style={{color:T.textLight,fontSize:10,textTransform:"uppercase",letterSpacing:1,marginBottom:9}}>📦 Por categoría</div>
          <Card style={{padding:0,overflow:"hidden"}}>
            {porCat.map((c,i)=>(<div key={c.id} style={{padding:"9px 14px",borderBottom:i<porCat.length-1?`1px solid ${T.border}`:"none"}}>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:T.text,fontWeight:600,fontSize:12}}>{c.icon} {c.id}</span><span style={{color:T.textMid,fontSize:10}}>{c.qty} prod.</span></div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}><span style={{color:T.textMid,fontSize:10}}>Inv: <span style={{color:T.text,fontFamily:"monospace"}}>{bs(c.valor)}</span></span><span style={{color:T.textMid,fontSize:10}}>Pot: <span style={{color:T.green,fontFamily:"monospace"}}>{bs(c.ganPot)}</span></span></div>
            </div>))}
          </Card>
        </div>
      </div>
      <div style={{marginTop:16}}>
        <div style={{color:T.textLight,fontSize:10,textTransform:"uppercase",letterSpacing:1,marginBottom:9}}>🧾 Historial ({ventas.length})</div>
        {ventas.length===0?<Card><div style={{color:T.textLight,textAlign:"center",padding:18}}>Sin ventas</div></Card>:
          <Card style={{padding:0,overflow:"hidden"}}>
            {[...ventas].reverse().map((v,i)=>(<div key={v.id} style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",borderBottom:i<ventas.length-1?`1px solid ${T.border}`:"none",alignItems:"center"}}>
              <div>
                <div style={{color:T.text,fontSize:12}}>{v.items.map(i=>`${i.nombre}${i.presentacion?` (${i.presentacion})`:""} ×${i.qty}`).join(", ").slice(0,50)}</div>
                <div style={{color:T.textMid,fontSize:10,marginTop:2}}>{v.hora} · {v.vendedor}{v.metodoPago&&<span style={{marginLeft:6,background:v.metodoPago==="credito"?T.blueLight:T.greenLight,color:v.metodoPago==="credito"?T.blue:T.green,fontSize:9,padding:"1px 6px",borderRadius:8,fontWeight:700}}>{PAGOS.find(m=>m.id===v.metodoPago)?.label}</span>}</div>
              </div>
              <div style={{textAlign:"right"}}><div style={{color:v.metodoPago==="credito"?T.blue:T.green,fontWeight:700,fontFamily:"monospace",fontSize:12}}>{bs(v.total)}</div><div style={{color:T.gold,fontSize:10,fontFamily:"monospace"}}>+{bs(v.gan)}</div></div>
            </div>))}
          </Card>
        }
      </div>
    </div>
  );
}

// HISTORIAL VENDEDOR
function Historial({ventas,curUser}) {
  const mias=ventas.filter(v=>v.vendedor===curUser?.nombre);
  const totV=mias.reduce((s,v)=>s+v.total,0);
  return(
    <div>
      <div style={{color:T.text,fontWeight:800,fontSize:19,marginBottom:16}}>🧾 Mis Ventas</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <Card style={{background:T.greenLight}}><div style={{color:T.textMid,fontSize:10}}>Ventas</div><div style={{color:T.green,fontWeight:800,fontSize:20}}>{mias.length}</div></Card>
        <Card style={{background:T.greenLight}}><div style={{color:T.textMid,fontSize:10}}>Total</div><div style={{color:T.green,fontWeight:800,fontSize:16,fontFamily:"monospace"}}>{bs(totV)}</div></Card>
      </div>
      {mias.length===0?<Card><div style={{color:T.textLight,textAlign:"center",padding:28}}>Sin ventas aún</div></Card>:
        <Card style={{padding:0,overflow:"hidden"}}>
          {[...mias].reverse().map((v,i)=>(<div key={v.id} style={{padding:"10px 14px",borderBottom:i<mias.length-1?`1px solid ${T.border}`:"none",display:"flex",justifyContent:"space-between"}}>
            <div>
              <div style={{color:T.text,fontSize:12}}>{v.items.map(i=>`${i.nombre}${i.presentacion?` (${i.presentacion})`:""} ×${i.qty}`).join(", ").slice(0,44)}</div>
              <div style={{color:T.textMid,fontSize:10,marginTop:2}}>{v.hora}{v.metodoPago&&<span style={{marginLeft:6,color:v.metodoPago==="credito"?T.blue:T.green}}>{PAGOS.find(m=>m.id===v.metodoPago)?.label}</span>}</div>
            </div>
            <div style={{color:v.metodoPago==="credito"?T.blue:T.green,fontWeight:700,fontFamily:"monospace",fontSize:13}}>{bs(v.total)}</div>
          </div>))}
        </Card>
      }
    </div>
  );
}

// GESTIÓN VENDEDORES
function Usuarios({showToast}) {
  const [vendedores,setVendedores]=useState([]);
  const [modal,setModal]=useState(null);
  useEffect(()=>{api("/vendedores").then(d=>{if(d)setVendedores(d);});},[]);

  const guardar=async(f)=>{
    if(f.id){const r=await api(`/vendedores/${f.id}`,{method:"PUT",body:f});if(r){setVendedores(vs=>vs.map(v=>v.id===f.id?r:v));showToast("Vendedor actualizado");}else showToast("Error","error");}
    else{const r=await api("/vendedores",{method:"POST",body:f});if(r){setVendedores(vs=>[...vs,r]);showToast("Vendedor creado");}else showToast("Error — PIN puede estar en uso","error");}
    setModal(null);
  };

  const eliminar=async(id)=>{
    if(!window.confirm("¿Eliminar este vendedor?"))return;
    await api(`/vendedores/${id}`,{method:"DELETE"});
    setVendedores(vs=>vs.filter(v=>v.id!==id));showToast("Eliminado","error");
  };

  const initials=(n)=>n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{color:T.text,fontWeight:800,fontSize:19}}>👥 Vendedores</div>
        <button onClick={()=>setModal({})} style={{background:T.green,border:"none",color:"#fff",fontWeight:700,fontSize:12,padding:"7px 16px",borderRadius:18,cursor:"pointer",fontFamily:"inherit"}}>+ Nuevo</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        <Card style={{background:T.greenLight}}><div style={{color:T.textMid,fontSize:10}}>Total</div><div style={{color:T.green,fontWeight:800,fontSize:20}}>{vendedores.length}</div></Card>
        <Card style={{background:T.greenLight}}><div style={{color:T.textMid,fontSize:10}}>Activos</div><div style={{color:T.green,fontWeight:800,fontSize:20}}>{vendedores.filter(v=>v.activo).length}</div></Card>
        <Card style={{background:T.bgSurface}}><div style={{color:T.textMid,fontSize:10}}>Turno mañana</div><div style={{color:T.text,fontWeight:800,fontSize:20}}>{vendedores.filter(v=>v.turno?.toLowerCase().includes("man")).length}</div></Card>
      </div>
      {vendedores.map(v=>(
        <Card key={v.id} style={{marginBottom:10,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:44,height:44,borderRadius:12,background:v.color+"22",color:v.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,flexShrink:0}}>{initials(v.nombre)}</div>
          <div style={{flex:1}}><div style={{color:T.text,fontWeight:700,fontSize:14}}>{v.nombre}</div><div style={{color:T.textMid,fontSize:11,marginTop:2}}>{v.turno||"Sin turno"} · PIN: ••••</div></div>
          <div style={{display:"flex",gap:7}}>
            <button onClick={()=>setModal(v)} style={{background:T.bgSurface,border:`1px solid ${T.border}`,color:T.text,borderRadius:9,padding:"6px 12px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>✏️ Editar</button>
            <button onClick={()=>eliminar(v.id)} style={{background:T.redLight,border:`1px solid ${T.red}44`,color:T.red,borderRadius:9,padding:"6px 10px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>🗑️</button>
          </div>
        </Card>
      ))}
      {vendedores.length===0&&<Card><div style={{color:T.textLight,textAlign:"center",padding:28}}>No hay vendedores. Crea el primero ↑</div></Card>}
      {modal!==null&&<ModalVendedor vend={modal.id?modal:null} onClose={()=>setModal(null)} onSave={guardar}/>}
    </div>
  );
}

// CONFIG
function Config({showToast}) {
  const [pinActual,setPinActual]=useState("");
  const [pinNuevo,setPinNuevo]=useState("");
  const cambiar=async()=>{
    if(pinNuevo.length!==4){showToast("PIN debe tener 4 dígitos","error");return;}
    const r=await api("/auth/pin",{method:"PUT",body:{pinActual,pinNuevo}});
    if(r?.ok){showToast("✅ PIN actualizado");setPinActual("");setPinNuevo("");}
    else showToast("PIN actual incorrecto","error");
  };
  return(
    <div>
      <div style={{color:T.text,fontWeight:800,fontSize:19,marginBottom:16}}>⚙️ Configuración</div>
      <Card style={{marginBottom:14}}>
        <div style={{color:T.text,fontWeight:700,fontSize:14,marginBottom:13}}>🔑 Cambiar PIN Administrador</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Fld label="PIN actual" type="password" value={pinActual} onChange={e=>setPinActual(e.target.value)}/>
          <Fld label="PIN nuevo (4 dígitos)" type="number" value={pinNuevo} onChange={e=>setPinNuevo(e.target.value.slice(0,4))}/>
        </div>
        <button onClick={cambiar} style={{padding:"10px 20px",background:T.green,border:"none",color:"#fff",borderRadius:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Guardar PIN</button>
      </Card>
      <Card>
        <div style={{color:T.text,fontWeight:700,fontSize:14,marginBottom:10}}>ℹ️ Permisos por perfil</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,fontSize:12}}>
          <div><div style={{color:T.textMid,fontWeight:600,marginBottom:5}}>👑 Administrador</div>
            {["Inventario completo","Precios de compra","Gestionar vendedores","Reportes completos","Gestionar créditos","Cambiar PINs","Gestionar presentaciones"].map(p=>(<div key={p} style={{display:"flex",gap:5,marginBottom:3}}><span style={{color:T.green}}>✓</span><span style={{color:T.text}}>{p}</span></div>))}
          </div>
          <div><div style={{color:T.textMid,fontWeight:600,marginBottom:5}}>🛒 Vendedor</div>
            {["Registrar ventas","Elegir presentación","Elegir método de pago","Ver historial propio"].map(p=>(<div key={p} style={{display:"flex",gap:5,marginBottom:3}}><span style={{color:T.green}}>✓</span><span style={{color:T.text}}>{p}</span></div>))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════════════
export default function LicoSport() {
  const isMob=useIsMobile();
  const [role,setRole]=useState(null);
  const [curUser,setCurUser]=useState(null);
  const [tab,setTab]=useState("home");
  const [productos,setProductos]=useState(DEMO);
  const [ventas,setVentas]=useState([]);
  const [creditos,setCreditos]=useState([]);
  const [modalProd,setModalProd]=useState(null);
  const [modalPres,setModalPres]=useState(null); // producto para gestionar presentaciones
  const [toast,setToast]=useState(null);
  const [apiOk,setApiOk]=useState(false);

  const alertas=productos.filter(p=>p.stock<=p.min).length;
  const credPend=creditos.filter(c=>!c.pagado).length;
  const showToast=(msg,type="success")=>setToast({msg,type});

const handleLogin=useCallback(async(r,user,token)=>{
  setRole(r);setCurUser(user);setTab("home");
  const tok=token||localStorage.getItem("ls_tok");
  const data=await fetch(`${API_URL}/productos`,{headers:{Authorization:`Bearer ${tok}`,"Content-Type":"application/json"}}).then(r=>r.ok?r.json():null).catch(()=>null);
  if(data?.length){setProductos(data);setApiOk(true);}
},[]);

  const guardarProd=async(f)=>{
    if(f.id){
      if(apiOk)await api(`/productos/${f.id}`,{method:"PUT",body:f});
      setProductos(ps=>ps.map(p=>p.id===f.id?f:p));showToast("Producto actualizado");
    } else {
      let nuevo={...f,id:Date.now()};
      if(apiOk){const r=await api("/productos",{method:"POST",body:f});if(r?.id)nuevo=r;}
      setProductos(ps=>[...ps,nuevo]);showToast("Producto agregado");
    }
    setModalProd(null);
  };

  const eliminarProd=async(id)=>{
    if(!window.confirm("¿Eliminar?"))return;
    if(apiOk)await api(`/productos/${id}`,{method:"DELETE"});
    setProductos(ps=>ps.filter(p=>p.id!==id));showToast("Eliminado","error");
  };

  const confirmarVenta=(carrito,metodo,cliente)=>{
    const total=carrito.reduce((s,i)=>s+i.pvPres*i.qty,0);
    const gan_=carrito.reduce((s,i)=>s+(i.pvPres-i.pcPres)*i.qty,0);
    // Descontar stock en unidades
    setProductos(ps=>ps.map(p=>{
      const unids=carrito.filter(i=>i.prodId===p.id).reduce((s,i)=>s+i.qty*i.equivUnids,0);
      return unids>0?{...p,stock:Math.max(0,p.stock-unids)}:p;
    }));
    const v={id:Date.now(),hora:new Date().toLocaleTimeString("es-BO",{hour:"2-digit",minute:"2-digit"}),vendedor:curUser?.nombre||"?",metodoPago:metodo,items:carrito.map(i=>({nombre:i.nombre,presentacion:i.presentacion,qty:i.qty,pvPres:i.pvPres,pcPres:i.pcPres,equivUnids:i.equivUnids})),total,gan:gan_};
    setVentas(vs=>[...vs,v]);
    if(metodo==="credito"){
      setCreditos(cs=>[...cs,{id:Date.now(),cliente,monto:total,itemsStr:carrito.map(i=>`${i.nombre}${i.presentacion?` (${i.presentacion})`:""} ×${i.qty}`).join(", ").slice(0,50),hora:v.hora,vendedor:curUser?.nombre||"?",pagado:false}]);
      showToast(`📋 Crédito para ${cliente} · ${bs(total)}`,"warning");
    } else {showToast(`✅ Venta · ${bs(total)}`);}
    setTab("home");
  };

  const pagarCredito=(id)=>{setCreditos(cs=>cs.map(c=>c.id===id?{...c,pagado:true}:c));showToast("✅ Crédito cobrado");};
  const eliminarCred=(id)=>{setCreditos(cs=>cs.filter(c=>c.id!==id));showToast("Eliminado","error");};
  const handleAction=(a)=>{if(a==="nuevo"){setModalProd({});return;}setTab(a);};
  const logout=()=>{setRole(null);setCurUser(null);setTab("home");if(typeof window!=="undefined")localStorage.removeItem("ls_tok");};

  if(!role)return<Login onLogin={handleLogin}/>;

  const content=()=>{
    switch(tab){
      case "home":     return<Home role={role} curUser={curUser} productos={productos} ventas={ventas} creditos={creditos} onAction={handleAction}/>;
      case "inv":      return role==="admin"?<Inventario productos={productos} onEditar={setModalProd} onEliminar={eliminarProd} onNuevo={()=>setModalProd({})} onPresentaciones={setModalPres}/>:null;
      case "venta":    return<Venta role={role} curUser={curUser} productos={productos} onConfirmar={confirmarVenta}/>;
      case "creditos": return role==="admin"?<Creditos creditos={creditos} onPagar={pagarCredito} onEliminar={eliminarCred}/>:null;
      case "report":   return role==="admin"?<Reportes productos={productos} ventas={ventas}/>:null;
      case "historial":return<Historial ventas={ventas} curUser={curUser}/>;
      case "usuarios": return role==="admin"?<Usuarios showToast={showToast}/>:null;
      case "config":   return role==="admin"?<Config showToast={showToast}/>:null;
      default:         return null;
    }
  };

  return(
    <div style={{minHeight:"100vh",background:T.bgPage,fontFamily:"system-ui,-apple-system,sans-serif",color:T.text}}>
      {!apiOk&&<div style={{background:T.goldLight,borderBottom:`1px solid ${T.gold}44`,padding:"5px 16px",textAlign:"center",fontSize:11,color:T.gold}}>⚡ Modo offline — conectando al servidor...</div>}

      {!isMob&&(
        <>
          <Sidebar role={role} curUser={curUser} tab={tab} onTab={setTab} onLogout={logout} alertas={alertas} credPend={credPend}/>
          <main style={{marginLeft:220,padding:28,minHeight:"100vh"}}><div style={{maxWidth:1100,margin:"0 auto"}}>{content()}</div></main>
        </>
      )}

      {isMob&&(
        <>
          <div style={{background:T.bgWhite,borderBottom:`1px solid ${T.border}`,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:700}}>
            <img src="/logo.png" alt="LS" style={{width:34,height:34,objectFit:"contain",borderRadius:8}}/>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{background:T.greenLight,color:T.greenText,fontSize:10,fontWeight:700,padding:"2px 9px",borderRadius:18}}>{curUser?.icon} {curUser?.nombre}</span>
              <button onClick={logout} style={{background:"none",border:"none",color:T.textMid,cursor:"pointer",fontSize:16}}>🔒</button>
            </div>
          </div>
          <div style={{padding:"14px",paddingBottom:88}}>{content()}</div>
          <BottomNav role={role} tab={tab} onTab={setTab} alertas={alertas} credPend={credPend}/>
        </>
      )}

      {modalProd!==null&&<ModalProd prod={modalProd.id?modalProd:null} isMob={isMob} onClose={()=>setModalProd(null)} onSave={guardarProd}/>}
      {modalPres!==null&&<ModalPresentaciones producto={modalPres} onClose={()=>setModalPres(null)}/>}
      {toast&&<Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}

      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        input,button,select{font-family:inherit}
        input:focus,select:focus{outline:2px solid ${T.green};outline-offset:1px}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}
        @keyframes shUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}
