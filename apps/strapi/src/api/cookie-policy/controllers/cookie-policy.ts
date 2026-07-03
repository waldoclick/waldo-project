/**
 * cookie-policy controller
 */

import {
  createListController,
  createReorderController,
} from "../../../utils/list-controller";

const UID = "api::cookie-policy.cookie-policy";

export default {
  ...createListController({ uid: UID }),
  reorder: createReorderController(UID),
};
