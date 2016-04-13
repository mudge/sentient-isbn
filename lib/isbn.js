'use strict';

var fs = require('fs'),
    Sentient = require('sentient-lang'),
    source,
    program,
    ISBN;

source = fs.readFileSync(__dirname + '/../src/isbn.snt', 'utf8');
program = Sentient.compile(source);

ISBN = function (options) {
    var isbn10, isbn13, i, digit;

    this.tenDigit = new Array(10);
    this.thirteenDigit = new Array(13);

    if (options.hasOwnProperty('isbn10')) {
        isbn10 = options.isbn10.replace(/-/g, '');

        for (i = 0; i < 10; i += 1) {
            digit = isbn10.charAt(i);

            if (digit === 'X') {
                this.tenDigit[i] = 10;
            } else if (digit !== '?') {
                this.tenDigit[i] = parseInt(digit, 10);
            }
        }
    }

    if (options.hasOwnProperty('isbn13')) {
        isbn13 = options.isbn13.replace(/-/g, '');

        for (i = 0; i < 13; i += 1) {
            digit = isbn13.charAt(i);

            if (digit !== '?') {
                this.thirteenDigit[i] = parseInt(digit, 10);
            }
        }
    }
};

ISBN.prototype.results = function () {
    if (this.hasOwnProperty('result')) {
        return this.result;
    }

    this.result = Sentient.run(program, {ten_digit: this.tenDigit, thirteen_digit: this.thirteenDigit});
    return this.result;
};

ISBN.prototype.isbn10 = function () {
    var isbn10 = this.results().ten_digit;

    if (isbn10[9] === 10) {
        return isbn10.slice(0, 9).join('') + 'X';
    } else {
        return isbn10.join('');
    }
};

ISBN.prototype.isbn13 = function () {
    var isbn13 = this.results().thirteen_digit;

    return isbn13.join('');
};

module.exports = ISBN;
