const express = require('express')
const session = require('express-session');
require('dotenv').config()
const stringSimilarity = require('string-similarity');
const routerImporter = require('./routes/StudySearch');
const StudySearchRouter = routerImporter.StudySearchRouter;
const errorProtocol = routerImporter.errorProtocol;
const app = express()
const CryptoJS = require("crypto-js");
// <--- openai constants
const OpenAI = require('openai');
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // This is the default and can be omitted
});

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));
app.use(express.json())
var sql = require("mssql");

const columnNames = ['diseases', 'synonym1', 'synonym2', 'synonym3', 'synonym4', 'synonym5', 'synonym6', 'synonym7', 'synonym8', 'synonym9', 'synonym10', 'synonym11', 'synonym12', 'synonym13', 'synonym14', 'synonym15', 'synonym16', 'synonym17', 'synonym18', 'synonym19', 'synonym20', 'synonym21', 'synonym22', 'synonym23', 'synonym24', 'synonym25', 'synonym26', 'synonym27', 'synonym28', 'synonym29', 'synonym30', 'synonym31', 'synonym32', 'synonym33', 'synonym34', 'synonym35', 'synonym36', 'synonym37', 'synonym38', 'synonym39', 'synonym40', 'synonym41', 'synonym42', 'synonym43', 'synonym44', 'synonym45', 'synonym46', 'synonym47', 'synonym48', 'synonym49', 'synonym50', 'synonym51'];

const formData = ['ConditionText1', 'ConditionText2', 'ConditionText3', 'Age', 'Gender', 'LocationState', 'LocationCity', 'Conditions'];
const groupingsData = ['HealthyLiving', 'PreventionScreening', 'Treatment', 'Survivorship', 'Other'];
const groupingsNames = ['Healthy Living', 'Cancer Prevention & Screening', 'Treatment', 'Survivorship', 'Other'];

const FLAG = 'FLAG';


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

app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    rolling: true,
    cookie: {
        maxAge: 1000 * 60 * 15
    },
}))

app.post('/updateDatabase', (req, res) => {
    let setList = ''
    console.log(req.body)
    for (const [key, value] of Object.entries(req.body)) {
        if (key !== FLAG)
            setList += key + `='` + value + `', `
        if (key === 'vCHE') {
            req.session.params.vCHE = req.body.vCHE
        }
    }
    setList = setList.slice(0, -2);


    // BEGIN DATABSAE STUFF:SENDING VERSION (R24 OR U01) AND ID TO DATABASE
    var id = req.session.params.id;
    var type = req.session.params.interventionType;
    var vCHE = req.session.params.vCHE;
    if (setList === '') {
        res.json({ id: id, type: type, vCHE: vCHE });
        return;
    }
    sql.connect(config, function (err) {
        if (err) {
            errorProtocol(err, req, res);
            console.log(err);
        }

        // create Request object
        var request = new sql.Request();

        let queryString = `
        UPDATE R24
        SET ${setList} 
        WHERE ID = '${req.session.params.id}' 
        AND VisitNum = ${req.session.params.visitNum}`
        // console.log(queryString);
        req.session.params.queryString = queryString;
        request.query(queryString, function (err, recordset) {
            if (err) {
                errorProtocol(err, req, res);
                console.log(err);
            }
            console.log(vCHE)
            res.json({ id: id, type: type, vCHE: vCHE });
        });

    });
    // END DATABASE STUFF
})

app.post('/SendError', (req, res) => {
    errorProtocol(req.body.error, req, res);
    res.send("Error recorded successfully");
})


app.post('/storeCharacterInfoInServer', async (req, res) => {
    // console.log("IN STORE CHARACTER INFO")
    req.session.params.vCHE = req.body.vh
    req.session.params.vhType = req.body.vh
    // console.log(req.session.params)
    var id = req.session.params.id;
    var vh = req.session.params.vCHE;
    var interventionType = req.session.params.interventionType;
    res.json({ id: id, vhType: interventionType, vh: vh });
});

