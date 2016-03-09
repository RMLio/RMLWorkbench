'use strict';

exports.mapping = function(req, res){

    console.log(JSON.stringify(req.file));

    var serverPath = '/uploads/' + req.file.originalname;

    require('fs').rename(
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
            
            res.send(JSON.stringify({
                path: serverPath
            }));
        }
    );
  console.log(req.files);
};
