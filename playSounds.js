/**
 * Use afplay to play sounds
 * Created by chad on 2/19/17.
 */

//todo: turn this into a writeable stream
//todo: on/off controls

const spawn = require('child_process').spawn;

let isPlaying = false;

let playlist = [];

function add(sounds){
    //check if it is an array
    if( Object.prototype.toString.call( sounds ) === '[object Array]' ) {
        sounds.forEach( (sound) => playlist.push(sound));
    }
    else
        playlist.push(sounds);

    if (isPlaying == false) {
        playSounds();
    }
}

function playSounds(){
    let child;

    isPlaying = true;

    function playone(s){
        if (!s) {
            isPlaying = false;
            console.log("audio complete");
        }
        else if ( Number.isInteger(s) ){
            console.log("pausing...");
            setTimeout(() => {
                playSounds();
            }, s)
        }
        else{
            child = spawn("afplay", [s]);
            console.log("playing " + s);
            child.on('exit', (code, signal) => {
                playSounds();
            });
        }
    }

    playone(playlist.shift());

}

module.exports = add;