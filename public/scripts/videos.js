console.log("IN VIDEO JS")
const video = document.getElementById('myVideo');

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