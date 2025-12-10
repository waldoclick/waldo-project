import { google } from "googleapis";
import { IGoogleSheetsService } from "../types/google.types";
import { GoogleAuthService } from "./google-auth.service";

export class GoogleSheetsService implements IGoogleSheetsService {
  constructor(private readonly authService: GoogleAuthService) {}

  async appendToSheet(data: any[]): Promise<void> {
    try {
      const auth = await this.authService.authenticate();
      const sheets = google.sheets({ version: "v4", auth });
      const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
      const range = "Hoja 1!A1:A";

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [data],
        },
      });
    } catch (error) {
      console.error("Error appending to Google Sheets:", error);
      throw error;
    }
  }
}
