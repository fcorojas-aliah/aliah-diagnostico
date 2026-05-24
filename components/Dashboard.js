import { useState } from 'react';
import { AREAS, PREGUNTAS, KPIS_POR_AREA, KPIS_UNIVERSALES, S, AI_SYSTEM } from '../lib/constants';
import { col, lbl, mdToHtml, callAI, buildProfileText, loadUsers, createUser } from '../lib/helpers';

export default function Dash({ all, dtab, setDtab, gtab, setGtab, gout, gload, gerr, onNuevo, onClear, generate, user, canSeePersonal, canManageUsers }) {
  const n = all.length;
  const tabs = [
    { id: "resumen", l: "RESUMEN" },
    { id: "flujos", l: "FLUJOS" },
    { id: "friccion", l: "FRICCIONES" },
    { id: "cuellos", l: "CUELLOS" },
    { id: "equipo", l: "EQUIPO" },
  ];
  if (canSeePersonal) tabs.push({ id: "perfiles", l: "PERFILES" });
  tabs.push({ id: "ia", l: "◈ IA DOCS" });
  if (canManageUsers) tabs.push({ id: "admin", l: "⚙ USUARIOS" });

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="label" style={{ marginBottom: 7 }}>ANÁLISIS ORGANIZACIONAL</div>
          <h1 className="display" style={{ fontSize: 34, fontWeight: 300, color: S.chalk }}>Dashboard <em style={{ color: S.olive2 }}>Ejecutivo</em></h1>
        </div>
        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
          <span className="mono" style={{ fontSize: 10, color: S.g3 }}>{n} participante{n !== 1 ? "s" : ""}</span>
          <button className="btn btn-p" style={{ padding: "8px 16px" }} onClick={onNuevo}>+ PARTICIPANTE</button>
        </div>
      </div>

      <div className="tabbar" style={{ marginBottom: 24 }}>
        {tabs.map(t => <button key={t.id} className={`tabi ${dtab === t.id ? "on" : ""}`} onClick={() => setDtab(t.id)}>{t.l}</button>)}
      </div>

      {dtab === "resumen" && <TabResumen all={all} n={n} />}
      {dtab === "flujos" && <TabFlujos all={all} n={n} />}
      {dtab === "friccion" && <TabFriccion all={all} n={n} />}
      {dtab === "cuellos" && <TabCuellos all={all} n={n} />}
      {dtab === "equipo" && <TabEquipo all={all} canSeePersonal={canSeePersonal} />}
      {dtab === "perfiles" && canSeePersonal && <TabPerfiles all={all} />}
      {dtab === "ia" && <TabIA all={all} n={n} gtab={gtab} setGtab={setGtab} gout={gout} gload={gload} gerr={gerr} generate={generate} />}
      {dtab === "admin" && canManageUsers && <TabAdmin />}

      <div style={{ marginTop: 36, paddingTop: 18, borderTop: `1px solid ${S.brd2}`, display: "flex", justifyContent: "space-between" }}>
        <span className="mono" style={{ fontSize: 9, color: S.g3 }}>DIAGNÓSTICO ORGANIZACIONAL · ALIAH DEVELOPMENTS</span>
        {canManageUsers && <button className="btn btn-g" style={{ fontSize: 9, padding: "5px 11px", color: S.g3 }} onClick={() => { if (confirm("¿Eliminar todos los datos?")) onClear(); }}>LIMPIAR DATOS</button>}
      </div>
    </div>
  );
}

function Empty({ msg = "Aún no hay datos. Agrega participantes para ver el análisis." }) {
  return <div style={{ textAlign: "center", padding: "80px 20px", color: S.g3 }}><div style={{ fontSize: 32, marginBottom: 14 }}>◎</div><p style={{ fontSize: 14, lineHeight: 1.7 }}>{msg}</p></div>;
}

