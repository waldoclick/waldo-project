/**
 * Zoho CRM service implementation
 * Handles interactions with Zoho CRM API for leads and contacts management
 */

import { IZohoService, ZohoLead } from "./interfaces";
import { ZohoHttpClient } from "./http-client";

export class ZohoService implements IZohoService {
  constructor(private httpClient: ZohoHttpClient) {}

  /**
   * Creates a new lead in Zoho CRM
   * @param lead - The lead data to create
   * @returns Promise with the created lead data
   * @throws Error if the lead creation fails
   */
  async createLead(lead: ZohoLead): Promise<any[]> {
    try {
      const response = await this.httpClient.post<{ data: any[] }>(
        "/crm/v5/Leads",
        {
          data: [
            {
              First_Name: lead.firstName,
              Last_Name: lead.lastName,
              Email: lead.email,
              Phone: lead.phone,
              Company: lead.company || "Waldo API",
              Description: lead.description,
              Lead_Source: lead.source,
            },
          ],
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create lead: ${error.message}`);
    }
  }

  /**
   * Creates a new contact in Zoho CRM
   * @param contact - The contact data to create
   * @returns Promise with the created contact data
   * @throws Error if the contact creation fails
   */
  async createContact(contact: {
    First_Name: string;
    Last_Name: string;
    Email: string;
    User_ID?: string;
    Lead_Source?: string;
    Phone?: string;
    Date_of_Birth?: string;
    Mailing_Street?: string;
    Mailing_Zip?: string;
    Mailing_State?: string;
    Mailing_City?: string;
    Other_Street?: string;
    Other_Zip?: string;
    Other_State?: string;
    Other_City?: string;
  }): Promise<any> {
    try {
      const response = await this.httpClient.post<{ data: any[] }>(
        "/crm/v5/Contacts",
        {
          data: [
            {
              First_Name: contact.First_Name,
              Last_Name: contact.Last_Name,
              Email: contact.Email,
              User_ID: contact.User_ID,
              Lead_Source: contact.Lead_Source,
              Phone: contact.Phone,
              Date_of_Birth: contact.Date_of_Birth,
              Mailing_Street: contact.Mailing_Street,
              Mailing_Zip: contact.Mailing_Zip,
              Mailing_State: contact.Mailing_State,
              Mailing_City: contact.Mailing_City,
              Other_Street: contact.Other_Street,
              Other_Zip: contact.Other_Zip,
              Other_State: contact.Other_State,
              Other_City: contact.Other_City,
            },
          ],
        }
      );
      return response.data[0];
    } catch (error) {
      console.error("Zoho API Error:", error.response?.data || error.message);
      throw new Error(`Failed to create contact: ${error.message}`);
    }
  }

  /**
   * Finds a contact in Zoho CRM by email
   * @param email - The email to search for
   * @returns Promise with the found contact data or null if not found
   * @throws Error if the contact search fails
   */
  async findContact(email: string): Promise<any | null> {
    try {
      const response = await this.httpClient.get<{ data?: any[] }>(
        "/crm/v5/Contacts/search",
        {
          criteria: `(Email:equals:${email})`,
        }
      );
      if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        return response.data[0];
      }
      return null;
    } catch (error) {
      console.error("Zoho API Error:", error.response?.data || error.message);
      throw new Error(`Failed to find contact: ${error.message}`);
    }
  }

  /**
   * Updates an existing contact in Zoho CRM
   * @param id - The contact ID to update
   * @param contact - The contact data to update
   * @returns Promise with the updated contact data
   * @throws Error if the contact update fails
   */
  async updateContact(
    id: string,
    contact: {
      First_Name?: string;
      Last_Name?: string;
      User_ID?: string;
      Lead_Source?: string;
      Phone?: string;
      Date_of_Birth?: string;
      Mailing_Street?: string;
      Mailing_Zip?: string;
      Mailing_State?: string;
      Mailing_City?: string;
      Other_Street?: string;
      Other_Zip?: string;
      Other_State?: string;
      Other_City?: string;
    }
  ): Promise<any> {
    try {
      const response = await this.httpClient.put<{ data: any[] }>(
        `/crm/v5/Contacts/${id}`,
        {
          data: [
            {
              First_Name: contact.First_Name,
              Last_Name: contact.Last_Name,
              User_ID: contact.User_ID,
              Lead_Source: contact.Lead_Source,
              Phone: contact.Phone,
              Date_of_Birth: contact.Date_of_Birth,
              Mailing_Street: contact.Mailing_Street,
              Mailing_Zip: contact.Mailing_Zip,
              Mailing_State: contact.Mailing_State,
              Mailing_City: contact.Mailing_City,
              Other_Street: contact.Other_Street,
              Other_Zip: contact.Other_Zip,
              Other_State: contact.Other_State,
              Other_City: contact.Other_City,
            },
          ],
        }
      );
      return response.data[0];
    } catch (error) {
      console.error("Zoho API Error:", error.response?.data || error.message);
      throw new Error(`Failed to update contact: ${error.message}`);
    }
  }
}
