document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

function detectBrowser() {
    const userAgent = navigator.userAgent;
    let browserName = "Unknown";
    let fullVersion = "Unknown";

    if (userAgent.indexOf("Firefox") > -1) {
        browserName = "Mozilla Firefox";
        fullVersion = userAgent.substring(userAgent.indexOf("Firefox/") + 8);
    } else if (userAgent.indexOf("SamsungBrowser") > -1) {
        browserName = "Samsung Internet";
        fullVersion = userAgent.substring(userAgent.indexOf("SamsungBrowser/") + 15);
    } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
        browserName = "Opera";
        fullVersion = userAgent.substring(userAgent.indexOf("Opera/") + 6);
        if (userAgent.indexOf("OPR") > -1) {
            fullVersion = userAgent.substring(userAgent.indexOf("OPR/") + 4);
        }
    } else if (userAgent.indexOf("Trident") > -1) {
        browserName = "Microsoft Internet Explorer";
        const rvIndex = userAgent.indexOf("rv:");
        fullVersion = rvIndex > -1 ? userAgent.substring(rvIndex + 3) : "Unknown";
    } else if (userAgent.indexOf("Edge") > -1 || userAgent.indexOf("Edg") > -1) {
        browserName = "Microsoft Edge";
        fullVersion = userAgent.substring(userAgent.indexOf("Edge/") + 5);
        if (userAgent.indexOf("Edg") > -1) {
            fullVersion = userAgent.substring(userAgent.indexOf("Edg/") + 4);
        }
    } else if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Edg") === -1) {
        browserName = "Google Chrome";
        fullVersion = userAgent.substring(userAgent.indexOf("Chrome/") + 7);
    } else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
        browserName = "Apple Safari";
        fullVersion = userAgent.substring(userAgent.indexOf("Version/") + 8);
    }

    // Remove the trailing characters if there are any after the version number
    if (fullVersion.indexOf(" ") > -1) {
        fullVersion = fullVersion.substring(0, fullVersion.indexOf(" "));
    }
    if (fullVersion.indexOf(";") > -1) {
        fullVersion = fullVersion.substring(0, fullVersion.indexOf(";"));
    }

    return browserName + ": " + fullVersion;
}

function detectDeviceType() {
    const userAgent = navigator.userAgent;
    let deviceType = "Desktop";

    // Detect device type
    if (/Mobi|Android/i.test(userAgent)) {
        deviceType = "Mobile";
    } else if (/Tablet|iPad/i.test(userAgent)) {
        deviceType = "Tablet";
    }

    return deviceType;
}

function detectOS() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    let osName = "Unknown";

    // Standard platform checks for various OS
    if (platform.indexOf('Win') !== -1) {
        osName = "Windows";
    } else if (platform.indexOf('Mac') !== -1) {
        osName = "Mac";
    } else if (platform.indexOf('Linux') !== -1) {
        osName = "Linux";
    } else if (/Android/i.test(userAgent)) {
        osName = "Android";
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
        osName = "iOS";
    } else if (/CrOS/.test(userAgent)) {
        osName = "Chrome OS"; // Detect Chrome OS
    } else if (/Win64|WOW64/.test(userAgent)) {
        osName = "Windows 64-bit";
    } else if (/Win32/.test(userAgent)) {
        osName = "Windows 32-bit";
    } else if (/X11/.test(platform) || /Linux/.test(platform)) {
        osName = "Unix-based";
    }

    return osName;
}

window.addEventListener("load", async () => {
    // console.log("SAVING SESSION INFO LOCALLY")
    // console.log(document.URL)
    sessionStorage.clear();
    let browserInfo = detectBrowser()
    let dateTime = new Date().toLocaleString() + " " + Intl.DateTimeFormat().resolvedOptions().timeZone;
    let deviceType = detectDeviceType()
    let os = detectOS()
    var type = document.URL.split('/').reverse()[0]
    var vCHE = document.URL.split('/').reverse()[1]
    var id = document.URL.split('/').reverse()[2]
    sessionStorage.setItem("id", id)
    sessionStorage.setItem("type", type)
    sessionStorage.setItem("vCHE", vCHE)
    console.log("LOADED HERE IS SESSION STORAGE", sessionStorage)

    // console.log("TIME")
    dateTime = new Date().toLocaleString() + " " + Intl.DateTimeFormat().resolvedOptions().timeZone;
    // console.log(dateTime)
    await sendGeneralData(browserInfo, deviceType, os, dateTime);

    
});

