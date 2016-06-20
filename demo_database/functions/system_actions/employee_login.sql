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
