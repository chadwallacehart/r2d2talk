const Nedb = require("nedb"),                                   //simple text database
    player = require("./playSounds");                           //plays sounds locally using afplay (linux)

const db = new Nedb({filename: 'r2d2db.txt', autoload: true});

const soundDir = "./audio/";

function playAll(){
    db.find({},  (err, docs) => {
        if (err)
            console.log("database error; " + err);

        docCount = docs.length;

        console.log(docCount + " documents loaded from database");

        docs.forEach((doc) => {
            player((JSON.parse(doc.soundNum)
                    .map( (s) => {return soundDir + s + ".mp3"} )
            ))
        });
    });
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
playLists.push(playList1);
playLists.push(5);
playLists.push(playList2);


//playLists.forEach( (sounds) => player(sounds));

player(playList1);
