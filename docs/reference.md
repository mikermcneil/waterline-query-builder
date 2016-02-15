# API Reference

> Work in progress.

### Machines (Adapter Interface)

+ `get-connection`
+ `release-connection`
+ `execute-native-query`
+ `compile-query`  _(needs to be finalized)_
+ `send-query`  _(consider renaming, see feb 15 proposal)_
+ `begin-transaction`
+ `commit-transaction`
+ `rollback-transaction`



### RQL (Query Syntax)

RQL is a dictionary that, when provided to the `send-query` machine, is used to generate and run a native query.

> TODO: document each property
