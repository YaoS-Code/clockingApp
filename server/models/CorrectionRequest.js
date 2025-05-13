const { Model } = require('objection');

class CorrectionRequest extends Model {
    static get tableName() {
        return 'correction_requests';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['user_id', 'record_id', 'original_clock_in', 'original_clock_out',
                'requested_clock_in', 'requested_clock_out', 'reason'],
            properties: {
                id: { type: 'integer' },
                user_id: { type: 'integer' },
                record_id: { type: 'integer' },
                original_clock_in: { type: 'string', format: 'date-time' },
                original_clock_out: { type: 'string', format: 'date-time' },
                requested_clock_in: { type: 'string', format: 'date-time' },
                requested_clock_out: { type: 'string', format: 'date-time' },
                reason: { type: 'string' },
                status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
                admin_comment: { type: ['string', 'null'] },
                processed_by: { type: ['integer', 'null'] },
                processed_at: { type: ['string', 'null'], format: 'date-time' },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' }
            }
        };
    }

    static get relationMappings() {
        const User = require('./User');
        const ClockRecord = require('./ClockRecord');

        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'correction_requests.user_id',
                    to: 'users.id'
                }
            },
            record: {
                relation: Model.BelongsToOneRelation,
                modelClass: ClockRecord,
                join: {
                    from: 'correction_requests.record_id',
                    to: 'clock_records.id'
                }
            },
            processor: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'correction_requests.processed_by',
                    to: 'users.id'
                }
            }
        };
    }
}

module.exports = CorrectionRequest; 