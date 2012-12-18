var prime = require('prime');
var type = require('prime/util/type');
var array = require('prime/es5/array');
var fn = require('prime/es5/function');
array.contains = function(haystack, needle){
    return haystack.indexOf(needle) != -1;
};
var WhereParser = prime({
    blockOpen : '(',
    blockClose : ')',
    escapeOpen : '\'',
    escapeClose : '\'',
    sentinels : ['and', 'or', '&&', '||'],
    operators : ['=', '<', '>', '!'],
    textEscape : ['\''],
    parse : function(query){
        return this.parse_where(query);
    },
    parse_where : function(clause){
        var blocks = this.parse_blocks(clause);
        var phrases = this.parse_compound_phrases(blocks, []);
        var object = this;
        var mapFunction = function(value){
            if(type(value) == 'array'){
                return value.map(mapFunction);
            }else{
                if(array.contains(object.sentinels, value.toLowerCase())){
                    return {
                        type : 'conjunction',
                        value : value
                    }
                }else{
                    return object.parse_discriminant(value);
                }
            }
        };
        var parsed = phrases.map(mapFunction);
        return parsed;
    },
    parse_discriminant : function(text){
        var key = '';
        var operator = '';
        var value = '';
        var inQuote = false;
        var openQuote = '';
        var ch;
        for(var lcv=0; lcv < text.length; lcv++){
            ch = text[lcv];
            if(inQuote && ch === inQuote){
                inQuote = false;
                continue;
            }
            if( (!inQuote) && array.contains(this.textEscape, ch)){
                inQuote = ch;
                continue;
            }
            if(array.contains(this.operators, ch)){
                operator += ch;
                continue;
            }
            if(operator !== '') value += ch;
            else key += ch;
        }
        return {
            type : 'expression',
            key : key,
            operator : operator,
            value : value
        };
    },
    parse_blocks : function(parseableText){
        var ch;
        var env = [];
        var stack = [];
        var textMode = false;
        var text = '';
        var root = env;
        for(var lcv=0; lcv < parseableText.length; lcv++){
            ch = parseableText[lcv];
            if(textMode){
                text += ch;
                if(ch === this.escapeClose) textMode = false;
                continue;
            }
            if(ch === this.escapeOpen){
                text += ch;
                textMode = true;
                continue;
            }
            if(ch === this.blockOpen){
                if(text.trim() !== '') env.push(text);
                var newEnvironment = [];
                env.push(newEnvironment);
                stack.push(this.env);
                env = newEnvironment;
                text = '';
                continue;
            }
            if(ch === this.blockClose){
                if(text.trim() !== '') env.push(text);
                delete env;
                env = stack.pop();
                text = '';
                continue;
            }
            text += ch;
        }
        if(text.trim() !== '') env.push(text);
        return root;
    },
    parse_compound_phrases : function(data, result){
        array.forEach(data, fn.bind(function(item){
            var theType = type(item);
            if(theType == 'array'){
                var results = this.parse_compound_phrases(item, []);
                result.push(results);
            }else if(theType == 'string'){
                result = this.parse_compound_phrase(item);
            }
        }, this));
        return result;
    },
    parse_compound_phrase : function(clause){
        var inText = false;
        var escape = '';
        var current = '';
        var results = [''];
        var ch;
        for(var lcv=0; lcv < clause.length; lcv++){
            ch = clause[lcv];
            if(inText){
                results[results.length-1] += current+ch;
                current = '';
                if(ch === escape) inText = false;
            }else{
                if(array.contains(this.textEscape, ch)){
                    inText = true;
                    escape = ch;
                }
                if(ch != ' '){
                    current += ch;
                    if(array.contains(this.sentinels, current.toLowerCase())){
                        results.push(current);
                        results.push('');
                        current = '';
                    }
                }else{
                    results[results.length-1] += current;
                    current = '';
                }
            }
        }
        if(current != '') results[results.length-1] += current;
        if(results[results.length-1] === '') results.pop();
        return results;
    }
});
module.exports = WhereParser;