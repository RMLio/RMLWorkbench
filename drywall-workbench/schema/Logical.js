exports = module.exports = function(app, mongoose) {
  var logicalSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId },
    source: { type: mongoose.Schema.Types.ObjectId, ref: 'Description' },
    name: { type: String, default: '' },    
    type: { type: String, enum: ['file', 'DCAT', 'SPARQL', 'API', 'DB']},
    data : { type: String, default: ''},
    triples: [],
    prefixes: {},
    ugly : {type: String},
    metadata: { 
      timeCreated: { type: Date, default: Date.now },
      license: { type: String, default: 'None' }
    }
  });
  logicalSchema.plugin(require('./plugins/pagedFind'));
  logicalSchema.index({ data: 1 });
  logicalSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Logical', logicalSchema);
};