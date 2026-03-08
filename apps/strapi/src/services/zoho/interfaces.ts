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

export interface ZohoDeal {
  dealName: string;
  amount: number;
  contactId: string;
  type: string;
  closingDate: string;
  description?: string;
  leadSource?: string;
}

export interface IContactStats {
  Ads_Published__c?: number;
  Total_Spent__c?: number;
  Last_Ad_Posted_At__c?: string;
  Packs_Purchased__c?: number;
}

export interface IZohoService {
  createLead(lead: ZohoLead): Promise<any[]>;
  createDeal(deal: ZohoDeal): Promise<string>;
  updateContactStats(contactId: string, stats: IContactStats): Promise<void>;
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
