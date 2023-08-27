/**
 * A JSON object
 * @typedef { object } JSON
 */
const array_contains = function(haystack, needle){
    return haystack.indexOf(needle) != -1;
};
/**
 * Creates a new WhereParser.
 * @class
 */
export const WhereParser = function(){};
WhereParser.prototype = {
    blockOpen : '(',
    blockClose : ')',
    escapeOpen : '\'',
    escapeClose : '\'',
    sentinels : ['and', 'or', '&&', '||'],
    operators : ['=', '<', '>', '!'],
    textEscape : ['\''],
    /** 
     * @function
     * @name parse
     * @param {string} query - SQL where predicate to be parsed
     * @returns { JSON }
     */
    parse : function(query){
        return this.parse_where(query);
    },
    parse_where : function(clause){
        let blocks = this.parse_blocks(clause);
        let phrases = this.parse_compound_phrases(blocks, []);
        let object = this;
        let parsed = phrases.map(function mapFunction(value){
            if(Array.isArray(value)){
                return value.map(mapFunction);
            }else{
                if(array_contains(object.sentinels, value.toLowerCase())){
                    return {
                        type : 'conjunction',
                        value : value
                    };
                }else{
                    return object.parse_discriminant(value);
                }
            }
        });
        return parsed;
    },
    parse_discriminant : function(text){
        let key = '';
        let operator = '';
        let value = '';
        let inQuote = false;
        let ch;
        for(let lcv=0; lcv < text.length; lcv++){
            ch = text[lcv];
            if(inQuote && ch === inQuote){
                inQuote = false;
                continue;
            }
            if( (!inQuote) && array_contains(this.textEscape, ch)){
                inQuote = ch;
                continue;
            }
            if(array_contains(this.operators, ch)){
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
        let ch;
        let env = [];
        let stack = [];
        let textMode = false;
        let text = '';
        let root = env;
        for(let lcv=0; lcv < parseableText.length; lcv++){
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
                let newEnvironment = [];
                env.push(newEnvironment);
                stack.push(this.env || env);
                env = newEnvironment;
                text = '';
                continue;
            }
            if(ch === this.blockClose){
                if(text.trim() !== '') env.push(text);
                //delete env;
                env = null;
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
        let ob = this;
        data.forEach(function(item){
            let theType = Array.isArray(item)?'array':typeof item;
            if(theType == 'array'){
                let results = ob.parse_compound_phrases(item, []);
                result.push(results);
            }else if(theType == 'string'){
                result = result.concat(ob.parse_compound_phrase(item)).filter(function(item){
                    return item !==  '';
                });
            }
        });
        return result;
    },
    parse_compound_phrase : function(clause){
        let inText = false;
        let escape = '';
        let current = '';
        let results = [''];
        let ch;
        for(let lcv=0; lcv < clause.length; lcv++){
            ch = clause[lcv];
            if(inText){
                results[results.length-1] += current+ch;
                current = '';
                if(ch === escape) inText = false;
            }else{
                if(array_contains(this.textEscape, ch)){
                    inText = true;
                    escape = ch;
                }
                if(ch != ' '){
                    current += ch;
                    if(array_contains(this.sentinels, current.toLowerCase())){
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
};
WhereParser.prototype.constructor = WhereParser;