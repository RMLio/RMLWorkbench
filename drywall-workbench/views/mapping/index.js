exports.execute = function(req, res) {    
    
    const spawner = require('child_process');
    const spawn = spawner.exec(
        'java -jar ./views/mapping/RML-Mapper.jar -m ./uploads/test.rml -o output.rdf');  
    spawn.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    spawn.stderr.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    spawn.on('exit', function() {       
        res.set({
            "Content-Disposition": 'attachment; filename="'+'output.rdf'+'"',
            "Content-Type": "text/plain"    
        });
        res.sendFile(require('path').join(__dirname, '/../../', 'output.rdf'));
    });      
}
