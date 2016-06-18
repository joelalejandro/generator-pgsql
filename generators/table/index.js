var generators = require('yeoman-generator');
var _ = require('lodash');
var mkdirp = require('mkdirp');

module.exports = generators.Base.extend({

  constructor: function() {
    generators.Base.apply(this, arguments);

    this.argument('tablename', { type: String, required: false });

    this.props = {};

    if (typeof this.config.get('dbname') === 'undefined') {
      this.log(_.repeat('-', 75));
      this.log('Apparently you have not run "yo pgsql" yet. A table script cannot');
      this.log('be created, because with no database name, such script is useless.')
      this.log(_.repeat('-', 75));
      this.env.error('Table script file cannot be created.')
    }

    if (this.tablename !== undefined) {
      this.tablename = _.snakeCase(this.tablename);
    }
  },

  prompting: function() {
    var that = this;
    return this.prompt([
      {
        type: 'input',
        name: 'tablename',
        message: 'What\'s the name of the table?',
        default: this.tablename,
        validate: function(tablename) {
          return tablename !== '' || 'A table name is required.';
        }
      },
      {
        type: 'confirm',
        name: 'useschema',
        message: function(response) {
          return 'Do you want "' + response.tablename + '" to reside in a schema?';
        },
        default: false
      },
      {
        type: 'input',
        name: 'schemaname',
        message: 'Enter the schema\'s name:',
        validate: function(schemaname) {
          return schemaname !== '' || 'A schema name is required.';
        },
        when: function(response) {
          return response.useschema;
        }
      }
    ]).then(function(props) {
      that.props = props;
      that.props.dbname = that.config.get('dbname');
    });
  },

  writing: function() {
    var tblscriptfile = this.props.dbname + '/tables/' + this.props.tablename + '.sql';
    var template = _.template(
      this.fs.read(this.templatePath('create_table.ejs'))
    );

    mkdirp(this.destinationPath(this.props.dbname + '/tables'));

    this.fs.write(this.destinationPath(tblscriptfile), template(this.props));
  }
})
