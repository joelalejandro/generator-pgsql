var generators = require('yeoman-generator');
var _ = require('lodash');
var mkdirp = require('mkdirp');
var os = require('os');

module.exports = generators.Base.extend({

  constructor: function() {
    generators.Base.apply(this, arguments);

    this.argument('tablename', { type: String, required: false });

    this.option('inherits');
    this.option('like');
    this.option('fk');

    this.props = {};

    if (typeof this.config.get('dbname') === 'undefined') {
      this.log(_.repeat('-', 75));
      this.log('Apparently you have not run "yo pgsql" yet. A table script cannot');
      this.log('be created, because with no database name, such script is useless.')
      this.log(_.repeat('-', 75));
      this.env.error('Table script file cannot be created.')
    }

    if (this.options.inherits && this.options.like) {
      this.env.error('You cannot use both --inherits and --like for CREATE TABLE.');
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
          if (tablename === '') {
            return 'A table name is required';
          }

          if (tablename.indexOf(' ') > -1) {
            return 'A table name cannot contain spaces.';
          }

          return true;
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
      that.props.columns = [];
      if (that.options.fk) {
        that.props.foreignkeys = [];
      }
    }).then(function() {
      if (!that.options.like) {
        that.log('');
        that.log('You will now define the columns of this table. Once you are done, '
          + 'simply press ENTER without entering a column name.');
        that.log('');
      }
    });
  },

  askColumn: function(cb) {
    if (!this.options.like) {
      var that = this;

      cb = cb || this.async();

      return this.prompt([{
        type: 'input',
        name: 'column',
        message: 'Add a column with its data type:'
      }]).then(function(props) {
        if (props.column !== '') {
          that.props.columns.push(props.column);
          that.askColumn(cb);
        } else {
          cb();
        }
      });
    }
  },

  askInheritance: function() {
    var that = this;
    if (this.options.inherits && !this.options.like) {
      this.log('');
      return this.prompt([{
        type: 'input',
        name: 'inherits',
        message: function(response) {
          return 'From which table(s) must "' + that.props.tablename + '" inherit?';
        },
        default: typeof this.options.inherits === 'string' ? this.options.inherits : undefined,
        validate: function(inherits) {
          return inherits !== '' || 'A table or list of tables must be provided.';
        }
      }]).then(function(props) {
        that.props.inherits = props.inherits;
      });
    }
  },

  askLike: function() {
    var that = this;
    if (this.options.like && !this.options.inherits) {
      this.log('');
      return this.prompt([{
        type: 'input',
        name: 'like',
        message: function(response) {
          return 'To which table is "' + that.props.tablename + '" like?';
        },
        default: typeof this.options.like === 'string' ? this.options.like : undefined,
        validate: function(like) {
          return like !== '' || 'A table name must be provided.';
        }º
      }]).then(function(props) {
        that.props.like = props.like;
      });
    }
  },

  askPrimaryKey: function() {
    var that = this;
    this.log('');
    return this.prompt([
      {
        type: 'input',
        name: 'pkcolumns',
        message: 'Which column(s) conform the primary key?',
        validate: function(pkcolumns) {
          var columns = that.props.columns;
          return pkcolumns.replace(/ /g, '').split(',').every(function(pk) {
            return columns.join(',').indexOf(pk) > -1;
          }) || 'Primary key must contain columns defined in the table.';
        },
      },
      {
        type: 'input',
        name: 'pkname',
        message: 'What is the PK constraint name?',
        default: 'pk_' + that.props.tablename
      }
    ]).then(function(props) {
      that.props.pkname = props.pkname;
      that.props.pkcolumns = props.pkcolumns;
    });
  },

  askForeignKey: function(cb) {
    var that = this;

    cb = cb || this.async();

    this.log('');

    if (this.options.fk) {
      return this.prompt([
        {
          type: 'input',
          name: 'fksource',
          message: 'Which are this foreign key\'s referencing columns?',
          validate: function(pkcolumns) {
            var columns = that.props.columns;
            return pkcolumns.replace(/ /g, '').split(',').every(function(pk) {
              return columns.join(',').indexOf(pk) > -1;
            }) || 'Foreign key must contain columns defined in the table.';
          }
        },
        {
          type: 'input',
          name: 'fktable',
          message: 'In which table are this foreign key\'s referenced columns?'
        },
        {
          type: 'input',
          name: 'fkdestination',
          message: 'Which are this foreign key\'s referenced columns?'
        },
        {
          type: 'input',
          name: 'fkname',
          message: 'What is the name of this foreign key?',
          default: function(response) {
            return 'fk_' + that.props.tablename + '_' + response.fktable;
          }
        },
        {
          type: 'confirm',
          name: 'anotherfk',
          message: 'Add another foreign key?',
          default: false
        }
      ]).then(function(props) {
        that.props.foreignkeys.push({
          name: props.fkname,
          table: props.fktable,
          sourcecolumns: props.fksource.replace(/ /g, '').split(','),
          destinationcolumns: props.fkdestination.replace(/ /g, '').split(',')
        });
        if (props.anotherfk) {
          that.askForeignKey(cb);
        } else {
          cb();
        }
      });
    }
  },

  writing: function() {
    var tblscriptfile = this.props.dbname + '/tables/' + this.props.tablename + '.sql';
    var template = _.template(
      this.fs.read(this.templatePath('create_table.ejs'))
    );

    mkdirp(this.destinationPath(this.props.dbname + '/tables'));

    this.props.eol = os.EOL;

    this.fs.write(this.destinationPath(tblscriptfile), template(this.props));
  }
})
