import { useState, useEffect } from 'react';
import { AREAS, S, ROLES } from '../lib/constants';
import { validateInviteLink, registerWithInvite } from '../lib/helpers';

// ─── LOGO SVG (versión blanca para fondo oscuro) ───
const LogoAliah = ({ size = 140 }) => (
  <svg viewBox="0 0 400 480" width={size} height={size * 1.2} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* "A" con hoja */}
    <path d="M200 20 L310 340 L270 340 L245 265 L155 265 L130 340 L90 340 Z M180 230 L220 230 L200 165 Z" fill={S.chalk} />
    <path d="M120 310 Q90 340 95 370 Q100 400 130 395 Q155 390 160 360 Q165 330 140 310 Q130 300 120 310 Z" fill={S.chalk} />
    {/* Texto ALIAH */}
    <text x="200" y="420" textAnchor="middle" fontFamily="'Helvetica Neue',Helvetica,Arial,sans-serif" fontWeight="300" fontSize="52" letterSpacing="12" fill={S.chalk}>ALIAH</text>
    {/* Texto DEVELOPMENTS */}
    <text x="200" y="460" textAnchor="middle" fontFamily="'Helvetica Neue',Helvetica,Arial,sans-serif" fontWeight="300" fontSize="24" letterSpacing="8" fill={S.g1}>DEVELOPMENTS</text>
  </svg>
);

const ROLE_LABELS = {
  director: { title: '¡Bienvenido, Director!', subtitle: 'Crea tu cuenta para acceder al sistema de diagnóstico organizacional.' },
  rrhh:     { title: '¡Bienvenido, RRHH!',     subtitle: 'Crea tu cuenta para consultar el diagnóstico y datos del equipo.' },
  usuario:  { title: '¡Bienvenido!',            subtitle: 'Crea tu cuenta para completar tu diagnóstico organizacional.' },
};

