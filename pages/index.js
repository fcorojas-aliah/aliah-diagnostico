import Head from 'next/head';
import { supabase } from '../lib/supabase';

// ═══════════════════════════════════════════════════════════════
// SUPABASE HELPERS
// ═══════════════════════════════════════════════════════════════

async function saveToSupabase(entry) {
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

async function loadFromSupabase() {
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

function subscribeRealtime(callback) {
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

import { useState, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────────
   CONSTANTES
───────────────────────────────────────────────────────────────── */
const STORAGE_KEY = "org_diag_v3";

const AREAS = [
  { id: "direccion",        label: "Dirección General",                            icon: "◈", color: "#C8A964" },
  { id: "proyectos",        label: "Proyectos & Planeación",                       icon: "◉", color: "#7EB87A" },
  { id: "legal",            label: "Legal & Permisos",                             icon: "◎", color: "#B08F6A" },
  { id: "finanzas",         label: "Finanzas & Tesorería",                         icon: "◐", color: "#8FC9A0" },
  { id: "cxp",              label: "Cuentas por Pagar",                            icon: "◐", color: "#6BAA90" },
  { id: "cxc",              label: "Cuentas por Cobrar",                           icon: "◐", color: "#4A90B8" },
  { id: "costos",           label: "Costos & Presupuestos",                        icon: "◑", color: "#D48770" },
  { id: "compras",          label: "Compras & Subcontratos",                       icon: "◒", color: "#E8C870" },
  { id: "obra",             label: "Supervisión & Gerencia de Obra",               icon: "◓", color: "#E87A5A" },
  { id: "operaciones",      label: "Operaciones",                                  icon: "◆", color: "#D4A070" },
  { id: "ti",               label: "Tecnología de la Información (TI)",            icon: "◇", color: "#60A0D0" },
  { id: "ventas",           label: "Ventas & Comercial",                           icon: "◔", color: "#7ACA90" },
  { id: "comercializacion", label: "Comercialización Industrial",                  icon: "◔", color: "#50B890" },
  { id: "marketing",        label: "Marketing",                                    icon: "◕", color: "#C490B8" },
  { id: "titulacion",       label: "Titulación & Escrituración",                   icon: "◖", color: "#A0C8D0" },
  { id: "administracion",   label: "Administración de Inmuebles / Condominio",     icon: "◗", color: "#B8A880" },
];

const UBICACIONES = [
  { id: "cdmx_corp",    label: "México — Corporativo",     icon: "🏢" },
  { id: "cdmx_lomas",   label: "México — Lomas Verdes",    icon: "🏠" },
  { id: "elsalto_1",    label: "Obra El Salto 1",          icon: "🏗" },
  { id: "elsalto_2",    label: "Obra El Salto 2",          icon: "🏗" },
  { id: "encinos_tj",   label: "Encinos — Tijuana",        icon: "🏘" },
  { id: "tijuana_corp",  label: "Tijuana — Corporativo",   icon: "🏢" },
  { id: "remoto",       label: "Remoto / Home Office",     icon: "💻" },
  { id: "otro",         label: "Otra ubicación",           icon: "📍" },
];

const KPIS_POR_AREA = {
  direccion: [
    "Margen neto de la empresa (%)", "ROI / IRR de proyectos activos",
    "Cumplimiento de programa maestro (%)", "Número de proyectos activos vs. meta",
    "Días promedio de ciclo de venta a escritura", "EBITDA mensual vs. presupuesto",
    "NPS o satisfacción de clientes", "% avance de metas estratégicas trimestrales",
    "Rotación de personal clave", "Cash flow real vs. proyectado",
  ],
  proyectos: [
    "% de cumplimiento del programa de obra semanal", "Variación de plazo acumulado vs. línea base (días)",
    "Número de RFIs abiertos / tiempo promedio de respuesta", "% de entregables de diseño a tiempo",
    "Número de cambios de alcance por proyecto", "Horas de retrabajo por cambios de diseño",
    "% de planos aprobados vs. total emitidos", "Tiempo promedio de aprobación de permisos",
    "# de observaciones de supervisión por semana", "Score de coordinación con otras áreas (encuesta interna)",
  ],
  legal: [
    "Tiempo promedio de obtención de permiso de construcción (días)", "% de permisos tramitados en plazo estimado",
    "Número de contratos vigentes activos", "Tiempo promedio de revisión y firma de contratos (días)",
    "Número de litigios o controversias activas", "% de escrituras firmadas en plazo comprometido",
    "Número de observaciones o requerimientos de autoridades", "Tiempo promedio de respuesta a consultas internas (horas)",
    "% de contratos con subcontratistas formalizados", "Costo promedio de trámites vs. presupuesto legal",
  ],
  finanzas: [
    "Cash flow semanal real vs. proyectado", "Días de cuentas por cobrar (DSO)",
    "Días de cuentas por pagar (DPO)", "% de ejecución presupuestal mensual",
    "Variación de costos financieros vs. presupuesto", "Cobertura de liquidez (meses de operación cubiertos)",
    "Tiempo promedio de cierre contable mensual (días)", "% de facturas pagadas en plazo pactado",
    "Costo de financiamiento ponderado (WACC estimado)", "Número de reportes financieros entregados a tiempo",
  ],
  costos: [
    "Desviación de costo real vs. presupuesto (%)", "% de volúmenes de obra ejecutados vs. programa",
    "Tiempo promedio de elaboración de estimaciones (días)", "Número de generadores de obra revisados por semana",
    "% de conceptos de obra con precio unitario cerrado", "Variación de precio de materiales clave vs. presupuesto",
    "Número de cambios de alcance valorizados / pendientes", "% de estimaciones pagadas vs. estimaciones presentadas",
    "Tiempo de respuesta a solicitudes de costo de cambios (horas)", "Exactitud del presupuesto inicial vs. costo final (%)",
  ],
  compras: [
    "Ahorro logrado vs. presupuesto de compras (%)", "Tiempo promedio de ciclo de compra (días)",
    "% de contratos de subcontrato formalizados antes de inicio", "Número de proveedores evaluados en el periodo",
    "% de órdenes de compra entregadas en plazo", "Número de incidencias de calidad con proveedores",
    "% de subcontratos con garantías vigentes", "Tiempo promedio de cotización y adjudicación (días)",
    "Número de proveedores alternativos por categoría crítica", "% de compras urgentes vs. total (indicador de planeación)",
  ],
  obra: [
    "% de avance físico semanal vs. programa", "Variación de costo de mano de obra vs. presupuesto",
    "Número de incidentes de seguridad / índice de frecuencia", "Días de retraso acumulado vs. programa original",
    "% de actividades con frente de trabajo disponible", "Productividad de cuadrillas (m² o unidades por jornada)",
    "Número de no conformidades de calidad por semana", "% de materiales en sitio vs. programa de suministro",
    "Rotación de subcontratistas en el proyecto", "Tiempo promedio de resolución de RFIs (días)",
  ],
  ventas: [
    "Número de unidades vendidas en el período", "Precio promedio de venta vs. precio lista (%)",
    "Tasa de conversión prospecto → contrato (%)", "Tiempo promedio del ciclo de venta (días)",
    "Ingreso comprometido (preventas) vs. meta", "Número de prospectos activos en pipeline",
    "% de cancelaciones / rescisiones en el período", "NPS o satisfacción del cliente comprador",
    "Comisiones pagadas vs. presupuesto de ventas", "Velocidad de absorción (unidades/mes vs. inventario)",
  ],
  marketing: [
    "Costo por lead calificado (CPL)", "Número de leads generados por canal",
    "Tasa de conversión lead → visita al proyecto", "Alcance orgánico vs. pagado en redes sociales",
    "% del presupuesto de marketing ejecutado", "ROI de campañas digitales",
    "Tiempo promedio de producción de materiales de venta", "Score de calidad de materiales (encuesta equipo ventas)",
    "Número de eventos / visitas de obra organizados", "Engagement rate en canales digitales",
  ],
  titulacion: [
    "Tiempo promedio de escrituración desde firma de contrato (días)", "% de expedientes completos en primera entrega",
    "Número de escrituras firmadas en el período vs. meta", "% de créditos hipotecarios autorizados vs. solicitados",
    "Tiempo promedio de dictamen bancario (días)", "Número de observaciones por expediente promedio",
    "% de clientes con documentación completa antes de cita", "Tiempo de respuesta a solicitudes de clientes (horas)",
    "% de escrituras inscritas en Registro Público en plazo", "Número de casos con incidencias legales o rechazos",
  ],
  cxp: [
    "Días promedio de pago a proveedores (DPO)", "% de facturas pagadas en plazo pactado",
    "Número de facturas pendientes de pago por antigüedad", "Monto total de cuentas por pagar vencidas",
    "% de facturas con 3 vías de verificación (OC + entrega + factura)", "Tiempo promedio de aprobación y pago de facturas (días)",
    "Número de pagos duplicados o erróneos en el período", "% de proveedores con domiciliación o pago SPEI activo",
    "Monto de anticipos a proveedores pendientes de amortizar", "% de conciliaciones bancarias completadas en plazo",
  ],
  cxc: [
    "Días promedio de cobro (DSO)", "% de cartera cobrada en plazo pactado",
    "Monto de cartera vencida por antigüedad (+30, +60, +90 días)", "% de clientes al corriente vs. total de cartera",
    "Número de acuerdos de pago / reestructuras activas", "Efectividad de cobranza mensual (%)",
    "Tiempo promedio de gestión de cobranza por cliente (días)", "Monto de ingresos cobrados vs. meta del período",
    "Número de estados de cuenta enviados en tiempo", "% de clientes con domiciliación activa",
  ],
  operaciones: [
    "% de procesos operativos documentados y vigentes", "Tiempo promedio de respuesta a solicitudes internas (horas)",
    "# de incidencias operativas por semana", "% de cumplimiento de SLAs internos",
    "Costo operativo mensual vs. presupuesto", "# de mejoras de proceso implementadas en el período",
    "% de satisfacción de áreas cliente (encuesta interna)", "Tiempo promedio de resolución de problemas operativos",
    "% de contratos de servicios vigentes y actualizados", "# de proveedores de servicios evaluados en el período",
  ],
  ti: [
    "Uptime / disponibilidad de sistemas críticos (%)", "Tiempo promedio de resolución de tickets (horas)",
    "Número de incidentes de seguridad informática", "% de equipos con software actualizado y licenciado",
    "Tiempo promedio de atención a solicitudes de soporte", "% de backups completados exitosamente",
    "Costo de TI per cápita vs. presupuesto", "# de proyectos tecnológicos entregados en plazo",
    "% de usuarios capacitados en nuevas herramientas", "Satisfacción de usuarios con soporte técnico (encuesta)",
  ],
  comercializacion: [
    "m² o naves industriales comercializadas en el período", "Precio promedio de renta/venta vs. precio lista",
    "Tasa de ocupación del parque industrial (%)", "Tiempo promedio de cierre de negociación (días)",
    "Número de prospectos calificados en pipeline", "Tasa de conversión prospecto → contrato (%)",
    "Monto de ingresos por rentas / ventas industriales vs. meta", "# de clientes nuevos vs. renovaciones en el período",
    "% de contratos renovados vs. vencidos", "Satisfacción de inquilinos / compradores industriales",
  ],
  administracion: [
    "% de cuotas de mantenimiento cobradas en plazo", "Costo de mantenimiento por m² administrado",
    "Tiempo promedio de resolución de solicitudes de inquilinos (días)", "# de incidencias de mantenimiento correctivo vs. preventivo",
    "% de áreas comunes con mantenimiento al corriente", "Tasa de ocupación del inmueble / condominio (%)",
    "Monto de reserva de mantenimiento constituida vs. meta", "# de proveedores de servicios evaluados en el período",
    "% de documentación legal del inmueble actualizada", "Satisfacción de propietarios / inquilinos (encuesta)",
  ],
};

const KPIS_UNIVERSALES = [
  "Cumplimiento de entregables en plazo (%)",
  "Tiempo de respuesta a solicitudes internas (horas)",
  "Número de reuniones efectivas vs. total",
  "% de tareas completadas en la semana vs. programadas",
  "Satisfacción del equipo interno (encuesta mensual)",
];

const PREGUNTAS = [
  { id:"q1", bloque:"Claridad de Rol", bNum:"01", texto:"¿Qué tan claro tienes los resultados específicos que se esperan de ti en los próximos 3 meses?", tipo:"escala", opciones:["Nada claro","Poco claro","Algo claro","Bastante claro","Totalmente claro"], dim:"claridad_rol" },
  { id:"q2", bloque:"Claridad de Rol", bNum:"01", texto:"Cuando completas una tarea que debe continuar en otra área, ¿sabes a quién entregarla y en qué formato?", tipo:"escala", opciones:["Nunca","Casi nunca","A veces","Casi siempre","Siempre"], dim:"handoff" },
  { id:"q3", bloque:"Claridad de Rol", bNum:"01", texto:'¿Con qué frecuencia caen en tu área tareas que no son tuyas porque "nadie sabe de quién son"?', tipo:"escala", opciones:["Diario","Varias veces/semana","~1 vez/semana","Raramente","Casi nunca"], dim:"zona_gris", inv:true, detalle_label:"¿Puedes describir un ejemplo concreto de este tipo de situación?" },
  { id:"q4", bloque:"Flujos de Trabajo", bNum:"02", texto:"¿De quién depende directamente tu trabajo? ¿Quién te entrega insumos, información o aprobaciones que necesitas?", tipo:"ranked_detail", opciones: AREAS.map(a => a.label), max:3, criterio:"Ordena por quién más impacta tu trabajo diario si no cumple o se retrasa.", detalle_label:"Describe qué recibes de estas áreas, en qué formato y con qué frecuencia ideal:", dim:"dependencias_entrada" },
  { id:"q5", bloque:"Flujos de Trabajo", bNum:"02", texto:"¿A quién le entregas resultados, reportes o productos de tu trabajo? ¿Quién depende de ti?", tipo:"ranked_detail", opciones: AREAS.map(a => a.label), max:3, criterio:"Ordena por quién se bloquea más si tú te retrasas.", detalle_label:"Describe qué les entregas, en qué formato y con qué frecuencia:", dim:"dependencias_salida" },
  { id:"q6", bloque:"Flujos de Trabajo", bNum:"02", texto:"¿Cuál es tu canal principal de comunicación con otras áreas? Ordena del más al menos usado.", tipo:"ranked_detail", opciones:["WhatsApp personal","Correo electrónico","Reuniones presenciales","Plataforma de gestión (Asana, Monday, etc.)","Llamadas telefónicas","Teams / Slack","ERP o sistema interno"], max:3, criterio:"Ordena por frecuencia real de uso, no por lo que debería ser.", detalle_label:"¿Qué problemas genera el canal más usado? ¿Qué canal crees que debería usarse?", dim:"canales" },
  { id:"q7", bloque:"Comunicación", bNum:"03", texto:"¿Con qué áreas tienes más fricción o problemas de comunicación? Ordena de mayor a menor problema.", tipo:"ranked_detail", opciones: AREAS.map(a => a.label), max:3, criterio:"Ordena por qué área te genera más retrasos, malentendidos o trabajo duplicado.", detalle_label:"Describe brevemente qué tipo de problemas tienes con cada área que señalas:", dim:"friccion" },
  { id:"q8", bloque:"Comunicación", bNum:"03", texto:"Cuando necesitas información urgente de otra área, ¿cuánto tiempo tardas normalmente en obtenerla?", tipo:"escala", opciones:["Más de 5 días","3-5 días","1-2 días","El mismo día","Respuesta inmediata"], dim:"velocidad_info", detalle_label:"¿Puedes dar un ejemplo específico de una información que tardó demasiado y qué impacto tuvo?" },
  { id:"q9", bloque:"Procesos", bNum:"04", texto:"¿Existe documentación formal de los procesos principales de tu área?", tipo:"escala", opciones:["No existe nada","Solo en mi cabeza","Parcialmente escrito","Documentado pero desactualizado","Documentado y vigente"], dim:"documentacion" },
  { id:"q10", bloque:"Procesos", bNum:"04", texto:"¿Cuáles son tus principales cuellos de botella? Ordena de mayor a menor impacto en tu productividad.", tipo:"ranked_detail", opciones:["Esperar aprobaciones internas","Falta de información de otras áreas","Procesos manuales que deberían ser digitales","Herramientas inadecuadas o desactualizadas","Cambios de prioridad frecuentes","Reuniones excesivas o improductivas","Falta de personal en mi área","Dependencia de una sola persona para decisiones clave"], max:3, criterio:"Ordena por qué te quita más tiempo o retrasa más tus resultados.", detalle_label:"Describe el cuello de botella más crítico: ¿qué pasa exactamente, con qué frecuencia y qué impacto tiene?", dim:"cuellos" },
  { id:"q11", bloque:"Procesos", bNum:"04", texto:"¿Con qué frecuencia tienes que improvisar porque no hay un proceso definido para lo que necesitas hacer?", tipo:"escala", opciones:["Siempre improviso","Frecuentemente","A veces","Raramente","Casi nunca — todo está definido"], dim:"improvisacion", inv:true, detalle_label:"¿En qué tipo de situaciones sueles improvisar más?" },
  { id:"q12", bloque:"Decisiones", bNum:"05", texto:"¿Tienes claridad sobre qué decisiones puedes tomar tú solo vs. cuáles requieren aprobación?", tipo:"escala", opciones:["Ninguna claridad","Muy poca","Algo de claridad","Bastante claridad","Claridad total"], dim:"autonomia_decision", detalle_label:"¿Qué decisiones te generan más duda sobre si debes escalarlas o tomarlas tú?" },
  { id:"q13", bloque:"Decisiones", bNum:"05", texto:"Cuando una decisión involucra a otra área, ¿qué suele pasar? Ordena las situaciones por frecuencia.", tipo:"ranked_detail", opciones:["Decido solo y después informo","Espero aprobación aunque retrase el proyecto","Convoco una reunión para decidir juntos","Escalo a mi jefe y él decide con el otro","No se decide y se queda en el aire"], max:3, criterio:"Ordena por lo que ocurre más frecuentemente en tu área.", detalle_label:"¿Puedes dar un ejemplo de una decisión reciente que fue difícil de tomar o que se atrasó?", dim:"decision_proceso" },
  { id:"q14", bloque:"Seguimiento", bNum:"06", texto:"¿Cuáles son las causas más frecuentes de retraso en tus proyectos o tareas? Ordena por impacto.", tipo:"ranked_detail", opciones:["Permisos / trámites externos","Cambios de diseño o alcance","Problemas de flujo de efectivo","Retraso de proveedores / subcontratistas","Falta de decisión interna","Información incompleta o tardía","Problemas de coordinación entre áreas","Falta de recursos humanos"], max:3, criterio:"Ordena por qué causa más retrasos acumulados en tu trabajo real.", detalle_label:"Describe el retraso más reciente que sufriste y cuál fue su causa raíz:", dim:"causas_retraso" },
  { id:"q15", bloque:"Seguimiento", bNum:"06", texto:"¿Cómo das seguimiento a los compromisos que otras áreas asumen contigo?", tipo:"escala", opciones:["No tengo mecanismo","Confío y espero","Yo persigo manualmente","Reuniones periódicas","Sistema compartido con visibilidad"], dim:"seguimiento", detalle_label:"¿Qué herramienta o mecanismo usas actualmente? ¿Qué mejorarías?" },
  { id:"q16", bloque:"Cultura", bNum:"07", texto:"¿Cómo describirías el ambiente de trabajo entre áreas?", tipo:"escala", opciones:["Alta fricción y conflictos","Cada área en su silo","Colaboración sin estructura","Coordinación con fricciones puntuales","Colaboración fluida y productiva"], dim:"cultura", detalle_label:"¿Puedes describir una situación reciente donde la dinámica entre áreas fue particularmente buena o mala?" },
  { id:"q17", bloque:"Cultura", bNum:"07", texto:"¿Sientes que la dirección tiene visibilidad real de los problemas operativos de tu área?", tipo:"escala", opciones:["No, estamos completamente desconectados","Muy poca visibilidad","Visibilidad parcial","Buena visibilidad","Visibilidad total y en tiempo real"], dim:"visibilidad_dir" },
  { id:"q18", bloque:"Autodiagnóstico", bNum:"08", texto:"Describe CÓMO HACES actualmente tu trabajo día a día: ¿cuál es tu rutina, qué herramientas usas, cómo te llegan las tareas?", tipo:"texto_largo", placeholder:"Sé lo más específico posible: 'Cada lunes reviso X, luego hago Y, cuando me llega Z lo proceso así...'", dim:"como_lo_hago" },
  { id:"q19", bloque:"Autodiagnóstico", bNum:"08", texto:"Ahora describe CÓMO CREES que debería hacerse tu trabajo idealmente: ¿qué cambiarías, qué automatizarías, qué eliminarías?", tipo:"texto_largo", placeholder:"Ejemplo: 'Idealmente recibiría X de Proyectos cada lunes, tendría acceso a Y en tiempo real, y no tendría que hacer Z manualmente...'", dim:"como_deberia_ser" },
  { id:"q20", bloque:"Autodiagnóstico", bNum:"08", texto:"¿Cuáles son las 3 principales interferencias que te impiden hacer tu trabajo como debería ser?", tipo:"ranked_detail", opciones:["No tengo la información que necesito a tiempo","Los procesos no están definidos","Herramientas inadecuadas","Falta de capacitación","Sobrecarga de trabajo","Falta de autoridad para decidir","Prioridades cambiantes","Falta de coordinación con otras áreas"], max:3, criterio:"Ordena por qué te quita más tiempo productivo o genera más frustración.", detalle_label:"Para cada interferencia que seleccionaste, ¿qué solución concreta propones?", dim:"interferencias" },
  { id:"q21", bloque:"Propuestas", bNum:"09", texto:"Si pudieras cambiar UNA cosa en cómo operamos como empresa, ¿cuál sería? ¿Y cómo lo implementarías?", tipo:"texto_largo", placeholder:"Describe el cambio, por qué lo harías, quién sería responsable y cómo medirías su éxito.", dim:"propuesta_principal" },
  { id:"q22", bloque:"Propuestas", bNum:"09", texto:"¿Qué herramienta, proceso, información o persona que HOY no tienes transformaría tu productividad?", tipo:"texto_largo", placeholder:"Ej: acceso a reportes de costos en tiempo real, un protocolo claro de entrega entre áreas, un asistente de seguimiento...", dim:"necesidad_critica" },
  { id:"q23", bloque:"KPIs del Puesto", bNum:"09", texto:"¿Cuáles son los indicadores más importantes para medir el éxito de tu área? Elige hasta 5 y ordénalos por prioridad.", tipo:"kpis_area", max:5, criterio:"Ordena por cuál es más crítico para saber si tu área está funcionando bien.", dim:"kpis_propuestos" },
];

/* ─── UTILITIES ─── */
function col(s){ return s>=.68?"#7AB878":s>=.38?"#C8B84A":"#C87878" }
function lbl(s){ return s>=.68?"SÓLIDO":s>=.38?"ATENCIÓN":"CRÍTICO" }

function mdToHtml(md=""){
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

async function callAI(system, user, tokens=2200){
  const r = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:tokens, system, messages:[{role:"user",content:user}] })
  });
  const d = await r.json();
  if(d.error) throw new Error(d.error.message);
  return d.content?.[0]?.text || "";
}

function buildProfileText(r){
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

const AI_SYSTEM = `Eres Director Senior de Consultoría Organizacional especializado en empresas de desarrollo inmobiliario en México. Genera documentos ejecutivos en español, con formato markdown profesional usando tablas, listas y encabezados. Sé específico, accionable y basado en los datos del diagnóstico. No inventes datos que no estén en el input.`;

/* ─── STYLES ─── */
const S = {
  bg:"#0F1109", s1:"#161A0F", s2:"#1C2113", s3:"#222918",
  olive:"#7A8C3E", olive2:"#9AAD55", olive3:"#B8C97A", oliveDim:"#3D4620",
  chalk:"#F0EEE8", g1:"#B8B8B2", g2:"#767670", g3:"#3A3A36",
  brd:"rgba(122,140,62,.25)", brd2:"rgba(255,255,255,.07)", brd3:"rgba(122,140,62,.12)",
  grn:"#7AB878", amb:"#C8B84A", red:"#C87878", blu:"#7AA8C8",
  r:"6px",
};

/* ─── ROOT APP ─── */
export default function App(){
  const [fase,setFase] = useState("inicio");
  const [info,setInfo] = useState({ nombre:"", area:"", puesto:"", ubicacion:"", ubicacion_custom:"", rol_descripcion:"", fecha_ingreso:"", direccion:"", telefono_personal:"", email_personal:"", cumpleanos:"", aniversario:"", conyuge:"", hijos:[], padres:"", otros_familiares:"", contacto_emergencia_1_nombre:"", contacto_emergencia_1_tel:"", contacto_emergencia_1_relacion:"", contacto_emergencia_2_nombre:"", contacto_emergencia_2_tel:"", contacto_emergencia_2_relacion:"", hobbies:"", preferencias_generales:"", alergias_restricciones:"", talla_camisa:"" });
  const [resps,setResps] = useState({});
  const [ranked,setRanked] = useState({});
  const [detalles,setDet] = useState({});
  const [qi,setQi] = useState(0);
  const [all,setAll] = useState([]);
  const [dtab,setDtab] = useState("resumen");
  const [gtab,setGtab] = useState("manual");
  const [gout,setGout] = useState({});
  const [gload,setGload] = useState(false);
  const [gerr,setGerr] = useState({});

  // Load from Supabase on mount, fall back to localStorage
  useEffect(()=>{
    (async () => {
      const sbData = await loadFromSupabase();
      if (sbData && sbData.length > 0) {
        setAll(sbData);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sbData)); } catch{}
      } else {
        try { const s = localStorage.getItem(STORAGE_KEY); if(s) setAll(JSON.parse(s)); } catch{}
      }
    })();
    // Realtime subscription
    const channel = subscribeRealtime((newRow) => {
      setAll(prev => {
        const exists = prev.some(r => r.id === newRow.id);
        if (exists) return prev;
        const updated = [...prev, newRow];
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch{}
        return updated;
      });
    });
    return () => { if (channel) supabase?.removeChannel(channel); };
  },[]);
  const saveAll = u => { setAll(u); try{localStorage.setItem(STORAGE_KEY,JSON.stringify(u))}catch{} };

  const p = PREGUNTAS[qi];
  const total = PREGUNTAS.length;
  const getRank = id => ranked[id]||[];
  const getDet = id => detalles[id]||"";
  const getResp = id => resps[id];
  const setRank = (id,arr) => setRanked(prev=>({...prev,[id]:arr}));
  const setDet_ = (id,v) => setDet(prev=>({...prev,[id]:v}));
  const setResp = (id,v) => setResps(prev=>({...prev,[id]:v}));
  const toggleRank = (id,idx,max) => {
    const cur = getRank(id);
    if(cur.includes(idx)) setRank(id,cur.filter(x=>x!==idx));
    else if(cur.length<max) setRank(id,[...cur,idx]);
  };
  const canAdvance = () => {
    if(!p) return false;
    if(p.tipo==="escala") return getResp(p.id) !== undefined;
    if(p.tipo==="ranked_detail") return getRank(p.id).length > 0;
    return true;
  };
  const next = () => { if(!canAdvance()) return; if(qi<total-1) setQi(i=>i+1); else finish(); };
  const prev = () => { if(qi>0) setQi(i=>i-1); };
  const finish = async () => {
    const entry = { ...info, timestamp:Date.now(), respuestas:resps, ranked, detalles };
    // Save to Supabase first
    const sbResult = await saveToSupabase(entry);
    if (sbResult) {
      // Supabase saved — realtime will update other clients
      // Add to local state with the Supabase ID
      const updated = [...all, sbResult];
      saveAll(updated);
    } else {
      // Fallback to localStorage only
      saveAll([...all, entry]);
    }
    setFase("done");
  };

  const generate = async (tipo) => {
    if(gout[tipo]) return;
    setGload(true); setGerr(prev=>({...prev,[tipo]:""}));
    const last = all[all.length-1];
    if(!last){ setGload(false); return; }
    const profileLast = buildProfileText(last);
    const profilesAll = all.map(buildProfileText).join("\n\n---\n\n");
    const n = all.length;
    const prompts = {
      manual: `Con base en el siguiente perfil, genera un Manual de Operaciones para este puesto:\n\n${profileLast}\n\nIncluye: 1.Misión del Puesto 2.Responsabilidades (tabla) 3.Mapa de Interfaces (tabla) 4.Protocolos de Comunicación 5.KPIs (tabla) 6.OKRs Trimestrales 7.Criterios de Escalamiento 8.Brecha Actual vs Ideal 9.Quick Wins`,
      matriz: `Con base en el diagnóstico de ${n} colaboradores, genera la Matriz de Decisiones:\n\n${profilesAll}\n\nIncluye: 1.Principios de Gobernanza 2.Niveles de Autoridad 3.Matriz por Área (tabla) 4.Zonas Grises 5.Protocolo de Escalamiento 6.Reglas de Oro`,
      kpis: `Con base en el diagnóstico de ${n} colaboradores, genera el Sistema de KPIs:\n\n${profilesAll}\n\nIncluye: 1.KPIs Corporativos (tabla) 2.KPIs por Área (tabla) 3.KPIs de Coordinación 4.OKRs Empresa 5.OKRs Áreas Críticas 6.Cadencia de Revisión`,
      organigrama: `Con base en el diagnóstico de ${n} colaboradores, genera la Estructura Organizacional:\n\n${profilesAll}\n\nIncluye: 1.Estructura Jerárquica 2.Posiciones Clave (tabla) 3.Flujos Críticos 4.Comités/Reuniones (tabla) 5.Matriz RACI 6.Plan 90 días`,
      mejoras: `Con base en el diagnóstico de ${n} colaboradores, genera el Plan de Mejoras:\n\n${profilesAll}\n\nIncluye: 1.Diagnóstico Ejecutivo 2.Brechas por Área 3.Iniciativas Prioritarias (tabla) 4.Quick Wins 5.Cambios Críticos 6.Roadmap 6 meses 7.Indicadores de Éxito`,
      comparativo: `Con base en el diagnóstico de ${n} colaboradores, genera el Análisis Comparativo:\n\n${profilesAll}\n\nIncluye: 1.Brechas por Colaborador 2.Patrones Comunes 3.Mapa de Dependencias 4.Coherencia de Flujos 5.Recomendaciones de Rediseño`,
    };
    try{
      const result = await callAI(AI_SYSTEM, prompts[tipo]||"", 2200);
      setGout(prev=>({...prev,[tipo]:result}));
    } catch(e){ setGerr(prev=>({...prev,[tipo]:"Error: "+e.message})); }
    setGload(false);
  };

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

  return(
    <>
      <Head>
        <title>Diagnóstico Organizacional — Aliah Developments</title>
        <meta name="description" content="Sistema de diagnóstico organizacional para levantamiento de procesos y estructura" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>◈</text></svg>" />
      </Head>
      <style>{css}</style>
      <div style={{minHeight:"100vh",background:S.bg}}>
        <Header step={fase==="inicio"?"REGISTRO DE COLABORADOR":fase==="quiz"?`DIAGNÓSTICO · PREGUNTA ${qi+1} / ${total}`:fase==="done"?"DIAGNÓSTICO COMPLETADO":"DASHBOARD EJECUTIVO"}/>
        {fase==="inicio" && <Inicio info={info} setInfo={setInfo} n={all.length} onStart={()=>setFase("quiz")} onDash={()=>setFase("dash")}/>}
        {fase==="quiz" && <Quiz p={p} qi={qi} total={total} info={info} getResp={getResp} getRank={getRank} getDet={getDet} setResp={setResp} setDet_={setDet_} toggleRank={toggleRank} canAdvance={canAdvance} next={next} prev={prev}/>}
        {fase==="done" && <Done nombre={info.nombre} onNuevo={()=>{setInfo({nombre:"",area:"",puesto:"",ubicacion:"",ubicacion_custom:"",rol_descripcion:"",fecha_ingreso:"",direccion:"",telefono_personal:"",email_personal:"",cumpleanos:"",aniversario:"",conyuge:"",hijos:[],padres:"",otros_familiares:"",contacto_emergencia_1_nombre:"",contacto_emergencia_1_tel:"",contacto_emergencia_1_relacion:"",contacto_emergencia_2_nombre:"",contacto_emergencia_2_tel:"",contacto_emergencia_2_relacion:"",hobbies:"",preferencias_generales:"",alergias_restricciones:"",talla_camisa:""});setResps({});setRanked({});setDet({});setQi(0);setFase("inicio");}} onDash={()=>setFase("dash")}/>}
        {fase==="dash" && <Dash all={all} dtab={dtab} setDtab={setDtab} gtab={gtab} setGtab={setGtab} gout={gout} gload={gload} gerr={gerr} onNuevo={()=>{setInfo({nombre:"",area:"",puesto:"",ubicacion:"",ubicacion_custom:"",rol_descripcion:"",fecha_ingreso:"",direccion:"",telefono_personal:"",email_personal:"",cumpleanos:"",aniversario:"",conyuge:"",hijos:[],padres:"",otros_familiares:"",contacto_emergencia_1_nombre:"",contacto_emergencia_1_tel:"",contacto_emergencia_1_relacion:"",contacto_emergencia_2_nombre:"",contacto_emergencia_2_tel:"",contacto_emergencia_2_relacion:"",hobbies:"",preferencias_generales:"",alergias_restricciones:"",talla_camisa:""});setResps({});setRanked({});setDet({});setQi(0);setFase("inicio");}} onClear={()=>saveAll([])} generate={generate}/>}
      </div>
    </>
  );
}

