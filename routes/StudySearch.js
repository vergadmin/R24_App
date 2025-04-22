const express = require('express')
const session = require('express-session');
const AWS = require('aws-sdk');
const router = express.Router()
var sql = require("mssql");
var axios = require("axios")
const OpenAI = require('openai');
const { json } = require('body-parser');
const geolib = require('geolib');
require('dotenv').config()

// <--- openai constants
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // This is the default and can be omitted
});


// SUMMARY_PROMPT, MAX_TOKENS, & TEMPERATURE can be modified as needed.
// TODO: Move Summary Prompts into .env -- don't want any chance for user's to see prompt.
const studySearchRequestURL = "http://studysearch.us-east-1.elasticbeanstalk.com/Patient/Results";
const emailPatientURL = "http://studysearch.us-east-1.elasticbeanstalk.com/PatientEmail/SendEmailPatient";
const emailCaregiverURL = "http://studysearch.us-east-1.elasticbeanstalk.com/PatientEmail/SendEmailCaregiver";
const emailFriendsAndFamilyURL = "http://studysearch.us-east-1.elasticbeanstalk.com/PatientEmail/SendEmailFFLaunch";
// const studySearchRequestURL = "http://localhost:3000/Patient/Results";
// const emailFriendsAndFamilyURL = "http://localhost:3000/PatientEmail/SendEmailFFLaunch";

// open ai constants --->


AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const ses = new AWS.SES({ apiVersion: '2010-12-01' });
const maxInt = Number.MAX_SAFE_INTEGER;

const sponsoredList = [
  {
    "Title": "Cancer Prevention Research Study",
    "Categories": ["Healthy Living"],
    "Summary": "Adults between 45 -- 73 years old may be eligible to participate in in a University of Florida study to test messages about nutrition risk factors and colorectal cancer prevention in a one-time, web-based, interaction with a virtual health assistant.",
    "ContactName": "Dr. Melissa Vilaro",
    "ContactEmail": "mgraveley@ufl.edu",
    "Info": "https://research-studies-with-alex.s3.amazonaws.com/SponsoredStudies/STAMPEDNutrition_Module_CRC_Flyer_12.5.19.pdf",
    "Link": "https://research-studies-with-alex.s3.amazonaws.com/SponsoredStudies/STAMPEDNutrition_Module_CRC_Flyer_12.5.19.pdf"
  }
]

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

router.use(session({
  secret: process.env.SESSION_KEY,
  resave: false,
  saveUninitialized: true,
  rolling: true,
  cookie: {
    maxAge: 1000 * 60 * 15
  }
}));

router.get('/Role', (req, res) => {
  const id = req.session?.params?.id;
  const vCHE = req.session?.params?.vCHE;
  const interventionType = req.session?.params?.interventionType;
  res.render("pages/StudySearch/role", { id: id, interventionType: interventionType, vCHE: vCHE })
})

router.get('/Background', (req, res) => {
  const id = req.session?.params?.id;
  const vCHE = req.session?.params?.vCHE;
  const interventionType = req.session?.params?.interventionType;
  res.render("pages/StudySearch/background", { id: id, interventionType: interventionType, vCHE: vCHE })
})

router.get('/Preferences', (req, res) => {
  const id = req.session?.params?.id;
  const vCHE = req.session?.params?.vCHE;
  const interventionType = req.session?.params?.interventionType;
  res.render("pages/StudySearch/preferences", { id: id, interventionType: interventionType, vCHE: vCHE })
})

router.get('/Diagnosis', (req, res) => {
  const id = req.session?.params?.id;
  const vCHE = req.session?.params?.vCHE;
  const interventionType = req.session?.params?.interventionType;
  res.render("pages/StudySearch/diagnosis", { id: id, interventionType: interventionType, vCHE: vCHE })
})

router.get('/Groupings', (req, res) => {
  const id = req.session?.params?.id;
  const vCHE = req.session?.params?.vCHE;
  const interventionType = req.session?.params?.interventionType;
  res.render("pages/StudySearch/groupings", { id: id, interventionType: interventionType, vCHE: vCHE })
})

router.get('/Browse', (req, res) => {
  const id = req.session?.params?.id;
  const vCHE = req.session?.params?.vCHE;
  const interventionType = req.session?.params?.interventionType;
  res.render("pages/StudySearch/browse", { id: id, interventionType: interventionType, vCHE: vCHE })
})

router.get('/GeneratingResults', validateSession, updateGeneratingResults, (req, res) => {
  const id = req.session?.params?.id;
  const vCHE = req.session?.params?.vCHE;
  const interventionType = req.session?.params?.interventionType;
  const language = req.session?.params?.language;

  res.render("pages/StudySearch/generatingResults", { id: id, interventionType: interventionType, vCHE: vCHE, language: language })
})

