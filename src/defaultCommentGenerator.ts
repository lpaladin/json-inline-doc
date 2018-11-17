import { CommentGenerator } from './schemaMetadataWriter';
import { JSONSchema } from './types';

const schemaYieldFields: { key: keyof JSONSchema, blockTagName: string, allowObjectValue?: boolean }[] = [
    { key: 'title', blockTagName: 'name' },
    { key: 'type', blockTagName: 'type' },
    { key: 'description', blockTagName: 'description' },
    { key: 'default', blockTagName: 'default', allowObjectValue: true },
    { key: 'enum', blockTagName: 'enum', allowObjectValue: true },
    { key: 'examples', blockTagName: 'example', allowObjectValue: true }
];

export const defaultCommentGenerator: CommentGenerator = (schema) => {
    const contents: string[] = [];
    for (const field of schemaYieldFields) {
        if (field.key in schema) {
            const value: any = schema[field.key];
            if (typeof value !== 'object') {
                contents.push(`@${field.blockTagName} ${value}`);
            } else if (field.allowObjectValue) {
                contents.push(`@${field.blockTagName} ${JSON.stringify(value)}`);
            }
        }
    }
    return contents.length === 0 ? undefined : {
        type: 'block',
        content: contents.join('\n')
    };
};