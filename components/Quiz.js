import { useState } from 'react';
import { AREAS, PREGUNTAS, KPIS_POR_AREA, KPIS_UNIVERSALES, S } from '../lib/constants';

export default function Quiz({ p, qi, total, info, getResp, getRank, getDet, setResp, setDet_, toggleRank, canAdvance, next, prev }) {
  const area = AREAS.find(a => a.id === info.area) || AREAS[0];
  const progress = (qi / total) * 100;
  const isLast = qi === total - 1;
  if (!p) return null;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "34px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div className="label">{p.bNum} · {p.bloque.toUpperCase()}</div>
        <div className="mono" style={{ fontSize: 10, color: S.g3 }}>{qi + 1} / {total}</div>
      </div>
      <div className="prog" style={{ marginBottom: 32 }}><div className="progf" style={{ width: `${progress}%` }} /></div>

      <div key={qi} className="au">
        <h2 className="display" style={{ fontSize: 24, fontWeight: 300, lineHeight: 1.42, marginBottom: 28, color: S.chalk }}>{p.texto}</h2>

        {p.tipo === "escala" && (
          <>
            <div style={{ display: "flex", gap: 5, marginBottom: p.detalle_label ? 22 : 0 }}>
              {p.opciones.map((l, i) => (
                <button key={i} className={`scl ${getResp(p.id) === i ? "on" : ""}`} onClick={() => setResp(p.id, i)}>
                  <div style={{ fontSize: 17, marginBottom: 4, fontFamily: "monospace" }}>{i + 1}</div>{l}
                </button>
              ))}
            </div>
            {p.detalle_label && getResp(p.id) !== undefined && <DetField label={p.detalle_label} value={getDet(p.id)} onChange={v => setDet_(p.id, v)} />}
          </>
        )}

        {p.tipo === "ranked_detail" && (
          <>
            <div className="mono" style={{ fontSize: 9, color: S.g3, marginBottom: 11 }}>
              ELIGE HASTA {p.max} · EN ORDEN DE PRIORIDAD
              {p.criterio && <span style={{ display: "block", marginTop: 4, fontStyle: "italic", letterSpacing: 0, textTransform: "none" }}>{p.criterio}</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
              {p.opciones.map((op, i) => {
                const cur = getRank(p.id); const pos = cur.indexOf(i); const sel = pos !== -1;
                return (
                  <button key={i} className={`opt ${sel ? "on" : ""}`} onClick={() => toggleRank(p.id, i, p.max)}>
                    {sel ? <div className="rbadge">{pos + 1}</div> : <span className="mono" style={{ fontSize: 11, color: S.g3, minWidth: 22, textAlign: "center" }}>{cur.length < p.max ? "○" : "—"}</span>}
                    <span>{op}</span>
                  </button>
                );
              })}
            </div>
            {p.detalle_label && getRank(p.id).length > 0 && <DetField label={p.detalle_label} value={getDet(p.id)} onChange={v => setDet_(p.id, v)} />}
          </>
        )}

        {p.tipo === "texto_largo" && (
          <textarea className="inp" rows={6} placeholder={p.placeholder} value={getResp(p.id) || ""} onChange={e => setResp(p.id, e.target.value)} />
        )}

        {p.tipo === "kpis_area" && (
          <KpisField areaId={info.area} pid={p.id} max={p.max} criterio={p.criterio} getRank={getRank} toggleRank={toggleRank} getDet={getDet} setDet_={setDet_} />
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 36 }}>
        <button className="btn btn-g" onClick={prev} style={{ visibility: qi === 0 ? "hidden" : "visible" }}>← ANTERIOR</button>
        <button className="btn btn-p" disabled={!canAdvance()} onClick={next}>
          {isLast ? "SIGUIENTE: PERFIL PERSONAL →" : "SIGUIENTE →"}
        </button>
      </div>
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <span className="mono" style={{ fontSize: 9, color: S.g3 }}>{info.nombre} · {area.label} · {info.puesto}</span>
      </div>
    </div>
  );
}

