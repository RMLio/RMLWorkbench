var method = RDFGenerator.prototype;
var fs = require('fs');

function RDFGenerator() {
}

//execute a mapping using the RML processor
method.execute = function(input, needed, callback) {


    var rdf; //storing the rdf output

	//write file main directory 
	fs.writeFile('input.rml', input.data, 'utf8', (err) => {
		if(err) throw err;
		console.log('Mapping file created.')

        //write source files, when last source file has been written, spawn mapper    
        var written = 0;    

        for(var i = 0; i < needed.length; i++) {
            var j = i; //async
            fs.writeFile(needed[i].filename, needed[i].data, 'utf8', (err) => {
                
                if(err) throw err;
                written = written + 1;
                if(written == needed.length) {                    
                    fs.readFile(needed[j].filename, 'utf8', (err, data) => { //using arrow function, this has no 'this'
                        console.log("source");
                        console.log(data);
                        method.spawnRmlMapper(input.id, input.filename, needed, (result) => {
                            rdf = result;
                            callback(rdf);
                        });
                    });
                    
                }
            });
        }   
            
            
    });


    
}

method.spawnRmlMapper = function(id, filename, needed, callback) {

        var result;

        //TODO check command --> pick triple functionality

        //map the file
        const spawner = require('child_process');
        const spawn = spawner.exec(
        'java -jar ./workbench/domain/rdfgenerator/RML-Mapper.jar -m input.rml -o output.rdf');  
        
        //logging
        spawn.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
        spawn.stderr.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        //save output.rdf and delete created files from directory
        spawn.on('close', () => {

            fs.readFile('./output.rdf', 'utf8', (err, data) => { //using arrow function, this has no 'this'
                if (err) throw err;
                    result = {
                        mapping_id: id,     
                        filename: filename + '_result',
                        data : data,
                        metadata : 'empty',
                        type : 'rdf',
                        id : 0
                    };

                
            
                fs.unlink('./output.rdf', function (err) {  //deleting temp files
                    if (err) throw err;
                });

                fs.unlink('input.rml', function (err) {     // deleting temp files
                    if (err) throw err;
                });
                for(var i = 0; i < needed.length; i++) {
                    fs.unlink('./' + needed[i].filename, function (err) {   // deleting temp files
                        if (err) throw err;
                    });
                }
                
                
                callback(result);

            });
    });

}


//exporting module
module.exports = RDFGenerator;