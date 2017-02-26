/**
 * Use afplay to play sounds
 * Created by chad on 2/19/17.
 */
const spawn = require('child_process').spawn;
let playlist = [];


function playSounds(sounds){
    let child;

    //check if it is an array
    if( Object.prototype.toString.call( sounds ) === '[object Array]' ) {
        sounds.forEach( (sound) => playlist.push(sound));
    }
    else
        playlist.push(sounds);

    function playone(s){
        if (!s) {
            console.log("audio complete")
        }
        else if ( Number.isInteger(s) ){
            setTimeout(function(){
                console.log("pausing...");
                playone( playlist.shift() );  //playone( sounds.shift() );
            }, s)
        }
        else{
            child = spawn("afplay", [s]);
            child.on('exit', function (code, signal){
                console.log("playing " + s);
                playone( playlist.shift() );  //playone( sounds.shift() );
            });
        }
    }

    playone(playlist.shift());              //playone( sounds.shift() );

}

module.exports = playSounds;