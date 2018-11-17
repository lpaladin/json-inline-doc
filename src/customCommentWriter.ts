import { JSONCommentWriterBase } from './jsonCommentWriterBase';
import { IJSONComment } from './types';

interface ISelectorTreeNode {
    next?: { [key: string]: ISelectorTreeNode };
    any?: ISelectorTreeNode;
    this?: IJSONComment[];
}

/**
 * A JSON comment writer which supports custom comments for fields specified by path.
 * Implemented using a tree structure.
 */
export class CustomCommentWriter extends JSONCommentWriterBase<ISelectorTreeNode> {
    protected readonly root: ISelectorTreeNode = {}; // root.any is the real root

    private static ensureNextNode(currNode: ISelectorTreeNode, key?: string | number | undefined): ISelectorTreeNode {
        if (key === undefined) {
            return currNode.any = currNode.any || {};
        }
        currNode.next = currNode.next || {};
        return currNode.next[key] = currNode.next[key] || {};
    }

    /**
     * Define the comments to be shown above the specified fields.
     * @param selector A path of keys.
     * `undefined` can be used to match any other key not matched on that level.
     * An empty array matches the root object.
     * @param comments Comments to be shown when the selector matches.
     * @example
     * ['a', 'b', undefined, 'c'] -> 'comment1'
     * ['a', 'b', 'd'] -> 'comment2'
     * { a: { b: { c: { c: "This field will have comment1" }}}}
     * { a: { b: { d: "This field will have comment2" }}}
     */
    public addComments(selector: (string | number | undefined)[], comments: IJSONComment[]): void {
        let currNode: ISelectorTreeNode = this.root.any = this.root.any || {};
        for (const key of selector) {
            currNode = CustomCommentWriter.ensureNextNode(currNode, key);
        }
        currNode.this = currNode.this || [];
        currNode.this = currNode.this.concat(comments);
    }

    protected nextNode(prevNode: Readonly<ISelectorTreeNode>, key: string | number)
        : Readonly<ISelectorTreeNode> | undefined {
        if (prevNode.next && prevNode.next[key]) {
            return prevNode.next[key];
        }
        return prevNode.any;
    }

    protected getComments(currentNode: Readonly<ISelectorTreeNode>): IJSONComment[] {
        return currentNode.this || [];
    }
}