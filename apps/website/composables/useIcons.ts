import {
  ChevronRight as IconChevronRight,
  Pickaxe as IconPickaxe,
  HeartPulse as IconHeartPulse,
  Trees as IconTrees,
  Wheat as IconWheat,
  Sandwich as IconSandwich,
  Building2 as IconBuilding2,
  Beef as IconBeef,
  Cog as IconCog,
  FishSymbol as IconFishSymbol,
  Truck as IconTruck,
  Zap as IconZap,
  Wifi as IconWifi,
} from "lucide-vue-next";

export const useIcons = () => {
  const getCategoryIcon = (category: string) => {
    const slug = category?.toLowerCase() || "";

    const iconMap: { [key: string]: any } = {
      mineria: IconPickaxe,
      salud: IconHeartPulse,
      silvicultura: IconTrees,
      agricultura: IconWheat,
      alimentacion: IconSandwich,
      construccion: IconBuilding2,
      ganaderia: IconBeef,
      manufactura: IconCog,
      pesca: IconFishSymbol,
      transporte: IconTruck,
      energia: IconZap,
      telecomunicaciones: IconWifi,
    };

    return iconMap[slug] || IconCog;
  };

  return {
    icons: {
      ChevronRight: IconChevronRight,
      Pickaxe: IconPickaxe,
      Heart: IconHeartPulse,
      Trees: IconTrees,
      Wheat: IconWheat,
      Sandwich: IconSandwich,
      Building2: IconBuilding2,
      Beef: IconBeef,
      Cog: IconCog,
      Fish: IconFishSymbol,
      Truck: IconTruck,
      Zap: IconZap,
      Wifi: IconWifi,
    },
    getCategoryIcon,
  };
};
