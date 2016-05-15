
'use strict';

exports = module.exports = function(app, mongoose) {

  var mappingSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId },
    filename: { type: String, default: '' },    
    triples: [mongoose.modelSchemas.Triple],
    data : { type: String, default: ''},
    parsedObject : { type: Object},
    parsedContent: {type: String, default: ''},
    metadata: { 
      timeCreated: { type: Date, default: Date.now }
    }
  });

  mappingSchema.plugin(require('./plugins/pagedFind'));
  mappingSchema.index({ triples: 1 });
  mappingSchema.index({ filename: 1 });
  mappingSchema.index({ data: 1 });
  mappingSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Mapping', mappingSchema);

};