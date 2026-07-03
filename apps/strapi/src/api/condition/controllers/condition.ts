/**
 * condition controller
 */

import { createListController } from "../../../utils/list-controller";

export default {
  ...createListController({
    uid: "api::condition.condition",
    defaultOrderBy: { name: "asc" },
  }),
};
