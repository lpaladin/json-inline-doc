import * as wrap from 'word-wrap';

import {
    IJSONComment, IJSONCommentConfiguration, IReplacer
} from './types';

/**
 * Base writer to add comments to stringified JSON.
 * JSON stringify implementation is based on the following code:
 * https://github.com/douglascrockford/JSON-js/blob/2a76286e00cdc1e98fbc9e9ec6589563a3a4c3bb/json2.js
 *
 * @param CommentDataNodeType Subclasses should use this type of node to track current node and related data.
 */
export abstract class JSONCommentWriterBase<CommentDataNodeType> {
    private static readonly defaultConfiguration: IJSONCommentConfiguration = {
        spaceAroundCommentSymbol: true,
        styledBlockComment: true,
        maxLineLength: 80
    };
    private readonly configuration: IJSONCommentConfiguration;
    private indent: string = '';
    private replacer: IReplacer | undefined;
    private path: (string | number)[] = [];

    /**
     * Construct a new JSONCommentWriter.
     * @param configuration Styling configuration for comments.
     */
    public constructor(configuration?: Partial<IJSONCommentConfiguration>) {
        this.configuration = { ...JSONCommentWriterBase.defaultConfiguration, ...configuration };
    }

    /**
     * Convert the given object to a JSON string with comments specified eariler.
     * @param object The root object to convert to JSON string.
     * @param replacer A function that alters the behavior of the stringification process,
     * or an array of String and Number objects that serve as a whitelist for
     * selecting/filtering the properties of the value object to be included in the JSON string.
     *
     * If this value is null or not provided,
     * all properties of the object are included in the resulting JSON string.
     * @param space A String or Number object that's used to insert white space into
     * the output JSON string for readability purposes.
     *
     * If this is a Number, it indicates the number of space characters to use as white space;
     * this number is capped at 10 (if it is greater, the value is just 10).
     * Values less than 1 indicate that no space should be used.
     *
     * If this is a String, the string is used as white space.
     * If this parameter is not provided (or is null), no white space is used.
     *
     * @returns The JSON string, or `undefined` if object is `undefined`.
     */
    public stringify(object: any, replacer?: IReplacer, space?: number | string): string | undefined {
        this.indent = '';

        if (typeof space === 'number') {
            for (let i: number = 0; i < space; i++) {
                this.indent += ' ';
            }
        } else if (typeof space === 'string') {
            this.indent = space;
        }
        this.replacer = replacer;
        if (replacer && typeof replacer !== 'function' && !Array.isArray(replacer)) {
            throw new Error('Argument `replacer` is expected to be a function or an array');
        }
        this.path = [];
        const { comments: parts, childJSON, lineEndComment } = this.getChildJSON({ '': object }, '', '', this.root);
        if (childJSON === undefined) {
            return undefined;
        }
        parts.push(childJSON + (lineEndComment || ''));
        return parts.join('\n');
    }

    protected abstract get root(): Readonly<CommentDataNodeType>;
    protected abstract nextNode(currentNode: Readonly<CommentDataNodeType>, key: string | number)
        : Readonly<CommentDataNodeType> | undefined;
    protected abstract getComments(currentNode: Readonly<CommentDataNodeType>): IJSONComment[];

