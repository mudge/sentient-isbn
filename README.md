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
var isbn = new ISBN({ isbn10: '3319217283' });
isbn.isbn10(); //=> '3319217283'
isbn.isbn13(); //=> '9783319217284'

// We can also complete partial ISBNs
var partialIsbn = new ISBN({ isbn10: '331?217283' });
partialIsbn.isbn10(); //=> '3319217283'
partialIsbn.isbn13(); //=> '9783319217284'

// We can complete ISBNs if we have both ISBN-10 and ISBN-13 digits
var twoPartialIsbns = new ISBN({
    isbn13: '??????9217284',
    isbn10: '331???????'
});
twoPartialIsbns.isbn13(); //=> '9783319217284'
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
