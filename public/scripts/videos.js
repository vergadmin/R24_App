console.log("IN VIDEO JS")
const video = document.getElementById('myvideo');

// Listen for the video to enter full-screen mode
video.addEventListener('ended', () => {
    console.log("VIDEO HAS ENDED")
    if (document.fullscreenElement) {
    // Exit full-screen mode
    document.exitFullscreen().catch(err => {
        console.error("Error exiting full-screen:", err);
    });
    }
});

console.log("IN VIDEOS PAGE")
console.log(sessionStorage)

var videoInfo = {
    "percentWatched": '0',
    "vCHE": '',
    "played": {},
    "duration": 0,
    "timeEnterPage": '',
    "timeExitPage": ''
}

const url = window.location.href;
const lastSegment = url.substring(url.lastIndexOf('/') + 1);
console.log(lastSegment); // Output: Introduction

function getLocalTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const time = `${hours}:${minutes}`;
    return time
}

var englishVideoURLs = {
    "Introduction": {
        "bf": "https://player.vimeo.com/video/1076135537?h=82cc3df5fa",
        "bm": "https://player.vimeo.com/video/1076134725?h=0d98807658",
        "hf": "https://player.vimeo.com/video/1076135645?h=457fb607e3",
        "hm": "https://player.vimeo.com/video/1076135664?h=c2632e2bba",
        "wf": "https://player.vimeo.com/video/1076135686?h=ca91b1a43e",
        "wm": "https://player.vimeo.com/video/1076135714?h=8f48f0bf42"
    },
    "1": {
        "bf": "https://player.vimeo.com/video/",
        "bm": "https://player.vimeo.com/video/",
        "hf": "https://player.vimeo.com/video/",
        "hm": "https://player.vimeo.com/video/",
        "wf": "https://player.vimeo.com/video/",
        "wm": "https://player.vimeo.com/video/"
    },
    "2": {
        "bf": "https://player.vimeo.com/video/",
        "bm": "https://player.vimeo.com/video/",
        "hf": "https://player.vimeo.com/video/",
        "hm": "https://player.vimeo.com/video/",
        "wf": "https://player.vimeo.com/video/",
        "wm": "https://player.vimeo.com/video/"
    },
    "3": {
        "bf": "https://player.vimeo.com/video/",
        "bm": "https://player.vimeo.com/video/",
        "hf": "https://player.vimeo.com/video/",
        "hm": "https://player.vimeo.com/video/",
        "wf": "https://player.vimeo.com/video/",
        "wm": "https://player.vimeo.com/video/"
    },
    "4": {
        "bf": "https://player.vimeo.com/video/",
        "bm": "https://player.vimeo.com/video/",
        "hf": "https://player.vimeo.com/video/",
        "hm": "https://player.vimeo.com/video/",
        "wf": "https://player.vimeo.com/video/",
        "wm": "https://player.vimeo.com/video/"
    },
    "GeneratingResults": {
        "bf": "https://player.vimeo.com/video/",
        "bm": "https://player.vimeo.com/video/",
        "hf": "https://player.vimeo.com/video/",
        "hm": "https://player.vimeo.com/video/",
        "wf": "https://player.vimeo.com/video/",
        "wm": "https://player.vimeo.com/video/"
    }
}


