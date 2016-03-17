'use strict';

var Sentient = require('sentient-lang'),
    program,
    ISBN;

/* A Sentient program to encode ISBN-10s, ISBN-13s, their check digits and how they relate. */
program = Sentient.compile({
    instructions: [

        /* Declare all parts of the ISBN including check digits. */
        { type: 'integer', symbol: 'ten0', width: 5 },
        { type: 'integer', symbol: 'ten1', width: 5 },
        { type: 'integer', symbol: 'ten2', width: 5 },
        { type: 'integer', symbol: 'ten3', width: 5 },
        { type: 'integer', symbol: 'ten4', width: 5 },
        { type: 'integer', symbol: 'ten5', width: 5 },
        { type: 'integer', symbol: 'ten6', width: 5 },
        { type: 'integer', symbol: 'ten7', width: 5 },
        { type: 'integer', symbol: 'ten8', width: 5 },
        { type: 'integer', symbol: 'tenCheckDigit', width: 5 },
        { type: 'integer', symbol: 'thirteenCheckDigit', width: 5 },

        /* State that all digits must be between 0 and 9 inclusive aside from ISBN-10 check digits
         * which can include 10.
         */
        { type: 'push', symbol: 'ten0' },
        { type: 'constant', value: 0 },
        { type: 'greaterequal' },
        { type: 'invariant' },
        { type: 'push', symbol: 'ten0' },
        { type: 'constant', value: 9 },
        { type: 'lessequal' },
        { type: 'invariant' },
        { type: 'push', symbol: 'ten1' },
        { type: 'constant', value: 0 },
        { type: 'greaterequal' },
        { type: 'invariant' },
        { type: 'push', symbol: 'ten1' },
        { type: 'constant', value: 9 },
        { type: 'lessequal' },
        { type: 'invariant' },
        { type: 'push', symbol: 'ten2' },
        { type: 'constant', value: 0 },
        { type: 'greaterequal' },
        { type: 'invariant' },
        { type: 'push', symbol: 'ten2' },
        { type: 'constant', value: 9 },
        { type: 'lessequal' },
        { type: 'invariant' },
        { type: 'push', symbol: 'ten3' },
        { type: 'constant', value: 0 },
        { type: 'greaterequal' },
        { type: 'invariant' },
        { type: 'push', symbol: 'ten3' },
        { type: 'constant', value: 9 },
        { type: 'lessequal' },
        { type: 'invariant' },
        { type: 'push', symbol: 'ten4' },
        { type: 'constant', value: 0 },
        { type: 'greaterequal' },
        { type: 'invariant' },
        { type: 'push', symbol: 'ten4' },
        { type: 'constant', value: 9 },
        { type: 'lessequal' },
        { type: 'invariant' },
        { type: 'push', symbol: 'ten5' },
        { type: 'constant', value: 0 },
        { type: 'greaterequal' },
        { type: 'invariant' },
        { type: 'push', symbol: 'ten5' },
        { type: 'constant', value: 9 },
        { type: 'lessequal' },
        { type: 'invariant' },
        { type: 'push', symbol: 'ten6' },
        { type: 'constant', value: 0 },
        { type: 'greaterequal' },
        { type: 'invariant' },
        { type: 'push', symbol: 'ten6' },
        { type: 'constant', value: 9 },
        { type: 'lessequal' },
        { type: 'invariant' },
        { type: 'push', symbol: 'ten7' },
        { type: 'constant', value: 0 },
        { type: 'greaterequal' },
        { type: 'invariant' },
        { type: 'push', symbol: 'ten7' },
        { type: 'constant', value: 9 },
        { type: 'lessequal' },
        { type: 'invariant' },
        { type: 'push', symbol: 'ten8' },
        { type: 'constant', value: 0 },
        { type: 'greaterequal' },
        { type: 'invariant' },
        { type: 'push', symbol: 'ten8' },
        { type: 'constant', value: 9 },
        { type: 'lessequal' },
        { type: 'invariant' },
        { type: 'push', symbol: 'tenCheckDigit' },
        { type: 'constant', value: 0 },
        { type: 'greaterequal' },
        { type: 'invariant' },
        { type: 'push', symbol: 'tenCheckDigit' },
        { type: 'constant', value: 10 },
        { type: 'lessequal' },
        { type: 'invariant' },
        { type: 'push', symbol: 'thirteenCheckDigit' },
        { type: 'constant', value: 0 },
        { type: 'greaterequal' },
        { type: 'invariant' },
        { type: 'push', symbol: 'thirteenCheckDigit' },
        { type: 'constant', value: 9 },
        { type: 'lessequal' },
        { type: 'invariant' },

        /* Collect all digits in an ISBN-10. */
        { type: 'push', symbol: 'ten0' },
        { type: 'push', symbol: 'ten1' },
        { type: 'push', symbol: 'ten2' },
        { type: 'push', symbol: 'ten3' },
        { type: 'push', symbol: 'ten4' },
        { type: 'push', symbol: 'ten5' },
        { type: 'push', symbol: 'ten6' },
        { type: 'push', symbol: 'ten7' },
        { type: 'push', symbol: 'ten8' },
        { type: 'push', symbol: 'tenCheckDigit' },
        { type: 'collect', width: 10 },
        { type: 'pop', symbol: 'tenDigit' },

        /* Declare how to verify ISBN-10s (including their check digits).
         *
         * 1. Add together each digit, multiplying by their index;
         * 2. Take the result modulo 11;
         * 3. State that the result must be 0.
         */
        { type: 'push', symbol: 'ten0' },
        { type: 'push', symbol: 'ten1' },
        { type: 'constant', value: 2 },
        { type: 'multiply' },
        { type: 'add' },
        { type: 'push', symbol: 'ten2' },
        { type: 'constant', value: 3 },
        { type: 'multiply' },
        { type: 'add' },
        { type: 'push', symbol: 'ten3' },
        { type: 'constant', value: 4 },
        { type: 'multiply' },
        { type: 'add' },
        { type: 'push', symbol: 'ten4' },
        { type: 'constant', value: 5 },
        { type: 'multiply' },
        { type: 'add' },
        { type: 'push', symbol: 'ten5' },
        { type: 'constant', value: 6 },
        { type: 'multiply' },
        { type: 'add' },
        { type: 'push', symbol: 'ten6' },
        { type: 'constant', value: 7 },
        { type: 'multiply' },
        { type: 'add' },
        { type: 'push', symbol: 'ten7' },
        { type: 'constant', value: 8 },
        { type: 'multiply' },
        { type: 'add' },
        { type: 'push', symbol: 'ten8' },
        { type: 'constant', value: 9 },
        { type: 'multiply' },
        { type: 'add' },
        { type: 'push', symbol: 'tenCheckDigit' },
        { type: 'constant', value: 10 },
        { type: 'multiply' },
        { type: 'add' },
        { type: 'constant', value: 11 },
        { type: 'modulo' },
        { type: 'constant', value: 0 },
        { type: 'equal' },
        { type: 'invariant' },

        /* Declare how to verify ISBN-13s (including their check digit).
         *
         * 1. Add all even-numbered digits;
         * 2. Add all odd-numbered digits and multiply by 3;
         * 3. Add both sums together modulo 10;
         * 4. State that the result must equal 0
         */
        { type: 'constant', value: 9 },
        { type: 'constant', value: 8 },
        { type: 'add' },
        { type: 'push', symbol: 'ten1' },
        { type: 'add' },
        { type: 'push', symbol: 'ten3' },
        { type: 'add' },
        { type: 'push', symbol: 'ten5' },
        { type: 'add' },
        { type: 'push', symbol: 'ten7' },
        { type: 'add' },
        { type: 'push', symbol: 'thirteenCheckDigit' },
        { type: 'add' },
        { type: 'constant', value: 7 },
        { type: 'push', symbol: 'ten0' },
        { type: 'add' },
        { type: 'push', symbol: 'ten2' },
        { type: 'add' },
        { type: 'push', symbol: 'ten4' },
        { type: 'add' },
        { type: 'push', symbol: 'ten6' },
        { type: 'add' },
        { type: 'push', symbol: 'ten8' },
        { type: 'add' },
        { type: 'constant', value: 3 },
        { type: 'multiply' },
        { type: 'add' },
        { type: 'constant', value: 10 },
        { type: 'modulo' },
        { type: 'constant', value: 0 },
        { type: 'equal' },
        { type: 'invariant' },

        /* Collect together all the digits in an ISBN-13. */
        { type: 'constant', value: 9 },
        { type: 'constant', value: 7 },
        { type: 'constant', value: 8 },
        { type: 'push', symbol: 'ten0' },
        { type: 'push', symbol: 'ten1' },
        { type: 'push', symbol: 'ten2' },
        { type: 'push', symbol: 'ten3' },
        { type: 'push', symbol: 'ten4' },
        { type: 'push', symbol: 'ten5' },
        { type: 'push', symbol: 'ten6' },
        { type: 'push', symbol: 'ten7' },
        { type: 'push', symbol: 'ten8' },
        { type: 'push', symbol: 'thirteenCheckDigit' },
        { type: 'collect', width: 13 },
        { type: 'pop', symbol: 'thirteenDigit' },

        /* Expose thirteenDigit and tenDigit in the result. */
        { type: 'variable', symbol: 'thirteenDigit' },
        { type: 'variable', symbol: 'tenDigit' }
    ]
});

ISBN = function (options) {
    this.tenDigit = new Array(10);
    this.thirteenDigit = new Array(13);

    if (options.hasOwnProperty('isbn10')) {
        this.tenDigit = options.isbn10;
    }

    if (options.hasOwnProperty('isbn13')) {
        this.thirteenDigit = options.isbn13;
    }
};

ISBN.prototype.results = function () {
    if (this.hasOwnProperty('result')) {
        return this.result;
    }

    this.result = Sentient.run(program, { tenDigit: this.tenDigit, thirteenDigit: this.thirteenDigit });
    return this.result;
};

ISBN.prototype.isbn10 = function () {
    return this.results().tenDigit;
};

ISBN.prototype.isbn13 = function () {
    return this.results().thirteenDigit;
};

module.exports = ISBN;