/* ─── HEADER ─── */
function Header({step}){
  return(
    <div style={{background:`linear-gradient(135deg,${S.s1} 0%,${S.s2} 50%,${S.s3} 100%)`,borderBottom:`1px solid ${S.brd}`,padding:"12px 20px",display:"flex",alignItems:"center",gap:14,position:"sticky",top:0,zIndex:100}}>
      <div style={{width:32,height:32,borderRadius:4,background:`linear-gradient(135deg,${S.olive} 0%,${S.oliveDim} 100%)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <span style={{color:S.chalk,fontSize:14,fontFamily:"'Cormorant Garamond',serif",fontWeight:600}}>A</span>
      </div>
      <div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:S.olive2,letterSpacing:".12em"}}>ALIAH DEVELOPMENTS</div>
        {step && <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:S.g3,letterSpacing:".08em",marginTop:2}}>{step}</div>}
      </div>
      <div style={{marginLeft:"auto",width:6,height:6,borderRadius:"50%",background:S.olive}}/>
    </div>
  );
}

/* ─── INICIO ─── */
function Inicio({info,setInfo,n,onStart,onDash}){
  const ok = info.nombre.trim().length > 1 && info.area && info.puesto.trim().length > 1;
  return(
    <div className="au" style={{maxWidth:700,margin:"0 auto",padding:"52px 20px"}}>
      <div style={{marginBottom:40}}>
        <div className="label" style={{marginBottom:14}}>DIAGNÓSTICO ORGANIZACIONAL · EMPRESA DE DESARROLLO INMOBILIARIO</div>
        <h1 className="display" style={{fontSize:42,fontWeight:300,lineHeight:1.1,marginBottom:16,color:S.chalk}}>Levantamiento de<br/><em style={{color:S.olive2}}>Procesos y Estructura</em></h1>
        <div style={{width:40,height:1.5,background:S.olive,marginBottom:18}}/>
        <p style={{fontSize:15,lineHeight:1.75,color:S.g1}}>Diagnóstico personal y organizacional. Tu perfil detallado permite generar manuales de operación, matrices de decisión y planes de mejora con IA.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:32}}>
        {[["23","Preguntas"],["~18","Minutos"],["9","Bloques"],[String(n),"Completados"]].map(([v,l])=>(
          <div key={l} className="card" style={{textAlign:"center",padding:"14px 8px"}}>
            <div className="display" style={{fontSize:26,color:S.olive2,fontWeight:300}}>{v}</div>
            <div className="mono" style={{fontSize:9,color:S.g3,marginTop:3,letterSpacing:".08em"}}>{l}</div>
          </div>
        ))}
      </div>
      <div className="card card-hi" style={{padding:26,marginBottom:14}}>
        <div className="label" style={{marginBottom:20}}>DATOS DEL COLABORADOR</div>
        <div style={{marginBottom:22}}>
          <div className="mono" style={{fontSize:9,color:S.g3,marginBottom:9}}>NOMBRE COMPLETO <span style={{color:S.olive2}}>*</span></div>
          <input className="iline" placeholder="Tu nombre completo" value={info.nombre} onChange={e=>setInfo(p=>({...p,nombre:e.target.value}))}/>
        </div>
        <div style={{marginBottom:22}}>
          <div className="mono" style={{fontSize:9,color:S.g3,marginBottom:11}}>ÁREA <span style={{color:S.olive2}}>*</span></div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {AREAS.map(a=>(
              <div key={a.id} onClick={()=>setInfo(p=>({...p,area:a.id}))} style={{padding:"10px 13px",borderRadius:S.r,cursor:"pointer",background:info.area===a.id?`${a.color}18`:S.s2,border:`1px solid ${info.area===a.id?a.color:S.brd2}`,display:"flex",alignItems:"center",gap:9,transition:"all .13s"}}>
                <span style={{fontSize:15,color:info.area===a.id?a.color:S.g3}}>{a.icon}</span>
                <span style={{fontSize:13,color:info.area===a.id?a.color:S.chalk,flex:1}}>{a.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <div className="mono" style={{fontSize:9,color:S.g3,marginBottom:9}}>TÍTULO DEL PUESTO <span style={{color:S.olive2}}>*</span></div>
          <input className="inp" style={{minHeight:"auto"}} placeholder="Ej: Gerente de Proyectos, Directora Legal..." value={info.puesto} onChange={e=>setInfo(p=>({...p,puesto:e.target.value}))}/>
        </div>
        <div style={{marginBottom:20}}>
          <div className="mono" style={{fontSize:9,color:S.g3,marginBottom:11}}>UBICACIÓN DE TRABAJO</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}}>
            {UBICACIONES.map(u=>(
              <div key={u.id} onClick={()=>setInfo(p=>({...p,ubicacion:u.id}))} style={{padding:"10px 13px",borderRadius:S.r,cursor:"pointer",background:info.ubicacion===u.id?"rgba(122,140,62,.12)":S.s2,border:`1px solid ${info.ubicacion===u.id?S.olive:S.brd2}`,display:"flex",alignItems:"center",gap:9,transition:"all .13s"}}>
                <span style={{fontSize:14}}>{u.icon}</span>
                <span style={{fontSize:12,color:info.ubicacion===u.id?S.olive2:S.g1}}>{u.label}</span>
              </div>
            ))}
          </div>
          {info.ubicacion==="otro" && <input className="inp" style={{minHeight:"auto",marginTop:8}} placeholder="Ciudad, nombre del proyecto u oficina..." value={info.ubicacion_custom} onChange={e=>setInfo(p=>({...p,ubicacion_custom:e.target.value}))}/>}
        </div>
        <div style={{marginBottom:20}}>
          <label className="field-lbl">FECHA DE INGRESO EN ALIAH</label>
          <input type="date" className="date-inp" value={info.fecha_ingreso||""} onChange={e=>setInfo(p=>({...p,fecha_ingreso:e.target.value}))}/>
        </div>
        <div>
          <div className="mono" style={{fontSize:9,color:S.g3,marginBottom:6}}>DESCRIBE TU ROL CON TUS PROPIAS PALABRAS</div>
          <textarea className="inp" rows={4} placeholder="Describe qué haces, qué decisiones tomas, con quién interactúas..." value={info.rol_descripcion} onChange={e=>setInfo(p=>({...p,rol_descripcion:e.target.value}))}/>
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:4}}>
        <button className="btn btn-p" style={{flex:1,padding:14}} disabled={!ok} onClick={onStart}>INICIAR DIAGNÓSTICO →</button>
        {n>0 && <button className="btn btn-g" onClick={onDash} style={{padding:14}}>DASHBOARD ({n})</button>}
      </div>
      {!ok && <p className="mono" style={{fontSize:9,color:S.oliveDim,textAlign:"center",marginTop:14}}>* Completa nombre, área y puesto para continuar</p>}
    </div>
  );
}

/* ─── QUIZ ─── */
function Quiz({p,qi,total,info,getResp,getRank,getDet,setResp,setDet_,toggleRank,canAdvance,next,prev}){
  const area = AREAS.find(a=>a.id===info.area)||AREAS[0];
  const progress = (qi/total)*100;
  const isLast = qi===total-1;
  if(!p) return null;
  return(
    <div style={{maxWidth:720,margin:"0 auto",padding:"34px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div className="label">{p.bNum} · {p.bloque.toUpperCase()}</div>
        <div className="mono" style={{fontSize:10,color:S.g3}}>{qi+1} / {total}</div>
      </div>
      <div className="prog" style={{marginBottom:32}}><div className="progf" style={{width:`${progress}%`}}/></div>
      <div key={qi} className="au">
        <h2 className="display" style={{fontSize:24,fontWeight:300,lineHeight:1.42,marginBottom:28,color:S.chalk}}>{p.texto}</h2>
        {p.tipo==="escala" && (
          <>
            <div style={{display:"flex",gap:5,marginBottom:p.detalle_label?22:0}}>
              {p.opciones.map((l,i)=>(
                <button key={i} className={`scl ${getResp(p.id)===i?"on":""}`} onClick={()=>setResp(p.id,i)}>
                  <div style={{fontSize:17,marginBottom:4,fontFamily:"monospace"}}>{i+1}</div>{l}
                </button>
              ))}
            </div>
            {p.detalle_label && getResp(p.id)!==undefined && <DetField label={p.detalle_label} value={getDet(p.id)} onChange={v=>setDet_(p.id,v)}/>}
          </>
        )}
        {p.tipo==="ranked_detail" && (
          <>
            <div className="mono" style={{fontSize:9,color:S.g3,marginBottom:11}}>ELIGE HASTA {p.max} · EN ORDEN DE PRIORIDAD{p.criterio && <span style={{display:"block",marginTop:4,fontStyle:"italic",letterSpacing:0,textTransform:"none"}}>{p.criterio}</span>}</div>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
              {p.opciones.map((op,i)=>{
                const cur=getRank(p.id); const pos=cur.indexOf(i); const sel=pos!==-1;
                return(
                  <button key={i} className={`opt ${sel?"on":""}`} onClick={()=>toggleRank(p.id,i,p.max)}>
                    {sel ? <div className="rbadge">{pos+1}</div> : <span className="mono" style={{fontSize:11,color:S.g3,minWidth:22,textAlign:"center"}}>{cur.length<p.max?"○":"—"}</span>}
                    <span>{op}</span>
                  </button>
                );
              })}
            </div>
            {p.detalle_label && getRank(p.id).length>0 && <DetField label={p.detalle_label} value={getDet(p.id)} onChange={v=>setDet_(p.id,v)}/>}
          </>
        )}
        {p.tipo==="texto_largo" && <textarea className="inp" rows={6} placeholder={p.placeholder} value={getResp(p.id)||""} onChange={e=>setResp(p.id,e.target.value)}/>}
        {p.tipo==="kpis_area" && <KpisField areaId={info.area} pid={p.id} max={p.max} criterio={p.criterio} getRank={getRank} toggleRank={toggleRank} getDet={getDet} setDet_={setDet_}/>}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:36}}>
        <button className="btn btn-g" onClick={prev} style={{visibility:qi===0?"hidden":"visible"}}>← ANTERIOR</button>
        <button className="btn btn-p" disabled={!canAdvance()} onClick={next}>{isLast?"FINALIZAR ✓":"SIGUIENTE →"}</button>
      </div>
      <div style={{marginTop:16,textAlign:"center"}}>
        <span className="mono" style={{fontSize:9,color:S.g3}}>{info.nombre} · {area.label} · {info.puesto}</span>
      </div>
    </div>
  );
}

function DetField({label,value,onChange}){
  return(
    <div style={{marginTop:4}}>
      <div className="mono" style={{fontSize:9,color:S.olive2,marginBottom:7}}>DETALLE: {label}</div>
      <textarea className="inp" rows={3} placeholder="Escribe tu comentario..." value={value} onChange={e=>onChange(e.target.value)}/>
    </div>
  );
}

/* ─── KPIS FIELD ─── */
function KpisField({areaId, pid, max, criterio, getRank, toggleRank, getDet, setDet_}){
  const [newKpi, setNewKpi] = useState("");
  const suggested = [...(KPIS_POR_AREA[areaId]||KPIS_POR_AREA.proyectos), ...KPIS_UNIVERSALES];
  const customKpis = (()=>{ try{return JSON.parse(getDet(pid)||"[]")}catch{return []} })();
  const saveCustom = (arr) => setDet_(pid, JSON.stringify(arr));
  const addCustom = () => { const v=newKpi.trim(); if(!v) return; saveCustom([...customKpis,v]); setNewKpi(""); };
  const cur = getRank(pid);
  const areaInfo = AREAS.find(a=>a.id===areaId);
  return(
    <div>
      <div className="mono" style={{fontSize:9,color:S.g3,marginBottom:11}}>ELIGE HASTA {max} KPIs EN ORDEN DE PRIORIDAD{criterio && <span style={{display:"block",marginTop:3,fontStyle:"italic",letterSpacing:0,textTransform:"none"}}>{criterio}</span>}</div>
      <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:14}}>
        {suggested.map((kpi,i)=>{
          const pos=cur.indexOf(i); const sel=pos!==-1; const isUni=i>=(KPIS_POR_AREA[areaId]?.length||0);
          return(
            <button key={i} className={`opt ${sel?"on":""}`} onClick={()=>toggleRank(pid,i,max)} style={{opacity:(!sel&&cur.length>=max)?0.4:1}}>
              {sel ? <div className="rbadge">{pos+1}</div> : <span className="mono" style={{fontSize:10,color:S.g3,minWidth:22,textAlign:"center"}}>{cur.length<max?"○":"—"}</span>}
              <span style={{flex:1}}>{kpi}</span>
              {isUni && <span className="pill" style={{background:"rgba(255,255,255,.04)",color:S.g3,fontSize:8}}>UNIVERSAL</span>}
            </button>
          );
        })}
      </div>
      {customKpis.length>0 && <div style={{marginBottom:10}}>
        <div className="mono" style={{fontSize:9,color:S.olive2,marginBottom:8}}>TUS KPIs PROPIOS</div>
        {customKpis.map((kpi,i)=>{
          const idx=1000+i; const pos=cur.indexOf(idx); const sel=pos!==-1;
          return <button key={i} className={`opt ${sel?"on":""}`} onClick={()=>toggleRank(pid,idx,max)} style={{marginBottom:5,opacity:(!sel&&cur.length>=max)?0.4:1}}>
            {sel ? <div className="rbadge">{pos+1}</div> : <span className="mono" style={{fontSize:10,color:S.g3,minWidth:22,textAlign:"center"}}>{cur.length<max?"○":"—"}</span>}
            <span style={{flex:1}}>{kpi}</span><span className="pill" style={{background:"rgba(122,140,62,.1)",color:S.olive2,fontSize:8}}>PROPIO</span>
          </button>;
        })}
      </div>}
      <div style={{background:S.s2,border:`1px solid ${S.brd}`,borderRadius:S.r,padding:14}}>
        <div className="mono" style={{fontSize:9,color:S.olive2,marginBottom:9}}>+ AGREGAR MI PROPIO KPI</div>
        <div style={{display:"flex",gap:7}}>
          <input className="inp" style={{minHeight:"auto",fontSize:13,flex:1}} placeholder="Ej: % de escrituras entregadas en plazo..." value={newKpi} onChange={e=>setNewKpi(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addCustom();}}}/>
          <button className="btn btn-p" style={{padding:"10px 16px",flexShrink:0}} disabled={!newKpi.trim()} onClick={addCustom}>+ AGREGAR</button>
        </div>
      </div>
    </div>
  );
}

/* ─── DONE ─── */
function Done({nombre,onNuevo,onDash}){
  return(
    <div className="au" style={{maxWidth:480,margin:"0 auto",padding:"100px 20px",textAlign:"center"}}>
      <div style={{fontSize:44,marginBottom:18,color:S.olive2}}>◎</div>
      <h1 className="display" style={{fontSize:38,fontWeight:300,marginBottom:12,color:S.chalk}}>Diagnóstico Completado</h1>
      <div style={{width:32,height:1,background:S.olive,margin:"0 auto 18px"}}/>
      <p style={{fontSize:15,color:S.g1,lineHeight:1.75,marginBottom:32}}>Gracias, <strong style={{color:S.chalk}}>{nombre}</strong>. Tu perfil fue registrado exitosamente.</p>
      <div style={{display:"flex",gap:8,justifyContent:"center"}}>
        <button className="btn btn-p" onClick={onDash}>VER DASHBOARD →</button>
        <button className="btn btn-g" onClick={onNuevo}>+ NUEVO COLABORADOR</button>
      </div>
    </div>
  );
}

/* ─── DASHBOARD ─── */
function Dash({all,dtab,setDtab,gtab,setGtab,gout,gload,gerr,onNuevo,onClear,generate}){
  const n = all.length;
  const tabs=[{id:"resumen",l:"RESUMEN"},{id:"flujos",l:"FLUJOS"},{id:"friccion",l:"FRICCIONES"},{id:"cuellos",l:"CUELLOS"},{id:"equipo",l:"EQUIPO"},{id:"ia",l:"◈ IA DOCS"}];
  return(
    <div style={{maxWidth:960,margin:"0 auto",padding:"36px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <div className="label" style={{marginBottom:7}}>ANÁLISIS ORGANIZACIONAL</div>
          <h1 className="display" style={{fontSize:34,fontWeight:300,color:S.chalk}}>Dashboard <em style={{color:S.olive2}}>Ejecutivo</em></h1>
        </div>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          <span className="mono" style={{fontSize:10,color:S.g3}}>{n} participante{n!==1?"s":""}</span>
          <button className="btn btn-p" style={{padding:"8px 16px"}} onClick={onNuevo}>+ PARTICIPANTE</button>
        </div>
      </div>
      <div className="tabbar" style={{marginBottom:24}}>{tabs.map(t=><button key={t.id} className={`tabi ${dtab===t.id?"on":""}`} onClick={()=>setDtab(t.id)}>{t.l}</button>)}</div>
      {dtab==="resumen" && <TabResumen all={all} n={n}/>}
      {dtab==="flujos" && <TabFlujos all={all} n={n}/>}
      {dtab==="friccion" && <TabFriccion all={all} n={n}/>}
      {dtab==="cuellos" && <TabCuellos all={all} n={n}/>}
      {dtab==="equipo" && <TabEquipo all={all}/>}
      {dtab==="ia" && <TabIA all={all} n={n} gtab={gtab} setGtab={setGtab} gout={gout} gload={gload} gerr={gerr} generate={generate}/>}
      <div style={{marginTop:36,paddingTop:18,borderTop:`1px solid ${S.brd2}`,display:"flex",justifyContent:"space-between"}}>
        <span className="mono" style={{fontSize:9,color:S.g3}}>DIAGNÓSTICO ORGANIZACIONAL · ALIAH DEVELOPMENTS</span>
        <button className="btn btn-g" style={{fontSize:9,padding:"5px 11px",color:S.g3}} onClick={()=>{if(confirm("¿Eliminar todos los datos?")) onClear();}}>LIMPIAR DATOS</button>
      </div>
    </div>
  );
}

function Empty({msg="Aún no hay datos. Agrega participantes para ver el análisis."}){
  return <div style={{textAlign:"center",padding:"80px 20px",color:S.g3}}><div style={{fontSize:32,marginBottom:14}}>◎</div><p style={{fontSize:14,lineHeight:1.7}}>{msg}</p></div>;
}

/* ─── TAB RESUMEN ─── */
function TabResumen({all,n}){
  const QDIMS = [{qid:"q1",label:"Claridad de Rol"},{qid:"q2",label:"Entrega entre Áreas"},{qid:"q3",label:"Zonas Grises",inv:true},{qid:"q9",label:"Documentación"},{qid:"q12",label:"Autonomía de Decisión"},{qid:"q17",label:"Visibilidad Dirección"}];
  const score = (qid,inv)=>{
    if(!n) return 0;
    const p = PREGUNTAS.find(x=>x.id===qid); if(!p) return 0;
    const vals = all.map(r=>r.respuestas?.[qid]).filter(v=>v!==undefined);
    if(!vals.length) return 0;
    const max = (p.opciones?.length||5)-1;
    const avg = vals.reduce((a,b)=>a+b,0)/vals.length/max;
    return inv ? 1-avg : avg;
  };
  const scores = QDIMS.map(d=>score(d.qid,d.inv));
  const global = scores.length ? scores.reduce((a,b)=>a+b,0)/scores.length : 0;
  if(!n) return <Empty/>;
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"160px 1fr",gap:14,marginBottom:14}}>
        <div className="card card-hi" style={{textAlign:"center",padding:"28px 16px"}}>
          <div className="label" style={{marginBottom:10}}>SCORE GLOBAL</div>
          <div className="display" style={{fontSize:52,color:col(global),fontWeight:300,lineHeight:1}}>{Math.round(global*100)}</div>
          <div className="mono" style={{fontSize:9,color:col(global),marginTop:7}}>{lbl(global)}</div>
        </div>
        <div className="card" style={{padding:"18px 20px"}}>
          <div className="label" style={{marginBottom:14}}>PERFIL POR DIMENSIÓN</div>
          {QDIMS.map((d,i)=>{ const s=scores[i]; return(
            <div key={d.label} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:13,color:S.chalk}}>{d.label}</span>
                <span className="mono" style={{fontSize:9,color:col(s)}}>{Math.round(s*100)}%</span>
              </div>
              <div className="prog"><div className="progf" style={{width:`${s*100}%`,background:col(s)}}/></div>
            </div>
          );})}
        </div>
      </div>
      {all.some(r=>r.respuestas?.q21) && (
        <div className="card" style={{marginBottom:12}}>
          <div className="label" style={{marginBottom:14}}>PROPUESTAS DEL EQUIPO</div>
          {all.filter(r=>r.respuestas?.q21).map((r,i)=>{
            const a=AREAS.find(x=>x.id===r.area);
            return <div key={i} style={{marginBottom:14,paddingBottom:14,borderBottom:i<all.length-1?`1px solid ${S.brd2}`:"none"}}>
              <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:7}}>
                <span className="pill" style={{background:`${a?.color}15`,color:a?.color,border:`1px solid ${a?.color}30`}}>{a?.icon} {a?.label}</span>
                <span className="mono" style={{fontSize:9,color:S.g3}}>{r.puesto}</span>
              </div>
              <p style={{fontSize:14,lineHeight:1.7,color:S.g1,fontStyle:"italic"}}>{r.respuestas.q21}</p>
            </div>;
          })}
        </div>
      )}
    </div>
  );
}

/* ─── TAB FLUJOS ─── */
function TabFlujos({all,n}){
  if(!n) return <Empty/>;
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      {["q4","q5"].map(qid=>(
        <div key={qid} className="card">
          <div className="label" style={{marginBottom:14}}>{qid==="q4"?"¿DE QUIÉN DEPENDE CADA ÁREA?":"¿A QUIÉN LE ENTREGA CADA ÁREA?"}</div>
          {all.map((r,i)=>{
            const a=AREAS.find(x=>x.id===r.area);
            const deps=(r.ranked?.[qid]||[]).map(idx=>PREGUNTAS.find(p=>p.id===qid)?.opciones?.[idx]).filter(Boolean);
            return <div key={i} style={{marginBottom:12,paddingBottom:12,borderBottom:`1px solid ${S.brd2}`}}>
              <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
                <span style={{color:a?.color,fontSize:13}}>{a?.icon}</span>
                <span style={{fontSize:13,fontWeight:500,color:S.chalk}}>{r.nombre}</span>
                <span className="mono" style={{fontSize:9,color:S.g3}}>{a?.label}</span>
              </div>
              {deps.map((d,j)=><div key={j} style={{display:"flex",gap:7,alignItems:"center",marginBottom:3}}><div className="rbadge" style={{width:16,height:16,fontSize:9}}>{j+1}</div><span style={{fontSize:12,color:S.g1}}>{d}</span></div>)}
            </div>;
          })}
        </div>
      ))}
    </div>
  );
}

/* ─── TAB FRICCIÓN ─── */
function TabFriccion({all,n}){
  if(!n) return <Empty/>;
  const p7 = PREGUNTAS.find(p=>p.id==="q7");
  const counts = {}; AREAS.forEach(a=>{counts[a.label]=[0,0,0]});
  all.forEach(r=>(r.ranked?.q7||[]).forEach((idx,pos)=>{ const l=p7?.opciones?.[idx]; if(l&&counts[l]) counts[l][pos]++; }));
  const sorted = Object.entries(counts).map(([l,arr])=>({l,arr,pts:arr[0]*3+arr[1]*2+arr[2]})).sort((a,b)=>b.pts-a.pts).filter(x=>x.pts>0);
  const mx = sorted[0]?.pts||1;
  return(
    <div className="card">
      <div className="label" style={{marginBottom:6}}>MAPA DE FRICCIONES ENTRE ÁREAS</div>
      <p style={{fontSize:12,color:S.g3,marginBottom:18,lineHeight:1.5}}>Ponderado por posición (1°=3pts · 2°=2pts · 3°=1pt)</p>
      {sorted.map(({l,pts})=>{
        const a=AREAS.find(x=>x.label===l);
        return <div key={l} style={{marginBottom:13}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:14,color:a?.color||S.chalk}}>{a?.icon} {l}</span>
            <span className="mono" style={{fontSize:10,color:S.g1}}>{pts}pts</span>
          </div>
          <div className="prog" style={{height:5}}><div className="progf" style={{width:`${pts/mx*100}%`,background:a?.color||S.olive}}/></div>
        </div>;
      })}
    </div>
  );
}

/* ─── TAB CUELLOS ─── */
function TabCuellos({all,n}){
  if(!n) return <Empty/>;
  const ranked4pts = (qid)=>{
    const p = PREGUNTAS.find(x=>x.id===qid); if(!p) return [];
    const cnts = p.opciones.map(()=>[0,0,0]);
    all.forEach(r=>(r.ranked?.[qid]||[]).forEach((idx,pos)=>{if(cnts[idx])cnts[idx][pos]++;}));
    return p.opciones.map((l,i)=>({l,pts:cnts[i][0]*3+cnts[i][1]*2+cnts[i][2]})).sort((a,b)=>b.pts-a.pts).filter(x=>x.pts>0);
  };
  const cuellos = ranked4pts("q10"); const causas = ranked4pts("q14");
  const COLS = [S.red,S.amb,S.olive2,S.blu,S.grn,S.g2];
  const mx1=cuellos[0]?.pts||1, mx2=causas[0]?.pts||1;
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <div className="card">
        <div className="label" style={{marginBottom:6}}>CUELLOS DE BOTELLA</div>
        {cuellos.map(({l,pts},i)=><div key={l} style={{marginBottom:11}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,lineHeight:1.3,flex:1,color:S.chalk}}>{l}</span><span className="mono" style={{fontSize:9,color:COLS[i%COLS.length]}}>{pts}pts</span></div><div className="prog" style={{height:4}}><div className="progf" style={{width:`${pts/mx1*100}%`,background:COLS[i%COLS.length]}}/></div></div>)}
      </div>
      <div className="card">
        <div className="label" style={{marginBottom:6}}>CAUSAS DE RETRASO</div>
        {causas.map(({l,pts},i)=><div key={l} style={{marginBottom:11}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,lineHeight:1.3,flex:1,color:S.chalk}}>{l}</span><span className="mono" style={{fontSize:9,color:COLS[i%COLS.length]}}>{pts}pts</span></div><div className="prog" style={{height:4}}><div className="progf" style={{width:`${pts/mx2*100}%`,background:COLS[i%COLS.length]}}/></div></div>)}
      </div>
    </div>
  );
}

/* ─── TAB EQUIPO ─── */
function TabEquipo({all}){
  const [expanded,setExpanded] = useState(null);
  if(!all.length) return <Empty/>;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {all.map((r,i)=>{
        const a=AREAS.find(x=>x.id===r.area); const isOpen=expanded===i;
        return <div key={i} className="card" style={{padding:0,overflow:"hidden"}}>
          <div style={{padding:"16px 20px",cursor:"pointer"}} onClick={()=>setExpanded(isOpen?null:i)}>
            <div style={{display:"flex",gap:14,alignItems:"center"}}>
              <div style={{width:44,height:44,borderRadius:"50%",background:`${a?.color}20`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:a?.color,fontSize:19}}>{a?.icon}</span></div>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  <span className="display" style={{fontSize:18,color:S.chalk}}>{r.nombre}</span>
                  <span className="pill" style={{background:`${a?.color}15`,color:a?.color,border:`1px solid ${a?.color}30`}}>{a?.label}</span>
                  <span className="mono" style={{fontSize:9,color:S.olive2}}>{r.puesto}</span>
                </div>
              </div>
              <span style={{color:S.olive2,fontSize:18,transform:isOpen?"rotate(180deg)":"none",transition:"transform .2s"}}>▾</span>
            </div>
          </div>
          {isOpen && (
            <div style={{borderTop:`1px solid ${S.brd2}`,padding:"18px 20px"}}>
              {r.rol_descripcion && <div style={{marginBottom:16,padding:"10px 12px",background:S.s2,borderRadius:S.r}}><div className="mono" style={{fontSize:8,color:S.olive2,marginBottom:6}}>DESCRIPCIÓN DEL ROL</div><p style={{fontSize:12,color:S.g1,lineHeight:1.6}}>{r.rol_descripcion}</p></div>}
              {r.respuestas?.q18 && <div style={{padding:"9px 11px",background:S.s2,borderRadius:S.r,marginBottom:8}}><div className="mono" style={{fontSize:8,color:S.amb,marginBottom:4}}>CÓMO TRABAJA HOY</div><p style={{fontSize:11,color:S.g1,lineHeight:1.55,fontStyle:"italic"}}>{r.respuestas.q18}</p></div>}
              {r.respuestas?.q19 && <div style={{padding:"9px 11px",background:S.s2,borderRadius:S.r}}><div className="mono" style={{fontSize:8,color:S.grn,marginBottom:4}}>CÓMO DEBERÍA SER</div><p style={{fontSize:11,color:S.g1,lineHeight:1.55,fontStyle:"italic"}}>{r.respuestas.q19}</p></div>}
            </div>
          )}
        </div>;
      })}
    </div>
  );
}

/* ─── TAB IA ─── */
function TabIA({all,n,gtab,setGtab,gout,gload,gerr,generate}){
  const docs=[
    {id:"manual",icon:"◈",label:"MANUAL DE OPERACIONES",desc:"Manual personalizado del último colaborador registrado"},
    {id:"matriz",icon:"◉",label:"MATRIZ DE DECISIONES",desc:"Autoridades por nivel, zonas grises y reglas de oro"},
    {id:"kpis",icon:"◎",label:"KPIs & OKRs",desc:"Sistema de métricas por área y empresa"},
    {id:"organigrama",icon:"◐",label:"ORGANIGRAMA & RACI",desc:"Estructura óptima, comités y matriz de responsabilidades"},
    {id:"mejoras",icon:"◑",label:"PLAN DE MEJORAS",desc:"Diagnóstico ejecutivo, quick wins y roadmap 6 meses"},
    {id:"comparativo",icon:"◒",label:"BRECHA HOY vs. IDEAL",desc:"Análisis cruzado de cómo trabajan vs cómo deberían"},
  ];
  const handleSelect = (id) => { setGtab(id); if(!gout[id]) generate(id); };
  if(!n) return <Empty msg="Agrega al menos 1 participante para generar documentos."/>;
  return(
    <div style={{display:"grid",gridTemplateColumns:"230px 1fr",gap:14,minHeight:520}}>
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {docs.map(d=>(
          <button key={d.id} onClick={()=>handleSelect(d.id)} style={{background:gtab===d.id?S.s2:"transparent",border:`1px solid ${gtab===d.id?S.brd:"transparent"}`,borderRadius:S.r,padding:"11px 13px",cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}>
              <span style={{color:gtab===d.id?S.olive2:S.g3,fontSize:14}}>{d.icon}</span>
              <span className="mono" style={{fontSize:9,color:gtab===d.id?S.olive2:S.g3}}>{d.label}</span>
            </div>
            {gtab===d.id && <p style={{fontSize:11,color:S.g3,lineHeight:1.4,marginLeft:22}}>{d.desc}</p>}
            {gout[d.id] && <span className="mono" style={{fontSize:8,color:S.grn,marginLeft:22}}>✓ GENERADO</span>}
          </button>
        ))}
      </div>
      <div className="card card-hi" style={{padding:"22px 24px",maxHeight:"72vh",overflowY:"auto"}}>
        {gload && !gout[gtab] ? (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:14}}>
            <div className="spin"/><p className="mono" style={{fontSize:10,color:S.g3}}>GENERANDO DOCUMENTO...</p>
            <p style={{fontSize:12,color:S.g3}}>Analizando {n} respuesta{n!==1?"s":""}...</p>
          </div>
        ) : gerr[gtab] ? (
          <div style={{padding:20,textAlign:"center"}}>
            <div style={{color:S.red,fontSize:13,marginBottom:12}}>{gerr[gtab]}</div>
            <button className="btn btn-p" onClick={()=>generate(gtab)}>REINTENTAR</button>
          </div>
        ) : gout[gtab] ? (
          <div className="prose" dangerouslySetInnerHTML={{__html:mdToHtml(gout[gtab])}}/>
        ) : (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:12}}>
            <span style={{fontSize:32,color:S.g3}}>◎</span>
            <p className="mono" style={{fontSize:10,color:S.g3}}>SELECCIONA UN DOCUMENTO PARA GENERAR</p>
            <button className="btn btn-p" style={{marginTop:8}} onClick={()=>generate(gtab)}>GENERAR AHORA</button>
          </div>
        )}
      </div>
    </div>
  );
}
