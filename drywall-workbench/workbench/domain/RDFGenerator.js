var method = RDFGenerator.prototype;
var fs = require('fs');

function RDFGenerator() {

}

//execute a mapping using the RML processor
method.execute = function(input, needed) {


    console.log('NEEDED: '+needed);

    var rdf;

	//write file main directory 
	fs.writeFile('input.rml', input.data, 'utf8', (err) => {
		if(err) throw err;
		console.log('Mapping file created.')

        console.log(needed);

        for(var i = 0; i < needed.length; i++) {
            fs.writeFileSync('./' + needed[i].filename, needed.data, 'utf8');
        }

        //TODO check command

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

            fs.readFile('./output.rdf', (err, data) => { //using arrow function, this has no 'this'
                if (err) throw err;
                    rdf = {
                        mapping_id: input.id,     
                        filename: input.filename + '_result',
                        data : data,
                        metadata : 'empty',
                        type : 'rdf',
                        id : 0
                    };
                fs.unlink('./output.rdf', function (err) {
                if (err) throw err;
                });
            });
            
            fs.unlink('input.rml', function (err) {
                if (err) throw err;
            });
            for(var i = 0; i < needed.length; i++) {
                fs.unlink('./' + needed[i].filename, function (err) {
                    if (err) throw err;
                });
            }
        });
        

	});

    return rdf;


    
}


//exporting module
module.exports = RDFGenerator;