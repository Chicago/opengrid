# Download OpenGrid code
<pre>
git clone https://github.com/Chicago/opengrid.git
</pre>

# Install Dependencies
Install PhantomJS by following the instructions on this [page](http://phantomjs.org/download.html).

Install [npm](https://www.npmjs.com/package/npm), if you haven't yet.

Once installed, download and install the necessary npm modules by running the *install* command.
<pre>
cd opengrid
npm install
</pre>

# Customize/Configure
Edit the `src/js/custom/Config.js` and `config/EnvSettings.js` files. `EnvSettings.js` overrides default settings specified in `Config.js` (build system can be configured later to pull a different copy of `EnvSettings.js` depending on the application environment i.e. Test, Production, etc). At a minimum, the *service endpoint* setting in `EnvSettings.js` must be edited to point to the correct location of the OpenGrid-compliant service.

For the build procedures of a template implementation of the OpenGrid Service Layer, please refer to this [link](https://github.com/Chicago/opengrid-svc-template/blob/master/docs/Build%20Procedures.md).

# Run Gulp Tasks
The application uses [Gulp](http://gulpjs.com/) as its build system and [Mocha](https://mochajs.org/) for its test framework.
## Debug Task
The *debug* task creates a debug build under the *./debug* folder. The debug build injects local file references into the main HTML page for debugging purposes.
<pre>
gulp debug
</pre>
## Test Task
The *test* task runs all the Mocha unit tests.
<pre>
gulp test
</pre>
## Release Task
The *release* task creates a release build under the *./dist* folder. The release build runs the lint and test tasks, and minifies the application and third-party Javascript and CSS files. *release* is the default Gulp task.
<pre>
gulp release
</pre>
## Deploy
Deploy the files under the *./dist* folder to your web server. For quick preview using Node.js, you can use the npm module [node-http-server](https://www.npmjs.com/package/node-http-server). 

Note: As of this writing, OpenGrid has an open issue for supporting cross-domain service calls. Currently, you'll have to open the application in Chrome with the *--disable-web-security* parameter if the service *lives* under a different domain.
