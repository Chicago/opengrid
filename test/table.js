var expect = require('chai').expect;

describe('session and security', function() {
    describe('login', function () {
        it('must fail with bad credentials', function () {
        });
        it('must succeed with good credentials', function () {
        });
        it('must fail with graceful message when service is down', function () {
        });
    });
    describe('session', function () {
        it('must expire after 30 minutes', function () {
        });
        it('must renew auth token expiration every 3 hours', function () {
        });
        it('must return auth token with test name "Admin"', function () {
        });
        it('must return auth token with roles "opengrid_admins"', function () {
        });
    });
});