export default function Register({ inviteCode, onRegistered, onBack }) {
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [selectedAreas, setSelectedAreas] = useState([]);

  // Validate invite code on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await validateInviteLink(inviteCode);
      if (result) {
        setInvite(result);
      } else {
        setError('Este enlace de invitación no es válido o ya fue desactivado. Contacta a tu director o a RRHH.');
      }
      setLoading(false);
    })();
  }, [inviteCode]);

  const isDirector = invite?.rol === 'director';
  const isMultiArea = invite?.rol === 'director' || invite?.rol === 'rrhh';
  const roleInfo = ROLE_LABELS[invite?.rol] || ROLE_LABELS.usuario;

  const toggleArea = (areaId) => {
    if (isMultiArea) {
      setSelectedAreas(prev =>
        prev.includes(areaId) ? prev.filter(a => a !== areaId) : [...prev, areaId]
      );
    } else {
      setSelectedAreas([areaId]);
    }
  };

  const canSubmit = nombre.trim().length >= 3 
    && email.trim().includes('@') 
    && password.length >= 6 
    && password === passwordConfirm 
    && selectedAreas.length > 0
    && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');

    const result = await registerWithInvite({
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      password,
      areas: selectedAreas,
      inviteCode: invite.code,
      rol: invite.rol,
    });

    if (result.ok) {
      setSuccess(true);
      setTimeout(() => onRegistered(result.user), 1500);
    } else {
      setError(result.error);
      setSubmitting(false);
    }
  };

  // ─── LOADING ───
  if (loading) return (
    <div style={{ ...styles.container, justifyContent: 'center' }}>
      <LogoAliah size={100} />
      <p style={{ color: S.g1, marginTop: 20, fontSize: 14 }}>Validando invitación...</p>
    </div>
  );

  // ─── INVALID LINK ───
  if (!invite) return (
    <div style={{ ...styles.container, justifyContent: 'center' }}>
      <LogoAliah size={100} />
      <div style={styles.errorBox}>
        <span style={{ fontSize: 28 }}>⚠️</span>
        <p style={{ color: S.red, margin: '12px 0 0', fontSize: 15, lineHeight: 1.5 }}>{error}</p>
      </div>
      <button onClick={onBack} style={styles.linkBtn}>← Ir a iniciar sesión</button>
    </div>
  );

  // ─── SUCCESS ───
  if (success) return (
    <div style={{ ...styles.container, justifyContent: 'center' }}>
      <LogoAliah size={100} />
      <div style={{ ...styles.card, textAlign: 'center', padding: 40 }}>
        <span style={{ fontSize: 48 }}>✅</span>
        <h2 style={{ color: S.grn, margin: '16px 0 8px', fontSize: 20 }}>¡Cuenta creada!</h2>
        <p style={{ color: S.g1, fontSize: 14 }}>Entrando al sistema...</p>
      </div>
    </div>
  );

  // ─── REGISTER FORM ───
  return (
    <div style={styles.container}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <LogoAliah size={100} />
      </div>

      <div style={styles.card}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ ...styles.roleBadge, background: invite.rol === 'director' ? S.olive : invite.rol === 'rrhh' ? S.blu : S.oliveDim }}>
            {invite.label}
          </div>
          <h1 style={{ color: S.chalk, fontSize: 22, margin: '16px 0 6px', fontWeight: 600 }}>{roleInfo.title}</h1>
          <p style={{ color: S.g1, fontSize: 14, margin: 0 }}>{roleInfo.subtitle}</p>
        </div>

        {/* Error */}
        {error && <div style={styles.errorInline}>{error}</div>}

        {/* Nombre */}
        <div style={styles.field}>
          <label style={styles.label}>NOMBRE COMPLETO <span style={{ color: S.red }}>*</span></label>
          <input
            style={styles.input}
            type="text"
            placeholder="Ej: Ana López García"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
          />
          <span style={styles.hint}>Escribe tu nombre como quieres que aparezca en el sistema</span>
        </div>

        {/* Email */}
        <div style={styles.field}>
          <label style={styles.label}>CORREO ELECTRÓNICO <span style={{ color: S.red }}>*</span></label>
          <input
            style={styles.input}
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <span style={styles.hint}>Puede ser tu correo personal o corporativo — con este iniciarás sesión</span>
        </div>

        {/* Password */}
        <div style={styles.field}>
          <label style={styles.label}>CONTRASEÑA <span style={{ color: S.red }}>*</span></label>
          <input
            style={styles.input}
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {/* Confirm Password */}
        <div style={styles.field}>
          <label style={styles.label}>CONFIRMAR CONTRASEÑA <span style={{ color: S.red }}>*</span></label>
          <input
            style={{
              ...styles.input,
              borderColor: passwordConfirm && password !== passwordConfirm ? S.red : styles.input.borderColor,
            }}
            type="password"
            placeholder="Repite tu contraseña"
            value={passwordConfirm}
            onChange={e => setPasswordConfirm(e.target.value)}
          />
          {passwordConfirm && password !== passwordConfirm && (
            <span style={{ ...styles.hint, color: S.red }}>Las contraseñas no coinciden</span>
          )}
        </div>

        {/* Área */}
        <div style={styles.field}>
          <label style={styles.label}>
            {isMultiArea ? 'ÁREAS QUE DIRIGES' : 'TU ÁREA'} <span style={{ color: S.red }}>*</span>
          </label>
          <span style={styles.hint}>
            {isMultiArea 
              ? 'Selecciona todas las áreas que están bajo tu responsabilidad' 
              : 'Selecciona el área donde trabajas actualmente'}
          </span>
          <div style={styles.areasGrid}>
            {AREAS.map(a => {
              const selected = selectedAreas.includes(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => toggleArea(a.id)}
                  style={{
                    ...styles.areaBtn,
                    background: selected ? `${a.color}22` : 'transparent',
                    borderColor: selected ? a.color : S.brd,
                    color: selected ? S.chalk : S.g1,
                  }}
                >
                  <span>{a.icon}</span>
                  <span style={{ fontSize: 13 }}>{a.label}</span>
                  {selected && <span style={{ marginLeft: 'auto', color: a.color }}>✓</span>}
                </button>
              );
            })}
          </div>
          {selectedAreas.length > 0 && (
            <span style={{ ...styles.hint, color: S.olive2 }}>
              {selectedAreas.length} área{selectedAreas.length > 1 ? 's' : ''} seleccionada{selectedAreas.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            ...styles.submitBtn,
            opacity: canSubmit ? 1 : 0.4,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}
        >
          {submitting ? 'Creando tu cuenta...' : 'Crear mi cuenta'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={onBack} style={styles.linkBtn}>¿Ya tienes cuenta? Inicia sesión</button>
        </div>
      </div>

      {/* Nudge footer */}
      <p style={{ color: S.g2, fontSize: 12, textAlign: 'center', marginTop: 24, lineHeight: 1.5 }}>
        Aliah Developments · Sistema de Diagnóstico Organizacional<br />
        Tus datos están seguros y solo serán visibles para tu equipo directivo.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const styles = {
  container: {
    minHeight: '100vh',
    background: S.bg,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 16px',
  },
  card: {
    width: '100%',
    maxWidth: 520,
    background: S.s1,
    border: `1px solid ${S.brd}`,
    borderRadius: S.r,
    padding: '32px 28px',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '4px 14px',
    borderRadius: 20,
    color: S.chalk,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  field: {
    marginBottom: 20,
  },
  label: {
    display: 'block',
    color: S.olive2,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.5,
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    background: S.s2,
    border: `1px solid ${S.brd}`,
    borderRadius: S.r,
    color: S.chalk,
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  hint: {
    display: 'block',
    color: S.g2,
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  areasGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginTop: 8,
    maxHeight: 320,
    overflowY: 'auto',
  },
  areaBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    border: `1px solid ${S.brd}`,
    borderRadius: S.r,
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'inherit',
    transition: 'all .15s',
  },
  submitBtn: {
    width: '100%',
    padding: '14px 0',
    background: S.olive,
    border: 'none',
    borderRadius: S.r,
    color: S.chalk,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginTop: 8,
    transition: 'opacity .2s',
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: S.olive2,
    fontSize: 13,
    cursor: 'pointer',
    textDecoration: 'underline',
    fontFamily: 'inherit',
    padding: 0,
  },
  errorBox: {
    textAlign: 'center',
    padding: 32,
    maxWidth: 400,
  },
  errorInline: {
    background: `${S.red}15`,
    border: `1px solid ${S.red}40`,
    borderRadius: S.r,
    padding: '10px 14px',
    color: S.red,
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 1.4,
  },
};
