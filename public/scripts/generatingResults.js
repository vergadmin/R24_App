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

            loadedTitle.innerText = "ClinicalTrials.gov was unable to locate any trials with your specified criteria. But we do have recommended trials you can observe."

            document.getElementById("still-loading").innerText = "ClinicalTrials.gov was unable to locate any trials with your specified criteria. You can try searching again with different conditions and preferences, if you'd like.";
            
            document.getElementById("still-loading").style.display = 'block'
            document.getElementById("link-text-area").style.display = 'none'
            document.getElementById("noneHref").style.display = "block";
            document.getElementById("noneId").className = 'blue';
            document.getElementById("noneId").disabled = false;
        }
        else {
            button.className = "green";
            button.innerText = "See Study Results";
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