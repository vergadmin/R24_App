const express = require('express')
const router = express.Router()
var sql = require("mssql");

const config = {
    user: 'VergAdmin',
    password: process.env.PASSWORD,
    server: process.env.SERVER,
    port: parseInt(process.env.DBPORT, 10), 
    database: process.env.DATABASE,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    },
    options: {
      encrypt: true, // for azure
      trustServerCertificate: true // change to true for local dev / self-signed certs
    }
}

const buttons = [
    {
        url: 'Introduction',
        text: "Introduction",
        spanishText: "Inicio"
    },
    {
        url: '1',
        text: "What are research studies?",
        spanishText: "¿Qué son los estudios de investigación?"
    },
    {
        url: '2',
        text: "Why consider participating?",
        spanishText: "¿Por qué considerar participar?"
    },
    {
        url: '3',
        text: "Are research studies safe?",
        spanishText: "¿Son seguros los estudios de investigación?"
    },
    {
        url: '4',
        text: "How to participate and where to start",
        spanishText: "Cómo participar y por dónde empezar"
    }
]

router.get('/Introduction', validateSession, (req, res) => {
    const id = req.session?.params?.id;
    const vCHE = req.session?.params?.vCHE;
    const interventionType = req.session?.params?.interventionType;
    const language = req.session?.params?.language;
    res.render("pages/interventionType/EducationalComponent/introduction", {id: id, vCHE: vCHE, interventionType: interventionType, buttons: buttons, url: 'Introduction', language: language})
})

router.get('/1', validateSession, (req, res) => {
    const id = req.session?.params?.id;
    const vCHE = req.session?.params?.vCHE;
    const interventionType = req.session?.params?.interventionType;
    const language = req.session?.params?.language;
    res.render("pages/interventionType/EducationalComponent/1", {id: id, vCHE: vCHE, interventionType: interventionType, buttons: buttons, url: '1', language: language})
})

router.get('/2', validateSession, (req, res) => {
    const id = req.session?.params?.id;
    const vCHE = req.session?.params?.vCHE;
    const interventionType = req.session?.params?.interventionType;
    const language = req.session?.params?.language;
    res.render("pages/interventionType/EducationalComponent/2", {id: id, vCHE: vCHE, interventionType: interventionType, buttons: buttons, url: '2', language: language})
})

router.get('/3', validateSession, (req, res) => {
    const id = req.session?.params?.id;
    const vCHE = req.session?.params?.vCHE;
    const interventionType = req.session?.params?.interventionType;
    const language = req.session?.params?.language;
    res.render("pages/interventionType/EducationalComponent/3", { id: id, vCHE: vCHE, interventionType: interventionType, buttons: buttons, url: '3', language: language})
})

router.get('/4', validateSession, (req, res) => {
    const id = req.session?.params?.id;
    const vCHE = req.session?.params?.vCHE;
    const interventionType = req.session?.params?.interventionType;
    const language = req.session?.params?.language;
    res.render("pages/interventionType/EducationalComponent/4", {id: id, vCHE: vCHE, interventionType: interventionType, buttons: buttons, url: '4', language: language})
})

function validateSession(req, res, next) {
    if (!req.session) {
        req.session = {};
    }
    if (!req.session.params) {
        req.session.params = {};
    }
    if (!req.session.params.videos) {
        req.session.params.videos = {
            "Educational_1": [],
            "Educational_2": [],
            "Educational_3": [],
            "Educational_4": [],
            "Educational_Introduction": [],
            "Educational_GeneratingResults": []
        };
    }
    next();
    return;
}

// async function updateDatabase(req, res, next) {
//     const dbEntry = req.url.slice(1);
//     const currentTimeInEST = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
//     const vCHE = req.session?.params?.vCHE || "Error in vCHE"
//     const videoObject = { timestamp: currentTimeInEST, vCHE: vCHE};
//     var currentVideos = req.session?.params?.videosWatched[dbEntry] || [];
//     // currentVideos.push(videoObject);
//     req.session.params.videosWatched[dbEntry] = currentVideos;
//     const videosWatchedString = JSON.stringify(currentVideos);
//     const id = req.session?.params?.id || "Error in ID";
//     const interventionType = req.session?.params?.interventionType || "Error in Intervention Type";
//     const visitNum = req.session?.params?.visitNum || -1;

//     // BEGIN DATABSAE STUFF:SENDING VERSION (R24 OR U01) AND ID TO DATABASE

//     try {
//         const request = new sql.Request(); // No need to connect, just use the global pool
//         let queryString = `
//             UPDATE R24
//             SET Educational_${dbEntry} = @videosWatched
//             WHERE ID = @id
//             AND VisitNum = @visitNum
//             AND InterventionType = @interventionType`

//         req.session.params.queryString = queryString;
//         request.input("videosWatched", sql.VarChar, videosWatchedString);
//         request.input("id", sql.VarChar, id);
//         request.input("visitNum", sql.Int, visitNum);
//         request.input("interventionType", sql.VarChar, interventionType);
//         await request.query(queryString); // Await to ensure it 
//         next();
//     } catch (err) {
//         console.error("SQL error:", err);
//         errorProtocol(err, req, res);
//         next(err);
//     }
// }

router.post('/updateVideosInDatabase', async (req, res) => {
    console.log("REQ SESSION PARAMS VIDEOS", req.session.params.videos)
    const videoName = req.body.videoColumn;
    const videoObject = req.body.videoInfo;
    var updatedArray = req.session?.params?.videos[videoName] || [];
    updatedArray.push(videoObject);
    req.session.params.videos[videoName] = updatedArray;
    console.log("AFTER PUSH REQ SESSION PARAMS VIDEOS", req.session.params.videos)
    const videosWatchedString = JSON.stringify(updatedArray);
    const id = req.session?.params?.id || "Error in ID";
    const interventionType = req.session?.params?.interventionType || "Error in Intervention Type";
    const visitNum = req.session?.params?.visitNum || -1;

    try {
        const request = new sql.Request(); // No need to connect, just use the global pool
        let queryString = `
            UPDATE R24
            SET ${req.body.videoColumn} = @videosWatched
            WHERE ID = @id
            AND VisitNum = @visitNum
            AND InterventionType = @interventionType`

        req.session.params.queryString = queryString;
        request.input("videosWatched", sql.VarChar, videosWatchedString);
        request.input("id", sql.VarChar, id);
        request.input("visitNum", sql.Int, visitNum);
        request.input("interventionType", sql.VarChar, interventionType);
        await request.query(queryString); // Await to ensure it 
        console.log("Done! Check database!")
        res.json("Successfully added videos watched string to database");
    } catch (err) {
        console.error("SQL error:", err);
        errorProtocol(err, req, res);
        res.status(502).json({ message: "Bad Gateway. Could not fetch results." });

    }
})

module.exports = router