app.post("/:id/:interventionType/RetrieveConditions", (req, res) => {
    const searchValue = (Object.entries(req.body)[0][1]);

    // List all synonym columns to be selected
    const synonymColumns = Array.from({ length: 51 }, (_, i) => `synonym${i + 1}`).join(", ");

    // Construct the query to select the disease and all synonym columns
    let queryString = `
    SELECT TOP 300 diseases, ${synonymColumns} FROM Diseases
    WHERE ${columnNames.map(column => `${column} LIKE '%${searchValue}%'`).join(' OR ')}
    `;

    req.session.params.queryString = queryString;

    sql.connect(config, function (err) {
        if (err) {
            errorProtocol(err, req, res);
            console.log(err);
            return;
        }

        var request = new sql.Request();
        request.query(queryString, function (err, recordset) {
            if (err) {
                errorProtocol(err, req, res);
                console.log(err);
                return;
            }

            let conditions = recordset.recordset;

            // For each condition, find the synonym that is the closest match to the searchValue
            let results = conditions.map(condition => {
                // Collect all non-empty synonyms into an array
                const synonymsArray = [];
                for (let i = 1; i <= 51; i++) {
                    const synonym = condition[`synonym${i}`];
                    if (synonym) {
                        synonymsArray.push(synonym.trim());
                    }
                }

                // Find the synonym with the highest similarity score
                const bestMatch = synonymsArray.reduce((best, synonym) => {
                    const similarity = stringSimilarity.compareTwoStrings(searchValue, synonym);
                    return (similarity > best.similarity) ? { synonym, similarity } : best;
                }, { synonym: '', similarity: 0 });

                return {
                    disease: condition.diseases,
                    bestMatch: bestMatch.synonym,
                    similarity: bestMatch.similarity
                };
            });

            // Sort the results by similarity score, highest first
            results.sort((a, b) => b.similarity - a.similarity);
            // console.log(results.slice(0, 10));
            // Limit the results to top 10 most similar items
            res.json(results.slice(0, 10));
        });
    });
});

// Root route that redirects to valid route
app.get('/', (req, res) => {
    res.redirect('/test-id/vh/bf');
});

// ID is userID from qualtrics, interventionType is vh or text from Qualtrics
app.get('/:id/:interventionType/:vh', checkPreviousVisit, addVisitToDatabase, (req, res) => {
    console.log(req.params)
    if (!req.session.params) {
        req.session.params = {};
        req.session.params.id = req.params.id
        req.session.params.interventionType = req.params.interventionType
        req.session.params.vhType = req.params.vh
        req.session.params.vCHE = req.params.vh
    }

    var id = req.session.params.id;
    var interventionType = req.session.params.interventionType;
    var vhType = req.session.params.vhType;
    // console.log("INTERVENTION TYPE IS", interventionType)

    if (interventionType === "text") {
        res.render('pages/indexText', {id: id, interventionType: interventionType, vhType: vhType})
    } 
    else {
        res.render('pages/index', {id: id, interventionType: interventionType, vhType: vhType})
    }
})


app.get('/:id/:interventionType/:vh/Discover', (req, res) => {
    var id = req.session.params.id;
    var interventionType = req.session.params.interventionType;
    var visitNum = req.session.params.visitNum;
    var vh = req.session.params.vCHE;
    var vhType = req.session.params.vhType;
    // console.log("SESSION STUFF IS:", req.session)
    sql.connect(config, function (err) {

        if (err) {
            errorProtocol(err, req, res);
            console.log(err);
        }
        // create Request object
        var request = new sql.Request();

        let queryString = `
        UPDATE R24
        SET Discover = 'clicked'
        WHERE ID = '` + id + `' 
        AND VisitNum = '` + visitNum + `'`;
        req.session.params.queryString = queryString;

        request.query(queryString, function (err, recordset) {
            if (err) {
                errorProtocol(err, req, res);
                console.log(err);
            }
        });

    });

    res.render('pages/discover', {id: id, vh: vh, interventionType: interventionType, vhType: vhType})
})


