<template>
  <section class="policies policies--default">
    <div class="policies--default__container">
      <h1 class="policies--default__title title">Políticas de privacidad</h1>
      <div class="policies--default__hero">
        <div class="policies--default__hero__text paragraph">
          <p>
            Servicio en línea el anuncio de Activos Industriales Nuevos y/o
            Usados, sean estos, Equipos, Vehículos industriales, Repuestos,
            Insumos, a través del sitio web Waldo.click® (en adelante "Servicio
            de Marketing en línea"). Para utilizar y registrarse en
            Waldo.click®, le pedimos considere los siguientes puntos:
          </p>
        </div>
      </div>
      <div class="policies--default__faq">
        <AccordionDefault :questions="faqs" />
      </div>
    </div>
  </section>
</template>

<script setup>
import AccordionDefault from "@/components/AccordionDefault.vue";

// Extraer las preguntas frecuentes del contenido existente
const faqs = [
  {
    title: "1. Información general sobre el Servicio de Marketing en línea:",
    text: `
      <p>Waldo.click® consiste en un mercado en línea donde el usuario
      puede buscar y publicar anuncios de Activos Industriales, Equipos,
      Vehículos Industriales, Repuestos, Insumos, sean estos nuevos y/o
      usados. El Servicio de Marketing en línea es una opción moderna
      para el mercado de artículos nuevos y/o usados para los
      principales fabricantes y distribuidores de cada industria, así
      como también a vendedores privados.</p>

      <p>Un acuerdo de compra/venta de un artículo o equipo ofrecido en
      Waldo.click®, siempre incluirá sólo al comprador y al vendedor
      directamente. Nuestro portal no está involucrado de ninguna manera
      en la relación comprador/vendedor o en el proceso de compra. Todos
      los detalles del "Producto" son proporcionados por el vendedor,
      Waldo.click® no es responsable de la información provista en el
      anuncio.</p>

      <p>El objetivo del Servicio de Marketing en línea es sólo con fines
      informativos y de comunicación. El portal no puede garantizar que
      los datos proporcionados por nuestros clientes no contengan
      errores. El comprador del "Producto" primero debe verificar con el
      vendedor cualquier detalle que pueda afectar la decisión de
      compra. Cuando un producto se cotiza a través de Waldo.click®, el
      comprador debe ser cauteloso, tal como si se hubiera generado la
      compra de manera tradicional. Si decide comprar un artículo, su
      socio contractual será el vendedor del producto, no la empresa
      Waldo.click®.</p>
    `,
  },
  {
    title: "2. Registrarse como usuario en Waldo.click®",
    text: `
      <p>Si desea registrarse como usuario en el servicio de Marketing en
      línea Waldo.click®, ingrese los datos de usuario solicitados y
      acepte cumplir con los Términos y Condiciones. Waldo.click®
      guardará sus datos para futuras visitas. Cualquiera que se
      suscriba como usuario del servicio debe tener al menos 18 años.</p>

      <p>Al aceptar las condiciones del servicio, usted confirma que su
      información es correcta, y estar de acuerdo con las disposiciones
      del sitio. Waldo.click® se reserva el derecho de rechazar el
      registro por cualquier motivo y rescindir el contrato si la
      información proporcionada es insuficiente, incorrecta y/o falsa.
      El portal se reserva el derecho de rechazar el uso del Servicio de
      Marketing en línea y cancelar su cuenta si no está actuando
      conforme a los Términos y Condiciones establecidos en el acuerdo.
      Waldo.click® tiene a disposición los medios de protección que
      define la ley.</p>

      <p>Para usar el Servicio de Marketing en línea, necesita un nombre de
      usuario y una contraseña que cumplan con los requisitos de
      seguridad que impida el acceso no autorizado a extraños. Un
      usuario del servicio debe notificar inmediatamente a Waldo.click®
      por correo electrónico si un tercero tiene acceso a su nombre y
      contraseña sin autorización. La persona será responsable del mal
      uso de su nombre de usuario y contraseña si la notificación no
      llega a Waldo.click® a tiempo.</p>
    `,
  },
  {
    title: "3. Protección de datos",
    text: `
      <p>Waldo.click® respeta la privacidad de los usuarios y las empresas
      con medios de seguridad razonables para evitar el abuso de los
      datos personales proporcionados al Servicio de Marketing en línea.</p>

      <p>El portal puede usar y transmitir información de los clientes (por
      ejemplo, nombre y dirección de correo electrónico) a terceros. Los
      datos pueden transferirse a proveedores de accesorios, productos y
      servicios financieros adicionales, o a otros proveedores de
      servicios relacionados. Los datos se transfieren sólo dentro de
      los límites de los derechos y la legislación actual.</p>

      <p>Al registrarse como usuario de Waldo.click®, acepta las
      condiciones de protección de datos y transferencia de datos
      descritas en estos términos generales.</p>
    `,
  },
  {
    title: "4. Anuncios y publicaciones",
    text: `
      <p>Los anuncios que publique en Waldo.click® se traducirán como la
      solicitud del Servicio de Marketing en línea. No existe una
      relación contractual entre el usuario y Waldo.click® hasta que el
      anuncio sea aceptado por el equipo de servicio al cliente.</p>

      <p>Es responsabilidad del usuario brindar información acertada del
      artículo en venta, como también seleccionar la Industria,
      Categoría, subcategoría u otro.</p>

      <p>Es responsabilidad del usuario tener los permisos y autorizaciones
      sobre los artículos publicados en el sitio, donde no exista
      violación de la propiedad intelectual u otros derechos de
      personas, entidades, materiales o libros. Esto puede conducir a la
      aplicación de la ley. Si el contenido se describe de manera
      errónea, el usuario a cargo de la publicación será responsable de
      cualquier daño causado por esta situación.</p>

      <p>Si por alguna razón los anuncios no coinciden con el artículo,
      Waldo.click® contactará al vendedor por correo electrónico para
      determinar la causa. Waldo.click® tiene el derecho a cancelar la
      cuenta de un usuario que no respete lo anterior. La aprobación de
      cada anuncio se establece por separado.</p>

      <p>Los anuncios solo pueden ofrecer "productos" (Activos
      Industriales, Equipos, Vehículos industriales, Repuestos, Insumos,
      nuevos y/o usados).</p>

      <p>La responsabilidad del vendedor es garantizar que su anuncio
      contenga información precisa del producto de acuerdo con la ley
      aplicable, regulaciones gubernamentales y buenas prácticas
      comerciales, su estado y otras características importantes. Debe
      tener información sobre la garantía y mantenimientos y cualquier
      otra información que el comprador deba saber al momento de la
      compra. Es de suma importancia que, si el producto publicado en el
      portal se vende, el vendedor dé la baja del anuncio en
      Waldo.click®.</p>

      <p>Waldo.click® cuenta con derecho para editar, seleccionar, copiar
      y utilizar el material e información brindado por el usuario
      libremente en su negocio, pudiendo incluso publicarlo en otras
      plataformas, con objetivo de ayudar al crecimiento y promoción del
      negocio.</p>

      <p>Waldo.click® no está capacitado para asegurar de que esta
      información enviada por el usuario es correcta. Por lo tanto,
      aquellos que anuncian de manera errónea la información, tienen
      responsabilidad sobre cualquier costo o posibles daños causados.</p>

      <p>En caso de cancelar un anuncio antes de que sea publicado, el pago
      brindado a Waldo.click® será abonado a la cuenta del usuario para
      una nueva publicación.</p>

      <p>Para poder certificar los anuncios y que la información fue
      ingresada correctamente, el portal cuenta con hasta 72 horas para
      la aprobación y carga del producto.</p>

      <p>En caso de que el anuncio no pueda ser publicado por razones
      externas, Waldo.click® está obligado a devolver el mismo pago
      realizado. No habrá otro tipo de compensación ya que este tipo de
      errores no son predecibles por el portal.</p>
    `,
  },
  {
    title: "5. Información sobre Artículos Publicados",
    text: `
      <p>Es necesario que los usuarios de Waldo.click® expresen datos
      certeros sobre el estado de los artículos en venta, es completa
      responsabilidad del vendedor describir y categorizar de manera
      correcta el anuncio.</p>

      <p>Los datos se almacenan en herramientas del portal para permitir
      estimaciones y recomendaciones para futuros compradores y
      vendedores.</p>
    `,
  },
  {
    title: "6. Propiedad Intelectual",
    text: `
      <p>Los documentos, imágenes, aplicaciones y otro contenido disponible
      en el Servicio de Marketing en línea, está protegido por leyes
      aplicables y reconocido en el derecho de propiedad intelectual de
      Waldo.click®. Sin un consentimiento escrito, no puede reproducir,
      distribuir, utilizar o publicar material protegido.</p>
    `,
  },
  {
    title: "7. Cobros y facturación",
    text: `
      <p>El usuario se puede registrar de manera gratuita; con esto,
      conseguirá publicar tres 3 anuncios gratuitos (para siempre),
      comprar paquetes de anuncios, comprar anuncios destacados, seguir
      anuncios, recibir información relevante y ver los datos de
      contacto de los vendedores.</p>

      <p>Los servicios de pago, se concretan por medio del portal de pagos
      Webpay. No se aplicarán los servicios adicionales asociados antes
      del pago total.</p>
    `,
  },
  {
    title: "8. Sobre compensación por daños y responsabilidad limitada",
    text: `
      <p>Waldo.click® no puede garantizar que el Servicio de Marketing en
      línea funcione libre de errores o que los servidores no sean
      atacados por softwares dañinos. En caso de que lo anterior
      afectase a equipos o datos luego de utilizar la plataforma,
      Waldo.click® no es responsable por los costos generados por
      estos. Waldo.click® no es responsable por errores de la
      plataforma ni los costos que pueda generar estos errores. En caso
      de que errores no permitan la publicación correcta de un anuncio,
      Waldo.click® puede solucionar el error o devolver la cantidad
      pagada por el usuario.</p>

      <p>En el portal existen enlaces a sitios web generados por
      proveedores externos independientes a Waldo.click®, donde los
      servicios ofrecidos por estos son de responsabilidad del proveedor
      y bajo ningún caso de Waldo.click®.</p>

      <p>Según este acuerdo, Waldo.click® velará por un buen
      funcionamiento de la plataforma y colaborará para la solución de
      cualquier problema técnico de la plataforma, donde queda exento de
      cualquier tipo de compensación que este pueda generar.</p>
    `,
  },
  {
    title: "9. Disponibilidad",
    text: `
      <p>Waldo.click® tiene derecho a hacer cualquier modificación en la
      información, contenido, usabilidad, funcionamiento u otro en la
      plataforma de Servicio de Marketing en línea. Teniendo derecho a
      suspender el servicio en caso de mantenimientos o respaldo,
      procurando así el mejor funcionamiento, navegación y seguridad del
      sitio.</p>
    `,
  },
  {
    title: "10. Modificación de Términos y Condiciones",
    text: `
      <p>Waldo.click® está en búsqueda constante de mejoras e innovación
      del portal, nuevas funcionalidad y proveedores. Por lo que
      Waldo.click® se reserva el derecho de modificar los Términos y
      condiciones anteriores. La publicación de estos, estará disponible
      en el portal, donde al cambiar, el usuario tendrá que aceptar los
      nuevos términos.</p>
    `,
  },
  {
    title: "11. Ayúdanos a mejorar",
    text: `
      <p>En caso de encontrar una publicación con errores o un artículo que
      ya está vendido, agradeceremos avisarnos por medio de los botones
      incluidos en cada página. En caso de ser un problema de
      funcionamiento, favor escríbanos desde la sección "Contacto".</p>
    `,
  },
  {
    title: "12. No validez de los términos",
    text: `
      <p>Si una de estas condiciones no se considera válida, predominará el
      alcance de la ley local.</p>
    `,
  },
  {
    title: "13. Fuerza mayor",
    text: `
      <p>Waldo.click® no será responsable en caso de no cumplir alguno de
      los términos anteriores en caso de obstáculos que van más allá de
      su influencia (por ejemplo, protestas, cierres, desorden en la
      comunicación de datos, incendios, robos, sabotaje, vandalismo y
      cualquier otro evento no esperado).</p>
    `,
  },
  {
    title: "14. Aceptación de Términos y Condiciones",
    text: `
      <p>Estas condiciones obligatorias tendrán efecto una vez que sean
      aceptadas, teniendo validez indefinida. Waldo.click® puede privar
      la utilización de los Servicios de Marketing en línea en caso de
      considerar que un usuario no esté cumpliendo lo anterior.</p>
    `,
  },
  {
    title: "15. Invalidez de los términos",
    text: `
      <p>Si una de estas condiciones no se considera válida, predominará el
      alcance de la ley local.</p>
    `,
  },
  {
    title: "16. Fuerza mayor",
    text: `
      <p>Waldo.click® no será responsable en caso de no cumplir alguno de
      los términos anteriores en caso de obstáculos que van más allá de
      su influencia (por ejemplo, protestas, cierres, desorden en la
      comunicación de datos, incendios, robos, sabotaje, vandalismo y
      cualquier otro evento no esperado).</p>
    `,
  },
  {
    title: "17. Aceptación de Términos y Condiciones",
    text: `
      <p>Estas condiciones obligatorias tendrán efecto una vez que sean
      aceptadas, teniendo validez indefinida. Waldo.click® puede privar
      la utilización de los Servicios de Marketing en línea en caso de
      considerar que un usuario no esté cumpliendo lo anterior.</p>
    `,
  },
  {
    title: "18. Información de contacto",
    text: `
      <p>Waldo.click® |
      <a href="mailto:contacto@Waldo.click®">contacto@Waldo.click®</a>
      | Santiago, RM. Chile</p>
    `,
  },
];
</script>
