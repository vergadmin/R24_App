function download() {
    sendToDatabase(`DownloadGuide`, `clicked`)
    window.open(`https://vpf2content.s3.amazonaws.com/Uploads/Videos/R24/pdfs/questions.pdf`, '_blank');
}

function redirectToSearch() {
    window.location.href = "/StudySearch/Role";
}
