'use strict';

var Sentient = require('sentient-lang'),
    program = require('../target/json/isbn.json'),
    ISBN;

ISBN = function (options) {
    var isbn10, isbn13, i, digit;

    this.result = {};
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

ISBN.prototype.results = function (n) {
    var n = n === undefined ? 1 : n;

    if (this.result.hasOwnProperty(n)) {
        return this.result[n];
    }

    this.result[n] = Sentient.run(program, {tenDigit: this.tenDigit, thirteenDigit: this.thirteenDigit}, n);

    return this.result[n];
};

ISBN.prototype.isbn10 = function () {
    return this.isbn10s(1)[0];
};

ISBN.prototype.isbn10s = function (n) {
    var isbn10s = [],
        results = this.results(n),
        isbn10;

    for (var i = 0; i < results.length; i += 1) {
        if (results[i].hasOwnProperty('tenDigit')) {
            isbn10 = results[i].tenDigit;

            if (isbn10[9] === 10) {
                isbn10s.push(isbn10.slice(0, 9).join('') + 'X');
            } else {
                isbn10s.push(isbn10.join(''));
            }
        }
    }

    return isbn10s;
};

ISBN.prototype.isbn13 = function () {
    return this.isbn13s(1)[0];
};

ISBN.prototype.isbn13s = function (n) {
    var isbn13s = [],
        results = this.results(n),
        isbn13;

    for (var i = 0; i < results.length; i += 1) {
        if (results[i].hasOwnProperty('thirteenDigit')) {
            isbn13 = results[i].thirteenDigit;

            isbn13s.push(isbn13.join(''));
        }
    }

    return isbn13s;
};

module.exports = ISBN;