app.post('/storeParameters', (req, res) => {


    var background = false;
    var conditions = false;
    var groupings = false;
    var role = false;
    var preferences = false;

    if (!req.session.params) {
        req.session.params = {};
    }
    // =============================================
    // Initialize Search Criteria Variables if Needed
    // =============================================
    // This is information that is used to inform the CURRENT search
    if (!req.session.params.searchCriteria) {
        req.session.params.searchCriteria = {};
    }
    if (!req.session.params.searchCriteria.Groupings) {
        req.session.params.searchCriteria.Groupings = [];
    }

    // =============================================
    // Initialize Past Search Criteria Variables if Needed
    // =============================================
    // This is information that holds the PAST searches (i.e., multiple in one session)
    if (!req.session.params.searches) {
        req.session.params.searches = {};
    }
    if (!req.session.params.searches.Preferences) {
        req.session.params.searches.Preferences = []
    }
    if (!req.session.params.searches.Role) {
        req.session.params.searches.Role = []
    }
    if (!req.session.params.searches.Groupings) {
        req.session.params.searches.Groupings = []
    }
    if (!req.session.params.searches.Conditions) {
        req.session.params.searches.Conditions = []
    }
    if (!req.session.params.searches.Age) {
        req.session.params.searches.Age = [];
    }
    if (!req.session.params.searches.Gender) {
        req.session.params.searches.Gender = [];
    }
    if (!req.session.params.searches.LocationState) {
        req.session.params.searches.LocationState = [];
    }
    if (!req.session.params.searches.LocationCity) {
        req.session.params.searches.LocationCity = [];
    }

    // =============================================
    // Store Information Sent from User
    // =============================================
    if (req.body.Background) {
        req.session.params.searchCriteria.Age = parseInt(req.body.Background.Age);
        req.session.params.searchCriteria.Gender = req.body.Background.Gender;
        req.session.params.searchCriteria.LocationState = req.body.Background.LocationState;
        req.session.params.searchCriteria.LocationCity = req.body.Background.LocationCity;

        // req.session.params.searchCriteria = {
        //     "Age": parseInt(req.body.Background.Age),
        //     "Gender": req.body.Background.Gender,
        //     "LocationState": req.body.Background.LocationState,
        //     "LocationCity": req.body.Background.LocationCity
        // }
        req.session.params.searches.Age.push({
            "Age": parseInt(req.body.Background.Age),
        })
        req.session.params.searches.Gender.push({
            "Gender": req.body.Background.Gender
        })
        req.session.params.searches.LocationState.push({
            "LocationState": req.body.Background.LocationState
        })
        req.session.params.searches.LocationCity.push({
            "LocationCity": req.body.Background.LocationCity
        })
        background = true;
    } else if (req.body.Conditions) {
        if (req.body.Conditions.ConditionText1)
            req.session.params.searchCriteria.ConditionText1 = req.body.Conditions.ConditionText1;
        if (req.body.Conditions.ConditionText2)
            req.session.params.searchCriteria.ConditionText2 = req.body.Conditions.ConditionText2;
        if (req.body.Conditions.ConditionText3)
            req.session.params.searchCriteria.ConditionText3 = req.body.Conditions.ConditionText3;
        req.session.params.searches.Conditions.push({
            "Conditions": req.body.Conditions
        })
        conditions = true;
    } else if (req.body.Groupings) {
        // console.log(req.body.Groupings);
        // We need to conver the Groupings into the Clean Text Form in groupingsNames
        var cleanGroupings = [];
        for (const [key, value] of Object.entries(req.body.Groupings)) {
            if (groupingsData.includes(key)) {
                let index = groupingsData.indexOf(key);
                let category = groupingsNames[index];
                cleanGroupings.push(category);
                // console.log(category);
            }
        }
        req.session.params.searchCriteria.Groupings = cleanGroupings;
        req.session.params.searches.Groupings.push({
            "Groupings": cleanGroupings
        })
        groupings = true;
    }
    else if (req.body.Role) {
        console.log(req.body.Role);
        req.session.params.searchCriteria.Role = req.body.Role;
        req.session.params.searches.Role.push({
            "Role": req.body.Role
        })
        role = true;
    }
    else if (req.body.Preferences) {
        req.session.params.searchCriteria.Preferences = req.body.Preferences;
        req.session.params.searches.Preferences.push({
            "Preferences": req.body.Preferences
        })
        preferences = true;
    }
    // console.log(req.session.params.searches);
    // console.log(req.session.params.searchCriteria);

    // =============================================
    // Log Search Criterias
    // =============================================
    sql.connect(config, function (err) {
        var id = req.session.params.id;
        var type = req.session.params.interventionType;
        var vCHE = req.session.params.vCHE;

        if (err) {
            errorProtocol(err, req, res);
            console.log(err);
        }

        if (background) {
            // create Request object
            var request = new sql.Request();

            let queryString = `
            UPDATE R24
            SET Age = @age, Gender = @gender, LocationState = @locationState, LocationCity = @locationCity 
            WHERE ID = @id
            AND VisitNum = @visitNum`


            request.input('age', sql.VarChar, JSON.stringify(req.session.params.searches.Age));
            request.input('gender', sql.VarChar, JSON.stringify(req.session.params.searches.Gender));
            request.input('locationState', sql.VarChar, JSON.stringify(req.session.params.searches.LocationState));
            request.input('locationCity', sql.VarChar, JSON.stringify(req.session.params.searches.LocationCity));
            request.input('id', sql.VarChar, req.session.params.id);
            request.input('visitNum', sql.Int, req.session.params.visitNum);
            // console.log(queryString);
            req.session.params.queryString = queryString;
            request.query(queryString, function (err, recordset) {
                if (err) {
                    errorProtocol(err, req, res);
                    console.log(err);
                }
                res.json({ id: id, type: type, vCHE: vCHE });
            });
        }
        if (conditions) {
            // create Request object
            var request = new sql.Request();

            let queryString = `
            UPDATE R24
            SET Conditions = @conditions 
            WHERE ID = @id
            AND VisitNum = @visitNum`

            request.input('conditions', sql.VarChar, JSON.stringify(req.session.params.searches.Conditions));
            request.input('id', sql.VarChar, req.session.params.id);
            request.input('visitNum', sql.Int, req.session.params.visitNum);
            // console.log(queryString);
            req.session.params.queryString = queryString;
            request.query(queryString, function (err, recordset) {
                if (err) {
                    errorProtocol(err, req, res);
                    console.log(err);
                }
                res.json({ id: id, type: type, vCHE: vCHE });
            });
        }
        if (groupings) {
            // create Request object
            var request = new sql.Request();

            let queryString = `
            UPDATE R24
            SET Groupings = @groupings 
            WHERE ID = @id
            AND VisitNum = @visitNum`


            request.input('groupings', sql.VarChar, JSON.stringify(req.session.params.searches.Groupings));
            request.input('id', sql.VarChar, req.session.params.id);
            request.input('visitNum', sql.Int, req.session.params.visitNum);
            // console.log(queryString);
            req.session.params.queryString = queryString;
            request.query(queryString, function (err, recordset) {
                if (err) {
                    errorProtocol(err, req, res);
                    console.log(err);
                }
                res.json({ id: id, type: type, vCHE: vCHE });
            });
        }
        if (role) {
            // create Request object
            var request = new sql.Request();

            let queryString = `
            UPDATE R24
            SET Role = @role 
            WHERE ID = @id
            AND VisitNum = @visitNum`

            request.input('role', sql.VarChar, JSON.stringify(req.session.params.searches.Role));
            request.input('id', sql.VarChar, req.session.params.id);
            request.input('visitNum', sql.Int, req.session.params.visitNum);
        
            // console.log(queryString);
            req.session.params.queryString = queryString;
            request.query(queryString, function (err, recordset) {
                if (err) {
                    errorProtocol(err, req, res);
                    console.log(err);
                }
                res.json({ id: id, type: type, vCHE: vCHE });
            });
        }
        if (preferences) {
            // create Request object
            var request = new sql.Request();

            let queryString = `
            UPDATE R24
            SET Preferences = @preferences 
            WHERE ID = @id
            AND VisitNum = @visitNum`

            request.input('preferences', sql.VarChar, JSON.stringify(req.session.params.searches.Preferences));
            request.input('id', sql.VarChar, req.session.params.id);
            request.input('visitNum', sql.Int, req.session.params.visitNum);
            // console.log(queryString);
            req.session.params.queryString = queryString;
            request.query(queryString, function (err, recordset) {
                if (err) {
                    errorProtocol(err, req, res);
                    console.log(err);
                }
                res.json({ id: id, type: type, vCHE: vCHE });
            });
        }




    });
    // END DATABASE STUFF
    console.log("SEARCH CRITERIA IS", req.session.params.searchCriteria)
})

