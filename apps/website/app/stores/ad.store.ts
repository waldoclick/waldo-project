import { defineStore } from "pinia";
import type {
  AdForm,
  PackType,
  FeaturedType,
  GalleryItem,
  AdState,
} from "@/types/ad";

interface AnalyticsItem {
  item_id?: number | string;
  item_name: string;
  item_category: string;
  price?: number;
  quantity?: number;
  currency?: string;
}

const initialState = structuredClone({
  step: 1,
  pack: 1 as PackType,
  featured: false as FeaturedType,
  is_invoice: false,
  ad: {
    ad_id: null as number | null,
    price: 0,
    name: "",
    category: 0,
    email: "",
    phone: "",
    region: null as number | null,
    commune: null as number | null,
    address: "",
    address_number: "",
    condition: null as number | null,
    description: "",
    manufacturer: "",
    model: "",
    year: 0,
    serial_number: "",
    weight: 0,
    width: 0,
    height: 0,
    depth: 0,
    gallery: [] as GalleryItem[],
    currency: "CLP",
  },
  analytics: {
    view_item_list: [] as any[],
    pack_selected: null as AnalyticsItem | null,
    featured_selected: null as AnalyticsItem | null,
  },
});

export const useAdStore = defineStore("ad", {
  state: () => structuredClone(initialState),

  getters: {
    getStep: (state) => state.step,
    getPack: (state) => state.pack,
    getFeatured: (state) => state.featured,
    getIsInvoice: (state) => state.is_invoice,
    getAd: (state) => state.ad,
    getAnalytics: (state) => state.analytics,
    getViewItemList: (state) => state.analytics.view_item_list,
    isPackSelected: (state) => state.analytics.pack_selected !== null,
    isFeaturedSelected: (state) => state.analytics.featured_selected !== null,
    hasFormInProgress: (state) => {
      const adObject = JSON.parse(JSON.stringify(state.ad));
      const initialObject = JSON.parse(JSON.stringify(initialState.ad));
      return JSON.stringify(adObject) !== JSON.stringify(initialObject);
    },
  },

  actions: {
    updateStep(step: number) {
      this.step = step;
    },

    updatePack(pack: PackType) {
      this.pack = pack;
    },

    updateFeatured(featured: FeaturedType) {
      this.featured = featured;
    },

    updateIsInvoice(is_invoice: boolean) {
      this.is_invoice = is_invoice;
    },

    updateName(name: string) {
      this.ad.name = name;
    },

    updateCategory(category: number) {
      this.ad.category = category;
    },

    updateEmail(email: string) {
      this.ad.email = email;
    },

    updatePhone(phone: string) {
      this.ad.phone = phone;
    },

    updateRegion(region: number | null) {
      this.ad.region = region;
    },

    updateCommune(commune: number | null) {
      this.ad.commune = commune;
    },

    updateAddress(address: string) {
      this.ad.address = address;
    },

    updateAddressNumber(address_number: string) {
      this.ad.address_number = address_number;
    },

    updateCondition(condition: number | null) {
      this.ad.condition = condition;
    },

    updateDescription(description: string) {
      this.ad.description = description;
    },

    updateManufacturer(manufacturer: string) {
      this.ad.manufacturer = manufacturer;
    },

    updateModel(model: string) {
      this.ad.model = model;
    },

    updateYear(year: number) {
      this.ad.year = year;
    },

    updateSerialNumber(serial_number: string) {
      this.ad.serial_number = serial_number;
    },

    updateWeight(weight: number) {
      this.ad.weight = weight;
    },

    updateWidth(width: number) {
      this.ad.width = width;
    },

    updateHeight(height: number) {
      this.ad.height = height;
    },

    updateDepth(depth: number) {
      this.ad.depth = depth;
    },

    updateGallery(gallery: GalleryItem[]) {
      this.ad.gallery = gallery;
    },

    removeFromGallery(image: GalleryItem) {
      this.ad.gallery = this.ad.gallery.filter((item) => item.id !== image.id);
    },

    updateCurrency(currency: string) {
      this.ad.currency = currency;
    },

    updateAdId(ad_id: number) {
      this.ad.ad_id = ad_id;
    },

    updatePrice(price: number) {
      this.ad.price = price;
    },

    updateViewItemList(items: any[]) {
      this.analytics.view_item_list = items;
    },

    updatePackSelected(item: AnalyticsItem | null) {
      this.analytics.pack_selected = item;
    },

    updateFeaturedSelected(item: AnalyticsItem | null) {
      this.analytics.featured_selected = item;
    },

    clearAll() {
      this.pack = 1;
      this.featured = false;
      this.is_invoice = false;
      this.step = 1;
      this.analytics.view_item_list = [];
      this.analytics.pack_selected = null;
      this.analytics.featured_selected = null;

      this.ad = {
        ad_id: null,
        price: 0,
        name: "",
        category: 0,
        email: "",
        phone: "",
        region: null,
        commune: null,
        address: "",
        address_number: "",
        condition: null,
        description: "",
        manufacturer: "",
        model: "",
        year: 0,
        serial_number: "",
        weight: 0,
        width: 0,
        height: 0,
        depth: 0,
        gallery: [],
        currency: "CLP",
      };
    },
  },

  persist: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
  },
});
