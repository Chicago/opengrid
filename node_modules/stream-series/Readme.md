# stream-series

Emits events from streams in series.

## Example

```js
var series = require('stream-series');
var orderedStream = series(streamA, streamC, streamB);

streamA.end('a');
streamB.end('b');
streamC.end('c');

var writer = es.writeArray(function(err, array) {
  // Array will be ['a', 'c', 'b'];
});

orderedStream.pipe(writer);
```
