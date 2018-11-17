import { defaultCommentGenerator } from './defaultCommentGenerator';
import { JSONCommentWriterBase } from './jsonCommentWriterBase';
import { IJSONComment, IJSONCommentConfiguration , JSONSchema} from './types';

export type CommentGenerator = (schema: JSONSchema) => IJSONComment | undefined;

function hasProp(obj: any, key: string | number): boolean {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * A JSON comment writer generating comments for fields specified in JSON schema.
 */
export class SchemaMetadataWriter extends JSONCommentWriterBase<JSONSchema> {
    protected readonly root: JSONSchema;

    /**
     * Construct a new SchemaMetadataWriter.
     * @param schemaObject A fully dereferenced JSON schema object
     *  containing no `$ref`, which can be obtained using libraries like
     *  `json-schema-ref-parser`.`dereference` with `circular` being true.
     * This object is allowed to be recursive.
     * @param commentGenerator A function to generate comment string
     *  from the schema of a field.
     * @param configuration Styling configuration for comments.
     */
    public constructor(
        schemaObject: JSONSchema,
        private commentGenerator: CommentGenerator = defaultCommentGenerator,
        configuration?: Partial<IJSONCommentConfiguration>
    ) {
        super(configuration);
        this.root = <any>{ additionalProperties: schemaObject };
    }

    protected nextNode(currentNode: Readonly<JSONSchema>, key: string | number)
        : Readonly<JSONSchema> | undefined {
        if (typeof currentNode.properties === 'object') {
            if (hasProp(currentNode.properties, key)) {
                const next: boolean | JSONSchema = currentNode.properties[key];
                if (typeof next === 'object') {
                    return next;
                }
            }
        } else if (currentNode.items) {
            if (Array.isArray(currentNode.items)) {
                if (key >= 0 && key < currentNode.items.length) {
                    const next: boolean | JSONSchema = currentNode.items[key as number];
                    if (typeof next === 'object') {
                        return next;
                    }
                } else if (typeof currentNode.additionalItems === 'object') {
                    return currentNode.additionalItems;
                }
            } else if (typeof currentNode.items === 'object') {
                return currentNode.items;
            }
        }
        if (typeof currentNode.additionalProperties === 'object') {
            return currentNode.additionalProperties;
        }
        return undefined;
    }

    protected getComments(currentNode: Readonly<JSONSchema>): IJSONComment[] {
        const comment: IJSONComment | undefined = this.commentGenerator(currentNode);
        if (comment) {
            return [comment];
        }
        return [];
    }
}