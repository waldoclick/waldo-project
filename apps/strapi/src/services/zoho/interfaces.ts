/**
 * Interfaces for Zoho CRM service
 */

export interface ZohoLead {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  description?: string;
  source?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ZohoFollowUp {
  id?: string;
  leadId: string;
  notes: string;
  status: "pending" | "completed" | "cancelled";
  scheduledDate: Date;
  completedDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ZohoConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  apiUrl: string;
}

export interface IZohoService {
  createLead(lead: ZohoLead): Promise<any[]>;
  createContact(contact: {
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
  }): Promise<any>;
  findContact(email: string): Promise<any>;
  updateContact(
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
  ): Promise<any>;
}
