# Sentient ISBN [![Build Status](https://travis-ci.org/mudge/sentient-isbn.svg?branch=master)](https://travis-ci.org/mudge/sentient-isbn)

An implementation of [International Standard Book
Numbers](https://en.wikipedia.org/wiki/International_Standard_Book_Number)
(both 10 and 13 digits) supporting conversion and correction using
[Sentient](https://github.com/tuzz/sentient.js).

**Current version:** 0.1.1  
**Supported Node.js versions:** 0.12

```javascript
var ISBN = require('sentient-isbn');

// We can convert ISBN-10s to ISBN-13s
var isbn = new ISBN({ isbn10: '3319217283' });
isbn.isbn10(); //=> '3319217283'
isbn.isbn13(); //=> '9783319217284'

// We can also complete partial ISBNs
var partialIsbn = new ISBN({ isbn10: '331?217283' });
partialIsbn.isbn10(); //=> '3319217283'
partialIsbn.isbn13(); //=> '9783319217284'

// We can complete ISBNs if we have both ISBN-10 and ISBN-13 digits
var twoPartialIsbns = new ISBN({
    isbn13: '???????217284',
    isbn10: '331???????'
});
twoPartialIsbns.isbn13(); //=> '9783319217284'

// We can return multiple ISBNs if there is ambiguity
var partialIsbn13 = new ISBN({isbn13: '???????217284'});
partialIsbn13.isbn13s(2); //=> ['9782626217284', '9785146217284']
```

## Installation

```shell
$ npm install mudge/sentient-isbn
```

## Rationale

This library is an exploration of [Chris Patuzzo's Sentient programming
language](https://github.com/tuzz/sentient.js), using a declarative style to
describe the format of ISBN-10s and ISBN-13s and their relationship to one
another.

The heart of the library is a [Sentient program which describes ISBNs in terms
of
invariants](https://github.com/mudge/sentient-isbn/blob/master/lib/isbn.snt)
such as:

* All digits must be between 0 and 9 inclusive except an ISBN-10's check digit
  which can include 10;
* The sum of all digits of an ISBN-10 multiplied by its index modulo 11 must
  be 0.

With this in place, we can then convert ISBNs between formats _despite the
fact we never write down the exact calculation procedure for ISBN check
digits_. Instead, Sentient is able to infer a solution using only the
invariants we have set.

Admittedly, the library is much slower to convert ISBNs than a more
traditional implementation but it also has novel abilities such as:

* Being able to take partial ISBNs with some digits (not just the check digit)
  missing and infer a possible valid candidate;
* Combine partial ISBNs in different formats to infer a valid candidate of
  either format.

All this without explaining _how_ to perform such a procedure but instead
_declaring_ the important properties of an ISBN.

## Acknowledgements

[Chris Patuzzo](https://github.com/tuzz) for creating Sentient, contributing
the concrete syntax version of the program and helping me "think <strike>with
portals</strike> declaratively".

## License

Copyright © 2016 Paul Mucur.

Distributed under the MIT License.
