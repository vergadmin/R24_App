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

router.get('/Introduction', validateSession, updateDatabase, (req, res) => {
    const id = req.session?.params?.id;
    const vCHE = req.session?.params?.vCHE;
    const interventionType = req.session?.params?.interventionType;
    res.render("pages/interventionType/EducationalComponentText/introduction", { id: id, interventionType: interventionType, buttons: buttons, url: 'Introduction', vCHE: vCHE })
})

router.get('/1', validateSession, updateDatabase, (req, res) => {
    const id = req.session?.params?.id;
    const vCHE = req.session?.params?.vCHE;
    const interventionType = req.session?.params?.interventionType;
    res.render("pages/interventionType/EducationalComponentText/1", { id: id, interventionType: interventionType, buttons: buttons, url: '1', vCHE: vCHE })
})

router.get('/2', validateSession, updateDatabase, (req, res) => {
    const id = req.session?.params?.id;
    const vCHE = req.session?.params?.vCHE;
    const interventionType = req.session?.params?.interventionType;
    res.render("pages/interventionType/EducationalComponentText/2", { id: id, interventionType: interventionType, buttons: buttons, url: '2', vCHE: vCHE })
})

router.get('/3', validateSession, updateDatabase, (req, res) => {
    const id = req.session?.params?.id;
    const vCHE = req.session?.params?.vCHE;
    const interventionType = req.session?.params?.interventionType;
    res.render("pages/interventionType/EducationalComponentText/3", { id: id, interventionType: interventionType, buttons: buttons, url: '3', vCHE: vCHE })
})

router.get('/4', validateSession, updateDatabase, (req, res) => {
    const id = req.session?.params?.id;
    const vCHE = req.session?.params?.vCHE;
    const interventionType = req.session?.params?.interventionType;
    res.render("pages/interventionType/EducationalComponentText/4", { id: id, interventionType: interventionType, buttons: buttons, url: '4', vCHE: vCHE })
})

function validateSession(req, res, next) {
    if (!req.session) {
        req.session = {};
    }
    if (!req.session.params) {
        req.session.params = {};
    }
    if (!req.session.params.videosWatched) {
        req.session.params.videosWatched = {
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "Introduction": []
        };
    }
    next();
    return;
}

async function updateDatabase(req, res, next) {
    const dbEntry = req.url.slice(1);
    const currentTimeInEST = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
    const vCHE = req.session?.params?.vCHE || "Error in vCHE"
    const videoObject = { timestamp: currentTimeInEST, vCHE: vCHE };
    var currentVideos = req.session?.params?.videosWatched[dbEntry] || [];
    currentVideos.push(videoObject);
    req.session.params.videosWatched[dbEntry] = currentVideos;
    const videosWatchedString = JSON.stringify(currentVideos);
    const id = req.session?.params?.id || "Error in ID";
    const interventionType = req.session?.params?.interventionType || "Error in Intervention Type";
    const visitNum = req.session?.params?.visitNum || -1;

    // BEGIN DATABSAE STUFF:SENDING VERSION (R24 OR U01) AND ID TO DATABASE

    try {
        const request = new sql.Request(); // No need to connect, just use the global pool
        let queryString = `
            UPDATE R24
            SET Educational_${dbEntry} = @videosWatched
            WHERE ID = @id
            AND VisitNum = @visitNum
            AND InterventionType = @interventionType`

        req.session.params.queryString = queryString;
        request.input("videosWatched", sql.VarChar, videosWatchedString);
        request.input("id", sql.VarChar, id);
        request.input("visitNum", sql.Int, visitNum);
        request.input("interventionType", sql.VarChar, interventionType);
        await request.query(queryString); // Await to ensure it 
        next();
    } catch (err) {
        console.error("SQL error:", err);
        errorProtocol(err, req, res);
        next(err);
    }
}

module.exports = router