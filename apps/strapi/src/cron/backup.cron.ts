import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { format } from "date-fns";

const execAsync = promisify(exec);

export interface ICronjobResult {
  success: boolean;
  results?: string;
  error?: string;
}

export class BackupService {
  private readonly backupDir = path.join(process.cwd(), "backups");
  private readonly maxBackupDays = 7;

  async createDatabaseBackup(): Promise<ICronjobResult> {
    try {
      // Verificar si strapi está definido
      if (typeof strapi === "undefined") {
        throw new Error("strapi is not defined");
      }

      strapi.log.info("=== INICIANDO BACKUP DE BASE DE DATOS ===");

      // Crear directorio de backups si no existe
      await this.ensureBackupDirectory();

      // Obtener configuración de la base de datos
      const dbConfig = strapi.config.database.connection;
      const client = dbConfig.client;

      let backupCommand: string;
      let backupFileName: string;

      const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss");

      switch (client) {
        case "mysql":
          backupCommand = this.buildMySQLBackupCommand(dbConfig, timestamp);
          backupFileName = `backup_mysql_${timestamp}.sql`;
          break;

        case "postgres":
          backupCommand = this.buildPostgreSQLBackupCommand(
            dbConfig,
            timestamp
          );
          backupFileName = `backup_postgres_${timestamp}.sql`;
          break;

        case "sqlite":
          backupCommand = this.buildSQLiteBackupCommand(dbConfig, timestamp);
          backupFileName = `backup_sqlite_${timestamp}.db`;
          break;

        default:
          throw new Error(`Unsupported database client: ${client}`);
      }

      const backupPath = path.join(this.backupDir, backupFileName);

      strapi.log.info(`Ejecutando backup para ${client}...`);
      strapi.log.info(`Comando: ${backupCommand}`);

      // Ejecutar el comando de backup
      const { stdout, stderr } = await execAsync(backupCommand);

      if (stderr && !stderr.includes("Warning")) {
        strapi.log.warn(`Backup stderr: ${stderr}`);
      }

      strapi.log.info(`Backup creado exitosamente: ${backupPath}`);

      // Comprimir el backup
      await this.compressBackup(backupPath);

      // Limpiar backups antiguos
      await this.cleanOldBackups();

      strapi.log.info("=== BACKUP DE BASE DE DATOS FINALIZADO ===");

      return {
        success: true,
        results: `Backup creado exitosamente: ${backupFileName}`,
      };
    } catch (error) {
      strapi.log.error("Error creando backup:", error);
      return {
        success: false,
        error: `Failed to create backup: ${error.message}`,
      };
    }
  }

  private async ensureBackupDirectory(): Promise<void> {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      strapi.log.info(`Directorio de backups creado: ${this.backupDir}`);
    }
  }

  private buildMySQLBackupCommand(config: any, timestamp: string): string {
    const {
      host = "localhost",
      port = 3306,
      database,
      user,
      password,
    } = config.connection;

    const backupPath = path.join(
      this.backupDir,
      `backup_mysql_${timestamp}.sql`
    );

    return `mysqldump -h ${host} -P ${port} -u ${user} -p${password} ${database} > ${backupPath}`;
  }

  private buildPostgreSQLBackupCommand(config: any, timestamp: string): string {
    const {
      host = "localhost",
      port = 5432,
      database,
      user,
      password,
      schema = "public",
    } = config.connection;

    const backupPath = path.join(
      this.backupDir,
      `backup_postgres_${timestamp}.sql`
    );

    // Usar PGPASSWORD para evitar prompt de contraseña
    return `PGPASSWORD=${password} pg_dump -h ${host} -p ${port} -U ${user} -d ${database} -n ${schema} > ${backupPath}`;
  }

  private buildSQLiteBackupCommand(config: any, timestamp: string): string {
    const { filename } = config.connection;
    const backupPath = path.join(
      this.backupDir,
      `backup_sqlite_${timestamp}.db`
    );

    return `cp "${filename}" "${backupPath}"`;
  }

  private async compressBackup(backupPath: string): Promise<void> {
    try {
      const compressedPath = `${backupPath}.gz`;
      await execAsync(`gzip "${backupPath}"`);
      strapi.log.info(`Backup comprimido: ${compressedPath}`);
    } catch (error) {
      strapi.log.warn(`No se pudo comprimir el backup: ${error.message}`);
    }
  }

  private async cleanOldBackups(): Promise<void> {
    try {
      const files = fs.readdirSync(this.backupDir);
      const now = new Date();
      const cutoffDate = new Date(
        now.getTime() - this.maxBackupDays * 24 * 60 * 60 * 1000
      );

      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deletedCount++;
          strapi.log.info(`Backup antiguo eliminado: ${file}`);
        }
      }

      if (deletedCount > 0) {
        strapi.log.info(
          `${deletedCount} backups antiguos eliminados (más de ${this.maxBackupDays} días)`
        );
      }
    } catch (error) {
      strapi.log.error(`Error limpiando backups antiguos: ${error.message}`);
    }
  }
}
