'use strict';

exports = module.exports = function(app, mongoose) {
  var licenseSchema = new mongoose.Schema({
    abbreviation: { type: String, default: '' },
    name: { type: String, default: '' },
    category: { type: String, enum: ['Standard', 'Popular', 'Special', 'International', 'Other'] }
  });
  licenseSchema.plugin(require('./plugins/pagedFind'));
  licenseSchema.index({ abbreviation: 1 });
  licenseSchema.index({ name: 1 });
  licenseSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('License', licenseSchema);
};