import { supabase } from './supabase';
import { AREAS, UBICACIONES, PREGUNTAS, KPIS_POR_AREA, KPIS_UNIVERSALES } from './constants';

// ═══════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════

export async function loginUser(email, password) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('password_hash', password)
      .eq('activo', true)
      .single();
    if (error || !data) return null;
    return data;
  } catch (e) {
    console.error('Login error:', e);
    return null;
  }
}

export async function loadUsers() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('app_users').select('*').eq('activo', true).order('nombre');
    if (error) throw error;
    return data || [];
  } catch (e) { console.error('Load users error:', e); return []; }
}

export async function createUser(user) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('app_users').insert([user]).select().single();
    if (error) throw error;
    return data;
  } catch (e) { console.error('Create user error:', e); return null; }
}

// Get user areas (handles both 'area' string and 'areas' array)
export function getUserAreas(user) {
  if (!user) return [];
  if (user.areas && Array.isArray(user.areas) && user.areas.length > 0) return user.areas;
  if (user.area) return [user.area];
  return [];
}

// ═══════════════════════════════════════════════════════════════
// INVITE LINKS — Auto-registro
// ═══════════════════════════════════════════════════════════════

/** Valida un código de invitación contra la tabla invite_links */
export async function validateInviteLink(code) {
  if (!supabase || !code) return null;
  try {
    const { data, error } = await supabase
      .from('invite_links')
      .select('*')
      .eq('code', code.trim())
      .eq('activo', true)
      .single();
    if (error || !data) return null;
    return data; // { id, code, rol, label, activo, usos }
  } catch (e) {
    console.error('Validate invite error:', e);
    return null;
  }
}

/** Registra un nuevo usuario con invite link */
export async function registerWithInvite({ nombre, email, password, areas, inviteCode, rol }) {
  if (!supabase) return { ok: false, error: 'Sin conexión a base de datos' };
  try {
    // 1. Verificar que el email no exista
    const { data: existing } = await supabase
      .from('app_users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();
    if (existing) return { ok: false, error: 'Este correo ya está registrado. ¿Quizá ya tienes cuenta? Intenta iniciar sesión.' };

    // 2. Crear usuario
    const newUser = {
      email: email.toLowerCase().trim(),
      password_hash: password,
      nombre: nombre.trim(),
      rol: rol,
      area: areas[0] || '',              // compatibilidad con columna singular
      areas: areas,                       // columna array
      activo: true,
      invite_code: inviteCode,
    };
    const { data: user, error: userErr } = await supabase
      .from('app_users')
      .insert([newUser])
      .select()
      .single();
    if (userErr) throw userErr;

    // 3. Incrementar contador de usos del invite link
    await supabase.rpc('increment_invite_usos', { invite_code: inviteCode }).catch(() => {
      // Si el RPC no existe, hacemos update manual
      supabase
        .from('invite_links')
        .update({ usos: undefined }) // fallback — se maneja abajo
        .eq('code', inviteCode)
        .then(() => {});
    });
    // Fallback: incremento manual si rpc no existe
    try {
      const { data: link } = await supabase.from('invite_links').select('usos').eq('code', inviteCode).single();
      if (link) {
        await supabase.from('invite_links').update({ usos: (link.usos || 0) + 1 }).eq('code', inviteCode);
      }
    } catch (e) { /* no-op */ }

    return { ok: true, user };
  } catch (e) {
    console.error('Register error:', e);
    const msg = e?.message?.includes('duplicate') 
      ? 'Este correo ya está registrado.'
      : 'Error al crear tu cuenta. Intenta de nuevo.';
    return { ok: false, error: msg };
  }
}

/** Obtiene los 3 invite links (para el panel admin del CEO) */
export async function getInviteLinks() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('invite_links')
      .select('*')
      .order('rol');
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Get invite links error:', e);
    return [];
  }
}

