# Adapter Interface




## Proposed changes

#### Don't accept `connection` xor `connectionString` -- use two different machines instead

This will make this more declarative and easier to document.






## Proposed additions

#### A higher-level connection API

```javascript
var Postgresql = require('machinepack-postgresql');

Postgresql.connection({
  connectionString: '...',
  whileConnected: function (inputs, exits){
    Postgresql.executeQuery({ connection: inputs.connection, query: {} }).exec({
      error: function(err) { return exits.error(err); },
      success: function (result) { return exits.success(); }
    });
  }
}).exec({
  error: function(err) {
    // If here, one of the following is true:
    // - could not get connection
    // - the transaction never started
    // - rollback already happened
    // - the rollback was attempted and failed
    // - could not release connection
  },
  success: function (resultDataIfRelevant) {
    // If here, we know we connected to the database, that the transaction was started,
    // that the commit already happened, and that we've released the connection again successfully.
  }
});
```


#### A higher-level transaction API

```javascript
var Postgresql = require('machinepack-postgresql');

Postgresql.transaction({
  connectionString: '...',
  whileTransactional: function (inputs, exits){
    Postgresql.executeQuery({ connection: inputs.connection, query: {} }).exec({
      error: function(err) { return exits.error(err); },
      success: function (result) { return exits.success(); }
    });
  }
}).exec({
  error: function(err) {
    // If here, one of the following is true:
    // - could not get connection
    // - the transaction never started
    // - rollback already happened
    // - the rollback was attempted and failed
    // - could not release connection
  },
  success: function (resultDataIfRelevant) {
    // If here, we know we connected to the database, that the transaction was started,
    // that the commit already happened, and that we've released the connection again successfully.
  }
});
```





