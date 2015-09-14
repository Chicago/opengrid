
describe('session and security--', function() {
    var server, session;
    var expect = chai.expect;
    var $loginForm = $('#login-form');
    var $appContainer = $('#app-container');
    var testToken ="eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTQ0MTIyNTQ2MywianRpIjoiYWRtaW4iLCJyb2xlcyI6Im9wZW5ncmlkX2FkbWlucyIsInJlc291cmNlcyI6IndlYXRoZXIsdHdpdHRlciwkYWRtaW4iLCJmbmFtZSI6Ik9wZW5HcmlkIiwibG5hbWUiOiJBZG1pbiJ9.FIiFQn9c6nFFOnJ8wKDX9JOnb3lRhMnEMdKYEjZ-EJEKgCYGld7UYcltCjXUUMY-YTBYCWc-fsDZUtsUNP6yFA";

    beforeEach(function() {
        server = sinon.fakeServer.create();

        session = ogrid.session(
            $loginForm,
            $appContainer,
            '/users/token',
            function() {
                //alert('session timed out');
            }
        );
    });

    afterEach(function() {
        server.restore();
    });


    describe('login--', function () {
        it('must show login form and hide app container on showLogin', function () {
            session.showLogin();
            expect($loginForm.hasClass("in")).to.equal(true);
            expect($appContainer.hasClass("hide")).to.equal(true);
        });
        it('must not have invoked callback on showLogin', function () {
            var cb = sinon.spy();
            session.showLogin(cb);
            expect(cb.called).to.equal(false);
        });
        it('must throw error if user name is blank', function () {
            expect(function() {
                session.login('', 'pwd')
            }).to.throw('Username cannot be blank.');
        });
        it('must throw error if password is blank', function () {
            expect(function() {
                session.login('user1', '');
            }).to.throw('Password cannot be blank.');
        });
        it('must call error callback when login fails', function () {
            var cb = [sinon.spy(), sinon.spy()];
            session.login('userid1', 'badpassword', cb[0], cb[1]);
            server.requests[0].respond(
                //unauthorized
                401,
                { "Content-Type": "application/json" },
                JSON.stringify({error: 'Unauthorized' })
            );
            expect(cb[0].called).to.equal(false);
            expect(cb[1].called).to.equal(true);
        });
        it('must call success callback when login succeeds', function () {
            var cb = [sinon.spy(), sinon.spy()];
            session.login('userid1', 'goodpassword', cb[0], cb[1]);
            server.requests[0].respond(
                200,
                { "Content-Type": "application/json" },
                JSON.stringify({token: 'fakeToken' })
            );
            expect(cb[0].called).to.equal(true);
            expect(cb[1].called).to.equal(false);
        });
        it('must fail with graceful message when service is down', function (done) {
            server.restore();
            var cb = function(jqXHR, txtStatus, errorThrown) {
                session._onLoginError(jqXHR, txtStatus, errorThrown);
                expect(session.getLastError()).to.contain('The authentication service may be unavailable');
                done();
            };
            session = ogrid.session(
                $loginForm,
                $appContainer,
                //bad server, should be unreachable
                'http:/badserver_foweijfslkdjvlsdf:101010/users/token'
            );
            session.login('userid1', 'goodpassword', null, cb);
        });
    });
    describe('session', function () {
        it('must store auth token successfully on successful login', function () {
            session.login('userid1', 'goodpassword');
            server.requests[0].respond(
                200,
                {
                    "Content-Type": "text/plain",
                    "X-AUTH-TOKEN": testToken,
                    "Content-Length": 0
                },
                ""
            );
            expect(session.token()).to.be.ok;
        });
        it('must remove auth token on logout', function () {
            session.login('userid1', 'goodpassword');
            server.requests[0].respond(
                200,
                {
                    "Content-Type": "text/plain",
                    "X-AUTH-TOKEN": testToken,
                    "Content-Length": 0
                },
                ""
            );
            session.logout();
            expect(session.token()).to.not.be.ok;
        });
        it('must throw an exception when an invalid JWT token is returned by service', function () {
            session.login('userid1', 'goodpassword');
            server.requests[0].respond(
                200,
                {
                    "Content-Type": "text/plain",
                    "X-AUTH-TOKEN": "bad token",
                    "Content-Length": 0
                },
                ""
            );
            //check error panel
            expect(session.getLastError()).to.contain('Invalid X-AUTH-TOKEN');
        });
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