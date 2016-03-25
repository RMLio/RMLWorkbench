'use strict';

exports = module.exports = function(app, mongoose) {
  var tripleSchema = new mongoose.Schema({
    _id: { type: String },
    triplename: { type: String, default: '' },    
    logicalsource : {
      rmlsource : { type: String, default: '' },
      rmlreferenceformulation : { type: String, default: '' },
      rmliterator : { type: String, default: '' },
      rrsqlversion : { type: String, default: '' },
      rrquery : { type: String, default: '' }
    }
  });
  tripleSchema.plugin(require('./plugins/pagedFind'));
  tripleSchema.index({ triplename: 1 });
  tripleSchema.index({ mapping: 1 });
  tripleSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Triple', tripleSchema);
};