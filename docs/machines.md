# Adapter Interface (Machines)

### Summary

- beginTransaction()
- commitTransaction()
- rollbackTransaction()
- **transaction()**
- getConnection()
- releaseConnection()
- **connect()**
- **compileQuery()**
- **sendQuery()**
- **executeQuery()**
- **executeNativeQuery()**


### Proposed changes


##### Don't accept `connection` _xor_ `connectionString` -- use two different machines instead
This will make this more declarative and easier to document.


##### Change `.executeQuery()` to be a query machine w/ a higher-level API

Just like current impl of executeQuery, but accepts only `connectionString` and releases connection when query is finished.

```javascript
var Postgresql = require('machinepack-postgresql');

Postgresql.executeQuery({
  connectionString: '...',
  query: {}
}).exec({
  error: function(err) {
    // If here, then something completely unexpected happened.
  },
  couldNotGetConnection: function (err){
    // If here, could not get connection.
  },
  failed: function (err){
    // If here, we know we connected to the database, but our query sent back an error.
    
    // err.error => raw error from the query
    // err.connection => the connection, in case you want to do anything crazy with it
  },
  couldNotReleaseConnection: function (err){
    // If here, we know we connected to the database, that there were no errors from the query,
    // but that we could not release the connection.
    
    // err.error => raw error from release connection call
    // err.resultData => result data from query, if available (or null otherwise-- this is just queryResult)
    // err.connection => the connection, in case you want to do anything crazy with it
  },
  success: function (queryResult) {
    // If here, we know we connected to the database, that there were no errors from the query, and that the connection was successfully released.
  }
});
```


##### Change `runQuery` to `sendNativeQuery` for clarity

This is just a rename, and part of what we'll need to do as far as using a single pack anyway.



### Proposed additions



##### Add `sendQuery`
And have it be exactly like the `executeQuery` of today-- except have it only accept `connection`.

```javascript
var Postgresql = require('machinepack-postgresql');

// assuming we already had a connection for brevity...
var connection;
Postgresql.sendQuery({
  connection: connection,
  query: {}
}).exec({
  error: function(err) {
    // If here, then something completely unexpected happened.
    
    // We'd need to release the connection here.
  },
  failed: function (err){
    // If here, our query sent back a recognized error (`err`).
    
    // We'd still need to release the connection here.
  },
  success: function (queryResult) {
    // If here, we know that there were no errors from the query.
    
    // We'd still need to release the connection here.
  }
});
```



##### Add `.compileQuery()`
A machine that does not connect, and instead builds the query and returns a dry run (for SQL adapters a SQL string-- for Mongo, a json-serializable dictionary representing the compiled mongo operation). This is to allow for caching, but also just a necessary debug step.

```javascript
var Postgresql = require('machinepack-postgresql');

var compiledQuery = Postgresql.compileQuery({
  query: {}
}).execSync();
```

Or alternately:

```javascript
var Postgresql = require('machinepack-postgresql');

Postgresql.compileQuery({
  query: {}
}).exec({
  error: function(err) {
    // If here, then something completely unexpected happened.
  },
  malformed: function (err){
    // If here, RQL query could not be compiled.
  },
  success: function (compiledQuery) {
    // If here, we know it worked.
  }
});
```





##### Add `.connect`, a connection machine w/ a higher-level API

Just like current impl of getConnection, but only accepts connection string, exposes an interceptor, and releases connection when callback is called.

```javascript
var Postgresql = require('machinepack-postgresql');

Postgresql.connect({
  connectionString: '...',
  during: function (inputs, exits){
    // Custom logic in here...  e.g.
    Postgresql.executeQuery({ connection: inputs.connection, query: {} }).exec({
      error: function(err) { return exits.error(err); },
      success: function (resultDataOrNull) { return exits.success(resultDataOrNull); }
    });
  }
}).exec({
  error: function(err) {
    // If here, then something completely unexpected happened.
  },
  couldNotGetConnection: function (err){
    // If here, could not get connection.
  },
  failed: function (err){
    // If here, we know we connected to the database, but our interceptor function sent back an error.
    
    // `err` is what was passsed to the interceptor function's callback
  },
  couldNotReleaseConnection: function (err){
    // If here, we know we connected to the database, that there were no errors in the interceptor,
    // but that we could not release the connection.
    
    // err.error => raw error from release connection call
    // err.resultData => result data from interceptor function, if available (or null otherwise-- this is just resultDataOrNull)
    // err.connection => the connection, in case you want to do anything crazy with it (or just try to release it again)
  },
  success: function (resultDataOrNull) {
    // If here, we know we connected to the database, that there were no errors in the interceptor,
    // and that the connection was successfully released.
  }
});
```


##### Add `.transaction()`, a transaction machine with a higher-level API

Just like current impl of beginTransaction, but exposes an interceptor (commits/rollsback+releases connection when callback is called).

```javascript
var Postgresql = require('machinepack-postgresql');

Postgresql.transaction({
  connectionString: '...',
  during: function (inputs, exits){
    // Custom logic in here...  e.g.
    Postgresql.executeQuery({ connection: inputs.connection, query: {} }).exec({
      error: function(err) { return exits.error(err); },
      success: function (result) { return exits.success(); }
    });
  }
}).exec({
  error: function(err) {
    // If here, then something completely unexpected happened.
  },
  couldNotGetConnection: function (err){
    // If here, could not get connection.
  },
  couldNotBeginTransaction: function (err){
    // If here, could not begin transaction
  },
  failed: function (err){
    // If here, we know we connected to the database, that our interceptor function sent back an error,
    // and then that we successfully rolled back and disconnected. 
    
    // (`err` is the raw error that was passed to the interceptor's callback)
  },
  couldNotRollback: function (err) {
    // If here, we know we connected to the database, that our interceptor function sent back an error,
    // and then that rollback was unsuccessful.  The connection was not released.
    
    // err.error => raw error from release connection call
    // err.resultData => result data from interceptor function, if available (or null otherwise-- this is just resultDataOrNull)
    // err.connection => the connection, in case you want to do anything crazy with it (or just try to release it again)
  },
  couldNotReleaseConnection: function (err){
    // If here, we know we connected to the database, that we either successfully rolled back or committed..
    // but now we can't release the connetion.
    
    // err.error => raw error from release connection call
    // err.resultData => result data from interceptor function, if available (or null otherwise-- this is just resultDataOrNull)
    // err.connection => the connection, in case you want to do anything crazy with it (or just try to release it again)
  },
  success: function (resultDataIfRelevant) {
    // If here, we know we connected to the database, that the transaction was started,
    // that the commit already happened, and that we've released the connection again successfully.
  }
});
```





