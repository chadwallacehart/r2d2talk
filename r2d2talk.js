/**
 * Created by chad on 2/24/17.
 */

/****** Load Database ******/
const Nedb = require("nedb");                                 //simple text database
const db = new Nedb({filename: './db/r2d2db.txt', autoload: true});

db.ensureIndex({fieldName: 'soundNum', unique: true, sparse: true}, (err) => {
    if (err !== null)
        console.log("soundNum index error: " + err);
});

db.ensureIndex({fieldName: 'word', unique: true, sparse: true}, (err) => {
    if (err !== null)
        console.log("word index error: " + err);
});

const preload = require("./db/top1000.json").oneThousandWords;       //top 1000 words from https://github.com/first20hours/google-10000-english/blob/master/google-10000-english-usa-no-swears.txt

/****** Sound player setup ******/
const player = require("./lib/playSounds.js");       //plays sounds locally using afplay (linux)
const soundDir = "./audio/";


/****** module logic ******/

let docCount = 0;
const phonemes = 80;    //ToDo: count files in the audio dir to compute this
let words = [];
const interwordPause = 25;

//ToDo: break these up into separate module and add CLI options

function randNum(cb) {
    //ToDo: make this so it works with any number of syllables
    //ToDo: promises?

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

    //ToDo: test this callback
    if (cb)
        return (cb(res));
    else
        return res;
}

function insert(word, source, callback) {

    function getUniqueNum(cb) {
        let rand = randNum();

        if (rand === null)
            return null;
        else
            return cb(rand);
    }

    function insertWord(n, cb) {
        if (!n)
            return;

        //todo: see why this isn't saving
        db.insert({word: word, soundNum: JSON.stringify(n), source: source}, (err, doc) => {
            if (err) {
                // error object not much help: err.errorType == "uniqueViolated"  but doesn't tell you the index
                if (err.errorType === "uniqueViolated") {
                    console.log("uniqueViolated");
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

function mapSound(searchWord, callback) {
    let sounds = [];
    db.findOne({word: searchWord}, (err, doc) => {
        if (err)
            console.log("database error; " + err);

        if (doc) {
            JSON.parse(doc.soundNum).forEach((s) => {
                sounds.push(soundDir + s + ".mp3");
            });
            callback(sounds);
        }
        else {
            insert(searchWord, "user", (doc) => //console.log(doc)
                JSON.parse(doc.soundNum).forEach((s) => {
                    sounds.push(soundDir + s + ".mp3");
                    if (sounds.length === JSON.parse(doc.soundNum).length)
                        callback(sounds);
                }));
        }
    });
}

let dbLoaded = false;

function loadDb(cb) {
    //callback version
    if (cb) {
        db.find({}, (err, docs) => {
            if (err)
                console.log("database error; " + err);

            docCount = docs.length;

            dbLoaded = true;
            console.log("words in db: " + JSON.stringify(docCount));
            cb();
        })
    }
    //promise version
    else
        return new Promise((resolve, reject) => {
            db.find({}, (err, docs) => {
                if (err) {
                    console.log("database error; " + err);
                    reject(err);
                }

                docCount = docs.length;
                dbLoaded = true;
                console.log("words in db: " + JSON.stringify(docCount));
                resolve();
            })
        });
}

//strip punctuation and separate the input into words
function parseInput(input) {
    return new Promise((resolve, reject) => {

        //Exit if the db isn't ready yet
        if (dbLoaded === false)
            reject("Error: word DB not loaded");


        //If the input is a number then pause
        if (!isNaN(input)) {
            console.log("queuing pause for " + input);
            player(+input);   //convert to number
            resolve();
        }

        input.match(/\w+/gi).forEach((w) => words.push(w));

        function playWords() {
            let currentWord = words.shift().toLowerCase();

            mapSound(currentWord, (sounds) => {
                console.log("queuing " + currentWord + " : " + sounds);

                player(sounds);

                //if there is more than one word add a pause
                if(words.length > 0){
                    console.log("queuing inter-word pause");
                    player(interwordPause);
                    playWords();
                }
                else{
                    resolve();
                }
            });
        }

        playWords();
    });
}

//ToDo: validate these so I can deprecate the individual *Db.js files

//ToDo: figure out why this gives a callback error here but not in _loadDb.js
//Adds many words and then returns a callback
function insertMany(words, source, callback) {

    let itemsProcessed = 0;
    words.forEach((item, index, words) => {

        insert(item, source, (obj) => {
            console.log(obj);
            itemsProcessed++;
            if (itemsProcessed === words.length) {
                callback("done");
            }
        });

    });
}

//ToDo: test this
function loadOneThousand() {
    insertMany(preload, "top1000", (obj) => console.log(obj));
}

//ToDo: remove??
//first check to see if the object is in the DB and return that object
function checkDbForObj(obj, cb) {

    db.findOne(obj, (err, doc) => {
        if (err)
            console.log("database find error; " + err);
        if (!doc)
            cb();
        else
            cb(doc);
    });
}


function showDb() {
    db.find({}).sort({'word': 1}).exec(function (err, docs) {
        if (err)
            console.log("database error; " + err);
        docs.forEach(function (doc) {
            console.log(JSON.stringify(doc));
        });
    });
}

function clearDb() {
    db.remove({}, {multi: true}, function (err, numRemoved) {
        console.log("Deleted " + numRemoved + " documents");
    });
}

function resetDb() {
    clearDb();
    loadOneThousand();
}


module.exports = {
    load: loadDb,
    talk: parseInput,
    showDb: showDb,
    clear: clearDb,
    reset: resetDb,
};
