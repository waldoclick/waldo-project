/**
 * faq controller
 */

import {
  createListController,
  createReorderController,
} from "../../../utils/list-controller";

const UID = "api::faq.faq";

export default {
  ...createListController({ uid: UID }),
  reorder: createReorderController(UID),
};
