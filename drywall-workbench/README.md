# Drywall

A website and user system starter. Implemented with Express and Backbone.

[![Dependency Status](https://david-dm.org/jedireza/drywall.svg?theme=shields.io)](https://david-dm.org/jedireza/drywall)
[![devDependency Status](https://david-dm.org/jedireza/drywall/dev-status.svg?theme=shields.io)](https://david-dm.org/jedireza/drywall#info=devDependencies)


## Technology

Server side, Drywall is built with the [Express](http://expressjs.com/)
framework. We're using [MongoDB](http://www.mongodb.org/) as a data store.

The front-end is built with [Backbone](http://backbonejs.org/).
We're using [Grunt](http://gruntjs.com/) for the asset pipeline.

| On The Server | On The Client  | Development |
| ------------- | -------------- | ----------- |
| Express       | Bootstrap      | Grunt       |
| Jade          | Backbone.js    |             |
| Mongoose      | jQuery         |             |
| Passport      | Underscore.js  |             |
| Async         | Font-Awesome   |             |
| EmailJS       | Moment.js      |             |


## Running the app

```bash
$ npm start

```

## Features

 - Basic user management system
 - Uploading input files
 - Uploading mapping files
 - Execute mapping (the last mapping that was uploaded)
 - Publish result (Turtle) on local LDF server (running at port 5000)
 - Download result


## Questions and contributing

Any issues or questions (no matter how basic), open an issue. 

