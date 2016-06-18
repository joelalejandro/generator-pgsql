# generator-pgsql
A Yeoman generator for PostgreSQL database scripts.

## Available commands

### yo pgsql [dbname]
Creates a database script for a database named `dbname`.
This generator will prompt:

- A database name
- A username that will be the owning role
- A password (if the role doesn't exists yet)

### yo pgsql:table [tablename]
Creates a table script.
This generator will prompt:

- A table name
- Whether the table will live in a schema or not
- If the table shall be in a schema, such schema's name
