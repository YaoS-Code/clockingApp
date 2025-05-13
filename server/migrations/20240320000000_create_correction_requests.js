exports.up = function (knex) {
    return knex.schema.createTable('correction_requests', table => {
        table.increments('id').primary();
        table.integer('user_id').notNullable();
        table.integer('record_id').notNullable();
        table.datetime('original_clock_in').nullable();
        table.datetime('original_clock_out').nullable();
        table.datetime('requested_clock_in').nullable();
        table.datetime('requested_clock_out').nullable();
        table.integer('requested_break_minutes').nullable();
        table.string('requested_location', 100).nullable();
        table.text('reason').nullable();
        table.enum('status', ['pending', 'approved', 'rejected']).nullable();
        table.integer('admin_id').nullable();
        table.text('admin_comment').nullable();
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.foreign('record_id').references('id').inTable('clock_records').onDelete('CASCADE');
        table.foreign('admin_id').references('id').inTable('users').onDelete('SET NULL');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('correction_requests');
}; 