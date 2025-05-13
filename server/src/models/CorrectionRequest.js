const { Model } = require('objection');
const path = require('path');

class CorrectionRequest extends Model {
    static get tableName() {
        return 'correction_requests';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['user_id', 'record_id'],
            properties: {
                id: { type: 'integer' },
                user_id: { type: 'integer' },
                record_id: { type: 'integer' },
                original_clock_in: { type: ['string', 'null'], format: 'date-time' },
                original_clock_out: { type: ['string', 'null'], format: 'date-time' },
                requested_clock_in: { type: ['string', 'null'], format: 'date-time' },
                requested_clock_out: { type: ['string', 'null'], format: 'date-time' },
                requested_break_minutes: { type: ['integer', 'null'] },
                requested_location: { type: ['string', 'null'], maxLength: 100 },
                reason: { type: ['string', 'null'] },
                status: { type: ['string', 'null'], enum: ['pending', 'approved', 'rejected'] },
                admin_id: { type: ['integer', 'null'] },
                admin_comment: { type: ['string', 'null'] },
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
                    from: 'correction_requests.user_id',
                    to: 'users.id'
                }
            },
            record: {
                relation: Model.BelongsToOneRelation,
                modelClass: path.join(__dirname, 'ClockRecord'),
                join: {
                    from: 'correction_requests.record_id',
                    to: 'clock_records.id'
                }
            },
            admin: {
                relation: Model.BelongsToOneRelation,
                modelClass: path.join(__dirname, 'User'),
                join: {
                    from: 'correction_requests.admin_id',
                    to: 'users.id'
                }
            }
        };
    }
}

module.exports = CorrectionRequest; 