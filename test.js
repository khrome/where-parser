var should = require("should");
var request = require("request");
var type = require('prime/util/type');
var WhereParser = require('./where-parser');

describe('WhereParser', function(){
    var parser;
    
    before(function(){
        parser = new WhereParser();
    })
    
    it('parses a single level', function(done){
        var parsed = parser.parse("department='Police' and division='Investigations and Crime Prev Serv'");
        parsed.length.should.equal(3);
        
        parsed[0].type.should.equal('expression');
        parsed[0].key.should.equal('department');
        parsed[0].operator.should.equal('=');
        parsed[0].value.should.equal('Police');
        
        parsed[1].type.should.equal('conjunction');
        parsed[1].value.should.equal('and');
        
        parsed[2].type.should.equal('expression');
        parsed[2].key.should.equal('division');
        parsed[2].operator.should.equal('=');
        parsed[2].value.should.equal('Investigations and Crime Prev Serv');
        
        done();
    });
    
    it('parses multiple levels', function(done){
        var parsed = parser.parse("blah=something and (blargh<>'oatmeal n things' or thisotherthing=suck)")
        parsed.length.should.equal(3);
        
        parsed[0].type.should.equal('expression');
        parsed[0].key.should.equal('blah');
        parsed[0].operator.should.equal('=');
        parsed[0].value.should.equal('something');
        
        parsed[1].type.should.equal('conjunction');
        parsed[1].value.should.equal('and');
        
        type(parsed[2]).should.equal('array');
        parsed[2].length.should.equal(3);
        
        parsed[2][0].type.should.equal('expression');
        parsed[2][0].key.should.equal('blargh');
        parsed[2][0].operator.should.equal('<>');
        parsed[2][0].value.should.equal('oatmeal n things');
        
        parsed[2][1].type.should.equal('conjunction');
        parsed[2][1].value.should.equal('or');
        
        parsed[2][2].type.should.equal('expression');
        parsed[2][2].key.should.equal('thisotherthing');
        parsed[2][2].operator.should.equal('=');
        parsed[2][2].value.should.equal('suck');
        
        done();
    });
});