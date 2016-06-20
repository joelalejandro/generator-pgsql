var generators = require('yeoman-generator');
var _ = require('lodash');
var mkdirp = require('mkdirp');

module.exports = generators.Base.extend({

  constructor: function() {
    generators.Base.apply(this, arguments);

    this.argument('viewname', { type: String, required: false });

    this.props = {};

    if (typeof this.config.get('dbname') === 'undefined') {
      this.log(_.repeat('-', 75));
      this.log('Apparently you have not run "yo pgsql" yet. A view script cannot');
      this.log('be created, because with no database name, such script is useless.')
      this.log(_.repeat('-', 75));
      this.env.error('View script file cannot be created.')
    } else {
      this.props.dbname = this.config.get('dbname');
    }

    if (this.viewname !== undefined) {
      this.viewname = _.snakeCase(this.viewname);
    }
  },

  prompting: function() {
    var that = this;
    return this.prompt([
      {
        type: 'input',
        name: 'viewname',
        message: 'What\'s the name of the view?',
        default: this.viewname,
        validate: function(viewname) {
          if (viewname === '') {
            return 'A view name is required';
          }

          if (viewname.indexOf(' ') > -1) {
            return 'A view name cannot contain spaces.';
          }

          return true;
        }
      },
      {
        type: 'confirm',
        name: 'useschema',
        message: function(response) {
          return 'Do you want "' + response.viewname + '" to reside in a schema?';
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
      that.props.viewname = props.viewname;
      that.props.useschema = props.useschema;
      that.props.schemaname = props.schemaname;
    });
  },

  writing: function() {
    var viewscriptfile = this.props.dbname + '/views/'
                       + (this.props.useschema ? (this.props.schemaname + '/') : '')
                       + this.props.viewname + '.sql';

    var template = _.template(
      this.fs.read(this.templatePath('create_view.ejs'))
    );

    mkdirp(this.destinationPath(this.props.dbname + '/views/'
                       + (this.props.useschema ? (this.props.schemaname + '/') : '')));

    this.fs.write(this.destinationPath(viewscriptfile), template(this.props));
  }
});
