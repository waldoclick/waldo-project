import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";
import winston from "winston";
import "winston-daily-rotate-file";

// Validar que el token esté presente
const logtailToken = process.env.LOGTAIL_TOKEN;
const logtailEndpoint = process.env.LOGTAIL_ENDPOINT;

if (!logtailToken) {
  console.warn(
    "LOGTAIL_TOKEN no está configurado. Los logs no se enviarán a BetterStack."
  );
}

// Inicializar Logtail solo si el token está presente
const logtail = logtailToken
  ? new Logtail(
      logtailToken,
      logtailEndpoint
        ? {
            endpoint: logtailEndpoint.startsWith("http")
              ? logtailEndpoint
              : `https://${logtailEndpoint}`,
          }
        : undefined
    )
  : null;

// Configurar el logger de Winston
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Solo agregar el transport de Logtail si está configurado
    ...(logtail ? [new LogtailTransport(logtail)] : []),
    // Siempre incluir el transport de consola
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr =
            Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        })
      ),
    }),
    // Agregar el transport de archivo con rotación
    new winston.transports.DailyRotateFile({
      filename: "logs/app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "5m",
      maxFiles: "90d",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ],
});

export default logger;
