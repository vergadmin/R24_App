console.log("IN VIDEO JS")
const video = document.getElementById('myvideo');

    if (video) {
        // Add an event listener for the 'ended' event
        video.addEventListener('ended', function () {
            console.log('The video has ended.');
            var stillLoadingText = document.getElementById("still-loading");
            stillLoadingText.style.display = 'block'
        });
    }

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
        "bf": "https://player.vimeo.com/video/1076134107?h=4bfb3807be",
        "bm": "https://player.vimeo.com/video/1076133504?h=9261ce5c3c",
        "hf": "https://player.vimeo.com/video/1076134244?h=25b1e1ad08",
        "hm": "https://player.vimeo.com/video/1076134266?h=10427f7eae",
        "wf": "https://player.vimeo.com/video/1076134292?h=d2d593cc95",
        "wm": "https://player.vimeo.com/video/1076133968?h=b34eab7588"
    },
    "2": {
        "bf": "https://player.vimeo.com/video/1076137228?h=918bcac907",
        "bm": "https://player.vimeo.com/video/1076134621?h=1b17ebb4fa",
        "hf": "https://player.vimeo.com/video/1076137308?h=a6270af85a",
        "hm": "https://player.vimeo.com/video/1076137324?h=41ac96084f",
        "wf": "https://player.vimeo.com/video/1076137341?h=77d6454a2d",
        "wm": "https://player.vimeo.com/video/1076137360?h=a7d1b1c19d"
    },
    "3": {
        "bf": "https://player.vimeo.com/video/1076138422?h=5db78d54f6",
        "bm": "https://player.vimeo.com/video/1076134808?h=8eb164ec87",
        "hf": "https://player.vimeo.com/video/1076138642?h=fdfcad23a5",
        "hm": "https://player.vimeo.com/video/1076138670?h=831f34eb71",
        "wf": "https://player.vimeo.com/video/1076138703?h=b4a251e0dc",
        "wm": "https://player.vimeo.com/video/1076138719?h=e3b534473a"
    },
    "4": {
        "bf": "https://player.vimeo.com/video/1076139463?h=008a435d92",
        "bm": "https://player.vimeo.com/video/1076134780?h=36fa1d222a",
        "hf": "https://player.vimeo.com/video/1076139587?h=e81ad6f96c",
        "hm": "https://player.vimeo.com/video/1076139617?h=d8767180fa",
        "wf": "https://player.vimeo.com/video/1076139629?h=dcdb3b8688",
        "wm": "https://player.vimeo.com/video/1076139643?h=8c5aaa68c8"
    },
    "GeneratingResults": {
        "bf": "https://player.vimeo.com/video/1076136123?h=22e10aa165",
        "bm": "https://player.vimeo.com/video/1076134667?h=74b2df6045",
        "hf": "https://player.vimeo.com/video/1076136245?h=f7ee9f6dc3",
        "hm": "https://player.vimeo.com/video/1076136254?h=e6ac690977",
        "wf": "https://player.vimeo.com/video/1076136270?h=e82ea9cc3b",
        "wm": "https://player.vimeo.com/video/1076136287?h=2906d827d5"
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
        "bf": "https://player.vimeo.com/video/1076134127?h=9139df36c9",
        "bm": "https://player.vimeo.com/video/1076133541?h=c0ddb25267",
        "hf": "https://player.vimeo.com/video/1076134149?h=102a2e4667",
        "hm": "https://player.vimeo.com/video/1076134176?h=1bc120196f",
        "wf": "https://player.vimeo.com/video/1076134197?h=3cc12c69d9",
        "wm": "https://player.vimeo.com/video/1076133581?h=47e6ba772a"
    },
    "2": {
        "bf": "https://player.vimeo.com/video/1076137235?h=61a1fe34b3",
        "bm": "https://player.vimeo.com/video/1076134636?h=eeaf1e52c9",
        "hf": "https://player.vimeo.com/video/1076137257?h=c029cae797",
        "hm": "https://player.vimeo.com/video/1076137270?h=da3b2c7121",
        "wf": "https://player.vimeo.com/video/1076137284?h=ff972bffef",
        "wm": "https://player.vimeo.com/video/1076137293?h=ca335c1141"
    },
    "3": {
        "bf": "https://player.vimeo.com/video/1076138458?h=96a8c4bb23",
        "bm": "https://player.vimeo.com/video/1076134832?h=93be4650e8",
        "hf": "https://player.vimeo.com/video/1076138500?h=4e73f2ffca",
        "hm": "https://player.vimeo.com/video/1076138535?h=7551d7942e",
        "wf": "https://player.vimeo.com/video/1076138566?h=8fbdad0640",
        "wm": "https://player.vimeo.com/video/1076138598?h=0ba0a68fe1"
    },
    "4": {
        "bf": "https://player.vimeo.com/video/1076139488?h=f80d60ec1d",
        "bm": "https://player.vimeo.com/video/1076134794?h=9a96cf6f24",
        "hf": "https://player.vimeo.com/video/1076139511?h=dd6613fb64",
        "hm": "https://player.vimeo.com/video/1076139536?h=2e75db5b2b",
        "wf": "https://player.vimeo.com/video/1076139558?h=63d8560dfb",
        "wm": "https://player.vimeo.com/video/1076139574?h=e9779198ae"
    },
    "GeneratingResults": {
        "bf": "https://player.vimeo.com/video/1076136141?h=ae8631a2bc",
        "bm": "https://player.vimeo.com/video/1076134681?h=86d48c3ccf",
        "hf": "https://player.vimeo.com/video/1076136160?h=cf7aef6d99",
        "hm": "https://player.vimeo.com/video/1076136179?h=708a1f3c28",
        "wf": "https://player.vimeo.com/video/1076136201?h=6343bc093d",
        "wm": "https://player.vimeo.com/video/1076136221?h=958ea1e60e",
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
            logVideosToDatabase()
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