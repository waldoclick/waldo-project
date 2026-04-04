import type { Core } from "@strapi/strapi";

const termsData = [
  {
    order: 1,
    title: "Información general sobre el Servicio de Marketing en línea",
    text: 'Waldo.click® consiste en un mercado en línea donde el usuario puede buscar y publicar anuncios de Activos Industriales, Equipos, Vehículos Industriales, Repuestos, Insumos, sean estos nuevos y/o usados. El Servicio de Marketing en línea es una opción moderna para el mercado de artículos nuevos y/o usados para los principales fabricantes y distribuidores de cada industria, así como también a vendedores privados.\n\nUn acuerdo de compra/venta de un artículo o equipo ofrecido en Waldo.click®, siempre incluirá sólo al comprador y al vendedor directamente. Nuestro portal no está involucrado de ninguna manera en la relación comprador/vendedor o en el proceso de compra. Todos los detalles del "Producto" son proporcionados por el vendedor, Waldo.click® no es responsable de la información provista en el anuncio.',
  },
  {
    order: 2,
    title: "Registrarse como usuario en Waldo.click®",
    text: "Si desea registrarse como usuario en el servicio de Marketing en línea Waldo.click®, ingrese los datos de usuario solicitados y acepte cumplir con los Términos y Condiciones. Waldo.click® guardará sus datos para futuras visitas. Cualquiera que se suscriba como usuario del servicio debe tener al menos 18 años.\n\nAl aceptar las condiciones del servicio, usted confirma que su información es correcta y está de acuerdo con las disposiciones del sitio. Waldo.click® se reserva el derecho de rechazar el registro por cualquier motivo y rescindir el contrato si la información proporcionada es insuficiente, incorrecta y/o falsa.",
  },
  {
    order: 3,
    title: "Protección de datos",
    text: "Waldo.click® respeta la privacidad de los usuarios y las empresas con medios de seguridad razonables para evitar el abuso de los datos personales proporcionados al Servicio de Marketing en línea.\n\nEl portal puede usar y transmitir información de los clientes (por ejemplo, nombre y dirección de correo electrónico) a terceros sólo dentro de los límites de los derechos y la legislación vigente.",
  },
  {
    order: 4,
    title: "Anuncios y publicaciones",
    text: "Los anuncios que publique en Waldo.click® se traducirán como la solicitud del Servicio de Marketing en línea. No existe una relación contractual entre el usuario y Waldo.click® hasta que el anuncio sea aceptado por el equipo de servicio al cliente.\n\nEs responsabilidad del usuario brindar información acertada del artículo en venta, como también seleccionar la Industria, Categoría, subcategoría u otro. Waldo.click® tiene derecho a cancelar la cuenta de un usuario que no respete lo anterior.",
  },
  {
    order: 5,
    title: "Cobros y facturación",
    text: "El usuario se puede registrar de manera gratuita; con esto, conseguirá publicar tres anuncios gratuitos (para siempre), comprar paquetes de anuncios, comprar anuncios destacados, seguir anuncios, recibir información relevante y ver los datos de contacto de los vendedores.\n\nLos servicios de pago se concretan por medio del portal de pagos Webpay. No se aplicarán los servicios adicionales asociados antes del pago total.",
  },
  {
    order: 6,
    title: "Propiedad Intelectual",
    text: "Los documentos, imágenes, aplicaciones y otro contenido disponible en el Servicio de Marketing en línea está protegido por leyes aplicables y reconocido en el derecho de propiedad intelectual de Waldo.click®. Sin un consentimiento escrito, no puede reproducir, distribuir, utilizar o publicar material protegido.",
  },
  {
    order: 7,
    title: "Responsabilidad limitada",
    text: "Waldo.click® no puede garantizar que el Servicio de Marketing en línea funcione libre de errores o que los servidores no sean atacados por softwares dañinos. En caso de que lo anterior afectase a equipos o datos luego de utilizar la plataforma, Waldo.click® no es responsable por los costos generados.",
  },
  {
    order: 8,
    title: "Modificación de Términos y Condiciones",
    text: "Waldo.click® está en búsqueda constante de mejoras e innovación del portal, nuevas funcionalidades y proveedores. Por lo que Waldo.click® se reserva el derecho de modificar los Términos y Condiciones anteriores. La publicación de estos estará disponible en el portal, donde al cambiar, el usuario tendrá que aceptar los nuevos términos.",
  },
  {
    order: 9,
    title: "Información de contacto",
    text: "Waldo.click® | contacto@Waldo.click® | Santiago, RM. Chile",
  },
];

const populateTerms = async (strapi: Core.Strapi): Promise<void> => {
  console.log("Poblando Condiciones de Uso...");
  console.log(`Procesando ${termsData.length} Condiciones de Uso...`);

  for (const term of termsData) {
    try {
      const existing = await strapi.db
        .query("api::term.term")
        .findMany({ where: { order: term.order } });

      if (existing.length > 0) {
        console.log(`Condición de uso ya existe: ${term.title}`);
        continue;
      }

      await strapi.db.query("api::term.term").create({
        data: {
          title: term.title,
          text: term.text,
          order: term.order,
        },
      });

      console.log(`Condición de uso creada: ${term.title}`);
    } catch (termError) {
      console.error(
        `Error creando Condición de uso ${term.title}:`,
        termError.message
      );
    }
  }

  console.log("Datos de Condiciones de Uso poblados exitosamente");
};

export default populateTerms;
