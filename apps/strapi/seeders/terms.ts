import type { Core } from "@strapi/strapi";

const termsData = [
  {
    order: 1,
    title: "Conceptos clave",
    text: "<p>Antes de que empieces a publicar o buscar activos industriales en la plataforma, queremos que entiendas con claridad cómo funciona esto y qué reglas seguimos todos. Aquí van algunas palabras que vas a ver seguido:</p><ul><li><strong>Waldo.click</strong>: la plataforma donde publicas y encuentras avisos de productos industriales.</li><li><strong>Usuario</strong>: cualquier persona o empresa que entra, se registra o usa la plataforma.</li><li><strong>Anunciante</strong>: quien publica un producto.</li><li><strong>Comprador</strong>: quien mira publicaciones o contacta a un anunciante.</li><li><strong>Producto</strong>: máquinas, equipos, vehículos industriales, repuestos, insumos o cualquier activo industrial publicado.</li><li><strong>Contenido</strong>: fotos, textos, videos, fichas técnicas o cualquier información que subas.</li><li><strong>APDP</strong>: la Agencia de Protección de Datos Personales (el organismo que fiscaliza la Ley 21.719).</li><li><strong>ANCI</strong>: la Agencia Nacional de Ciberseguridad (el organismo que fiscaliza la Ley 21.663).</li></ul>",
  },
  {
    order: 2,
    title: "¿Qué es Waldo.click®?",
    text: "<p>Somos una vitrina digital: conectamos a quienes quieren vender activos industriales con quienes quieren comprarlos, y nada más que eso.</p><p>Esto significa que <strong>nosotros no</strong>:</p><ul><li>Compramos ni vendemos productos.</li><li>Nos metemos en las negociaciones.</li><li>Representamos a compradores ni a vendedores.</li><li>Actuamos como mandatarios de nadie.</li><li>Participamos en la firma de contratos.</li><li>Recibimos o tocamos físicamente los productos.</li><li>Administramos los pagos entre las partes.</li><li>Aseguramos que una venta se concrete.</li></ul><p>En corto: si compras o vendes algo a través de Waldo.click, la responsabilidad de esa transacción es entre tú y la otra parte, no nuestra.</p>",
  },
  {
    order: 3,
    title: "Aceptación de estos términos",
    text: "<p>Usar Waldo.click implica que estás de acuerdo con todo lo que dice este documento. Si hay algo que no te acomoda, lo mejor es que no uses el servicio.</p>",
  },
  {
    order: 4,
    title: "¿Quién puede usar la plataforma?",
    text: "<p>Puedes crear una cuenta si:</p><ul><li>Eres una persona natural mayor de 18 años, o</li><li>Representas a una empresa legalmente constituida.</li></ul><p>Al registrarte, estás declarando que tienes la capacidad legal para contratar.</p>",
  },
  {
    order: 5,
    title: "Registro de cuenta",
    text: "<p>Cuando te registras, la información que nos das debe ser real, completa y estar al día. Nosotros, por nuestro lado, podemos:</p><ul><li>Pedirte antecedentes adicionales.</li><li>Verificar lo que nos entregaste.</li><li>Rechazar tu registro.</li><li>Suspender o cancelar tu cuenta.</li></ul><p>Esto lo hacemos cuando hay indicios razonables de fraude, mal uso de la plataforma o incumplimiento de estos términos — no porque sí.</p>",
  },
  {
    order: 6,
    title: "Seguridad de tu cuenta",
    text: "<p>Tú eres responsable de mantener tus credenciales en secreto, usar una contraseña segura y evitar que alguien más entre a tu cuenta sin permiso. Cualquier cosa que se haga desde tu cuenta se entiende hecha por ti.</p>",
  },
  {
    order: 7,
    title: "Tus publicaciones",
    text: "<p>Si publicas algo, estás declarando que:</p><ul><li>Tienes derecho a ofrecer ese producto.</li><li>Tienes las facultades para difundir esa información.</li><li>Todo lo que escribiste es verdadero.</li><li>No estás pisando los derechos de nadie más (marcas, propiedad intelectual, etc.).</li></ul>",
  },
  {
    order: 8,
    title: "Información de los productos",
    text: "<p>La descripción de cada producto es responsabilidad exclusiva de quien lo publica (el anunciante). Waldo.click no garantiza que el producto exista, esté en buen estado, funcione, tenga cierto valor, sea legal, esté disponible o le pertenezca a quien lo publicó.</p><p>Por eso, antes de cerrar cualquier negocio, haz tus propias verificaciones. Nunca está de más revisar en terreno.</p>",
  },
  {
    order: 9,
    title: "Revisión de anuncios",
    text: "<p>Nos reservamos el derecho de revisar publicaciones, pedir aclaraciones, corregir errores obvios, rechazar anuncios o eliminar contenido. Que revisemos un anuncio no significa que nos hacemos responsables de lo que dice — la responsabilidad sigue siendo del anunciante.</p>",
  },
  {
    order: 10,
    title: "Contenido prohibido",
    text: "<p>No está permitido subir:</p><ul><li>Información falsa.</li><li>Productos que no existen.</li><li>Material fraudulento.</li><li>Bienes robados o de origen ilícito.</li><li>Contenido engañoso o ilegal.</li><li>Material que vulnere derechos de terceros.</li><li>Software malicioso.</li><li>Cualquier cosa pensada para cometer delitos.</li></ul>",
  },
  {
    order: 11,
    title: "Servicios de pago",
    text: "<p>Además de las publicaciones gratuitas, podemos ofrecer opciones pagadas como destacados, promociones o servicios de marketing. Los precios se publicarán oportunamente en la plataforma.</p>",
  },
  {
    order: 12,
    title: "Facturación y pagos",
    text: "<p>Los pagos se procesan a través de proveedores externos (pasarelas de pago). Nosotros no guardamos directamente los datos de tu tarjeta. Una vez que se confirma tu pago, activamos el servicio contratado.</p>",
  },
  {
    order: 13,
    title: "Reembolsos",
    text: "<p>Si un servicio no se puede prestar por una causa que es responsabilidad exclusivamente nuestra, podemos devolverte el dinero o dejarte un saldo a favor. Eso sí, no proceden indemnizaciones adicionales.</p>",
  },
  {
    order: 14,
    title: "Propiedad intelectual",
    text: "<p>El software, las bases de datos, el diseño, la marca, el logo y todo el desarrollo de la plataforma nos pertenece a nosotros o a sus respectivos dueños. No está permitido copiar ni reproducir nada de esto sin autorización.</p>",
  },
  {
    order: 15,
    title: "Licencia sobre tu contenido",
    text: "<p>Cuando publicas contenido (fotos, textos, videos), nos das permiso para usarlo con fines operativos y promocionales. Ese permiso es:</p><ul><li>No exclusivo (tú puedes seguir usando tu contenido donde quieras).</li><li>Válido en cualquier país.</li><li>Gratuito.</li><li>Se acaba automáticamente si eliminas tu publicación.</li></ul>",
  },
  {
    order: 16,
    title: "Protección de datos personales",
    text: '<p>Cómo tratamos tus datos está explicado en detalle en nuestra <a href="/politicas-de-privacidad">Política de Privacidad</a>, hecha conforme a la Ley 21.719. Al usar la plataforma, también estás aceptando esa política.</p><p>Si en algún momento quieres ejercer tus derechos sobre tus datos, escríbenos a contacto@waldo.click. Y si sientes que tus derechos fueron vulnerados, puedes reclamar directamente ante la APDP.</p>',
  },
  {
    order: 17,
    title: "Ciberseguridad",
    text: "<p>Hacemos lo posible por proteger la confidencialidad, integridad, disponibilidad y capacidad de recuperación de la información en la plataforma, tal como lo exige la Ley 21.663. Dicho esto, ningún sistema puede garantizar una seguridad absoluta.</p>",
  },
  {
    order: 18,
    title: "Incidentes de seguridad",
    text: "<p>Podemos tomar medidas inmediatas para contener el problema, proteger a los usuarios, resguardar nuestra infraestructura o incluso suspender temporalmente algún servicio. Si el incidente lo amerita, avisaremos a la ANCI dentro de los plazos que exige la ley, y si además hay datos personales comprometidos, también avisaremos a la APDP.</p>",
  },
  {
    order: 19,
    title: "Disponibilidad del servicio",
    text: '<p>Entregamos la plataforma "tal cual está" y "según disponibilidad". No podemos prometerte que funcionará sin interrupciones, sin errores, o que será compatible con absolutamente todo.</p>',
  },
  {
    order: 20,
    title: "Limitación de responsabilidad",
    text: "<p>En la máxima medida que la ley chilena lo permite, no respondemos por:</p><ul><li>Lo que negocies con otro usuario.</li><li>Incumplimientos de contratos entre usuarios.</li><li>Pérdidas de negocio o lucro cesante.</li><li>Daños indirectos o al prestigio de tu empresa.</li><li>Información que haya publicado un tercero.</li></ul>",
  },
  {
    order: 21,
    title: "Sitios y servicios de terceros",
    text: "<p>Puede que encuentres enlaces a sitios externos dentro de la plataforma. No controlamos ni nos hacemos responsables de lo que pase en esos sitios de terceros.</p>",
  },
  {
    order: 22,
    title: "Suspensión o cancelación de cuenta",
    text: "<p>Podemos suspender o cerrar tu cuenta si detectamos fraude, mal uso, riesgo de seguridad o incumplimiento de estos términos.</p>",
  },
  {
    order: 23,
    title: "Fuerza mayor",
    text: "<p>Si algo escapa de nuestro control razonable (catástrofes, cortes masivos, etc.) y eso nos impide cumplir, no seremos responsables por ese incumplimiento.</p>",
  },
  {
    order: 24,
    title: "Cambios a estos términos",
    text: "<p>Podemos actualizar estos términos de vez en cuando. Los cambios rigen desde que se publican en la plataforma, y si son cambios importantes, te avisaremos.</p>",
  },
  {
    order: 25,
    title: "Validez parcial",
    text: "<p>Que una cláusula puntual quede sin efecto no invalida todo lo demás. El resto sigue vigente igual.</p>",
  },
  {
    order: 26,
    title: "Ley chilena y jurisdicción",
    text: "<p>Todo esto se rige por las leyes de <strong>República de Chile</strong>, y cualquier conflicto se resuelve ante los tribunales chilenos.</p>",
  },
  {
    order: 27,
    title: "¿Cómo contactarnos?",
    text: "<p>¿Dudas? Escríbenos:</p><p><strong>Waldo.click®</strong><br>contacto@waldo.click<br>Santiago, Chile</p>",
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
