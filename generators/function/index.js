require('module-alias/register');

var generators = require('yeoman-generator');
var _ = require('lodash');
var mkdirp = require('mkdirp');
var os = require('os');

var ifNotDatabase = require('/utils/if-not-database');
var writeScript = require('/utils/write-script');
var sharedInput = require('/utils/shared-input');

module.exports = generators.Base.extend({

  constructor: function() {
    generators.Base.apply(this, arguments);

    this.argument('functionname', { type: String, required: false });

    this.props = {};

    ifNotDatabase(this, 'function');

    if (this.functionname !== undefined) {
      this.functionname = _.snakeCase(this.functionname);
    }
  },

  prompting: function() {
    return this._askFunctionData();
  },

  _askFunctionData: function() {
    var that = this;
    return this.prompt([
      sharedInput.entityName('function', this.functionname),
      sharedInput.useSchema('function'),
      sharedInput.schemaName
    ]).then(function(props) {
      that.props.functionname = props.functionname;
      that.props.useschema = props.useschema;
      that.props.schemaname = props.schemaname;
      that.props.parameters = [];

      that.log('');
      that.log('You will now define the function\'s parameters. When you are ready,');
      that.log('simply press ENTER without typing a parameter definition.');
      that.log('');

      return that._askParameter();
    });
  },

  _askParameter: function(cb) {
    var that = this;
    cb = cb || this.async();

    return this.prompt([{
      type: 'input',
      name: 'parameter',
      message: 'Add a parameter with its direction and data type:'
    }]).then(function(props) {
      if (props.parameter !== '') {
        that.props.parameters.push(props.parameter);
        return that._askParameter(cb);
      } else {
        return that._askReturn();
      }
    });
  },

  _askReturn: function() {
    var that = this;
    return this.prompt([{
      type: 'confirm',
      name: 'usereturn',
      message: 'Do you want to return a value from this function?',
      default: false
    }, {
      type: 'input',
      name: 'returns',
      message: 'Enter the return type:',
      when: function(response) {
        return response.usereturn;
      }
    }]).then(function(props) {
      that.props.returns = props.usereturn ? props.returns : false;
      return that._askLanguage();
    });
  },

  _askLanguage: function() {
    var that = this;
    return this.prompt([{
      type: 'list',
      name: 'language',
      message: 'In which language will you write the code for the function?',
      choices: [{
        name: "PL/pgSQL",
        value: "plpgsql"
      }, {
        name: "PL/Tcl",
        value: "pltcl"
      }, {
        name: "PL/Perl",
        value: "plperl"
      }, {
        name: "PL/Python",
        value: "plpython"
      }, {
        name: "Other (custom)",
        value: "custom"
      }]
    }, {
      type: 'input',
      name: 'languagecustom',
      message: 'Enter the language name which you will use:',
      validate: function(languagecustom) {
        return languagecustom !== '' || 'A language must be specified.';
      },
      when: function(response) {
        return response.language === 'custom';
      }
    }]).then(function(props) {
      that.props.language = props.language === 'custom' ? props.languagecustom : props.language;
      return that._askSecurity();
    })
  },

  _askSecurity: function() {
    var that = this;
    return this.prompt([{
      type: 'list',
      name: 'security',
      message: 'Which security profile shall this function use?',
      choices: ['INVOKER', 'DEFINER']
    }]).then(function(props) {
      that.props.security = props.security;
    })
  },

  writing: function() {
    writeScript(this, {
      databaseName: this.props.dbname,
      entityCollection: 'functions',
      useSchema: this.props.useschema,
      schemaName: this.props.schemaname,
      entityName: this.props.functionname,
      scriptType: 'sql',
      templateName: 'create_function'
    });
  }
})
