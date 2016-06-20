var printf = require('printf');
var path = require('path');
var os = require('os');
var _ = require('lodash');
var mkdirp = require('mkdirp');

var getScriptFileName = function(dbname, collection, schemaname, entityname, scripttype) {
  var pattern = '%(dbname)s/%(collection)s%(schemaname)s%(entityname)s.%(scripttype)s';
  var vars = {
    dbname: dbname,
    collection: collection !== undefined ? (collection + '/') : '',
    schemaname: schemaname !== undefined ? (schemaname + '/') : '',
    entityname: entityname,
    scripttype: scripttype
  };
  return printf(pattern, vars);
}

var getScriptFilePath = function(filename) {
  return path.dirname(filename);
}

module.exports = function(generator, settings) {
  if (!settings) {
    generator.env.error('Cannot write script file without the required parameters.');
    return;
  }

  if (!settings.databaseName) {
    settings.databaseName = generator.config.get('dbname');
  }

  if (!settings.scriptType) {
    settings.scriptType = 'sql';
  }

  var scriptFile = generator.destinationPath(getScriptFileName(
    settings.databaseName,
    settings.entityCollection,
    settings.useSchema ? settings.schemaName : undefined,
    settings.entityName,
    settings.scriptType
  ));

  var template = _.template(generator.fs.read(generator.templatePath(settings.templateName + '.ejs')));

  mkdirp(getScriptFilePath(scriptFile));

  data = generator.props;
  data.eol = os.EOL;

  generator.fs.write(scriptFile, template(data));
}
