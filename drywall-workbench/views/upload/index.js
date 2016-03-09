'use strict';

exports.mapping = function(req, res){

    console.log(JSON.stringify(req.file));

    var serverPath = '/images/' + req.file.mappingUpload.name;

    require('fs').rename(
        req.files.userPhoto.path,
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
