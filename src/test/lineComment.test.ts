import { strictEqual } from 'assert';

import { CustomCommentWriter } from '..';
import { LONG_STRING } from './assets';

describe('line comments', () => {
    it('should generate correct comments', () => {
        const w: CustomCommentWriter = new CustomCommentWriter();
        w.addComments([], [{ type: 'line', content: 'test' }]);
        w.addComments(['test'], [{ type: 'line', content: 'test2' }]);
        w.addComments(['test', 1], [{ type: 'line', content: 'test3' }]);
        w.addComments(['test', undefined], [{ type: 'line', content: 'test4' }]);
        w.addComments(['long'], [{ type: 'line', content: LONG_STRING }]);
        strictEqual(w.stringify({}, null, 4), `// test
{}`);
        strictEqual(w.stringify({ test: 1 }, null, 4), `// test
{
    // test2
    "test": 1
}`);
        strictEqual(w.stringify({ test: [1, 2, 3] }, null, 4), `// test
{
    // test2
    "test": [
        // test4
        1,

        // test3
        2,

        // test4
        3
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

    it('should reflect changes in configuration', () => {
        const w: CustomCommentWriter = new CustomCommentWriter({
            emptyLineBeforeComments: false,
            spaceAroundCommentSymbol: false
        });
        w.addComments([], [{ type: 'line', content: 'test' }]);
        w.addComments(['test'], [{ type: 'line', content: 'test2' }]);
        w.addComments(['test', 1], [{ type: 'line', content: 'test3' }]);
        w.addComments(['test', undefined], [{ type: 'line', content: 'test4' }]);
        w.addComments(['long'], [{ type: 'line', content: LONG_STRING }]);
        strictEqual(w.stringify({}, null, 4), `//test
{}`);
        strictEqual(w.stringify({ test: 1 }, null, 4), `//test
{
    //test2
    "test": 1
}`);
        strictEqual(w.stringify({ test: [1, 2, 3] }, null, 4), `//test
{
    //test2
    "test": [
        //test4
        1,
        //test3
        2,
        //test4
        3
    ]
}`);
        strictEqual(w.stringify({ long: null }, null, 4), `//test
{
    //Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
    //incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
    //nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    "long": null
}`);
    });
});