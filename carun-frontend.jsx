// ============================================================
//  CarUn — Frontend React
//  Consome as funções de /firebase-backend.js
//
//  DEPENDÊNCIAS:
//  npm install firebase
//
//  COMO RODAR (Create React App ou Vite):
//  1. Coloque firebase-backend.js na mesma pasta
//  2. Configure firebaseConfig no backend
//  3. npm start / npm run dev
// ============================================================

import { useState, useRef, useEffect } from "react";
import {
  registerUser,
  loginUser,
  logoutUser,
  onAuthChange,
  getUserProfile,
  updateUserProfile,
  changePassword,
  createRide,
  listenRides,
  requestRide,
  getChatId,
  sendMessage,
  listenMessages,
  listenUserChats,
  submitRating,
} from "./firebase-backend";

// ─────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────
const G = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`;

const CSS = `
${G}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; background: #e8e8e8; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; padding: 24px 0; }

.phone { width:375px; min-height:812px; background:#fff; border-radius:40px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 24px 80px rgba(0,0,0,0.18); }

.status-bar { height:44px; background:#fff; display:flex; align-items:center; justify-content:space-between; padding:0 24px; flex-shrink:0; }
.status-time { font-size:15px; font-weight:600; color:#000; }
.status-icons { font-size:12px; color:#000; display:flex; gap:5px; align-items:center; }

.top-bar { display:flex; align-items:center; justify-content:space-between; padding:0 20px; height:52px; border-bottom:1px solid #f0f0f0; flex-shrink:0; }
.top-back { background:none; border:none; cursor:pointer; font-size:24px; color:#000; width:32px; }
.top-title { font-size:17px; font-weight:700; color:#000; }
.top-more { font-size:20px; color:#000; cursor:pointer; letter-spacing:2px; }

.screen { flex:1; overflow-y:auto; padding-bottom:72px; }
.screen::-webkit-scrollbar { display:none; }

.bottom-nav { position:sticky; bottom:0; height:72px; background:#fff; border-top:1px solid #ebebeb; display:flex; align-items:center; justify-content:space-around; padding-bottom:8px; flex-shrink:0; }
.nav-btn { background:none; border:none; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:3px; padding:6px 20px; }
.nav-btn .ni { font-size:24px; }
.nav-dot { width:6px; height:6px; background:#000; border-radius:50%; }

/* LOGIN */
.login-wrap { display:flex; flex-direction:column; align-items:center; padding:64px 32px 40px; }
.logo-box { width:72px; height:72px; background:#E8332A; border-radius:20px; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
.logo-inner { width:38px; height:38px; background:#fff; border-radius:50%; }
.app-name { font-size:34px; font-weight:800; color:#000; letter-spacing:-1px; margin-bottom:40px; }
.inp-wrap { width:100%; margin-bottom:14px; position:relative; }
.inp { width:100%; border:1.5px solid #d8d8d8; border-radius:10px; padding:14px 44px 14px 16px; font-size:15px; font-family:'Inter',sans-serif; color:#000; outline:none; background:#fff; transition:border-color .15s; }
.inp:focus { border-color:#7C3AED; }
.inp::placeholder { color:#bbb; }
.inp-ic { position:absolute; right:14px; top:50%; transform:translateY(-50%); color:#bbb; font-size:16px; }
.forgot { font-size:14px; color:#7C3AED; text-align:center; margin-bottom:28px; cursor:pointer; }
.btn-blk { width:100%; background:#000; color:#fff; border:none; border-radius:10px; padding:16px; font-size:16px; font-weight:700; font-family:'Inter',sans-serif; cursor:pointer; letter-spacing:.4px; }
.btn-blk:disabled { opacity:.5; cursor:not-allowed; }
.btn-pur { width:100%; background:#7C3AED; color:#fff; border:none; border-radius:40px; padding:16px; font-size:16px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer; }
.btn-pur:disabled { opacity:.5; cursor:not-allowed; }
.btn-out { width:100%; background:#fff; color:#000; border:1.5px solid #e0e0e0; border-radius:10px; padding:14px; font-size:15px; font-weight:500; font-family:'Inter',sans-serif; cursor:pointer; }
.err-txt { color:#E8332A; font-size:13px; margin-bottom:12px; text-align:center; }
.switch-txt { font-size:13px; color:#888; text-align:center; margin-top:18px; }
.switch-txt span { color:#7C3AED; cursor:pointer; font-weight:600; }

/* RIDE LIST */
.chip-row { display:flex; gap:8px; padding:12px 16px; flex-wrap:wrap; }
.chip { background:#f5f5f5; border:1.5px solid #ebebeb; border-radius:20px; padding:6px 14px; font-size:13px; font-weight:500; cursor:pointer; color:#333; }
.chip.on { background:#7C3AED; color:#fff; border-color:#7C3AED; }
.r-card { margin:0 16px 12px; border:1.5px solid #ebebeb; border-radius:14px; padding:16px; background:#fff; cursor:pointer; display:flex; align-items:flex-start; gap:12px; }
.r-card:active { border-color:#7C3AED; }
.r-av { width:48px; height:48px; border-radius:50%; background:#222; flex-shrink:0; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:16px; }
.r-body { flex:1; }
.r-name { font-size:16px; font-weight:700; color:#000; }
.r-stars { font-size:13px; color:#F59E0B; margin:3px 0 8px; }
.r-meta { font-size:13px; color:#555; display:flex; flex-direction:column; gap:4px; }
.r-meta b { color:#000; font-weight:500; }
.r-price { font-size:15px; font-weight:700; color:#000; }

/* DETAIL */
.det-wrap { background:#f5f3ff; padding:32px 24px; display:flex; flex-direction:column; align-items:center; }
.det-av { width:90px; height:90px; border-radius:50%; background:#222; margin-bottom:16px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:800; font-size:30px; }
.det-name { font-size:22px; font-weight:800; color:#000; }
.det-stars { font-size:15px; color:#F59E0B; margin:4px 0 20px; }
.det-rows { width:100%; display:flex; flex-direction:column; gap:14px; margin-bottom:20px; }
.det-row { display:flex; justify-content:space-between; font-size:15px; }
.det-row .k { color:#555; }
.det-row .v { color:#000; font-weight:600; }
.hobbies { font-size:14px; color:#555; width:100%; margin-bottom:24px; }
.hobbies b { color:#000; }

/* SUCCESS */
.suc-wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 40px; }
.suc-orb { width:130px; height:130px; background:radial-gradient(circle at 38% 38%, #c4b5fd 0%, rgba(124,58,237,0.25) 70%); border-radius:50%; position:relative; margin-bottom:40px; }
.orb-dot { width:14px; height:14px; background:#7C3AED; border-radius:50%; position:absolute; }
.orb-sm  { width:9px; height:9px; background:#7C3AED88; border-radius:50%; position:absolute; }
.orb-dia { width:10px; height:10px; background:#7C3AED99; transform:rotate(45deg); position:absolute; top:26px; right:18px; }

/* SETTINGS */
.slist { padding:16px; display:flex; flex-direction:column; gap:10px; }
.scard { background:#f7f5ff; border-radius:12px; padding:18px; font-size:16px; font-weight:500; color:#000; border:none; text-align:left; width:100%; cursor:pointer; }
.scard:active { background:#ede9fe; }

/* FORM */
.fsec { padding:16px 20px; }
.flabel { font-size:13px; font-weight:600; color:#7C3AED; margin-bottom:6px; margin-top:16px; }
.flabel:first-child { margin-top:4px; }
.fbox { width:100%; background:#f7f5ff; border:none; border-radius:10px; padding:14px; font-size:15px; font-family:'Inter',sans-serif; color:#000; outline:none; resize:none; }
.fbox::placeholder { color:#bbb; }
.fbox:focus { box-shadow:0 0 0 2px #7C3AED44; }

/* HOME STATS */
.home-stat-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; padding:0 16px; }
.hstat { border:1.5px solid #ebebeb; border-radius:14px; padding:16px; }
.hstat-icon { font-size:22px; margin-bottom:8px; }
.hstat-val { font-size:20px; font-weight:800; color:#000; }
.hstat-lbl { font-size:12px; color:#888; margin-top:2px; }

/* LOADING */
.loading { display:flex; align-items:center; justify-content:center; padding:40px; color:#888; font-size:14px; gap:8px; }
.spinner { width:18px; height:18px; border:2px solid #e0e0e0; border-top-color:#7C3AED; border-radius:50%; animation:spin .7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }

/* TOAST */
.toast { position:fixed; bottom:100px; left:50%; transform:translateX(-50%); background:#222; color:#fff; padding:10px 20px; border-radius:20px; font-size:13px; font-weight:500; z-index:999; animation:fadeInUp .2s ease; white-space:nowrap; }
@keyframes fadeInUp { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }

/* STARS INPUT */
.stars-input { display:flex; gap:6px; }
.star-btn { background:none; border:none; font-size:26px; cursor:pointer; line-height:1; }
`;

// ─────────────────────────────────────────────────────────────
// UTILITÁRIOS
// ─────────────────────────────────────────────────────────────
function initials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function SBar() {
  const now = new Date();
  const t = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;
  return (
    <div className="status-bar">
      <span className="status-time">{t}</span>
      <div className="status-icons"><span>●●●</span><span>WiFi</span><span>🔋</span></div>
    </div>
  );
}

function TBar({ title, onBack }) {
  return (
    <div className="top-bar">
      <button className="top-back" onClick={onBack}>{onBack ? "‹" : ""}</button>
      <span className="top-title">{title}</span>
      <span className="top-more">···</span>
    </div>
  );
}

function BNav({ cur, go }) {
  return (
    <div className="bottom-nav">
      <button className="nav-btn" onClick={() => go("home")}>
        <span className="ni">🏠</span>
        {cur === "home" && <div className="nav-dot" />}
      </button>
      <button className="nav-btn" onClick={() => go("chat")}>
        <span className="ni">💬</span>
        {cur === "chat" && <div className="nav-dot" />}
      </button>
      <button className="nav-btn" onClick={() => go("settings")}>
        <span className="ni">⚙️</span>
        {cur === "settings" && <div className="nav-dot" />}
      </button>
    </div>
  );
}

function Spinner() {
  return <div className="loading"><div className="spinner" />Carregando...</div>;
}

function Toast({ msg }) {
  if (!msg) return null;
  return <div className="toast">{msg}</div>;
}

// ─────────────────────────────────────────────────────────────
// TELA: LOGIN / CADASTRO
// ─────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [mode, setMode]   = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [name, setName]   = useState("");
  const [uni, setUni]     = useState("Mackenzie");
  const [role, setRole]   = useState("passenger");
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr("");
    if (!email || !pass) { setErr("Preencha todos os campos."); return; }
    if (mode === "register" && !name) { setErr("Digite seu nome."); return; }
    setLoading(true);
    try {
      if (mode === "register") {
        await registerUser(email, pass, { name, role, university: uni });
      } else {
        await loginUser(email, pass);
      }
      // onAuthChange no App vai detectar e buscar o perfil
    } catch (e) {
      const msgs = {
        "auth/email-already-in-use": "E-mail já cadastrado.",
        "auth/invalid-email":        "E-mail inválido.",
        "auth/weak-password":        "Senha muito fraca (mín. 6 caracteres).",
        "auth/wrong-password":       "Senha incorreta.",
        "auth/user-not-found":       "Usuário não encontrado.",
      };
      setErr(msgs[e.code] || "Erro ao autenticar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen">
      <div className="login-wrap">
        <div className="logo-box"><div className="logo-inner" /></div>
        <div className="app-name">CarUn</div>

        {mode === "register" && (
          <>
            <div className="inp-wrap">
              <input className="inp" placeholder="Nome completo" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="inp-wrap">
              <select className="inp" style={{ paddingRight:16 }} value={uni} onChange={e => setUni(e.target.value)}>
                {["Mackenzie","USP","UNICAMP","UNIFESP","PUC-SP"].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </>
        )}

        <div className="inp-wrap">
          <input className="inp" placeholder="teste@gmail.com" value={email} onChange={e => setEmail(e.target.value)} />
          <span className="inp-ic">ⓘ</span>
        </div>
        <div className="inp-wrap">
          <input className="inp" type="password" placeholder="Senha" value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()} />
          <span className="inp-ic">ⓘ</span>
        </div>

        {mode === "register" && (
          <div style={{ width:"100%", marginBottom:14 }}>
            <div style={{ fontSize:13, color:"#888", marginBottom:8 }}>Você é:</div>
            <div style={{ display:"flex", gap:10 }}>
              <button style={{ flex:1, padding:"10px", borderRadius:8, border:role==="passenger"?"none":"1.5px solid #e0e0e0", background:role==="passenger"?"#7C3AED":"#fff", color:role==="passenger"?"#fff":"#000", fontWeight:600, cursor:"pointer" }} onClick={() => setRole("passenger")}>Passageiro</button>
              <button style={{ flex:1, padding:"10px", borderRadius:8, border:role==="driver"?"none":"1.5px solid #e0e0e0", background:role==="driver"?"#000":"#fff", color:role==="driver"?"#fff":"#000", fontWeight:600, cursor:"pointer" }} onClick={() => setRole("driver")}>Motorista</button>
            </div>
          </div>
        )}

        {err && <div className="err-txt">{err}</div>}
        {mode === "login" && <div className="forgot">Esqueceu a senha?</div>}

        <button className="btn-blk" onClick={submit} disabled={loading}>
          {loading ? "Aguarde..." : mode === "login" ? "ENTRAR" : "CADASTRAR"}
        </button>

        <div className="switch-txt">
          {mode === "login"
            ? <>Não tem conta? <span onClick={() => { setMode("register"); setErr(""); }}>Cadastre-se</span></>
            : <>Já tem conta? <span onClick={() => { setMode("login"); setErr(""); }}>Entrar</span></>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TELA: HOME
// ─────────────────────────────────────────────────────────────
function Home({ profile, go, rideCount }) {
  return (
    <>
      <TBar title="Início" />
      <div className="screen">
        <div style={{ padding:"20px 16px 12px" }}>
          <div style={{ fontSize:13, color:"#888" }}>Bem-vindo,</div>
          <div style={{ fontSize:22, fontWeight:800 }}>{profile.name} 👋</div>
          <div style={{ fontSize:13, color:"#aaa", marginTop:2 }}>
            {profile.role === "driver" ? "🚗 Motorista" : "🎒 Passageiro"}
          </div>
        </div>
        <div style={{ padding:"0 16px", display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
          <button className="btn-blk" onClick={() => go("rides")}>Buscar Carona</button>
          <button className="btn-pur" onClick={() => go("offer")}>
            {profile.role === "driver" ? "Oferecer Carona" : "Quero oferecer carona"}
          </button>
        </div>
        <div className="home-stat-grid">
          {[
            ["🚗", String(rideCount), "caronas disponíveis"],
            ["👥", "—", "usuários ativos"],
            ["💰", "R$47", "economizados/mês"],
            ["🌿", "12kg", "CO₂ evitado"],
          ].map(([ic, v, l]) => (
            <div key={l} className="hstat">
              <div className="hstat-icon">{ic}</div>
              <div className="hstat-val">{v}</div>
              <div className="hstat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// TELA: LISTA DE CARONAS — consome listenRides()
// ─────────────────────────────────────────────────────────────
function Rides({ onSelect }) {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fg, setFg] = useState("");

  useEffect(() => {
    // Listener em tempo real via Firestore
    const unsub = listenRides(data => {
      setRides(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const list = rides.filter(r => !fg || r.gender === fg);

  return (
    <>
      <TBar title="Caronas Disponíveis" />
      <div className="screen">
        <div className="chip-row">
          {[["","Todos"],["F","Feminino"],["M","Masculino"]].map(([v,l]) => (
            <button key={v} className={`chip ${fg===v?"on":""}`} onClick={() => setFg(v)}>{l}</button>
          ))}
        </div>

        {loading && <Spinner />}

        {!loading && list.length === 0 && (
          <div style={{ textAlign:"center", padding:40, color:"#aaa", fontSize:14 }}>
            Nenhuma carona disponível no momento.
          </div>
        )}

        {list.map(r => (
          <div className="r-card" key={r.id} onClick={() => onSelect(r)}>
            <div className="r-av">{initials(r.driverName)}</div>
            <div className="r-body">
              <div className="r-name">{r.driverName}</div>
              <div className="r-stars">⭐ {(r.driverRating || 5).toFixed(1)}</div>
              <div className="r-meta">
                <div>Saída: <b>{r.time}</b></div>
                <div>Origem: <b>{r.origin}</b></div>
                <div>Destino: <b>{r.destination}</b></div>
                <div>Valor: <b>R$ {r.price},00</b></div>
              </div>
            </div>
            <div className="r-price">R$ {r.price},00</div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// TELA: DETALHE DO MOTORISTA — consome requestRide()
// ─────────────────────────────────────────────────────────────
function Detail({ ride, profile, onBack, onConfirm }) {
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    try {
      await requestRide(ride.id, ride.driverUid, {
        uid:  profile.uid,
        name: profile.name,
      });
      onConfirm();
    } catch (e) {
      console.error("Erro ao solicitar carona:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TBar title="" onBack={onBack} />
      <div className="screen">
        <div className="det-wrap">
          <div className="det-av">{initials(ride.driverName)}</div>
          <div className="det-name">{ride.driverName}</div>
          <div className="det-stars">⭐ {(ride.driverRating || 5).toFixed(1)}</div>
          <div className="det-rows">
            {[
              ["Saída",    ride.time],
              ["Origem",   ride.origin],
              ["Destino",  ride.destination],
              ["Valor",    `R$ ${ride.price},00`],
              ["Vagas",    ride.seats],
            ].map(([k,v]) => (
              <div className="det-row" key={k}>
                <span className="k">{k}</span>
                <span className="v">{v}</span>
              </div>
            ))}
          </div>
          {ride.hobbies && (
            <div className="hobbies"><b>Hobbies:</b> {ride.hobbies}</div>
          )}
          <button className="btn-pur" onClick={handleRequest} disabled={loading}>
            {loading ? "Solicitando..." : "Selecionar Carona"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// TELA: SUCESSO
// ─────────────────────────────────────────────────────────────
function Success({ title = "Carona Solicitada com sucesso!", onBack }) {
  return (
    <>
      <TBar title={title} onBack={onBack} />
      <div className="screen">
        <div className="suc-wrap">
          <div className="suc-orb">
            <div className="orb-dot" style={{ top:16, left:22 }} />
            <div className="orb-sm"  style={{ bottom:22, right:18 }} />
            <div className="orb-sm"  style={{ bottom:10, left:16 }} />
            <div className="orb-dia" />
          </div>
          <button className="btn-pur" style={{ width:"80%" }} onClick={onBack}>Voltar</button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// TELA: CHAT — consome sendMessage() e listenMessages()
// ─────────────────────────────────────────────────────────────
function Chat({ profile }) {
  // Para o MVP, abre o chat com o motorista da última carona
  // Em produção: receber o chatId como prop
  const [chats, setChats]   = useState([]);
  const [chatId, setChatId] = useState(null);
  const [msgs, setMsgs]     = useState([]);
  const [input, setInput]   = useState("");
  const ref = useRef(null);

  // Lista conversas do usuário
  useEffect(() => {
    if (!profile?.uid) return;
    const unsub = listenUserChats(profile.uid, data => setChats(data));
    return () => unsub();
  }, [profile]);

  // Abre conversa
  useEffect(() => {
    if (!chatId) return;
    const unsub = listenMessages(chatId, data => setMsgs(data));
    return () => unsub();
  }, [chatId]);

  useEffect(() => { ref.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || !chatId || !profile?.uid) return;
    const text = input;
    setInput("");
    await sendMessage(chatId, profile.uid, text);
  };

  // Sem conversa aberta: mostra lista
  if (!chatId) {
    return (
      <>
        <TBar title="Mensagens" />
        <div className="screen">
          {chats.length === 0 ? (
            <div style={{ textAlign:"center", padding:40, color:"#aaa", fontSize:14 }}>
              Nenhuma conversa ainda.<br />Solicite uma carona para iniciar um chat.
            </div>
          ) : (
            chats.map(c => {
              const otherId = c.participants?.find(id => id !== profile.uid) || "";
              return (
                <div key={c.id} className="r-card" onClick={() => setChatId(c.id)}>
                  <div className="r-av">{otherId.slice(0,2).toUpperCase()}</div>
                  <div className="r-body">
                    <div className="r-name">Conversa</div>
                    <div style={{ fontSize:13, color:"#888" }}>{c.lastMessage || "..."}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </>
    );
  }

  // Conversa aberta
  return (
    <>
      <TBar title="Chat" onBack={() => setChatId(null)} />
      <div className="screen" style={{ display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderBottom:"1px solid #f0f0f0" }}>
          <div className="r-av" style={{ width:42, height:42 }}>?</div>
          <div>
            <div style={{ fontWeight:700, fontSize:15 }}>Motorista</div>
            <div style={{ fontSize:12, color:"#22C55E" }}>● Online</div>
          </div>
        </div>
        <div style={{ flex:1, padding:16, display:"flex", flexDirection:"column", gap:10, overflowY:"auto" }}>
          {msgs.map(m => {
            const isMe = m.senderUid === profile.uid;
            return (
              <div key={m.id} style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth:"75%" }}>
                <div style={{ background: isMe ? "#7C3AED" : "#f5f5f5", color: isMe ? "#fff" : "#000", borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding:"10px 14px", fontSize:14, lineHeight:1.5 }}>
                  {m.text}
                </div>
              </div>
            );
          })}
          <div ref={ref} />
        </div>
        <div style={{ display:"flex", gap:8, padding:"10px 16px", borderTop:"1px solid #f0f0f0" }}>
          <input style={{ flex:1, border:"1.5px solid #e0e0e0", borderRadius:20, padding:"9px 16px", fontSize:14, fontFamily:"Inter,sans-serif", outline:"none" }}
            placeholder="Digite uma mensagem..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()} />
          <button onClick={send} style={{ width:38, height:38, borderRadius:"50%", background:"#7C3AED", border:"none", color:"#fff", fontSize:16, cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>➤</button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// TELA: SETTINGS
// ─────────────────────────────────────────────────────────────
function Settings({ go }) {
  return (
    <>
      <TBar title="Suas Informações" />
      <div className="screen">
        <div className="slist">
          <button className="scard" onClick={() => go("account")}>Conta</button>
          <button className="scard" onClick={() => go("password")}>Alterar senha</button>
          <button className="scard" onClick={() => go("about")}>Sobre você</button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// TELA: CONTA — consome updateUserProfile()
// ─────────────────────────────────────────────────────────────
function Account({ profile, onBack, onSave }) {
  const [name, setName]   = useState(profile.name || "");
  const [uni, setUni]     = useState(profile.university || "Mackenzie");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateUserProfile(profile.uid, { name, university: uni });
      onSave({ name, university: uni });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TBar title="Conta" onBack={onBack} />
      <div className="screen">
        <div className="fsec">
          <div className="flabel">Nome</div>
          <input className="fbox" value={name} onChange={e => setName(e.target.value)} />
          <div className="flabel">E-mail</div>
          <input className="fbox" value={profile.email || ""} disabled style={{ opacity:0.6 }} />
          <div className="flabel">Universidade</div>
          <select className="fbox" value={uni} onChange={e => setUni(e.target.value)} style={{ appearance:"none" }}>
            {["Mackenzie","USP","UNICAMP","UNIFESP","PUC-SP"].map(u => <option key={u}>{u}</option>)}
          </select>
          <div style={{ marginTop:20 }}>
            <button className="btn-blk" onClick={save} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// TELA: SENHA — consome changePassword()
// ─────────────────────────────────────────────────────────────
function Password({ onBack, showToast }) {
  const [curr, setCurr] = useState("");
  const [next, setNext] = useState("");
  const [conf, setConf] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (next !== conf) { showToast("As senhas não coincidem."); return; }
    if (next.length < 6) { showToast("Mínimo 6 caracteres."); return; }
    setSaving(true);
    try {
      await changePassword(curr, next);
      showToast("Senha alterada com sucesso! ✅");
      onBack();
    } catch {
      showToast("Senha atual incorreta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TBar title="Alterar senha" onBack={onBack} />
      <div className="screen">
        <div className="fsec">
          <div className="flabel">Senha atual</div>
          <input className="fbox" type="password" placeholder="••••••••" value={curr} onChange={e => setCurr(e.target.value)} />
          <div className="flabel">Nova senha</div>
          <input className="fbox" type="password" placeholder="••••••••" value={next} onChange={e => setNext(e.target.value)} />
          <div className="flabel">Confirmar nova senha</div>
          <input className="fbox" type="password" placeholder="••••••••" value={conf} onChange={e => setConf(e.target.value)} />
          <div style={{ marginTop:20 }}>
            <button className="btn-blk" onClick={save} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// TELA: SOBRE VOCÊ — consome updateUserProfile()
// ─────────────────────────────────────────────────────────────
function About({ profile, onBack, showToast }) {
  const [hobbies,     setHobbies]     = useState(profile.hobbies     || "");
  const [personality, setPersonality] = useState(profile.personality || "");
  const [gender,      setGender]      = useState(profile.gender      || "");
  const [semester,    setSemester]    = useState(profile.semester     || 1);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateUserProfile(profile.uid, { hobbies, personality, gender, semester: Number(semester) });
      showToast("Perfil atualizado! ✅");
      onBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TBar title="Sobre você" onBack={onBack} />
      <div className="screen">
        <div className="fsec">
          <div className="flabel">Interesses ou Hobbies</div>
          <input className="fbox" placeholder="Ex: Futebol, Música..." value={hobbies} onChange={e => setHobbies(e.target.value)} />
          <div className="flabel">Características/Personalidade</div>
          <select className="fbox" value={personality} onChange={e => setPersonality(e.target.value)} style={{ appearance:"none" }}>
            <option value="">Selecione...</option>
            <option value="Extrovertido">Extrovertido</option>
            <option value="Introvertido">Introvertido</option>
            <option value="Neutro">Neutro</option>
          </select>
          <div className="flabel">Gênero</div>
          <select className="fbox" value={gender} onChange={e => setGender(e.target.value)} style={{ appearance:"none" }}>
            <option value="">Prefiro não informar</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
          </select>
          <div className="flabel">Semestre</div>
          <select className="fbox" value={semester} onChange={e => setSemester(e.target.value)} style={{ appearance:"none" }}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}º semestre</option>)}
          </select>
          <div style={{ marginTop:20 }}>
            <button className="btn-blk" onClick={save} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// TELA: OFERECER CARONA — consome createRide()
// ─────────────────────────────────────────────────────────────
function Offer({ profile, onBack, onSuccess }) {
  const [form, setForm] = useState({ origin:"", destination:"Mackenzie", time:"", seats:"3", price:"", carModel:"" });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState("");
  const s = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const publish = async () => {
    if (!form.origin || !form.time || !form.price) { setErr("Preencha os campos obrigatórios (*)"); return; }
    setSaving(true);
    setErr("");
    try {
      await createRide({
        driverUid:     profile.uid,
        driverName:    profile.name,
        driverRating:  profile.rating || 5,
        origin:        form.origin,
        destination:   form.destination,
        time:          form.time,
        seats:         Number(form.seats),
        price:         Number(form.price),
        carModel:      form.carModel,
        hobbies:       profile.hobbies || "",
        personality:   profile.personality || "",
        gender:        profile.gender || "",
      });
      onSuccess();
    } catch (e) {
      setErr("Erro ao publicar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TBar title="Oferecer Carona" onBack={onBack} />
      <div className="screen">
        <div className="fsec">
          <div className="flabel">Origem *</div>
          <input className="fbox" placeholder="Ex: Zona Leste..." value={form.origin} onChange={e => s("origin", e.target.value)} />
          <div className="flabel">Destino</div>
          <input className="fbox" value={form.destination} onChange={e => s("destination", e.target.value)} />
          <div className="flabel">Horário de Saída *</div>
          <input className="fbox" type="time" value={form.time} onChange={e => s("time", e.target.value)} />
          <div className="flabel">Vagas</div>
          <select className="fbox" value={form.seats} onChange={e => s("seats", e.target.value)} style={{ appearance:"none" }}>
            {[1,2,3,4].map(n => <option key={n} value={n}>{n} vaga{n>1?"s":""}</option>)}
          </select>
          <div className="flabel">Valor por passageiro (R$) *</div>
          <input className="fbox" type="number" placeholder="10" value={form.price} onChange={e => s("price", e.target.value)} />
          <div className="flabel">Modelo do carro</div>
          <input className="fbox" placeholder="Ex: Honda Civic 2020" value={form.carModel} onChange={e => s("carModel", e.target.value)} />
          {err && <div className="err-txt" style={{ marginTop:12 }}>{err}</div>}
          <div style={{ marginTop:20 }}>
            <button className="btn-blk" onClick={publish} disabled={saving}>
              {saving ? "Publicando..." : "Publicar Carona"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// ROOT APP — gerencia auth state e roteamento
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = carregando
  const [profile, setProfile]           = useState(null);
  const [page, setPage]                 = useState("home");
  const [selectedRide, setSelectedRide] = useState(null);
  const [rides, setRides]               = useState([]);
  const [toast, setToast]               = useState("");

  const go = (p) => setPage(p);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // Observa estado de autenticação Firebase
  useEffect(() => {
    const unsub = onAuthChange(async (user) => {
      setFirebaseUser(user);
      if (user) {
        const p = await getUserProfile(user.uid);
        setProfile(p ? { ...p, uid: user.uid, email: user.email } : { uid: user.uid, email: user.email, name: user.email, role: "passenger" });
      } else {
        setProfile(null);
        setPage("home");
      }
    });
    return () => unsub();
  }, []);

  // Observa caronas ativas
  useEffect(() => {
    const unsub = listenRides(data => setRides(data));
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
  };

  // Estado inicial: carregando
  if (firebaseUser === undefined) {
    return (
      <>
        <style>{CSS}</style>
        <div className="phone">
          <SBar />
          <div className="screen" style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Spinner />
          </div>
        </div>
      </>
    );
  }

  const hideNav = ["success","offersuccess"].includes(page);
  const navPage = ["home","rides","chat","settings"].includes(page) ? page :
    page === "detail" ? "rides" :
    ["account","password","about"].includes(page) ? "settings" : "home";

  const renderPage = () => {
    if (!firebaseUser) return <Login />;

    switch (page) {
      case "home":
        return <Home profile={profile} go={go} rideCount={rides.length} />;

      case "rides":
        return <Rides onSelect={r => { setSelectedRide(r); go("detail"); }} />;

      case "detail":
        return selectedRide ? (
          <Detail ride={selectedRide} profile={profile} onBack={() => go("rides")} onConfirm={() => go("success")} />
        ) : null;

      case "success":
        return <Success onBack={() => go("home")} />;

      case "chat":
        return <Chat profile={profile} />;

      case "settings":
        return (
          <Settings go={p => {
            if (p === "logout") { handleLogout(); return; }
            go(p);
          }} />
        );

      case "account":
        return (
          <Account
            profile={profile}
            onBack={() => go("settings")}
            onSave={fields => {
              setProfile(prev => ({ ...prev, ...fields }));
              showToast("Salvo! ✅");
              go("settings");
            }}
          />
        );

      case "password":
        return <Password onBack={() => go("settings")} showToast={showToast} />;

      case "about":
        return (
          <About
            profile={profile}
            onBack={() => go("settings")}
            showToast={showToast}
          />
        );

      case "offer":
        return (
          <Offer
            profile={profile}
            onBack={() => go("home")}
            onSuccess={() => go("offersuccess")}
          />
        );

      case "offersuccess":
        return <Success title="Carona Publicada!" onBack={() => go("home")} />;

      default:
        return null;
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="phone">
        <SBar />
        {renderPage()}
        {firebaseUser && !hideNav && (
          <BNav cur={navPage} go={p => {
            if (p === "home")     go("home");
            else if (p === "chat")     go("chat");
            else if (p === "settings") go("settings");
          }} />
        )}
        <Toast msg={toast} />
      </div>
    </>
  );
}
