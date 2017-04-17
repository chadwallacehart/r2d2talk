/**
 * Use afplay to play sounds
 * Created by chad on 2/19/17.
 */

//todo: turn this into a writeable stream
//todo: on/off controls

const spawn = require('child_process').spawn;

//ToDo: add a speed parameter to function call
const speed = 1.5;

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

    function playone(snd){
        if (!snd) {
            isPlaying = false;
            console.log("audio complete");
        }
        else if ( Number.isInteger(snd) ){
            console.log("pausing...");
            setTimeout(() => {
                playSounds();
            }, snd)
        }
        else{
            child = spawn("afplay", [snd, '--rate', speed] );

            console.log("playing " + snd);
            child.on('exit', (code, signal) => {
                playSounds();
            });
        }
    }

    playone(playlist.shift());

}

module.exports = add;