/* ─── TAB RESUMEN ─── */
function TabResumen({ all, n }) {
  const QDIMS = [{ qid: "q1", label: "Claridad de Rol" }, { qid: "q2", label: "Entrega entre Áreas" }, { qid: "q3", label: "Zonas Grises", inv: true }, { qid: "q9", label: "Documentación" }, { qid: "q12", label: "Autonomía de Decisión" }, { qid: "q17", label: "Visibilidad Dirección" }];
  const score = (qid, inv) => {
    if (!n) return 0;
    const p = PREGUNTAS.find(x => x.id === qid); if (!p) return 0;
    const vals = all.map(r => r.respuestas?.[qid]).filter(v => v !== undefined);
    if (!vals.length) return 0;
    const max = (p.opciones?.length || 5) - 1;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length / max;
    return inv ? 1 - avg : avg;
  };
  const scores = QDIMS.map(d => score(d.qid, d.inv));
  const global = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  if (!n) return <Empty />;
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 14, marginBottom: 14 }}>
        <div className="card card-hi" style={{ textAlign: "center", padding: "28px 16px" }}>
          <div className="label" style={{ marginBottom: 10 }}>SCORE GLOBAL</div>
          <div className="display" style={{ fontSize: 52, color: col(global), fontWeight: 300, lineHeight: 1 }}>{Math.round(global * 100)}</div>
          <div className="mono" style={{ fontSize: 9, color: col(global), marginTop: 7 }}>{lbl(global)}</div>
        </div>
        <div className="card" style={{ padding: "18px 20px" }}>
          <div className="label" style={{ marginBottom: 14 }}>PERFIL POR DIMENSIÓN</div>
          {QDIMS.map((d, i) => { const s = scores[i]; return (
            <div key={d.label} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: S.chalk }}>{d.label}</span>
                <span className="mono" style={{ fontSize: 9, color: col(s) }}>{Math.round(s * 100)}%</span>
              </div>
              <div className="prog"><div className="progf" style={{ width: `${s * 100}%`, background: col(s) }} /></div>
            </div>
          ); })}
        </div>
      </div>
      {all.some(r => r.respuestas?.q21) && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="label" style={{ marginBottom: 14 }}>PROPUESTAS DEL EQUIPO</div>
          {all.filter(r => r.respuestas?.q21).map((r, i) => {
            const a = AREAS.find(x => x.id === r.area);
            return <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < all.length - 1 ? `1px solid ${S.brd2}` : "none" }}>
              <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 7 }}>
                <span className="pill" style={{ background: `${a?.color}15`, color: a?.color, border: `1px solid ${a?.color}30` }}>{a?.icon} {a?.label}</span>
                <span className="mono" style={{ fontSize: 9, color: S.g3 }}>{r.puesto}</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: S.g1, fontStyle: "italic" }}>{r.respuestas.q21}</p>
            </div>;
          })}
        </div>
      )}
    </div>
  );
}

