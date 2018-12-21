var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
    output.innerHTML = this.value;
}


"use strict";

var trackList = [];
var mainGain;
var trackGain = [];

var bufferLoader

function audioContextCheck() {
    if (typeof AudioContext !== "undefined") {
        return new AudioContext();
    } else if (typeof webkitAudioContext !== "undefined") {
        return new webkitAudioContext();
    } else if (typeof mozAudioContext !== "undefined") {
        return new mozAudioContext();
    } else {
        throw new Error('AudioContext not supported');
    }
}

var context = audioContextCheck();

function BufferLoader(context, urlList, callback) {
    this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = new Array();
    this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var loader = this;

    request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
            request.response,
            function(buffer) {
                if (!buffer) {
                    alert('error decoding file data: ' + url);
                    return;
                }
                loader.bufferList[index] = buffer;
                if (++loader.loadCount == loader.urlList.length)
                loader.onload(loader.bufferList);
            },
            function(error) {
            console.error('decodeAudioData error', error);
            }
        );
    }

    request.onerror = function() {
    alert('BufferLoader: XHR error');
    }

    request.send();
}

BufferLoader.prototype.load = function() {
    for (var i = 0; i < this.urlList.length; ++i)
    this.loadBuffer(this.urlList[i], i);
}


function initSong(song) {
    var songData = library[song];
    var trackBuffers = [];
    for (var i=0; i<songData.voices.length; i++) {
        trackBuffers.push("./MP3/" + song + "/" + songData.voices[i] + ".mp3");
    }

    bufferLoader = new BufferLoader(
        context,
        trackBuffers,
        finishedLoading
    );

    bufferLoader.load();
    buildControls(song);
}


function finishedLoading(bufferList) {
    // Create two sources and play them both together.
    mainGain = context.createGain();
    mainGain.gain.value = 0.5;
    mainGain.connect(context.destination);

    trackList = [];

    for (var i=0; i<bufferList.length; i++) {
        trackList[i]=context.createBufferSource();
        trackList[i].buffer = bufferList[i];
        trackGain[i] = context.createGain();
        trackGain[i].gain.value = 1;
        trackList[i].connect(trackGain[i]);
        trackGain[i].connect(mainGain);
    }
}

function startPlay() {
    var startTime = context.currentTime + .2;
    for (var i=0; i<trackList.length; i++) {
        trackList[i].start(startTime);
    }
}

function stopPlay() {
    for (var i=0; i<trackList.length; i++) {
        trackList[i].stop(0);
    }
}


function rewind() {
    for (var i=0; i<trackList.length; i++) {
        trackList[i].currentTime = 0;
    }
}


function changeVol(track, volLevel) {
    var level = volLevel/100;
    track.gain.value = level;
}

function buildControls(song) {
    let tracktitles = document.getElementById('trackTitle1');
    let gaincontrols = document.getElementById('trackVol1');
    tracktitles.innerHTML = "";
    gaincontrols.innerHTML = "";
    for (var i=0; i<library[song]["voices"].length; i++) {
        let volTitle = '<div class="titleItem">' + library[song]["voices"][i] + '</div>';
        let volControl = '<div class="levelItem"><input type="range" min="0" max="100" value="100" ';
        volControl += 'id=' + library[song]["voices"].name + '"Volume" ';
        volControl += 'class="levelSlider" ';
        volControl += 'onchange="changeVol(trackGain[' + i + '], this.value)"></div>';
        tracktitles.innerHTML += volTitle;
        gaincontrols.innerHTML += volControl;
    }
    tracktitles.innerHTML += "Master Vol";
    gaincontrols.innerHTML += '<input type="range" min="0" max="100" value="50" id="MainVol" class="levelSlider" onchange="changeVol(mainGain, this.value)">';
}
