# Adapter Interface (Machines)

### All public machines in an adapter

The machines below are grouped for clarity, but realize they're all members of the same pack (eg. machinepack-mongo, machinepack-postgresql, machinepack-mysql, machinepack-sqlite, etc.).

The machines in bold are either new or have some kind of change in the proposal below.

##### Low-level

- getConnection()
- releaseConnection()
- **executeNativeQuery()** _(formerly `runQuery()`)_

##### High-level

- beginTransaction()
- commitTransaction()
- rollbackTransaction()
- **sendQuery()** _(i.e. this is like the `executeQuery()` of yore, but requires an existing connection)_


#### ????

> We need to sync up on these before proceeding w/ implementation.

- **compileQuery()**
- **executeQuery()** _(i.e. this is like `connectAndExecuteQuery()`)_



##### Sugar

> We should wait to implement these.  Might be better as a higher level API.

- **connect()**
- **transaction()**





### Proposed changes


##### Expect `meta` key in results
For _any machine_ (even `getConnection()`, `executeNativeQuery()`, etc), the output of any exit _except `error`_ should be a dictionary w/ exemplar `{ meta: ‘===’, result: ‘==='  }`.   The core RQL spec does not guarantee anything in `meta` (it will be `null` in the general case).  Like `opts`, this is purely for allowing custom communication between a specific adapter and userland code, and will never be tampered with by the official RQL specification.


##### Don't accept `connection` _xor_ `connectionString` -- use two different machines instead
This will make this more declarative and easier to document.


##### Change `.executeQuery()` to be a query machine w/ a higher-level API

Just like current impl of executeQuery, but accepts only `connectionString` and releases connection when query is finished.

> Note that we might consider renaming this to `connectAndExecuteQuery()`. If we do that, we should change `sendQuery()`  to `executeQuery()`.

```javascript
var Postgresql = require('machinepack-postgresql');

Postgresql.executeQuery({
  connectionString: '...',
  query: {}
}).exec({
  error: function(err) {
    // If here, then something completely unexpected happened.
    
    // We assume that there are no dangling connections to the database waiting to be released.
  },
  notSupported: function (report){
    // If here, the specified RQL query is not supported by this adapter.
    // If even one part of the RQL query is not supported by the adapter, the compilation _should always fail_.
    
    // report.error => an error (===) explaining why syntax is not supported
    // report.meta => reserved for custom use by adapters
  },
  couldNotGetConnection: function (report){
    // If here, could not get connection.
    
    // report.error => raw connection error (===)
    // report.meta => reserved for custom use by adapters
  },
  failed: function (report){
    // If here, we assume that we were able to get a connection to the database, but our query resulted in an an error.
    // However, after the error, we do know that the connection _was successfully closed_.
    // 
    // Note that this includes the scenario covered by the `malformed` exit of `sendQuery()`.
    
    // TODO: this needs to be broken up further.  This exit should probably be removed.  See `errors.md` in this documentation.
    
    // report.error => raw error from the query (===)
    // report.meta => reserved for custom use by adapters
  },
  couldNotReleaseConnection: function (report){
    // If here, we know we connected to the database, and that either:
    // (a) there were no errors from the query, but we could not release the connection
    // or (b) there _were_ errors from the query, and we could not release the connection
    //
    // Note that the result or error from this query is not included.
    
    // report.error => an error-- usually the raw error from release connection call (===).  The stack trace should show where this call came from.
    // report.connection => the live connection (===), in case you want to do anything crazy with it-- or if you want to try and release it again
    // report.meta => reserved for custom use by adapters
  },
  success: function (report) {
    // If here, we know we connected to the database, that there were no errors from the query, and that the connection was successfully released.
    
    // report.result => result from query, if available/there is any (or null otherwise)
    // report.meta => reserved for custom use by adapters
  }
});
```


##### Change `runQuery` to `sendNativeQuery` for clarity

