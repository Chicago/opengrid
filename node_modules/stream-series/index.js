var PauseStream = require('pause-stream');

module.exports = function(input) {
  var streams;
  if(input instanceof Array){
    streams = input;
  }
  else {
    streams = arguments;
  }
    streams = Array.prototype.slice.call(streams);
  
  var pending = streams.length;

  var stream = new PauseStream();

  var buffers = new Array(pending),
      ended = new Array(pending);

  streams.forEach(function(e, i) {
    // normalize for badly behaved streams
    var pauseStream = new PauseStream();
    e.pipe(pauseStream);
    pauseStream.pause();
    streams[i] = pauseStream;
  });

  function next() {
    var e = streams.shift();
    e.pipe(stream, {end: false});
    e.on('end', finish);
    e.resume();
    function finish() {
      if(!--pending) return stream.emit('end');
      next();
    }
  }

  var originalDestroy = stream.destroy;
  stream.destroy = function() {
    streams.forEach(function(e) { if(e.destroy) e.destroy(); });
    originalDestroy.call(stream);
  };

  next();

  return stream;
};
