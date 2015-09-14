var server;
var expect = chai.expect;

//template test cases for all quick search processors
var _getSearchTests = function(input, searchData, badInput, expectedSyntaxError) {
    return function() {
        it('must call success callback on success', function () {
            var cb = [sinon.spy(), sinon.spy()];
            var o = ogrid.QSearchFactory.parse(input);
            o.exec(input, cb[0], cb[1])
            server.requests[0].respond(
                200,
                { "Content-Type": "application/json" },
                JSON.stringify(searchData)
            );
            expect(cb[0].called).to.equal(true);
            expect(cb[1].called).to.equal(false);
        });
        it('must call error callback on failure', function () {
            var cb = [sinon.spy(), sinon.spy()];
            var o = ogrid.QSearchFactory.parse(input);
            o.exec(input, cb[0], cb[1])
            server.requests[0].respond(
                500,
                { "Content-Type": "application/json" },
                ''
            );
            expect(cb[0].called).to.equal(false);
            expect(cb[1].called).to.equal(true);
        });
        it('must pass data intact to success callback', function (done) {
            var cb = function(data) {
                expect(data.features.length).to.equal(searchData.features.length);
                done();
            };
            var o = ogrid.QSearchFactory.parse(input);
            o.exec(input, cb)
            server.requests[0].respond(
                200,
                { "Content-Type": "application/json" },
                JSON.stringify(searchData)
            );
        });
        if (badInput) {
            it('must throw a "bad syntax" exception', function () {
                var input = badInput; //'tweet "hanging';
                var o = ogrid.QSearchFactory.parse(input);
                var err = {};
                var m = '';
                try {
                    o.exec(input)
                } catch (ex) {
                    m = ex.message;
                }
                expect(m).to.contain(expectedSyntaxError); //'Twitter quick search input is invalid');
            });
        }
    }
}

describe('quick search--', function() {

    beforeEach(function() {
        server = sinon.fakeServer.create();
    });

    afterEach(function() {
        server.restore();
    });

    describe('quick search factory--', function () {
        it('must return LatLng as quick search processor for input search', function () {
            expect(ogrid.QSearchFactory.parse('41.88563,-87.61846'))
                .to.be.an.instanceof(ogrid.QSearchProcessor.LatLng);
        });
        it('must return Weather quick search processor for input search', function () {
            expect(ogrid.QSearchFactory.parse('weather 60601'))
                .to.be.an.instanceof(ogrid.QSearchProcessor.Weather);
        });
        it('must return Tweet quick search processor for input search', function () {
            expect(ogrid.QSearchFactory.parse('tweet food'))
                .to.be.an.instanceof(ogrid.QSearchProcessor.Tweet);
        });
        it('must return Place/Address quick search processor for input search', function () {
            expect(ogrid.QSearchFactory.parse('united center'))
                .to.be.an.instanceof(ogrid.QSearchProcessor.Place);
        });
    });

    var tweetTests = _getSearchTests('tweet coupon', tweetCouponMockData, 'tweet "hanging', 'Twitter quick search input is invalid');
    describe('tweets quick search processor', function () {
        tweetTests();
    });

    var weatherTests = _getSearchTests('weather 60601', weather60601MockData, 'weather', 'Weather quick search input is invalid');
    describe('weather quick search processor', function () {
        weatherTests();
    });


    describe('latlng quick search processor', function () {
        it('must return exactly 2 data points', function () {
        });
        it('must throw a "bad syntax" exception', function () {
        });
    });
    describe('place quick search processor', function () {
        it('must return exactly 2 data points', function () {
        });
    });
    describe('quick search - general', function () {
        it('must return graceful error on bad query syntax', function () {
        });
        it('must return graceful error on search timeout', function () {
        });
        it('must return graceful error when service is unavailable', function () {
        });
    });
});