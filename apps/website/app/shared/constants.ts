// Shared constants accessible from both client and server
export const APP_CONFIG = {
  name: "Waldo.click®",
  version: "4.0.0",
  description: "Plataforma para compra y venta de equipo industrial en Chile",
  url: process.env.BASE_URL || "http://localhost:3000",
  apiUrl: process.env.API_URL || "http://localhost:1337",
} as const;

export const CATEGORIES = [
  { id: "pesca", name: "Pesca", icon: "fish-symbol", color: "#C9E9EC" },
  {
    id: "alimentacion",
    name: "Alimentación",
    icon: "sandwich",
    color: "#D8C9DE",
  },
  { id: "mineria", name: "Minería", icon: "pickaxe", color: "#F4E3CD" },
  { id: "agricultura", name: "Agricultura", icon: "wheat", color: "#C2E3D9" },
  {
    id: "construccion",
    name: "Construcción",
    icon: "building-2",
    color: "#D0D9EB",
  },
  { id: "energia", name: "Energía", icon: "zap", color: "#F6EACE" },
  { id: "ganaderia", name: "Ganadería", icon: "beef", color: "#F3D6D0" },
  { id: "manufactura", name: "Manufactura", icon: "cog", color: "#F1CAD8" },
  { id: "salud", name: "Salud", icon: "heart-pulse", color: "#FFFFFF" },
  { id: "silvicultura", name: "Silvicultura", icon: "trees", color: "#DBE2C5" },
  {
    id: "telecomunicaciones",
    name: "Telecomunicaciones",
    icon: "wifi",
    color: "#C9D3EB",
  },
  { id: "transporte", name: "Transporte", icon: "truck", color: "#D6D6D7" },
] as const;

export const AD_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  PUBLISHED: "published",
  EXPIRED: "expired",
  SOLD: "sold",
} as const;

export const PACK_TYPES = {
  BASIC: "basic",
  PREMIUM: "premium",
  ENTERPRISE: "enterprise",
} as const;
