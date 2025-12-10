// /seeders/faqs.ts

const faqsData = [
  {
    id: 2,
    title: "¿Qué es Waldo.click®?",
    featured: true,
    text: "Waldo.click® es un portal de anuncios enfocado en Activos Industriales (Equipos, Vehículos Industriales, Repuestos, Insumos, Nuevos y/o Usados). Buscamos conectar a través de nuestra comunidad problemas y soluciones, para la Industria de la: Agricultura, Alimentos, Construcción, Energía, Ganadería, Manufactura, Minería, Pesca, Salud, Silvicultura, Telecomunicaciones y Transporte.",
  },
  {
    id: 3,
    title: "¿Cómo funciona Waldo.click®?",
    featured: true,
    text: "Solo debes registrarte gratuitamente, podrás publicar y también ver los datos de contacto de los vendedores. La compra/venta se realiza de mutuo acuerdo entre las partes, de manera independiente y ajena a Waldo.click®.",
  },
  {
    id: 4,
    title: "¿Tiene costo Publicar Waldo.click®?",
    featured: false,
    text: "Waldo.click® te regala 3 publicaciones gratuitas de por vida, con una duración de 15 días renovables. Solo debes registrarte sin ningún costo. Si necesitas más publicaciones, puedes comprar paquetes que se ajusten a tus necesidades.",
  },
  {
    id: 5,
    title: "¿Tiene algún costo Vender Waldo.click®?",
    featured: false,
    text: "El proceso de Venta es completamente gratuito, independiente y ajeno a Waldo.click®, no se cobran comisiones ni servicios adicionales. El comprador y vendedor tendrán un contacto directo y fácil a través de e-mail o teléfono. Solo debes registrarte, gratuitamente, para acceder a ellos.",
  },
  {
    id: 6,
    title: "¿Tiene costo Buscar y Contactar en Waldo.click®?",
    featured: false,
    text: "El proceso de Búsqueda/Contacto es completamente gratuito, y el proceso de compra es independiente y ajeno a Waldo.click®, no se cobran comisiones ni servicios adicionales. El comprador y vendedor tendrán un contacto directo y fácil a través de e-mail y/o teléfono. Solo debes registrarte, gratuitamente, para acceder a ellos.",
  },
  {
    id: 7,
    title: "¿La información publicada en los anuncios es 100% correcta?",
    featured: true,
    text: "Sin bien, Waldo.click® revisa los anuncios antes de ser publicados, la información brindada es de responsabilidad directa de quien publica, por lo que hay que certificar cada uno de los puntos publicados directamente con el vendedor.  Recomendamos hacer una revisión presencial con un profesional certificado.",
  },
  {
    id: 8,
    title: "¿Se involucra Waldo.click® en el proceso de compra/venta?",
    featured: false,
    text: "Waldo.click® es solo un servicio online que permite conectar personas que quieren comprar, con otras que quieren vender. Por lo que no participa en ninguna de las transacciones llevadas a cabo. Waldo.click® no cobra comisiones por venta.",
  },
  {
    id: 9,
    title: "¿Qué son los paquetes de anuncios de Waldo.click®?",
    featured: false,
    text: 'Si los 3 anuncios gratuitos no son suficientes, puedes comprar paquetes de anuncios. Hay de diferentes cantidades y precios. Cada anuncio del paquete será publicado una única vez por 45 días (a diferencia de los gratuitos que solo duran 15 días). Los anuncios que no utilices quedan guardados en tu cuenta por un tiempo ilimitado y podrás utilizarlos cuando gustes. Los paquetes incluyen "Destacados", que puedes asignar una vez al anuncio que tú elijas. Al "Destacar" un anuncio, este tendrá preferencias de visualización en el buscador de nuestro portal.',
  },
  {
    id: 10,
    title: "¿Qué medios de pago acepta Waldo.click®?",
    featured: false,
    text: "Waldo.click® utiliza WebPay como sistema de pago, el servicio le permitirá pagar con sus tarjetas de RED COMPRA (Debito) o TARJETAS DE CRÉDITO (Visa, Mastercard, Diners Club, American Express, Magna) para que usted tenga el control sobre las opciones que más le acomoden, de forma fácil, segura y confiable.",
  },
  {
    id: 11,
    title: "¿Tienes más preguntas?",
    featured: false,
    text: "Escríbenos y las resolveremos.",
  },
];

const populateFaqs = async (strapi: any) => {
  console.log("Poblando FAQs...");

  console.log(`Procesando ${faqsData.length} FAQs...`);

  for (const faq of faqsData) {
    try {
      // Verificar si la FAQ ya existe
      const existingFaq = await strapi.db.query("api::faq.faq").findMany({
        where: { title: faq.title },
      });

      if (existingFaq.length > 0) {
        console.log(`FAQ ya existe: ${faq.title}`);
        continue;
      }

      // Crear la FAQ usando strapi.db.query()
      await strapi.db.query("api::faq.faq").create({
        data: {
          title: faq.title,
          featured: faq.featured,
          text: faq.text,
        },
      });

      console.log(`✅ FAQ creada: ${faq.title}`);
    } catch (faqError) {
      console.error(`❌ Error creando FAQ ${faq.title}:`, faqError.message);
    }
  }

  console.log("🎉 Datos de FAQs poblados exitosamente");
};

// Esta función será llamada desde el bootstrap de src/index.ts

export default populateFaqs;
