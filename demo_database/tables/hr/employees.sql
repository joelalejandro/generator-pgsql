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

