import dotenv from "dotenv";
import path from "path";

// Cargar variables de entorno desde el archivo .env
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import weatherService from "./index";

describe("WeatherService", () => {
  it("should get weather data for Santiago", async () => {
    const data = await weatherService.find("Santiago");

    expect(data).toHaveProperty("nombre", "Santiago");
    expect(data).toHaveProperty("temperatura");
    expect(data).toHaveProperty("humedad");
    expect(data).toHaveProperty("descripcion");
    expect(data).toHaveProperty("timestamp");
  });
});
