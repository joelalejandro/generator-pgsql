require('module-alias/register');

var generators = require('yeoman-generator');
var _ = require('lodash');
var mkdirp = require('mkdirp');

var ifNotDatabase = require('/utils/if-not-database');
var writeScript = require('/utils/write-script');
var sharedInput = require('/utils/shared-input');
var wipeableGenerator = require('/utils/wipeable-generator');

module.exports = wipeableGenerator.extend({

  constructor: function() {
    generators.Base.apply(this, arguments);

    this.argument('viewname', { type: String, required: false });

    this.props = {};

    ifNotDatabase(this, 'view');

    if (this.viewname !== undefined) {
      this.viewname = _.snakeCase(this.viewname);
    }
  },

  prompting: function() {
    if (!this.options.wipe) {
      var that = this;
      return this.prompt([
        sharedInput.entityName('view', this.viewname),
        sharedInput.useSchema('view'),
        sharedInput.schemaName
      ]).then(function(props) {
        that.props = props;
      });
    }
  },

  writing: function() {
    if (this.options.wipe) {
      this._wipe(this.viewname, 'views');
    } else {
      writeScript(this, {
        databaseName: this.props.dbname,
        entityCollection: 'views',
        useSchema: this.props.useschema,
        schemaName: this.props.schemaname,
        entityName: this.props.viewname,
        scriptType: 'sql',
        templateName: 'create_view'
      });
    }
  }
});
