var method = RDFGenerator.prototype;
var fs = require('fs');

function RDFGenerator() {

}

//execute a mapping using the RML processor
method.execute = function(input) {

	//write file main directory 
	fs.writeFile('input.rml', input.data, (err) => {
		if(err) throw err;
		console.log('Mapping file created.')
		//map the file
	const spawner = require('child_process');
    const spawn = spawner.exec(
        'java -jar ./workbench/domain/rdfgenerator/RML-Mapper.jar -m input.rml -o output.rdf');  
    spawn.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    spawn.stderr.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
	});



    //delete mapping file from directory
    fs.unlink(req.file.path, function (err) {
    	if (err) throw err;
    });
}


//exporting module
module.exports = RDFGenerator;