var mongoose = require('mongoose');
var fs = require('fs');

var exports = module.exports = {

    //execute a mapping using the RML processor
    execute : function(mappingfile, triples, needed, callback) {
        
        var uniq= mongoose.Types.ObjectId();
        var rdf; //storing the rdf output
        var triplenames = ''; //storing the triple names for the command parameters
        //creating triplenames
        for(var i = 0; i < triples.length; i++) {
            if(i < (triples.length - 1)) {
                triplenames += triples[i].triplename + ',';
            } else {
                triplenames += triples[i].triplename;
            }
            
        }

        //in case there are no local source files needed
        if(needed.length == 0) {
            exports.spawnRmlMapper(uniq,mappingfile.id, mappingfile.filename, mappingfile.triples.length, triplenames, needed, (result) => {
                                rdf = result;
                                callback(rdf);
                            });           
        }

    	//write file main directory 
    	fs.writeFile('input'+uniq+'.rml', mappingfile.data, 'utf8', (err) => {
    		if(err) throw err;
    		console.log('[WORKBENCH LOG] Mapping filename: ' + mappingfile.filename);

            //write source files, when last source file has been written, spawn mapper    
            var written = 0;    

            for(var i = 0; i < needed.length; i++) {
                var j = i; //async
                fs.writeFile(needed[i].filename, needed[i].data, 'utf8', (err) => {
                    
                    if(err) throw err;
                    written = written + 1;
                    if(written == needed.length) {                    
                        fs.readFile(needed[j].filename, 'utf8', (err, data) => { //using arrow function, this has no 'this'
                            
                            exports.spawnRmlMapper(uniq,mappingfile._id, mappingfile.filename, mappingfile.triples.length, triplenames, needed, (result) => {
                                rdf = result;
                                callback(rdf);
                            });
                        });
                        
                    }
                });
            }  


                
                
        });


        
    },

    spawnRmlMapper : function(uniq,id, filename, tripleamount, triplenames, needed, callback) {

            var result;
            
            
            
            console.log('[WORKBENCH LOG] Triples: ' + triplenames);

            //TODO check command --> pick triple functionality
            
            
            var command = 'java -jar ./workbench/rmlmapper/RML-Mapper.jar -m input.rml -o ./workbench/rmlmapper/output'+ uniq+'.rdf';
            if(tripleamount != triplenames) {
                command = command + ' -tm ' + triplenames;
            }
            
            //map the file
            const spawner = require('child_process');
            const spawn = spawner.exec(command);
              
            var rmlprocessoroutput = '';
            //logging
            spawn.stdout.on('data', (data) => {
                //console.log(`stdout: ${data}`);
                rmlprocessoroutput += data;    
            });
            spawn.stderr.on('data', (data) => {
                console.log(`stdout: ${data}`);
            });
            

            
            //save output.rdf and delete created files from directory
            spawn.on('close', () => {
                
                if(rmlprocessoroutput.indexOf('ERROR') > -1) {
                    console.log('[RMLPROCESSOR LOG] ERROR IN MAPPING!');
                    fs.writeFile('errormappinglog.txt', rmlprocessoroutput, 'utf8', (err) => {
                        console.log('[RMLPROCESSOR LOG] LOG WRITTEN TO "errormappinglog.txt"!');         
                    });
                    callback(null);
                } else {
                    console.log('[RMLPROCESSOR LOG] NO ERRORS IN MAPPING!');
                    fs.writeFile('mappinglog.txt', rmlprocessoroutput, 'utf8', (err) => {
                        console.log('[RMLPROCESSOR LOG] LOG WRITTEN TO "mappinglog.txt"!');         
                    });   
                    fs.readFile('./workbench/rmlmapper/output'+uniq+'.rdf', 'utf8', (err, data) => { //using arrow function, this has no 'this'
                    if (err) throw err;
                        result = {
                            mapping_id: id,     
                            filename: filename + '_result.ttl',
                            data : data,
                            metadata : 'empty',
                            type : 'rdf',
                            _id : mongoose.Types.ObjectId()
                        };
                    
                
                    fs.unlink('./workbench/rmlmapper/output'+uniq+'.rdf', function (err) {  //deleting temp files
                        if (err) throw err;
                    });

                    fs.unlink('./input'+uniq+'.rml', function (err) {     // deleting temp files
                        if (err) throw err;
                    });
                    console.log(needed);
                    for(var i = 0; i < needed.length; i++) {
                        fs.unlink(needed[i].filename, function (err) {   // deleting temp files
                            if (err) throw err;
                        });
                    }
                    
                    
                    callback(result);

                });
                }
                
                
                
        });

    }

}