router.get('/Registries', (req, res) => {
  const id = req.session?.params?.id;
  const vCHE = req.session?.params?.vCHE;
  const interventionType = req.session?.params?.interventionType;
  res.render("pages/StudySearch/registries", { id: id, interventionType: interventionType, vCHE: vCHE })
})

router.post('/Results', async (req, res) => {
  try {
    // console.log("BODY FOR POSTING RESULTS IS", req.session.params.searchCriteria)
    var body = {
      ...req.session.params.searchCriteria, // Spread the searchCriteria properties
      id: req.session.params.id,                  // Add the id field
      visitNum: req.session.params.visitNum    // Add the visitNum field
    };

    const response = await axios.post(studySearchRequestURL, body);
    const results = response.data;
    req.session.trialsList = results.trialsList;
    req.session.numTrials = results.numTrials;
    res.json({ numTrials: results.numTrials });
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(502).json({ message: "Bad Gateway. Could not fetch results." });
  }
});



router.get('/Results', logResults, (req, res) => {
  const id = req.session?.params?.id;
  const vCHE = req.session?.params?.vCHE;
  const interventionType = req.session?.params?.interventionType;
  const role = req.session?.params?.searchCriteria?.Role;
  const trialsList = req.session.trialsList;
  // YES, IT IS role.ROLE I don't know why! But I will figure it out when I am smarter (2/5/25 Chris) -- 
  res.render("pages/StudySearch/results", { id: id, interventionType: interventionType, role: role.Role, trialsList: trialsList, sponsoredList: sponsoredList, vCHE: vCHE })
})

router.post('/SendEmailPatient', logStudyContact, async (req, res) => {
  // Uncomment when we're done with F&F
  // const response = await axios.post(emailPatientURL, req);
  const response = await axios.post(emailPatientURL, req.body);
  console.log(response.data);
  res.send(response.data);
});

router.post('/SendEmailCaregiver', logStudyContact, async (req, res) => {
  // Uncomment when we're done with F&F
  // const response = await axios.post(emailCaregiverURL, req);
  console.log(req.body);
  const response = await axios.post(emailCaregiverURL, req.body);
  console.log(response.data);
  res.send(response.data);
});

function validateSession(req, res, next) {
  if (!req.session) {
    req.session = {};
  }
  if (!req.session.params) {
    req.session.params = {};
  }
  if (!req.session.params.generatingResults) {
    req.session.params.generatingResults = [];
  }
  next();
  return;
}

