window.addEventListener("load", () => {
    getResults();
});



async function getResults() {
    var url = `/StudySearch/Results`

    
    let res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
    });
    if (res.ok) {
        let ret = await res.json();
        var button = document.getElementById("results");
        var loadedTitle = document.getElementById("loaded-title");
        if (ret.numTrials === 0) {
            document.getElementById("notice-area").style.display = 'none';
            button.className = "green";
            button.innerText = "See Recommended Study Results";
            button.disabled = false;
            button.style.backgroundColor = "#22884C"
            button.classList.add('pulse');

            if (sessionStorage.getItem("literallanguage") === "en") {
                loadedTitle.innerText = "ClinicalTrials.gov was unable to locate any trials with your specified criteria. But we do have recommended trials you can observe."
                document.getElementById("still-loading").innerText = "ClinicalTrials.gov was unable to locate any trials with your specified criteria. You can try searching again with different conditions and preferences, if you'd like.";
                loadedTitle.innerText = "Your Results are Ready!"
                document.getElementById("still-loading").innerText = "Your results are ready! Please click the button below."
                button.innerText = "See Recommended Study Results";
            } else if (sessionStorage.getItem("literallanguage") === "es") {
                loadedTitle.innerText = "ClinicalTrials.gov no pudo encontrar estudios que coincidan exactamente con sus criterios, pero sí tenemos estudios recomendados que puede revisar."
                document.getElementById("still-loading").innerText = "ClinicalTrials.gov no pudo encontrar estudios que coincidan exactamente con sus criterios. Si lo desea, puede intentar buscar nuevamente con diferentes condiciones y preferencias.";
                loadedTitle.innerText = "¡Sus resultados están listos!"
                document.getElementById("still-loading").innerText = "¡Su lista personalizada de estudios esta lista! Haz clic en el botón de abajo."
                button.innerText = "Ver resultados de estudios recomendados";
            }
            
            document.getElementById("still-loading").style.display = 'block'
            document.getElementById("link-text-area").style.display = 'none'
            document.getElementById("noneHref").style.display = "block";
            document.getElementById("noneId").className = 'blue';
            document.getElementById("noneId").disabled = false;
        }
        else {
            button.className = "green";
            if (sessionStorage.getItem("literallanguage") === "en") {
                button.innerText = "See Study Results";
            } else if (sessionStorage.getItem("literallanguage") === "es") {
                button.innerText = "Ver Estudios"
            }
            button.disabled = false;
            button.style.backgroundColor = "#22884C"
            button.classList.add('pulse');

            loadedTitle.innerText = "Your Results are Ready!"
            document.getElementById("still-loading").innerText = "Your results are ready! Please click the button below."
            // window.location.href = res.url
        }

    } else {
        return `HTTP error: ${res.status}`;
    }
}