/**
 * security-policy controller
 */

import {
  createListController,
  createReorderController,
} from "../../../utils/list-controller";

const UID = "api::security-policy.security-policy";

export default {
  ...createListController({ uid: UID }),
  reorder: createReorderController(UID),
};
