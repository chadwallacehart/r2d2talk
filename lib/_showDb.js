/**
 * Created by chad on 2/19/17.
 */

//ToDo: deprecate this after testing this function in r2d2talk.js

let Nedb = require("nedb"),                             //simple text database
db = new Nedb({filename: '../db/r2d2db.txt', autoload: true});

db.find({}).sort({'word': 1}).exec(function (err, docs) {
    if (err)
        console.log("database error; " + err);
    docs.forEach(function (doc) {
        console.log(JSON.stringify(doc));
    });
});