import type { Core } from "@strapi/strapi";

const termsData = [
  {
    order: 1,
    title: "Conceptos clave",
    text: "<p>Para efectos de estos Términos y Condiciones, los siguientes términos tienen el significado indicado:</p><p><strong>Waldo.click®:</strong> Plataforma tecnológica de publicación y difusión de anuncios industriales.</p><p><strong>Plataforma:</strong> Sitio web, aplicaciones, sistemas informáticos, APIs, servicios y herramientas operadas bajo la marca Waldo.click®.</p><p><strong>Usuario:</strong> Toda persona natural o jurídica que accede, navega, se registra o utiliza la Plataforma.</p><p><strong>Anunciante:</strong> Usuario que publica información relativa a Productos.</p><p><strong>Comprador:</strong> Usuario que consulta publicaciones o contacta anunciantes.</p><p><strong>Producto:</strong> Activo industrial, equipo, maquinaria, vehículo industrial, repuesto, insumo o bien relacionado publicado en la Plataforma.</p><p><strong>Contenido:</strong> Toda información, imágenes, documentos, videos, especificaciones técnicas, marcas o datos incorporados por los usuarios.</p><p><strong>APDP:</strong> Agencia de Protección de Datos Personales, autoridad de control creada por la Ley N° 21.719.</p><p><strong>ANCI:</strong> Agencia Nacional de Ciberseguridad, autoridad de control creada por la Ley N° 21.663.</p>",
  },
  {
    order: 2,
    title: "¿Qué es Waldo.click®?",
    text: "<p>Waldo.click® es una plataforma de marketing digital y difusión de información que facilita el contacto entre compradores y vendedores de activos industriales.</p><p>La Plataforma es <em>exclusivamente</em> una herramienta tecnológica de publicación y comunicación. Esto significa que Waldo.click® <strong>no</strong>:</p><ul><li>Compra ni vende Productos</li><li>Participa en negociaciones entre usuarios</li><li>Representa a compradores o vendedores</li><li>Recibe mandato para actuar por cuenta de los usuarios</li><li>Interviene en la celebración de contratos</li><li>Toma posesión física de los Productos</li><li>Administra pagos entre usuarios</li><li>Garantiza el cierre de operaciones</li></ul><p>Toda transacción es responsabilidad exclusiva de las partes involucradas.</p>",
  },
  {
    order: 3,
    title: "Aceptación de estos términos",
    text: "<p>El acceso y uso de la Plataforma implica la <strong>aceptación íntegra</strong> de estos Términos y Condiciones.</p><p>Si no estás de acuerdo con alguna disposición, debes abstenerte de utilizar el servicio.</p>",
  },
  {
    order: 4,
    title: "¿Quién puede usar la plataforma?",
    text: "<p>Solo pueden registrarse y usar la Plataforma:</p><ul><li>Personas naturales mayores de 18 años</li><li>Personas jurídicas debidamente constituidas</li></ul><p>Al registrarte, declaras tener capacidad legal suficiente para contratar y obligarte bajo estos términos.</p>",
  },
  {
    order: 5,
    title: "Registro de cuenta",
    text: "<p>Al registrarte, debes proporcionar información <strong>verdadera, completa y actualizada</strong>.</p><p>Waldo.click® puede solicitar antecedentes adicionales, verificar la información entregada, rechazar registros, suspender cuentas o cancelarlas cuando existan indicios razonables de fraude, uso indebido o incumplimiento de estos términos.</p>",
  },
  {
    order: 6,
    title: "Seguridad de tu cuenta",
    text: "<p>Eres responsable de:</p><ul><li>Mantener la confidencialidad de tus credenciales de acceso</li><li>Utilizar contraseñas seguras</li><li>Proteger tu cuenta de accesos no autorizados</li></ul><p>Toda actividad realizada desde tu cuenta se considera realizada por ti. Si detectas un acceso no autorizado, notifícanos de inmediato.</p>",
  },
  {
    order: 7,
    title: "Tus publicaciones",
    text: "<p>Al publicar información en la Plataforma, declaras que:</p><ul><li>Tienes derecho para ofrecer el Producto</li><li>Posees las facultades necesarias para difundir la información</li><li>La información publicada es veraz y precisa</li><li>El contenido no infringe derechos de terceros</li></ul>",
  },
  {
    order: 8,
    title: "Información de los productos",
    text: "<p>La descripción de los Productos es responsabilidad <strong>exclusiva del Anunciante</strong>.</p><p>Waldo.click® no garantiza la existencia, estado, calidad, funcionamiento, valor comercial, titularidad, legalidad ni disponibilidad de los Productos publicados.</p><p>Antes de concretar cualquier operación, los usuarios deben realizar sus propias verificaciones.</p>",
  },
  {
    order: 9,
    title: "Revisión de anuncios",
    text: "<p>Waldo.click® puede revisar las publicaciones, solicitar aclaraciones, corregir errores evidentes, rechazar anuncios y eliminar contenido que no cumpla con estos términos.</p><p>El ejercicio de esta facultad <em>no implica</em> que Waldo.click® asuma responsabilidad por la información publicada.</p>",
  },
  {
    order: 10,
    title: "Contenido prohibido",
    text: "<p>Está estrictamente <strong>prohibido</strong> publicar:</p><ul><li>Información falsa o engañosa</li><li>Productos inexistentes o ficticios</li><li>Material fraudulento</li><li>Propiedad robada o de origen ilícito</li><li>Contenido ilegal de cualquier tipo</li><li>Material que vulnere derechos de terceros</li><li>Software malicioso o código dañino</li><li>Información destinada a cometer delitos</li></ul>",
  },
  {
    order: 11,
    title: "Servicios de pago",
    text: "<p>La Plataforma puede ofrecer servicios adicionales de pago, como:</p><ul><li>Publicaciones premium</li><li>Anuncios destacados</li><li>Promociones especiales</li><li>Servicios de marketing digital</li></ul><p>Los precios y condiciones de cada servicio serán publicados oportunamente en la Plataforma.</p>",
  },
  {
    order: 12,
    title: "Facturación y pagos",
    text: "<p>Los pagos son procesados a través de proveedores externos certificados. Waldo.click® <strong>no almacena directamente</strong> información de tarjetas bancarias ni datos de pago sensibles.</p><p>Los servicios contratados se activarán una vez que el pago sea confirmado por el proveedor correspondiente.</p>",
  },
  {
    order: 13,
    title: "Reembolsos",
    text: "<p>Si un servicio no puede prestarse por causas imputables exclusivamente a Waldo.click®, la Plataforma puede:</p><ul><li>Reembolsar el monto pagado</li><li>Otorgar saldo a favor para uso futuro</li></ul><p>No procederán indemnizaciones adicionales por este concepto.</p>",
  },
  {
    order: 14,
    title: "Propiedad intelectual",
    text: "<p>La Plataforma, su software, bases de datos, diseños, marcas, logos, contenidos y desarrollos asociados son propiedad de Waldo.click® o de sus respectivos titulares.</p><p>Queda <strong>prohibida</strong> cualquier reproducción, distribución, modificación o uso no autorizado de estos elementos.</p>",
  },
  {
    order: 15,
    title: "Licencia sobre tu contenido",
    text: "<p>Al publicar contenido en la Plataforma, otorgas a Waldo.click® una licencia:</p><ul><li>No exclusiva</li><li>Mundial</li><li>Gratuita</li><li>Revocable al eliminar la publicación</li><li>Limitada a fines operativos y promocionales de la Plataforma</li></ul>",
  },
  {
    order: 16,
    title: "Protección de datos personales",
    text: "<p>El tratamiento de tus datos personales se rige por la <strong>Política de Privacidad de Waldo.click®</strong>, elaborada conforme a la <em>Ley N° 21.719 sobre Protección de Datos Personales</em>. Al usar la Plataforma, aceptas dicha política.</p><p>Puedes ejercer tus derechos escribiendo a <strong>contacto@waldo.click</strong>, o presentar reclamaciones ante la <strong>Agencia de Protección de Datos Personales (APDP)</strong> en caso de vulneración de tus derechos.</p>",
  },
  {
    order: 17,
    title: "Ciberseguridad",
    text: "<p>Waldo.click® implementa medidas técnicas y organizativas razonables para proteger la confidencialidad, integridad, disponibilidad y resiliencia de la información, conforme a la <em>Ley N° 21.663 Marco de Ciberseguridad</em>.</p><p>Sin perjuicio de lo anterior, ningún sistema puede garantizar seguridad absoluta.</p>",
  },
  {
    order: 18,
    title: "Incidentes de seguridad",
    text: "<p>Ante un incidente de seguridad, Waldo.click® puede adoptar medidas inmediatas para:</p><ul><li>Contener el incidente</li><li>Proteger a los usuarios afectados</li><li>Resguardar la infraestructura</li><li>Suspender temporalmente servicios si es necesario</li></ul><p>En cumplimiento de la Ley N° 21.663, notificará a la <strong>Agencia Nacional de Ciberseguridad (ANCI)</strong> dentro de los plazos legales. Si hay datos personales afectados, también notificará a la <strong>APDP</strong> conforme a la Ley N° 21.719.</p>",
  },
  {
    order: 19,
    title: "Disponibilidad del servicio",
    text: '<p>La Plataforma se ofrece <em>"tal cual"</em> y <em>"según disponibilidad"</em>.</p><p>Waldo.click® no garantiza operación ininterrumpida, ausencia de errores técnicos ni compatibilidad con todos los dispositivos o navegadores.</p>',
  },
  {
    order: 20,
    title: "Limitación de responsabilidad",
    text: "<p>En la máxima medida permitida por la legislación chilena, Waldo.click® no asume responsabilidad por:</p><ul><li>Negociaciones o transacciones entre usuarios</li><li>Incumplimientos contractuales entre las partes</li><li>Pérdidas de negocios o lucro cesante</li><li>Daños indirectos o reputacionales</li><li>Información publicada por terceros en la Plataforma</li></ul>",
  },
  {
    order: 21,
    title: "Sitios y servicios de terceros",
    text: "<p>La Plataforma puede contener enlaces a sitios o servicios externos. Waldo.click® no controla esos servicios y no asume responsabilidad por su contenido, privacidad ni funcionamiento.</p>",
  },
  {
    order: 22,
    title: "Suspensión o cancelación de cuenta",
    text: "<p>Waldo.click® puede suspender o cancelar una cuenta cuando existan indicios de:</p><ul><li>Fraude o uso indebido de la Plataforma</li><li>Riesgo de seguridad para otros usuarios</li><li>Incumplimiento de estos términos</li></ul>",
  },
  {
    order: 23,
    title: "Fuerza mayor",
    text: "<p>Waldo.click® no será responsable por incumplimientos derivados de hechos fuera de su control razonable, como desastres naturales, fallas de infraestructura de terceros, actos de autoridad u otros eventos de fuerza mayor.</p>",
  },
  {
    order: 24,
    title: "Cambios a estos términos",
    text: "<p>Estos Términos y Condiciones pueden actualizarse periódicamente. Los cambios entrarán en vigor desde su publicación en la Plataforma.</p><p>Te avisaremos cuando los cambios sean sustanciales.</p>",
  },
  {
    order: 25,
    title: "Validez parcial",
    text: "<p>Si alguna disposición de estos términos es declarada inválida o inaplicable, las restantes disposiciones permanecerán vigentes y con plena validez.</p>",
  },
  {
    order: 26,
    title: "Ley chilena y jurisdicción",
    text: "<p>Estos Términos y Condiciones se rigen por las leyes de la <strong>República de Chile</strong>.</p><p>Cualquier controversia que surja de su aplicación o interpretación será sometida a los tribunales competentes de Chile.</p>",
  },
  {
    order: 27,
    title: "¿Cómo contactarnos?",
    text: "<p>Si tienes preguntas o consultas sobre estos términos, puedes contactarnos en:</p><p><strong>Waldo.click®</strong><br>contacto@waldo.click<br>Santiago, Chile</p>",
  },
];

const populateTerms = async (strapi: Core.Strapi): Promise<void> => {
  console.log("Poblando Términos y Condiciones...");

  const existing = await strapi.db
    .query("api::term.term")
    .findMany({ where: {} });

  if (existing.length > 0) {
    await strapi.db.query("api::term.term").deleteMany({ where: {} });
    console.log(
      `Eliminados ${existing.length} registros anteriores de Términos y Condiciones`,
    );
  }

  for (const term of termsData) {
    try {
      await strapi.db.query("api::term.term").create({
        data: { title: term.title, text: term.text, order: term.order },
      });
      console.log(`Término creado: ${term.title}`);
    } catch (termError) {
      console.error(`Error creando Término ${term.title}:`, termError.message);
    }
  }

  console.log(`Términos y Condiciones poblados: ${termsData.length} secciones`);
};

export default populateTerms;
