import type { Core } from "@strapi/strapi";

const policiesData = [
  {
    order: 1,
    title: "¿Qué regula esta política?",
    text: "<p>Tu privacidad nos importa. Aquí te contamos, en palabras simples, qué datos tuyos usamos, para qué y qué derechos tienes sobre ellos.</p><p>Este documento cumple con la <em>Ley N° 21.719 sobre Protección de Datos Personales</em> y es parte integral de nuestros Términos y Condiciones. Explica cómo tratamos tus datos personales cuando usas Waldo.click, ya sea como visitante, usuario registrado, anunciante o comprador.</p>",
  },
  {
    order: 2,
    title: "¿Quién gestiona tus datos?",
    text: "<p><strong>Waldo.click®</strong><br>contacto@waldo.click<br>Santiago, Chile</p><p>También contamos con un Delegado de Protección de Datos (DPD), que es tu punto de contacto directo para cualquier tema relacionado con tus datos o el ejercicio de tus derechos, tal como lo exige la ley.</p><p>Contacto DPD: <strong>contacto@waldo.click</strong></p>",
  },
  {
    order: 3,
    title: "¿A quién aplica esta política?",
    text: "<p>A todos: visitantes del sitio, usuarios registrados, anunciantes, compradores, representantes de empresas, potenciales clientes y a cualquiera que nos contacte.</p>",
  },
  {
    order: 4,
    title: "Conceptos clave",
    text: "<ul><li><strong>Dato personal</strong>: cualquier información que te identifique o pueda identificarte.</li><li><strong>Dato sensible</strong>: información especialmente delicada, como salud, origen racial, opiniones políticas, creencias religiosas o vida sexual.</li><li><strong>Titular</strong>: tú, la persona dueña de sus datos.</li><li><strong>Responsable del tratamiento</strong>: quien decide para qué se usan tus datos (nosotros).</li><li><strong>Encargado del tratamiento</strong>: un tercero que procesa datos por encargo nuestro (por ejemplo, un proveedor de hosting).</li><li><strong>APDP</strong>: la Agencia de Protección de Datos Personales, el organismo fiscalizador.</li><li><strong>Anonimización</strong>: cuando un dato deja de poder identificarte.</li></ul>",
  },
  {
    order: 5,
    title: "¿Qué datos recopilamos?",
    text: "<p>Dependiendo de cómo uses la plataforma, podemos recopilar:</p><p><strong>Datos de identificación</strong>: nombre, apellidos, empresa, cargo, RUT, país, región, ciudad.</p><p><strong>Datos de contacto</strong>: correo electrónico, teléfono, dirección comercial.</p><p><strong>Datos de tu cuenta</strong>: usuario, contraseña (siempre cifrada), fecha de registro.</p><p><strong>Datos comerciales</strong>: productos que publicaste, historial de tus anuncios, consultas que recibiste, tu actividad en la plataforma.</p><p><strong>Datos técnicos</strong>: dirección IP, navegador, sistema operativo, identificadores de tu dispositivo, cookies y registros de actividad.</p><p><strong>Datos sensibles</strong>: no los pedimos ni los buscamos. Pero si tú decides incluir algún dato sensible en la plataforma por tu cuenta, ese tratamiento queda sujeto a reglas especiales de la ley, y en general vamos a necesitar tu consentimiento explícito.</p>",
  },
  {
    order: 6,
    title: "¿Para qué usamos tus datos?",
    text: "<ul><li><strong>Para que la plataforma funcione</strong>: crear tu cuenta, gestionar tu acceso, publicar tus anuncios, mostrar tu información de contacto.</li><li><strong>Para prestarte servicios</strong>: gestionar lo que contrataste, facturar, darte soporte.</li><li><strong>Para tu seguridad</strong>: prevenir fraude, detectar accesos indebidos, proteger nuestros sistemas.</li><li><strong>Para mejorar el sitio</strong>: medir tráfico, entender cómo usas la plataforma, optimizar funcionalidades.</li><li><strong>Para comunicarnos contigo</strong>: avisos operativos, notificaciones de tu cuenta, soporte técnico.</li><li><strong>Para marketing</strong> (cuando corresponde legalmente): novedades, promociones, eventos o servicios relacionados.</li></ul>",
  },
  {
    order: 7,
    title: "¿Con qué fundamento legal tratamos tus datos?",
    text: "<p>La ley exige que todo tratamiento de datos tenga una base legal detrás. Estas son las que usamos:</p><ul><li><strong>Porque hay un contrato de por medio</strong>: necesitamos tus datos para darte el servicio que pediste.</li><li><strong>Porque nos diste tu consentimiento</strong>: libre, informado, específico e inequívoco. Puedes retirarlo cuando quieras, sin que eso afecte lo ya hecho.</li><li><strong>Porque la ley nos obliga</strong>: hay casos en que simplemente debemos cumplir una obligación legal.</li><li><strong>Por interés legítimo</strong>: cuando el tratamiento nos beneficia a nosotros o a un tercero, siempre que no pase por encima de tus derechos. Antes de usar esta base, hacemos un análisis de proporcionalidad.</li><li><strong>Por interés vital</strong>: cuando es necesario para proteger tu vida o la de otra persona.</li><li><strong>Por una misión de interés público</strong>: cuando la ley nos encarga cumplir un rol de interés público.</li></ul>",
  },
  {
    order: 8,
    title: "Datos obligatorios y opcionales",
    text: "<p>Algunos datos son necesarios para que puedas usar ciertas funciones — si no los das, puede que no accedas a ese servicio. En cada formulario te indicamos cuáles datos son obligatorios y cuáles no.</p>",
  },
  {
    order: 9,
    title: "Menores de edad",
    text: "<p>Waldo.click es para mayores de 18 años. No recopilamos datos de menores a propósito.</p>",
  },
  {
    order: 10,
    title: "¿Con quién compartimos tus datos?",
    text: "<ul><li><strong>Proveedores tecnológicos</strong>: hosting, servicios en la nube, seguridad informática, correo electrónico.</li><li><strong>Procesadores de pago</strong>: Webpay, Transbank u otros proveedores autorizados.</li><li><strong>Autoridades</strong>: solo cuando exista una obligación legal o un requerimiento de una autoridad competente.</li></ul>",
  },
  {
    order: 11,
    title: "Transferencias fuera de Chile",
    text: "<p>Algunos de nuestros proveedores tecnológicos están fuera de Chile. Cuando eso pasa, nos aseguramos de que exista una garantía adecuada: ya sea que el país de destino tenga un nivel de protección reconocido por la APDP, que usemos cláusulas contractuales tipo aprobadas por ella, o que te pidamos tu consentimiento explícito cuando corresponda. No transferimos datos fuera del país sin una de estas garantías.</p>",
  },
  {
    order: 12,
    title: "¿Cuánto tiempo guardamos tus datos?",
    text: "<p>Mientras exista una relación activa contigo, mientras la ley nos obligue a conservarlos, mientras haya obligaciones pendientes entre nosotros, o mientras estén vigentes los plazos legales para eventuales reclamos. Una vez que se cumplen esos plazos, eliminamos o anonimizamos tus datos de forma segura.</p>",
  },
  {
    order: 13,
    title: "Tus derechos sobre tus datos",
    text: "<p>La Ley 21.719 te da estos derechos, y puedes ejercerlos todos:</p><ul><li><strong>Acceso</strong>: saber qué datos tenemos tuyos, para qué los usamos, de dónde vienen y a quién se los pasamos.</li><li><strong>Rectificación</strong>: corregir datos que estén malos o incompletos.</li><li><strong>Supresión (olvido)</strong>: pedir que borremos tus datos cuando ya no exista una razón legal para conservarlos.</li><li><strong>Oposición</strong>: oponerte a que usemos tus datos en ciertos casos previstos por la ley.</li><li><strong>Portabilidad</strong>: pedir una copia de tus datos en un formato electrónico que puedas llevarte a otro lado, cuando sea técnicamente posible.</li><li><strong>Bloqueo</strong>: pedir que restrinjamos temporalmente el uso de tus datos mientras se resuelve una duda sobre su exactitud o legalidad.</li><li><strong>No ser evaluado solo por un algoritmo</strong>: si una decisión automatizada te afecta de forma significativa, tienes derecho a pedir que una persona la revise, dar tu opinión y reclamar esa decisión.</li></ul>",
  },
  {
    order: 14,
    title: "¿Cómo ejercer tus derechos?",
    text: "<p>Escríbenos a <strong>contacto@waldo.click</strong> (también es el correo de nuestro Delegado de Protección de Datos). Te responderemos dentro de 30 días hábiles desde que recibimos tu solicitud — ese plazo se puede extender una vez, por el mismo período, avisándote. Tu primera solicitud siempre es gratis.</p><p>Podemos pedirte algunos antecedentes para confirmar que realmente eres tú quien solicita. Y si sientes que tus derechos fueron vulnerados, siempre puedes reclamar ante la APDP.</p>",
  },
  {
    order: 15,
    title: "Decisiones automatizadas",
    text: "<p>Usamos herramientas automatizadas para ordenar publicaciones, mostrar resultados, recomendarte contenido o detectar fraude. Ninguna de estas herramientas está diseñada para tomar decisiones exclusivamente automatizadas que tengan efectos legales importantes sobre ti.</p>",
  },
  {
    order: 16,
    title: "¿Cómo protegemos tu información?",
    text: "<p>Aplicamos medidas técnicas, administrativas y organizativas razonables para protegerte de accesos no autorizados, alteraciones, pérdidas, filtraciones o destrucción accidental de tu información.</p>",
  },
  {
    order: 17,
    title: "Incidentes de seguridad",
    text: "<p>Si ocurre un incidente que afecte tus datos personales, cumplimos con lo que exige el artículo 26 de la Ley 21.719: notificamos a la APDP dentro del plazo legal, y si el incidente representa un riesgo significativo para tus derechos, también te avisamos a ti directamente, contándote qué pasó, qué datos se vieron afectados y qué medidas tomamos.</p>",
  },
  {
    order: 18,
    title: "Uso de cookies",
    text: '<p>También usamos cookies y tecnologías similares. Todo eso está explicado en detalle en nuestra <a href="/politicas-de-cookies">Política de Cookies</a>.</p>',
  },
  {
    order: 19,
    title: "Cambios a esta política",
    text: "<p>Podemos actualizar este documento cuando sea necesario. Cada vez que lo hagamos, publicaremos la nueva versión con su fecha, y si el cambio es importante, te lo haremos saber.</p>",
  },
  {
    order: 20,
    title: "¿Cómo contactarnos?",
    text: "<p><strong>Privacidad Waldo.click®</strong><br>contacto@waldo.click<br>Delegado de Protección de Datos: contacto@waldo.click<br>Santiago, Chile</p><p><strong>Agencia de Protección de Datos Personales (APDP)</strong><br>Si sientes que tus derechos fueron vulnerados, puedes reclamar directamente ante la APDP, siguiendo los procedimientos que establece la Ley 21.719.</p>",
  },
];

const populatePolicies = async (strapi: Core.Strapi): Promise<void> => {
  console.log("Poblando Política de Privacidad...");

  const existing = await strapi.db
    .query("api::policy.policy")
    .findMany({ where: {} });

  if (existing.length > 0) {
    await strapi.db.query("api::policy.policy").deleteMany({ where: {} });
    console.log(
      `Eliminados ${existing.length} registros anteriores de Política de Privacidad`,
    );
  }

  for (const policy of policiesData) {
    try {
      await strapi.db.query("api::policy.policy").create({
        data: { title: policy.title, text: policy.text, order: policy.order },
      });
      console.log(`Política creada: ${policy.title}`);
    } catch (policyError) {
      console.error(
        `Error creando Política ${policy.title}:`,
        policyError.message,
      );
    }
  }

  console.log(
    `Política de Privacidad poblada: ${policiesData.length} secciones`,
  );
};

export default populatePolicies;
