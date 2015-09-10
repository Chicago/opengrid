var expect = require('chai').expect;

describe('advanced search', function() {
    describe('twitter search', function () {
        it('must return exactly 3 data points', function () {
        });
        it('must return exactly 1 data point with additional geo-spatial filter', function () {
        });
        it('must return no results with non-matching filter', function () {
        });
    });
    describe('weather search', function () {
        it('must return exactly 3 data points', function () {
        });
        it('must return exactly 1 data point with additional geo-spatial filter', function () {
        });
        it('must return no results with non-matching filter', function () {
        });
    });
    describe('query manager', function () {
        it('must save query definition successfully', function () {
        });
        it('must return error on bad query definition', function () {
        });
        it('must prompt with message with duplicate query', function () {
        });
        it('must be able to save an existing query under another name', function () {
        });
        it('must auto-execute query successfully', function () {
        });
        it('must open existing query definition successfully', function () {
        });
        it('must return graceful error when user tries to open a query with a dataset that he/she has no access to', function () {
        });
        it('must be able to delete an existing query successfully', function () {
        });
    });
    describe('general advanced search', function () {
        it('must auto-refresh query in 5 seconds', function () {
        });
        it('must not execute query if previous auto-refresh query is still not completed', function () {
        });
        it('must return graceful error when service is unavailable', function () {
        });
        it('must return graceful error on search timeout', function () {
        });
    });
});