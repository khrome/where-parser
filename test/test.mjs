/* global describe:false, before:false */
import { it } from '@open-automaton/moka';
import { chai } from '@environment-safe/chai';
import { WhereParser } from '../src/index.mjs';
const should = chai.should();

describe('where-parser', ()=>{
    describe('performs a simple test suite', ()=>{
        let parser;
        
        before(function(){
            parser = new WhereParser();
        });
        
        it('parses a single level', function(){
            should.exist(parser);
            const parsed = parser.parse(
                // eslint-disable-next-line quotes
                "department='Police' and division='Investigations and Crime Prev Serv'"
            );
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
            
            
            parser.parse('(a = b) or false');
            parser.parse('false or (a = b)');
        });
        
        it('parses multiple levels', function(){
            const parsed = parser.parse(
                // eslint-disable-next-line quotes
                "blah=something and (blargh<>'oatmeal n things' or thisotherthing=suck)"
            );
            parsed.length.should.equal(3);
            
            parsed[0].type.should.equal('expression');
            parsed[0].key.should.equal('blah');
            parsed[0].operator.should.equal('=');
            parsed[0].value.should.equal('something');
            
            parsed[1].type.should.equal('conjunction');
            parsed[1].value.should.equal('and');
            
            Array.isArray(parsed[2]).should.equal(true);
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
        });
        
        it('parses an opening parenthetical', function(){
            const parsed = parser.parse('(a = b) or false');
            
            parsed.length.should.equal(3);
            
            Array.isArray(parsed[0]).should.equal(true);
            parsed[0][0].type.should.equal('expression');
            parsed[0][0].key.should.equal('a');
            parsed[0][0].operator.should.equal('=');
            parsed[0][0].value.should.equal('b');
            
            parsed[1].type.should.equal('conjunction');
            parsed[1].value.should.equal('or');
            
            parsed[2].type.should.equal('expression');
            parsed[2].key.should.equal('false');
        });
        
        it('parses a 3 part boolean with internal parenthetical', function(){
            const parsed = parser.parse('false or (a=b) or true');
            
            parsed.length.should.equal(5);
            
            parsed[0].type.should.equal('expression');
            parsed[0].key.should.equal('false');
            
            parsed[1].type.should.equal('conjunction');
            parsed[1].value.should.equal('or');
            
            Array.isArray(parsed[2]).should.equal(true);
            parsed[2][0].type.should.equal('expression');
            parsed[2][0].key.should.equal('a');
            parsed[2][0].operator.should.equal('=');
            parsed[2][0].value.should.equal('b');
            
            parsed[3].type.should.equal('conjunction');
            parsed[3].value.should.equal('or');
            
            parsed[4].type.should.equal('expression');
            parsed[4].key.should.equal('true');
            
            //another case:
            
            const parsed2 = parser.parse('false or ((a=b) or true)');
            parsed2[0].type.should.equal('expression');
            parsed2[0].key.should.equal('false');
            
            parsed2[1].type.should.equal('conjunction');
            parsed2[1].value.should.equal('or');
            
            Array.isArray(parsed2[2]).should.equal(true);
            
            Array.isArray(parsed2[2][0]).should.equal(true);
            parsed2[2][0][0].type.should.equal('expression');
            parsed2[2][0][0].key.should.equal('a');
            parsed2[2][0][0].operator.should.equal('=');
            parsed2[2][0][0].value.should.equal('b');
            
            parsed2[2][1].type.should.equal('conjunction');
            parsed2[2][1].value.should.equal('or');
            
            parsed2[2][2].type.should.equal('expression');
            parsed2[2][2].key.should.equal('true');
        });
    });
});

