// ═══════════════════════════════════════════════════════════════
// CONSTANTES — Aliah Developments Diagnóstico Organizacional
// ═══════════════════════════════════════════════════════════════

export const STORAGE_KEY = "org_diag_v3";
export const AUTH_KEY = "aliah_auth_user";

export const AREAS = [
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

export const UBICACIONES = [
  { id: "cdmx_corp",    label: "México — Corporativo",     icon: "🏢" },
  { id: "cdmx_lomas",   label: "México — Lomas Verdes",    icon: "🏠" },
  { id: "elsalto_1",    label: "Obra El Salto 1",          icon: "🏗" },
  { id: "elsalto_2",    label: "Obra El Salto 2",          icon: "🏗" },
  { id: "encinos_tj",   label: "Encinos — Tijuana",        icon: "🏘" },
  { id: "tijuana_corp",  label: "Tijuana — Corporativo",   icon: "🏢" },
  { id: "remoto",       label: "Remoto / Home Office",     icon: "💻" },
  { id: "otro",         label: "Otra ubicación",           icon: "📍" },
];

export const RELACIONES = ["Pareja", "Padre/Madre", "Hermano/a", "Hijo/a", "Amigo/a", "Otro"];
export const TIPOS_SANGRE = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
export const TALLAS = ["XS", "S", "M", "L", "XL", "XXL"];

export const KPIS_POR_AREA = {
  direccion: ["Margen neto de la empresa (%)", "ROI / IRR de proyectos activos","Cumplimiento de programa maestro (%)", "Número de proyectos activos vs. meta","Días promedio de ciclo de venta a escritura", "EBITDA mensual vs. presupuesto","NPS o satisfacción de clientes", "% avance de metas estratégicas trimestrales","Rotación de personal clave", "Cash flow real vs. proyectado"],
  proyectos: ["% de cumplimiento del programa de obra semanal", "Variación de plazo acumulado vs. línea base (días)","Número de RFIs abiertos / tiempo promedio de respuesta", "% de entregables de diseño a tiempo","Número de cambios de alcance por proyecto", "Horas de retrabajo por cambios de diseño","% de planos aprobados vs. total emitidos", "Tiempo promedio de aprobación de permisos","# de observaciones de supervisión por semana", "Score de coordinación con otras áreas (encuesta interna)"],
  legal: ["Tiempo promedio de obtención de permiso de construcción (días)", "% de permisos tramitados en plazo estimado","Número de contratos vigentes activos", "Tiempo promedio de revisión y firma de contratos (días)","Número de litigios o controversias activas", "% de escrituras firmadas en plazo comprometido","Número de observaciones o requerimientos de autoridades", "Tiempo promedio de respuesta a consultas internas (horas)","% de contratos con subcontratistas formalizados", "Costo promedio de trámites vs. presupuesto legal"],
  finanzas: ["Cash flow semanal real vs. proyectado", "Días de cuentas por cobrar (DSO)","Días de cuentas por pagar (DPO)", "% de ejecución presupuestal mensual","Variación de costos financieros vs. presupuesto", "Cobertura de liquidez (meses de operación cubiertos)","Tiempo promedio de cierre contable mensual (días)", "% de facturas pagadas en plazo pactado","Costo de financiamiento ponderado (WACC estimado)", "Número de reportes financieros entregados a tiempo"],
  costos: ["Desviación de costo real vs. presupuesto (%)", "% de volúmenes de obra ejecutados vs. programa","Tiempo promedio de elaboración de estimaciones (días)", "Número de generadores de obra revisados por semana","% de conceptos de obra con precio unitario cerrado", "Variación de precio de materiales clave vs. presupuesto","Número de cambios de alcance valorizados / pendientes", "% de estimaciones pagadas vs. estimaciones presentadas","Tiempo de respuesta a solicitudes de costo de cambios (horas)", "Exactitud del presupuesto inicial vs. costo final (%)"],
  compras: ["Ahorro logrado vs. presupuesto de compras (%)", "Tiempo promedio de ciclo de compra (días)","% de contratos de subcontrato formalizados antes de inicio", "Número de proveedores evaluados en el periodo","% de órdenes de compra entregadas en plazo", "Número de incidencias de calidad con proveedores","% de subcontratos con garantías vigentes", "Tiempo promedio de cotización y adjudicación (días)","Número de proveedores alternativos por categoría crítica", "% de compras urgentes vs. total (indicador de planeación)"],
  obra: ["% de avance físico semanal vs. programa", "Variación de costo de mano de obra vs. presupuesto","Número de incidentes de seguridad / índice de frecuencia", "Días de retraso acumulado vs. programa original","% de actividades con frente de trabajo disponible", "Productividad de cuadrillas (m² o unidades por jornada)","Número de no conformidades de calidad por semana", "% de materiales en sitio vs. programa de suministro","Rotación de subcontratistas en el proyecto", "Tiempo promedio de resolución de RFIs (días)"],
  ventas: ["Número de unidades vendidas en el período", "Precio promedio de venta vs. precio lista (%)","Tasa de conversión prospecto → contrato (%)", "Tiempo promedio del ciclo de venta (días)","Ingreso comprometido (preventas) vs. meta", "Número de prospectos activos en pipeline","% de cancelaciones / rescisiones en el período", "NPS o satisfacción del cliente comprador","Comisiones pagadas vs. presupuesto de ventas", "Velocidad de absorción (unidades/mes vs. inventario)"],
  marketing: ["Costo por lead calificado (CPL)", "Número de leads generados por canal","Tasa de conversión lead → visita al proyecto", "Alcance orgánico vs. pagado en redes sociales","% del presupuesto de marketing ejecutado", "ROI de campañas digitales","Tiempo promedio de producción de materiales de venta", "Score de calidad de materiales (encuesta equipo ventas)","Número de eventos / visitas de obra organizados", "Engagement rate en canales digitales"],
  titulacion: ["Tiempo promedio de escrituración desde firma de contrato (días)", "% de expedientes completos en primera entrega","Número de escrituras firmadas en el período vs. meta", "% de créditos hipotecarios autorizados vs. solicitados","Tiempo promedio de dictamen bancario (días)", "Número de observaciones por expediente promedio","% de clientes con documentación completa antes de cita", "Tiempo de respuesta a solicitudes de clientes (horas)","% de escrituras inscritas en Registro Público en plazo", "Número de casos con incidencias legales o rechazos"],
  cxp: ["Días promedio de pago a proveedores (DPO)", "% de facturas pagadas en plazo pactado","Número de facturas pendientes de pago por antigüedad", "Monto total de cuentas por pagar vencidas","% de facturas con 3 vías de verificación (OC + entrega + factura)", "Tiempo promedio de aprobación y pago de facturas (días)","Número de pagos duplicados o erróneos en el período", "% de proveedores con domiciliación o pago SPEI activo","Monto de anticipos a proveedores pendientes de amortizar", "% de conciliaciones bancarias completadas en plazo"],
  cxc: ["Días promedio de cobro (DSO)", "% de cartera cobrada en plazo pactado","Monto de cartera vencida por antigüedad (+30, +60, +90 días)", "% de clientes al corriente vs. total de cartera","Número de acuerdos de pago / reestructuras activas", "Efectividad de cobranza mensual (%)","Tiempo promedio de gestión de cobranza por cliente (días)", "Monto de ingresos cobrados vs. meta del período","Número de estados de cuenta enviados en tiempo", "% de clientes con domiciliación activa"],
  operaciones: ["% de procesos operativos documentados y vigentes", "Tiempo promedio de respuesta a solicitudes internas (horas)","# de incidencias operativas por semana", "% de cumplimiento de SLAs internos","Costo operativo mensual vs. presupuesto", "# de mejoras de proceso implementadas en el período","% de satisfacción de áreas cliente (encuesta interna)", "Tiempo promedio de resolución de problemas operativos","% de contratos de servicios vigentes y actualizados", "# de proveedores de servicios evaluados en el período"],
  ti: ["Uptime / disponibilidad de sistemas críticos (%)", "Tiempo promedio de resolución de tickets (horas)","Número de incidentes de seguridad informática", "% de equipos con software actualizado y licenciado","Tiempo promedio de atención a solicitudes de soporte", "% de backups completados exitosamente","Costo de TI per cápita vs. presupuesto", "# de proyectos tecnológicos entregados en plazo","% de usuarios capacitados en nuevas herramientas", "Satisfacción de usuarios con soporte técnico (encuesta)"],
  comercializacion: ["m² o naves industriales comercializadas en el período", "Precio promedio de renta/venta vs. precio lista","Tasa de ocupación del parque industrial (%)", "Tiempo promedio de cierre de negociación (días)","Número de prospectos calificados en pipeline", "Tasa de conversión prospecto → contrato (%)","Monto de ingresos por rentas / ventas industriales vs. meta", "# de clientes nuevos vs. renovaciones en el período","% de contratos renovados vs. vencidos", "Satisfacción de inquilinos / compradores industriales"],
  administracion: ["% de cuotas de mantenimiento cobradas en plazo", "Costo de mantenimiento por m² administrado","Tiempo promedio de resolución de solicitudes de inquilinos (días)", "# de incidencias de mantenimiento correctivo vs. preventivo","% de áreas comunes con mantenimiento al corriente", "Tasa de ocupación del inmueble / condominio (%)","Monto de reserva de mantenimiento constituida vs. meta", "# de proveedores de servicios evaluados en el período","% de documentación legal del inmueble actualizada", "Satisfacción de propietarios / inquilinos (encuesta)"],
};

export const KPIS_UNIVERSALES = [
  "Cumplimiento de entregables en plazo (%)",
  "Tiempo de respuesta a solicitudes internas (horas)",
  "Número de reuniones efectivas vs. total",
  "% de tareas completadas en la semana vs. programadas",
  "Satisfacción del equipo interno (encuesta mensual)",
];

export const PREGUNTAS = [
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

export const EMPTY_INFO = {
  nombre:"", area:"", puesto:"", ubicacion:"", ubicacion_custom:"", rol_descripcion:"", fecha_ingreso:"",
  direccion:"", telefono_personal:"", email_personal:"", cumpleanos:"", aniversario:"", cumpleanos_pareja:"",
  tipo_sangre:"O+", conyuge:"", hijos:[], padres:"", otros_familiares:"",
  contacto_emergencia_1_nombre:"", contacto_emergencia_1_tel:"", contacto_emergencia_1_relacion:"",
  contacto_emergencia_2_nombre:"", contacto_emergencia_2_tel:"", contacto_emergencia_2_relacion:"",
  hobbies:"", preferencias_generales:"", alergias_restricciones:"", talla_camisa:"M"
};

/* ─── STYLES ─── */
export const S = {
  bg:"#0F1109", s1:"#161A0F", s2:"#1C2113", s3:"#222918",
  olive:"#7A8C3E", olive2:"#9AAD55", olive3:"#B8C97A", oliveDim:"#3D4620",
  chalk:"#F0EEE8", g1:"#B8B8B2", g2:"#767670", g3:"#3A3A36",
  brd:"rgba(122,140,62,.25)", brd2:"rgba(255,255,255,.07)", brd3:"rgba(122,140,62,.12)",
  grn:"#7AB878", amb:"#C8B84A", red:"#C87878", blu:"#7AA8C8",
  r:"6px",
};

/* ─── AI ─── */
export const AI_SYSTEM = `Eres Director Senior de Consultoría Organizacional especializado en empresas de desarrollo inmobiliario en México. Genera documentos ejecutivos en español, con formato markdown profesional usando tablas, listas y encabezados. Sé específico, accionable y basado en los datos del diagnóstico. No inventes datos que no estén en el input.`;
