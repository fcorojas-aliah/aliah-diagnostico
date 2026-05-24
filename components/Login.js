import { useState } from 'react';
import { S } from '../lib/constants';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setErr("");
    setLoading(true);
    const u = await onLogin(email, pass);
    if (!u) setErr("Email o contraseña incorrectos");
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: S.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="au" style={{ maxWidth: 400, width: "100%", padding: "20px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: S.s1, border: `2px solid ${S.olive}`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 24, color: S.olive2, fontWeight: 600 }}>A</span>
          </div>
          <h1 className="display" style={{ fontSize: 32, fontWeight: 300, color: S.chalk, marginBottom: 6 }}>Aliah Developments</h1>
          <p style={{ fontSize: 13, color: S.g2 }}>Diagnóstico Organizacional</p>
        </div>

        <div className="card card-hi" style={{ padding: 28 }}>
          <div style={{ marginBottom: 22 }}>
            <div className="field-req">EMAIL</div>
            <input
              className="inp req-field"
              type="email"
              placeholder="Ej: tu.nombre@aliah.mx"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handle()}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <div className="field-req">CONTRASEÑA</div>
            <input
              className="inp req-field"
              type="password"
              placeholder="Tu contraseña"
              value={pass}
              onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handle()}
            />
          </div>

          {err && (
            <div style={{
              background: "rgba(200,120,120,.1)",
              border: "1px solid rgba(200,120,120,.3)",
              borderRadius: S.r,
              padding: "10px 14px",
              marginBottom: 16,
              fontSize: 13,
              color: S.red
            }}>
              {err}
            </div>
          )}

          <button
            className="btn btn-p"
            style={{ width: "100%", padding: 14, fontSize: 12 }}
            disabled={!email || !pass || loading}
            onClick={handle}
          >
            {loading ? "VERIFICANDO..." : "ENTRAR →"}
          </button>

          <p className="nudge" style={{ textAlign: "center", marginTop: 14 }}>
            Si no tienes cuenta, solicítala a RRHH o a tu director
          </p>
        </div>
      </div>
    </div>
  );
}
