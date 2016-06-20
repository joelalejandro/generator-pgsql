var getScriptFileName = require('./get-script-file-name');
var glob = require('glob');
var _ = require('lodash');
var fs = require('fs');

var generators = require('yeoman-generator');

module.exports = generators.Base.extend({

  constructor: function() {
    generators.Base.apply(this, arguments);

    this.option('wipe');
  },

  _wipe: function(entityName, collection) {
    if (entityName !== undefined) {
      var file = getScriptFileName(
        this.config.get('dbname'),
        collection,
        '**',
        entityName,
        'sql'
      );
      var unlink = glob.sync(this.destinationPath(file))[0];
      if (unlink) {
        fs.unlinkSync(unlink);
        this.log('Removed ' + unlink);
      } else {
        this.log('Entity ' + entityName + ' not found.');
      }
    } else {
      this.log(_.repeat('-', 75));
      this.log('In order to use the "--wipe" flag, you must specify the name of the');
      this.log(entityName + ' that you want to delete.');
      this.log(_.repeat('-', 75));
      this.env.error('Error: --wipe action cannot be executed.')
    }
  }
});
