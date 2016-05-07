'use strict';

exports = module.exports = function(app, mongoose) {
  var scheduleSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String, default: '' },    
    description: { type: String, default: ''},
    req : {}, 
    metadata: { 
      timeCreated: { type: Date, default: Date.now }
    }
  });
  mappingSchema.plugin(require('./plugins/pagedFind'));
  mappingSchema.index({ filename: 1 });
  mappingSchema.index({ data: 1 });
  mappingSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('RDF', scheduleSchema);
};