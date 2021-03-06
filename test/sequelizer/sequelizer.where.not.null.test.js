var Sequelizer = require('../../index').sequelizer;
var analyze = require('../support/analyze');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('WHERE NOT NULL statements', function() {

    it('should generate a query with a simple WHERE statement', function(done) {
      var tree = analyze({
        select: '*',
        from: 'users',
        where: {
          not: {
            updatedAt: null
          }
        }
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result, 'select * from "users" where "updatedAt" is not null');
        return done();
      });
    });

  });
});
