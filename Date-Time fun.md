# MySQL Functions Complete Reference Handbook

---

**Version:** MySQL 8.0+
**Edition:** Professional Reference
**Coverage:** All Built-In Functions, Stored Procedures & UDFs

---

## TABLE OF CONTENTS

1. [Date and Time Functions](#1-date-and-time-functions)
2. [String Functions](#2-string-functions)
3. [Numeric and Mathematical Functions](#3-numeric-and-mathematical-functions)
4. [Aggregate Functions](#4-aggregate-functions)
5. [Control Flow Functions](#5-control-flow-functions)
6. [Stored Procedures and UDFs](#6-stored-procedures-and-udfs)
7. [System and Utility Functions](#7-system-and-utility-functions)
8. [Common Mistakes and Edge Cases](#8-common-mistakes-and-edge-cases)

---

# 1. DATE AND TIME FUNCTIONS

MySQL provides a rich set of date and time functions. Dates are stored in `YYYY-MM-DD` format and times in `HH:MM:SS` format. These functions operate on DATE, TIME, DATETIME, and TIMESTAMP data types.

---

## 1.1 Functions That Return the Current Date or Time

| Function | Return Type | Description |
|---|---|---|
| `NOW()` | DATETIME | Current date and time |
| `CURDATE()` | DATE | Current date only |
| `CURTIME()` | TIME | Current time only |
| `CURRENT_DATE` | DATE | Synonym for CURDATE() |
| `CURRENT_TIME` | TIME | Synonym for CURTIME() |
| `CURRENT_TIMESTAMP` | DATETIME | Synonym for NOW() |
| `LOCALTIME()` | DATETIME | Synonym for NOW() |
| `LOCALTIMESTAMP()` | DATETIME | Synonym for NOW() |
| `SYSDATE()` | DATETIME | Time at moment of function execution |
| `UTC_DATE()` | DATE | Current UTC date |
| `UTC_TIME()` | TIME | Current UTC time |
| `UTC_TIMESTAMP()` | DATETIME | Current UTC date and time |
| `UNIX_TIMESTAMP()` | BIGINT | Seconds since 1970-01-01 00:00:00 UTC |

### NOW()

**Syntax:** `NOW([fsp])`
**Parameters:** `fsp` – optional fractional seconds precision (0–6)
**Returns:** DATETIME

Returns the current date and time as a value in `YYYY-MM-DD HH:MM:SS` or `YYYY-MM-DD HH:MM:SS.ffffff` format depending on context. The value is fixed for the entire duration of the SQL statement (unlike SYSDATE).

```sql
SELECT NOW();
-- Output: 2024-06-15 10:45:32

SELECT NOW(3);
-- Output: 2024-06-15 10:45:32.847
```

### CURDATE() / CURRENT_DATE

**Syntax:** `CURDATE()`
**Returns:** DATE (YYYY-MM-DD)

```sql
SELECT CURDATE();
-- Output: 2024-06-15

-- Use in expressions
SELECT CURDATE() + 0;
-- Output: 20240615  (integer context)
```

### CURTIME() / CURRENT_TIME

**Syntax:** `CURTIME([fsp])`
**Parameters:** `fsp` – optional fractional seconds precision (0–6)
**Returns:** TIME

```sql
SELECT CURTIME();
-- Output: 10:45:32

SELECT CURTIME(2);
-- Output: 10:45:32.84
```

### SYSDATE()

**Syntax:** `SYSDATE([fsp])`
**Returns:** DATETIME

Unlike `NOW()`, `SYSDATE()` returns the time at the moment the function itself executes — not the start of the statement. This matters inside loops or multi-statement queries.

```sql
SELECT NOW(), SLEEP(2), NOW();
-- Both NOW() values are identical (statement-start time)

SELECT SYSDATE(), SLEEP(2), SYSDATE();
-- Second SYSDATE() is 2 seconds later
```

> **Note:** `SYSDATE()` can be made equivalent to `NOW()` by starting MySQL with `--sysdate-is-now`.

### UTC_DATE(), UTC_TIME(), UTC_TIMESTAMP()

```sql
SELECT UTC_DATE();
-- Output: 2024-06-15

SELECT UTC_TIME();
-- Output: 05:15:32

SELECT UTC_TIMESTAMP();
-- Output: 2024-06-15 05:15:32
```

### UNIX_TIMESTAMP()

**Syntax:** `UNIX_TIMESTAMP([date])`
**Parameters:** `date` – optional DATE/DATETIME; if omitted returns current Unix time
**Returns:** BIGINT (or DECIMAL if fractional seconds)

```sql
SELECT UNIX_TIMESTAMP();
-- Output: 1718441132

SELECT UNIX_TIMESTAMP('2024-06-15 10:45:32');
-- Output: 1718441132

-- With microseconds
SELECT UNIX_TIMESTAMP(NOW(6));
-- Output: 1718441132.847361
```

---

## 1.2 Date and Time Extraction Functions

These functions extract a specific part from a date, time, or datetime value.

| Function | Returns | Description |
|---|---|---|
| `YEAR(date)` | INT | Year (1000–9999) |
| `MONTH(date)` | INT | Month (1–12) |
| `DAY(date)` / `DAYOFMONTH(date)` | INT | Day of month (1–31) |
| `HOUR(time)` | INT | Hour (0–23) |
| `MINUTE(time)` | INT | Minute (0–59) |
| `SECOND(time)` | INT | Second (0–59) |
| `MICROSECOND(expr)` | INT | Microseconds (0–999999) |
| `QUARTER(date)` | INT | Quarter (1–4) |
| `WEEK(date[,mode])` | INT | Week number (0–53) |
| `WEEKOFYEAR(date)` | INT | ISO week number (1–53) |
| `WEEKDAY(date)` | INT | 0=Monday … 6=Sunday |
| `DAYOFWEEK(date)` | INT | 1=Sunday … 7=Saturday |
| `DAYOFYEAR(date)` | INT | Day of year (1–366) |
| `YEARWEEK(date[,mode])` | INT | Year and week (YYYYWW) |
| `EXTRACT(unit FROM date)` | INT | Extract any named unit |
| `DATE(expr)` | DATE | Date portion of datetime |
| `TIME(expr)` | TIME | Time portion of datetime |
| `LAST_DAY(date)` | DATE | Last day of month |

### EXTRACT()

**Syntax:** `EXTRACT(unit FROM date)`

Valid unit values: `MICROSECOND`, `SECOND`, `MINUTE`, `HOUR`, `DAY`, `WEEK`, `MONTH`, `QUARTER`, `YEAR`, `SECOND_MICROSECOND`, `MINUTE_MICROSECOND`, `MINUTE_SECOND`, `HOUR_MICROSECOND`, `HOUR_SECOND`, `HOUR_MINUTE`, `DAY_MICROSECOND`, `DAY_SECOND`, `DAY_MINUTE`, `DAY_HOUR`, `YEAR_MONTH`

```sql
SELECT EXTRACT(YEAR FROM '2024-06-15');       -- 2024
SELECT EXTRACT(MONTH FROM '2024-06-15');      -- 6
SELECT EXTRACT(DAY FROM '2024-06-15');        -- 15
SELECT EXTRACT(HOUR FROM '10:45:32');         -- 10
SELECT EXTRACT(QUARTER FROM '2024-06-15');    -- 2
SELECT EXTRACT(YEAR_MONTH FROM '2024-06-15'); -- 202406
SELECT EXTRACT(DAY_HOUR FROM '2024-06-15 10:45:32'); -- 1510
```

### YEAR(), MONTH(), DAY()

```sql
SELECT YEAR('2024-06-15');    -- 2024
SELECT MONTH('2024-06-15');   -- 6
SELECT DAY('2024-06-15');     -- 15
```

### WEEKDAY() vs DAYOFWEEK()

```sql
-- WEEKDAY: 0=Monday, 1=Tuesday, ..., 6=Sunday
SELECT WEEKDAY('2024-06-15');   -- 5  (Saturday)

-- DAYOFWEEK: 1=Sunday, 2=Monday, ..., 7=Saturday  (ODBC standard)
SELECT DAYOFWEEK('2024-06-15'); -- 7  (Saturday)
```

### WEEK(date, mode)

The `mode` controls the first day of the week and what constitutes "week 1".

| Mode | First Day | Week 1 Behavior |
|---|---|---|
| 0 | Sunday | Week containing Jan 1 |
| 1 | Monday | Week with >= 4 days in new year |
| 2 | Sunday | Week with >= 1 day in new year (1-53) |
| 3 | Monday | ISO 8601 (>= 4 days) |
| 4 | Sunday | Week with >= 4 days in new year |
| 5 | Monday | Week with >= 1 day in new year |
| 6 | Sunday | Week with >= 4 days (1-53) |
| 7 | Monday | Week with >= 1 day (1-53) |

```sql
SELECT WEEK('2024-01-01', 0); -- 0
SELECT WEEK('2024-01-01', 1); -- 1
SELECT WEEKOFYEAR('2024-01-01'); -- 1 (ISO)
```

### LAST_DAY()

**Syntax:** `LAST_DAY(date)`
**Returns:** DATE

```sql
SELECT LAST_DAY('2024-02-01'); -- 2024-02-29  (leap year)
SELECT LAST_DAY('2023-02-01'); -- 2023-02-28
SELECT LAST_DAY('2024-12-15'); -- 2024-12-31
```

### DATE() and TIME()

```sql
SELECT DATE('2024-06-15 10:45:32'); -- 2024-06-15
SELECT TIME('2024-06-15 10:45:32'); -- 10:45:32
SELECT MICROSECOND('2024-06-15 10:45:32.847123'); -- 847123
```

---

## 1.3 Date Arithmetic Functions

| Function | Description |
|---|---|
| `DATE_ADD(date, INTERVAL n unit)` | Add interval to date |
| `DATE_SUB(date, INTERVAL n unit)` | Subtract interval from date |
| `ADDDATE(date, INTERVAL n unit)` | Alias for DATE_ADD |
| `SUBDATE(date, INTERVAL n unit)` | Alias for DATE_SUB |
| `ADDTIME(expr1, expr2)` | Add time to date/time expression |
| `SUBTIME(expr1, expr2)` | Subtract time from expression |
| `DATEDIFF(date1, date2)` | Days between date1 and date2 |
| `TIMEDIFF(time1, time2)` | Time difference |
| `TIMESTAMPDIFF(unit, dt1, dt2)` | Difference in given unit |
| `TIMESTAMPADD(unit, n, datetime)` | Add n units to datetime |
| `PERIOD_ADD(P, n)` | Add months to period (YYMM) |
| `PERIOD_DIFF(P1, P2)` | Months between two periods |

### DATE_ADD() / ADDDATE()

**Syntax:** `DATE_ADD(date, INTERVAL expr unit)`

Valid units: `MICROSECOND`, `SECOND`, `MINUTE`, `HOUR`, `DAY`, `WEEK`, `MONTH`, `QUARTER`, `YEAR`, and compound units like `HOUR_MINUTE`, `DAY_SECOND`, `YEAR_MONTH`, etc.

```sql
SELECT DATE_ADD('2024-06-15', INTERVAL 10 DAY);
-- Output: 2024-06-25

SELECT DATE_ADD('2024-06-15', INTERVAL 3 MONTH);
-- Output: 2024-09-15

SELECT DATE_ADD('2024-06-15', INTERVAL 1 YEAR);
-- Output: 2025-06-15

SELECT DATE_ADD('2024-06-15 10:00:00', INTERVAL '1:30' HOUR_MINUTE);
-- Output: 2024-06-15 11:30:00

SELECT DATE_ADD('2024-06-15', INTERVAL -5 DAY);
-- Output: 2024-06-10

-- ADDDATE with integer shorthand (days only)
SELECT ADDDATE('2024-06-15', 10);
-- Output: 2024-06-25
```

### DATE_SUB() / SUBDATE()

```sql
SELECT DATE_SUB('2024-06-15', INTERVAL 1 MONTH);
-- Output: 2024-05-15

SELECT DATE_SUB(NOW(), INTERVAL 7 DAY);
-- Output: (7 days ago)
```

### ADDTIME() / SUBTIME()

**Syntax:** `ADDTIME(expr1, expr2)`
**Parameters:** `expr1` – datetime or time; `expr2` – time string to add/subtract

```sql
SELECT ADDTIME('2024-06-15 10:00:00', '1:30:00');
-- Output: 2024-06-15 11:30:00

SELECT ADDTIME('10:00:00', '01:30:00');
-- Output: 11:30:00

SELECT SUBTIME('10:30:00', '00:30:00');
-- Output: 10:00:00

SELECT ADDTIME('2024-06-15 23:59:59', '0:0:1');
-- Output: 2024-06-16 00:00:00
```

### DATEDIFF()

**Syntax:** `DATEDIFF(date1, date2)`
**Returns:** INT (date1 - date2 in days)

```sql
SELECT DATEDIFF('2024-12-31', '2024-06-15');
-- Output: 199

SELECT DATEDIFF('2024-06-15', '2024-12-31');
-- Output: -199

-- Days since hire
SELECT DATEDIFF(CURDATE(), hire_date) AS days_employed FROM employees;
```

### TIMEDIFF()

**Syntax:** `TIMEDIFF(time1, time2)`
**Returns:** TIME

```sql
SELECT TIMEDIFF('10:45:32', '08:00:00');
-- Output: 02:45:32

SELECT TIMEDIFF('2024-06-15 10:45:00', '2024-06-15 08:00:00');
-- Output: 02:45:00
```

### TIMESTAMPDIFF()

**Syntax:** `TIMESTAMPDIFF(unit, datetime1, datetime2)`

Returns `datetime2 - datetime1` in the given unit. Valid units: `MICROSECOND`, `SECOND`, `MINUTE`, `HOUR`, `DAY`, `WEEK`, `MONTH`, `QUARTER`, `YEAR`.

```sql
SELECT TIMESTAMPDIFF(MONTH, '2023-01-01', '2024-06-15');
-- Output: 17

SELECT TIMESTAMPDIFF(DAY, '2024-01-01', '2024-06-15');
-- Output: 166

SELECT TIMESTAMPDIFF(YEAR, '2000-06-15', CURDATE());
-- Output: 24  (age in years)

SELECT TIMESTAMPDIFF(SECOND, '2024-06-15 10:00:00', '2024-06-15 10:05:30');
-- Output: 330
```

### TIMESTAMPADD()

**Syntax:** `TIMESTAMPADD(unit, interval, datetime)`

```sql
SELECT TIMESTAMPADD(MONTH, 3, '2024-06-15');
-- Output: 2024-09-15

SELECT TIMESTAMPADD(MINUTE, 90, '2024-06-15 10:00:00');
-- Output: 2024-06-15 11:30:00
```

### PERIOD_ADD() and PERIOD_DIFF()

Periods are in `YYMM` or `YYYYMM` format (not regular dates).

```sql
SELECT PERIOD_ADD(202406, 3);
-- Output: 202409

SELECT PERIOD_ADD(202412, 2);
-- Output: 202502

SELECT PERIOD_DIFF(202412, 202406);
-- Output: 6  (months between)
```

---

## 1.4 Date Formatting Functions

| Function | Description |
|---|---|
| `DATE_FORMAT(date, format)` | Format date as string |
| `TIME_FORMAT(time, format)` | Format time as string |
| `GET_FORMAT(type, name)` | Return format string for locale |
| `STR_TO_DATE(str, format)` | Parse string into date |

### DATE_FORMAT()

**Syntax:** `DATE_FORMAT(date, format)`
**Returns:** VARCHAR

#### Format Specifiers

| Specifier | Description | Example |
|---|---|---|
| `%Y` | 4-digit year | 2024 |
| `%y` | 2-digit year | 24 |
| `%m` | Month, zero-padded (01–12) | 06 |
| `%c` | Month, not padded (1–12) | 6 |
| `%M` | Full month name | June |
| `%b` | Abbreviated month | Jun |
| `%d` | Day, zero-padded (01–31) | 15 |
| `%e` | Day, not padded (1–31) | 15 |
| `%D` | Day with suffix | 15th |
| `%H` | Hour 24h, zero-padded (00–23) | 10 |
| `%k` | Hour 24h, not padded (0–23) | 10 |
| `%h` / `%I` | Hour 12h, zero-padded (01–12) | 10 |
| `%l` | Hour 12h, not padded (1–12) | 10 |
| `%i` | Minute (00–59) | 45 |
| `%S` / `%s` | Second (00–59) | 32 |
| `%f` | Microseconds (000000–999999) | 847000 |
| `%p` | AM or PM | AM |
| `%W` | Full weekday name | Saturday |
| `%a` | Abbreviated weekday | Sat |
| `%w` | Day of week (0=Sunday) | 6 |
| `%j` | Day of year (001–366) | 167 |
| `%U` | Week (00–53), Sunday first | 24 |
| `%u` | Week (00–53), Monday first | 24 |
| `%V` | ISO week (01–53), Sunday | 24 |
| `%X` | Year for ISO week (V) | 2024 |
| `%v` | ISO week (01–53), Monday | 24 |
| `%x` | Year for ISO week (v) | 2024 |
| `%r` | 12-hour time hh:mm:ss AM/PM | 10:45:32 AM |
| `%T` | 24-hour time hh:mm:ss | 10:45:32 |
| `%Q` | Quarter (1–4) | 2 |
| `%%` | Literal percent sign | % |

```sql
SELECT DATE_FORMAT('2024-06-15 10:45:32', '%W, %M %D %Y');
-- Output: Saturday, June 15th 2024

SELECT DATE_FORMAT('2024-06-15', '%d/%m/%Y');
-- Output: 15/06/2024

SELECT DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%S');
-- Output: 2024-06-15 10:45:32

SELECT DATE_FORMAT('2024-06-15', '%M %d, %Y');
-- Output: June 15, 2024

SELECT DATE_FORMAT(NOW(), 'Today is %W in week %u of %Y');
-- Output: Today is Saturday in week 24 of 2024
```

### TIME_FORMAT()

**Syntax:** `TIME_FORMAT(time, format)`

Uses the same specifiers as DATE_FORMAT but only time-related ones are meaningful.

```sql
SELECT TIME_FORMAT('10:45:32', '%h:%i %p');
-- Output: 10:45 AM

SELECT TIME_FORMAT('14:30:00', '%H hours and %i minutes');
-- Output: 14 hours and 30 minutes
```

### GET_FORMAT()

**Syntax:** `GET_FORMAT(date_type, format_name)`

Returns a format string based on locale/standard conventions.

| date_type | format_name | Returns |
|---|---|---|
| DATE | 'USA' | '%m.%d.%Y' |
| DATE | 'EUR' | '%d.%m.%Y' |
| DATE | 'ISO' | '%Y-%m-%d' |
| DATE | 'JIS' | '%Y-%m-%d' |
| DATE | 'INTERNAL' | '%Y%m%d' |
| TIME | 'USA' | '%h:%i:%s %p' |
| TIME | 'EUR' | '%H.%i.%s' |
| DATETIME | 'USA' | '%Y-%m-%d %H.%i.%s' |

```sql
SELECT GET_FORMAT(DATE, 'EUR');
-- Output: %d.%m.%Y

SELECT DATE_FORMAT('2024-06-15', GET_FORMAT(DATE, 'EUR'));
-- Output: 15.06.2024

SELECT DATE_FORMAT('2024-06-15', GET_FORMAT(DATE, 'ISO'));
-- Output: 2024-06-15
```

### STR_TO_DATE()

**Syntax:** `STR_TO_DATE(str, format)`
**Returns:** DATE, TIME, or DATETIME depending on format

```sql
SELECT STR_TO_DATE('15/06/2024', '%d/%m/%Y');
-- Output: 2024-06-15

SELECT STR_TO_DATE('June 15 2024', '%M %d %Y');
-- Output: 2024-06-15

SELECT STR_TO_DATE('15-Jun-2024 10:45:32', '%d-%b-%Y %H:%i:%S');
-- Output: 2024-06-15 10:45:32

-- Invalid date returns NULL (not an error by default)
SELECT STR_TO_DATE('30/02/2024', '%d/%m/%Y');
-- Output: NULL (Feb 30 does not exist)
```

---

## 1.5 Date Conversion Functions

| Function | Description |
|---|---|
| `FROM_UNIXTIME(ts[, fmt])` | Unix timestamp to DATETIME |
| `UNIX_TIMESTAMP([date])` | Date to Unix timestamp |
| `CONVERT_TZ(dt, from_tz, to_tz)` | Convert between timezones |
| `FROM_DAYS(n)` | Day number to DATE |
| `TO_DAYS(date)` | DATE to day number since year 0 |
| `TO_SECONDS(date)` | DATE to seconds since year 0 |
| `MAKEDATE(year, dayofyear)` | Build date from year and day-of-year |
| `MAKETIME(hour, min, sec)` | Build TIME from components |
| `TIMESTAMP(expr)` | Convert to DATETIME |
| `TIMESTAMP(expr1, expr2)` | Add time to date |

### FROM_UNIXTIME()

**Syntax:** `FROM_UNIXTIME(unix_timestamp [, format])`

```sql
SELECT FROM_UNIXTIME(1718441132);
-- Output: 2024-06-15 10:45:32

SELECT FROM_UNIXTIME(1718441132, '%Y-%m-%d');
-- Output: 2024-06-15

SELECT FROM_UNIXTIME(1718441132, '%W, %M %D %Y at %H:%i');
-- Output: Saturday, June 15th 2024 at 10:45
```

### CONVERT_TZ()

**Syntax:** `CONVERT_TZ(dt, from_tz, to_tz)`

```sql
SELECT CONVERT_TZ('2024-06-15 10:45:32', '+05:30', '+00:00');
-- Output: 2024-06-15 05:15:32

SELECT CONVERT_TZ(NOW(), 'Asia/Kolkata', 'America/New_York');
-- Converts IST to EST (requires timezone tables loaded)

-- Load timezone data on server: mysql_tzinfo_to_sql /usr/share/zoneinfo | mysql -u root mysql
```

### TO_DAYS() and FROM_DAYS()

```sql
SELECT TO_DAYS('2024-06-15');
-- Output: 739053  (days since year 0)

SELECT FROM_DAYS(739053);
-- Output: 2024-06-15

-- Days until year end
SELECT FROM_DAYS(TO_DAYS(CONCAT(YEAR(NOW()), '-12-31'))) - CURDATE();
-- Output: days remaining in year
```

### TO_SECONDS()

```sql
SELECT TO_SECONDS('2024-06-15');
-- Output: 63854803200  (seconds since year 0)
```

### MAKEDATE() and MAKETIME()

```sql
SELECT MAKEDATE(2024, 167);
-- Output: 2024-06-15  (167th day of 2024)

SELECT MAKEDATE(2024, 1);
-- Output: 2024-01-01

SELECT MAKETIME(10, 45, 32);
-- Output: 10:45:32

SELECT MAKETIME(9, 0, 0);
-- Output: 09:00:00
```

### TIMESTAMP()

```sql
SELECT TIMESTAMP('2024-06-15');
-- Output: 2024-06-15 00:00:00

SELECT TIMESTAMP('2024-06-15', '10:45:32');
-- Output: 2024-06-15 10:45:32
```

---

## 1.6 Calendar Name Functions

| Function | Returns | Example |
|---|---|---|
| `DAYNAME(date)` | VARCHAR | 'Saturday' |
| `MONTHNAME(date)` | VARCHAR | 'June' |

```sql
SELECT DAYNAME('2024-06-15');
-- Output: Saturday

SELECT MONTHNAME('2024-06-15');
-- Output: June

-- Use in a report
SELECT CONCAT(DAYNAME(order_date), ', ', MONTHNAME(order_date), ' ',
              DAY(order_date), ' ', YEAR(order_date)) AS formatted_date
FROM orders;
```

---

## 1.7 Date/Time Comparison and Validation

```sql
-- Compare dates properly (avoid string comparison)
SELECT * FROM orders WHERE order_date = '2024-06-15';

-- Range queries
SELECT * FROM orders
WHERE order_date BETWEEN '2024-01-01' AND '2024-06-30';

-- NULL handling: date functions return NULL for invalid inputs
SELECT YEAR(NULL);         -- NULL
SELECT MONTH('2024-13-01'); -- NULL (invalid month)

-- Check if a date is valid
SELECT STR_TO_DATE('2024-02-30', '%Y-%m-%d') IS NULL AS invalid_date;
-- Output: 1 (true)
```

---

## 1.8 Date/Time Edge Cases and Notes

### NOW() vs SYSDATE()
- `NOW()` returns the time the **statement** started
- `SYSDATE()` returns the time the **function** executed

### Month-end arithmetic
```sql
-- Adding months to month-end dates
SELECT DATE_ADD('2024-01-31', INTERVAL 1 MONTH);
-- Output: 2024-02-29  (not March!)

SELECT DATE_ADD('2024-02-29', INTERVAL 1 YEAR);
-- Output: 2025-02-28  (adjusted to last valid day)
```

### Zero dates
```sql
SELECT YEAR('0000-00-00'); -- 0
-- MySQL allows '0000-00-00' with certain SQL modes disabled
-- To prevent: SET SQL_MODE = 'NO_ZERO_DATE,NO_ZERO_IN_DATE'
```

### Implicit conversion
```sql
SELECT '2024-06-15' + INTERVAL 1 DAY;
-- Output: 2024-06-16  (string auto-converted to date)
```