var spanishVideoURLS = {
    "Introduction": {
        "bf": "https://player.vimeo.com/video/1076135560?h=5cbc71df00",
        "bm": "https://player.vimeo.com/video/1076134749?h=0a1995a602",
        "hf": "https://player.vimeo.com/video/1076135575?h=779e975b80",
        "hm": "https://player.vimeo.com/video/1076135597?h=4de4f9040d",
        "wf": "https://player.vimeo.com/video/1076139661?h=c2a5aa70ed",
        "wm": "https://player.vimeo.com/video/1076135618?h=facc90971c"
    },
    "1": {
        "bf": "https://player.vimeo.com/video/",
        "bm": "https://player.vimeo.com/video/",
        "hf": "https://player.vimeo.com/video/",
        "hm": "https://player.vimeo.com/video/",
        "wf": "https://player.vimeo.com/video/",
        "wm": "https://player.vimeo.com/video/"
    },
    "2": {
        "bf": "https://player.vimeo.com/video/",
        "bm": "https://player.vimeo.com/video/",
        "hf": "https://player.vimeo.com/video/",
        "hm": "https://player.vimeo.com/video/",
        "wf": "https://player.vimeo.com/video/",
        "wm": "https://player.vimeo.com/video/"
    },
    "3": {
        "bf": "https://player.vimeo.com/video/",
        "bm": "https://player.vimeo.com/video/",
        "hf": "https://player.vimeo.com/video/",
        "hm": "https://player.vimeo.com/video/",
        "wf": "https://player.vimeo.com/video/",
        "wm": "https://player.vimeo.com/video/"
    },
   "4": {
        "bf": "https://player.vimeo.com/video/",
        "bm": "https://player.vimeo.com/video/",
        "hf": "https://player.vimeo.com/video/",
        "hm": "https://player.vimeo.com/video/",
        "wf": "https://player.vimeo.com/video/",
        "wm": "https://player.vimeo.com/video/"
    },
    "GeneratingResults": {
        "bf": "https://player.vimeo.com/video/",
        "bm": "https://player.vimeo.com/video/",
        "hf": "https://player.vimeo.com/video/",
        "hm": "https://player.vimeo.com/video/",
        "wf": "https://player.vimeo.com/video/",
        "wm": "https://player.vimeo.com/video/"
    }
}


window.onload = function() {
    videoInfo["timeEnterPage"] = getLocalTime()
    videoInfo["vCHE"] = sessionStorage.getItem("vCHE")
    console.log("ADDED TO VIDEO INFO", videoInfo)
};
  

window.addEventListener("beforeunload", (event) => {
    videoInfo["timeExitPage"] = getLocalTime()
    var iframe = document.getElementById("myvideo");
    console.log(iframe)
    var player = new Vimeo.Player(iframe);
    var videoDuration = 0
    player.getDuration().then(function(duration) {
        // `duration` indicates the duration of the video in seconds
        videoInfo["duration"] = duration
        console.log("VIDEO INFO", videoInfo)
        videoDuration = duration
        player.getPlayed().then(function(played) {
            videoInfo["played"] = played
            console.log("PLAYED IS:",typeof(played))
            var totalTime = 0
            for (const [key, value] of Object.entries(played)) {
                console.log(value)
                totalTime += value[1] - value[0]
            }
            console.log("TOTAL TIME", totalTime)
            var percentageWatched = Math.round((totalTime / videoDuration) * 100);
            videoInfo["percentWatched"] = percentageWatched + "%"
            console.log("VIDEO INFO", videoInfo)
    
            sessionStorage.setItem("videoObjects", videoInfo)
            // logVideosToDatabase()
        }).catch(function(error) {
            // an error occurred
        });
    });
});
  

var vCHE = sessionStorage.getItem("type")
console.log(vCHE)

if (sessionStorage.getItem("literallanguage") === "en") {
    document.getElementById("myvideo").src = englishVideoURLs[lastSegment][vCHE] + "&autoplay=1"
} else if (sessionStorage.getItem("literallanguage") === "es") {
    document.getElementById("myvideo").src = spanishVideoURLS[lastSegment][vCHE] + "&autoplay=1"
}

async function logVideosToDatabase() {
    var column = "Educational_" + lastSegment
    console.log("IN LOG TO DB", videoInfo)
    var data = {
        "videoColumn": column,
        "videoInfo": videoInfo
    }
    let res = await fetch('/EducationalComponent/updateVideosInDatabase', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (res.ok) {
        let ret = await res.json();
        return ret.message
    } else {
        return `HTTP error: ${res.status}`;
    }
}