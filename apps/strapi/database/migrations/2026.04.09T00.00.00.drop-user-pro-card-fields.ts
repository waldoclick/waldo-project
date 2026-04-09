import { Knex } from "knex";

/**
 * Drops the PRO card enrollment fields from up_users.
 * Canonical data now lives exclusively in subscription_pros.
 * Fields: tbk_user, pro_card_type, pro_card_last4, pro_inscription_token, pro_pending_invoice
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("up_users", (table) => {
    table.dropColumn("tbk_user");
    table.dropColumn("pro_card_type");
    table.dropColumn("pro_card_last4");
    table.dropColumn("pro_inscription_token");
    table.dropColumn("pro_pending_invoice");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("up_users", (table) => {
    table.string("tbk_user");
    table.string("pro_card_type");
    table.string("pro_card_last4");
    table.string("pro_inscription_token");
    table.boolean("pro_pending_invoice").defaultTo(false);
  });
}
