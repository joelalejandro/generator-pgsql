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

    this.argument('sequencename', { type: String, required: false });

    this.props = {};

    ifNotDatabase(this, 'sequence');

    if (this.sequencename !== undefined) {
      this.sequencename = _.snakeCase(this.sequencename);
    }
  },

  prompting: function() {
    var that = this;
    return this.prompt([
      sharedInput.entityName('sequence', this.sequencename),
      sharedInput.useSchema('sequence'),
      sharedInput.schemaName,
      {
        type: 'input',
        name: 'increment',
        message: 'Enter the increment step for the sequence:',
        validate: function(input) {
          return (!isNaN(input) && Math.ceil(input) === input)
            || 'Step must be an integer number.';
        },
        default: 1
      },
      {
        type: 'input',
        name: 'min',
        message: 'Enter the sequence\'s minimum value or leave empty for no minimum:',
        default: function(response) {
          return response.increment;
        }
      },
      {
        type: 'input',
        name: 'max',
        message: 'Enter the sequence\'s maximum value or leave empty for no maximum:'
      },
      {
        type: 'confirm',
        name: 'owned',
        message: 'Is this sequence owned by a table column?',
        default: false
      },
      {
        type: 'input',
        name: 'table',
        message: 'Enter the name of the column (schema.table.column):',
        when: function(response) { return response.owned; }
      }
    ]).then(function(props) {
      that.props = props;
    });
  },

  writing: function() {
    writeScript(this, {
      databaseName: this.props.dbname,
      entityCollection: 'sequences',
      useSchema: this.props.useschema,
      schemaName: this.props.schemaname,
      entityName: this.props.sequencename,
      scriptType: 'sql',
      templateName: 'create_sequence'
    });
  }
});
