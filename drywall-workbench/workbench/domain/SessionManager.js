var FetchManager = require('./FetchManager');
var MappingManager = require('./MappingManager');
var ScheduleManager = require('./ScheduleManager');
var schedule = require('node-schedule');
const chalk = require('chalk');
var method = SessionManager.prototype;

//this class represents a single workbench session
function SessionManager() {
    this._mappingManager = new MappingManager();
    this._fetchManager = new FetchManager();
    this._scheduleManager = new ScheduleManager();
    //everything is loaded in memory for now
    this._inputPool = [];
    this._mappingPool = [];
    this._publishPool = [];
    this._total = 0;
}


//fetch a mapping
method.fetchMapping = function(req, res) {
  this._total = this._total+1;
  var mapping = this._fetchManager.uploadMapping(req.file, (mapping) => {
      //TODO proper id generating
      mapping.id = this._total;
      console.log(chalk.green('[WORKBENCH LOG]') + ' Mapping added: "'+mapping.filename+'"');   
      this._mappingPool.push(mapping);
   });

  res.send();
};

//fetch a source
method.fetchInput = function(req, res) {
      this._total = this._total+1;
  		var input = this._fetchManager.uploadInput(req.file, (input) => {
        //TODO proper id generating
  		  input.id = this._total;
        console.log(chalk.green('[WORKBENCH LOG]') + 'Input added: "'+input.filename+'"');
        this._inputPool.push(input);
      });

  res.send();
};

//fetch a rdf
method.fetchRDF = function(req, res) {
      this._total = this._total+1;
  		var rdf = _fetchManager.uploadRDF(req.file, (rdf) => {
        //TODO proper id generating
        rdf.id = this._total;
        console.log(chalk.green('[WORKBENCH LOG]') + 'RDF added: "'+rdf.filename+'"');
        this._publishPool.push(rdf);
      });
      res.send();
};

//generate an rdf, mapping id is needed as param
method.generateRDFfromFile = function(req, res) {
  var mapping_id = req.params.mapping_id;
  var mappings = this._mappingPool;
  var mapping = method.findMapping(mapping_id, mappings);
  var sources = this._inputPool;
  var rdf = this._mappingManager.generateRDFfromFile(mapping, sources, (rdf) => {
    this._total = this._total+1;
    rdf.id = this._total;
    this._publishPool.push(rdf);
  });  
  res.send();
} 


//real method
method.generateRDFfromTriples = function(id, triples) {
  var mapping_id = req.params.mapping_id;
  var mappings = this._mappingPool;
  var mapping = method.findMapping(mapping_id, this._mappingPool);
  var sources = this._inputPool;
  var rdf = this._mappingManager.generateRDFfromTriples(mapping, req.body, sources, (rdf) => {
    this._total = this._total+1;
    rdf.id = this._total;
    this._publishPool.push(rdf);
  });
}


/**
* Scheduling method
**/

method.addToSchedule = function(req, res) {

  console.log("[WORKBENCH LOG] Adding job!");
  var year = req.body.date.year;
  var month = req.body.date.month;
  var day = req.body.date.day;
  var hour = req.body.date.hour;
  var minute = req.body.date.minute;
  var date = new Date(year, month, day, hour, minute);

  //variables for uploading
  var inputForUpload = req.body.upload.inputs;
  var mappingForUpload = req.body.upload.mappings;
  var rdfForUpload = req.body.upload.rdf;

  //variables for mapping
  var mappingsFromTriples = req.body.mappingsFromTriples;
  var mappingsFromFile = req.body.mappingsFromFile;
  var sources = this._inputPool;
  var amountofjobs = mappingsFromTriples.length + mappingsFromFile.length;
  var jobsdone = 0;

  //schedule the job with date
  schedule.scheduleJob(date, () => {

    console.log("[WORKBENCH LOG] Executing jobs!")

    executemappings();    

  }); 

  /**
  * Schedule utility functions
  **/

  var uploadfiles = (callback) => {
    for(var i = 0; i < inputForUpload.length; i++) {
      
    }
    for(var i = 0; i < mappingForUpload.length; i++) {
      //if mapping needs to be mapped too => declared in executed
    }
    for(var i = 0; i < rdfForUpload.length; i++) {
      //if rdf needs to be published too => declared in published
    }
  }

  var executemappings = () => {
    console.log("[WORKBENCH LOG] Execute mappings from file...")

    //execute scheduled mappings from file
    for(var i = 0; i < mappingsFromFile.length; i++) {
      var mappings = this._mappingPool;
      var mapping = method.findMapping(mappingsFromFile[i].id, mappings);
      this._mappingManager.generateRDFfromFile(mapping, sources, (rdf) => {
        this._total = this._total+1;
        rdf.id = this._total;
        this._publishPool.push(rdf);

        //checking if all jobs are done
        jobsdone++;
        if(jobsdone == amountofjobs) {
          console.log("[WORKBENCH LOG] Jobs done!")
        }
      });
    }

    console.log("[WORKBENCH LOG] Execute mappings from triples...")

    //execute scheduled mappings from triples
    for(var i = 0; i < mappingsFromTriples.length; i++) {
      var mappings = this._mappingPool;
      mapping = method.findMapping(mappingsFromTriples[i].id, mappings);
      console.log(mapping);
      console.log(mappingsFromTriples[i])
      this._mappingManager.generateRDFfromTriples(mapping, mappingsFromTriples[i].triples, sources, (rdf) => {
        this._total = this._total+1;
        rdf.id = this._total;
        this._publishPool.push(rdf);

        //checking if all jobs are done
        jobsdone++;
        if(jobsdone == amountofjobs) {
          console.log("[WORKBENCH LOG] Jobs done!")
        }
      });
    }
  };
  
  res.send();
}

/**
* Getters
**/

method.getInputs = function(req, res) {
  console.log('[WORKBENCH LOG] Get inputs');
  res.send(this._inputPool);
};

method.getMappings = function(req, res) {
  console.log('[WORKBENCH LOG] Get mappings');
  res.send(this._mappingPool);
};

method.getRdf = function(req, res) {
  console.log('[WORKBENCH LOG] Get rdf');
  res.send(this._publishPool);
};

method.addInputSchedule = function(req, res) {
	//TODO
	console.log('[WORKBENCH LOG] Add Input Schedule');
};

method.addMappingSchedule = function(req, res) {
	//TODO
	console.log('[WORKBENCH LOG] Add Mapping Schedule');
};

method.addPublishSchedule = function(req, res) {
	//TODO
	console.log('[WORKBENCH LOG] Add Publish Schedule');
};

/*
* Utility functions
*/

//find mapping by id
method.findMapping = function(id, data) {
  for(var i = 0; i < data.length; i++) {
    if(data[i].id == id) {
      return data[i];
    }
  }
};



//exporting module
module.exports = SessionManager;