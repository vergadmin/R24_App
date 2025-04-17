var lang = sessionStorage.getItem("language")
var literallanguage = sessionStorage.getItem("literallanguage")

console.log(sessionStorage)

const observer = new MutationObserver(handleLanguageChange);
observer.observe(document.documentElement, { attributes: true });

function googleTranslateElementInit() {
  console.log("GOOGLE TRANS")
    new google.translate.TranslateElement({
        pageLanguage: lang,
        autoDisplay: false,
        // callback: function() {
        //     checkTranslation(lang);
        // }
    }, 'google_translate_element');
}

// Function to handle language change
function handleLanguageChange(mutationsList, observer) {
  mutationsList.forEach(mutation => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'lang') {
          console.log('Language changed to:', mutation.target.lang);
          if (mutation.target.lang == 'es') {
              const spanishElements = document.getElementsByClassName("spanish");
              for (let element of spanishElements) {
                  element.style.display = "block";
              }
              const englishElements = document.getElementsByClassName("english");
              for (let element of englishElements) {
                  element.style.display = "none";
              }
              translatePage('es'); // Call translatePage for Spanish
          } else if (mutation.target.lang == 'en') {
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
      }
  });
}

function translatePage(targetLang) {
  console.log("IN TRANSL PAGE")
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