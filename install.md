# Installation guide

## Technology

Server side the workbench is built with the [Express](http://expressjs.com/)
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

## Requirements

You need [Node.js](http://nodejs.org/download/) and
[MongoDB](http://www.mongodb.org/downloads) installed and running.

## Installation guide
```bash
$ cd drywall-workbench
$ npm install
$ vi ./config.js #set mongodb and email credentials
$ mongo
    > db.admingroups.insert({ _id: 'root', name: 'Root' });
    > db.admins.insert({ name: {first: 'Root', last: 'Admin', full: 'Root Admin'}, groups: ['root'] });
    > var rootAdmin = db.admins.findOne();
    > db.users.save({ username: 'root', isActive: 'yes', email: 'your@email.addy', roles: {admin: rootAdmin._id} });
    > var rootUser = db.users.findOne();
    > rootAdmin.user = { id: rootUser._id, name: rootUser.username };
    > db.admins.save(rootAdmin);
    > quit()
$ mongoimport -db drywall -collection licenses -file licenses.json
$ npm start
```

Now just use the reset password feature to set a password.

 - Go to `http://localhost:3000/login/forgot/`
 - Submit your email address and wait a second.
 - Go check your email and get the reset link.
 - `http://localhost:3000/login/reset/:email/:token/`
 - Set a new password.

