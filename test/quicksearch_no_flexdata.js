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

    describe('flex search builder', function () {
        var fb = new ogrid.FlexSearchBuilder({columns: ['screenName', 'text']});

        it('must return "tweet" as trigger word', function () {
            expect(fb.parse('tweet "filter"').getTrigger()).to.equal('tweet');
        });
        it('must accept trigger word without filter', function () {
            expect(fb.parse('tweet').getTrigger()).to.equal('tweet');
        });
        it('must return empty filter object if no filter is specified', function () {
            expect(JSON.stringify(fb.parse('tweet').getFilter())).to.equal('{}');
        });
        it('must return "tweet" as trigger word even with leading whitespace', function () {
            expect(fb.parse('   tweet "filter"').getTrigger()).to.equal('tweet');
        });
        it('must return correct simple filter', function () {
            var filter = "coupon";
            var f = JSON.stringify({"$or":[ {screenName:{"$regex":filter}}, {text:{"$regex":filter}}]});
            expect(JSON.stringify(fb.parse('tweet ' + filter).getFilter())).to.equal(f);
        });
        it('must return correct simple filter with quotes', function () {
            var filter = "bad day";
            var f = JSON.stringify({"$or":[ {screenName:{"$regex":filter}}, {text:{"$regex":filter}}]});
            expect(JSON.stringify(fb.parse('tweet "' + filter + '"').getFilter())).to.equal(f);
        });
        it('must return "k1:v1" as param key-value pair', function () {
            var p = fb.parse('tweet k1:v1').getParams();
            expect(p[0].key).to.equal('k1');
            expect(p[0].value).to.equal('v1');
        });
        it('must return "k1:v1" as param key-value pair even with extraneous whitespaces in between values', function () {
            var p = fb.parse(' tweet k1   :  v1 ').getParams();
            expect(p[0].key).to.equal('k1');
            expect(p[0].value).to.equal('v1');
        });
        it('must return correct key-value pairs with multiple params', function () {
            var p = fb.parse(' tweet k1:v1 k2:v2').getParams();
            expect(p[0].key).to.equal('k1');
            expect(p[0].value).to.equal('v1');
            expect(p[1].key).to.equal('k2');
            expect(p[1].value).to.equal('v2');
        });
        it('must return correct key-value pairs with multiple params and extraneous whitespaces', function () {
            var p = fb.parse(' tweet k1 :v1 k2:  v2').getParams();
            expect(p[0].key).to.equal('k1');
            expect(p[0].value).to.equal('v1');
            expect(p[1].key).to.equal('k2');
            expect(p[1].value).to.equal('v2');
        });
        it('must return correct key-value pairs with multiple params and extraneous whitespaces and double-quoted values', function () {
            var p = fb.parse(' tweet k1 : "v1 0" "k2 0":  v2').getParams();
            expect(p[0].key).to.equal('k1');
            expect(p[0].value).to.equal('v1 0');
            expect(p[1].key).to.equal('k2 0');
            expect(p[1].value).to.equal('v2');
        });
        it('must return correct max with simple filter and max specified', function () {
            //expect(fb.parse('tweet "filter" $max:5').getLimit()).to.equal(5);
        });
        it('must return default max with param filter and max specified', function () {
            expect(fb.parse('tweet $max:5 a:1 "b z": "zz"').getLimit()).to.equal(5);
        });
        it('must return default max when not specified', function () {
            expect(fb.parse('tweet "filter"').getLimit()).to.equal(ogrid.Config.service.maxresults);
        });
        it('must return expected filter based on multiple params', function () {
            var f = JSON.stringify({"$and":[ {screenName:{"$regex":"v1"}}, {text:{"$regex":"v 2"}}]});
            expect(JSON.stringify(fb.parse('tweet screenName:v1 text : "v 2"').getFilter())).to.equal(f);
        });
        it('must throw a "Missing closing quote" exception when hanging quotes are found - Case 1', function () {
            try {
                fb.parse('tweet "bad');
                throw new ogrid.error('Unit test', 'Expected error not thrown');
            } catch (ex) {
                expect(ex.message).to.contain('Missing closing quote');
            }
        });
        it('must throw a "Missing closing quote" exception when hanging quotes are found - Case 2', function () {
            try {
                fb.parse('tweet "j: v1');
                throw new ogrid.error('Unit test', 'Expected error not thrown');
            } catch (ex) {
                expect(ex.message).to.contain('Missing closing quote');
            }
        });
        it('must throw a "Invalid quick search input" exception when hanging quotes are found on key-value params - Case 3', function () {
            try {
                fb.parse('tweet j: "v1');
                throw new ogrid.error('Unit test', 'Expected error not thrown');
            } catch (ex) {
                expect(ex.message).to.contain('Invalid quick search input');
            }
        });
        it('must throw a "Invalid quick search input" exception when incomplete query spec is encountered (Case 1)', function () {
            try {
                fb.parse('tweet f:');
                throw new ogrid.error('Unit test', 'Expected error not thrown');
            } catch (ex) {
                expect(ex.message).to.contain('Invalid quick search input');
            }
        });
        it('must throw a "Invalid quick search input" exception when incomplete query spec is encountered (Case 2)', function () {
            try {
                fb.parse('tweet :v');
                throw new ogrid.error('Unit test', 'Expected error not thrown');
            } catch (ex) {
                expect(ex.message).to.contain('Invalid quick search input');
            }
        });
    });
    describe('flex data quick search processor', function () {
        var fd = ogrid.flexData({columns: ['screenName', 'text']});
        it('must return exactly 2 data points', function () {
        });
        it('must throw a "bad syntax" exception', function () {
        });
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