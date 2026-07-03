/**
 * region controller
 */

import { createListController } from "../../../utils/list-controller";

export default {
  ...createListController({
    uid: "api::region.region",
    defaultOrderBy: { name: "asc" },
    findOnePopulate: ["communes"],
  }),
};
