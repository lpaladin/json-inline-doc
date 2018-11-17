import { strictEqual } from 'assert';
import { dereference } from 'json-schema-ref-parser';

import { SchemaMetadataWriter } from '..';
import {
    META_SCHEMA,
    TEST_OBJ,
    TEST_OBJ_COMMENTED,
    TEST_SCHEMA,
    TEST_SCHEMA_COMMENTED
} from './assets';

describe('comments from schema', () => {
    it('should generate correct comments on simple object', () => {
        const w: SchemaMetadataWriter = new SchemaMetadataWriter(TEST_SCHEMA);
        strictEqual(
            w.stringify(TEST_OBJ, null, 4),
            TEST_OBJ_COMMENTED
        );
    });

    it('should generate correct comments on complex object', async () => {
        const w: SchemaMetadataWriter = new SchemaMetadataWriter(await dereference(<any>META_SCHEMA));
        strictEqual(
            w.stringify(TEST_SCHEMA, null, 4),
            TEST_SCHEMA_COMMENTED
        );
    });
});