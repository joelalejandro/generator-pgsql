module.exports = {
  entityName: function(collection, defaultValue) {
    return {
      type: 'input',
      name: collection + 'name',
      message: 'What\'s the name of the ' + collection + '?',
      default: defaultValue,
      validate: function(input) {
        if (input === '') {
          return 'A ' + collection + ' name is required';
        }

        if (input.indexOf(' ') > -1) {
          return 'A ' + collection + ' name cannot contain spaces.';
        }

        return true;
      }
    }
  },
  useSchema: function(collection) {
    return {
      type: 'confirm',
      name: 'useschema',
      message: function(response) {
        return 'Do you want "' + response[collection + 'name'] + '" to reside in a schema?';
      },
      default: false
    }
  },
  schemaName: {
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
}
