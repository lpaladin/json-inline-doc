
JSON Inline Doc
============================
#### Add inline comments on stringified JSON, or generate from JSON schema

Use case: Using JSON for configuration and provide inline documentation as comments for users.

Note: JSON does not support comments. But some editors have the so-called 'JSON with comments' support.

Installation:
--------------------------
```bash
npm install json-inline-doc
```

Example - Comments Generated from JSON Schema
--------------------------

```javascript
import { SchemaMetadataWriter } from 'json-inline-doc';

// Create a writer with a schema
const w: SchemaMetadataWriter = new SchemaMetadataWriter({
    "description": "Cluster Configuration",
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
            "description": "Cluster name"
        }
    },
    "required": []
});

// The API is the same as JSON.stringify
w.stringify({ name: 'Sample Cluster' }, null, 4);
```

Output:
```jsonc
/**
 * @type object
 * @description Cluster Configuration
 */
{
    /**
     * @type string
     * @description Cluster name
     */
    "name": "Sample Cluster"
}
```

Example - Custom Comments
--------------------------

```javascript
import { CustomCommentWriter } from 'json-inline-doc';

// Create a writer
const w: CustomCommentWriter = new CustomCommentWriter();

// Add custom comments to fields
w.addComments([], [{ type: 'line', content: 'test' }]);
w.addComments(['test'], [{ type: 'block', content: 'test2' }]);
w.addComments(['test', 1], [{ type: 'end', content: 'test3' }]);
w.addComments(['test', undefined, undefined], [{ type: 'line', content: 'test4' }]);
w.addComments(['test', undefined, 'test2'], [{ type: 'block', content: path => path.toString() }]);

// The API is the same as JSON.stringify
console.log(w.stringify({ test: [{ test2: 3 }, { test2: 4 }, 3, [5]] }, null, 4));
```

Output:
```jsonc
// test
{
    /**
     * test2
     */
    "test": [
        {
            /**
             * test,0,test2
             */
            "test2": 3
        },
        {
            "test2": 4
        }, // test3
        3,
        [
            // test4
            5
        ]
    ]
}
```

For more detailed examples, please see the [test cases](src/test).


API Documentation
--------------------------
All code is written in TypeScript which can be self-explanatory.

## Writers

### [JSONCommentWriterBase](src/jsonCommentWriterBase.ts)

The abstract base class of all writers.

`writer = new JSONCommentWriterBase(configuration)`
* Note: The above line of code is only for explanation. This class is abstract - do not try to `new` a instance by yourself!
* `configuration`: object (optional)
	* `spaceAroundCommentSymbol`: boolean (default true)
	
		Add space around '//', '/\*' and '\*/'.
		'/\*' and '\*/' will not be affected by this configuration if `styledBlockComment` is true.
	* `styledBlockComment`: boolean (default true)

		Make block comment styled:
		* Asterisk (' \* ') at the beginning of each line
		* The first line being '/\*\*'
		* The last line being ' \*\/'
		
		Not supported if `space` when calling `stringify` is 0.
		(Except for comments of root object)
	* `maxLineLength`: number (default 80)

		Maximum line length of each line of comment.
		Lines will be auto wrapped if exceeded.
		If any non-positive number is specified, auto wrapping will be disabled.

		Not supported if `space` when calling `stringify` is 0.
		(Except for comments of root object)

`writer.stringify(value, replacer, space)`
* Convert value to JSON string with comments.
* The signature is the same as [`JSON.stringify`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
* JSON stringify implementation is based on the following code: https://github.com/douglascrockford/JSON-js/blob/2a76286e00cdc1e98fbc9e9ec6589563a3a4c3bb/json2.js


### [CustomCommentWriter](src/customCommentWriter.ts)

A class of JSON comment writer which supports custom comments for fields specified by path.

`writer = new CustomCommentWriter(configuration)`
* Please refer to the constructor of [JSONCommentWriterBase](#JSONCommentWriterBase).

`writer.addComments(selector, comments)`
* Add custom `comments` to fields specified by `selector`.
* `selector`: (string | number | undefined)[] (required)

	A path of keys.
	`undefined` can be used to match any other key not matched on that level.
	An empty array matches the root object.

* `comments`: [IJSONComment](#IJSONComment)[] (required)

	Comments to be shown when the selector matches.

### [SchemaMetadataWriter](src/schemaMetadataWriter.ts)

A class of JSON comment writer generating comments for fields specified in JSON schema.

`writer = new SchemaMetadataWriter(schemaObject, commentGenerator, configuration)`
* Construct a new SchemaMetadataWriter.
* `schemaObject`: [JSONSchema](https://json-schema.org/) (required)

	A fully dereferenced JSON schema object
	containing no `$ref`, which can be obtained using libraries like
	[`json-schema-ref-parser`](https://www.npmjs.com/package/json-schema-ref-parser).[`dereference`](https://apidevtools.org/json-schema-ref-parser/docs/ref-parser.html#dereferenceschema-options-callback) with `circular` being true.
	
	This object is allowed to be recursive.
* `commentGenerator`: function (defaults to a simple schema comment generator)

	A function to generate comment string from the schema of a field.

	Signature: (schema: JSONSchema) => [IJSONComment](#IJSONComment) | undefined
* `configuration`: object (optional)

	Please refer to the constructor of [JSONCommentWriterBase](#JSONCommentWriterBase).

## Interfaces

### [IJSONComment](src/types.ts)

Represents a single comment.

* `type`: 'block' | 'line' | 'end' (required)

	Type of the comment:
    * `block` - block comment wrapped with '/\*' and '\*\/' before the item
    * `line` - line comment beginning with '//' before the item
    * `end` - line comment at the end of the item on the same line

    `line` and `end` are not supported if `space` when calling `stringify` is 0.
    (Except for comments of root object)
* `content`: string or function (required)
	
	Content of the comment. Could be:
     * A single-line or multi-line string
     * A function to be called when stringifying the matched field.
	 	* Signature: (matchedFieldPath: (string | number)[]) => string | undefined
     	* Return `undefined` to omit.
     * '*\/' will be escaped automatically if type is `block`.


License
--------------------------
[MIT license](LICENSE)
