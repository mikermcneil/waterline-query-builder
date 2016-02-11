# Overview


## Links

+ [Nomenclature lessons to learn from Hibernate](http://www.slideshare.net/brmeyer/hibernate-orm-features) (Feb 2014)- relevant topics include multitenancy, geo data, versioning and sharding.



## Glossary

##### Datastores

+ _Compare with [SQL](https://commons.wikimedia.org/wiki/File:SQL_ANATOMY_wiki.svg#/media/File:SQL_ANATOMY_wiki.svg)_
+ _Compare with [Mongo](https://docs.mongodb.org/manual/reference/glossary/#term-aggregation-framework)_

| Term         | Definition
| ------------ | --------------------------------------------------------
| record       | The basic unit of data in Waterline. Always contains a primary key. Equivalent to a SQL row or a Mongo document.
| primary key  | A record's unique identifier. Always either an integer or a string.
| column name  | The name of a property which is extant in all records in a particular table.  Equivalent to a SQL column name.
| table        | A set of (at least partially) homogeneous records.  Equivalent to a SQL table or Mongo collection.
| datastore    | A set of tables. Equivalent to a SQL or Mongo "database".


##### Statements

+ _Compare with [SQL](https://commons.wikimedia.org/wiki/File:SQL_ANATOMY_wiki.svg#/media/File:SQL_ANATOMY_wiki.svg)_
+ _Compare with [Mongo](https://docs.mongodb.org/manual/reference/glossary/#term-aggregation-framework)_

| Term         | Definition
| ------------ | --------------------------------------------------------
| statement    | e.g. `{ select: ['title', 'author'], from: 'books', where: {title: 'robinson crusoe'} }`
| clause       | e.g. `from: 'books'` or `select: ['title', 'author']`.
| expression   | e.g. `population + 1`
| predicate    | e.g. `title = 'robinson crusoe'`




## Extensions to the Specification

Adapters are free to implement extensions to RQL syntax, provided those extensions are in the form of additional properties within prescribed namespaces.

### Example: Postgresql schemas

PostgreSQL "schemas" are custom to Postgres.  Neither MySQL nor MongoDB supports anything like them. And yet they are more than a namespace or table prefix.  To add to the complexity, "schema" is an extremely overloaded term.

Let's  use "schemas" as a test case for passing adapter-specific metadata through RQL:

```javascript
{
  select: '*',
  from: 'books',
  opts: {
    schema: 'public'
  }
}
```

**Outputs:**

```sql
-- PostgreSQL
select * from "public"."books"
```

```javascript
// MongoDB    
db.books.find({}, {})
```

Notice that the generated Mongo operation ignores the "schema".  If Mongo had its own concept of a schema, it might handle it completely differently.


##### What about something like creating a postgres schema?

That should go directly to mp-postgresql in the form of a different machine (or use the standard native query machine).






