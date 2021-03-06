module.exports = {


  friendlyName: 'Tokenizer',


  description: 'Tokenizes the query',


  cacheable: true,


  sync: true,


  inputs: {

    expression: {
      description: 'The description to tokenize.',
      example: {},
      required: true
    }

  },


  exits: {

    success: {
      variableName: 'result',
      description: 'The tokenized expression',
      example: [{
        type: 'IDENTIFIER',
        value: '*'
      }]
    },

  },


  fn: function(inputs, exits) {

    var _ = require('lodash');
    var expression = inputs.expression;
    var results = [];

    var identifiers = {
      'select': 'SELECT',
      'from': 'FROM',
      'or': 'OR',
      'not': 'NOT',
      'in': 'IN',
      'distinct': 'DISTINCT',
      'count': 'COUNT',
      'min': 'MIN',
      'max': 'MAX',
      'sum': 'SUM',
      'avg': 'AVG',
      'limit': 'LIMIT',
      'offset': 'OFFSET',
      'groupBy': 'GROUPBY',
      'orderBy': 'ORDERBY',
      'where': 'WHERE',
      'insert': 'INSERT',
      'into': 'INTO',
      'update': 'UPDATE',
      'using': 'USING',
      'del': 'DELETE',
      'join': 'JOIN',
      'innerJoin': 'JOIN',
      'outerJoin': 'JOIN',
      'crossJoin': 'JOIN',
      'leftJoin': 'JOIN',
      'leftOuterJoin': 'JOIN',
      'rightJoin': 'JOIN',
      'rightOuterJoin': 'JOIN',
      'fullOuterJoin': 'JOIN',
      '>': 'OPERATOR',
      '<': 'OPERATOR',
      '<>': 'OPERATOR',
      '<=': 'OPERATOR',
      '>=': 'OPERATOR',
      'like': 'OPERATOR'
    };


    //  ╔═╗╔═╗╔═╗╦═╗╔═╗╔╦╗╔═╗╦═╗╔═╗
    //  ║ ║╠═╝║╣ ╠╦╝╠═╣ ║ ║ ║╠╦╝╚═╗
    //  ╚═╝╩  ╚═╝╩╚═╩ ╩ ╩ ╚═╝╩╚═╚═╝
    function processOperator(operator, value) {
      // Add the operator to the results
      results.push({
        type: 'OPERATOR',
        value: operator
      });

      // Add the value to the results
      results.push({
        type: 'VALUE',
        value: value
      });
    }

    //  ╔═╗╔═╗╦  ╔═╗╔═╗╔╦╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ╚═╗║╣ ║  ║╣ ║   ║   ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╚═╝╚═╝╩═╝╚═╝╚═╝ ╩   ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    function processSelect(value) {

      // Check if a distinct or other key is being used
      if(_.isObject(value) && !_.isArray(value)) {
        if(value.distinct) {

          // Add the distinct to the results
          results.push({
            type: 'IDENTIFIER',
            value: 'DISTINCT'
          });

          // Add the value to the results
          results.push({
            type: 'VALUE',
            value: value.distinct
          });

          return;
        }
      }

      // Add the select to the results
      results.push({
        type: 'IDENTIFIER',
        value: 'SELECT'
      });

      // Add the value to the results
      results.push({
        type: 'VALUE',
        value: value
      });
    }

    //  ╔═╗╦═╗╔═╗╔╦╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ╠╣ ╠╦╝║ ║║║║  ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╚  ╩╚═╚═╝╩ ╩  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    function processFrom(value) {

      // Check if a schema is being used
      if(_.isObject(value)) {
        if(value.schema) {
          results.push({
            type: 'IDENTIFIER',
            value: 'SCHEMA'
          });

          results.push({
            type: 'VALUE',
            value: value.schema
          });
        }

        if(value.table) {
          results.push({
            type: 'IDENTIFIER',
            value: 'FROM'
          });

          results.push({
            type: 'VALUE',
            value: value.table
          });
        }

        return;
      }

      // Otherwise just add the FROM value
      results.push({
        type: 'IDENTIFIER',
        value: 'FROM'
      });

      results.push({
        type: 'VALUE',
        value: value
      });
    }

    //  ╦╔╗╔╔═╗╔═╗╦═╗╔╦╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ║║║║╚═╗║╣ ╠╦╝ ║   ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╩╝╚╝╚═╝╚═╝╩╚═ ╩   ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    function processInsert(value) {

      // Add the insert statment
      results.push({
        type: 'IDENTIFIER',
        value: 'INSERT'
      });

      // Check if a value is being used
      if(_.isObject(value)) {

        _.each(_.keys(value), function(key) {
          results.push({
            type: 'KEY',
            value: key
          });

          results.push({
            type: 'VALUE',
            value: value[key]
          });
        });

        return;
      }
    }

    //  ╦╔╗╔╔╦╗╔═╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ║║║║ ║ ║ ║  ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╩╝╚╝ ╩ ╚═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    function processInto(value) {
      results.push({
        type: 'IDENTIFIER',
        value: 'INTO'
      });

      results.push({
        type: 'VALUE',
        value: value
      });
    }

    //  ╦ ╦╔═╗╔╦╗╔═╗╔╦╗╔═╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ║ ║╠═╝ ║║╠═╣ ║ ║╣   ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╚═╝╩  ═╩╝╩ ╩ ╩ ╚═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    function processUpdate(value) {

      // Add the update statment
      results.push({
        type: 'IDENTIFIER',
        value: 'UPDATE'
      });

      // Check if a value is being used
      if(_.isObject(value)) {

        _.each(_.keys(value), function(key) {
          results.push({
            type: 'KEY',
            value: key
          });

          results.push({
            type: 'VALUE',
            value: value[key]
          });
        });

        return;
      }
    }

    //  ╦ ╦╔═╗╦╔╗╔╔═╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ║ ║╚═╗║║║║║ ╦  ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╚═╝╚═╝╩╝╚╝╚═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    function processUsing(value) {
      results.push({
        type: 'IDENTIFIER',
        value: 'USING'
      });

      results.push({
        type: 'VALUE',
        value: value
      });
    }

    //  ╔╦╗╔═╗╦  ╔═╗╔╦╗╔═╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //   ║║║╣ ║  ║╣  ║ ║╣   ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ═╩╝╚═╝╩═╝╚═╝ ╩ ╚═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    function processDelete() {
      results.push({
        type: 'IDENTIFIER',
        value: 'DELETE'
      });
    }

    //  ╔╗╔╔═╗╔╦╗  ╔═╗╔═╗╔╗╔╔╦╗╦╔╦╗╦╔═╗╔╗╔
    //  ║║║║ ║ ║   ║  ║ ║║║║ ║║║ ║ ║║ ║║║║
    //  ╝╚╝╚═╝ ╩   ╚═╝╚═╝╝╚╝═╩╝╩ ╩ ╩╚═╝╝╚╝
    function processNot(value) {

      // Add a condition
      var condition = {
        type: 'CONDITION',
        value: 'NOT'
      };

      results.push(condition);

      // Tokenize the values within the condition
      if(_.isPlainObject(value)) {
        tokenizeObject(value, condition);
        return;
      }

      // Otherwise just add the value
      results.push({
        type: 'VALUE',
        value: value
      });
    }

    //  ╦╔╗╔  ╔═╗╔═╗╔╗╔╔╦╗╦╔╦╗╦╔═╗╔╗╔
    //  ║║║║  ║  ║ ║║║║ ║║║ ║ ║║ ║║║║
    //  ╩╝╚╝  ╚═╝╚═╝╝╚╝═╩╝╩ ╩ ╩╚═╝╝╚╝
    function processIn(value) {

      // Add a condition
      results.push({
        type: 'CONDITION',
        value: 'IN'
      });

      results.push({
        type: 'VALUE',
        value: value
      });
    }

    //  ╦ ╦╦ ╦╔═╗╦═╗╔═╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ║║║╠═╣║╣ ╠╦╝║╣   ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╚╩╝╩ ╩╚═╝╩╚═╚═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    function processWhere(value) {

      // Tokenize the where and then call the tokenizer on the where values
      results.push({
        type: 'IDENTIFIER',
        value: 'WHERE'
      });

      tokenizeObject(value);
    }

    //  ╔═╗╦═╗  ╔═╗╦═╗╔═╗╦ ╦╔═╗╦╔╗╔╔═╗
    //  ║ ║╠╦╝  ║ ╦╠╦╝║ ║║ ║╠═╝║║║║║ ╦
    //  ╚═╝╩╚═  ╚═╝╩╚═╚═╝╚═╝╩  ╩╝╚╝╚═╝
    function processOr(value) {

      // Add the Or token
      results.push({
        type: 'CONDITION',
        value: 'OR'
      });

      // For each condition in the OR, add a group token and process the criteria.
      _.forEach(value, function(criteria, idx) {

        // Start a group
        results.push({
          type: 'GROUP',
          value: idx
        });

        tokenizeObject(criteria);

        // End a group
        results.push({
          type: 'ENDGROUP',
          value: idx
        });

      });

      // Close the condition
      results.push({
        type: 'ENDCONDITION',
        value: 'OR'
      });
    }

    //   ╦╔═╗╦╔╗╔  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗╔═╗
    //   ║║ ║║║║║  ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║ ╚═╗
    //  ╚╝╚═╝╩╝╚╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩ ╚═╝
    function processJoin(value, joinType) {

      // Ensure we have an array value
      if(!_.isArray(value)) {
        value = [value];
      }

      _.each(value, function(joinInstructions) {

        // Add a JOIN token
        results.push({
          type: 'IDENTIFIER',
          value: joinType.toUpperCase()
        });

        // Ensure the instructions include a FROM and an ON and that the ON
        // is made up of two table keys.
        if(!_.has(joinInstructions, 'from') || !_.has(joinInstructions, 'on')) {
          throw new Error('Invalid join instructions');
        }

        // Check if this is an AND or an OR join statement. An AND statement will
        // just be an array of conditions and an OR statement will have a single
        // OR key as the value.

        // Process AND
        if(_.isArray(joinInstructions.on)) {
          (function() {
            var JOIN_TABLE = joinInstructions.from;
            var joinResults = [
              { type: 'KEY', value: 'TABLE' },
              { type: 'VALUE', value: JOIN_TABLE }
            ];

            _.each(joinInstructions.on, function(set, idx) {
              var PARENT_TABLE = _.first(_.keys(set));
              var CHILD_TABLE = _.keys(set)[1];
              var PARENT_COLUMN = set[_.first(_.keys(set))];
              var CHILD_COLUMN = set[_.keys(set)[1]];

              var setKeys = [
                { type: 'COMBINATOR', value: 'AND' },
                { type: 'KEY', value: 'TABLE_KEY' },
                { type: 'VALUE', value: PARENT_TABLE },
                { type: 'KEY', value: 'COLUMN_KEY' },
                { type: 'VALUE', value: PARENT_COLUMN },
                { type: 'KEY', value: 'TABLE_KEY' },
                { type: 'VALUE', value: CHILD_TABLE },
                { type: 'KEY', value: 'COLUMN_KEY' },
                { type: 'VALUE', value: CHILD_COLUMN }
              ];

              joinResults = joinResults.concat(setKeys);
            });

            // Add the join results to the token set
            results = results.concat(joinResults);
          })();
        }

        // Process OR
        else if(_.isArray(joinInstructions.on.or)) {
          (function() {
            var JOIN_TABLE = joinInstructions.from;
            var joinResults = [
              { type: 'KEY', value: 'TABLE' },
              { type: 'VALUE', value: JOIN_TABLE }
            ];

            _.each(joinInstructions.on.or, function(set, idx) {
              var PARENT_TABLE = _.first(_.keys(set));
              var CHILD_TABLE = _.keys(set)[1];
              var PARENT_COLUMN = set[_.first(_.keys(set))];
              var CHILD_COLUMN = set[_.keys(set)[1]];

              var setKeys = [
                { type: 'COMBINATOR', value: 'OR' },
                { type: 'KEY', value: 'TABLE_KEY' },
                { type: 'VALUE', value: PARENT_TABLE },
                { type: 'KEY', value: 'COLUMN_KEY' },
                { type: 'VALUE', value: PARENT_COLUMN },
                { type: 'KEY', value: 'TABLE_KEY' },
                { type: 'VALUE', value: CHILD_TABLE },
                { type: 'KEY', value: 'COLUMN_KEY' },
                { type: 'VALUE', value: CHILD_COLUMN }
              ];

              joinResults = joinResults.concat(setKeys);
            });

            // Add the join results to the token set
            results = results.concat(joinResults);
          })();
        }

        // Otherwise ensure that the ON key has two keys
        else if(!_.isPlainObject(joinInstructions.on) || _.keys(joinInstructions.on).length !== 2) {
          throw new Error('Invalid join instructions');
        }

        // Handle normal, single level joins
        else {
          (function() {
            var JOIN_TABLE = joinInstructions.from;
            var PARENT_TABLE = _.first(_.keys(joinInstructions.on));
            var CHILD_TABLE = _.keys(joinInstructions.on)[1];
            var PARENT_COLUMN = joinInstructions.on[_.first(_.keys(joinInstructions.on))];
            var CHILD_COLUMN = joinInstructions.on[_.keys(joinInstructions.on)[1]];

            var joinResults = [
              { type: 'KEY', value: 'TABLE' },
              { type: 'VALUE', value: JOIN_TABLE },
              { type: 'KEY', value: 'TABLE_KEY' },
              { type: 'VALUE', value: PARENT_TABLE },
              { type: 'KEY', value: 'COLUMN_KEY' },
              { type: 'VALUE', value: PARENT_COLUMN },
              { type: 'KEY', value: 'TABLE_KEY' },
              { type: 'VALUE', value: CHILD_TABLE },
              { type: 'KEY', value: 'COLUMN_KEY' },
              { type: 'VALUE', value: CHILD_COLUMN }
            ];

            results = results.concat(joinResults);
          })();
        }
      });
    }

    //  ╔═╗╦═╗╔═╗╦ ╦╔═╗  ╔╗ ╦ ╦
    //  ║ ╦╠╦╝║ ║║ ║╠═╝  ╠╩╗╚╦╝
    //  ╚═╝╩╚═╚═╝╚═╝╩    ╚═╝ ╩
    function processGroupBy(value) {
      results.push({
        type: 'IDENTIFIER',
        value: 'GROUPBY'
      });

      results.push({
        type: 'VALUE',
        value: value
      });
    }

    //  ╔═╗╦═╗╔╦╗╔═╗╦═╗  ╔╗ ╦ ╦
    //  ║ ║╠╦╝ ║║║╣ ╠╦╝  ╠╩╗╚╦╝
    //  ╚═╝╩╚══╩╝╚═╝╩╚═  ╚═╝ ╩
    function processOrderBy(values) {
      // Tokenize the order by and then call the tokenizer on the values
      results.push({
        type: 'IDENTIFIER',
        value: 'ORDERBY'
      });

      if(!_.isArray(values)) {
        values = [values];
      }

      _.each(values, function(tokenSet) {
        tokenizeObject(tokenSet);
      });
    }

    //  ╔═╗╔═╗╔═╗╦═╗╔═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣║ ╦║ ╦╠╦╝║╣ ║ ╦╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╩╚═╚═╝╚═╝╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    function processAggregations(value, aggregation) {
      results.push({
        type: 'IDENTIFIER',
        value: aggregation
      });

      results.push({
        type: 'VALUE',
        value: value
      });
    }

    //  ╔═╗╔═╗╔═╗╦╔╗╔╔═╗╔╦╗╦╔═╗╔╗╔
    //  ╠═╝╠═╣║ ╦║║║║╠═╣ ║ ║║ ║║║║
    //  ╩  ╩ ╩╚═╝╩╝╚╝╩ ╩ ╩ ╩╚═╝╝╚╝
    function processPagination(value, operator) {
      results.push({
        type: 'IDENTIFIER',
        value: operator
      });

      results.push({
        type: 'VALUE',
        value: value
      });
    }

    //  ████████╗ ██████╗ ██╗  ██╗███████╗███╗   ██╗██╗███████╗███████╗██████╗
    //  ╚══██╔══╝██╔═══██╗██║ ██╔╝██╔════╝████╗  ██║██║╚══███╔╝██╔════╝██╔══██╗
    //     ██║   ██║   ██║█████╔╝ █████╗  ██╔██╗ ██║██║  ███╔╝ █████╗  ██████╔╝
    //     ██║   ██║   ██║██╔═██╗ ██╔══╝  ██║╚██╗██║██║ ███╔╝  ██╔══╝  ██╔══██╗
    //     ██║   ╚██████╔╝██║  ██╗███████╗██║ ╚████║██║███████╗███████╗██║  ██║
    //     ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝╚══════╝╚══════╝╚═╝  ╚═╝
    //
    // @obj {Object} - the token obj being processed
    // @processor {Object} - a value to insert between each key in the array
    function tokenizeObject(obj, processor, parent) {

      _.each(_.keys(obj), function(key, idx) {
        // Check if the key is a known identifier
        var isIdentitifier = identifiers[key];

        // If so, look ahead at it's value to determine what to do next.
        if(isIdentitifier) {

          // If the identifier is an OPERATOR, add it's tokens
          if(identifiers[key] === 'OPERATOR') {

            // If there is a parent and the previous key in the results isn't
            // a KEY add it's key first. This is used when a key has multiple
            // criteria. EX: { values: { '>': 100, '<': 200 }}
            if(parent && _.last(results).type !== 'KEY') {
              results.push({
                type: 'KEY',
                value: parent
              });
            }

            processOperator(key, obj[key]);
            return;
          }

          // If the identifier is a SELECT, add it's token
          if(identifiers[key] === 'SELECT') {
            processSelect(obj[key]);
            return;
          }

          // If the identifier is a FROM, add it's token
          if(identifiers[key] === 'FROM') {
            processFrom(obj[key]);
            return;
          }

          // If the identifier is an INSERT, add it's token
          if(identifiers[key] === 'INSERT') {
            processInsert(obj[key]);
            return;
          }

          // If the identifier is an INTO, add it's token
          if(identifiers[key] === 'INTO') {
            processInto(obj[key]);
            return;
          }

          // If the identifier is an UPDATE, add it's token
          if(identifiers[key] === 'UPDATE') {
            processUpdate(obj[key]);
            return;
          }

          // If the identifier is an USING, add it's token
          if(identifiers[key] === 'USING') {
            processUsing(obj[key]);
            return;
          }

          // If the identifier is a DELETE, add it's token
          if(identifiers[key] === 'DELETE') {
            processDelete(obj[key]);
            return;
          }

          // If the identifier is a WHERE, add it's token and process it's values
          if(identifiers[key] === 'WHERE') {
            processWhere(obj[key]);
            return;
          }

          // If the identifier is a GROUP BY aggregation
          if(identifiers[key] === 'GROUPBY') {
            processGroupBy(obj[key]);
            return;
          }

          // If the identifier is an ORDER BY, add the sort options
          if(identifiers[key] === 'ORDERBY') {
            processOrderBy(obj[key]);
            return;
          }

          // If the identifier is a COUNT
          if(identifiers[key] === 'COUNT') {
            processAggregations(obj[key], 'COUNT');
            return;
          }

          // If the identifier is a MIN
          if(identifiers[key] === 'MIN') {
            processAggregations(obj[key], 'MIN');
            return;
          }

          // If the identifier is a MAX
          if(identifiers[key] === 'MAX') {
            processAggregations(obj[key], 'MAX');
            return;
          }

          // If the identifier is a SUM
          if(identifiers[key] === 'SUM') {
            processAggregations(obj[key], 'SUM');
            return;
          }

          // If the identifier is a AVG
          if(identifiers[key] === 'AVG') {
            processAggregations(obj[key], 'AVG');
            return;
          }

          // If the identifier is an OR, start a group and add each token.
          if(identifiers[key] === 'OR') {
            processOr(obj[key]);
            return;
          }

          if(identifiers[key] === 'NOT') {
            processNot(obj[key]);
            return;
          }

          if(identifiers[key] === 'IN') {
            processIn(obj[key]);
            return;
          }

          if(identifiers[key] === 'LIMIT') {
            processPagination(obj[key], 'LIMIT');
            return;
          }

          if(identifiers[key] === 'OFFSET') {
            processPagination(obj[key], 'OFFSET');
            return;
          }

          // If the identifier is a JOIN, add it's token and process the joins
          if(identifiers[key] === 'JOIN') {
            processJoin(obj[key], key);
            return;
          }


          // Add the identifier
          results.push({
            type: identifiers[key],
            value: key
          });

          // If the identifier is an array, loop through each item and tokenize
          if(_.isArray(obj[key])) {
            _.each(obj[key], function(expr) {
              tokenizeObject(expr);
            });

            return;
          }

          // If the identifier is an object, continue tokenizing it
          if(_.isPlainObject(obj[key])) {
            tokenizeObject(obj[key], undefined, key);
            return;
          }

          // Otherwise WTF?
          return;
        }

        // Otherwise add the token for the key
        results.push({
          type: 'KEY',
          value: key
        });

        // If the value is an object, recursively parse it
        if(_.isPlainObject(obj[key])) {
          tokenizeObject(obj[key], undefined, key);
          return;
        }

        // If the value is a primitive add it's token
        results.push({
          type: 'VALUE',
          value: obj[key]
        });

        // If there is a processor and we are not on the last key, add it as well.
        // This is used for things like:
        // {
        //   not: {
        //     firstName: 'foo',
        //     lastName: 'bar'
        //   }
        // }
        // Where we need to insert a NOT statement between each key
        if(processor && (_.keys(obj).length > idx+1)) {
          results.push(processor);
        }
      });
    }

    tokenizeObject(expression);

    return exits.success(results);
  },



};
