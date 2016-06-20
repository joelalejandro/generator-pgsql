require('module-alias/register');

var generators = require('yeoman-generator');
var _ = require('lodash');
var mkdirp = require('mkdirp');

var ifNotDatabase = require('/utils/if-not-database');
var writeScript = require('/utils/write-script');
var sharedInput = require('/utils/shared-input');

module.exports = generators.Base.extend({

  constructor: function() {
    generators.Base.apply(this, arguments);

    this.argument('schemaname', { type: String, required: false });

    this.props = {};

    ifNotDatabase(this, 'schema');

    if (this.schemaname !== undefined) {
      this.schemaname = _.snakeCase(this.schemaname);
    }
  },

  prompting: function() {
    var that = this;
    return this.prompt([
      sharedInput.entityName('schema', this.schemaname),
      {
        type: 'confirm',
        name: 'restrict',
        message: 'Authorize schema to "' + this.config.get('username') + '"?',
        default: true
      }
    ]).then(function(props) {
      that.props = props;
      that.props.dbname = that.config.get('dbname');
      that.props.username = that.config.get('username');
    });
  },

  writing: function() {
    writeScript(this, {
      databaseName: this.props.dbname,
      entityCollection: 'schemas',
      entityName: this.props.schemaname,
      scriptType: 'sql',
      templateName: 'create_schema'
    });
  }
})
