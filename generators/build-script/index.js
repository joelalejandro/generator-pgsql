var generators = require('yeoman-generator');
var _ = require('lodash');
var pathExists = require('path-exists');
var readDir = require('read-dir');
var readFile = require('read-file');
var chmod = require('chmod');

module.exports = generators.Base.extend({

  writing: function() {
    var template = _.template(
      this.fs.read(this.templatePath('build_script.ejs'))
    );
    var buildscriptfile = this.config.get('dbname') + '/build.sql';

    var build = {};

    build.dbname = this.config.get('dbname');
    build.username = this.config.get('username');
    build.now = new Date().toString();

    var path = {
      db: this.destinationPath(build.dbname),
      schemas: this.destinationPath(build.dbname + '/schemas'),
      tables: this.destinationPath(build.dbname + '/tables')
    };

    build.databasescript = readFile.sync(path.db + '/db.sql').toString();

    build.useschemas = pathExists.sync(path.schemas);
    build.usetables = pathExists.sync(path.tables);

    var schemafiles = build.useschemas ? readDir(path.schemas) : [];
    var tablefiles = build.usetables ? readDir(path.tables) : [];

    build.schemascripts = [];
    build.tablescripts = [];

    var builder = function(collection) {
      return function(sql, name) {
        build[collection].push({ name: name, sql: sql });
      };
    };

    _.forEach(schemafiles, builder('schemascripts'));
    _.forEach(tablefiles, builder('tablescripts'));

    this.fs.write(this.destinationPath(buildscriptfile), template(build));

    var bashscriptfile = this.config.get('dbname') + '/build.sh';

    template = _.template(this.fs.read(this.templatePath('build_runner.ejs')));

    this.fs.write(this.destinationPath(bashscriptfile), template(build));
    chmod(this.destinationPath(bashscriptfile), { execute: true });
  }
})
