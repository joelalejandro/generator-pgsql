require('module-alias/register');

var generators = require('yeoman-generator');
var _ = require('lodash');
var pathExists = require('path-exists');
var readFile = require('read-file');
var chmod = require('chmod');
var glob = require('glob');

var ifNotDatabase = require('/utils/if-not-database');

module.exports = generators.Base.extend({

  constructor: function() {
    generators.Base.apply(this, arguments);

    this.option('recompile');

    ifNotDatabase(this, this.options.recompile ? 'recompile' : 'build');
  },

  writing: function() {
    var template = _.template(
      this.fs.read(this.templatePath(
        this.options.recompile ? 'recompile_script.ejs' : 'build_script.ejs'
      ))
    );
    var buildscriptfile = this.config.get('dbname') +
      (this.options.recompile ? '/recompile.sql' : '/build.sql');
    var bashscriptfile = this.config.get('dbname') +
      (this.options.recompile ? '/recompile.sh' : '/build.sh');
    var runnertemplate = _.template(
      this.fs.read(this.templatePath(
        this.options.recompile ? 'recompile_runner.ejs' : 'build_runner.ejs'
      ))
    );

    var build = {};

    build.dbname = this.config.get('dbname');
    build.username = this.config.get('username');
    build.now = new Date().toString();

    var path = {
      db: this.destinationPath(build.dbname),
      schemas: this.destinationPath(build.dbname + '/schemas/'),
      tables: this.destinationPath(build.dbname + '/tables/'),
      functions: this.destinationPath(build.dbname + '/functions/'),
      views: this.destinationPath(build.dbname + '/views/'),
      sequences: this.destinationPath(build.dbname + '/sequences/');
    };

    build.databasescript = readFile.sync(path.db + '/db.sql').toString();

    build.useschemas = pathExists.sync(path.schemas);
    build.usetables = pathExists.sync(path.tables);
    build.usefunctions = pathExists.sync(path.functions);
    build.useviews = pathExists.sync(path.views);
    build.usesequences = pathExists.sync(path.sequences);

    var schemafiles = build.useschemas ? glob.sync(path.schemas + '**/*.sql') : [];
    var tablefiles = build.usetables ? glob.sync(path.tables + '**/*.sql') : [];
    var functionfiles = build.usefunctions ? glob.sync(path.functions + '**/*.sql') : [];
    var viewfiles = build.useviews ? glob.sync(path.views + '**/*.sql') : [];
    var sequencefiles = build.usesequences ? glob.sync(path.sequences + '**/*.sql') : [];

    build.schemascripts = [];
    build.tablescripts = [];
    build.functionscripts = [];
    build.viewscripts = [];
    build.sequencescripts = [];

    var builder = function(collection) {
      return function(name) {
        build[collection].push({ name: name, sql: readFile.sync(name).toString() });
      };
    };

    _.forEach(schemafiles, builder('schemascripts'));
    _.forEach(tablefiles, builder('tablescripts'));
    _.forEach(functionfiles, builder('functionscripts'));
    _.forEach(viewfiles, builder('viewscripts'));
    _.forEach(sequencefiles, builder('sequencescripts'));

    this.fs.write(this.destinationPath(buildscriptfile), template(build));
    this.fs.write(this.destinationPath(bashscriptfile), runnertemplate(build));

    this.bashscriptfile = this.destinationPath(bashscriptfile);
  },

  end: function() {
    chmod(this.bashscriptfile, { execute: true });
  }
})
