
import { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';

export type JSONCommentType = 'block' | 'line' | 'end';

export type IJSONComment = {
    /**
     * @description Type of the comment:
     * * `block` - block comment wrapped with '/\*' and '\*\/' before the item
     * * `line` - line comment beginning with '//' before the item
     * * `end` - line comment at the end of the item on the same line
     *
     * `line` and `end` are not supported if `space` when calling `stringify` is 0.
     * (Except for comments of root object)
     */
    type: JSONCommentType;
    /**
     * @description Content of the comment. Could be:
     * * A single-line or multi-line string
     * * A function to be called when stringifying the matched field.
     *  Return `undefined` to omit.
     * '*\/' will be escaped automatically if type is `block`.
     */
    content: ((matchedFieldPath: (string | number)[]) => string | undefined) | string;
} | string;

export interface IJSONCommentConfiguration {
    /**
     * @description Add a blank line before every `block` and `line` comment,
     * except comments of the followings:
     * * The root object
     * * The first item in array
     * * The first key-value pair in object
     * Not supported if `space` when calling `stringify` is 0.
     *
     * @default true
     */
    emptyLineBeforeComments: boolean;
    /**
     * @description Add space around '//', '/\*' and '\*\/'.
     * '/\*' and '\*\/' will not be affected by this
     * configuration if `styledBlockComment` is true.
     *
     * @default true
     */
    spaceAroundCommentSymbol: boolean;
    /**
     * @description Make block comment styled:
     * * Asterisk (' \* ') at the beginning of each line
     * * The first line being '/\*\*'
     * * The last line being ' \*\/'
     * Not supported if `space` when calling `stringify` is 0.
     * (Except for comments of root object)
     *
     * @default true
     */
    styledBlockComment: boolean;
    /**
     * @description Maximum line length of each line of comment.
     * Lines will be auto wrapped if exceeded.
     * If any non-positive number is specified, auto wrapping will be disabled.
     * Not supported if `space` when calling `stringify` is 0.
     * (Except for comments of root object)
     *
     * @default 80
     */
    maxLineLength: number;
}

export type JSONSchema = JSONSchema4 | JSONSchema6 | JSONSchema7;

export type IReplacer = ((key: string, value: any) => any) | (number | string)[] | null;