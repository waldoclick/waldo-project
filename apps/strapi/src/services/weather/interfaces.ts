export interface WeatherData {
  nombre: string;
  temperatura: number;
  humedad: number;
  descripcion: string;
  timestamp: string;
}

export interface WeatherError {
  message: string;
  code: number;
}

export interface WeatherResponse {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
  }>;
}
