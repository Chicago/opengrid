![OpenGrid](img/branding/OpenGrid_Logo_Horizontal_3Color.png)

[![Build status - Linux](https://img.shields.io/travis/Chicago/opengrid/master.svg?style=flat-square&label=Linux build)](https://travis-ci.org/Chicago/opengrid)[![Build status - Windows](https://img.shields.io/appveyor/ci/tomschenkjr/opengrid/master.svg?style=flat-square&label=Windows build)](https://ci.appveyor.com/project/tomschenkjr/opengrid)[![Node.js dependencies](https://img.shields.io/coveralls/Chicago/opengrid/master.svg?style=flat-square)](https://coveralls.io/github/Chicago/opengrid)[![Node.js](https://img.shields.io/node/v/gh-badges.svg?style=flat-square)](https://david-dm.org/Chicago/opengrid)[![Node.js dependencies](https://img.shields.io/david/Chicago/opengrid.svg?style=flat-square)](https://david-dm.org/Chicago/opengrid)[![Node.js devdependencies](https://img.shields.io/david/dev/chicago/opengrid.svg?style=flat-square)](https://david-dm.org/Chicago/opengrid#info=devDependencies&view=table)

OpenGrid an open-source, interactive map platform that allows users to explore multiple data sources in an easy-to-use interface. Developed to support situational awareness, incident monitoring and responses, historical data retrieval, and real-time advanced analytics. Users can perform advanced queries to filter data, search within custom boundaries, or based on the users location. Other GIS data, such as weather and Shapefiles can be overlaid on the map with other data. OpenGrid is natively compatible with desktops and mobile devices.

## Important Links
* User Documentation: http://opengrid.readthedocs.org
* Repository: https://github.com/Chicago/opengrid
* Planning Documentation: https://github.com/Chicago/opengrid/wiki
* Issues: https://github.com/Chicago/opengrid/issues
* Mailing List & Discussion: https://groups.google.com/forum/#!forum/opengrid-chicago

##  System Requirements <br>
Web server for deployment and Open Grid Service Package. 

**Required Software**

  * Java Script IDE
  * Node.js
  * Npm

**Browser Requirements:**

OpenGrid has been tested on IE 10+, Chrome, Firefox, and Safari on the desktop. It has also been tested on iOS using Safari and Android using the Chrome browser.

## Installation

Download OpenGrid Code:

```bash
git clone https://github.com/Chicago/opengrid.git
```

After the initial OpenGrid Code has been downloaded install the dependencies [Phantom JS](http://phantomjs.org/download.html) and [npm](https://www.npmjs.com/package/npm).

After the release package has been built deploy the files under the ./dist folder to your web server.  For complete instructions on the entire process reference the [build procedures](./Build%20Procedures/) document.

## Submit a bug

We would like to hear about any bugs or odd behavior that you uncover. Use the [issue tracker](../../../issues/) to open a new item. When describing the issue, we recommend that you discuss the following items:

  * Describe the bug
  * Describe the steps you did to discover the bug
  * What was the expected outcome of the above steps?
  * Please provide screenshots, if applicable

## How to contribute code

If you would like to contribute to this project, please see the [contributing guidelines](CONTRIBUTING.md) for the guidelines.
