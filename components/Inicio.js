import { AREAS, UBICACIONES, S } from '../lib/constants';

export default function Inicio({ info, setInfo, n, onStart, onDash, canSeeDashboard }) {
  const ok = info.nombre.trim().length > 1 && info.area && info.puesto.trim().length > 1;

  return (
    <div className="au" style={{ maxWidth: 700, margin: "0 auto", padding: "52px 20px" }}>
      <div style={{ marginBottom: 40 }}>
        <div className="label" style={{ marginBottom: 14 }}>DIAGNÓSTICO ORGANIZACIONAL · EMPRESA DE DESARROLLO INMOBILIARIO</div>
        <h1 className="display" style={{ fontSize: 42, fontWeight: 300, lineHeight: 1.1, marginBottom: 16, color: S.chalk }}>
          Levantamiento de<br /><em style={{ color: S.olive2 }}>Procesos y Estructura</em>
        </h1>
        <div style={{ width: 40, height: 1.5, background: S.olive, marginBottom: 18 }} />
        <p style={{ fontSize: 15, lineHeight: 1.75, color: S.g1 }}>
          Diagnóstico personal y organizacional. Tu perfil detallado permite generar manuales de operación, matrices de decisión y planes de mejora con IA.
        </p>
        <p style={{ fontSize: 13, color: S.olive2, marginTop: 8 }}>La mayoría del equipo lo completa en ~18 minutos</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 32 }}>
        {[["23", "Preguntas"], ["~18", "Minutos"], ["9", "Bloques"], [String(n), "Completados"]].map(([v, l]) => (
          <div key={l} className="card" style={{ textAlign: "center", padding: "14px 8px" }}>
            <div className="display" style={{ fontSize: 26, color: S.olive2, fontWeight: 300 }}>{v}</div>
            <div className="mono" style={{ fontSize: 9, color: S.g3, marginTop: 3, letterSpacing: ".08em" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* ═══ BLOQUE 1 — OBLIGATORIO — CONTRASTE FUERTE ═══ */}
      <div className="card" style={{ padding: 26, marginBottom: 14, border: `2px solid ${S.olive}`, background: "rgba(122,140,62,.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div className="field-req" style={{ fontSize: 11, marginBottom: 0 }}>① EMPIEZA AQUÍ — DATOS OBLIGATORIOS</div>
          <div className="pill" style={{ background: "rgba(122,140,62,.15)", color: S.olive2, border: `1px solid ${S.olive}` }}>3 campos</div>
        </div>

        {/* Nombre */}
        <div style={{ marginBottom: 24 }}>
          <div className="field-req">NOMBRE COMPLETO <span style={{ color: S.red }}>*</span></div>
          <input
            className="iline req-field"
            style={{ fontSize: 19, borderBottomWidth: 2, borderBottomColor: info.nombre ? S.olive : S.olive2 }}
            placeholder="Ej: Ana López García"
            value={info.nombre}
            onChange={e => setInfo(p => ({ ...p, nombre: e.target.value }))}
          />
          <div className="nudge">Escribe tu nombre como quieres que aparezca en reportes</div>
        </div>

        {/* Área */}
        <div style={{ marginBottom: 24 }}>
          <div className="field-req">ÁREA <span style={{ color: S.red }}>*</span></div>
          <div className="nudge" style={{ marginBottom: 10, marginTop: 0 }}>Selecciona el área donde trabajas actualmente</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {AREAS.map(a => (
              <div key={a.id} onClick={() => setInfo(p => ({ ...p, area: a.id }))} style={{
                padding: "12px 15px", borderRadius: S.r, cursor: "pointer",
                background: info.area === a.id ? `${a.color}22` : S.s2,
                border: `2px solid ${info.area === a.id ? a.color : "rgba(122,140,62,.15)"}`,
                display: "flex", alignItems: "center", gap: 9, transition: "all .13s"
              }}>
                <span style={{ fontSize: 15, color: info.area === a.id ? a.color : S.g3 }}>{a.icon}</span>
                <span style={{ fontSize: 14, color: info.area === a.id ? a.color : S.chalk, flex: 1, fontWeight: info.area === a.id ? 500 : 400 }}>{a.label}</span>
                {info.area === a.id && <span style={{ color: a.color, fontSize: 16 }}>✓</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Puesto */}
        <div>
          <div className="field-req">TÍTULO DEL PUESTO <span style={{ color: S.red }}>*</span></div>
          <input
            className="inp req-field"
            style={{ minHeight: "auto", fontSize: 15 }}
            placeholder="Ej: Coordinadora de Cobranza, Gerente de Proyectos..."
            value={info.puesto}
            onChange={e => setInfo(p => ({ ...p, puesto: e.target.value }))}
          />
          <div className="nudge">Tu título oficial o cómo describes tu puesto</div>
        </div>
      </div>

      {/* ═══ BLOQUE 2 — OPCIONAL — MENOS CONTRASTE ═══ */}
      <div className="card" style={{ padding: 26, marginBottom: 14, opacity: ok ? 1 : 0.5, transition: "opacity .3s" }}>
        <div className="label" style={{ marginBottom: 20 }}>② CONTEXTO ADICIONAL <span style={{ color: S.g3, fontWeight: 300 }}>— opcional pero útil</span></div>

        <div style={{ marginBottom: 20 }}>
          <div className="field-lbl">UBICACIÓN DE TRABAJO</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 6 }}>
            {UBICACIONES.map(u => (
              <div key={u.id} onClick={() => setInfo(p => ({ ...p, ubicacion: u.id }))} style={{
                padding: "10px 13px", borderRadius: S.r, cursor: "pointer",
                background: info.ubicacion === u.id ? "rgba(122,140,62,.12)" : S.s2,
                border: `1px solid ${info.ubicacion === u.id ? S.olive : S.brd2}`,
                display: "flex", alignItems: "center", gap: 9, transition: "all .13s"
              }}>
                <span style={{ fontSize: 14 }}>{u.icon}</span>
                <span style={{ fontSize: 12, color: info.ubicacion === u.id ? S.olive2 : S.g1 }}>{u.label}</span>
              </div>
            ))}
          </div>
          {info.ubicacion === "otro" && (
            <input className="inp" style={{ minHeight: "auto", marginTop: 8 }}
              placeholder="Ej: Oficina León, Obra Querétaro..."
              value={info.ubicacion_custom}
              onChange={e => setInfo(p => ({ ...p, ubicacion_custom: e.target.value }))} />
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="field-lbl">FECHA DE INGRESO EN ALIAH</label>
          <input type="date" className="date-inp" value={info.fecha_ingreso || ""} onChange={e => setInfo(p => ({ ...p, fecha_ingreso: e.target.value }))} />
          <div className="nudge">¿Cuándo llegaste a Aliah?</div>
        </div>

        <div>
          <div className="field-lbl">DESCRIBE TU ROL CON TUS PROPIAS PALABRAS</div>
          <textarea className="inp" rows={4}
            placeholder="Ej: Coordino la cobranza de 3 desarrollos, doy seguimiento a cartera vencida y reporto a Dirección Financiera"
            value={info.rol_descripcion}
            onChange={e => setInfo(p => ({ ...p, rol_descripcion: e.target.value }))} />
          <div className="nudge">Describe qué haces, qué decisiones tomas, con quién interactúas</div>
        </div>
      </div>

      {/* ═══ BOTONES ═══ */}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button className="btn btn-p" style={{ flex: 1, padding: 16, fontSize: 13 }} disabled={!ok} onClick={onStart}>
          {ok ? "INICIAR DIAGNÓSTICO →" : "COMPLETA LOS 3 CAMPOS DE ARRIBA ↑"}
        </button>
        {canSeeDashboard && n > 0 && (
          <button className="btn btn-g" onClick={onDash} style={{ padding: 14 }}>DASHBOARD ({n})</button>
        )}
      </div>
      {!ok && (
        <div style={{
          background: "rgba(122,140,62,.08)", border: `1px solid ${S.olive}`,
          borderRadius: S.r, padding: "12px 16px", marginTop: 12, textAlign: "center"
        }}>
          <span style={{ fontSize: 13, color: S.olive2, fontWeight: 500 }}>👆 Completa nombre, área y puesto para continuar</span>
        </div>
      )}
    </div>
  );
}