function DetField({ label, value, onChange }) {
  return (
    <div style={{ marginTop: 4 }}>
      <div className="mono" style={{ fontSize: 9, color: S.olive2, marginBottom: 7 }}>DETALLE: {label}</div>
      <textarea className="inp" rows={3} placeholder="Escribe tu comentario..." value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function KpisField({ areaId, pid, max, criterio, getRank, toggleRank, getDet, setDet_ }) {
  const [newKpi, setNewKpi] = useState("");
  const suggested = [...(KPIS_POR_AREA[areaId] || KPIS_POR_AREA.proyectos), ...KPIS_UNIVERSALES];
  const customKpis = (() => { try { return JSON.parse(getDet(pid) || "[]") } catch { return [] } })();
  const saveCustom = (arr) => setDet_(pid, JSON.stringify(arr));
  const addCustom = () => { const v = newKpi.trim(); if (!v) return; saveCustom([...customKpis, v]); setNewKpi(""); };
  const cur = getRank(pid);

  return (
    <div>
      <div className="mono" style={{ fontSize: 9, color: S.g3, marginBottom: 11 }}>
        ELIGE HASTA {max} KPIs EN ORDEN DE PRIORIDAD
        {criterio && <span style={{ display: "block", marginTop: 3, fontStyle: "italic", letterSpacing: 0, textTransform: "none" }}>{criterio}</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
        {suggested.map((kpi, i) => {
          const pos = cur.indexOf(i); const sel = pos !== -1; const isUni = i >= (KPIS_POR_AREA[areaId]?.length || 0);
          return (
            <button key={i} className={`opt ${sel ? "on" : ""}`} onClick={() => toggleRank(pid, i, max)} style={{ opacity: (!sel && cur.length >= max) ? 0.4 : 1 }}>
              {sel ? <div className="rbadge">{pos + 1}</div> : <span className="mono" style={{ fontSize: 10, color: S.g3, minWidth: 22, textAlign: "center" }}>{cur.length < max ? "○" : "—"}</span>}
              <span style={{ flex: 1 }}>{kpi}</span>
              {isUni && <span className="pill" style={{ background: "rgba(255,255,255,.04)", color: S.g3, fontSize: 8 }}>UNIVERSAL</span>}
            </button>
          );
        })}
      </div>
      {customKpis.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div className="mono" style={{ fontSize: 9, color: S.olive2, marginBottom: 8 }}>TUS KPIs PROPIOS</div>
          {customKpis.map((kpi, i) => {
            const idx = 1000 + i; const pos = cur.indexOf(idx); const sel = pos !== -1;
            return (
              <button key={i} className={`opt ${sel ? "on" : ""}`} onClick={() => toggleRank(pid, idx, max)} style={{ marginBottom: 5, opacity: (!sel && cur.length >= max) ? 0.4 : 1 }}>
                {sel ? <div className="rbadge">{pos + 1}</div> : <span className="mono" style={{ fontSize: 10, color: S.g3, minWidth: 22, textAlign: "center" }}>{cur.length < max ? "○" : "—"}</span>}
                <span style={{ flex: 1 }}>{kpi}</span>
                <span className="pill" style={{ background: "rgba(122,140,62,.1)", color: S.olive2, fontSize: 8 }}>PROPIO</span>
              </button>
            );
          })}
        </div>
      )}
      <div style={{ background: S.s2, border: `1px solid ${S.brd}`, borderRadius: S.r, padding: 14 }}>
        <div className="mono" style={{ fontSize: 9, color: S.olive2, marginBottom: 9 }}>+ AGREGAR MI PROPIO KPI</div>
        <div style={{ display: "flex", gap: 7 }}>
          <input className="inp" style={{ minHeight: "auto", fontSize: 13, flex: 1 }}
            placeholder="Ej: % de escrituras entregadas en plazo..."
            value={newKpi}
            onChange={e => setNewKpi(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} />
          <button className="btn btn-p" style={{ padding: "10px 16px", flexShrink: 0 }} disabled={!newKpi.trim()} onClick={addCustom}>+ AGREGAR</button>
        </div>
      </div>
    </div>
  );
}
