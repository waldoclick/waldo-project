/**
 * policy controller
 */

import {
  createListController,
  createReorderController,
} from "../../../utils/list-controller";

const UID = "api::policy.policy";

export default {
  ...createListController({ uid: UID }),
  reorder: createReorderController(UID),
};
