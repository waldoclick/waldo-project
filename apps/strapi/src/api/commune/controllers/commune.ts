/**
 * commune controller
 */

import { createListController } from "../../../utils/list-controller";

export default {
  ...createListController({
    uid: "api::commune.commune",
    defaultOrderBy: { name: "asc" },
    findOnePopulate: ["region"],
  }),
};
