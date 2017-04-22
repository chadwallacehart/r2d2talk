# R2D2 Synthesizer

R2D2 sound synthesizer. A library of 1 to 3 distinct sounds (phonemes) is mapped to each input word.
By default sounds are pre-assigned to the top 1000 most common US English words from [Google's list](https://github.com/first20hours/google-10000-english/blob/master/google-10000-english-usa-no-swears.txt).
Any new word supplied will automatically be assigned a set of sounds. 
All data is saved using [NeDB](https://github.com/louischatriot/nedb).


## Usage

Load the module `r2d2talk.js`: ```const r2 = require("./r2d2talk");```

Open the database before use:
```r2.load()```

Give it a word `r2.talk("hello"))` or sentence: `r2.talk("I am R2D2")):`

Enter a integer to pause playback for that integer value in milliseconds. For example, to pause for 500ms: `r2.talk(500)`

### Example
```
const r2 = require("./talk");

r2.load()
    .then(() => r2.talk("hello"))
    .then(() => r2.talk(500))
    .then(() => r2.talk("I am n5r8"))
    .catch((err)=>console.log("r2d2talk error: " + err));
```

## Sound files
Sounds need to be loaded in the `audio` folder with a single integer value in ascending sequential order.

I used sounds from http://www.r2d2translator.com.

I use this bash script to grab them.
```
for i in {1..80}
do
res=$(curl "http://www.r2d2translator.com/composeSongD2R2.php" -H "Content-Type: application/x-www-form-urlencoded" --data "volumes=1&sons=$i")
echo $res
url=${res/&cle=/http://www.r2d2translator.com/audio/}".MP3"
echo $url
curl $url > $i.mp3
ls -l $i.mp3
done
```
