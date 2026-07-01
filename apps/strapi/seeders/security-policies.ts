import type { Core } from "@strapi/strapi";

const securityPoliciesData = [
  {
    order: 1,
    title: "¿Qué regula la política de seguridad?",
    text: "<p>Esta Política establece los principios generales de seguridad de la información y ciberseguridad aplicables a <strong>Waldo.click®</strong>, en cumplimiento de la <em>Ley N° 21.663 Marco de Ciberseguridad</em> y la <em>Ley N° 21.719 sobre Protección de Datos Personales</em>.</p><p>Su objetivo es proteger:</p><ul><li>La información corporativa de Waldo.click®</li><li>Los datos personales de nuestros usuarios</li><li>Nuestros sistemas e infraestructura digital</li><li>Los servicios que presta la Plataforma</li></ul>",
  },
  {
    order: 2,
    title: "¿A quién aplica esta política?",
    text: "<p>Esta Política rige para usuarios, colaboradores, proveedores tecnológicos, contratistas, nuestros sistemas propios y los sistemas de terceros que utilizamos.</p>",
  },
  {
    order: 3,
    title: "¿Quién es responsable de la seguridad?",
    text: "<p>Waldo.click® designa un <strong>Responsable de Seguridad de la Información</strong> (CISO, conforme a la Ley N° 21.663), que es el punto de contacto para temas de ciberseguridad, gestión de incidentes y coordinación con la Agencia Nacional de Ciberseguridad (ANCI).</p><p>Contacto: <strong>contacto@waldo.click</strong></p>",
  },
  {
    order: 4,
    title: "Principios de seguridad",
    text: "<p>Waldo.click® procura proteger la información conforme a los siguientes principios:</p><p><strong>Confidencialidad</strong>: que solo acceda a la información quien está autorizado.</p><p><strong>Integridad</strong>: que nadie pueda alterarla sin permiso.</p><p><strong>Disponibilidad</strong>: que puedas acceder a los sistemas cuando los necesitas.</p><p><strong>Trazabilidad</strong>: poder registrar los eventos relevantes que ocurren.</p><p><strong>Resiliencia</strong>: capacidad de recuperarnos si algo falla.</p>",
  },
  {
    order: 5,
    title: "Medidas de seguridad implementadas",
    text: "<p>Entre otras, usamos firewalls, sistemas antimalware, monitoreo de eventos, cifrado de comunicaciones, control de accesos, respaldos, segmentación de redes, protección contra ataques DDoS, autenticación reforzada y sistemas de detección de intrusiones.</p><p>Por razones evidentes, no detallamos públicamente cómo está configurada cada una de estas medidas — esa información se mantiene reservada.</p>",
  },
  {
    order: 6,
    title: "Gestión de accesos",
    text: "<p>Los accesos a nuestros sistemas se otorgan bajo el <strong>principio de mínimo privilegio</strong>: cada persona tiene acceso solo a lo que necesita para su función.</p><p>Estos accesos pueden limitarse, revocarse o auditarse en cualquier momento.</p>",
  },
  {
    order: 7,
    title: "Tus obligaciones de seguridad",
    text: "<p>Como usuario de la Plataforma, debes:</p><ul><li>Mantener contraseñas seguras</li><li>No compartir tus credenciales con nadie</li><li>Reportarnos cualquier incidente o actividad sospechosa a <strong>seguridad@waldo.click</strong></li><li>Usar la Plataforma de forma legítima</li></ul>",
  },
  {
    order: 8,
    title: "Actividades prohibidas",
    text: "<p>Está <strong>prohibido</strong>:</p><ul><li>Intentar vulnerar nuestros sistemas</li><li>Hacer ingeniería inversa</li><li>Ejecutar ataques informáticos</li><li>Interferir con el funcionamiento de nuestros servicios</li><li>Automatizar accesos no autorizados</li><li>Extraer nuestras bases de datos</li></ul>",
  },
  {
    order: 9,
    title: "Monitoreo de seguridad",
    text: "<p>Monitoreamos eventos técnicos con fines de seguridad, auditoría, prevención de fraude y protección operacional.</p>",
  },
  {
    order: 10,
    title: "Clasificación de incidentes",
    text: "<p>Seguimos la clasificación que establece la Ley N° 21.663:</p><p><strong>Incidentes críticos</strong>: afectan la continuidad operacional de servicios esenciales o comprometen datos personales de forma masiva.</p><p><strong>Incidentes significativos</strong>: afectan parcialmente la disponibilidad o integridad de sistemas o datos de usuarios.</p><p><strong>Otros incidentes</strong>: eventos de menor impacto, que igual documentamos y contenemos internamente.</p>",
  },
  {
    order: 11,
    title: "¿Qué hacemos ante un incidente?",
    text: "<p>Nuestro proceso pasa por:</p><p><strong>Identificar</strong>: la actividad anómala y determinar su alcance.</p><p><strong>Contener</strong>: el incidente para limitar su alcance.</p><p><strong>Mitigar</strong>: los riesgos que genera.</p><p><strong>Recuperar</strong>: los servicios afectados.</p><p><strong>Documentar</strong>: todo lo relevante para el análisis posterior.</p>",
  },
  {
    order: 12,
    title: "Notificación de incidentes",
    text: "<p>Cumplimos con lo que exigen la Ley N° 21.663 y la Ley N° 21.719:</p><ul><li><strong>A la ANCI</strong>: reporte inicial dentro de 3 horas para incidentes críticos, y reporte preliminar dentro de 24 horas para incidentes significativos, contados desde que tomamos conocimiento del hecho.</li><li><strong>A la APDP</strong>: cuando el incidente compromete datos personales, conforme al artículo 26 de la Ley N° 21.719.</li><li><strong>A los titulares afectados</strong>: cuando el incidente representa un riesgo significativo para sus derechos, te avisaremos a la brevedad.</li></ul>",
  },
  {
    order: 13,
    title: "Coordinación con CSIRT",
    text: "<p>Para incidentes de alta complejidad, podemos coordinarnos con el CSIRT de Gobierno u otros equipos de respuesta reconocidos por la ANCI.</p>",
  },
  {
    order: 14,
    title: "Proveedores tecnológicos",
    text: "<p>Trabajamos con terceros para infraestructura cloud, seguridad, monitoreo y comunicaciones.</p><p>Que usemos proveedores externos no nos exime de nuestras obligaciones legales — seguimos siendo responsables.</p>",
  },
  {
    order: 15,
    title: "Continuidad operacional",
    text: "<p>Contamos con respaldos, planes de recuperación ante desastres, redundancia y procedimientos de contingencia.</p><p>Esto no significa que podamos garantizar una disponibilidad ininterrumpida, pero sí que estamos preparados para reaccionar.</p>",
  },
  {
    order: 16,
    title: "Limitación de responsabilidad en seguridad",
    text: "<p>Ningún sistema tecnológico puede ofrecer seguridad absoluta. Por eso no garantizamos la ausencia total de vulnerabilidades, la imposibilidad absoluta de sufrir un ataque, ni una disponibilidad permanente.</p><p>Lo que sí garantizamos es que adoptamos medidas razonables para minimizar esos riesgos.</p>",
  },
  {
    order: 17,
    title: "Cumplimiento normativo",
    text: "<p>Esta Política se interpreta conforme a la legislación chilena vigente, incluyendo:</p><ul><li>Ley N° 21.663 Marco de Ciberseguridad</li><li>Ley N° 21.719 sobre Protección de Datos Personales</li><li>Normativa de la ANCI y la APDP</li><li>Cualquier otra normativa complementaria aplicable</li></ul>",
  },
  {
    order: 18,
    title: "Cambios a la política de seguridad",
    text: "<p>Podemos modificar esta Política para adaptarla a nuevos riesgos, cambios regulatorios o la evolución de la tecnología.</p><p>Te avisaremos cuando los cambios sean sustanciales.</p>",
  },
  {
    order: 19,
    title: "Contacto — Seguridad",
    text: "<p>Si tienes preguntas sobre seguridad o quieres reportar un incidente, puedes contactarnos en:</p><p><strong>Waldo.click®</strong><br>contacto@waldo.click<br>Responsable de Seguridad / CISO: contacto@waldo.click<br>Santiago, Chile</p>",
  },
];

const populateSecurityPolicies = async (strapi: Core.Strapi): Promise<void> => {
  console.log("Poblando Política de Seguridad...");

  const existing = await strapi.db
    .query("api::security-policy.security-policy")
    .findMany({ where: {} });

  if (existing.length > 0) {
    await strapi.db.query("api::security-policy.security-policy").deleteMany({ where: {} });
    console.log(`Eliminados ${existing.length} registros anteriores de Política de Seguridad`);
  }

  for (const securityPolicy of securityPoliciesData) {
    try {
      await strapi.db.query("api::security-policy.security-policy").create({
        data: { title: securityPolicy.title, text: securityPolicy.text, order: securityPolicy.order },
      });
      console.log(`Política de Seguridad creada: ${securityPolicy.title}`);
    } catch (securityPolicyError) {
      console.error(`Error creando Política de Seguridad ${securityPolicy.title}:`, securityPolicyError.message);
    }
  }

  console.log(`Política de Seguridad poblada: ${securityPoliciesData.length} secciones`);
};

export default populateSecurityPolicies;
