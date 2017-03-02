const Nedb = require("nedb"),                                   //simple text database
    player = require("./playSounds");                           //plays sounds locally using afplay (linux)

const db = new Nedb({filename: 'r2d2db.txt', autoload: true});

const soundDir = "./audio/";

let input = "Hello World. I am n4r8";

function mapSound(searchWord){
    db.find({word: searchWord},  (err, docs) => {
        if (err)
            console.log("database error; " + err);

        docCount = docs.length;

        //console.log(docCount + " documents loaded from database");

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

console.log(input.match(/\w+/gi));

function parseInput(input){
    let output = [];

    input.match(/\w+/gi).forEach((word) => {
        console.log("saying " + word);
        mapSound(word.toLowerCase());
        player(100);
    });

    console.log(output);

}


parseInput(input);
/*
player(playList1);
player(1500);
player(playList2);
setTimeout(()=>{
    player(playList2);
    player(playList1);
}, 5000);
*/