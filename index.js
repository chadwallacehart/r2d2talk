/**
 * Created by chad on 2/24/17.
 */

/****** Load Database ******/
const Nedb = require("nedb");                                 //simple text database
const db = new Nedb({filename: 'r2d2db.txt', autoload: true});

db.ensureIndex({fieldName: 'soundNum', unique: true, sparse: true}, (err) => {
    if(err != null)
        console.log("soundNum index error: " + err);
});

db.ensureIndex({fieldName: 'word', unique: true, sparse: true}, (err) => {
    if (err != null)
        console.log("word index error: " + err);
});


/****** Sound player setup ******/
const player = require("./playSounds");       //plays sounds locally using afplay (linux)
const soundDir = "./audio/";


/****** module logic ******/

let docCount = 0;
const phonemes = 80;    //ToDo: count files in the audio dir to compute this

//ToDo: add these functions to a separate module, CLI options, add load and reset DB options

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

    return res;
}

function insert(word, callback) {

    function getUniqueNum(cb) {
        let rand = randNum();

        if (rand == null)
            return null;
        else
            return cb(rand);
    }

    function insertWord(n, cb) {
        if(!n)
            return;

        db.insert({word: word, soundNum: JSON.stringify(n)}, (err, doc) => {
            if (err) {
                // error object not much help: err.errorType == "uniqueViolated"  but doesn't tell you the index
                if (err.errorType == "uniqueViolated") {
                    console.log("uniqueViolated");
                    insert(word, callback);
                }
                else
                    console.log("database insert error; " + err);
            }
            else {
                docCount++;
                //console.log("docCount: " + docCount);
                cb(doc);
            }
        });
    }

    getUniqueNum(
        (uniq) => insertWord(uniq, (d) => callback(d)));
}

function mapSound(searchWord, callback){
    let sounds = [];
    db.findOne({word: searchWord},  (err, doc) => {
        if (err)
            console.log("database error; " + err);

        if (doc){
            JSON.parse(doc.soundNum).forEach( (s) => {
                sounds.push( soundDir + s + ".mp3");
            });
            callback(sounds);
        }
        else{
            insert(searchWord, (doc) => //console.log(doc)
                JSON.parse(doc.soundNum).forEach( (s) => {
                    sounds.push( soundDir + s + ".mp3");
                    if(sounds.length == JSON.parse(doc.soundNum).length)
                        callback(sounds);
                }));
        }
    });
}

function loadDb(cb) {
    db.find({},  (err, docs) => {
        if (err)
            console.log("database error; " + err);

        docCount = docs.length;

        console.log("words in db: " + JSON.stringify(docCount));
        cb();
    })
}

let playList1 = [
  soundDir + 1 + ".mp3",
    soundDir + 2 + ".mp3",
    soundDir + 3 + ".mp3",
];

let playList2 = [
    soundDir + 4 + ".mp3",
    soundDir + 5 + ".mp3",
    soundDir + 6 + ".mp3",
];

let playLists = [];

//console.log(input.match(/\w+/gi));

function parseInput(input){

    //Todo: make this forEach act sequential
    input.match(/\w+/gi).forEach((word) => {
        mapSound(word.toLowerCase(), (sounds)=> {
            console.log(word + " : " + sounds);
            //player(sounds);
            //player(100)
        });
    });

//    function play(word, callback)

}

let input = "Hello World. I am n5r8";

loadDb(
    ()=>parseInput(input));

/*
player(playList1);
player(1500);
player(playList2);
setTimeout(()=>{
    player(playList2);
    player(playList1);
}, 5000);
*/