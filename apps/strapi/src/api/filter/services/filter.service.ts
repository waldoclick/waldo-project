import { Commune, Category, StrapiFilter } from "../types/filter.types";

export class FilterService {
  async getCommunes(): Promise<Commune[]> {
    // Get all ads with the specified conditions and the commune and region relationship
    const ads = await strapi.db.query("api::ad.ad").findMany({
      where: {
        active: true,
        rejected: false,
        remaining_days: { $gt: 0 },
      },
      populate: {
        commune: {
          populate: ["region"],
        },
      },
    });

    // Extract the communes and remove duplicates
    const communeMap = new Map();
    ads.forEach((ad) => {
      if (ad.commune) {
        communeMap.set(ad.commune.id, ad.commune);
      }
    });
    const communes = Array.from(communeMap.values());

    // Sort the communes by name
    communes.sort((a, b) => a.name.localeCompare(b.name));

    return communes as Commune[];
  }

  async getCategories(): Promise<Category[]> {
    // Fetch all categories with their icons
    const allCategories = await strapi.db
      .query("api::category.category")
      .findMany({
        populate: ["icon"],
      });

    // Fetch all ads with their categories, filtered by active and not rejected
    const ads = await strapi.db.query("api::ad.ad").findMany({
      where: {
        active: true,
        rejected: false,
        remaining_days: { $gt: 0 },
      },
      populate: ["category"],
    });

    // Create a map to store the count of ads per category
    const categoryCounts: { [key: string]: Category } = {};

    // Initialize the map with all categories and a count of 0
    allCategories.forEach((category) => {
      categoryCounts[category.id] = {
        ...category,
        count: 0,
      };
    });

    // Iterate over the ads to count the number of ads per category
    ads.forEach((ad) => {
      const category = ad.category;
      if (category && categoryCounts[category.id]) {
        categoryCounts[category.id].count++;
      }
    });

    // Convert the map to an array of category objects with their counts
    const categoriesMapped = Object.values(categoryCounts);

    // Sort the categories by name in ascending order
    categoriesMapped.sort((a, b) => a.name.localeCompare(b.name));

    return categoriesMapped as Category[];
  }
}
