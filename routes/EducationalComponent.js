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
        text: "Introduction"
    },
    {
        url: '1',
        text: "What are research studies?"
    },
    {
        url: '2',
        text: "Why consider participating?"
    },
    {
        url: '3',
        text: "Are research studies safe?"
    },
    {
        url: '4',
        text: "How to participate and where to start?"
    }
]

router.get('/Introduction', updateDatabase, (req, res) => {
    var id = req.session.params.id;
    var vh = req.session.params.vCHE;
    var interventionType = req.session.params.interventionType;
    var vhType = req.session.params.vhType;
    res.render("pages/interventionType/EducationalComponent/introduction", {id: id, vh: vh, vhType: vhType, interventionType: interventionType, buttons: buttons, url: 'Introduction'})
})

router.get('/1', updateDatabase, (req, res) => {
    var id = req.session.params.id;
    var vh = req.session.params.vCHE;
    var interventionType = req.session.params.interventionType;
    var vhType = req.session.params.vhType;
    res.render("pages/interventionType/EducationalComponent/1", {id: id, vh: vh, vhType: vhType, interventionType: interventionType, buttons: buttons, url: '1'})
})

router.get('/2', updateDatabase, (req, res) => {
    var id = req.session.params.id;
    var vh = req.session.params.vCHE;
    var interventionType = req.session.params.interventionType;
    var vhType = req.session.params.vhType;
    res.render("pages/interventionType/EducationalComponent/2", {id: id, vh: vh, vhType: vhType, interventionType: interventionType, buttons: buttons, url: '2'})
})

router.get('/3', updateDatabase, (req, res) => {
    var id = req.session.params.id;
    var vh = req.session.params.vCHE;
    var interventionType = req.session.params.interventionType;
    var vhType = req.session.params.vhType;
    res.render("pages/interventionType/EducationalComponent/3", { id: id, vh: vh, vhType: vhType, interventionType: interventionType, buttons: buttons, url: '3'})
})

router.get('/4', updateDatabase, (req, res) => {
    var id = req.session.params.id;
    var vh = req.session.params.vCHE;
    var interventionType = req.session.params.interventionType;
    var vhType = req.session.params.vhType;
    res.render("pages/interventionType/EducationalComponent/4", {id: id, vh: vh, vhType: vhType, interventionType: interventionType, buttons: buttons, url: '4'})
})

function updateDatabase(req, res, next) {
    let dbEntry = req.url.slice(1)
    // BEGIN DATABSAE STUFF:SENDING VERSION (R24 OR U01) AND ID TO DATABASE
    sql.connect(config, function (err) {

        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();

        let queryString = `
        UPDATE R24U01
        SET Educational_` + dbEntry + `= 'clicked'
        WHERE ID = '` + req.id + `' 
        AND VisitNum = '` + req.visitNum + `'`;
        req.session.params.queryString = queryString;

        // console.log("AB TO DO DATABASE THING")
        request.query(queryString, function (err, recordset) {
            if (err) console.log(err)
        }); 
        // console.log("DID THE DB THING")
    });
    // END DATABASE STUFF

    next();
}

module.exports = router