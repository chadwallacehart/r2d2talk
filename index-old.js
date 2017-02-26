var Promise = require('bluebird'),
    Nedb = require("nedb"),                         //simple text database
    player = require("./playSounds"),                                    //plays sounds locally using afplay (linux)
    preload = require("./top1000.json").oneThousandWords;                //top 1000 words from https://github.com/first20hours/google-10000-english/blob/master/google-10000-english-usa-no-swears.txt

var db = new Nedb({filename: 'r2d2db.txt', autoload: true});

db.ensureIndex({fieldName: 'soundNum', unique: true, sparse: true}, function (err) {
    console.log("soundNum index error: " + err);
});
db.ensureIndex({fieldName: 'word', unique: true, sparse: true}, function (err) {
    console.log("word index error: " + err);
});

var docCount = 0;
const syllables = 3; //80;

const soundDir = "./audio/";
var playList = [],
    words = [],
    soundrefs = [];

function checkDb(obj) {
    return new Promise(function (resolve, reject) {

        db.findOne(obj, function (err, doc) {
            if (err)
                console.log("database find error; " + err);
            if (doc != null)
                resolve(doc);
            else
                resolve();
        });
    })
}

function insertDb(obj) {
    return new Promise(function (resolve, reject) {

        db.insert(obj, function (err, doc) {
            if (err) {
                console.log("database error; " + err);
                reject(err);
            }
            //console.log(doc, obj);
            docCount++;
            resolve(doc);
        });
    })
}

/*
 function wordToDb(word) {
 return new Promise(function (resolve) {

 db.insert({word: word}, function (err, doc) {
 if (err)
 console.log("db error: could not insert doc:" + err);

 resolve(doc.soundNum);
 })
 });
 }
 */

function uniqRef() {
    return new Promise(function (resolve, reject) {
        var ref;

        function next() {
            ref = randNum();
            checkDb({soundNum: ref})
                .then(function (doc) {
                    if (doc == null) {
                        console.log(ref + " is unique");
                        resolve(ref);

                    }
                    else {
                        console.log(doc.soundNum + " already in db");
                        next();
                    }
                }, reject);
        }

        // start first iteration of the loop
        next();
    });
}

function addWord(word) {
    return new Promise(function (resolve, reject) {
        if (!word)
            reject("Nothing provided");

        checkDb({word: word})
            .then(function (ref) {
                if (ref)
                    reject(word + " already exists in db")
            })
            .then(function () {
                uniqRef()
                    .then(function (ref) {
                        if (ref == undefined) {
                            console.log("why no ref??")
                        }
                        insertDb({word: word, soundNum: ref})
                            .then(function (doc) {
                                console.log("Inserted:" + JSON.stringify(doc));
                                resolve(doc);
                            });
                    })
            })
    })
}


function addWord2(word) {
    return new Promise(function (resolve, reject) {
        if (!word)
            reject("Nothing provided");

        function insert(w) {

            return new Promise(function (resolve, reject) {

                function next() {
                    db.insert({word: w, soundNum: randNum()}, function (err, doc) {
                        if (err) {
                            if (err.errorType == "uniqueViolated") {
                                next();
                            }
                            else
                                console.log("database insert error; " + err);
                        }
                        else {
                            docCount++;
                            console.log("docCount: " + docCount);
                            resolve(doc);
                        }
                    });
                }
            })

        }

        checkDb({word: word})
            .then(function (ref) {
                if (ref)
                    reject(word + " already exists in db");

                insert({word: word})
                    .then((doc) => console.log("inserted: " + JSON.stringify(doc)));

            })
    })
}


/*

 function addWord(word, callback) {


 //ToDo: Convert to promises and change back to DB queries

 var index;
 //check to see if the word is already loaded
 var w = words.find(function (x, i) {
 if (x == word) {
 index = i;
 return x;
 }
 });
 if (w)
 if (callback)
 return callback(soundrefs[index]);
 else
 return soundrefs[index];

 //If not, find a unique sound ref
 var soundNum;

 do {
 soundNum = randNum();
 } while (soundrefs.find(function (s) {
 return s === soundNum;
 }));


 words.push(word);
 soundrefs.push(soundNum);

 var obj = {word: word, soundNum: soundNum};
 console.log("Inserting: " + JSON.stringify(obj));


 //nodeback
 if (callback) {
 db.insert(obj, function (err, newDocs) {
 if (err)
 console.log("db error: could not insert doc:" + err);

 docCount++;
 return callback(soundNum);
 });
 }
 //promise
 else {
 return new Promise(function (resolve) {

 db.insert(obj, function (err, newDocs) {
 if (err)
 console.log("db error: could not insert doc:" + err);

 docCount++;
 resolve(soundNum);
 })
 });

 }
 }
 */

function randNum() {
    //ToDo: make this so it works with any number of phonemes

    var res = [];
    if (docCount < syllables)
        res = [Math.floor((Math.random() * syllables) + 1)];
    else if (docCount < Math.pow(syllables, 2))
        res = [
            Math.floor((Math.random() * syllables) + 1),
            Math.floor((Math.random() * syllables) + 1)
        ];
    else if (docCount < Math.pow(syllables, 3))
        res = [
            Math.floor((Math.random() * syllables) + 1),
            Math.floor((Math.random() * syllables) + 1),
            Math.floor((Math.random() * syllables) + 1)
        ];
    else if (docCount >+ Math.pow(syllables, 3))
        console.log("Error: dictionary exceeded " + Math.pow(syllables, 3));
    else
        console.error("randNum error");

    console.log(res);
    return res;
}

/*
 for (s=1; s<=80; s++){
 playList.push(soundDir + s + ".mp3");
 }

 playList(sounds);
 */

function loadDb() {
    return new Promise(function (resolve) {
        db.find({}, function (err, docs) {
            if (err)
                console.log("database error; " + err);

            docCount = docs.length;

            docs.map(function (doc) {
                words.push(doc.word);
                soundrefs.push(doc.soundNum);
            });

            console.log(docCount + " documents loaded from database");
            resolve();
        });
    })

}

/*addWord("foo", function(sound){
 player([soundDir + sound + ".mp3"]);
 });
 */

//source: http://stackoverflow.com/questions/24660096/correct-way-to-write-loops-for-promise
function addMany(words) {
    return words.reduce(function (promise, word) {
        return promise
            .then(function () {
                return addWord2(word)
                    .done(function (res) {
                        console.log("all done" + res);
                    })
            })
    }, Promise.resolve());
}

loadDb()
    .then( () => addMany(["one", "two", "three", "four", "five"]))
    .catch( (e) => console.log(e) )
    .then( () => console.log("finished with documents: " + docCount));

/*
 loadDb()
 .then(function () {
 //addMany(["one", "two", "foo"])
 .catch(function(e){console.log(e)})
 .then(function () {
 console.log("all done");
 })
 });

 */