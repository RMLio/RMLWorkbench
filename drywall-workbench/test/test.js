var app  = require('../app.js');
var port = 3000;
var sessionCookies;
var http = require('http');
var expect = require("chai").expect;
var csrftoken;

describe('app', function () {

  it('should exist', function (done) {
    expect(app).to.exist;
    done();
  });

  it('should be listening at localhost:3000', function (done) {
    var headers = defaultGetOptions('/');
    http.get(headers, function (res) {  
      console.log(res.cookies);
      sessionCookies = res.headers['set-cookie'];
      csrftoken = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);  
      console.log(sessionCookies);  
      console.log(res.statusCode);
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('should authenticate a user', function (done) {
  var qstring = JSON.stringify({
    username: "root",
    password: "root"
  });
  var options = defaultPostOptions('/login', qstring);
  var req = http.request(options, function (res) {
    var csrftoken = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);
    var authAttributes = { _csrf: csrftoken, email: userAttributes.email, password: 'password' }
    res.ond('data', function (d) {
      var body = JSON.parse(d.toString('utf8'));
      console.log(body);
      console.log(res.statusCode);
      done();
    });
  });
  req.cookies = sessionCookies;
  req.write(qstring);
  req.end();
});

});

var defaultPostOptions = function(path) {
  var options = {
    "host": "localhost",
    "port": port,
    "path": path,
    "method": "POST",
  };
  return options;
}

var defaultGetOptions = function(path) {
  var options = {
    "host": "localhost",
    "port": port,
    "path": path,
    "method": "GET",
  };
  return options;
}