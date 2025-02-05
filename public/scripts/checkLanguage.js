var lang = sessionStorage.getItem("language")
console.log(sessionStorage)

function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: lang,
        autoDisplay: false,
        callback: function() {
            translatePage(lang);
        }
    }, 'google_translate_element');
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

setTimeout(function() {
    document.getElementById("load").style.display = "none"
}, 1500); // 3000 milliseconds = 3 seconds