var expect = require('expect.js'),
    Stream = require('stream').Stream,
    series = require('../'),
    es = require('event-stream');

describe('streams-array', function(){
  it('Accepts streams as arguments or as an array', function(){
    var streamNames = ['one', 'two', 'three', 'four', 'five'],
        streams = [],
        expected = [];

    streamNames.map(function(e, i){
      var stream = es.through(function write(data){
        data.name = e;
        this.emit('data', data);
      });
      streams.push(stream);
      expected.push({val: i, name: e});
    });

    var writer = es.through(function(data) {
      expect(data).to.be.eql(expected[data.val]);
    });

    series(streams).pipe(writer);

    for(var i = 0; i < streamNames.length; i++){
      streams[i].end({val:i});
    }
  });
});

describe('stream-waterfall', function() {
  it('waits for one stream to end before calling the next', function(done) {
    var firstStream = es.through(function(data) {
      this.emit('data', data);
    });

    var secondStream = es.through(function(data) {
      this.emit('data', data);
    });

    var thirdStream = es.through(function(data) {
      this.emit('data', data);
    });


    var writer = es.writeArray(function(err, array) {
      expect(array).to.be.eql([1, 3, 2]);
      done();
    });

    series(firstStream, thirdStream, secondStream).pipe(writer);
    firstStream.end(1);
    secondStream.end(2);
    thirdStream.end(3);
  });
});
