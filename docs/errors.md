# Errors

## By Entry Point


### When attempting to establish first-time connection...

#### Cannot connect to database due to the fact that there's no database server running at the provided host
> Currently in Waterline: _not consistent across adapters_

#### Cannot connect to database due to the fact that there's no software db with the specified name
> Currently in Waterline: _not consistent across adapters_

#### Cannot connect to database due to invalid credentials
> Currently in Waterline: _not consistent across adapters_

#### Cannot connect to database due to insufficient access rights
> Currently in Waterline: _not consistent across adapters_

#### Initial connection error (misc)
> Currently in Waterline: _not consistent across adapters_



### When attempting to acquire a connection from pool after connection has already been established

#### Cannot acquire connection (misc)
> Currently in Waterline: _not consistent across adapters_



### When an interruption occurs...   (fatal error)

This is e.g. the scenario where connection to the database is lost.  Luckily, we can probably work around this and rather than having it crash the server: e.g. have it emit a standard event on the connection as a way to notify the user if they care, and then have all future attempts to send a query on that connection result in failure.  Attempting to acquire a new connection after this should be supported.




### When sending a query...

#### Logical data type validation failed
> Currently in Waterline: `E_VALIDATION`

Note that this type of error is completely separate from the underlying data store (validation occurs in the node process)

#### Cannot process RQL query because it is malformed
> Currently in Waterline: _not consistent across adapters_

Note that this type of error is also completely separate from the underlying data store (validation occurs in the node process)


#### Connection already died
> Currently in Waterline: _not consistent across adapters_

Cannot send a query over a connection which is known to be dead (this is known ahead of time because we keep track of it when/if a connection blows up)




### When receiving the outcome/result from a query...

#### Uniqueness constraint failed
> Currently in Waterline: `E_UNIQUE`

#### Cannot process query because no schema exists with the specified name
> Currently in Waterline: _not consistent across adapters_

#### Cannot process query because no relation (i.e. SQL table or mongo collection) exists with the specified name
> Currently in Waterline: _not consistent across adapters_

#### Query error (misc)
> Currently in Waterline: `E_UNKNOWN`




## Links

These are just some related links for easy reference:

- PostgreSQL
  - current error negotiation impl in sails-postgresql: https://github.com/balderdashy/sails-postgresql/blob/a51b3643777dcf1af5517acbf76e09612d36b301/lib/adapter.js#L1308
  - PostgreSQL error codes: http://www.postgresql.org/docs/9.4/static/errcodes-appendix.html
- MySQL
  - current error negotiation impl in sails-mysql: https://github.com/balderdashy/sails-mysql/blob/2c414f1191c3595df2cea8e40259811eb3ca05f9/lib/adapter.js#L1223
  - full MySQL error reference: http://dev.mysql.com/doc/refman/5.7/en/error-messages-server.html#error_er_cant_create_table
  - common MySQL errors (connection failure, out of RAM, etc): https://dev.mysql.com/doc/refman/5.5/en/common-errors.html
  - common query-related MySQL issues: https://dev.mysql.com/doc/refman/5.5/en/query-issues.html
- MongoDB
  - current error negotiation impl in sails-mongo: https://github.com/balderdashy/sails-mongo/blob/0656ff3471339b8bae299e6fd8b7b379f7a34c15/lib/utils.js#L182
  - connection error negotiation from sails-hook-orm-mongoose: https://github.com/mikermcneil/sails-hook-orm-mongoose/blob/master/index.js#L166
  - mongo error codes: https://github.com/mongodb/mongo/blob/v3.2/src/mongo/base/error_codes.err
  - mongo WriteResult: https://docs.mongodb.org/manual/reference/method/WriteResult/#WriteResult.writeConcernError.code
