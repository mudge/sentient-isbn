'use strict';

var assert = require('assert'),
    ISBN = require('../lib/isbn');

describe('ISBN', function () {
    describe('#isbn10', function () {
        it('returns a given ISBN-10', function () {
            var isbn = new ISBN({ isbn10: [3, 3, 1, 9, 2, 1, 7, 2, 8, 3] });

            assert.deepEqual([3, 3, 1, 9, 2, 1, 7, 2, 8, 3], isbn.isbn10());
        });

        it('returns a complete ISBN-10 if given an incomplete ISBN-10', function () {
            var isbn = new ISBN({ isbn10: [3, 3, 1, undefined, 2, 1, 7, 2, 8, 3] });

            assert.deepEqual([3, 3, 1, 9, 2, 1, 7, 2, 8, 3], isbn.isbn10());
        });

        it('returns a ISBN-10 if given an ISBN-13', function () {
            var isbn = new ISBN({ isbn13: [9, 7, 8, 3, 3, 1, 9, 2, 1, 7, 2, 8, 4] });

            assert.deepEqual([3, 3, 1, 9, 2, 1, 7, 2, 8, 3], isbn.isbn10());
        });

        it('returns a ISBN-10 if given an incomplete ISBN-13', function () {
            var isbn = new ISBN({ isbn13: [9, 7, 8, 3, undefined, 1, 9, 2, 1, 7, 2, 8, 4] });

            assert.deepEqual([3, 3, 1, 9, 2, 1, 7, 2, 8, 3], isbn.isbn10());
        });

        it('returns a complete ISBN-10 if given incomplete ISBN-10 and ISBN-13', function () {
            var isbn = new ISBN({
                isbn13: [undefined, undefined, undefined, undefined, undefined, undefined, 9, 2, 1, 7, 2, 8, 4],
                isbn10: [3, 3, 1, undefined, undefined, undefined, undefined, undefined, undefined, undefined]
            });

            assert.deepEqual([3, 3, 1, 9, 2, 1, 7, 2, 8, 3], isbn.isbn10());
        });
    });

    describe('#isbn13', function () {
        it('returns a given ISBN-13', function () {
            var isbn = new ISBN({ isbn13: [9, 7, 8, 3, 3, 1, 9, 2, 1, 7, 2, 8, 4] });

            assert.deepEqual([9, 7, 8, 3, 3, 1, 9, 2, 1, 7, 2, 8, 4], isbn.isbn13());
        });

        it('returns a complete ISBN-13 if given an incomplete ISBN-13', function () {
            var isbn = new ISBN({ isbn13: [9, 7, 8, undefined, 3, 1, 9, 2, 1, 7, 2, 8, 4] });

            assert.deepEqual([9, 7, 8, 3, 3, 1, 9, 2, 1, 7, 2, 8, 4], isbn.isbn13());
        });

        it('returns a ISBN-13 if given an ISBN-10', function () {
            var isbn = new ISBN({ isbn10: [3, 3, 1, 9, 2, 1, 7, 2, 8, 3] });

            assert.deepEqual([9, 7, 8, 3, 3, 1, 9, 2, 1, 7, 2, 8, 4], isbn.isbn13());
        });

        it('returns a ISBN-13 if given an incomplete ISBN-10', function () {
            var isbn = new ISBN({ isbn10: [3, 3, 1, undefined, 2, 1, 7, 2, 8, 3] });

            assert.deepEqual([9, 7, 8, 3, 3, 1, 9, 2, 1, 7, 2, 8, 4], isbn.isbn13());
        });

        it('returns a complete ISBN-13 if given incomplete ISBN-10 and ISBN-13', function () {
            var isbn = new ISBN({
                isbn13: [undefined, undefined, undefined, undefined, undefined, undefined, 9, 2, 1, 7, 2, 8, 4],
                isbn10: [3, 3, 1, undefined, undefined, undefined, undefined, undefined, undefined, undefined]
            });

            assert.deepEqual([9, 7, 8, 3, 3, 1, 9, 2, 1, 7, 2, 8, 4], isbn.isbn13());
        });
    });
});
