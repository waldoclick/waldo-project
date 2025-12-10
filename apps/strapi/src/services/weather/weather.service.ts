import fs from "fs";
import path from "path";
import { WeatherData, WeatherResponse } from "./interfaces";
import { HttpClient } from "./http-client";

export class WeatherService {
  private dataDir = "data";
  private dataFile = "weather.json";
  private dataPath: string;
  private httpClient: HttpClient;

  constructor() {
    this.dataPath = path.join(process.cwd(), this.dataDir, this.dataFile);
    this.httpClient = new HttpClient();
    this.initDataFile();
  }

  private initDataFile(): void {
    if (!fs.existsSync(path.join(process.cwd(), this.dataDir))) {
      fs.mkdirSync(path.join(process.cwd(), this.dataDir));
    }

    if (!fs.existsSync(this.dataPath)) {
      fs.writeFileSync(this.dataPath, JSON.stringify([]));
    }
  }

  private readData(): WeatherData[] {
    const data = fs.readFileSync(this.dataPath, "utf-8");
    return JSON.parse(data);
  }

  private writeData(data: WeatherData[]): void {
    fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
  }

  private shouldUpdate(data: WeatherData): boolean {
    const today = new Date().toISOString().split("T")[0];
    const dataDate = new Date(data.timestamp).toISOString().split("T")[0];
    return today !== dataDate;
  }

  private async fetchWeather(comuna: string): Promise<WeatherData> {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    console.log("API Key:", apiKey);
    if (!apiKey) throw new Error("OpenWeather API key not found");

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${comuna},CL&appid=${apiKey}&units=metric`;
    const response = await this.httpClient.get<WeatherResponse>(url);

    return {
      nombre: comuna,
      temperatura: response.main.temp,
      humedad: response.main.humidity,
      descripcion: response.weather[0].description,
      timestamp: new Date().toISOString(),
    };
  }

  async find(comuna: string): Promise<WeatherData> {
    const data = this.readData();
    const comunaData = data.find(
      (d) => d.nombre.toLowerCase() === comuna.toLowerCase()
    );

    if (!comunaData) {
      const weatherData = await this.fetchWeather(comuna);
      data.push(weatherData);
      this.writeData(data);
      return weatherData;
    }

    if (this.shouldUpdate(comunaData)) {
      const weatherData = await this.fetchWeather(comuna);
      const index = data.findIndex(
        (d) => d.nombre.toLowerCase() === comuna.toLowerCase()
      );
      data[index] = weatherData;
      this.writeData(data);
      return weatherData;
    }

    return comunaData;
  }

  async findMany(comunas: string[]): Promise<WeatherData[]> {
    const results: WeatherData[] = [];
    for (const comuna of comunas) {
      const data = await this.find(comuna);
      results.push(data);
    }
    return results;
  }
}
