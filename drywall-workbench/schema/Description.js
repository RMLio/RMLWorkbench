exports = module.exports = function(app, mongoose) {
  var mappingSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String, default: '' },    
    type: { type: String, default: ''},
    prefix: { type: String, default: ''},
    data : { type: String, default: ''},
    metadata: { 
      timeCreated: { type: Date, default: Date.now },
      license: { type: String, default: 'None' }
    }
  });
  mappingSchema.plugin(require('./plugins/pagedFind'));
  mappingSchema.index({ data: 1 });
  mappingSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Description', mappingSchema);
};