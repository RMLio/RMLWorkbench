var method = Mapper.prototype;
var path = require('path');

//constructor
function Mapper(location) {
    this.location = location; 
}

//execute RML-Mapper
method.execute = function(input, output, res) {    
    
    const spawner = require('child_process');
    const spawn = spawner.spawn(
        'java', ['-jar', this.location, '-m', input, '-o', output]);  
    spawn.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    spawn.on('exit', function() {        
        res.set({
            "Content-Disposition": 'attachment; filename="'+output+'"',
            "Content-Type": "text/plain"    
        });
        res.sendFile(path.join(__dirname, '/../', output));
    });    
}

module.exports = Mapper;