/**
 * Created by chad on 2/19/17.
 */
var Nedb = require("nedb"),                             //simple text database
db = new Nedb({filename: 'r2d2db.txt', autoload: true});    //simple text database

db.remove({}, {multi: true}, function (err, numRemoved) {
    console.log("Deleted " + numRemoved + " documents");
});