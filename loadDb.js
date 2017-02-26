/**
 * Created by chad on 2/24/17.
 */

const Nedb = require("nedb"),                                   //simple text database
    player = require("./playSounds"),                           //plays sounds locally using afplay (linux)
    preload = require("./top1000.json").oneThousandWords;       //top 1000 words from https://github.com/first20hours/google-10000-english/blob/master/google-10000-english-usa-no-swears.txt

const db = new Nedb({filename: 'r2d2db.txt', autoload: true});

 db.ensureIndex({fieldName: 'soundNum', unique: true, sparse: true}, (err) => {
 if(err != null)
 console.log("soundNum index error: " + err);
 });

db.ensureIndex({fieldName: 'word', unique: true, sparse: true}, (err) => {
    if (err != null)
        console.log("word index error: " + err);
});

let docCount = 0;
const phonemes = 80;

//const soundDir = "./audio/";
let playList = [];
/*    ,
    words = [],
    soundNums = [];*/

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

function loadDb(cb) {
    db.find({},  (err, docs) => {
        if (err)
            console.log("database error; " + err);

        docCount = docs.length;

/*        docs.forEach( (doc) => {
            words.push(doc.word);
            soundNums.push(doc.soundNum);
        });
*/
        console.log("words in db: " + JSON.stringify(docCount));

        console.log(docCount + " documents loaded from database");
        cb();
    })
}

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
    else if (docCount < maxsize )
        res = [
            Math.floor((Math.random() * phonemes) + 1),
            Math.floor((Math.random() * phonemes) + 1),
            Math.floor((Math.random() * phonemes) + 1)
        ];
    else if (docCount >= maxsize){
        let err = "Error: dictionary exceeded " + maxsize;
        console.error(err);
        return null;
    }
    else{
        console.error("randNum error");
        return null;
    }

    //console.log(res);
    //cb(res);
    return res;
}

function insert(word, callback) {

/*    function valueInArray(value, array) {
        return array.indexOf(value) > -1;
    }
*/
    function getUniqueNum(cb) {
        let rand = randNum();
/*        if (valueInArray(rand, soundNums)) {
            console.log(rand + " in array");
            looper();
        }*/

        if (rand == null)
            return null;

        //soundNums.push(rand);   //reserve this
        //console.log(rand + " is unique");
        return cb(rand);
    }

    function insertWord(n, cb) {
        if(!n)
            return;

        db.insert({word: word, soundNum: JSON.stringify(n)}, (err, doc) => {
            if (err) {
                // error object not much help: err.errorType == "uniqueViolated"  but doesn't tell you the index
                if (err.errorType == "uniqueViolated") {
                    insert(word, callback);
                }
                else
                    console.log("database insert error; " + err);
            }
            else {
                //words.push(word);
                docCount++;
                console.log("docCount: " + docCount);
                cb(doc);
            }
        });
    }

    getUniqueNum(
        (uniq) => insertWord(uniq, (d) => callback(d)));
}

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

//loadDb(() => insert("six", (obj) => console.log(obj)));
let testLoad = [];
for (x=1; x<=45; x++){
    testLoad.push(x);
}
//console.log(JSON.stringify(testLoad));

loadDb(() => insertMany(preload, (obj) => console.log(obj)));
