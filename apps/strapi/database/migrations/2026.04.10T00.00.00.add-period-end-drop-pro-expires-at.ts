import { Knex } from "knex";

/**
 * Adds period_end to subscription_payments and drops pro_expires_at from up_users.
 * After this migration, billing period tracking lives exclusively in subscription_payments.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("subscription_payments", (table) => {
    table.date("period_end").notNullable().defaultTo(knex.fn.now());
  });
  await knex.schema.alterTable("up_users", (table) => {
    table.dropColumn("pro_expires_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("up_users", (table) => {
    table.datetime("pro_expires_at").nullable();
  });
  await knex.schema.alterTable("subscription_payments", (table) => {
    table.dropColumn("period_end");
  });
}
