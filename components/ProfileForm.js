import { useState } from 'react';
import { RELACIONES, TIPOS_SANGRE, TALLAS, S } from '../lib/constants';

const STEPS = [
  { title: "Para conocerte mejor", sub: "Estos datos nos ayudan a cuidar los detalles que importan", icon: "👤" },
  { title: "Tu familia", sub: "Para que podamos celebrar y acompañar lo que importa", icon: "👨‍👩‍👧‍👦" },
  { title: "Si algo pasa, ¿a quién llamamos?", sub: "Contactos de emergencia — esperamos nunca necesitarlos", icon: "🆘" },
  { title: "Tus gustos y lo que debemos saber", sub: "Para eventos, regalos y cuidar tu bienestar", icon: "🎯" },
];

export default function ProfileForm({ info, setInfo, onFinish, onBack, step, setStep }) {
  const s = STEPS[step];

  const addHijo = () => setInfo(p => ({ ...p, hijos: [...p.hijos, { nombre: "", cumpleanos: "" }] }));
  const updateHijo = (i, k, v) => setInfo(p => ({ ...p, hijos: p.hijos.map((h, j) => j === i ? { ...h, [k]: v } : h) }));
  const removeHijo = (i) => setInfo(p => ({ ...p, hijos: p.hijos.filter((_, j) => j !== i) }));

  return (
    <div className="au" style={{ maxWidth: 700, margin: "0 auto", padding: "40px 20px" }}>
      {/* Progress bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? S.olive : "rgba(255,255,255,.06)", transition: "background .3s" }} />
        ))}
      </div>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <span style={{ fontSize: 28, marginRight: 10 }}>{s.icon}</span>
        <h2 style={{ display: "inline", fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 300, color: S.olive2 }}>{s.title}</h2>
        <p style={{ fontSize: 13, color: S.g3, marginTop: 6, marginBottom: 6, lineHeight: 1.5 }}>{s.sub}</p>
        <p className="nudge" style={{ color: S.olive2, fontStyle: "normal" }}>Todo es opcional — llena lo que quieras, siempre puedes completar después</p>
      </div>

      {/* ═══ PASO 1: Datos personales ═══ */}
      {step === 0 && (
        <div className="card card-hi" style={{ padding: 26 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div className="field-lbl">DIRECCIÓN PERSONAL</div>
              <input className="inp" placeholder="Ej: Av. Revolución 456, Col. Roma, CDMX 06700" value={info.direccion} onChange={e => setInfo(p => ({ ...p, direccion: e.target.value }))} />
              <div className="nudge">Tu dirección de casa</div>
            </div>
            <div>
              <div className="field-lbl">TELÉFONO PERSONAL</div>
              <input className="inp" placeholder="Ej: 55 1234 5678" value={info.telefono_personal} onChange={e => setInfo(p => ({ ...p, telefono_personal: e.target.value }))} />
              <div className="nudge">El que siempre cargas, no el de oficina</div>
            </div>
            <div>
              <div className="field-lbl">EMAIL PERSONAL</div>
              <input className="inp" type="email" placeholder="Ej: ana.lopez@gmail.com" value={info.email_personal} onChange={e => setInfo(p => ({ ...p, email_personal: e.target.value }))} />
              <div className="nudge">No el de Aliah — por si necesitamos contactarte fuera</div>
            </div>
            <div>
              <div className="field-lbl">CUMPLEAÑOS</div>
              <input type="date" className="date-inp" value={info.cumpleanos || ""} onChange={e => setInfo(p => ({ ...p, cumpleanos: e.target.value }))} />
              <div className="nudge">Para que no se nos pase felicitarte 🎂</div>
            </div>
            <div>
              <div className="field-lbl">TALLA DE CAMISA / PLAYERA</div>
              <div style={{ display: "flex", gap: 5 }}>
                {TALLAS.map(t => (
                  <button key={t} className={`scl ${info.talla_camisa === t ? "on" : ""}`} onClick={() => setInfo(p => ({ ...p, talla_camisa: t }))} style={{ flex: 1, padding: "10px 6px" }}>{t}</button>
                ))}
              </div>
              <div className="nudge">Para playeras de eventos y uniformes</div>
            </div>
            <div>
              <div className="field-lbl">TIPO DE SANGRE</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {TIPOS_SANGRE.map(t => (
                  <button key={t} className={`scl ${info.tipo_sangre === t ? "on" : ""}`} onClick={() => setInfo(p => ({ ...p, tipo_sangre: t }))} style={{ flex: "1 0 22%", padding: "9px 4px" }}>{t}</button>
                ))}
              </div>
              <div className="nudge">Si no lo sabes, déjalo en O+ y actualízalo después</div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PASO 2: Familia ═══ */}
      {step === 1 && (
        <div className="card card-hi" style={{ padding: 26 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <div className="field-lbl">PAREJA</div>
              <input className="inp" placeholder="Ej: Carlos Mendoza" value={info.conyuge} onChange={e => setInfo(p => ({ ...p, conyuge: e.target.value }))} />
              <div className="nudge">Si no aplica, déjalo vacío — no pasa nada</div>
            </div>
            <div>
              <div className="field-lbl">CUMPLEAÑOS DE TU PAREJA</div>
              <input type="date" className="date-inp" value={info.cumpleanos_pareja || ""} onChange={e => setInfo(p => ({ ...p, cumpleanos_pareja: e.target.value }))} />
              <div className="nudge">Para tenerlo en cuenta 🎁</div>
            </div>
            <div>
              <div className="field-lbl">ANIVERSARIO</div>
              <input type="date" className="date-inp" value={info.aniversario || ""} onChange={e => setInfo(p => ({ ...p, aniversario: e.target.value }))} />
              <div className="nudge">Para que el equipo lo sepa</div>
            </div>
          </div>

          {/* Hijos */}
          <div style={{ borderTop: `1px solid ${S.brd2}`, paddingTop: 18, marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div className="field-lbl" style={{ marginBottom: 0 }}>HIJOS</div>
              <button className="btn btn-g" style={{ fontSize: 9, padding: "5px 12px" }} onClick={addHijo}>+ AGREGAR HIJO</button>
            </div>
            {info.hijos.map((h, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, marginBottom: 10, padding: 12, background: S.s2, borderRadius: S.r }}>
                <input className="inp" placeholder="Ej: Sofía" value={h.nombre} onChange={e => updateHijo(i, "nombre", e.target.value)} />
                <input type="date" className="date-inp" value={h.cumpleanos || ""} onChange={e => updateHijo(i, "cumpleanos", e.target.value)} />
                <button style={{ background: "none", border: "none", color: S.red, cursor: "pointer", fontSize: 16, padding: "0 4px" }} onClick={() => removeHijo(i)}>✕</button>
              </div>
            ))}
            {info.hijos.length === 0 && <div className="nudge">Si tienes hijos, agrégalos aquí con nombre y fecha de nacimiento</div>}
          </div>

          {/* Padres y otros */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div className="field-lbl">PADRES</div>
              <input className="inp" placeholder="Ej: Roberto López y María García" value={info.padres} onChange={e => setInfo(p => ({ ...p, padres: e.target.value }))} />
              <div className="nudge">Importante para tu contacto familiar</div>
            </div>
            <div>
              <div className="field-lbl">OTROS FAMILIARES RELEVANTES</div>
              <input className="inp" placeholder="Ej: Hermano mayor: Pedro, vive en Guadalajara" value={info.otros_familiares} onChange={e => setInfo(p => ({ ...p, otros_familiares: e.target.value }))} />
              <div className="nudge">Alguien cercano que debamos conocer</div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PASO 3: Contactos de emergencia ═══ */}
      {step === 2 && (
        <div className="card card-hi" style={{ padding: 26 }}>
          {[1, 2].map(n => {
            const pre = `contacto_emergencia_${n}`;
            return (
              <div key={n} style={{ marginBottom: n === 1 ? 24 : 0, paddingBottom: n === 1 ? 24 : 0, borderBottom: n === 1 ? `1px solid ${S.brd2}` : "none" }}>
                <div className="field-lbl" style={{ color: S.olive2, fontSize: 10, marginBottom: 14 }}>CONTACTO DE EMERGENCIA {n}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div className="field-lbl">NOMBRE</div>
                    <input className="inp" placeholder={n === 1 ? "Ej: María García (mamá)" : "Ej: Pedro López (hermano)"} value={info[`${pre}_nombre`]} onChange={e => setInfo(p => ({ ...p, [`${pre}_nombre`]: e.target.value }))} />
                  </div>
                  <div>
                    <div className="field-lbl">TELÉFONO</div>
                    <input className="inp" placeholder={n === 1 ? "Ej: 55 9876 5432" : "Ej: 33 1234 5678"} value={info[`${pre}_tel`]} onChange={e => setInfo(p => ({ ...p, [`${pre}_tel`]: e.target.value }))} />
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <div className="field-lbl">RELACIÓN</div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {RELACIONES.map(r => (
                      <button key={r} className={`scl ${info[`${pre}_relacion`] === r ? "on" : ""}`} onClick={() => setInfo(p => ({ ...p, [`${pre}_relacion`]: r }))} style={{ flex: "0 0 auto", padding: "8px 14px" }}>{r}</button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ PASO 4: Gustos y salud ═══ */}
      {step === 3 && (
        <div className="card card-hi" style={{ padding: 26 }}>
          <div style={{ marginBottom: 20 }}>
            <div className="field-lbl">HOBBIES Y GUSTOS</div>
            <textarea className="inp" rows={3} placeholder="Ej: Correr, cocinar, ver series de true crime, jugar FIFA, leer ciencia ficción" value={info.hobbies} onChange={e => setInfo(p => ({ ...p, hobbies: e.target.value }))} />
            <div className="nudge">Lo que te apasiona fuera del trabajo</div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div className="field-lbl">PREFERENCIAS GENERALES</div>
            <textarea className="inp" rows={3} placeholder="Ej: Me gusta el café americano, prefiero comida italiana, me encanta la música de los 80s, fan de los Pumas" value={info.preferencias_generales} onChange={e => setInfo(p => ({ ...p, preferencias_generales: e.target.value }))} />
            <div className="nudge">Comida, música, deportes, lo que quieras compartir</div>
          </div>
          <div>
            <div className="field-lbl">ALERGIAS, RESTRICCIONES Y MEDICAMENTOS</div>
            <textarea className="inp" rows={3} placeholder='Ej: Alérgico al camarón, no como cerdo, tomo losartán para la presión. Si no tienes nada, escribe "Sin restricciones"' value={info.alergias_restricciones} onChange={e => setInfo(p => ({ ...p, alergias_restricciones: e.target.value }))} />
            <div className="nudge">Alergias alimentarias, medicamentos, restricciones de dieta — todo en uno. Si no tienes, pon &quot;Sin restricciones&quot;</div>
          </div>
        </div>
      )}

      {/* ═══ Navegación ═══ */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <button className="btn btn-g" onClick={step === 0 ? onBack : () => setStep(step - 1)}>
          ← {step === 0 ? "VOLVER AL QUIZ" : "ANTERIOR"}
        </button>
        {step < 3 ? (
          <button className="btn btn-p" onClick={() => setStep(step + 1)}>SIGUIENTE →</button>
        ) : (
          <button className="btn btn-p" style={{ padding: "12px 28px", fontSize: 12 }} onClick={onFinish}>FINALIZAR Y ENVIAR ✓</button>
        )}
      </div>
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <span className="mono" style={{ fontSize: 9, color: S.g3 }}>PERFIL · PASO {step + 1} DE 4</span>
      </div>
    </div>
  );
}
