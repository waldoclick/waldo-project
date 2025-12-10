import { Context } from "koa";
import { FilterService } from "../services/filter.service";
import { FilterResponse, Commune, Category } from "../types/filter.types";

const filterService = new FilterService();

const filterController = {
  async communes(ctx: Context) {
    try {
      const communes = await filterService.getCommunes();
      const response: FilterResponse<Commune> = {
        data: communes,
      };
      ctx.body = response;
    } catch (error) {
      ctx.throw(500, "Error fetching communes");
    }
  },

  async categories(ctx: Context) {
    try {
      const categories = await filterService.getCategories();
      const response: FilterResponse<Category> = {
        data: categories,
      };
      ctx.body = response;
    } catch (error) {
      ctx.throw(500, "Error fetching categories");
    }
  },
};

export default filterController;
