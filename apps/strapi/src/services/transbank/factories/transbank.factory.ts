import { TransbankService } from "../services/transbank.service";

export class TransbankFactory {
  static createTransbankService() {
    return TransbankService;
  }
}
