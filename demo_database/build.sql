-- demo_database build script
-- Created with generator-pgsql
-- Build date: Mon Jun 20 2016 02:32:29 GMT-0300 (ART)

--
-- Database
--
CREATE USER IF NOT EXISTS dbo_demo_database WITH PASSWORD 'demodemo';

CREATE DATABASE IF NOT EXISTS demo_database WITH OWNER = dbo_demo_database;


--
-- Schemas
--


-- Schema: /Users/jbertoldi/dev/joel/generator-pgsql/demo_database/schemas/hr.sql
CREATE SCHEMA hr;


-- Schema: /Users/jbertoldi/dev/joel/generator-pgsql/demo_database/schemas/system_actions.sql
CREATE SCHEMA system_actions;



--
-- Table creation
--


-- Table: /Users/jbertoldi/dev/joel/generator-pgsql/demo_database/tables/hr/departments.sql
CREATE TABLE IF NOT EXISTS hr.departments

(
  department_id number,
  name varchar(100),
  CONSTRAINT pk_departments PRIMARY KEY (department_id)
)


;



-- Table: /Users/jbertoldi/dev/joel/generator-pgsql/demo_database/tables/hr/employees.sql
CREATE TABLE IF NOT EXISTS hr.employees

(
  employee_id number,
  first_name varchar(30),
  last_name varchar(30),
  department_id number,
  CONSTRAINT pk_employees PRIMARY KEY (employee_id)
)


;

ALTER TABLE hr.employees
ADD CONSTRAINT fk_employees_departments (department_id)
REFERENCES hr.departments (department_id);




--
-- View creation
--


-- View: /Users/jbertoldi/dev/joel/generator-pgsql/demo_database/views/hr/employees_by_department.sql
-- @schema hr
CREATE OR REPLACE VIEW hr.employees_by_department AS

/* Write your query here. */

;



--
-- Function creation
--


-- Function: /Users/jbertoldi/dev/joel/generator-pgsql/demo_database/functions/system_actions/employee_login.sql
-- @schema system_actions
CREATE OR REPLACE FUNCTION system_actions.employee_login
(
in employee_id number
)
RETURNS boolean
AS $$

--
-- Write your function code here.
--

$$
LANGUAGE plpgsql
SECURITY INVOKER;


