where-parser.js
==============
An NPM for parsing SQL where clauses

Usage
-----
First include the module:

    var WhereParser = require('./where-parser');

then, instantiate the object:

    var parser = new WhereParser();
    
now you can issue queries:

    parse.parse(myWhereClause)

and you'll get back a tree of objects where each node is one of:

    {
        type: 'expression',
        key: '<key>',
        operator: <operator>,
        value: <value>
    }    


    {
        type: 'conjunction',
        value: <value>
    }    

    []
    

Testing
-------

Run the tests at the project root with:

    mocha

Enjoy,

-Abbey Hawk Sparrow