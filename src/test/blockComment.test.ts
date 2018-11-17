import { strictEqual } from 'assert';

import { CustomCommentWriter } from '..';
import { LONG_STRING } from './assets';

describe('block comments', () => {
    it('should generate correct comments', () => {
        const w: CustomCommentWriter = new CustomCommentWriter();
        w.addComments([], [{ type: 'block', content: 'test' }]);
        w.addComments(['test'], [{ type: 'block', content: 'test2' }]);
        w.addComments(['test', 1], [{ type: 'block', content: 'test3' }]);
        w.addComments(['test', undefined], [{ type: 'block', content: 'test4' }]);
        w.addComments(['long'], [{ type: 'block', content: LONG_STRING }]);
        strictEqual(w.stringify({}, null, 4), `/**
 * test
 */
{}`);
        strictEqual(w.stringify({ test: 1 }, null, 4), `/**
 * test
 */
{
    /**
     * test2
     */
    "test": 1
}`);
        strictEqual(w.stringify({ test: [1, 2, 3] }, null, 4), `/**
 * test
 */
{
    /**
     * test2
     */
    "test": [
        /**
         * test4
         */
        1,
        /**
         * test3
         */
        2,
        /**
         * test4
         */
        3
    ]
}`);
        strictEqual(w.stringify({ long: null }, null, 4), `/**
 * test
 */
{
    /**
     * Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
     * incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
     * nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
     */
    "long": null
}`);
    });

    it('should reflect changes in configuration - no style and space', () => {
        const w: CustomCommentWriter = new CustomCommentWriter({ spaceAroundCommentSymbol: false, styledBlockComment: false });
        w.addComments([], [{ type: 'block', content: 'test' }]);
        w.addComments(['test'], [{ type: 'block', content: 'test2' }]);
        w.addComments(['test', 1], [{ type: 'block', content: 'test3' }]);
        w.addComments(['test', undefined], [{ type: 'block', content: 'test4' }]);
        w.addComments(['long'], [{ type: 'block', content: LONG_STRING }]);
        strictEqual(w.stringify({}, null, 4), `/*test*/
{}`);
        strictEqual(w.stringify({ test: 1 }, null, 4), `/*test*/
{
    /*test2*/
    "test": 1
}`);
        strictEqual(w.stringify({ test: [1, 2, 3] }, null, 4), `/*test*/
{
    /*test2*/
    "test": [
        /*test4*/
        1,
        /*test3*/
        2,
        /*test4*/
        3
    ]
}`);
        strictEqual(w.stringify({ long: null }, null, 4), `/*test*/
{
    /*Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
    nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.*/
    "long": null
}`);
    });

    it('should reflect changes in configuration - no style but with space', () => {
        const w: CustomCommentWriter = new CustomCommentWriter({ styledBlockComment: false });
        w.addComments([], [{ type: 'block', content: 'test' }]);
        w.addComments(['test'], [{ type: 'block', content: 'test2' }]);
        w.addComments(['test', 1], [{ type: 'block', content: 'test3' }]);
        w.addComments(['test', undefined], [{ type: 'block', content: 'test4' }]);
        w.addComments(['long'], [{ type: 'block', content: LONG_STRING }]);
        strictEqual(w.stringify({}, null, 4), `/* test */
{}`);
        strictEqual(w.stringify({ test: 1 }, null, 4), `/* test */
{
    /* test2 */
    "test": 1
}`);
        strictEqual(w.stringify({ test: [1, 2, 3] }, null, 4), `/* test */
{
    /* test2 */
    "test": [
        /* test4 */
        1,
        /* test3 */
        2,
        /* test4 */
        3
    ]
}`);
        strictEqual(w.stringify({ long: null }, null, 4), `/* test */
{
    /* Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
    nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. */
    "long": null
}`);
    });

    it('should work when `space` is 0', () => {
        const w: CustomCommentWriter = new CustomCommentWriter();
        w.addComments([], [{ type: 'block', content: 'test' }]);
        w.addComments(['test'], [{ type: 'block', content: 'test2' }]);
        w.addComments(['test', 1], [{ type: 'block', content: 'test3' }]);
        w.addComments(['test', undefined], [{ type: 'block', content: 'test4' }]);
        w.addComments(['long'], [{ type: 'block', content: LONG_STRING }]);
        strictEqual(w.stringify({}), `/**
 * test
 */
{}`);
        strictEqual(w.stringify({ test: 1 }), `/**
 * test
 */
{/* test2 */"test":1}`);
        strictEqual(w.stringify({ test: [1, 2, 3] }), `/**
 * test
 */
{/* test2 */"test":[/* test4 */1,/* test3 */2,/* test4 */3]}`);
        strictEqual(w.stringify({ long: null }), `/**
 * test
 */
{/* ${LONG_STRING} */"long":null}`);
    });
});