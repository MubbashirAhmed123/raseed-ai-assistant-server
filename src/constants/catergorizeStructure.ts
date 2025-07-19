import fastJson from 'fast-json-stringify';

// Individual receipt item schema
const receiptItemSchema = {
    type: 'object',
    properties: {
        item: { type: 'string' },
        price: { type: 'number' },
        quantity: { type: 'number' }
    },
    required: ['item', 'price', 'quantity']
};

// Summary schema
const summarySchema = {
    type: 'object' as const,
    properties: {
        total_categories: { type: 'number' },
        total_items: { type: 'number' }
    },
    required: ['total_categories', 'total_items']
};

// Main categorization response serializer
const categorizationResponseStringify = fastJson({
    type: 'object',
    properties: {
        categories: {
            type: 'object',
            additionalProperties: {
                type: 'array',
                items: receiptItemSchema
            }
        },
        summary: summarySchema
    },
    required: ['categories', 'summary']
});

// Complete API response serializer
const receiptExtractionResponseStringify = fastJson({
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        categorization: {
            type: 'object',
            properties: {
                categories: {
                    type: 'object',
                    additionalProperties: {
                        type: 'array',
                        items: receiptItemSchema
                    }
                },
                summary: summarySchema
            },
            required: ['categories', 'summary']
        },
        filename: { type: 'string' }
    },
    required: ['success', 'categorization', 'filename']
});
export { categorizationResponseStringify, receiptExtractionResponseStringify };