function checkPreviousVisit(req, res, next) {
    if (req.session.visitedIndex && req.session.params.interventionType === req.params.interventionType) {
        next();
        return;
    }
    var id = req.params.id;
    var interventionType = req.params.interventionType;
    if (!req.session.params) {
        req.session.params = {};
        req.session.params.id = id;
        req.session.params.interventionType = interventionType;
        req.session.params.vhType = req.params.vh
        req.session.params.vCHE = req.params.vh
    }
    if (req.session.params.interventionType !== req.params.interventionType) {
        req.session.params.interventionType = interventionType;
    }

    var visitN = -1;
    // 
    sql.connect(config, function (err) {
        if (err) {
            errorProtocol(err, req, res);
            console.error('SQL connection error:', err);
            next(err);
            return;
        }

        const request = new sql.Request();

        // Query Check for Existing Entry In Table
        let checkString = `
        SELECT * FROM R24
        WHERE ID = '` + id + `'
        AND InterventionType = '` + interventionType + `'
        AND VisitNum = (
            SELECT max(VisitNum)
            FROM R24
            WHERE ID = '` + id + `'
            AND InterventionType = '` + interventionType + `'
        )`
        req.session.params.queryString = checkString;

        request.query(checkString, function (err, recordset) {
            if (err) {
                errorProtocol(err, req, res)
                console.error('SQL query error:', err);
                next(err);
                return;
            }
            if (recordset.recordset.length === 0) {
                visitN = 1;
                req.session.params.visitNum = visitN;

            } else {
                visitN = recordset.recordset[0].VisitNum + 1;
            }
            req.session.params.visitNum = visitN;
            next();
        });
    });

}

