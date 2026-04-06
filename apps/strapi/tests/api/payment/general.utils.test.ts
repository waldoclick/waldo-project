// src/api/payment/tests/ensureFreeReservations.test.ts

import { createStrapi } from "@strapi/strapi";
import generalUtils from "../utils/general.utils";

let instance: Awaited<ReturnType<typeof createStrapi>>;

beforeAll(async () => {
  instance = await createStrapi();
  await instance.start();
  global.strapi = instance; // ⬅️ esto es CLAVE: define `strapi` como global
});

afterAll(async () => {
  await instance.destroy();
});

describe("ensureFreeReservations (test rápido)", () => {
  it("ejecuta para user 42", async () => {
    const result = await generalUtils.ensureFreeReservations("42");
    console.log(result);
  });
});
