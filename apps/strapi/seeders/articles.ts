// /seeders/articles.ts
import type { Core } from "@strapi/strapi";

// Sample blog articles, each linked to ONE blog_category by slug. Spanish
// industrial content with multi-paragraph markdown bodies so read-time > 1 min
// and "Leer más" has real content. No cover/gallery media — the website card
// renders a category-hued wash when there is no cover.
const articlesData = [
  {
    title: "Cómo evaluar maquinaria usada antes de comprar",
    slug: "como-evaluar-maquinaria-usada-antes-de-comprar",
    categorySlug: "guia-de-compra",
    header:
      "Una guía práctica para inspeccionar equipos de segunda mano y evitar sorpresas costosas después de la compra.",
    body: `Comprar maquinaria usada puede ahorrarte una parte importante del presupuesto, pero también puede convertirse en un dolor de cabeza si no haces una evaluación rigurosa. Antes de cerrar cualquier trato, dedica tiempo a revisar el estado real del equipo.

## Revisa el historial de mantención

Pide la bitácora de mantenciones. Un equipo con registros completos suele haber tenido un cuidado constante. La ausencia de documentación no descalifica automáticamente la compra, pero sí debe encender una alerta y bajar el precio que estás dispuesto a pagar.

## Inspección física y prueba en operación

Nunca compres sin ver el equipo funcionando. Escucha el motor, observa fugas de aceite o refrigerante, revisa el desgaste de neumáticos u orugas y verifica el estado de las mangueras hidráulicas. Si no eres experto, lleva a un técnico de confianza.

## Documentación y trazabilidad

Confirma que el número de serie coincide con los papeles y que no existan deudas o prendas asociadas. Una verificación legal evita que heredes problemas del vendedor.

Con estos pasos reduces el riesgo y negocias con información concreta en la mano.`,
  },
  {
    title: "Tendencias del mercado de equipos industriales en Chile",
    slug: "tendencias-del-mercado-de-equipos-industriales-en-chile",
    categorySlug: "mercado",
    header:
      "Qué está moviendo la oferta y la demanda de activos industriales este año y cómo aprovecharlo.",
    body: `El mercado de activos industriales en Chile se mueve al ritmo de los grandes sectores productivos: minería, construcción, agricultura y transporte. Entender estas tendencias te ayuda a comprar y vender en el momento correcto.

## La demanda sigue a los proyectos

Cuando se reactivan proyectos de infraestructura, la demanda por maquinaria pesada y equipos de movimiento de tierra sube con fuerza. Seguir el calendario de licitaciones públicas y privadas te da una ventaja para anticipar precios.

## Usado vs nuevo

La incertidumbre económica empuja a muchas empresas hacia el mercado de segunda mano, donde el valor por peso invertido es mayor. Esto mantiene líquido el mercado usado y favorece a quienes venden equipos bien mantenidos.

## Cómo posicionar tu oferta

Si vendes, una publicación clara, con fotos reales y especificaciones completas, se transa más rápido. Si compras, comparar varias publicaciones del mismo tipo de equipo te da una referencia de precio confiable.`,
  },
  {
    title: "Plan de mantención preventiva para equipos pesados",
    slug: "plan-de-mantencion-preventiva-para-equipos-pesados",
    categorySlug: "mantencion",
    header:
      "Reduce fallas inesperadas y alarga la vida útil de tu maquinaria con un plan de mantención bien diseñado.",
    body: `La mantención preventiva no es un gasto, es una inversión que evita detenciones costosas y prolonga la vida útil de tus equipos. Un buen plan se construye sobre datos y disciplina.

## Define intervalos por horas de operación

La mayoría de los fabricantes entrega intervalos de servicio en horas de uso. Lleva un registro confiable del horómetro y programa cambios de aceite, filtros y revisiones según esos intervalos, no según el calendario.

## Inspecciones diarias

Antes de cada jornada, una inspección rápida de niveles, fugas y presión de neumáticos previene la mayoría de las fallas graves. Capacita a los operadores para que reporten cualquier anomalía.

## Repuestos críticos en stock

Mantén un inventario mínimo de repuestos de alta rotación. Una correa o un filtro detenido por falta de stock puede costar días de producción.

Un plan documentado también aumenta el valor de reventa del equipo.`,
  },
  {
    title: "Estrategias para vender tu maquinaria más rápido",
    slug: "estrategias-para-vender-tu-maquinaria-mas-rapido",
    categorySlug: "vender-mejor",
    header:
      "Publicaciones que destacan, fotos que venden y precios bien fundamentados para cerrar antes.",
    body: `Vender maquinaria industrial no se trata solo de publicar y esperar. Una estrategia clara acelera el cierre y mejora el precio final.

## Fotos reales y completas

Las publicaciones con buenas fotografías reciben muchas más visitas. Muestra el equipo desde varios ángulos, con buena luz, e incluye detalles del horómetro, motor y accesorios.

## Especificaciones sin ambigüedad

Indica marca, modelo, año, horas de uso y estado. Mientras más información entregues por adelantado, menos tiempo pierdes en consultas y más serios son los compradores que te contactan.

## Precio fundamentado

Investiga publicaciones similares y fija un precio competitivo. Si tu equipo tiene un valor agregado —mantenciones al día, accesorios, garantía— déjalo explícito para justificar el monto.

Responder rápido a los interesados es, muchas veces, la diferencia entre cerrar o perder la venta.`,
  },
  {
    title: "Opciones de financiamiento para adquirir activos industriales",
    slug: "opciones-de-financiamiento-para-adquirir-activos-industriales",
    categorySlug: "financiamiento",
    header:
      "Leasing, crédito y otras alternativas para incorporar maquinaria sin descapitalizar tu empresa.",
    body: `Adquirir maquinaria de alto valor rara vez se paga al contado. Conocer las alternativas de financiamiento te permite crecer sin comprometer tu flujo de caja.

## Leasing

El leasing te permite usar el equipo pagando cuotas y, al final del contrato, optar por comprarlo. Es atractivo por sus beneficios tributarios y porque no inmoviliza capital de golpe.

## Crédito comercial

Un crédito tradicional te da la propiedad inmediata del equipo. Conviene cuando piensas usarlo por muchos años y prefieres no depender de un contrato de arriendo.

## Evalúa el costo total

Más allá de la cuota, compara la tasa, los seguros asociados y la flexibilidad de prepago. El financiamiento más barato no siempre es el de menor cuota mensual.

Proyecta tus ingresos antes de comprometer pagos: la mejor compra es la que tu operación puede sostener.`,
  },
  {
    title: "Logística y transporte de maquinaria pesada",
    slug: "logistica-y-transporte-de-maquinaria-pesada",
    categorySlug: "logistica",
    header:
      "Planifica el traslado de equipos sobredimensionados cumpliendo la normativa y cuidando tu inversión.",
    body: `Mover maquinaria pesada de un punto a otro es un proyecto en sí mismo. Una mala planificación logística puede dañar el equipo o generar multas.

## Permisos y rutas

El transporte de carga sobredimensionada requiere permisos especiales y, en muchos casos, rutas autorizadas y horarios definidos. Verifica la normativa antes de programar el traslado.

## Equipos de izaje y amarre

Asegura la carga con los elementos adecuados. Un amarre deficiente no solo arriesga la mercancía, también pone en peligro a terceros en la vía.

## Seguro de transporte

Contrata un seguro que cubra el equipo durante todo el trayecto. El valor de la prima es marginal frente al costo de un siniestro.

Coordinar con un operador logístico con experiencia en carga industrial te ahorra tiempo y reduce riesgos.`,
  },
  {
    title: "Seguridad operacional en faenas con maquinaria",
    slug: "seguridad-operacional-en-faenas-con-maquinaria",
    categorySlug: "seguridad",
    header:
      "Buenas prácticas para proteger a tu equipo de trabajo y evitar accidentes con equipos pesados.",
    body: `La seguridad operacional es responsabilidad de todos en la faena. Trabajar con maquinaria pesada exige protocolos claros y cultura preventiva.

## Capacitación de operadores

Solo personal capacitado y certificado debe operar los equipos. Un operador entrenado reconoce riesgos antes de que se transformen en accidentes.

## Señalización y áreas de exclusión

Delimita zonas de trabajo y mantén al personal a pie fuera del radio de operación de la maquinaria. La mayoría de los accidentes graves ocurren por presencia de personas en puntos ciegos.

## Elementos de protección personal

Casco, calzado de seguridad, chaleco reflectante y protección auditiva no son opcionales. El uso correcto de EPP reduce de forma drástica la gravedad de cualquier incidente.

Una faena segura también es una faena más productiva: menos detenciones, menos rotación y mejor clima laboral.`,
  },
  {
    title: "Qué revisar al comprar un camión tolva usado",
    slug: "que-revisar-al-comprar-un-camion-tolva-usado",
    categorySlug: "guia-de-compra",
    header:
      "Una checklist enfocada en los puntos críticos de los camiones tolva de segunda mano.",
    body: `El camión tolva es uno de los equipos más demandados en construcción y minería. Comprar uno usado requiere revisar puntos específicos que marcan la diferencia.

## Estado del chasis y la tolva

Busca grietas, soldaduras improvisadas o deformaciones en el chasis y en la estructura de la tolva. Estos daños suelen ser costosos de reparar y comprometen la seguridad.

## Sistema hidráulico de levante

Prueba el sistema de levante completo varias veces. Movimientos lentos, ruidos o fugas indican desgaste en bombas o cilindros.

## Tren motriz y kilometraje

Revisa el motor, la caja y los diferenciales. El kilometraje debe ser coherente con el estado general del vehículo y con la documentación.

Con una inspección ordenada negocias mejor y reduces el riesgo de reparaciones inesperadas en los primeros meses.`,
  },
];

