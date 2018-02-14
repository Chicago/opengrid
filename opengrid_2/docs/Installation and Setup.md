## Installation and Setup
Once the application sources are downloaded and built, the distributable packages can be deployed to your web server (in case of the OpenGrid user interface) and application server (service layer).

Instructions for building the release packages can be found below:
<ul>
<li>
<a href="https://github.com/Chicago/opengrid/blob/master/docs/Build%20Procedures.md"> User Interface Build Procedures</a>
</li>
<li>
<a href="https://github.com/Chicago/opengrid-svc-template/blob/master/docs/Build%20Procedures.md">Service Layer Build Procedures</a>
</li>
</ul>

### Overview
#### Technical Requirements
* A web server for hosting User Interface application
* An Java EE application server for deploying service layer (the service template implementation has been tested with [JBoss EAP 6.2](http://www.jboss.org/products/eap/download/))
* [MongoDB version 3.0.6](https://www.mongodb.org/downloads#production) for storing data and template service layer configuration


### Installation
#### Service Layer
##### Database Configuration (MongoDB)
* The OpenGrid Service Layer template implementation utilizes a MongoDB instance to store and retrieve test datasets. Two sample datasets are made available by the service: tweets and weather. Assuming that a  MongoDB instance is already installed, import the test data by running the mongoimport utility for each json file similar to below:

```
mongoimport --host <mongodb hostname> --port <port #> --username <userid> --password <password> --collection <target collection name> --db <dbname> --file <file location>
```

The json files to import can be found in ./opengridservice/src/test/data folder under the opengrid-svc-template project. Use the first part of the the json file name as the target collection name.

For example to import the opengrid_users collection, you can run the following:
```
mongoimport --host <mongodb hostname> --port <port #> --username <userid> --password <password> --collection opengrid_users --db <dbname> --file ./test/data/opengrid_users.json
```

By default, an admin user is created with user id 'admin' and password 'admin123'.

##### Installation and Setup
* Follow the steps described in the Service Layer Build Procedures above making sure that the application.properties file is updated with the appropriate MongoDB connection string. A war file is generated after the build process which can be deployed to an application server of your choice.

#### User Interface
* Configure various application settings as required by your application by editing `src/js/custom/Config.js`. The settings include session timeout, area to limit address quick searches, to name a few. See [OpenGrid Configuration](./OpenGrid%20Configuration/) for more details
* Update service URL to point to service URL configured above by editing `config/EnvSettings.js`. `EnvSettings.js` is meant to contain settings that are environment-specific e.g. Dev, Qa or Production, etc. and overrides any settings as specified in `Config.js` mentioned above.

After a successful build as documented on the [User Interface Build Procedures](./Build%20Procedures/), a `/dist` folder is created with the files necessary for deployment to a web server. Copy all the files from the `/dist` folder, including sub-folders, to your application's root folder on the web server. 