This is just a rename, and part of what we'll need to do as far as using a single pack anyway.



### Proposed additions



##### Add `sendQuery`
And have it be exactly like the `executeQuery` of today-- except have it only accept `connection`.  In other words, you must already have an established connection to the database to call `sendQuery()`.

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
  malformed: function (report){
    // If here, RQL query could not be compiled because the provided RQL syntax was not valid.
    
    // report.error => an error (===) explaining why the syntax is not valid
    // report.meta => reserved for custom use by adapters
  },
  notSupported: function (report){
    // If here, the specified RQL query is not supported by this adapter.
    // If even one part of the RQL query is not supported by the adapter, the compilation _should always fail_.
    
    // report.error => an error (===) explaining why syntax is not supported
    // report.meta => reserved for custom use by adapters
  },
  failed: function (report){
    // If here, our query sent back a recognized error (`report.result`).
    // We'd still need to release the connection here.
    
    // TODO: this needs to be broken up further.  This exit should probably be removed.  See `errors.md` in this documentation.
    
    // report.error => the error
    // report.meta => reserved for custom use by adapters
  },
  success: function (report) {
    // If here, we know that there were no errors from the query.
    // We'd still need to release the connection here.
    
    // report.result => result from query, if available/there is any (or null otherwise)
    // report.meta => reserved for custom use by adapters
  }
});
```











### ideas for future enhancements

Probably shouldn't actually support these yet-- it's unclear what the proper API should be.



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
      success: function (report) {
        return exits.success({
          result: report.result
        });
      }
    });
  }
}).exec({
  error: function(err) {
    // If here, then something completely unexpected happened.
  },
  couldNotGetConnection: function (report){
    // If here, could not get connection.
    
    // report.error => a connection error (===)
    // report.meta => reserved for custom use by adapters
  },
  failed: function (report){
    // If here, we know we connected to the database, but our interceptor function sent back an error.
    // We also know that subsequently, we were at least able to successfully release the connection.
    
    // TODO: consider busting this up into other exits.
    
    // This `err` is what was passsed to the interceptor function's callback.
    
    // report.error => the error passed in to the error exit within the interceptor function.
    // report.meta => reserved for custom use by adapter code
    
  },
  couldNotReleaseConnection: function (report){
    // If here, we know we connected to the database, but we could not release the connection.
    // There may or may not have been an error in the interceptor.
    
    // report.error => raw error from release connection call
    // report.connection => the connection, in case you want to do anything crazy with it (or just try to release it again)
    // report.meta => reserved for custom use by adapter code
  },
  success: function (report) {
    // If here, we know we connected to the database, that there were no errors in the interceptor,
    // and that the connection was successfully released.
    
    // report.result =>  the `result` property of what was sent in to the success exit from the interceptor function, if available (null otherwise).
    // report.meta => the `meta` property of what was sent in to the interceptor function, if available (null otherwise). Reserved for custom use by userland code.
  }
});
```





##### Add `.transaction()`, a transaction machine with a higher-level API

> **WARNING**:
> This has not been updated yet to reflect the `meta` thing in results.

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








##### Add `.compileQuery()`

> This is pretty adapter-specific.  I'm not sure this is even a good idea, just documenting it below to capture the concept.

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
  malformed: function (report){
    // If here, RQL query could not be compiled because the provided RQL syntax was not valid.
    
    // report.error => an error (===) explaining why the syntax is not valid
    // report.meta => reserved for custom use by adapters
  },
  notSupported: function (report){
    // If here, the specified RQL query is not supported by this adapter.
    // If even one part of the RQL query is not supported by the adapter, the compilation _should always fail_.
    
    // report.error => an error (===) explaining why syntax is not supported
    // report.meta => reserved for custom use by adapters
  },
  success: function (report) {
    // If here, we know it worked.
    
    // report.compiledQuery => the compiled query
    // report.meta => reserved for custom use by adapters
  }
});
```


