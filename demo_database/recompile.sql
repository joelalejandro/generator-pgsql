-- demo_database recompile script
-- Created with generator-pgsql
-- Recompiled date: Mon Jun 20 2016 02:33:01 GMT-0300 (ART)

--
-- Schemas
--


-- Schema: /Users/jbertoldi/dev/joel/generator-pgsql/demo_database/schemas/hr.sql
CREATE SCHEMA hr;


-- Schema: /Users/jbertoldi/dev/joel/generator-pgsql/demo_database/schemas/system_actions.sql
CREATE SCHEMA system_actions;



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