/** Activa/desactiva un invite link (CEO only) */
export async function toggleInviteLink(code, activo) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('invite_links')
      .update({ activo })
      .eq('code', code);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Toggle invite error:', e);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// SUPABASE CRUD
// ═══════════════════════════════════════════════════════════════

export async function saveToSupabase(entry) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('diagnostico_responses')
      .insert([{
        nombre: entry.nombre,
        area: entry.area,
        puesto: entry.puesto,
        ubicacion: entry.ubicacion,
        ubicacion_custom: entry.ubicacion_custom,
        rol_descripcion: entry.rol_descripcion,
        fecha_ingreso: entry.fecha_ingreso || null,
        direccion: entry.direccion,
        telefono_personal: entry.telefono_personal,
        email_personal: entry.email_personal,
        cumpleanos: entry.cumpleanos || null,
        aniversario: entry.aniversario || null,
        cumpleanos_pareja: entry.cumpleanos_pareja || null,
        tipo_sangre: entry.tipo_sangre,
        conyuge: entry.conyuge,
        hijos: entry.hijos || [],
        padres: entry.padres,
        otros_familiares: entry.otros_familiares,
        contacto_emergencia_1_nombre: entry.contacto_emergencia_1_nombre,
        contacto_emergencia_1_tel: entry.contacto_emergencia_1_tel,
        contacto_emergencia_1_relacion: entry.contacto_emergencia_1_relacion,
        contacto_emergencia_2_nombre: entry.contacto_emergencia_2_nombre,
        contacto_emergencia_2_tel: entry.contacto_emergencia_2_tel,
        contacto_emergencia_2_relacion: entry.contacto_emergencia_2_relacion,
        hobbies: entry.hobbies,
        preferencias_generales: entry.preferencias_generales,
        alergias_restricciones: entry.alergias_restricciones,
        talla_camisa: entry.talla_camisa,
        respuestas: entry.respuestas || {},
        ranked: entry.ranked || {},
        detalles: entry.detalles || {},
        user_id: entry.user_id || null,
      }])
      .select();
    if (error) throw error;
    console.log('✅ Saved to Supabase:', data?.[0]?.id);
    return data?.[0];
  } catch (e) {
    console.error('❌ Supabase save error:', e);
    return null;
  }
}

export async function loadFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('diagnostico_responses')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('❌ Supabase load error:', e);
    return null;
  }
}

export function subscribeRealtime(callback) {
  if (!supabase) return null;
  const channel = supabase
    .channel('diagnostico-realtime')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'diagnostico_responses' },
      (payload) => {
        console.log('🔄 New response received:', payload.new?.nombre);
        callback(payload.new);
      }
    )
    .subscribe();
  return channel;
}

// ═══════════════════════════════════════════════════════════════
// FILTER BY ROLE
// ═══════════════════════════════════════════════════════════════

export function filterByRole(all, user) {
  if (!user) return [];
  if (user.rol === 'ceo' || user.rol === 'rrhh') return all;
  const userAreas = getUserAreas(user);
  if (user.rol === 'director') return all.filter(r => userAreas.includes(r.area));
  // usuario — only their own
  return all.filter(r => r.user_id === user.id);
}

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════

export function col(s){ return s>=.68?"#7AB878":s>=.38?"#C8B84A":"#C87878" }
export function lbl(s){ return s>=.68?"SÓLIDO":s>=.38?"ATENCIÓN":"CRÍTICO" }

