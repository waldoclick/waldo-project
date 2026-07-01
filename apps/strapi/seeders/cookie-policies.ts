import type { Core } from "@strapi/strapi";

const cookiePoliciesData = [
  {
    order: 1,
    title: "¿Qué regula la política de cookies?",
    text: "<p>Esta Política de Cookies explica cómo <strong>Waldo.click®</strong> utiliza cookies, tecnologías similares y otras herramientas de seguimiento cuando visitas el sitio web, usas sus servicios o interactúas con contenidos publicados en la Plataforma.</p><p>Esta política complementa los Términos y Condiciones y la Política de Privacidad de Waldo.click®, y se ha elaborado conforme a la <em>Ley N° 21.719 sobre Protección de Datos Personales</em>.</p><p>Un <strong>cookie</strong> es un archivo de texto pequeño que tu navegador guarda cuando visitas una página web. Gracias a eso, un sitio puede recordar tus preferencias, mantener tu sesión iniciada, mejorar tu experiencia de navegación, detectar errores técnicos o mostrarte contenido más relevante para ti.</p>",
  },
  {
    order: 2,
    title: "Tecnologías similares",
    text: '<p>Además de cookies "clásicas", Waldo.click® también puede utilizar tecnologías parecidas, tales como:</p><ul><li>Almacenamiento local del navegador (Local Storage, Session Storage)</li><li>Píxeles de seguimiento</li><li>Identificadores de dispositivo</li><li>Otras herramientas de medición equivalentes</li></ul><p>A efectos de esta política, todas ellas se denominan conjuntamente <strong>"Cookies"</strong> para simplificar.</p>',
  },
  {
    order: 3,
    title: "Tipos de cookies que usamos",
    text: "<p>Utilizamos distintas categorías de cookies según su función:</p><p><strong>Cookies estrictamente necesarias</strong><br>Son las que hacen que la Plataforma funcione: iniciar sesión, seguridad, gestión de tu sesión y preferencias básicas. No requieren tu consentimiento porque, sin ellas, el sitio simplemente no funciona.</p><p><strong>Cookies funcionales</strong><br>Recuerdan cosas como tu idioma, tu región o cualquier configuración personalizada que hayas hecho.</p><p><strong>Cookies analíticas</strong><br>Nos ayudan a entender cómo navegas: qué páginas visitas, cuánto tiempo te quedas, si el sitio va rápido o lento. Usamos herramientas como Google Analytics, Google Tag Manager, Microsoft Clarity o Hotjar (y eventualmente otras equivalentes).</p><p><strong>Cookies publicitarias</strong><br>Sirven para medir campañas, mostrarte anuncios más relevantes, evitar que veas el mismo aviso mil veces y evaluar si la publicidad realmente funciona. Acá entran Google Ads, Meta Ads, LinkedIn Ads y Microsoft Advertising.</p><p><strong>Cookies de rendimiento</strong><br>Nos avisan si algo se está cayendo: errores técnicos, problemas de carga, caídas del servicio.</p>",
  },
  {
    order: 4,
    title: "¿Para qué usamos las cookies?",
    text: "<p>Las cookies nos permiten:</p><ul><li><strong>Para que la plataforma funcione</strong>: mantener tu sesión activa, recordar tus configuraciones, gestionar tu login.</li><li><strong>Para tu seguridad</strong>: detectar accesos sospechosos, prevenir fraude, proteger tu cuenta.</li><li><strong>Para entender mejor el uso del sitio</strong>: analizar tráfico, ver qué funciones se usan más, mejorar tu experiencia.</li><li><strong>Para marketing</strong>: medir campañas, entender conversiones, optimizar la publicidad que te mostramos.</li></ul>",
  },
  {
    order: 5,
    title: "Cookies de terceros",
    text: "<p>Algunos servicios que usamos instalan sus propias cookies. Estos son los principales:</p><ul><li><strong>Google</strong>: Analytics, Ads, Tag Manager.</li><li><strong>Meta</strong>: Meta Pixel, Facebook Ads.</li><li><strong>LinkedIn</strong>: Insight Tag.</li><li><strong>Microsoft</strong>: Clarity, Advertising.</li><li><strong>Cloudflare</strong>: seguridad y protección contra ataques.</li></ul><p>Esta lista puede cambiar con el tiempo a medida que incorporemos o dejemos de usar herramientas.</p>",
  },
  {
    order: 6,
    title: "¿Cómo funciona el consentimiento?",
    text: '<p>Conforme a la Ley N° 21.719, si vamos a usar cookies que no sean estrictamente necesarias, tu autorización tiene que ser:</p><ul><li><strong>Libre</strong>: no te vamos a condicionar el acceso al sitio por no aceptarlas (salvo las necesarias, que sí son indispensables).</li><li><strong>Informada</strong>: te explicamos qué cookies se instalan y para qué.</li><li><strong>Específica</strong>: puedes aceptar por categoría, no todo junto a la fuerza.</li><li><strong>Previa</strong>: te preguntamos antes de instalar la cookie, no después.</li><li><strong>Afirmativa</strong>: tu silencio no cuenta como un "sí". Tienes que aceptar activamente.</li></ul><p>Por eso vas a ver un banner de cookies o un panel de configuración donde puedes elegir categoría por categoría. Las necesarias se activan solas, porque sin ellas el sitio no funciona.</p>',
  },
  {
    order: 7,
    title: "¿Cómo retirar el consentimiento?",
    text: "<p>Puedes ajustar tus preferencias en cualquier momento desde la configuración de tu navegador o el panel de cookies del sitio. Si retiras tu consentimiento, eso no afecta lo que ya se hizo con tus datos antes de retirarlo — solo aplica hacia adelante.</p>",
  },
  {
    order: 8,
    title: "Administración desde el navegador",
    text: "<p>Todos los navegadores te permiten bloquear cookies, eliminarlas, configurar excepciones o limitar el seguimiento.</p><p>Ten en cuenta que si desactivas ciertas cookies, es posible que algunas funciones de la Plataforma dejen de funcionar bien.</p>",
  },
  {
    order: 9,
    title: "Transferencias internacionales",
    text: "<p>Algunas cookies pueden implicar que tus datos viajen a proveedores fuera de Chile. Cuando esto pasa, nos aseguramos de que exista una protección adecuada — ya sea porque el país de destino tiene un nivel de protección reconocido por la APDP, o porque usamos cláusulas contractuales u otras garantías aprobadas por ella.</p>",
  },
  {
    order: 10,
    title: "¿Cuánto tiempo duran las cookies?",
    text: "<p>Las cookies pueden clasificarse según su duración:</p><ul><li><strong>Cookies de sesión</strong>: se borran solas cuando cierras el navegador.</li><li><strong>Cookies persistentes</strong>: se quedan guardadas por el período que defina cada proveedor.</li></ul>",
  },
  {
    order: 11,
    title: "Tus derechos sobre las cookies",
    text: "<p>Puedes ejercer los derechos que te da la Ley N° 21.719 escribiéndonos a <strong>contacto@waldo.click</strong>.</p><p>Si sientes que se vulneraron tus derechos, puedes reclamar ante la <strong>Agencia de Protección de Datos Personales (APDP)</strong>.</p>",
  },
  {
    order: 12,
    title: "Cambios a la política de cookies",
    text: "<p>Podemos actualizar esta política si cambia la ley, si incorporamos nuevas tecnologías o si cambiamos las herramientas que usamos.</p><p>Te avisaremos cuando los cambios sean sustanciales.</p>",
  },
  {
    order: 13,
    title: "Contacto — Cookies",
    text: "<p>Si tienes preguntas sobre el uso de cookies en la Plataforma, puedes contactarnos en:</p><p><strong>Waldo.click®</strong><br>contacto@waldo.click<br>Santiago, Chile</p>",
  },
];

const populateCookiePolicies = async (strapi: Core.Strapi): Promise<void> => {
  console.log("Poblando Política de Cookies...");

  const existing = await strapi.db
    .query("api::cookie-policy.cookie-policy")
    .findMany({ where: {} });

  if (existing.length > 0) {
    await strapi.db
      .query("api::cookie-policy.cookie-policy")
      .deleteMany({ where: {} });
    console.log(
      `Eliminados ${existing.length} registros anteriores de Política de Cookies`,
    );
  }

  for (const cookiePolicy of cookiePoliciesData) {
    try {
      await strapi.db.query("api::cookie-policy.cookie-policy").create({
        data: {
          title: cookiePolicy.title,
          text: cookiePolicy.text,
          order: cookiePolicy.order,
        },
      });
      console.log(`Política de Cookies creada: ${cookiePolicy.title}`);
    } catch (cookiePolicyError) {
      console.error(
        `Error creando Política de Cookies ${cookiePolicy.title}:`,
        cookiePolicyError.message,
      );
    }
  }

  console.log(
    `Política de Cookies poblada: ${cookiePoliciesData.length} secciones`,
  );
};

export default populateCookiePolicies;