setTimeout(function() {
    document.getElementById("load").style.display = "none"
}, 1500); // 3000 milliseconds = 3 seconds

// Function to handle language change
function handleLanguageChange(mutationsList, observer) {
    mutationsList.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'lang') {
            console.log('Language changed to:', mutation.target.lang);
            
            if (mutation.target.lang == 'es') {
                sessionStorage.setItem("literallanguage", 'es')
                document.getElementById("translation").style.display = "none"
                const spanishElements = document.getElementsByClassName("spanish");
                for (let element of spanishElements) {
                    element.style.display = "block";
                }
                const englishElements = document.getElementsByClassName("english");
                for (let element of englishElements) {
                    element.style.display = "none";
                }

                document.getElementById("english").style.display = "none"
                translatePage('es'); // Call translatePage for Spanish
            } else if (mutation.target.lang == 'en') {
                sessionStorage.setItem("literallanguage", 'en')
                document.getElementById("translation").style.display = "none"
                const englishElements = document.getElementsByClassName("english");
                for (let element of englishElements) {
                    element.style.display = "block";
                }
                const spanishElements = document.getElementsByClassName("spanish");
                for (let element of spanishElements) {
                    element.style.display = "none";
                }
                translatePage('en'); // Call translatePage for English
            }

            sessionStorage.setItem("language", mutation.target.lang)
            document.getElementById("begin-intervention").style.opacity = "100"
        }
    });
}


// Create a new MutationObserver to watch for changes to the lang attribute
const observer = new MutationObserver(handleLanguageChange);

// Start observing changes to the attributes of the root HTML element
observer.observe(document.documentElement, { attributes: true });

function googleTranslateElementInit() {
    new google.translate.TranslateElement({includedLanguages: "en,es", autoDisplay: false, layout: google.translate.TranslateElement.InlineLayout}, 'google_translate_element')
}

function translatePage(targetLang) {
    if (typeof google === 'undefined' || typeof google.language === 'undefined' || typeof google.language.translate === 'undefined') {
        console.error('Google Translate API not loaded');
        return;
    }
    // Select all elements that don't have the "notranslate" class
    const elements = document.querySelectorAll('*:not(.notranslate)');
  
    elements.forEach(element => {
      // Check if the element contains only text (no child elements)
      if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
        const originalText = element.textContent;
        
        // Use Google Translate API to translate the text
        google.language.translate(originalText, '', targetLang, function(result) {
          if (result.translation) {
            element.textContent = result.translation;
          }
        });
      }
    });
  }

async function sendGeneralData(browserInfo, deviceType, os, dateTime) {
    // console.log("IN SEND TO SERVER GENERAL DATA")
    let url = '/generalData';
    let data = {
        'DateTime': dateTime,
        'DeviceType': deviceType,
        'OperatingSystem': os,
        'Browser': browserInfo,
    };

    let res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (res.ok) {
        let ret = await res.json();
        console.log(ret)
        return ret.message
    } else {
        return `HTTP error: ${res.status}`;
    }
}

async function logLanguage() {
    // console.log("IN SEND TO SERVER GENERAL DATA")
    console.log(sessionStorage)
    let type = sessionStorage.getItem("type")
    let vCHE = sessionStorage.getItem("vCHE")
    if (sessionStorage.getItem("language") === 'en') {
        type = type + "e"
    } else {
        type = type + "s"
    }
    console.log(type)
    console.log(vCHE)
    let url = '/updateDatabase';
    let data = {
        'Language': sessionStorage.getItem("language")
    };

    let res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (res.ok) {
        let ret = await res.json();
        console.log(type)
        console.log(vCHE)
        if (vCHE === 'text') {
            window.location.href=`/EducationalComponentText/Introduction`
        } else {
            window.location.href=`/EducationalComponent/Introduction`
        }
    } else {
        return `HTTP error: ${res.status}`;
    }
}
