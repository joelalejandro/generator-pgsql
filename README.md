# generator-pgsql
A Yeoman generator for PostgreSQL database scripts.

## Demo workspace
Check out the `demo_database` directory! There you can see how `generator-pgsql` works.

## Workspace structure
`generator-pgsql` will create the following directory structure while working
with the different generators:

<pre><code>dbname
|__ tables
|   |__ schema1
|   |   |__ table1.sql
|   |__ table2.sql
|__ schemas
|   |__ schema1.sql
|__ views
|__ functions
|
|__ db.sql
|__ build.sql
|__ build.sh
|__ recompile.sql
|__ recompile.sh</code></pre>

## Available commands

### yo pgsql [dbname]
Creates a database script for a database named `dbname`.
This generator will prompt:

- A database name
- A username that will be the owning role
- A password (if the role doesn't exists yet)

The script is pushed into `{dbname}/db.sql`.

### yo pgsql:schema [schemaname]
Creates a schema script.
This generator will only prompt for a schema name.

The script is pushed into `{dbname}/schemas/{schemaname}.sql`.

### yo pgsql:table [tablename] [--inherits &lt;table_list&gt; | --like &lt;source_table&gt;] [--fk]
Creates a table script.

<pre><code>
yo pgsql:table [tablename]
               [--inherits &lt;table_list&gt; | --like &lt;source_table&gt;]
               [--fk]
</code></pre>

This generator will prompt:

- A table name
- Whether the table will live in a schema or not
- If the table shall be in a schema, such schema's name
- The column definition for the table (as long as the `--like` flag isn't used)
- Primary key constraint definition

The script is pushed into `{dbname}/tables/{tablename}.sql`.

#### --inherits
This flag add the `INHERITS` clause to the `CREATE TABLE` sentence. It accepts a comma-delimited list of tables.

#### --like
This flag creates a table as a duplicate (`LIKE`) of a given table. It'll skip the column definition input.

#### --fk
This flag allows to input foreign keys into the `CREATE TABLE` script.

### yo pgsql:view
Creates a view script, prompting for a view name and its schema relation.

### yo pgsql:function
Creates a function script, prompting for:

- A function name
- Whether the function will live in a schema or not
- Function parameters
- Return type
- Procedural language
- Security profile

### yo pgsql:build-script [--recompile]
Compiles all of the SQL scripts in a single `build.sql` file, in this order:

- Owning role
- Database
- Schemas
- Tables

Also, creates a `build.sh` bash script that autolocates your `psql` binary and runs the build file.

Script files are placed in the root of the database folder (`dbname/`).

#### --recompile

Instead of creating tables, it will only create views and functions in a `recompile.sql` script,
along with its `recompile.sh` bash runner.

### yo pgsql:wipe
Destroys the workspace, deleting all of the SQL scripts created.
