# Sentient ISBN [![Build Status](https://travis-ci.org/mudge/sentient-isbn.svg?branch=master)](https://travis-ci.org/mudge/sentient-isbn)

An implementation of [International Standard Book
Numbers](https://en.wikipedia.org/wiki/International_Standard_Book_Number)
(both 10 and 13 digits) supporting conversion and correction using
[Sentient](https://github.com/tuzz/sentient.js).

**Current version:** 0.1.0  
**Supported Node.js versions:** 0.12

```javascript
var ISBN = require('sentient-isbn');

// We can convert ISBN-10s to ISBN-13s
var isbn = new ISBN({ isbn10: [3, 3, 1, 9, 2, 1, 7, 2, 8, 3] });
isbn.isbn10(); //=> [3, 3, 1, 9, 2, 1, 7, 2, 8, 3]
isbn.isbn13(); //=> [9, 7, 8, 3, 3, 1, 9, 2, 1, 7, 2, 8, 4]

// We can also complete partial ISBNs
var partialIsbn = new ISBN({ isbn10: [3, 3, 1, undefined, 2, 1, 7, 2, 8, 3] });
partialIsbn.isbn10(); //=> [3, 3, 1, 9, 2, 1, 7, 2, 8, 3]
partialIsbn.isbn13(); //=> [9, 7, 8, 3, 3, 1, 9, 2, 1, 7, 2, 8, 4]

// We can complete ISBNs if we have both ISBN-10 and ISBN-13 digits
var twoPartialIsbns = new ISBN({
    isbn13: [undefined, undefined, undefined, undefined, undefined, undefined, 9, 2, 1, 7, 2, 8, 4],
    isbn10: [3, 3, 1, undefined, undefined, undefined, undefined, undefined, undefined, undefined]
});
twoPartialIsbns.isbn13(); //=> [9, 7, 8, 3, 3, 1, 9, 2, 1, 7, 2, 8, 4]
```

## Installation

```shell
$ npm install mudge/sentient-isbn
```

## Acknowledgements

[Chris Patuzzo](https://github.com/tuzz) for creating Sentient and helping me
"think <strike>with portals</strike> declaratively".

## License

Copyright © 2016 Paul Mucur.

Distributed under the MIT License.