    private renderComment(gap: string, path: (string | number)[], comment: IJSONComment): string | undefined {
        let content: string | undefined = typeof comment.content === 'function' ? comment.content(path.slice(1)) : comment.content;
        if (content === undefined) {
            return undefined;
        }
        // If there's indent or is root level
        if (gap || this.path.length === 1) {
            if (this.configuration.maxLineLength > 0) {
                content = wrap(content, { width: this.configuration.maxLineLength, indent: '', trim: true });
            }
            if (comment.type === 'block') {
                content = content.replace(/\*\//g, '*\/');
                if (this.configuration.styledBlockComment) {
                    return `/**
${gap} * ${content.replace(/\n/g, `\n${gap} * `)}
${gap} */`;
                } else if (this.configuration.spaceAroundCommentSymbol) {
                    return `/* ${content.replace(/\n/g, `\n${gap}`)} */`;
                } else {
                    return `/*${content.replace(/\n/g, `\n${gap}`)}*/`;
                }
            } else {
                if (comment.type === 'end' && content.includes('\n')) {
                    throw new Error('Comment of type `end` is expected to be single-line');
                }
                if (this.configuration.spaceAroundCommentSymbol) {
                    return `// ${content.replace(/\n/g, `\n${gap}// `)}`;
                } else {
                    return `//${content.replace(/\n/g, `\n${gap}//`)}`;
                }
            }
        } else {
            if (comment.type === 'block') {
                if (content.includes('\n')) {
                    throw new Error('Comment is expected to be single-line when space is 0');
                }
                content = content.replace(/\*\//g, '*\/');
                if (this.configuration.spaceAroundCommentSymbol) {
                    return `/* ${content} */`;
                } else {
                    return `/*${content}*/`;
                }
            } else {
                return undefined;
            }
        }
    }

    private getChildJSON(value: any, nextKey: string | number, gap: string, node: CommentDataNodeType | undefined)
        : { comments: string[], childJSON: string | undefined, lineEndComment: string | undefined } {

        const nextNode: CommentDataNodeType | undefined = node && this.nextNode(node, nextKey);
        const parts: string[] = [];
        let lineEndComment: string | undefined;
        this.path.push(nextKey);
        if (nextNode) {
            for (const comment of this.getComments(nextNode)) {
                if (comment.type === 'end' && lineEndComment !== undefined) {
                    throw new Error('Comment of type `end` is expected to be unique for each field');
                }
                const commentString: string | undefined = this.renderComment(gap, this.path, comment);
                if (comment.type === 'end') {
                    lineEndComment = commentString;
                } else if (commentString !== undefined) {
                    parts.push(commentString);
                }
            }
        }
        const childJSON: string | undefined = this.objToJSON(nextKey, value, gap, nextNode);
        this.path.pop();
        if (lineEndComment !== undefined && this.configuration.spaceAroundCommentSymbol) {
            lineEndComment = ' ' + lineEndComment;
        }
        return { comments: parts, childJSON, lineEndComment };
    }

    /**
     * Convert holder[key] to JSON.
     * @param key The key of the item to be serialized.
     * Note that it accepts number to allow for JS engine optimization.
     * @param holder The object holding the item.
     * @param gap Accumulated indent.
     * @param nodes Selecter tree nodes matched for the item
     * @returns JSON representation of the item.
     * `undefined` if the item is `undefined`.
     */
    // tslint:disable-next-line
    private objToJSON(key: string | number, holder: any, gap: string, node: CommentDataNodeType | undefined): string | undefined {
        let value: any = holder[key];

        if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

        if (typeof this.replacer === 'function') {
            value = this.replacer.call(holder, key, value);
        }

        if (typeof value === 'object') {
            if (!value) {
                return 'null';
            }
            const currGap: string = gap + this.indent;
            const lineBreakCurrGap: string =
                currGap ? '\n' + currGap : '';
            const lineEndComments: { [index: number]: string } = {};
            const partial: string[] = [];
            const fnPartialToLine: (value: string, i: number) => string =
                (p, i) => `${p}${i < partial.length - 1 ? ',' : ''}${lineEndComments[i] || ''}`;
            if (Array.isArray(value)) {
                if (value.length === 0) {
                    return '[]';
                }
                for (let i: number = 0; i < value.length; i++) {
                    const { comments: parts, childJSON, lineEndComment } = this.getChildJSON(value, i, currGap, node);
                    parts.push(childJSON || 'null');
                    if (lineEndComment !== undefined) {
                        lineEndComments[i] = lineEndComment;
                    }
                    partial.push(parts.join(lineBreakCurrGap));
                }
                return currGap ? `[
${currGap}${partial.map(fnPartialToLine).join(lineBreakCurrGap)}
${gap}]` : `[${partial.join(',')}]`;
            } else {
                const keys: (string | number)[] = Array.isArray(this.replacer) ? this.replacer : Object.keys(value);
                if (keys.length === 0) {
                    return '{}';
                }
                for (const k of keys) {
                    const { comments: parts, childJSON, lineEndComment } = this.getChildJSON(value, k, currGap, node);
                    if (childJSON) {
                        parts.push(JSON.stringify(k) + (currGap ? ': ' : ':') + childJSON);
                        if (lineEndComment !== undefined) {
                            lineEndComments[partial.length] = lineEndComment;
                        }
                        partial.push(parts.join(lineBreakCurrGap));
                    }
                }
                return currGap ? `{
${currGap}${partial.map(fnPartialToLine).join(lineBreakCurrGap)}
${gap}}` : `{${partial.join(',')}}`;
            }
        } else {
            return JSON.stringify(value);
        }
    }
}