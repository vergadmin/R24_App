<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;900&display=swap" rel="stylesheet">
    <link href="/css/master.css" rel="stylesheet" type="text/css">
    <link href="/css/index.css" rel="stylesheet" type="text/css">
    <link href="/css/studySearch.css" rel="stylesheet" type="text/css">
    <link href="/css/progress.css" rel="stylesheet" type="text/css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bowser/2.11.0/bundled.js"></script>
    <script src="/scripts/studySearch.js"></script>
    <script src="/scripts/registerClicks.js"></script>
    <script src="/scripts/generatingResults.js"></script>
    <script src="/scripts/checkLanguage.js"></script>
    <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
    <title>ALEX</title>
</head>
<body>
    <div id="load">
        <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div></div>
    </div>
    <header>
        <%- include('../../partials/header'); %>
    </header>
    <div class="container">
        <div class="progress-container">
            <div class="progress-bar">
                <div class="step visted">
                    <div class="bullet visited"><span>✓</span></div>
                    <p>Role</p>
                </div>
                <div class="step visited">
                    <div class="bullet visited"><span>✓</span></div>
                    <p>Background</p>
                </div>
                <div class="step visited">
                    <div class="bullet visited"><span>✓</span></div>
                    <p>Preferences</p>
                </div>
                <div class="step active">
                    <div class="bullet active"><span>4</span></div>
                    <p>Generating Results</p>
                </div>
                <div class="step">
                    <div class="bullet"><span>5</span></div>
                    <p>Studies</p>
                </div>
            </div>
        </div>
        <h1 class="title" id="loaded-title">Your Results Are Loading ...</h1>      
            <% if (interventionType === 'vh') { %>
                <div id="notice-area">
                    <p style="font-size: 19px; margin-top: 5px; font-style: italic;">Please view a quick message from Alex below while we create a personalized list of research studies for you!</p>
                </div>
                <br/>
                <video id="alex-video" autoplay controls>
                    <source src="https://research-studies-with-alex.s3.amazonaws.com/vCHE/<%=vhType%>/<%=vh%>_GeneratingResults.mp4" type="video/mp4">
                </video>
            <% } else { %>
                <div id="notice-area">
                <p style="font-size: 19px; margin-top: 5px; font-style: italic;">Please read the message below while we create a personalized list of research studies for you!</p>
                <img class="character-image" src="https://research-studies-with-alex.s3.amazonaws.com/vCHE-images/<%=vh%>.png"/>
                <p>Thank you so much for sharing that information! We are now generating a personalized list of research studies that might be a great fit for you. This process only takes a few moments.</p>
                <p>On the next page, be sure to locate the "Complete Survey" button to take the post-survey once you are done looking through your personalized list of research studies.</p>
                <p>Your personalized clinical trial list should be ready soon. Please click the button below to view your results!</p>
                </div>
            <% } %>
       
        
        <br/>
        <p id="still-loading" style="font-size: 19px; margin-top: 5px; font-style: italic; display: none">Your results are taking slightly longer than expected to load. \n Please wait one more minute for us to personalize your research studies list!</p>
        <a id = "seeHref" href="/<%=id%>/<%=interventionType%>/<%=vh%>/StudySearch/Results">
            <button id = "results" disabled class = "disabled">Loading...</button>
        </a>      
    </div>
</body>
<script>
    var video = document.getElementById("alex-video")
    if (video){
        // Add an event listener for the 'ended' event
        video.addEventListener('ended', function() {
            console.log('The video has ended.');
            var stillLoadingText = document.getElementById("still-loading");
            stillLoadingText.style.display = 'block'
        });
    }

</script>
</html>