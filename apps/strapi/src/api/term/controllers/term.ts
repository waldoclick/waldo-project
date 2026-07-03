/**
 * term controller
 */

import {
  createListController,
  createReorderController,
} from "../../../utils/list-controller";

const UID = "api::term.term";

export default {
  ...createListController({ uid: UID }),
  reorder: createReorderController(UID),
};
