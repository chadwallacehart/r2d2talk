/**
 * Created by chad on 2/24/17.
 */

//ToDo: deprecate this after testing the load function in r2d2talk.js

const Nedb = require("nedb"),                                   //simple text database
    preload = require("../db/top1000.json").oneThousandWords;       //top 1000 words from https://github.com/first20hours/google-10000-english/blob/master/google-10000-english-usa-no-swears.txt

const db = new Nedb({filename: '../db/r2d2db.txt', autoload: true});

//Enforce unique indexes on soundNum and words;
// nedb doesn't allow indexing on arrays, so soundNum converted to a string

db.ensureIndex({fieldName: 'soundNum', unique: true, sparse: true}, (err) => {
    if (err != null)
        console.log("soundNum index error: " + err);
});

db.ensureIndex({fieldName: 'word', unique: true, sparse: true}, (err) => {
    if (err != null)
        console.log("word index error: " + err);
});

let docCount = 0;
const phonemes = 80;

//first check to see if the object is in the DB and return that object
function checkDb(obj, cb) {

    db.findOne(obj, (err, doc) => {
        if (err)
            console.log("database find error; " + err);
        if (doc != null)
            cb(doc);
        else
            cb();
    });
}

//get the database document count
function loadDb(cb) {
    db.find({}, (err, docs) => {
        if (err)
            console.log("database error; " + err);

        docCount = docs.length;

        console.log("words in db: " + JSON.stringify(docCount));

        console.log(docCount + " documents loaded from database");
        cb();
    })
}

//makes a new unused, random soundref array
function randNum() {
    //ToDo: make this so it works with any number of syllables
    //ToDo: add callbacks

    let res = [];
    const maxsize = Math.pow(phonemes, 3) + Math.pow(phonemes, 2) + phonemes;

    if (docCount < phonemes)
        res = [Math.floor((Math.random() * phonemes) + 1)];
    else if (docCount < Math.pow(phonemes, 2) + phonemes)
        res = [
            Math.floor((Math.random() * phonemes) + 1),
            Math.floor((Math.random() * phonemes) + 1)
        ];
    else if (docCount < maxsize)
        res = [
            Math.floor((Math.random() * phonemes) + 1),
            Math.floor((Math.random() * phonemes) + 1),
            Math.floor((Math.random() * phonemes) + 1)
        ];
    else if (docCount >= maxsize) {
        let err = "Error: dictionary exceeded " + maxsize;
        console.error(err);
        return null;
    }
    else {
        console.error("randNum error");
        return null;
    }

    return res;
}

//Add a new word to the DB
function insert(word, callback) {

    function getUniqueNum(cb) {
        let rand = randNum();

        if (rand === null)
            return null;

        return cb(rand);
    }

    function insertWord(n, cb) {
        if (!n)
            return;

        db.insert({word: word, soundNum: JSON.stringify(n), source: "top1000"}, (err, doc) => {
            if (err) {
                // error object not much help: err.errorType == "uniqueViolated"
                // but doesn't tell you the index, so just try a new soundref
                if (err.errorType === "uniqueViolated") {
                    insert(word, callback);
                }
                else
                    console.log("database insert error; " + err);
            }
            else {
                docCount++;
                console.log("docCount: " + docCount);
                cb(doc);
            }
        });
    }

    getUniqueNum(
        (uniq) => insertWord(uniq, (d) => callback(d)));
}

//Adds many words and then returns a callback
function insertMany(words, callback) {

    let itemsProcessed = 0;
    words.forEach((item, index, words) => {

        insert(item, (obj) => {
            console.log(obj);
            itemsProcessed++;
            if (itemsProcessed === words.length) {
                callback("done");
            }
        });

    });
}

loadDb(() => insertMany(preload, (obj) => console.log(obj)));

module.exports = loadDb;
