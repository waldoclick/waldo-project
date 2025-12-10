// Exportar cliente
export { strapiClient, initStrapiClient } from './client';

// Exportar funciones de autenticación
export {
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  isModerator,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyToken,
} from './auth';

// Exportar funciones de anuncios
export {
  getAds,
  getAdsWithPopulate,
  getAd,
  createAd,
  updateAd,
  deleteAd,
  getUserAds,
  approveAd,
  rejectAd,
  getActiveAds,
  getPendingAds,
  getArchivedAds,
  getRejectedAds,
} from './ads';

// Exportar funciones de usuarios
export { getUsers, getUser, createUser, updateUser, deleteUser } from './users';

// Exportar funciones de órdenes
export {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getUserOrders,
  getAdOrders,
} from './orders';

// Exportar funciones de regiones
export {
  getRegions,
  getRegion,
  createRegion,
  updateRegion,
  deleteRegion,
} from './regions';

// Exportar funciones de comunas
export {
  getCommunes,
  getCommune,
  createCommune,
  updateCommune,
  deleteCommune,
  getRegionCommunes,
} from './communes';

// Exportar funciones de ad packs
export {
  getAdPacks,
  getAdPack,
  createAdPack,
  updateAdPack,
  deleteAdPack,
} from './ad-packs';

// Exportar funciones de ad reservations
export {
  getAdReservations,
  getAdReservation,
  getUsedReservations,
  getFreeReservations,
  getUserReservations,
} from './ad-reservations';

// Exportar funciones de ad featured reservations
export {
  getAdFeaturedReservations,
  getAdFeaturedReservation,
  getUsedFeaturedReservations,
  getFreeFeaturedReservations,
  getUserFeaturedReservations,
} from './ad-featured-reservations';

// Exportar tipos
export type {
  StrapiAuthResponse,
  StrapiUser,
  StrapiRole,
  LoginCredentials,
  ForgotPasswordData,
  ResetPasswordData,
  StrapiError,
  StrapiConfig,
  StrapiAd,
  StrapiCommune,
  StrapiCondition,
  StrapiCategory,
  StrapiMedia,
  StrapiAdsResponse,
  StrapiUsersResponse,
  StrapiOrder,
  StrapiOrdersResponse,
  StrapiRegion,
  StrapiRegionsResponse,
  StrapiCommunesResponse,
  StrapiAdPack,
  StrapiAdPacksResponse,
  StrapiAdReservation,
  StrapiAdReservationsResponse,
  StrapiAdFeaturedReservation,
  StrapiAdFeaturedReservationsResponse,
} from './types';
