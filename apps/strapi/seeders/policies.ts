import type { Core } from "@strapi/strapi";

const policiesData = [
  // ─── POLÍTICA DE PRIVACIDAD ───────────────────────────────────────────────
  {
    order: 1,
    title: "¿Qué regula esta política?",
    text: "<p>Esta Política de Privacidad explica cómo <strong>Waldo.click®</strong> recopila, usa y protege tus datos personales, en cumplimiento de la legislación chilena vigente, incluyendo la <em>Ley N° 21.719 sobre Protección de Datos Personales</em> y demás normativa aplicable.</p><p>Esta política forma parte integrante de los Términos y Condiciones de la Plataforma. Al usar nuestros servicios, aceptas las prácticas descritas aquí.</p>",
  },
  {
    order: 2,
    title: "¿Quién gestiona tus datos?",
    text: "<p>El responsable del tratamiento de tus datos personales es:</p><p><strong>Waldo.click®</strong><br>Correo electrónico: contacto@waldo.click<br>Santiago, Chile</p><p><strong>Delegado de Protección de Datos (DPD)</strong><br>Waldo.click® designa un Delegado de Protección de Datos como punto de contacto para todo lo relacionado con tus datos personales y el ejercicio de tus derechos, conforme al artículo 14 bis de la Ley N° 21.719.<br>Contacto: contacto@waldo.click</p>",
  },
  {
    order: 3,
    title: "¿A quién aplica esta política?",
    text: "<p>Esta Política aplica a todas las personas que interactúan con la Plataforma, incluyendo:</p><ul><li>Visitantes del sitio web</li><li>Usuarios registrados</li><li>Anunciantes</li><li>Compradores</li><li>Representantes de empresas</li><li>Potenciales clientes</li><li>Personas que contacten a Waldo.click® por cualquier canal</li></ul>",
  },
  {
    order: 4,
    title: "Conceptos clave",
    text: "<p>Para entender esta política, es útil conocer el significado de los siguientes términos:</p><p><strong>Dato Personal:</strong> cualquier información vinculada o referida a una persona natural identificada o identificable.</p><p><strong>Dato Sensible:</strong> dato que se refiere a características físicas o morales de las personas, o hechos de su vida privada, incluyendo datos de salud, origen racial, opiniones políticas, creencias religiosas y vida sexual, conforme al artículo 2 letra g) de la Ley N° 21.719.</p><p><strong>Titular:</strong> la persona natural a quien pertenecen los datos.</p><p><strong>Responsable del Tratamiento:</strong> la persona que determina los fines y medios del tratamiento.</p><p><strong>Encargado del Tratamiento:</strong> un tercero que procesa datos por cuenta del responsable.</p><p><strong>APDP:</strong> Agencia de Protección de Datos Personales, la autoridad de control creada por la Ley N° 21.719.</p><p><strong>Anonimización:</strong> proceso mediante el cual un dato deja de identificar a una persona.</p>",
  },
  {
    order: 5,
    title: "¿Qué datos recopilamos?",
    text: "<p>Dependiendo de cómo uses la Plataforma, podemos recopilar los siguientes tipos de datos:</p><p><strong>Datos de identificación</strong></p><ul><li>Nombre y apellidos</li><li>Empresa y cargo</li><li>RUT, país, región y ciudad</li></ul><p><strong>Datos de contacto</strong></p><ul><li>Correo electrónico</li><li>Teléfono</li><li>Dirección comercial</li></ul><p><strong>Datos de cuenta</strong></p><ul><li>Nombre de usuario</li><li>Contraseña (cifrada)</li><li>Fecha de registro</li></ul><p><strong>Datos comerciales</strong></p><ul><li>Productos publicados</li><li>Historial de anuncios</li><li>Consultas recibidas</li><li>Actividad comercial en la Plataforma</li></ul><p><strong>Datos técnicos</strong></p><ul><li>Dirección IP</li><li>Navegador y sistema operativo</li><li>Identificadores de dispositivo</li><li>Cookies y registros de actividad</li></ul><p><strong>Datos sensibles:</strong> Waldo.click® no recopila deliberadamente datos sensibles. Si los incorporas voluntariamente a la Plataforma, su tratamiento quedará sujeto a las bases de licitud especiales del artículo 16 de la Ley N° 21.719, requiriéndose el consentimiento explícito del titular salvo excepción legal expresa.</p>",
  },
  {
    order: 6,
    title: "¿Para qué usamos tus datos?",
    text: "<p>Los datos que recopilamos pueden usarse para los siguientes fines:</p><p><strong>Operación de la Plataforma</strong></p><ul><li>Crear y gestionar cuentas</li><li>Publicar y administrar anuncios</li><li>Mostrar información de contacto</li></ul><p><strong>Prestación de servicios</strong></p><ul><li>Gestionar servicios contratados</li><li>Facturación</li><li>Atención y soporte al usuario</li></ul><p><strong>Seguridad</strong></p><ul><li>Prevención de fraude</li><li>Detección de accesos indebidos</li><li>Protección de sistemas</li></ul><p><strong>Estadísticas y mejoras</strong></p><ul><li>Medición de tráfico</li><li>Mejora de la experiencia de usuario</li><li>Optimización de funcionalidades</li></ul><p><strong>Comunicaciones operativas</strong></p><ul><li>Avisos de cuenta</li><li>Notificaciones de servicio</li><li>Soporte técnico</li></ul><p><strong>Marketing</strong> (cuando corresponda legalmente)</p><ul><li>Novedades y promociones</li><li>Eventos y servicios relacionados</li></ul>",
  },
  {
    order: 7,
    title: "¿Con qué fundamento legal tratamos tus datos?",
    text: "<p>Waldo.click® solo trata datos personales cuando existe una base legal para hacerlo, conforme a la Ley N° 21.719. Las bases que podemos invocar son:</p><p><strong>Ejecución de un contrato:</strong> cuando el tratamiento es necesario para prestarte los servicios que solicitaste.</p><p><strong>Consentimiento:</strong> cuando la ley lo requiere. El consentimiento debe ser libre, informado, específico e inequívoco. Puedes revocarlo en cualquier momento, sin efecto retroactivo.</p><p><strong>Obligación legal:</strong> cuando el tratamiento es necesario para cumplir una obligación legal o regulatoria aplicable a Waldo.click®.</p><p><strong>Interés legítimo:</strong> cuando es necesario para satisfacer intereses legítimos de Waldo.click® o de terceros, siempre que no prevalezcan tus derechos y libertades fundamentales. Se realiza el test de proporcionalidad antes de usar esta base.</p><p><strong>Interés vital:</strong> cuando es necesario para proteger intereses vitales del titular u otras personas.</p><p><strong>Misión de interés público:</strong> cuando es necesario para el cumplimiento de una misión de interés público o el ejercicio de potestades públicas, según la ley.</p>",
  },
  {
    order: 8,
    title: "Datos obligatorios y opcionales",
    text: "<p>Algunos datos son necesarios para acceder a determinadas funcionalidades de la Plataforma. Si no los proporcionas, es posible que no puedas usar ciertos servicios.</p><p>Waldo.click® indicará claramente en cada formulario cuáles datos son obligatorios y cuáles son opcionales.</p>",
  },
  {
    order: 9,
    title: "Menores de edad",
    text: "<p>La Plataforma está destinada <strong>exclusivamente a personas mayores de 18 años</strong>.</p><p>Waldo.click® no recopila deliberadamente datos personales de menores. Si detectamos que se han recopilado datos de un menor sin consentimiento parental, los eliminaremos a la brevedad.</p>",
  },
  {
    order: 10,
    title: "¿Con quién compartimos tus datos?",
    text: "<p>Tus datos pueden compartirse con terceros solo en los casos necesarios para operar la Plataforma o cumplir obligaciones legales:</p><p><strong>Proveedores tecnológicos</strong></p><ul><li>Servicios de hosting y nube</li><li>Seguridad informática</li><li>Plataformas de correo electrónico</li></ul><p><strong>Procesadores de pago</strong></p><ul><li>Webpay / Transbank</li><li>Otros proveedores autorizados</li></ul><p><strong>Autoridades competentes</strong><br>Cuando exista una obligación legal o un requerimiento formal de una autoridad competente.</p>",
  },
  {
    order: 11,
    title: "Transferencias fuera de Chile",
    text: "<p>Algunos de nuestros proveedores tecnológicos pueden estar ubicados fuera de Chile. En esos casos, Waldo.click® adoptará garantías adecuadas conforme al artículo 24 de la Ley N° 21.719, que pueden incluir:</p><ul><li>Transferencias a países con nivel de protección reconocido como adecuado por la APDP</li><li>Cláusulas contractuales tipo u otras garantías aprobadas por la APDP</li><li>Consentimiento explícito del titular, cuando aplique</li></ul><p>No realizamos transferencias internacionales sin una base de garantía adecuada.</p>",
  },
  {
    order: 12,
    title: "¿Cuánto tiempo guardamos tus datos?",
    text: "<p>Conservamos tus datos personales solo el tiempo que sea necesario. En general, los mantenemos:</p><ul><li>Mientras exista una relación activa contigo</li><li>Durante los plazos exigidos por la ley</li><li>Mientras existan obligaciones pendientes entre las partes</li><li>Durante el plazo de prescripción de las acciones legales aplicables</li></ul><p>Una vez vencidos esos plazos, tus datos serán eliminados o anonimizados de forma segura.</p>",
  },
  {
    order: 13,
    title: "Tus derechos sobre tus datos",
    text: "<p>Conforme a la Ley N° 21.719, tienes los siguientes derechos sobre tus datos personales:</p><p><strong>Acceso:</strong> puedes solicitar saber qué datos tenemos sobre ti, para qué los usamos, de dónde los obtuvimos y con quién los hemos compartido.</p><p><strong>Rectificación:</strong> puedes pedirnos que corrijamos datos inexactos o incompletos.</p><p><strong>Supresión (derecho al olvido):</strong> puedes solicitar la eliminación de tus datos cuando no exista una base legal que justifique su tratamiento.</p><p><strong>Oposición:</strong> en ciertos casos previstos por la ley, puedes oponerte al tratamiento de tus datos.</p><p><strong>Portabilidad:</strong> puedes pedir una copia de tus datos en formato electrónico estructurado y legible, cuando sea técnica y legalmente posible.</p><p><strong>Bloqueo:</strong> puedes solicitar la restricción temporal del tratamiento mientras se resuelve una controversia sobre exactitud o licitud.</p><p><strong>No ser sujeto de decisiones automatizadas:</strong> tienes derecho a no ser afectado por decisiones basadas únicamente en tratamiento automatizado que produzcan efectos jurídicos significativos, y a solicitar intervención humana, expresar tu punto de vista o impugnar la decisión, conforme al artículo 15 de la Ley N° 21.719.</p>",
  },
  {
    order: 14,
    title: "¿Cómo ejercer tus derechos?",
    text: "<p>Para ejercer cualquiera de tus derechos, puedes contactarnos por alguno de estos medios:</p><ul><li>Correo electrónico: <strong>contacto@waldo.click</strong></li><li>Delegado de Protección de Datos: <strong>contacto@waldo.click</strong></li></ul><p>Responderemos tu solicitud dentro de los <strong>30 días hábiles</strong> siguientes a su recepción. Este plazo puede prorrogarse por una sola vez por igual período, notificándote previamente. La primera solicitud de cada usuario es gratuita.</p><p>Es posible que te pidamos información adicional para verificar tu identidad antes de procesar la solicitud.</p><p>Si consideras que hemos vulnerado tus derechos, puedes presentar una reclamación ante la <strong>Agencia de Protección de Datos Personales (APDP)</strong>, conforme al artículo 32 de la Ley N° 21.719.</p>",
  },
  {
    order: 15,
    title: "Decisiones automatizadas",
    text: "<p>La Plataforma puede utilizar herramientas automatizadas para mejorar tu experiencia, por ejemplo para:</p><ul><li>Ordenar publicaciones</li><li>Mostrar resultados relevantes</li><li>Recomendar contenido</li><li>Detectar comportamientos fraudulentos</li></ul><p>Estas herramientas <strong>no tienen como finalidad</strong> adoptar decisiones exclusivamente automatizadas que produzcan efectos jurídicos significativos sobre los usuarios.</p>",
  },
  {
    order: 16,
    title: "¿Cómo protegemos tu información?",
    text: "<p>Waldo.click® implementa medidas técnicas, administrativas y organizativas razonables para proteger tus datos personales, incluyendo protección contra:</p><ul><li>Acceso no autorizado</li><li>Alteración o modificación indebida</li><li>Pérdida accidental</li><li>Divulgación no autorizada</li><li>Destrucción accidental o ilícita</li></ul><p>Aunque tomamos todas las precauciones necesarias, ningún sistema de seguridad es completamente infalible.</p>",
  },
  {
    order: 17,
    title: "Incidentes de seguridad",
    text: "<p>Si ocurre un incidente de seguridad que afecte datos personales, Waldo.click® cumplirá con las obligaciones de notificación establecidas en el artículo 26 de la Ley N° 21.719:</p><ul><li>Notificación a la <strong>APDP</strong> dentro del plazo legalmente establecido desde que se tome conocimiento del incidente</li><li>Notificación a los <strong>titulares afectados</strong> cuando el incidente pueda generar un riesgo significativo para sus derechos</li></ul><p>La notificación incluirá la naturaleza del incidente, los datos afectados, las medidas adoptadas y los datos de contacto del Delegado de Protección de Datos.</p>",
  },
  {
    order: 18,
    title: "Uso de cookies",
    text: "<p>La Plataforma utiliza cookies y tecnologías similares para mejorar tu experiencia de navegación y analizar el uso del sitio.</p><p>Puedes conocer más detalles en nuestra <strong>Política de Cookies</strong>.</p>",
  },
  {
    order: 19,
    title: "Cambios a esta política",
    text: "<p>Waldo.click® puede actualizar esta Política cuando sea necesario. Publicaremos los cambios en la Plataforma con indicación de la versión y la fecha de entrada en vigencia.</p><p>Te avisaremos cuando los cambios sean sustanciales.</p>",
  },
  {
    order: 20,
    title: "¿Cómo contactarnos?",
    text: "<p>Si tienes preguntas sobre esta política o sobre el tratamiento de tus datos, puedes comunicarte con nosotros:</p><p><strong>Waldo.click®</strong><br>contacto@waldo.click<br>Delegado de Protección de Datos: contacto@waldo.click<br>Santiago, Chile</p><p>También puedes dirigir reclamaciones directamente ante la <strong>Agencia de Protección de Datos Personales (APDP)</strong>, conforme a los procedimientos establecidos en la Ley N° 21.719.</p>",
  },

  // ─── POLÍTICA DE COOKIES ─────────────────────────────────────────────────
  {
    order: 21,
    title: "¿Qué regula la política de cookies?",
    text: "<p>Esta Política de Cookies explica cómo <strong>Waldo.click®</strong> utiliza cookies, tecnologías similares y otras herramientas de seguimiento cuando visitas el sitio web, usas sus servicios o interactúas con contenidos publicados en la Plataforma.</p><p>Esta política complementa los Términos y Condiciones y la Política de Privacidad de Waldo.click®, y se ha elaborado conforme a la <em>Ley N° 21.719 sobre Protección de Datos Personales</em>.</p>",
  },
  {
    order: 22,
    title: "¿Qué son las cookies?",
    text: "<p>Las cookies son pequeños archivos de texto que un sitio web almacena en tu dispositivo cuando visitas una página. Sirven para:</p><ul><li>Recordar tus preferencias</li><li>Mantener tu sesión activa</li><li>Mejorar la navegación</li><li>Obtener estadísticas de uso</li><li>Detectar problemas técnicos</li><li>Mostrar contenido relevante</li></ul>",
  },
  {
    order: 23,
    title: "Tecnologías similares",
    text: '<p>Además de cookies, Waldo.click® puede utilizar otras tecnologías con fines similares:</p><ul><li>Local Storage y Session Storage</li><li>Web Beacons y Tracking Pixels</li><li>Identificadores de dispositivo</li><li>APIs de medición</li><li>Tecnologías equivalentes</li></ul><p>A efectos de esta política, todas ellas se denominan conjuntamente <strong>"Cookies"</strong>.</p>',
  },
  {
    order: 24,
    title: "Tipos de cookies que usamos",
    text: "<p>Utilizamos distintas categorías de cookies según su función:</p><p><strong>Cookies estrictamente necesarias</strong><br>Permiten el funcionamiento básico de la Plataforma: inicio de sesión, seguridad, gestión de sesiones y preferencias esenciales. No requieren consentimiento cuando son indispensables para el servicio solicitado.</p><p><strong>Cookies funcionales</strong><br>Permiten recordar tu idioma, región, preferencias de usuario y configuraciones personalizadas.</p><p><strong>Cookies analíticas</strong><br>Nos ayudan a entender cómo se usa la Plataforma: páginas visitadas, tiempo de permanencia y rendimiento del sitio. Ejemplos: Google Analytics, Google Tag Manager, Microsoft Clarity, Hotjar.</p><p><strong>Cookies publicitarias</strong><br>Permiten medir campañas, mostrar anuncios relevantes, limitar repeticiones y evaluar conversiones. Ejemplos: Google Ads, Meta Ads, LinkedIn Ads, Microsoft Advertising.</p><p><strong>Cookies de rendimiento</strong><br>Permiten identificar errores técnicos, problemas de carga y fallas operacionales.</p>",
  },
  {
    order: 25,
    title: "¿Para qué usamos las cookies?",
    text: "<p>Las cookies nos permiten:</p><p><strong>Operar la Plataforma</strong></p><ul><li>Mantener sesiones activas</li><li>Recordar configuraciones</li><li>Gestionar autenticación</li></ul><p><strong>Seguridad</strong></p><ul><li>Detectar accesos sospechosos</li><li>Prevenir fraude</li><li>Proteger cuentas</li></ul><p><strong>Estadísticas</strong></p><ul><li>Analizar tráfico</li><li>Medir el uso de funcionalidades</li><li>Mejorar la experiencia de usuario</li></ul><p><strong>Marketing</strong></p><ul><li>Medir campañas y conversiones</li><li>Optimizar publicidad</li></ul>",
  },
  {
    order: 26,
    title: "Cookies de terceros",
    text: "<p>Algunos servicios utilizados por Waldo.click® pueden instalar cookies de terceros. Entre ellos:</p><p><strong>Google</strong></p><ul><li>Google Analytics</li><li>Google Ads</li><li>Google Tag Manager</li></ul><p><strong>Meta</strong></p><ul><li>Meta Pixel</li><li>Facebook Ads</li></ul><p><strong>LinkedIn</strong></p><ul><li>LinkedIn Insight Tag</li></ul><p><strong>Microsoft</strong></p><ul><li>Clarity</li><li>Microsoft Advertising</li></ul><p><strong>Cloudflare</strong></p><ul><li>Seguridad y protección antiataques</li></ul><p>La lista anterior es referencial y puede modificarse con el tiempo.</p>",
  },
  {
    order: 27,
    title: "¿Cómo funciona el consentimiento?",
    text: "<p>Conforme a la Ley N° 21.719, el consentimiento para el uso de cookies no esenciales debe ser:</p><ul><li><strong>Libre:</strong> no condicionado al acceso al servicio, salvo que la cookie sea estrictamente necesaria</li><li><strong>Informado:</strong> debes saber qué cookies se instalan y para qué</li><li><strong>Específico:</strong> otorgado por categoría de cookie, no de forma genérica</li><li><strong>Previo:</strong> debe obtenerse antes de instalar la cookie</li><li><strong>Afirmativo:</strong> el silencio o la inacción no constituyen consentimiento válido</li></ul><p>El consentimiento se solicitará mediante un banner de cookies o panel de configuración con opciones por categoría. Las cookies estrictamente necesarias se activarán sin requerir consentimiento.</p>",
  },
  {
    order: 28,
    title: "¿Cómo retirar el consentimiento?",
    text: "<p>Puedes modificar tus preferencias de cookies en cualquier momento mediante:</p><ul><li>La configuración de tu navegador</li><li>El panel de preferencias de cookies de la Plataforma</li><li>Las herramientas disponibles en el sitio</li></ul><p>La revocación del consentimiento no afecta la licitud del tratamiento realizado con anterioridad.</p>",
  },
  {
    order: 29,
    title: "Administración desde el navegador",
    text: "<p>La mayoría de los navegadores permiten gestionar las cookies directamente desde su configuración. Puedes:</p><ul><li>Bloquear cookies</li><li>Eliminar cookies existentes</li><li>Configurar excepciones por sitio</li><li>Limitar el seguimiento</li></ul><p>Ten en cuenta que desactivar ciertas cookies puede afectar el correcto funcionamiento de algunas funcionalidades de la Plataforma.</p>",
  },
  {
    order: 30,
    title: "Transferencias internacionales",
    text: "<p>Algunas cookies pueden implicar la transferencia de datos a proveedores ubicados fuera de Chile. Waldo.click® garantizará que dichas transferencias se realicen bajo mecanismos de protección adecuados conforme al artículo 24 de la Ley N° 21.719, tales como:</p><ul><li>Transferencias a países con nivel de protección reconocido como adecuado por la APDP</li><li>Cláusulas contractuales tipo u otras garantías aprobadas por la APDP</li></ul>",
  },
  {
    order: 31,
    title: "¿Cuánto tiempo duran las cookies?",
    text: "<p>Las cookies pueden clasificarse según su duración:</p><p><strong>Cookies de sesión:</strong> se eliminan automáticamente al cerrar el navegador.</p><p><strong>Cookies persistentes:</strong> permanecen almacenadas en tu dispositivo durante el período definido por cada proveedor, que puede variar desde días hasta años.</p>",
  },
  {
    order: 32,
    title: "Tus derechos sobre las cookies",
    text: "<p>Puedes ejercer los derechos reconocidos en la Ley N° 21.719 escribiéndonos a <strong>contacto@waldo.click</strong>.</p><p>Si consideras que hemos vulnerado tus derechos, puedes reclamar ante la <strong>Agencia de Protección de Datos Personales (APDP)</strong>.</p>",
  },
  {
    order: 33,
    title: "Cambios a la política de cookies",
    text: "<p>Waldo.click® puede modificar esta Política cuando cambie la legislación, se incorporen nuevas tecnologías o se modifiquen los servicios utilizados.</p><p>Te avisaremos cuando los cambios sean sustanciales.</p>",
  },
  {
    order: 34,
    title: "Contacto — Cookies",
    text: "<p>Si tienes preguntas sobre el uso de cookies en la Plataforma, puedes contactarnos en:</p><p><strong>Waldo.click®</strong><br>contacto@waldo.click<br>Santiago, Chile</p>",
  },

  // ─── POLÍTICA DE SEGURIDAD ────────────────────────────────────────────────
  {
    order: 35,
    title: "¿Qué regula la política de seguridad?",
    text: "<p>Esta Política establece los principios generales de seguridad de la información y ciberseguridad aplicables a <strong>Waldo.click®</strong>, en cumplimiento de la <em>Ley N° 21.663 Marco de Ciberseguridad</em> y la <em>Ley N° 21.719 sobre Protección de Datos Personales</em>.</p><p>Su objetivo es proteger:</p><ul><li>Información corporativa</li><li>Datos personales de usuarios</li><li>Sistemas tecnológicos e infraestructura digital</li><li>Servicios prestados por la Plataforma</li></ul>",
  },
  {
    order: 36,
    title: "¿A quién aplica esta política?",
    text: "<p>Esta Política aplica a:</p><ul><li>Usuarios de la Plataforma</li><li>Colaboradores de Waldo.click®</li><li>Proveedores tecnológicos</li><li>Contratistas</li><li>Sistemas propios y sistemas de terceros utilizados por Waldo.click®</li></ul>",
  },
  {
    order: 37,
    title: "¿Quién es responsable de la seguridad?",
    text: "<p>Waldo.click® designa un <strong>Responsable de Seguridad de la Información</strong> (CISO, conforme a la Ley N° 21.663) como punto de contacto para materias de ciberseguridad, gestión de incidentes y coordinación con la Agencia Nacional de Ciberseguridad (ANCI).</p><p>Contacto: <strong>contacto@waldo.click</strong></p>",
  },
  {
    order: 38,
    title: "Principios de seguridad",
    text: "<p>Waldo.click® procura proteger la información conforme a los siguientes principios:</p><p><strong>Confidencialidad:</strong> acceso únicamente por personas autorizadas.</p><p><strong>Integridad:</strong> protección contra alteraciones no autorizadas.</p><p><strong>Disponibilidad:</strong> acceso oportuno a los sistemas cuando se necesita.</p><p><strong>Trazabilidad:</strong> capacidad de registrar y auditar eventos relevantes.</p><p><strong>Resiliencia:</strong> capacidad de recuperación ante incidentes.</p>",
  },
  {
    order: 39,
    title: "Medidas de seguridad implementadas",
    text: "<p>Waldo.click® puede implementar, entre otras, las siguientes medidas de seguridad:</p><ul><li>Firewalls y sistemas antimalware</li><li>Monitoreo de eventos de seguridad</li><li>Cifrado de comunicaciones</li><li>Control de accesos por rol</li><li>Gestión de respaldos</li><li>Segmentación de redes</li><li>Protección contra ataques DDoS</li><li>Autenticación reforzada</li><li>Sistemas de detección de intrusiones</li></ul><p>La naturaleza exacta de las medidas implementadas se considera información reservada.</p>",
  },
  {
    order: 40,
    title: "Gestión de accesos",
    text: "<p>El acceso a sistemas y datos se otorga conforme al <strong>principio de mínimo privilegio</strong>: cada persona accede solo a lo que necesita para cumplir sus funciones.</p><p>Los accesos pueden ser limitados, revocados y auditados en cualquier momento.</p>",
  },
  {
    order: 41,
    title: "Tus obligaciones de seguridad",
    text: "<p>Como usuario de la Plataforma, debes:</p><ul><li>Mantener contraseñas seguras y únicas</li><li>No compartir tus credenciales con terceros</li><li>Reportar incidentes o actividad sospechosa a <strong>seguridad@waldo.click</strong></li><li>Utilizar la Plataforma de manera legítima y conforme a estos términos</li></ul>",
  },
  {
    order: 42,
    title: "Actividades prohibidas",
    text: "<p>Está <strong>prohibido</strong>:</p><ul><li>Intentar vulnerar o evadir sistemas de seguridad</li><li>Realizar ingeniería inversa sobre la Plataforma</li><li>Ejecutar ataques informáticos de cualquier tipo</li><li>Interferir con la disponibilidad de los servicios</li><li>Automatizar accesos no autorizados</li><li>Intentar extraer bases de datos</li></ul>",
  },
  {
    order: 43,
    title: "Monitoreo de seguridad",
    text: "<p>Waldo.click® puede monitorear eventos técnicos de la Plataforma con los siguientes fines:</p><ul><li>Seguridad y detección de amenazas</li><li>Auditoría interna</li><li>Prevención de fraude</li><li>Protección operacional</li></ul>",
  },
  {
    order: 44,
    title: "Clasificación de incidentes",
    text: "<p>Waldo.click® clasifica los incidentes de ciberseguridad conforme a la Ley N° 21.663:</p><p><strong>Incidentes críticos:</strong> aquellos que afectan la continuidad operacional de servicios esenciales o comprometen datos personales de forma masiva.</p><p><strong>Incidentes significativos:</strong> aquellos que afectan parcialmente la disponibilidad o integridad de sistemas o datos de usuarios.</p><p><strong>Otros incidentes:</strong> eventos de menor impacto que requieren contención y documentación interna.</p>",
  },
  {
    order: 45,
    title: "¿Qué hacemos ante un incidente?",
    text: "<p>Ante un incidente de seguridad, Waldo.click® activa un proceso de respuesta que incluye:</p><p><strong>Identificar:</strong> detectar la actividad anómala y determinar su alcance.</p><p><strong>Contener:</strong> limitar el impacto del incidente.</p><p><strong>Mitigar:</strong> reducir los riesgos asociados.</p><p><strong>Recuperar:</strong> restablecer los servicios afectados.</p><p><strong>Documentar:</strong> registrar todos los antecedentes relevantes para análisis posterior.</p>",
  },
  {
    order: 46,
    title: "Notificación de incidentes",
    text: "<p>Waldo.click® cumplirá con las obligaciones de notificación establecidas en la legislación vigente:</p><p><strong>Notificación a la ANCI:</strong> Waldo.click® notificará a la Agencia Nacional de Ciberseguridad los incidentes dentro de los plazos establecidos en la Ley N° 21.663: reporte inicial en 3 horas para incidentes críticos, y reporte preliminar en 24 horas para incidentes significativos, desde que se tome conocimiento del evento.</p><p><strong>Notificación a la APDP:</strong> si el incidente compromete datos personales, Waldo.click® notificará a la Agencia de Protección de Datos Personales conforme al artículo 26 de la Ley N° 21.719.</p><p><strong>Notificación a titulares:</strong> cuando el incidente pueda generar un riesgo significativo para los derechos de los titulares de datos, serán notificados a la brevedad posible.</p>",
  },
  {
    order: 47,
    title: "Coordinación con CSIRT",
    text: "<p>Waldo.click® puede coordinarse con el CSIRT de Gobierno u otros equipos de respuesta a incidentes de ciberseguridad reconocidos por la ANCI, para la gestión de incidentes de alta complejidad.</p>",
  },
  {
    order: 48,
    title: "Proveedores tecnológicos",
    text: "<p>Waldo.click® puede contratar servicios de terceros para infraestructura cloud, seguridad, monitoreo y comunicaciones.</p><p>La utilización de proveedores externos no implica renuncia a las obligaciones legales aplicables a Waldo.click®.</p>",
  },
  {
    order: 49,
    title: "Continuidad operacional",
    text: "<p>Waldo.click® puede implementar medidas de continuidad para reducir el impacto de fallas o desastres, incluyendo:</p><ul><li>Respaldos periódicos</li><li>Procedimientos de recuperación ante desastres</li><li>Redundancia de sistemas</li><li>Procedimientos de contingencia</li></ul><p>Sin perjuicio de lo anterior, no se garantiza disponibilidad ininterrumpida.</p>",
  },
  {
    order: 50,
    title: "Limitación de responsabilidad en seguridad",
    text: "<p>Ningún sistema tecnológico puede garantizar seguridad absoluta. En consecuencia, Waldo.click® no garantiza la ausencia total de vulnerabilidades, la imposibilidad de ataques ni la disponibilidad permanente del servicio.</p><p>Sin perjuicio de lo anterior, Waldo.click® adoptará medidas razonables de protección conforme a los estándares aplicables.</p>",
  },
  {
    order: 51,
    title: "Cumplimiento normativo",
    text: "<p>Esta Política se interpreta y aplica conforme a la legislación chilena vigente, incluyendo:</p><ul><li>Ley N° 21.663 Marco de Ciberseguridad</li><li>Ley N° 21.719 sobre Protección de Datos Personales</li><li>Normativa de la ANCI y la APDP</li><li>Demás normativa complementaria aplicable</li></ul>",
  },
  {
    order: 52,
    title: "Cambios a la política de seguridad",
    text: "<p>Waldo.click® puede modificar esta Política para adaptarla a nuevos riesgos, cambios regulatorios o la evolución tecnológica.</p><p>Te avisaremos cuando los cambios sean sustanciales.</p>",
  },
  {
    order: 53,
    title: "Contacto — Seguridad",
    text: "<p>Si tienes preguntas sobre seguridad o quieres reportar un incidente, puedes contactarnos en:</p><p><strong>Waldo.click®</strong><br>contacto@waldo.click<br>Responsable de Seguridad / CISO: contacto@waldo.click<br>Santiago, Chile</p>",
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
