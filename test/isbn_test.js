'use strict';

var assert = require('assert'),
    ISBN = require('../lib/isbn');

describe('ISBN', function () {
    describe('#isbn10', function () {
        it('returns a given ISBN-10', function () {
            var isbn = new ISBN({isbn10: '3319217283'});

            assert.equal('3319217283', isbn.isbn10());
        });

        it('ignores hyphens in ISBN-10s', function () {
            var isbn = new ISBN({isbn10: '3-319-21728-3'});

            assert.equal('3319217283', isbn.isbn10());
        });

        it('supports ISBN-10s with a check digit of 10', function () {
            var isbn = new ISBN({isbn13: '9780804429573'});

            assert.equal('080442957X', isbn.isbn10());
        });

        it('supports giving ISBN-10s with a check digit of 10', function () {
            var isbn = new ISBN({isbn10: '080442957X'});

            assert.equal('080442957X', isbn.isbn10());
        });

        it('returns a complete ISBN-10 if given an incomplete ISBN-10', function () {
            var isbn = new ISBN({isbn10: '331?217283'});

            assert.equal('3319217283', isbn.isbn10());
        });

        it('returns a ISBN-10 if given an ISBN-13', function () {
            var isbn = new ISBN({isbn13: '9783319217284'});

            assert.equal('3319217283', isbn.isbn10());
        });

        it('returns a ISBN-10 if given an incomplete ISBN-13', function () {
            var isbn = new ISBN({isbn13: '9783?19217284'});

            assert.equal('3319217283', isbn.isbn10());
        });

        it('returns a complete ISBN-10 if given incomplete ISBN-10 and ISBN-13', function () {
            var isbn = new ISBN({isbn13: '???????217284', isbn10: '331???????'});

            assert.equal('3319217283', isbn.isbn10());
        });
    });

    describe('#isbn10s', function () {
        it('returns multiple results when found', function () {
            var isbn = new ISBN({isbn10: '331921????'});

            assert.deepEqual(['331921277X', '3319212176', '3319213911'], isbn.isbn10s(3));
        });

        it('returns a maximum number of results', function () {
            var isbn = new ISBN({isbn10: '331921????'});

            assert.deepEqual(['331921277X', '3319212176'], isbn.isbn10s(2));
        });
    });

    describe('#isbn13', function () {
        it('returns a given ISBN-13', function () {
            var isbn = new ISBN({isbn13: '9783319217284'});

            assert.equal('9783319217284', isbn.isbn13());
        });

        it('ignores hyphens in ISBN-13s', function () {
            var isbn = new ISBN({isbn13: '978-331-92-1728-4'});

            assert.equal('9783319217284', isbn.isbn13());
        });

        it('supports ISBN-10s with a check digit of 10', function () {
            var isbn = new ISBN({isbn10: '080442957X'});

            assert.equal('9780804429573', isbn.isbn13());
        });

        it('returns a complete ISBN-13 if given an incomplete ISBN-13', function () {
            var isbn = new ISBN({isbn13: '978?319217284'});

            assert.equal('9783319217284', isbn.isbn13());
        });

        it('returns a ISBN-13 if given an ISBN-10', function () {
            var isbn = new ISBN({isbn10: '3319217283'});

            assert.equal('9783319217284', isbn.isbn13());
        });

        it('returns a ISBN-13 if given an incomplete ISBN-10', function () {
            var isbn = new ISBN({isbn10: '331?217283'});

            assert.equal('9783319217284', isbn.isbn13());
        });

        it('returns a complete ISBN-13 if given incomplete ISBN-10 and ISBN-13', function () {
            var isbn = new ISBN({isbn13: '???????217284', isbn10: '331???????'});

            assert.equal('9783319217284', isbn.isbn13());
        });
    });

    describe('#isbn13s', function () {
        it('returns multiple results when found', function () {
            var isbn = new ISBN({isbn13: '???????217284'});

            assert.deepEqual(['9782626217284', '9785146217284', '9781346217284'], isbn.isbn13s(3));
        });

        it('returns a maximum number of results', function () {
            var isbn = new ISBN({isbn13: '???????217284'});

            assert.deepEqual(['9782626217284', '9785146217284'], isbn.isbn13s(2));
        });
    });
});
