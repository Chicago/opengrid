# OpenGrid <br>
[![Build Status](https://magnum.travis-ci.com/Chicago/opengrid.svg?token=SysBhDyYWJMYLus2d27y&branch=master)](https://magnum.travis-ci.com/Chicago/opengrid)

<p>Open Grid is an enterprise geographical information system. Developed to support situational awareness, incident monitoring and responses, historical data retrieval, and real-time advanced analytics. Open Grid architecture supports big data functionality using operational systems to handled big spatially enabled data. It performs integrated mapping and spatial analysis based off query and data flow of collective information to identify potential trends or significant variance between expected and actual values.</p>

#  System Requirements <br>
Web server for deployment and Open Grid Service Package. 

<b>For Development/Customization:</b><br>
Java Script IDE<br>
Node.js<br>
Npm

<b>Browser Requirements:</b><br>
IE10+<br>
Chrome<br> 
Firefox<br>
Safari

# Installation<br>
Download OpenGrid Code:<br>
<pre>git clone https://github.com/Chicago/opengrid.git</pre>

After the initiate OpenGrid Code has been downloaded install the dependencies [Phantom JS](http://phantomjs.org/download.html) and [npm](https://www.npmjs.com/package/npm).

After the release package has been built deploy the files under the ./dist folder to your web server.  For complete instructions on the entire process reference the [build procedures](https://github.com/Chicago/opengrid/wiki/Build-Procedures) section.

# How to contribute coding
Potential contributors are free to add to the project, provided you can convince the team that it embodies or utilized the well-being of the project. Consider some of these attributes before submission or contribution: fork and cloning, creating an issue and committing. Please see the [contributing guidelines](https://github.com/Chicago/opengrid/blob/master/Contribute.md) for complete details.

# <font color="blue"> OpenGrid Quick Javascript Coding Guidline:</font>
- Use jQuery’s proxy method if you want to maintain the “this” context on your event handler
- Use jQuery’s extend method to mix-in property values of 2 objects
- Prefix private methods with “_” (underscore) e.g. _myPrivateMethod
- Prefer multiple shorter methods than 1 long method. Makes code self-documenting
- Enclose method/function code in try-catch block when you are expecting something to go wrong within the block, unless expectation is set that the caller (one which calls this function) will need to handle generated exceptions (you want the exception to be bubbled up to the caller so it can deal with it accordingly i.e. clean up, conditionals, etc.) 
- Use K&R (Kerrigan & Ritchie ‘C’ language) convention when using begin/end curly brackets.
- When creating a new class, copy src/js/core/Empty.js into your own file, renaming appropriately. On your new class file, customize the template content with your specific class name, constructor parameters, description, etc.
- Use ogrid.Util static functions where applicable. Commonly used ones are isNull, guid and error.
- When creating a new class, copy and paste from core/Empty.js then customize class definition.
- Use ogrid.Alert static methods for any notification needs i.e. showing error/informational messages, busy message, system modal message box, etc.
- When applicable, use an _options private variable to pass user options to a class’s constructor (init method). This _options attribute can have default values, then mixed in using jQuery extend with the options passed to the constructor. 

#### <p><b>Other references :</b></p>
- https://github.com/airbnb/javascript - Take note that some of the guidelines do not apply to ECMAScript 5.1 which we used for OpenGrid.
