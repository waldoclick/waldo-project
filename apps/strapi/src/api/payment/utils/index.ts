// Importar todas las utilidades
import generalUtils from "./general.utils";
import adUtils from "./ad.utils";
import featuredUtils from "./featured.utils";
import packUtils from "./pack.utils";
import reservationUtils from "./reservation.utils";
import orderUtils from "./order.utils";

// Exportar un objeto con todas las utilidades
const PaymentUtils = {
  general: generalUtils,
  ad: adUtils,
  adFeaturedReservation: featuredUtils,
  adPack: packUtils,
  adReservation: reservationUtils,
  order: orderUtils,
};

export default PaymentUtils;