function addVisitToDatabase(req, res, next) {
    if (!req.session.visitedIndex) {
        req.session.visitedIndex = true;
    } else {
        next();
        return;
    }
    if (!req.session.params) {
        req.session.params = {};
    }
    var id = req.params.id;
    var interventionType = req.params.interventionType;
    var vCHE = req.params.vCHE;
    var vhType = req.params.vhType;
    req.session.params.id = id;
    req.session.params.interventionType = interventionType;

    var visitNum = req.session.params.visitNum;
    req.session.params.visitNum = visitNum;
    sql.connect(config, function (err) {
        if (err) {
            errorProtocol(err, req, res)
            console.error('SQL connection error:', err);
            next(err);
            return;
        }

        const request = new sql.Request();
        // let queryString = `INSERT INTO R24 (ID, VisitNum, InterventionType) VALUES ('` + id  + `',` + visitNum + `,'` + interventionType + `')`;
        let queryString = `
        INSERT INTO R24 (ID, VisitNum, InterventionType, vCHE, vhType)
        VALUES (@id, @visitNum, @interventionType, @vCHE, @vhType)`

        // Add input parameters
        request.input('id', sql.VarChar(50), id);
        request.input('visitNum', sql.Int, visitNum);
        request.input('interventionType', sql.VarChar(50), interventionType);
        request.input('vCHE', sql.VarChar(50), vCHE);
        request.input('vhType', sql.VarChar(50), vhType);

        request.query(queryString, function (err, recordset) {
            if (err) {
                errorProtocol(err, req, res);
                console.error('SQL query error:', err);
                next(err);
                return;
            }
            next();
        });
    });
}

app.post('/:id/:interventionType/RetrieveCities', (req, res) => {
    var id = req.params.id
    var interventionType = req.params.interventionType
    let stateVal = (Object.entries(req.body)[0][1])
    let cityVal = (Object.entries(req.body)[1][1])
    const code = cityVal.charCodeAt(0)
    let database = "StatesAndCitiesAG"
    if ((code >= 97 && code <= 103) || (code >= 65 && code <= 71)) {
        database = "StatesAndCitiesAG"
    }
    else if ((code >= 104 && code <= 111) || (code >= 72 && code <= 79)) {
        database = "StatesAndCitiesHO"
    }
    else {
        database = "StatesAndCitiesPZ"
    }

    const queryString = `
    SELECT * FROM ${database}
    WHERE State = '${stateVal}' 
    `;

    req.session.params.queryString = queryString;

    sql.connect(config, function (err) {
        if (err) {
            errorProtocol(err, req, res);
            console.log(err);
        }
        var request = new sql.Request();
        request.query(queryString, function (err, recordset) {
            if (err) {
                errorProtocol(err, req, res);
                console.log(err);
            }
            res.json(recordset.recordset);
        });
    })
});

// Virtual Human Types
const EducationalComponentRouter = require('./routes/EducationalComponent');
app.use('/:id/:interventionType/:vh/EducationalComponent', function (req, res, next) {
    req.id = req.session.params.id;
    req.vh = req.session.params.vCHE;
    req.vhType = req.session.params.vhType;
    req.interventionType = req.session.params.interventionType;
    req.visitNum = req.session.params.visitNum;
    next();
}, EducationalComponentRouter)


// Text Types
const EducationalComponentTextRouter = require('./routes/EducationalComponentText')
app.use('/:id/:interventionType/:vh/EducationalComponentText', function (req, res, next) {
    req.id = req.session.params.id;
    req.vh = req.session.params.vCHE;
    req.vhType = req.session.params.vhType;
    req.interventionType = req.session.params.interventionType;
    req.visitNum = req.session.params.visitNum;
    next();
}, EducationalComponentTextRouter)

// Clinical Trials/study search router
const { json } = require('body-parser');
app.use('/:id/:interventionType/:vh/StudySearch', function (req, res, next) {
    req.id = req.session.params.id;
    req.vh = req.session.params.vCHE;
    req.vhType = req.session.params.vhType;
    req.interventionType = req.session.params.interventionType;
    req.visitNum = req.session.params.visitNum;
    next();
}, StudySearchRouter)


app.listen(process.env.PORT || 3000);