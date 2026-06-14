import LogRocket from "logrocket";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const appId = config.public.logRocketAppId;

  // console.log("[LogRocket] Inicializando con App ID:", appId);
  LogRocket.init(appId);

  // Obtener usuario de Strapi
  const user = useSessionUser();
  // console.log("[LogRocket] Usuario inicial:", user.value);

  // Función para identificar usuario en LogRocket
  const identifyUser = (userData) => {
    if (userData) {
      const userName = `${userData.firstname || ""} ${
        userData.lastname || ""
      }`.trim();
      const userEmail = userData.email;

      const userInfo = {
        name: userName,
        email: userEmail,
      };

      // console.log("[LogRocket] Identificando usuario:", userInfo);
      LogRocket.identify(userInfo);
    } else {
      // console.log("[LogRocket] Limpiando identificación de usuario");
      LogRocket.identify(null);
    }
  };

  // Configurar usuario inicial si está logueado
  identifyUser(user.value);

  // Observar cambios en el usuario (login/logout)
  watch(user, (currentUser) => {
    // console.log("[LogRocket] Usuario cambió:", currentUser);
    identifyUser(currentUser);
  });
});