/* ─── TAB FLUJOS ─── */
function TabFlujos({ all, n }) {
  if (!n) return <Empty />;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {["q4", "q5"].map(qid => (
        <div key={qid} className="card">
          <div className="label" style={{ marginBottom: 14 }}>{qid === "q4" ? "¿DE QUIÉN DEPENDE CADA ÁREA?" : "¿A QUIÉN LE ENTREGA CADA ÁREA?"}</div>
          {all.map((r, i) => {
            const a = AREAS.find(x => x.id === r.area);
            const deps = (r.ranked?.[qid] || []).map(idx => PREGUNTAS.find(p => p.id === qid)?.opciones?.[idx]).filter(Boolean);
            return <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${S.brd2}` }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
                <span style={{ color: a?.color, fontSize: 13 }}>{a?.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: S.chalk }}>{r.nombre}</span>
                <span className="mono" style={{ fontSize: 9, color: S.g3 }}>{a?.label}</span>
              </div>
              {deps.map((d, j) => <div key={j} style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 3 }}><div className="rbadge" style={{ width: 16, height: 16, fontSize: 9 }}>{j + 1}</div><span style={{ fontSize: 12, color: S.g1 }}>{d}</span></div>)}
            </div>;
          })}
        </div>
      ))}
    </div>
  );
}

/* ─── TAB FRICCIÓN ─── */
function TabFriccion({ all, n }) {
  if (!n) return <Empty />;
  const p7 = PREGUNTAS.find(p => p.id === "q7");
  const counts = {}; AREAS.forEach(a => { counts[a.label] = [0, 0, 0] });
  all.forEach(r => (r.ranked?.q7 || []).forEach((idx, pos) => { const l = p7?.opciones?.[idx]; if (l && counts[l]) counts[l][pos]++; }));
  const sorted = Object.entries(counts).map(([l, arr]) => ({ l, arr, pts: arr[0] * 3 + arr[1] * 2 + arr[2] })).sort((a, b) => b.pts - a.pts).filter(x => x.pts > 0);
  const mx = sorted[0]?.pts || 1;
  return (
    <div className="card">
      <div className="label" style={{ marginBottom: 6 }}>MAPA DE FRICCIONES ENTRE ÁREAS</div>
      <p style={{ fontSize: 12, color: S.g3, marginBottom: 18, lineHeight: 1.5 }}>Ponderado por posición (1°=3pts · 2°=2pts · 3°=1pt)</p>
      {sorted.map(({ l, pts }) => {
        const a = AREAS.find(x => x.label === l);
        return <div key={l} style={{ marginBottom: 13 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 14, color: a?.color || S.chalk }}>{a?.icon} {l}</span>
            <span className="mono" style={{ fontSize: 10, color: S.g1 }}>{pts}pts</span>
          </div>
          <div className="prog" style={{ height: 5 }}><div className="progf" style={{ width: `${pts / mx * 100}%`, background: a?.color || S.olive }} /></div>
        </div>;
      })}
    </div>
  );
}

/* ─── TAB CUELLOS ─── */
function TabCuellos({ all, n }) {
  if (!n) return <Empty />;
  const ranked4pts = (qid) => {
    const p = PREGUNTAS.find(x => x.id === qid); if (!p) return [];
    const cnts = p.opciones.map(() => [0, 0, 0]);
    all.forEach(r => (r.ranked?.[qid] || []).forEach((idx, pos) => { if (cnts[idx]) cnts[idx][pos]++; }));
    return p.opciones.map((l, i) => ({ l, pts: cnts[i][0] * 3 + cnts[i][1] * 2 + cnts[i][2] })).sort((a, b) => b.pts - a.pts).filter(x => x.pts > 0);
  };
  const cuellos = ranked4pts("q10"); const causas = ranked4pts("q14");
  const COLS = [S.red, S.amb, S.olive2, S.blu, S.grn, S.g2];
  const mx1 = cuellos[0]?.pts || 1, mx2 = causas[0]?.pts || 1;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <div className="card">
        <div className="label" style={{ marginBottom: 6 }}>CUELLOS DE BOTELLA</div>
        {cuellos.map(({ l, pts }, i) => <div key={l} style={{ marginBottom: 11 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 13, lineHeight: 1.3, flex: 1, color: S.chalk }}>{l}</span><span className="mono" style={{ fontSize: 9, color: COLS[i % COLS.length] }}>{pts}pts</span></div><div className="prog" style={{ height: 4 }}><div className="progf" style={{ width: `${pts / mx1 * 100}%`, background: COLS[i % COLS.length] }} /></div></div>)}
      </div>
      <div className="card">
        <div className="label" style={{ marginBottom: 6 }}>CAUSAS DE RETRASO</div>
        {causas.map(({ l, pts }, i) => <div key={l} style={{ marginBottom: 11 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 13, lineHeight: 1.3, flex: 1, color: S.chalk }}>{l}</span><span className="mono" style={{ fontSize: 9, color: COLS[i % COLS.length] }}>{pts}pts</span></div><div className="prog" style={{ height: 4 }}><div className="progf" style={{ width: `${pts / mx2 * 100}%`, background: COLS[i % COLS.length] }} /></div></div>)}
      </div>
    </div>
  );
}

/* ─── TAB EQUIPO ─── */
function TabEquipo({ all, canSeePersonal }) {
  const [expanded, setExpanded] = useState(null);
  if (!all.length) return <Empty />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {all.map((r, i) => {
        const a = AREAS.find(x => x.id === r.area); const isOpen = expanded === i;
        return <div key={i} className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", cursor: "pointer" }} onClick={() => setExpanded(isOpen ? null : i)}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${a?.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: a?.color, fontSize: 19 }}>{a?.icon}</span></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span className="display" style={{ fontSize: 18, color: S.chalk }}>{r.nombre}</span>
                  <span className="pill" style={{ background: `${a?.color}15`, color: a?.color, border: `1px solid ${a?.color}30` }}>{a?.label}</span>
                  <span className="mono" style={{ fontSize: 9, color: S.olive2 }}>{r.puesto}</span>
                </div>
              </div>
              <span style={{ color: S.olive2, fontSize: 18, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▾</span>
            </div>
          </div>
          {isOpen && (
            <div style={{ borderTop: `1px solid ${S.brd2}`, padding: "18px 20px" }}>
              {r.rol_descripcion && <div style={{ marginBottom: 16, padding: "10px 12px", background: S.s2, borderRadius: S.r }}><div className="mono" style={{ fontSize: 8, color: S.olive2, marginBottom: 6 }}>DESCRIPCIÓN DEL ROL</div><p style={{ fontSize: 12, color: S.g1, lineHeight: 1.6 }}>{r.rol_descripcion}</p></div>}
              {r.respuestas?.q18 && <div style={{ padding: "9px 11px", background: S.s2, borderRadius: S.r, marginBottom: 8 }}><div className="mono" style={{ fontSize: 8, color: S.amb, marginBottom: 4 }}>CÓMO TRABAJA HOY</div><p style={{ fontSize: 11, color: S.g1, lineHeight: 1.55, fontStyle: "italic" }}>{r.respuestas.q18}</p></div>}
              {r.respuestas?.q19 && <div style={{ padding: "9px 11px", background: S.s2, borderRadius: S.r }}><div className="mono" style={{ fontSize: 8, color: S.grn, marginBottom: 4 }}>CÓMO DEBERÍA SER</div><p style={{ fontSize: 11, color: S.g1, lineHeight: 1.55, fontStyle: "italic" }}>{r.respuestas.q19}</p></div>}
            </div>
          )}
        </div>;
      })}
    </div>
  );
}

/* ─── TAB PERFILES (solo CEO/RRHH) ─── */
function TabPerfiles({ all }) {
  const [expanded, setExpanded] = useState(null);
  if (!all.length) return <Empty msg="No hay perfiles personales registrados aún." />;

  const Field = ({ label, value }) => {
    if (!value) return null;
    return <div style={{ marginBottom: 8 }}><span className="mono" style={{ fontSize: 8, color: S.g3 }}>{label}</span><p style={{ fontSize: 12, color: S.g1, marginTop: 2 }}>{typeof value === 'string' ? value : JSON.stringify(value)}</p></div>;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {all.map((r, i) => {
        const a = AREAS.find(x => x.id === r.area); const isOpen = expanded === i;
        return <div key={i} className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", cursor: "pointer" }} onClick={() => setExpanded(isOpen ? null : i)}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${a?.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: a?.color, fontSize: 19 }}>{a?.icon}</span></div>
              <div style={{ flex: 1 }}>
                <span className="display" style={{ fontSize: 18, color: S.chalk }}>{r.nombre}</span>
                <span className="pill" style={{ background: `${a?.color}15`, color: a?.color, border: `1px solid ${a?.color}30`, marginLeft: 8 }}>{a?.label}</span>
              </div>
              <span style={{ color: S.olive2, fontSize: 18, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▾</span>
            </div>
          </div>
          {isOpen && (
            <div style={{ borderTop: `1px solid ${S.brd2}`, padding: "18px 20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div className="mono" style={{ fontSize: 9, color: S.olive2, marginBottom: 10 }}>DATOS PERSONALES</div>
                  <Field label="DIRECCIÓN" value={r.direccion} />
                  <Field label="TELÉFONO PERSONAL" value={r.telefono_personal} />
                  <Field label="EMAIL PERSONAL" value={r.email_personal} />
                  <Field label="CUMPLEAÑOS" value={r.cumpleanos} />
                  <Field label="TIPO DE SANGRE" value={r.tipo_sangre} />
                  <Field label="TALLA" value={r.talla_camisa} />
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 9, color: S.olive2, marginBottom: 10 }}>FAMILIA</div>
                  <Field label="PAREJA" value={r.conyuge} />
                  <Field label="CUMPLEAÑOS PAREJA" value={r.cumpleanos_pareja} />
                  <Field label="ANIVERSARIO" value={r.aniversario} />
                  {r.hijos && r.hijos.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <span className="mono" style={{ fontSize: 8, color: S.g3 }}>HIJOS</span>
                      {r.hijos.map((h, j) => <p key={j} style={{ fontSize: 12, color: S.g1, marginTop: 2 }}>{h.nombre} {h.cumpleanos ? `— ${h.cumpleanos}` : ""}</p>)}
                    </div>
                  )}
                  <Field label="PADRES" value={r.padres} />
                  <Field label="OTROS FAMILIARES" value={r.otros_familiares} />
                </div>
              </div>
              <div style={{ borderTop: `1px solid ${S.brd2}`, marginTop: 14, paddingTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div className="mono" style={{ fontSize: 9, color: S.olive2, marginBottom: 10 }}>EMERGENCIA</div>
                  {[1, 2].map(n => (
                    <div key={n}>
                      {r[`contacto_emergencia_${n}_nombre`] && (
                        <div style={{ marginBottom: 8, padding: 8, background: S.s2, borderRadius: S.r }}>
                          <p style={{ fontSize: 12, color: S.chalk, fontWeight: 500 }}>{r[`contacto_emergencia_${n}_nombre`]}</p>
                          <p style={{ fontSize: 11, color: S.g1 }}>{r[`contacto_emergencia_${n}_tel`]} · {r[`contacto_emergencia_${n}_relacion`]}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 9, color: S.olive2, marginBottom: 10 }}>GUSTOS Y SALUD</div>
                  <Field label="HOBBIES" value={r.hobbies} />
                  <Field label="PREFERENCIAS" value={r.preferencias_generales} />
                  <Field label="ALERGIAS / RESTRICCIONES" value={r.alergias_restricciones} />
                </div>
              </div>
            </div>
          )}
        </div>;
      })}
    </div>
  );
}

/* ─── TAB IA ─── */
function TabIA({ all, n, gtab, setGtab, gout, gload, gerr, generate }) {
  const docs = [
    { id: "manual", icon: "◈", label: "MANUAL DE OPERACIONES", desc: "Manual personalizado del último colaborador registrado" },
    { id: "matriz", icon: "◉", label: "MATRIZ DE DECISIONES", desc: "Autoridades por nivel, zonas grises y reglas de oro" },
    { id: "kpis", icon: "◎", label: "KPIs & OKRs", desc: "Sistema de métricas por área y empresa" },
    { id: "organigrama", icon: "◐", label: "ORGANIGRAMA & RACI", desc: "Estructura óptima, comités y matriz de responsabilidades" },
    { id: "mejoras", icon: "◑", label: "PLAN DE MEJORAS", desc: "Diagnóstico ejecutivo, quick wins y roadmap 6 meses" },
    { id: "comparativo", icon: "◒", label: "BRECHA HOY vs. IDEAL", desc: "Análisis cruzado de cómo trabajan vs cómo deberían" },
  ];
  const handleSelect = (id) => { setGtab(id); if (!gout[id]) generate(id); };
  if (!n) return <Empty msg="Agrega al menos 1 participante para generar documentos." />;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "230px 1fr", gap: 14, minHeight: 520 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {docs.map(d => (
          <button key={d.id} onClick={() => handleSelect(d.id)} style={{
            background: gtab === d.id ? S.s2 : "transparent",
            border: `1px solid ${gtab === d.id ? S.brd : "transparent"}`,
            borderRadius: S.r, padding: "11px 13px", cursor: "pointer", textAlign: "left", transition: "all .15s"
          }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
              <span style={{ color: gtab === d.id ? S.olive2 : S.g3, fontSize: 14 }}>{d.icon}</span>
              <span className="mono" style={{ fontSize: 9, color: gtab === d.id ? S.olive2 : S.g3 }}>{d.label}</span>
            </div>
            {gtab === d.id && <p style={{ fontSize: 11, color: S.g3, lineHeight: 1.4, marginLeft: 22 }}>{d.desc}</p>}
            {gout[d.id] && <span className="mono" style={{ fontSize: 8, color: S.grn, marginLeft: 22 }}>✓ GENERADO</span>}
          </button>
        ))}
      </div>
      <div className="card card-hi" style={{ padding: "22px 24px", maxHeight: "72vh", overflowY: "auto" }}>
        {gload && !gout[gtab] ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 14 }}>
            <div className="spin" /><p className="mono" style={{ fontSize: 10, color: S.g3 }}>GENERANDO DOCUMENTO...</p>
            <p style={{ fontSize: 12, color: S.g3 }}>Analizando {n} respuesta{n !== 1 ? "s" : ""}...</p>
          </div>
        ) : gerr[gtab] ? (
          <div style={{ padding: 20, textAlign: "center" }}>
            <div style={{ color: S.red, fontSize: 13, marginBottom: 12 }}>{gerr[gtab]}</div>
            <button className="btn btn-p" onClick={() => generate(gtab)}>REINTENTAR</button>
          </div>
        ) : gout[gtab] ? (
          <div className="prose" dangerouslySetInnerHTML={{ __html: mdToHtml(gout[gtab]) }} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
            <span style={{ fontSize: 32, color: S.g3 }}>◎</span>
            <p className="mono" style={{ fontSize: 10, color: S.g3 }}>SELECCIONA UN DOCUMENTO PARA GENERAR</p>
            <button className="btn btn-p" style={{ marginTop: 8 }} onClick={() => generate(gtab)}>GENERAR AHORA</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── TAB ADMIN (solo CEO) ─── */
function TabAdmin() {
  const [users, setUsers] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", password_hash: "", nombre: "", rol: "usuario", areas: "" });
  const [msg, setMsg] = useState("");

  const load = async () => { const u = await loadUsers(); setUsers(u); setLoaded(true); };
  if (!loaded) { load(); return <div style={{ textAlign: "center", padding: 40 }}><div className="spin" style={{ margin: "0 auto" }} /></div>; }

  const handleCreate = async () => {
    if (!newUser.email || !newUser.password_hash || !newUser.nombre) { setMsg("Completa email, contraseña y nombre"); return; }
    const areasArr = newUser.areas.split(",").map(a => a.trim()).filter(Boolean);
    const result = await createUser({ ...newUser, areas: areasArr.length > 0 ? areasArr : null });
    if (result) {
      setMsg("✅ Usuario creado");
      setNewUser({ email: "", password_hash: "", nombre: "", rol: "usuario", areas: "" });
      load();
    } else { setMsg("Error al crear usuario"); }
  };

  const rolLabel = (r) => r === 'ceo' ? 'CEO / RRHH' : r === 'director' ? 'DIRECTOR' : 'USUARIO';

  return (
    <div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="label" style={{ marginBottom: 14 }}>USUARIOS REGISTRADOS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {users.map(u => (
            <div key={u.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 14px", background: S.s2, borderRadius: S.r }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 14, color: S.chalk, fontWeight: 500 }}>{u.nombre}</span>
                <span className="mono" style={{ fontSize: 9, color: S.g3, marginLeft: 10 }}>{u.email}</span>
              </div>
              <span className="pill" style={{
                background: u.rol === 'ceo' ? "rgba(200,169,100,.15)" : u.rol === 'director' ? "rgba(122,140,62,.15)" : "rgba(255,255,255,.05)",
                color: u.rol === 'ceo' ? "#C8A964" : u.rol === 'director' ? S.olive2 : S.g2,
                border: `1px solid ${u.rol === 'ceo' ? "#C8A96430" : u.rol === 'director' ? S.brd : S.brd2}`
              }}>{rolLabel(u.rol)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card card-hi">
        <div className="label" style={{ marginBottom: 14 }}>CREAR NUEVO USUARIO</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div className="field-lbl">NOMBRE</div>
            <input className="inp" placeholder="Ej: María González" value={newUser.nombre} onChange={e => setNewUser(p => ({ ...p, nombre: e.target.value }))} />
          </div>
          <div>
            <div className="field-lbl">EMAIL</div>
            <input className="inp" placeholder="Ej: maria@aliah.mx" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div>
            <div className="field-lbl">CONTRASEÑA</div>
            <input className="inp" placeholder="Contraseña inicial" value={newUser.password_hash} onChange={e => setNewUser(p => ({ ...p, password_hash: e.target.value }))} />
          </div>
          <div>
            <div className="field-lbl">ROL</div>
            <div style={{ display: "flex", gap: 5 }}>
              {["ceo", "director", "usuario"].map(r => (
                <button key={r} className={`scl ${newUser.rol === r ? "on" : ""}`} onClick={() => setNewUser(p => ({ ...p, rol: r }))} style={{ flex: 1, padding: "10px 6px" }}>
                  {rolLabel(r)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <div className="field-lbl">ÁREAS (separadas por coma)</div>
            <input className="inp" placeholder="Ej: ventas,marketing,titulacion" value={newUser.areas} onChange={e => setNewUser(p => ({ ...p, areas: e.target.value }))} />
            <div className="nudge">IDs de área: direccion, proyectos, legal, finanzas, cxp, cxc, costos, compras, obra, operaciones, ti, ventas, comercializacion, marketing, titulacion, administracion</div>
          </div>
        </div>
        {msg && <div style={{ marginTop: 12, fontSize: 13, color: msg.startsWith("✅") ? S.grn : S.red }}>{msg}</div>}
        <button className="btn btn-p" style={{ marginTop: 14, padding: "10px 24px" }} onClick={handleCreate}>CREAR USUARIO</button>
      </div>
    </div>
  );
}