async function updateGeneratingResults(req, res, next) {
  const vCHE = req.session?.params?.vCHE || "Error in vCHE"
  var generatingResults = req.session?.params?.generatingResults || [];
  const currentTimeInEST = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  const videoObject = { timestamp: currentTimeInEST, vCHE: vCHE };
  generatingResults.push(videoObject);
  req.session.params.videosWatched = generatingResults;
  const generatingResultsString = JSON.stringify(generatingResults);
  const id = req.session?.params?.id || "Error in ID";
  const interventionType = req.session?.params?.interventionType || "Error in Intervention Type";
  const visitNum = req.session?.params?.visitNum || -1;

  // BEGIN DATABSAE STUFF:SENDING VERSION (R24 OR U01) AND ID TO DATABASE

  try {
    const request = new sql.Request(); // No need to connect, just use the global pool
    let queryString = `
            UPDATE R24
            SET LoadingResultsPage = @generatingResults
            WHERE ID = @id
            AND VisitNum = @visitNum
            AND InterventionType = @interventionType`;

    req.session.params.queryString = queryString;
    request.input("generatingResults", sql.VarChar, generatingResultsString);
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

async function logStudyContact(req, res, next) {
  if (!req.session) {
    req.session = {};
  }
  if (!req.session.params) {
    req.session.params = {};
  }
  if (!req.session.params.contactedStudies) {
    req.session.params.contactedStudies = [];
  }
  const currentTimeInEST = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  const currentSearchId = req.session?.params?.searches?.currentSearchId || -1;
  const studyObject = {
    Role: req.session?.params?.searchCriteria?.Role || "Error in Role",
    NCTId: req.body.nctId || "Error in NCTId",
    studyContact: req.body.studyContact || "Error in studyContact",
    timestamp: currentTimeInEST,
    searchId: currentSearchId
  }
  var contactedStudies = req.session?.params?.contactedStudies || [];
  contactedStudies.push(studyObject);
  req.session.params.contactedStudies = contactedStudies;

  const emailsSent = contactedStudies.length;
  const contactedStudiesString = JSON.stringify(contactedStudies);
  const id = req.session?.params?.id || "Error in ID";
  const interventionType = req.session?.params?.interventionType || "Error in Intervention Type";
  const visitNum = req.session?.params?.visitNum || -1;

  try {
    const request = new sql.Request(); // No need to connect, just use the global pool
    let queryString = `
              UPDATE R24
              SET ContactedStudies = @contactedStudies, EmailsSentCount = @emailsSent
              WHERE ID = @id
              AND VisitNum = @visitNum
              AND InterventionType = @interventionType`

    req.session.params.queryString = queryString;
    request.input("contactedStudies", sql.VarChar, contactedStudiesString);
    request.input("emailsSent", sql.Int, emailsSent);
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

async function errorProtocol(error, req, res) {
  const email = "alexu01console@gmail.com";
  const id = req.session.params.id;
  const visitNum = req.session.params.visitNum;
  const now = new Date();

  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,  // Set to true for 12-hour time with AM/PM
    timeZoneName: 'short'  // Add time zone abbreviation (e.g., "PDT", "GMT")
  };

  const timeStamp = new Intl.DateTimeFormat('en-US', options).format(now);


  const queryString = req.session.params.queryString || 'Not a query string';
  const subject = `[User ${id}] Error at ${timeStamp}`;
  const message = `Error occurred at ${timeStamp} for [USER ID: ${id}] AND [VISIT NUMBER: ${visitNum}]. The error log can be found below. 

  ${queryString}

  ERROR
  ===============================================
  ${error.name}

  ${error.message}

  ${error}


  STACK TRACE
  ===============================================
  ${error.stack}`;

  const params = {
    Source: 'error@learn-research.org', // Must be verified in SES
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Subject: {
        Data: subject
      },
      Body: {
        Text: {
          Data: message
        }
      }
    }
  };

  try {
    const data = await ses.sendEmail(params).promise();
    req.session.params.queryString = null;
    console.log('Email sent:', data);
  } catch (err) {
    console.error('Failed to send email:', err);
  }
}


async function logResults(req, res, next) {
  if (!req.session) {
    req.session = {};
  }
  if (!req.session.params) {
    req.session.params = {};
  }
  if (!req.session.params.searches) {
    req.session.params.searches = {};
  }
  if (!req.session.params.searches.Results) {
    req.session.params.searches.Results = [];
  }
  if (!req.session.params.searches.searchId) {
    req.session.params.searches.searchId = 1;
  }
  if (!req.session.params.searches.currentSearchId) {
    req.session.params.searches.currentSearchId = 1;
  }

  const trialsList = req.session?.trialsList || [];
  const criteria = req.session?.params?.searchCriteria || {};
  const criteriaString = JSON.stringify(criteria);
  const numTrials = req.session?.numTrials ?? -1;
  const currentTimeInEST = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  const searchId = req.session?.params?.searches?.searchId || -1;
  if (searchId != -1) {
    req.session.params.searches.currentSearchId = req.session.params.searches.searchId;
    req.session.params.searches.searchId = req.session.params.searches.searchId + 1;
  }
  const currentSearchId = req.session?.params?.searches?.currentSearchId || -1;
  var results = [];
  // console.log("IN LOG RESULTS", req.session.params.searchCriteria)
  results.push({
    Criteria: criteriaString,
    NumberOfResults: numTrials,
    timestamp: currentTimeInEST,
    searchId: currentSearchId
  })
  for (var trial of trialsList) {
    var nctId = trial.NCTId;
    var url = 'https://clinicaltrials.gov/study/' + trial.NCTId;
    results.push({
      "NCTId": nctId,
      "URL": url
    });
  }
  var totalResults = req.session?.params?.searches?.Results || [];
  totalResults.push(results);
  req.session.params.searches.Results = totalResults;
  const resultsPageLength = totalResults.length;
  const totalResultsString = JSON.stringify(totalResults);
  const id = req.session?.params?.id || "Error in ID";
  const interventionType = req.session?.params?.interventionType || "Error in Intervention Type";
  const visitNum = req.session?.params?.visitNum || -1;

  try {
    const request = new sql.Request(); // No need to connect, just use the global pool
    let queryString = `
        UPDATE R24
        SET ResultsPageVisitedCount = @resultsPageLength, StudyResults = @totalResultsString
        WHERE ID = @id
        AND VisitNum = @visitNum
        AND InterventionType = @interventionType`
    req.session.params.queryString = queryString;
    request.input('resultsPageLength', sql.Int, resultsPageLength);
    request.input('totalResultsString', sql.VarChar, totalResultsString);
    request.input('id', sql.VarChar(50), id);
    request.input('visitNum', sql.Int, visitNum);
    request.input('interventionType', sql.VarChar(50), interventionType);

    await request.query(queryString); // Await to ensure it 
    next();
  } catch (err) {
    console.error("SQL error:", err);
    errorProtocol(err, req, res);
    next(err);
  }

}



module.exports = {
  StudySearchRouter: router,
  errorProtocol,
}