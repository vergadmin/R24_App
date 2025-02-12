const express = require('express')
const session = require('express-session');
const MSSQLStore = require('connect-mssql-v2');

require('dotenv').config()
const stringSimilarity = require('string-similarity');
const routerImporter = require('./routes/StudySearch');
const StudySearchRouter = routerImporter.StudySearchRouter;
const errorProtocol = routerImporter.errorProtocol;
const app = express()
const CryptoJS = require("crypto-js");
const crypto = require('crypto');
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

const groupingsData = ['HealthyLiving', 'PreventionScreening', 'Treatment', 'Survivorship', 'Other'];
const groupingsNames = ['Healthy Living', 'Cancer Prevention & Screening', 'Treatment', 'Survivorship', 'Other'];

const config = {
    user: "VergAdmin",
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

// Initialize the connection pool once when the app starts
async function connectDB() {
    try {
        await sql.connect(config);
        console.log("✅ MSSQL Database Connected");
    } catch (err) {
        console.error("❌ Database connection error:", err);
    }
}

connectDB(); // Call this at startup

const sessionStoreConfig = {
    user: "VergAdmin",
    password: process.env.PASSWORD,
    server: process.env.SERVER,
    port: parseInt(process.env.DBPORT, 10),
    database: process.env.DATABASE,
    options: {
        encrypt: true, // For Azure
        trustServerCertificate: true, // For local dev / self-signed certs
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
};

const sessionStoreOptions = {
    table: 'R24Sessions',
    autoRemove: true,
    autoRemoveInterval: 1000 * 60 * 60 * 24 // check to delete every 24 hours

}
const sessionStore = new MSSQLStore(sessionStoreConfig, sessionStoreOptions);

app.use(
    session({
        secret: process.env.SESSION_KEY,
        store: sessionStore, // Use MSSQL session store
        resave: false,
        saveUninitialized: false,
        rolling: true,
        cookie: {
            maxAge: 1000 * 60 * 120, // 30 min
        },
    })
);

sessionStore.on('connect', () => {
    console.log('✅ Successfully connected to the MSSQL session store.');
});

sessionStore.on('error', (err) => {
    console.error('❌ Error connecting to the MSSQL session store:', err.message);
});

sessionStore.on('sessionError', (error, classMethod) => {
    console.error('❌ Error connecting to the MSSQL session store:', error);
    console.error('❌ Class Method error connecting to the MSSQL session store:', classMethod);
})

app.post('/generalData', async (req, res) => {
    try {
        // ✅ Get the current time in EST and convert it to a proper Date object
        const estTimeString = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
        const dateTime = new Date(estTimeString); // Convert string to Date object

        // ✅ Ensure all fields are handled safely
        const deviceType = req.body?.DeviceType || "Error in Device Type";
        const operatingSystem = req.body?.OperatingSystem || "Error in OS";
        const browser = req.body?.Browser || "Error in Browser";

        const id = req.session?.params?.id || "Error in ID";
        const interventionType = req.session?.params?.interventionType || "Error in Intervention Type";
        const visitNum = req.session?.params?.visitNum || -1;

        const request = new sql.Request();

        // ✅ Parameterized Query (Prevents SQL Injection)
        let queryString = `
            UPDATE R24
            SET DateTime = @dateTime, DeviceType = @deviceType, OperatingSystem = @operatingSystem, Browser = @browser
            WHERE ID = @id
            AND VisitNum = @visitNum
            AND InterventionType = @interventionType`;

        // ✅ Bind parameters properly
        request.input("dateTime", sql.DateTime, dateTime); // Correctly formatted EST datetime
        request.input("deviceType", sql.VarChar, deviceType);
        request.input("operatingSystem", sql.VarChar, operatingSystem);
        request.input("browser", sql.VarChar, browser);
        request.input("id", sql.VarChar, id);
        request.input("visitNum", sql.Int, visitNum);
        request.input("interventionType", sql.VarChar, interventionType);

        // ✅ Execute the SQL query
        await request.query(queryString);
        // ✅ Respond to the client
        res.status(200).send({ success: true, message: "Data updated successfully" });
    } catch (err) {
        console.error("Error updating generalData:", err);
        errorProtocol(err, req, res);
    }
});

app.post('/completeSurvey', async (req, res) => {
    try {
        // ✅ Get the current time in EST and convert it to a proper Date object
        const estTimeString = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
        const dateTime = new Date(estTimeString); // Convert string to Date object

        const id = req.session?.params?.id || "Error in ID";
        const interventionType = req.session?.params?.interventionType || "Error in Intervention Type";
        const visitNum = req.session?.params?.visitNum || -1;

        const request = new sql.Request();

        // ✅ Parameterized Query (Prevents SQL Injection)
        let queryString = `
            UPDATE R24
            SET CompleteSurvey = @dateTime
            WHERE ID = @id
            AND VisitNum = @visitNum
            AND InterventionType = @interventionType`;

        // ✅ Bind parameters properly
        request.input("dateTime", sql.DateTime, dateTime); // Correctly formatted EST datetime
        request.input("id", sql.VarChar, id);
        request.input("visitNum", sql.Int, visitNum);
        request.input("interventionType", sql.VarChar, interventionType);

        // ✅ Execute the SQL query
        await request.query(queryString);

        // ✅ Respond to the client
        res.status(200).send({ success: true, message: "Data updated successfully" });
    } catch (err) {
        console.error("Error updating generalData:", err);
        errorProtocol(err, req, res);
    }
});


app.post('/updateDatabase', (req, res) => {
    let setList = ''
    // console.log(req.body)
    const currentTimeInEST = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
    for (const [key, value] of Object.entries(req.body)) {
        setList += key + `='` + value + `', `;
        if (key === "Language")
            req.session.params.language = value === "es" ? "s" : "e";
    }
    setList = setList.slice(0, -2);

    if (setList.includes("DownloadGuide")) {
        if (!req.session) {
            req.session = {};
        }
        if (!req.session.params) {
            req.session.params = {};
        }
        if (!req.session.params.downloadGuides) {
            req.session.params.downloadGuides = [];
        }
        var downloadGuides = req.session?.params?.downloadGuides || [];
        const downloadGuidesObject = { timestamp: currentTimeInEST };
        downloadGuides.push(downloadGuidesObject);
        req.session.params.downloadGuides = downloadGuides;
        const downloadGuidesString = JSON.stringify(downloadGuides);
        setList = `DownloadGuide='${downloadGuidesString}'`;
    }
    if (setList.includes("DownloadStudies")) {
        if (!req.session) {
            req.session = {};
        }
        if (!req.session.params) {
            req.session.params = {};
        }
        if (!req.session.params.downloadStudies) {
            req.session.params.downloadStudies = [];
        }

        const currentTimeInEST = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
        const currentSearchId = req.session?.params?.searches?.currentSearchId || -1;
        var downloadStudies = req.session?.params?.downloadStudies || [];
        const downloadStudiesObject = {
            timestamp: currentTimeInEST,
            searchId: currentSearchId
        }
        downloadStudies.push(downloadStudiesObject);
        req.session.params.downloadStudies = downloadStudies;
        const downloadStudiesString = JSON.stringify(downloadStudies);
        setList = `DownloadStudies='${downloadStudiesString}'`;
    }
    // BEGIN DATABSAE STUFF:SENDING VERSION (R24 OR U01) AND ID TO DATABASE
    const id = req.session?.params?.id || "Error in ID";
    const interventionType = req.session?.params?.interventionType || "Error in Intervention Type";
    const vCHE = req.session?.params?.vCHE || "Error in vCHE";
    const visitNum = req.session?.params?.visitNum || -1;
    // console.log("VCHE in UpdateDB ", vCHE);
    if (setList === '') {
        res.json({ id: id, interventionType: interventionType, vCHE: vCHE });
        return;
    }
    try {
        const request = new sql.Request();

        let queryString = `
        UPDATE R24
        SET ${setList} 
        WHERE ID = '${id}' 
        AND VisitNum = ${visitNum} 
        AND InterventionType = '${interventionType}'`;

        req.session.params.queryString = queryString;

        request.query(queryString, (err, recordset) => {
            if (err) {
                errorProtocol(err, req, res);
                console.error(err);
                return;
            }
            res.json({ id: id, interventionType: interventionType, vCHE: vCHE });
        });
    } catch (err) {
        errorProtocol(err, req, res);
        console.error(err);
    }
})

app.post('/SendError', (req, res) => {
    errorProtocol(req.body.error, req, res);
    res.send("Error recorded successfully");
})

app.post("/RetrieveConditions", (req, res) => {
    const searchValue = (Object.entries(req.body)[0][1]);

    // List all synonym columns to be selected
    const synonymColumns = Array.from({ length: 51 }, (_, i) => `synonym${i + 1}`).join(", ");

    // Construct the query to select the disease and all synonym columns
    let queryString = `
    SELECT TOP 300 diseases, ${synonymColumns} FROM Diseases
    WHERE ${columnNames.map(column => `${column} LIKE '%${searchValue}%'`).join(' OR ')}
    `;

    req.session.params.queryString = queryString;
    try {
        const request = new sql.Request();
        request.query(queryString, (err, recordset) => {
            if (err) {
                errorProtocol(err, req, res);
                console.error(err);
                return;
            }

            let conditions = recordset.recordset;

            // For each condition, find the synonym that is the closest match to the searchValue
            let results = conditions.map(condition => {
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

            // Limit the results to top 10 most similar items
            res.json(results.slice(0, 10));
        });
    } catch (err) {
        errorProtocol(err, req, res);
        console.error(err);
    }

});

// Root route that redirects to valid route
app.get('/', verifySessionAndCheckPreviousVisit, addVisitToDatabase, (req, res) => {
    const id = req.session?.params?.id;
    const interventionType = req.session?.params?.interventionType;
    const vCHE = req.session?.params?.vCHE;
    res.render('pages/index', { id: id, interventionType: interventionType, vCHE: vCHE })
});

app.get('/Discover', validateSession, async (req, res) => {
    console.log("Getting here!");
    const id = req.session?.params?.id || "Error in ID";
    const interventionType = req.session?.params?.interventionType || "Error in Intervention Type";
    const vCHE = req.session?.params?.vCHE || "Error in vCHE";
    const visitNum = req.session?.params?.visitNum || -1;
    const currentTimeInEST = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
    var discoverVisits = req.session?.params?.discoverVisits || [];
    discoverVisits.push({ timestamp: currentTimeInEST });
    req.session.params.discoverVisits = discoverVisits;
    const discoverVisitsJsonString = JSON.stringify(discoverVisits);
    try {
        const request = new sql.Request(); // No need to connect, just use the global pool

        let queryString = `
            UPDATE R24
            SET Discover = @discoverVisits
            WHERE ID = @id
            AND VisitNum = @visitNum
            AND InterventionType = @interventionType`;

        req.session.params.queryString = queryString;
        request.input("discoverVisits", sql.VarChar, discoverVisitsJsonString);
        request.input("id", sql.VarChar, id);
        request.input("visitNum", sql.Int, visitNum);
        request.input("interventionType", sql.VarChar, interventionType);
        await request.query(queryString); // Await to ensure it finishes before rendering
        res.render('pages/discover', { id, interventionType, vCHE });
    } catch (err) {
        console.error("SQL error:", err);
        errorProtocol(err, req, res);
    }
});



app.post('/storeParameters', (req, res) => {


    var background = false;
    var conditions = false;
    var groupings = false;
    var role = false;
    var preferences = false;
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
    try {
        const id = req.session?.params?.id;
        const interventionType = req.session?.params?.interventionType;
        const vCHE = req.session?.params?.vCHE;
        const visitNum = req.session?.params?.visitNum;

        if (!id || visitNum === undefined) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        const request = new sql.Request();
        const updates = [];
        if (background) {
            updates.push({
                query: `UPDATE R24 SET Age = @age, Gender = @gender, LocationState = @locationState, LocationCity = @locationCity 
                        WHERE ID = @id AND VisitNum = @visitNum AND InterventionType = @interventionType`,
                params: {
                    age: JSON.stringify(req.session.params.searches.Age),
                    gender: JSON.stringify(req.session.params.searches.Gender),
                    locationState: JSON.stringify(req.session.params.searches.LocationState),
                    locationCity: JSON.stringify(req.session.params.searches.LocationCity)
                }
            });
        }

        if (conditions) {
            updates.push({
                query: `UPDATE R24 SET Conditions = @conditions WHERE ID = @id AND VisitNum = @visitNum AND InterventionType = @interventionType`,
                params: { conditions: JSON.stringify(req.session.params.searches.Conditions) }
            });
        }

        if (groupings) {
            updates.push({
                query: `UPDATE R24 SET Groupings = @groupings WHERE ID = @id AND VisitNum = @visitNum AND InterventionType = @interventionType`,
                params: { groupings: JSON.stringify(req.session.params.searches.Groupings) }
            });
        }

        if (role) {
            updates.push({
                query: `UPDATE R24 SET Role = @role WHERE ID = @id AND VisitNum = @visitNum AND InterventionType = @interventionType`,
                params: { role: JSON.stringify(req.session.params.searches.Role) }
            });
        }

        if (preferences) {
            updates.push({
                query: `UPDATE R24 SET Preferences = @preferences WHERE ID = @id AND VisitNum = @visitNum AND InterventionType = @interventionType`,
                params: { preferences: JSON.stringify(req.session.params.searches.Preferences) }
            });
        }

        // Execute all queries sequentially
        for (const update of updates) {
            const queryRequest = new sql.Request();
            queryRequest.input("id", sql.VarChar, id);
            queryRequest.input("visitNum", sql.Int, visitNum);
            queryRequest.input("interventionType", sql.VarChar, interventionType);

            for (const [key, value] of Object.entries(update.params)) {
                queryRequest.input(key, sql.VarChar, value);
            }

            queryRequest.query(update.query)
                .then(() => { })  // This makes it explicitly wait
                .catch(err => console.error("Query error:", err));
        }

        res.json({ id, interventionType, vCHE, message: "Updates successful" });

    } catch (err) {
        console.error("SQL query error:", err);
        errorProtocol(err, req, res);
    }
    // console.log("SEARCH CRITERIA IS", req.session.params.searchCriteria)
})


function generateGuestId() {
    return `guest_${crypto.randomUUID().replace(/-/g, '').slice(0, 40)}`; // 40 chars + "guest_" = 48 chars max
}

function validateSession(req, res, next) {
    if (!req.session) {
        req.session = {};
    }

    // Ensure params object exists
    if (!req.session.params) {
        req.session.params = {};
    }
    next();
    return;
}


async function checkPreviousVisit(id, interventionType) {
    try {
        const sqlQuery = `
            SELECT MAX(VisitNum) AS VisitNum
            FROM R24
            WHERE ID = @id
            AND InterventionType = @interventionType`;

        const request = new sql.Request();
        request.input("id", sql.VarChar, id);
        request.input("interventionType", sql.VarChar, interventionType);

        const result = await request.query(sqlQuery);

        // If no records found, return 1; otherwise, return max VisitNum + 1

        let visitNum = result.recordset[0]?.VisitNum; // Get VisitNum (or undefined if no record)
        // console.log("Here with visitNum: ", visitNum);
        // Error check: If visitNum is null, undefined, or -1, start at 1
        if (visitNum == null || visitNum === -1) {
            visitNum = 1;
        } else {
            visitNum += 1; // Increment normally
        }
        return visitNum;

    } catch (err) {
        console.error("SQL query error:", err);
        throw err; // Rethrow the error for handling in the caller function
    }
}


async function verifySessionAndCheckPreviousVisit(req, res, next) {
    const urlId = req.params.id || null;
    const urlInterventionType = req.params.interventionType || null;
    const sessionIdExists = req.session?.params?.id != null;
    const oldSessionId = req.session?.params?.id || null;
    const oldInterventionType = req.session?.params?.interventionType || null;
    const urlvCHE = req.params.vCHE || null;
    const oldvCHE = req.session?.params?.vCHE || null;


    // Checking for AWS Health Checks
    if (urlId && urlId == "AWS-Health-Check") {
        next();
        return;
    }
    if (oldSessionId && oldSessionId == urlId) {
        const newInterventionType = urlInterventionType || "vh";
        const newvCHE = urlvCHE || oldvCHE || "bf";
        // Example: Text -> VH or VH -> Text
        if (oldInterventionType != newInterventionType) {
            req.session.params.interventionType = newInterventionType;
            req.session.params.vCHE = newInterventionType == "text" ? "text" : newvCHE;
            var selectedvCHEs = req.session?.params?.selectedvCHEs || [];
            selectedvCHEs.push({ vCHE: newvCHE })
            req.session.params.selectedvCHEs = selectedvCHEs;
            req.session.params.visitNum = await checkPreviousVisit(oldSessionId, newInterventionType);
            req.session.params.persistVisit = false;
            next();
            return;
        }
        if (oldvCHE != newvCHE) {
            req.session.params.vCHE = newInterventionType == "text" ? "text" : newvCHE;
            var selectedvCHEs = req.session?.params?.selectedvCHEs || [];
            selectedvCHEs.push({ vCHE: newvCHE })
            const selectedvCHEsString = JSON.stringify(selectedvCHEs);
            console.log(`Switched vCHEs, but same user: ${selectedvCHEsString}`);
            req.session.params.selectedvCHEs = selectedvCHEs;
            const visitNum = req.session?.params?.visitNum || -1;
            const id = req.session?.params?.id || "Error in ID";
            const interventionType = req.session?.params?.interventionType || "Error in Intervention Type";
            await updatevCHE(selectedvCHEsString, id, visitNum, interventionType);
        }

        req.session.params.persistVisit = true;
        next();
        return;
    } else if (oldSessionId && urlId == null) {
        const newInterventionType = oldInterventionType || "vh";
        const newvCHE = oldvCHE || "bf";
        if (oldInterventionType != newInterventionType) {
            req.session.params.interventionType = newInterventionType;
            req.session.params.vCHE = newInterventionType == "text" ? "text" : newvCHE;
            var selectedvCHEs = req.session?.params?.selectedvCHEs || [];
            selectedvCHEs.push({ vCHE: req.session.params.vCHE })
            req.session.params.selectedvCHEs = selectedvCHEs;
            req.session.params.visitNum = await checkPreviousVisit(oldSessionId, newInterventionType);
            req.session.params.persistVisit = false;
            next();
            return;
        }
        if (oldvCHE != newvCHE) {
            req.session.params.vCHE = newInterventionType == "text" ? "text" : newvCHE;
            var selectedvCHEs = req.session?.params?.selectedvCHEs || [];
            selectedvCHEs.push({ vCHE: newvCHE })
            req.session.params.selectedvCHEs = selectedvCHEs;
            const selectedvCHEsString = JSON.stringify(selectedvCHEs);
            console.log(`Switched vCHEs, but same user: ${selectedvCHEsString}`);
            const visitNum = req.session?.params?.visitNum || -1;
            const id = req.session?.params?.id || "Error in ID";
            const interventionType = req.session?.params?.interventionType || "Error in Intervention Type";
            await updatevCHE(selectedvCHEsString, id, visitNum, interventionType);
        }
        req.session.params.persistVisit = true;
        next();
        return;
    } else {
        const newSessionId = urlId || generateGuestId();
        const newInterventionType = urlInterventionType || "vh";
        const newvCHE = urlvCHE || oldvCHE || "bf";

        // Case 3.1
        if (!sessionIdExists) {
            req.session = req.session || {};
            req.session.params = { id: newSessionId, interventionType: newInterventionType, vCHE: newInterventionType == "text" ? "text" : newvCHE };
            var selectedvCHEs = req.session?.params?.selectedvCHEs || [];
            selectedvCHEs.push({ vCHE: req.session.params.vCHE })
            req.session.params.selectedvCHEs = selectedvCHEs;
            if (newSessionId.includes("guest_")) {
                req.session.params.visitNum = 1;
                next();
                return;
            }

            try {
                req.session.params.visitNum = await checkPreviousVisit(newSessionId, newInterventionType);
                next();
            } catch (error) {
                console.error("Error fetching visitNum:", error);
                next(error);
            }
            return;
        }

        // Case 3.2
        if (sessionIdExists) {
            req.session.regenerate(async (err) => {
                if (err) {
                    console.error("Error regenerating session:", err);
                    return next(err);
                }
                req.session.params = { id: newSessionId, interventionType: newInterventionType, vCHE: newInterventionType == "text" ? "text" : newvCHE };
                var selectedvCHEs = req.session?.params?.selectedvCHEs || [];
                selectedvCHEs.push({ vCHE: req.session.params.vCHE })
                req.session.params.selectedvCHEs = selectedvCHEs;
                try {
                    req.session.params.visitNum = await checkPreviousVisit(newSessionId, newInterventionType);
                    next();
                } catch (error) {
                    console.error("Error fetching visitNum:", error);
                    next(error);
                }
            });
        }
    }
}

async function updatevCHE(selectedvCHEs, id, visitNum, interventionType) {
    try {
        const sqlQuery = `
            UPDATE R24
            SET vCHE = @selectedvCHEs
            WHERE ID = @id
            AND VisitNum = @visitNum
            AND InterventionType = @interventionType`;

        // ✅ Bind parameters properly
        const request = new sql.Request();
        request.input("selectedvCHEs", sql.VarChar, selectedvCHEs); // Correctly formatted EST datetime
        request.input("id", sql.VarChar, id);
        request.input("visitNum", sql.Int, visitNum);
        request.input("interventionType", sql.VarChar, interventionType);

        await request.query(sqlQuery); // Await to ensure it finishes before rendering
        return;
    } catch (err) {
        console.error("SQL query error:", err);
        throw err; // Rethrow the error for handling in the caller function
    }
}



function addVisitToDatabase(req, res, next) {
    // Checking for AWS Health Checks
    const urlId = req.params.id || null;
    if (urlId && urlId == "AWS-Health-Check") {
        next();
        return;
    }
    const persistVisit = req.session?.params?.persistVisit;
    if (persistVisit) {
        console.log(`Did not add visit to database. User is on same device with "same" id and parameters: ${req.session.params.id}, ${req.session.params.interventionType}, ${req.session.params.vCHE}, ${req.session.params.visitNum}`);
        next();
        return;
    } else {
        const id = req.session?.params?.id || "Error in ID";
        const interventionType = req.session?.params?.interventionType || "Error in Type";
        const visitNum = req.session?.params?.visitNum || -1;
        const vCHE = req.session?.params?.vCHE || "Error in vCHE";
        const selectedvCHEs = req.session?.params?.selectedvCHEs || [];
        const selectedvCHEsString = JSON.stringify(selectedvCHEs);

        console.log(`Adding visit to database. User is on device with "new" id and parameters: ${req.session.params.id}, ${req.session.params.interventionType}, ${req.session.params.vCHE}, ${req.session.params.visitNum}`);

        try {
            const request = new sql.Request();
            let queryString = `
                INSERT INTO R24 (ID, VisitNum, InterventionType, vCHE)
                VALUES (@id, @visitNum, @interventionType, @vCHE)`;

            request.input('id', sql.VarChar(50), id);
            request.input('visitNum', sql.Int, visitNum);
            request.input('interventionType', sql.VarChar(50), interventionType);
            request.input('vCHE', sql.VarChar, selectedvCHEsString);

            request.query(queryString, (err, recordset) => {
                if (err) {
                    errorProtocol(err, req, res);
                    console.error('SQL query error:', err);
                    next(err);
                    return;
                }
                next();
            });
        } catch (err) {
            errorProtocol(err, req, res);
            console.error('Unexpected error:', err);
            next(err);
        }


    }
}

app.post('/RetrieveCities', (req, res) => {
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
    try {
        const request = new sql.Request();
        request.query(queryString, (err, recordset) => {
            if (err) {
                errorProtocol(err, req, res);
                console.error(err);
                return;
            }
            res.json(recordset.recordset);
        });
    } catch (err) {
        errorProtocol(err, req, res);
        console.error(err);
    }
});

// Virtual Human Types
const EducationalComponentRouter = require('./routes/EducationalComponent');
app.use('/EducationalComponent', function (req, res, next) {
    req.id = req.session?.params?.id;
    req.vCHE = req.session?.params?.vCHE;
    req.interventionType = req.session?.params?.interventionType;
    req.visitNum = req.session?.params?.visitNum;
    next();
}, EducationalComponentRouter)


// Text Types
const EducationalComponentTextRouter = require('./routes/EducationalComponentText')
app.use('/EducationalComponentText', function (req, res, next) {
    req.id = req.session?.params?.id;
    req.vCHE = req.session?.params?.vCHE;
    req.interventionType = req.session?.params?.interventionType;
    req.visitNum = req.session?.params?.visitNum;
    next();
}, EducationalComponentTextRouter)

// Clinical Trials/study search router
const { json } = require('body-parser');
app.use('/StudySearch', function (req, res, next) {
    req.id = req.session?.params?.id;
    req.vCHE = req.session?.params?.vCHE;
    req.interventionType = req.session?.params?.interventionType;
    req.visitNum = req.session?.params?.visitNum;
    next();
}, StudySearchRouter)

// ID is userID from qualtrics, interventionType is vh or text from Qualtrics
app.get('/:id/:interventionType/:vCHE', verifySessionAndCheckPreviousVisit, addVisitToDatabase, (req, res) => {
    const id = req.session?.params?.id;
    const interventionType = req.session?.params?.interventionType || "vh";
    const vCHE = req.session?.params?.vCHE || "bf";
    // console.log("INTERVENTION TYPE IS", interventionType)

    if (interventionType === "text") {
        res.render('pages/indexText', { id: id, interventionType: interventionType, vCHE: vCHE })
    }
    else {
        res.render('pages/index', { id: id, interventionType: interventionType, vCHE: vCHE })
    }
})


process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Decide whether to keep the process alive or shut it down
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Optionally handle cleanup or decide to shut down gracefully
});



app.listen(process.env.PORT || 3000);
module.exports = sql; // Export SQL instance to reuse across your app
