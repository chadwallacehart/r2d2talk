/**
 * Created by chad on 2/19/17.
 */
let Nedb = require("nedb"),                             //simple text database
db = new Nedb({filename: 'r2d2db.txt', autoload: true});

db.find({}).sort({'word': 1}).exec(function (err, docs) {
    if (err)
        console.log("database error; " + err);
    docs.forEach(function (doc) {
        console.log(JSON.stringify(doc));
    });
});