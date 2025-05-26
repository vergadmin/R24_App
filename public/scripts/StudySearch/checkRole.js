var role = sessionStorage.getItem('role-type')
console.log(role)
if (document.getElementById("background-info")) {
    console.log("BACKGROUND INFO EXISTS")
    if (role === 'Patient') {
        if (sessionStorage.getItem("literallanguage") === "en") {
            document.getElementById('background-description').innerHTML = `Please fill out the information below so we can find research studies <b>you might qualify for</b>.`
        } else if (sessionStorage.getItem("literallanguage") === "es") {
            document.getElementById('background-description').innerHTML = `Por favor comparta su información para ayudarle a encontrar estudios de investigación en los que pueda participar.`
        }
    } else {
        if (sessionStorage.getItem("literallanguage") === "en") {
            document.getElementById('background-description').innerHTML = `Please fill out the information below so we can find research studies <b>the person you're entering information for might qualify for</b>.`
        } else if (sessionStorage.getItem("literallanguage") === "es") {
            document.getElementById('background-description').innerHTML = `Por favor comparta su información para ayudarle a encontrar estudios de investigación en los que pueda participar.`
        }
    }
}

if (document.getElementById("preferences-description")) {
    if (role === 'Patient') {
        if (sessionStorage.getItem("literallanguage") === "en") {
            document.getElementById('preferences-description').innerHTML = `First, do you have a <b>specific diagnosis or health topic</b> in mind?`
        } else if (sessionStorage.getItem("literallanguage") === "es") {
            document.getElementById('preferences-description').innerHTML = `¿Tiene en mente un diagnóstico o tema de salud específico?`
        }
    } else {
        if (sessionStorage.getItem("literallanguage") === "en") {
            document.getElementById('preferences-description').innerHTML = `First, is there a <b>specific diagnosis or health topic</b> for the person you are searching for?`
        } else if (sessionStorage.getItem("literallanguage") === "es") {
            document.getElementById('preferences-description').innerHTML = `¿Tiene en mente un diagnóstico o tema de salud específico?`            
        }
    }
    if (sessionStorage.getItem("literallanguage") === "es") {
        document.getElementById('diagnosis-option').innerHTML = `Sí, quiero buscar un diagnóstico específico.`
    } else if (sessionStorage.getItem("literallanguage") === "es") {
        document.getElementById('browse-option').innerHTML = `No, solo estoy explorando.`
    }
}

if (document.getElementById("diagnosis-description")) {
    if (role === 'Patient') {
        document.getElementById('diagnosis-description').innerHTML = `Please enter <b>up to 3</b> search terms you'd like to search for. This could include (hover over each for examples):`
    } else {
        document.getElementById('diagnosis-description').innerHTML = `Please enter <b>up to 3</b> search terms for the person you are searching for. This could include (hover over each for examples):`
    }
}

if (document.getElementById("results-page")) {
    if (role === 'Patient') {
        document.getElementById('preferences-description').innerHTML = `Please fill out the information below so we can find research studies <b>you might qualify for</b>.`
    } else {
        document.getElementById('preferences-description').innerHTML = `Please fill out the information below so we can find research studies <b>the person you're entering information for might qualify for</b>.`
    }
}

if (document.getElementById("groupings")) {
    console.log(sessionStorage.preferences)
    if (sessionStorage.preferences === "Browse") {
        console.log(document.getElementById("back-link").href)
        document.getElementById("back-link").href = document.getElementById("back-link").href + "Browse"
    } else {
        document.getElementById("back-link").href = document.getElementById("back-link").href +  "Diagnosis"
    }
}



