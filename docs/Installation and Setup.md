## Installation and Setup
Once the application sources are downloaded and built, the distributable packages can be deployed to your web server (in case of the OpenGrid user interface) and application server (service layer).

Instructions for building the release packages can be found below:
* [User Interface Build Procedures](https://github.com/Chicago/opengrid/blob/master/docs/Build%20Procedures.md)
* [Service Layer Build Procedures](https://github.com/Chicago/opengrid-svc-template/blob/master/docs/Build%20Procedures.md)

### Overview
#### Technical Requirements
* A web server for hosting User Interface application
* An Java EE application server for deploying service layer (the service template implementation has been tested with [JBoss EAP 6.2](http://www.jboss.org/products/eap/download/))
* [MongoDB version 3.0.6](https://www.mongodb.org/downloads#production) for storing data and template service layer configuration


### Installation
#### Service Layer
##### Installation and Setup
* TODO: Add steps to deploy WAR file

##### Database Configuration (MongoDB)
* TODO: add steps to import sample data into Mongo DB

#### User Interface
* Update service URL to point to service URL configured above.

After a successful build as documented on the [User Interface Build Procedures](https://github.com/Chicago/opengrid/blob/master/docs/Build%20Procedures.md), a `/dist` folder is created with the files necessary for deployment to a web server. Copy all the files from the `/dist` folder, including sub-folders, to your application's root folder on the web server. 


