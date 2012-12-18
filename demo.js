var WhereParser = require('./where-parser');
var parser = new WhereParser();
console.log(parser.parse("department='Police' and division='Investigations and Crime Prev Serv'"));
console.log(parser.parse("blah=something and (blargh<>'oatmeal n things' or thisotherthing=suck)"));