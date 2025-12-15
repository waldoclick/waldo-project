export const useGoogleOneTap = () => {
  const initializeGoogleOneTap = () => {
    if (typeof window === "undefined") return;

    // Verificar si ya está inicializado
    if ((window as any).googleOneTapInitialized) {
      return;
    }

    // Obtener Client ID desde la config de Nuxt
    const config = useRuntimeConfig();
    const clientId = config.public.googleClientId;

    if (!clientId) {
      console.warn(
        "Google Client ID no configurado en las variables de entorno"
      );
      return;
    }

    // Función para manejar la respuesta
    const handleCredentialResponse = (response: any) => {
      try {
        const token = response.credential;
        if (token) {
          // Redirigir a la página de autenticación de Google
          window.location.href = `/login/google?access_token=${token}`;
        } else {
          console.error("No se recibió token de Google One Tap");
        }
      } catch (error) {
        console.error("Error procesando respuesta de Google One Tap:", error);
      }
    };

    // Hacer la función global
    (window as any).handleCredentialResponse = handleCredentialResponse;

    // Esperar a que Google esté cargado
    const checkGoogle = () => {
      if (window.google?.accounts?.id) {
        try {
          // Inicializar Google One Tap
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false, // Cambiar a false para evitar auto-selección
            cancel_on_tap_outside: true, // Permitir cancelar al hacer clic fuera
            use_fedcm_for_prompt: true, // Usar FedCM si está disponible
          });

          // Mostrar el widget
          window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed()) {
              console.log(
                "Google One Tap no se puede mostrar:",
                notification.getNotDisplayedReason()
              );
            } else if (notification.isSkippedMoment()) {
              console.log(
                "Google One Tap fue omitido:",
                notification.getSkippedReason()
              );
            } else if (notification.isDismissedMoment()) {
              console.log(
                "Google One Tap fue descartado:",
                notification.getDismissedReason()
              );
            }
          });

          // Marcar como inicializado
          (window as any).googleOneTapInitialized = true;
        } catch (error) {
          console.error("Error inicializando Google One Tap:", error);
        }
      } else {
        // Reintentar después de un breve delay
        setTimeout(checkGoogle, 100);
      }
    };

    // Esperar un poco antes de intentar inicializar
    setTimeout(checkGoogle, 500);
  };

  return {
    initializeGoogleOneTap,
  };
};
