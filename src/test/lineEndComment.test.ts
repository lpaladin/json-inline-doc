import { strictEqual } from 'assert';

import { CustomCommentWriter } from '..';

describe('line end comments', () => {
    it('should generate correct comments', () => {
        const w: CustomCommentWriter = new CustomCommentWriter();
        w.addComments([], [{ type: 'end', content: 'test' }]);
        w.addComments(['test'], [{ type: 'end', content: 'test2' }]);
        w.addComments(['test', 1], [{ type: 'end', content: 'test3' }]);
        strictEqual(w.stringify({}, null, 4), `{} // test`);
        strictEqual(w.stringify({ test: 1 }, null, 4), `{
    "test": 1 // test2
} // test`);
        strictEqual(w.stringify({ test: [1, 2, 3] }, null, 4), `{
    "test": [
        1,
        2, // test3
        3
    ] // test2
} // test`);
    });

    it('should reflect changes in configuration', () => {
        const w: CustomCommentWriter = new CustomCommentWriter({ spaceAroundCommentSymbol: false });
        w.addComments([], [{ type: 'end', content: 'test' }]);
        w.addComments(['test'], [{ type: 'end', content: 'test2' }]);
        w.addComments(['test', 1], [{ type: 'end', content: 'test3' }]);
        strictEqual(w.stringify({}, null, 4), `{}//test`);
        strictEqual(w.stringify({ test: 1 }, null, 4), `{
    "test": 1//test2
}//test`);
        strictEqual(w.stringify({ test: [1, 2, 3] }, null, 4), `{
    "test": [
        1,
        2,//test3
        3
    ]//test2
}//test`);
    });
});