export function mdToHtml(md=""){
  if(!md) return "";
  let h = md.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^# (.+)$/gm,"<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>")
    .replace(/`([^`]+)`/g,"<code>$1</code>").replace(/^&gt; (.+)$/gm,"<blockquote>$1</blockquote>");
  const tableRx = /(\|.+\|\n)+/g;
  h = h.replace(tableRx, block => {
    const rows = block.trim().split("\n").filter(r => r.trim() && !r.match(/^\|[-| :]+\|$/));
    if(!rows.length) return block;
    const parseRow = (r,tag) => "<tr>" + r.split("|").slice(1,-1).map(c=>`<${tag}>${c.trim()}</${tag}>`).join("") + "</tr>";
    return `<table><thead>${parseRow(rows[0],"th")}</thead><tbody>${rows.slice(1).map(r=>parseRow(r,"td")).join("")}</tbody></table>`;
  });
  h = h.replace(/(^- .+\n?)+/gm, block => "<ul>"+block.replace(/^- (.+)$/gm,"<li>$1</li>")+"</ul>");
  h = h.replace(/(^\d+\. .+\n?)+/gm, block => "<ol>"+block.replace(/^\d+\. (.+)$/gm,"<li>$1</li>")+"</ol>");
  h = h.split(/\n{2,}/).map(chunk=>{
    chunk = chunk.trim(); if(!chunk) return "";
    if(/^<(h[1-3]|ul|ol|table|blockquote)/.test(chunk)) return chunk;
    return `<p>${chunk.replace(/\n/g," ")}</p>`;
  }).join("\n");
  return h;
}

export async function callAI(system, user, tokens=2200){
  const r = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:tokens, system, messages:[{role:"user",content:user}] })
  });
  const d = await r.json();
  if(d.error) throw new Error(d.error.message);
  return d.content?.[0]?.text || "";
}

export function buildProfileText(r){
  const a = AREAS.find(x=>x.id===r.area);
  const areaKpis = KPIS_POR_AREA[r.area] || KPIS_POR_AREA.proyectos;
  const allSuggested = [...areaKpis, ...KPIS_UNIVERSALES];
  const rankedStr = (qid)=>{
    const ranked = r.ranked?.[qid]||[];
    const p = PREGUNTAS.find(x=>x.id===qid);
    return ranked.map((idx,i)=>` ${i+1}° ${p?.opciones?.[idx]||idx}`).join("\n");
  };
  const kpiRanked = r.ranked?.q23||[];
  let customKpis = [];
  try { customKpis = JSON.parse(r.detalles?.q23||"[]"); } catch{}
  const kpisStr = kpiRanked.map((idx,i)=>{
    const label = idx>=1000 ? customKpis[idx-1000] : allSuggested[idx];
    return ` ${i+1}° ${label||idx}${idx>=1000?" [KPI PROPIO]":""}`;
  }).join("\n");
  return `COLABORADOR: ${r.nombre}\nÁREA: ${a?.label||r.area}\nPUESTO: ${r.puesto}\nUBICACIÓN: ${r.ubicacion==="otro" ? r.ubicacion_custom : UBICACIONES.find(u=>u.id===r.ubicacion)?.label||r.ubicacion}\nROL: ${r.rol_descripcion||"No especificado"}\n\nFLUJOS:\n- Recibe DE:\n${rankedStr("q4")}\n Detalle: ${r.detalles?.q4||"—"}\n- Entrega A:\n${rankedStr("q5")}\n Detalle: ${r.detalles?.q5||"—"}\n\nCANALES:\n${rankedStr("q6")}\n Comentario: ${r.detalles?.q6||"—"}\n\nFRICCIONES:\n${rankedStr("q7")}\n Detalle: ${r.detalles?.q7||"—"}\n\nCUELLOS:\n${rankedStr("q10")}\n Detalle: ${r.detalles?.q10||"—"}\n\nRETRASOS:\n${rankedStr("q14")}\n Detalle: ${r.detalles?.q14||"—"}\n\nCÓMO HACE HOY: ${r.respuestas?.q18||"—"}\nCÓMO DEBERÍA SER: ${r.respuestas?.q19||"—"}\n\nINTERFERENCIAS:\n${rankedStr("q20")}\n Propuestas: ${r.detalles?.q20||"—"}\n\nKPIs PRIORIZADOS:\n${kpisStr||"—"}\n\nPROPUESTA: ${r.respuestas?.q21||"—"}\nNECESIDAD CRÍTICA: ${r.respuestas?.q22||"—"}`.trim();
}
