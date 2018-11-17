import { strictEqual } from 'assert';

import { CustomCommentWriter } from '..';
import { LONG_STRING } from './assets';

describe('mixed comments', () => {
    it('should properly escape */', () => {
        const w: CustomCommentWriter = new CustomCommentWriter();
        w.addComments([], [{ type: 'block', content: '---*/---' }]);
        w.addComments([undefined], [{ type: 'line', content: '---*/---' }]);
        strictEqual(w.stringify({ a: 1 }, null, 4), `/**
 * ---*\/---
 */
{
    // ---*/---
    "a": 1
}`);
    });

    it('should generate correct comments', () => {
        const w: CustomCommentWriter = new CustomCommentWriter();
        w.addComments([], [{ type: 'line', content: 'test' }]);
        w.addComments(['test'], [{ type: 'block', content: 'test2' }]);
        w.addComments(['test', 1], [{ type: 'end', content: 'test3' }]);
        w.addComments(['test', undefined, undefined], [{ type: 'line', content: 'test4' }]);
        w.addComments(['test', undefined, 'test2'], [{ type: 'block', content: path => path.toString() }]);
        w.addComments(['long'], [{ type: 'line', content: LONG_STRING }]);
        strictEqual(w.stringify({}, null, 4), `// test
{}`);
        strictEqual(w.stringify({ test: 1 }, null, 4), `// test
{
    /**
     * test2
     */
    "test": 1
}`);
        strictEqual(w.stringify({ test: [{ test2: 3 }, { test2: 4 }, 3, [5]] }, null, 4), `// test
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
}`);
        strictEqual(w.stringify({ long: null }, null, 4), `// test
{
    // Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
    // incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
    // nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    "long": null
}`);
    });
});