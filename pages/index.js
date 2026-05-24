import Head from 'next/head';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { STORAGE_KEY, AUTH_KEY, PREGUNTAS, EMPTY_INFO, S, AI_SYSTEM } from '../lib/constants';
import { loginUser, saveToSupabase, loadFromSupabase, subscribeRealtime, filterByRole, buildProfileText, callAI } from '../lib/helpers';
import Login from '../components/Login';
import Inicio from '../components/Inicio';
import Quiz from '../components/Quiz';
import ProfileForm from '../components/ProfileForm';
import Dash from '../components/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [fase, setFase] = useState("inicio");
  const [info, setInfo] = useState({ ...EMPTY_INFO });
  const [resps, setResps] = useState({});
  const [ranked, setRanked] = useState({});
  const [detalles, setDet] = useState({});
  const [qi, setQi] = useState(0);
  const [all, setAll] = useState([]);
  const [dtab, setDtab] = useState("resumen");
  const [gtab, setGtab] = useState("manual");
  const [gout, setGout] = useState({});
  const [gload, setGload] = useState(false);
  const [gerr, setGerr] = useState({});
  const [profileStep, setProfileStep] = useState(0);

  // Check auth on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch {}
    setAuthLoading(false);
  }, []);

  // Load data from Supabase
  useEffect(() => {
    if (!user) return;
    (async () => {
      const sbData = await loadFromSupabase();
      if (sbData && sbData.length > 0) {
        setAll(sbData);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sbData)); } catch {}
      } else {
        try { const s = localStorage.getItem(STORAGE_KEY); if (s) setAll(JSON.parse(s)); } catch {}
      }
    })();
    const channel = subscribeRealtime((newRow) => {
      setAll(prev => {
        const exists = prev.some(r => r.id === newRow.id);
        if (exists) return prev;
        const updated = [...prev, newRow];
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
        return updated;
      });
    });
    return () => { if (channel) supabase?.removeChannel(channel); };
  }, [user]);

  const saveAll = u => { setAll(u); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)) } catch {} };

  // Auth
  const handleLogin = async (email, password) => {
    const u = await loginUser(email, password);
    if (u) {
      setUser(u);
      try { localStorage.setItem(AUTH_KEY, JSON.stringify(u)); } catch {}
    }
    return u;
  };

  const handleLogout = () => {
    setUser(null);
    try { localStorage.removeItem(AUTH_KEY); } catch {}
    setFase("inicio");
  };

  // Role-based filtering
  const filteredAll = filterByRole(all, user);
  const canSeePersonal = user?.rol === 'ceo';
  const canSeeDashboard = user?.rol === 'ceo' || user?.rol === 'director';
  const canManageUsers = user?.rol === 'ceo';

  // Quiz logic
  const p = PREGUNTAS[qi];
  const total = PREGUNTAS.length;
  const getRank = id => ranked[id] || [];
  const getDet = id => detalles[id] || "";
  const getResp = id => resps[id];
  const setRank = (id, arr) => setRanked(prev => ({ ...prev, [id]: arr }));
  const setDet_ = (id, v) => setDet(prev => ({ ...prev, [id]: v }));
  const setResp = (id, v) => setResps(prev => ({ ...prev, [id]: v }));
  const toggleRank = (id, idx, max) => {
    const cur = getRank(id);
    if (cur.includes(idx)) setRank(id, cur.filter(x => x !== idx));
    else if (cur.length < max) setRank(id, [...cur, idx]);
  };
  const canAdvance = () => {
    if (!p) return false;
    if (p.tipo === "escala") return getResp(p.id) !== undefined;
    if (p.tipo === "ranked_detail") return getRank(p.id).length > 0;
    return true;
  };
  const next = () => { if (!canAdvance()) return; if (qi < total - 1) setQi(i => i + 1); else setFase("perfil"); };
  const prev = () => { if (qi > 0) setQi(i => i - 1); };

  const resetForm = () => {
    setInfo({ ...EMPTY_INFO });
    setResps({});
    setRanked({});
    setDet({});
    setQi(0);
    setProfileStep(0);
    setFase("inicio");
  };

  const finish = async () => {
    const entry = { ...info, timestamp: Date.now(), respuestas: resps, ranked, detalles, user_id: user?.id };
    const sbResult = await saveToSupabase(entry);
    if (sbResult) {
      saveAll([...all, sbResult]);
    } else {
      saveAll([...all, entry]);
    }
    setFase("done");
  };

  // AI generation
  const generate = async (tipo) => {
    if (gout[tipo]) return;
    setGload(true); setGerr(prev => ({ ...prev, [tipo]: "" }));
    const data = filteredAll;
    const last = data[data.length - 1];
    if (!last) { setGload(false); return; }
    const profileLast = buildProfileText(last);
    const profilesAll = data.map(buildProfileText).join("\n\n---\n\n");
    const n = data.length;
    const prompts = {
      manual: `Con base en el siguiente perfil, genera un Manual de Operaciones para este puesto:\n\n${profileLast}\n\nIncluye: 1.Misión del Puesto 2.Responsabilidades (tabla) 3.Mapa de Interfaces (tabla) 4.Protocolos de Comunicación 5.KPIs (tabla) 6.OKRs Trimestrales 7.Criterios de Escalamiento 8.Brecha Actual vs Ideal 9.Quick Wins`,
      matriz: `Con base en el diagnóstico de ${n} colaboradores, genera la Matriz de Decisiones:\n\n${profilesAll}\n\nIncluye: 1.Principios de Gobernanza 2.Niveles de Autoridad 3.Matriz por Área (tabla) 4.Zonas Grises 5.Protocolo de Escalamiento 6.Reglas de Oro`,
      kpis: `Con base en el diagnóstico de ${n} colaboradores, genera el Sistema de KPIs:\n\n${profilesAll}\n\nIncluye: 1.KPIs Corporativos (tabla) 2.KPIs por Área (tabla) 3.KPIs de Coordinación 4.OKRs Empresa 5.OKRs Áreas Críticas 6.Cadencia de Revisión`,
      organigrama: `Con base en el diagnóstico de ${n} colaboradores, genera la Estructura Organizacional:\n\n${profilesAll}\n\nIncluye: 1.Estructura Jerárquica 2.Posiciones Clave (tabla) 3.Flujos Críticos 4.Comités/Reuniones (tabla) 5.Matriz RACI 6.Plan 90 días`,
      mejoras: `Con base en el diagnóstico de ${n} colaboradores, genera el Plan de Mejoras:\n\n${profilesAll}\n\nIncluye: 1.Diagnóstico Ejecutivo 2.Brechas por Área 3.Iniciativas Prioritarias (tabla) 4.Quick Wins 5.Cambios Críticos 6.Roadmap 6 meses 7.Indicadores de Éxito`,
      comparativo: `Con base en el diagnóstico de ${n} colaboradores, genera el Análisis Comparativo:\n\n${profilesAll}\n\nIncluye: 1.Brechas por Colaborador 2.Patrones Comunes 3.Mapa de Dependencias 4.Coherencia de Flujos 5.Recomendaciones de Rediseño`,
    };
    try {
      const result = await callAI(AI_SYSTEM, prompts[tipo] || "", 2200);
      setGout(prev => ({ ...prev, [tipo]: result }));
    } catch (e) { setGerr(prev => ({ ...prev, [tipo]: "Error: " + e.message })); }
    setGload(false);
  };

  // ═══ CSS ═══
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{background:${S.bg};color:${S.chalk};font-family:'DM Sans',sans-serif}
    ::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-thumb{background:${S.oliveDim};border-radius:2px}
    .display{font-family:'Cormorant Garamond',Georgia,serif}
    .mono{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:${S.g2}}
    .label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:${S.g2}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    .au{animation:fadeUp .3s ease}
    .btn{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.09em;border:none;border-radius:${S.r};cursor:pointer;transition:all .15s;text-transform:uppercase}
    .btn-p{background:${S.olive};color:${S.chalk};font-weight:500;padding:10px 20px}
    .btn-p:hover:not(:disabled){background:${S.olive2};transform:translateY(-1px)}.btn-p:disabled{opacity:.3;cursor:not-allowed}
    .btn-g{background:transparent;color:${S.g2};border:1px solid ${S.brd2};padding:10px 16px}
    .btn-g:hover{color:${S.chalk};border-color:${S.brd}}
    .card{background:${S.s1};border:1px solid ${S.brd2};border-radius:10px;padding:22px}
    .card-hi{border-color:${S.brd}}
    textarea.inp,input.inp{width:100%;background:${S.s2};border:1px solid ${S.brd2};color:${S.chalk};border-radius:${S.r};padding:12px;font-size:14px;font-family:'DM Sans',sans-serif;resize:vertical;outline:none;transition:border .15s}
    textarea.inp{min-height:80px}textarea.inp:focus,input.inp:focus{border-color:${S.olive}}
    textarea.inp::placeholder,input.inp::placeholder{color:${S.g3}}
    input.iline{width:100%;background:transparent;border:none;border-bottom:1px solid ${S.brd2};color:${S.chalk};padding:10px 0;font-size:17px;font-family:'DM Sans',sans-serif;outline:none}
    input.iline:focus{border-bottom-color:${S.olive}}input.iline::placeholder{color:${S.g3}}
    input.date-inp{background:${S.s2};border:1px solid ${S.brd2};color:${S.chalk};border-radius:${S.r};padding:10px;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;width:100%}
    input.date-inp:focus{border-color:${S.olive}}
    .scl{flex:1;padding:9px 4px;background:${S.s2};border:1px solid ${S.brd2};color:${S.g2};border-radius:${S.r};cursor:pointer;font-size:10px;text-align:center;transition:all .13s;font-family:'DM Sans',sans-serif}
    .scl:hover{border-color:${S.olive};color:${S.chalk}}.scl.on{border-color:${S.olive};background:rgba(122,140,62,.14);color:${S.olive2}}
    .opt{width:100%;background:${S.s2};border:1px solid ${S.brd2};color:${S.chalk};padding:11px 14px;border-radius:${S.r};cursor:pointer;font-size:13px;text-align:left;transition:all .13s;display:flex;align-items:center;gap:10px;font-family:'DM Sans',sans-serif}
    .opt:hover{border-color:${S.olive};background:rgba(122,140,62,.06)}.opt.on{border-color:${S.olive};background:rgba(122,140,62,.1);color:${S.olive2}}
    .rbadge{min-width:22px;height:22px;border-radius:50%;background:${S.olive};color:${S.chalk};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;font-family:'JetBrains Mono',monospace}
    .prog{height:2px;background:rgba(255,255,255,.05);border-radius:2px;overflow:hidden}.progf{height:100%;background:${S.olive};border-radius:2px;transition:width .4s}
    .tabbar{display:flex;background:${S.s1};border:1px solid ${S.brd2};border-radius:8px;padding:3px;gap:2px;flex-wrap:wrap}
    .tabi{padding:8px 12px;border-radius:6px;border:none;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;transition:all .13s}
    .tabi.on{background:${S.olive};color:${S.chalk};font-weight:500}.tabi:not(.on){background:transparent;color:${S.g3}}.tabi:not(.on):hover{color:${S.g2}}
    .pill{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:20px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.06em}
    .spin{width:22px;height:22px;border:2px solid rgba(122,140,62,.2);border-top-color:${S.olive};border-radius:50%;animation:spin .8s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .field-lbl{display:block;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:${S.g3};margin-bottom:7px}
    .field-req{display:block;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:${S.olive2};margin-bottom:7px;font-weight:600}
    .nudge{font-family:'DM Sans',sans-serif;font-size:11px;color:${S.g3};font-style:italic;margin-top:4px;letter-spacing:0;text-transform:none}
    .req-field{border:1.5px solid ${S.olive} !important;background:rgba(122,140,62,.06) !important}
    .req-field::placeholder{color:${S.g2} !important}
    .prose h1{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:400;margin:28px 0 12px;color:${S.chalk}}
    .prose h2{font-family:'Cormorant Garamond',serif;font-size:19px;font-weight:400;margin:22px 0 10px;color:${S.olive2}}
    .prose h3{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.13em;margin:18px 0 8px;text-transform:uppercase;color:${S.olive3}}
    .prose p{font-size:14px;line-height:1.8;color:${S.g1};margin:0 0 11px}.prose ul,.prose ol{padding-left:18px;margin:0 0 11px}
    .prose li{font-size:14px;line-height:1.75;color:${S.g1};margin-bottom:4px}.prose strong{color:${S.chalk};font-weight:500}.prose em{color:${S.olive2};font-style:italic}
    .prose table{width:100%;border-collapse:collapse;margin:16px 0;font-size:13px}
    .prose th{background:rgba(122,140,62,.1);color:${S.olive2};font-family:'JetBrains Mono',monospace;font-size:10px;padding:8px 12px;text-align:left;border:1px solid ${S.brd2}}
    .prose td{padding:8px 12px;border:1px solid ${S.brd2};color:${S.g1};vertical-align:top}
    .prose tr:nth-child(even) td{background:rgba(255,255,255,.02)}.prose code{font-family:'JetBrains Mono',monospace;font-size:12px;background:${S.s3};padding:2px 6px;border-radius:3px}
    .prose blockquote{border-left:2px solid ${S.olive};padding:10px 16px;margin:12px 0;background:rgba(122,140,62,.05);border-radius:0 6px 6px 0}
  `;

  if (authLoading) return <div style={{ minHeight: "100vh", background: S.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><style>{css}</style><div className="spin" /></div>;

  // ═══ HEADER ═══
  const Header = () => (
    <div style={{ borderBottom: `1px solid ${S.brd2}`, padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: S.s1, border: `1px solid ${S.brd}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: S.olive2, fontWeight: 600, fontSize: 14 }}>A</span>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: S.chalk, letterSpacing: ".04em" }}>ALIAH DEVELOPMENTS</div>
          <div className="mono" style={{ fontSize: 8, color: S.g3 }}>
            {fase === "inicio" ? "REGISTRO DE COLABORADOR" : fase === "quiz" ? `DIAGNÓSTICO · PREGUNTA ${qi + 1} / ${total}` : fase === "perfil" ? "PERFIL PERSONAL" : fase === "done" ? "DIAGNÓSTICO COMPLETADO" : "DASHBOARD EJECUTIVO"}
          </div>
        </div>
      </div>
      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: S.chalk }}>{user.nombre}</div>
            <div className="mono" style={{ fontSize: 8, color: S.olive2 }}>{user.rol === 'ceo' ? 'CEO / RRHH' : user.rol === 'director' ? 'DIRECTOR / MANAGER' : 'USUARIO'}</div>
          </div>
          <button className="btn btn-g" style={{ fontSize: 9, padding: "5px 11px" }} onClick={handleLogout}>SALIR</button>
        </div>
      )}
    </div>
  );

  // ═══ DONE SCREEN ═══
  const Done = () => (
    <div className="au" style={{ maxWidth: 480, margin: "0 auto", padding: "100px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 44, marginBottom: 18, color: S.olive2 }}>◎</div>
      <h1 className="display" style={{ fontSize: 38, fontWeight: 300, marginBottom: 12, color: S.chalk }}>Diagnóstico Completado</h1>
      <div style={{ width: 32, height: 1, background: S.olive, margin: "0 auto 18px" }} />
      <p style={{ fontSize: 15, color: S.g1, lineHeight: 1.75, marginBottom: 32 }}>Gracias, <strong style={{ color: S.chalk }}>{info.nombre}</strong>. Tu perfil y diagnóstico fueron registrados exitosamente.</p>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button className="btn btn-p" onClick={() => setFase("dash")}>VER DASHBOARD →</button>
        <button className="btn btn-g" onClick={resetForm}>+ NUEVO COLABORADOR</button>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Diagnóstico Organizacional — Aliah Developments</title>
        <meta name="description" content="Sistema de diagnóstico organizacional para levantamiento de procesos y estructura" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>◈</text></svg>" />
      </Head>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: S.bg }}>
        {!user ? (
          <Login onLogin={handleLogin} />
        ) : (
          <>
            <Header />
            {fase === "inicio" && <Inicio info={info} setInfo={setInfo} n={filteredAll.length} onStart={() => setFase("quiz")} onDash={() => setFase("dash")} canSeeDashboard={canSeeDashboard} />}
            {fase === "quiz" && <Quiz p={p} qi={qi} total={total} info={info} getResp={getResp} getRank={getRank} getDet={getDet} setResp={setResp} setDet_={setDet_} toggleRank={toggleRank} canAdvance={canAdvance} next={next} prev={prev} />}
            {fase === "perfil" && <ProfileForm info={info} setInfo={setInfo} onFinish={finish} onBack={() => { setQi(total - 1); setFase("quiz"); }} step={profileStep} setStep={setProfileStep} />}
            {fase === "done" && <Done />}
            {fase === "dash" && <Dash all={filteredAll} dtab={dtab} setDtab={setDtab} gtab={gtab} setGtab={setGtab} gout={gout} gload={gload} gerr={gerr} onNuevo={resetForm} onClear={() => saveAll([])} generate={generate} user={user} canSeePersonal={canSeePersonal} canManageUsers={canManageUsers} />}
          </>
        )}
      </div>
    </>
  );
}
