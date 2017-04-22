/**
 * Created by chad on 4/17/17.
 */
const r2 = require("./r2d2talk");

r2.load()
    .then(() => r2.talk("hello"))
    .then(() => r2.talk(500))
    .then(() => r2.talk("I am n5r8"))
    .catch((err)=>console.log("r2d2talk error: " + err));

//todo: add a command line option with https://www.npmjs.com/package/yargs
