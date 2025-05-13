const { Model } = require('objection');
const path = require('path');

class ClockRecord extends Model {
    static get tableName() {
        return 'clock_records';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['user_id'],
            properties: {
                id: { type: 'integer' },
                user_id: { type: 'integer' },
                clock_in: { type: ['string', 'null'] },
                clock_out: { type: ['string', 'null'] },
                break_minutes: { type: 'integer', default: 30 },
                location: { type: ['string', 'null'] },
                status: { type: 'string' },
                notes: { type: ['string', 'null'] },
                ip_address: { type: ['string', 'null'] },
                modified_by: { type: ['integer', 'null'] },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' }
            }
        };
    }

    static get relationMappings() {
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: path.join(__dirname, 'User'),
                join: {
                    from: 'clock_records.user_id',
                    to: 'users.id'
                }
            },
            modifier: {
                relation: Model.BelongsToOneRelation,
                modelClass: path.join(__dirname, 'User'),
                join: {
                    from: 'clock_records.modified_by',
                    to: 'users.id'
                }
            }
        };
    }
}

module.exports = ClockRecord; 