const populateArticles = async (strapi: Core.Strapi): Promise<void> => {
  console.log("Poblando artículos del blog...");

  console.log(`Procesando ${articlesData.length} artículos...`);

  for (const article of articlesData) {
    try {
      // Resolve the blog-category id by slug
      const categoryRows = await strapi.db
        .query("api::blog-category.blog-category")
        .findMany({ where: { slug: article.categorySlug } });

      const categoryId = categoryRows[0]?.id;
      if (!categoryId) {
        console.error(
          `❌ Categoría de blog no encontrada para artículo ${article.title}: ${article.categorySlug}`,
        );
        continue;
      }

      // Repair-idempotency: if an article with this slug already exists, only
      // skip it when it is ALREADY linked to a blog_category; otherwise connect
      // it. This lets a re-run after a failed first boot fix unlinked articles.
      const existingRows = await strapi.db
        .query("api::article.article")
        .findMany({
          where: { slug: article.slug },
          populate: { blog_categories: true },
        });

      const existing = existingRows[0];
      if (existing) {
        const alreadyLinked =
          Array.isArray(existing.blog_categories) &&
          existing.blog_categories.length > 0;

        if (alreadyLinked) {
          console.log(`Artículo ya existe y está vinculado: ${article.title}`);
          continue;
        }

        await strapi.documents("api::article.article").update({
          documentId: existing.documentId,
          data: {
            blog_categories: { connect: [categoryId] },
          } as unknown as Record<string, unknown>,
        });
        console.log(
          `🔗 Artículo existente vinculado a categoría de blog: ${article.title}`,
        );
        continue;
      }

      const createArgs = {
        data: {
          title: article.title,
          slug: article.slug,
          header: article.header,
          body: article.body,
          is_published: true,
          blog_categories: { connect: [categoryId] },
        },
      } as unknown as Parameters<
        ReturnType<typeof strapi.documents<"api::article.article">>["create"]
      >[0];

      await strapi.documents("api::article.article").create(createArgs);

      console.log(`✅ Artículo creado: ${article.title}`);
    } catch (articleError) {
      console.error(
        `❌ Error creando artículo ${article.title}:`,
        articleError.message,
      );
    }
  }

  console.log("🎉 Datos de artículos del blog poblados exitosamente");
};

// Esta función será llamada desde el bootstrap de src/index.ts

export default populateArticles;
