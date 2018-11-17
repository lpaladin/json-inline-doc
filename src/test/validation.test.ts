import { throws } from 'assert';

import { CustomCommentWriter } from '..';

describe('validation', () => {
    it('should throw error when replacer type is incorrect', () => {
        const w: CustomCommentWriter = new CustomCommentWriter();
        throws(() => {
            w.stringify(null, <any>{}, 0);
        });
    });
    it('should throw error when multiple comments of type `end` occurs on the same field', () => {
        const w: CustomCommentWriter = new CustomCommentWriter();
        w.addComments(['test'], [{ type: 'end', content: 'test' }, { type: 'end', content: 'test2' }]);
        throws(() => {
            w.stringify({ test: 1 }, null, 4);
        });
    });
    it('should throw error when comments of type `end` contains multiple lines', () => {
        const w: CustomCommentWriter = new CustomCommentWriter();
        w.addComments([undefined], [{ type: 'end', content: 'test\n2' }]);
        throws(() => {
            w.stringify({ test: 1 }, null, 4);
        });
    });
    it('should throw error when space set to 0 and comments contains multiple lines', () => {
        const w: CustomCommentWriter = new CustomCommentWriter();
        w.addComments([undefined], [{ type: 'block', content: 'test\n2' }]);
        throws(() => {
            w.stringify({ test: 1 });
        });
    });
});