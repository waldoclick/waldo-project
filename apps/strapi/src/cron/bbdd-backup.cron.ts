import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { format } from "date-fns";

const execAsync = promisify(exec);

interface DatabaseConnectionDetails {
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  filename?: string;
  schema?: string;
}

interface DatabaseConnectionConfig {
  client?: string;
  connection?: DatabaseConnectionDetails;
}

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
      // Guard: ensure Strapi is available before accessing config or services.
      if (typeof strapi === "undefined") {
        throw new Error("strapi is not defined");
      }

      strapi.log.info("=== DATABASE BACKUP STARTED ===");

      // Ensure the backups directory exists before attempting to write files.
      await this.ensureBackupDirectory();

      // Access DB config via the Strapi v5 config API. strapi.config.get('database') returns the full database config object.
      const dbConfig = (
        strapi.config.get("database") as {
          connection: DatabaseConnectionConfig;
        }
      ).connection;
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

      // Log a sanitized version of the shell command — password replaced with [REDACTED]
      // so credentials never appear in log files or monitoring dashboards.
      const sanitizedCommand = backupCommand
        .replace(/-p\S+/, "-p[REDACTED]") // MySQL: -p<password>
        .replace(/PGPASSWORD=\S+/, "PGPASSWORD=[REDACTED]"); // PostgreSQL: PGPASSWORD=<password>

      strapi.log.info(`Running ${client} backup...`);
      strapi.log.info(`Command: ${sanitizedCommand}`);

      // Execute the backup shell command. stderr warnings from mysqldump/pg_dump are non-fatal.
      const { stdout: _stdout, stderr } = await execAsync(backupCommand);

      if (stderr && !stderr.includes("Warning")) {
        strapi.log.warn(`Backup stderr: ${stderr}`);
      }

      strapi.log.info(`Backup created successfully: ${backupPath}`);

      // Compress the raw backup file to save disk space. Original file is removed by gzip.
      await this.compressBackup(backupPath);

      // Remove backup files older than maxBackupDays to prevent unbounded disk growth.
      await this.cleanOldBackups();

      strapi.log.info("=== DATABASE BACKUP COMPLETE ===");

      return {
        success: true,
        results: `Backup created successfully: ${backupFileName}`,
      };
    } catch (error: unknown) {
      strapi.log.error("Error creando backup:", error);
      return {
        success: false,
        error: `Failed to create backup: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  private async ensureBackupDirectory(): Promise<void> {
    if (!fs.existsSync(this.backupDir)) {
      // Create backups directory if it does not yet exist (recursive ensures parent dirs are created too).
      fs.mkdirSync(this.backupDir, { recursive: true });
      strapi.log.info(`Backup directory created: ${this.backupDir}`);
    }
  }

  private buildMySQLBackupCommand(
    config: DatabaseConnectionConfig,
    timestamp: string
  ): string {
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

    // Build a mysqldump shell command. Password is passed via -p flag (no space).
    return `mysqldump -h ${host} -P ${port} -u ${user} -p${password} ${database} > ${backupPath}`;
  }

  private buildPostgreSQLBackupCommand(
    config: DatabaseConnectionConfig,
    timestamp: string
  ): string {
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

    // Pass the password via PGPASSWORD env var to avoid an interactive password prompt.
    return `PGPASSWORD=${password} pg_dump -h ${host} -p ${port} -U ${user} -d ${database} -n ${schema} > ${backupPath}`;
  }

  private buildSQLiteBackupCommand(
    config: DatabaseConnectionConfig,
    timestamp: string
  ): string {
    const { filename } = config.connection;
    const backupPath = path.join(
      this.backupDir,
      `backup_sqlite_${timestamp}.db`
    );

    // SQLite backup is a simple file copy — no credentials needed.
    return `cp "${filename}" "${backupPath}"`;
  }

  private async compressBackup(backupPath: string): Promise<void> {
    try {
      const compressedPath = `${backupPath}.gz`;
      await execAsync(`gzip "${backupPath}"`);
      strapi.log.info(`Backup compressed: ${compressedPath}`);
    } catch (error: unknown) {
      strapi.log.warn(
        `Could not compress backup: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
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

      // Walk backup directory and delete files older than the retention window.
      for (const file of files) {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deletedCount++;
          strapi.log.info(`Old backup deleted: ${file}`);
        }
      }

      if (deletedCount > 0) {
        strapi.log.info(
          `${deletedCount} old backup(s) deleted (older than ${this.maxBackupDays} days)`
        );
      }
    } catch (error: unknown) {
      strapi.log.error(
        `Error cleaning old backups: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
