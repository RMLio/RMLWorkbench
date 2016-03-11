'use strict';

exports.mapping = function(req, res){

    console.log(JSON.stringify(req.file));
    var fs = require('fs');
    var serverPath = '/uploads/' + req.file.originalname;
  
    fs.rename(
        req.file.path,
        '.' + serverPath,
        function(error) {
            res.contentType('text/plain');
            if(error) {
                res.send(JSON.stringify({
                    error: 'Ah crap! Something bad happened'
                }));
                return;
            }
            fs.readFile('.' + serverPath , 'utf8', function (err,data) {
              if (err) {
                return console.log(err);
              }
              res.send(JSON.stringify({
                path: serverPath,
                content: data
              }));
              console.log(data);
            });
        }
    );
};

exports.file = function(req, res){
  var fs = require('fs');
  fs.readFile('/uploads/' + req.params.file, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    
    console.log(data);
    res.send(data);
  });
  

};
