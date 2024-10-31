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
const COMPLETIONS_MODEL = process.env.COMPLETIONS_MODEL;
const SUMMARY_PROMPT = process.env.SUMMARY_PROMPT;
const TITLE_PROMPT = process.env.TITLE_PROMPT;
const MAX_TOKENS = 300
const MAX_TITLE_TOKENS = 50
const TEMPERATURE = 0;
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
    "ContactEMail": "mgraveley@ufl.edu",
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
  var id = req.session.params.id;
  var vh = req.session.params.vCHE;
  var interventionType = req.session.params.interventionType;
  res.render("pages/StudySearch/role", { id: id, vh: vh, interventionType: interventionType })
})

router.get('/Background', (req, res) => {
  var id = req.session.params.id;
  var vh = req.session.params.vCHE;
  var interventionType = req.session.params.interventionType;
  res.render("pages/StudySearch/background", { id: id, vh: vh, interventionType: interventionType })
})

router.get('/Preferences', (req, res) => {
  var id = req.session.params.id;
  var vh = req.session.params.vCHE;
  var interventionType = req.session.params.interventionType;
  res.render("pages/StudySearch/preferences", { id: id, vh: vh, interventionType: interventionType })
})

router.get('/Diagnosis', (req, res) => {
  var id = req.session.params.id;
  var vh = req.session.params.vCHE;
  var interventionType = req.session.params.interventionType;
  res.render("pages/StudySearch/diagnosis", { id: id, vh: vh, interventionType: interventionType })
})

router.get('/Groupings', (req, res) => {
  var id = req.session.params.id;
  var vh = req.session.params.vCHE;
  var interventionType = req.session.params.interventionType;
  res.render("pages/StudySearch/groupings", { id: id, vh: vh, interventionType: interventionType })
})

router.get('/Browse', (req, res) => {
  var id = req.session.params.id;
  var vh = req.session.params.vCHE;
  var interventionType = req.session.params.interventionType;
  res.render("pages/StudySearch/browse", { id: id, vh: vh, interventionType: interventionType })
})

router.get('/GeneratingResults', (req, res) => {
  var id = req.session.params.id;
  var vh = req.session.params.vCHE;
  var interventionType = req.session.params.interventionType;
  var vhType = req.session.params.vhType;
  res.render("pages/StudySearch/generatingResults", { id: id, vh: vh, vhType: vhType, interventionType: interventionType })
})

router.get('/Registries', (req, res) => {
  var id = req.session.params.id;
  var vh = req.session.params.vCHE;
  var interventionType = req.session.params.interventionType;
  res.render("pages/StudySearch/registries", { id: id, vh: vh, interventionType: interventionType })
})

router.post('/Results', async (req, res) => {
  try {
    var body = {
      ...req.session.params.searchCriteria, // Spread the searchCriteria properties
      id: req.session.params.id,                  // Add the id field
      visitNum: req.session.params.visitNum    // Add the visitNum field
    };

    const response = await axios.post(studySearchRequestURL, body);
    const results = response.data;
    req.session.trialsList = results.trialsList;
    req.session.numTrials = results.numTrials;
    logResults(req);
    res.json({ numTrials: results.numTrials });
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(502).json({ message: "Bad Gateway. Could not fetch results." });
  }
});



router.get('/Results', (req, res) => {
  var id = req.session.params.id;
  var vh = req.session.params.vCHE;
  var interventionType = req.session.params.interventionType;
  var role = req.session.params.searchCriteria.Role;

  var trialsList = req.session.trialsList;
  res.render("pages/StudySearch/results", { id: id, vh: vh, interventionType: interventionType, role: role, trialsList: trialsList, sponsoredList: sponsoredList })
})

router.post('/SendEmailPatient', logStudyContact, async (req, res) => {
  // Uncomment when we're done with F&F
  // const response = await axios.post(emailPatientURL, req);
  console.log(req.body);
  
  const response = await axios.post(emailFriendsAndFamilyURL, req.body);
  console.log(response.data);
  res.send(response.data);
});

router.post('/SendEmailCaregiver', logStudyContact, async (req, res) => {
  // Uncomment when we're done with F&F
  // const response = await axios.post(emailCaregiverURL, req);
  console.log(req.body);
  const response = await axios.post(emailFriendsAndFamilyURL, req.body);
  console.log(response.data);
  res.send(response.data);
});

function logStudyContact(req, res, next) {
  if (!req.session.params.contactedStudies) {
    req.session.params.contactedStudies = [];
  }
  let studyObject = {
    NCTId: req.body.nctId,
    studyContact: req.body.studyContact
  }
  req.session.params.contactedStudies.push(studyObject);

  try {
    sql.connect(config, function (err) {
      if (err) {
        errorProtocol(err, req, res);
        console.error('SQL connection error:', err);
        next(err);
        return;
      }

      var id = req.session.params.id;
      var visitNum = req.session.params.visitNum;
      var contactedStudies = JSON.stringify(req.session.params.contactedStudies);

      const request = new sql.Request();
      let queryString = `
      UPDATE R24U01 SET ContactedStudies = @contactedStudies
      WHERE ID = @id AND VisitNum = @visitNum`
      req.session.params.queryString = queryString;

      // Add input parameters
      request.input('id', sql.VarChar(50), id);
      request.input('visitNum', sql.Int, visitNum);
      request.input('contactedStudies', sql.VarChar(sql.MAX), contactedStudies);

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
  } catch (err) {
    errorProtocol(err, req, res);
    next(err);
    return;
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


async function logResults(req) {
  if (!req.session.params.searches.Results) {
    req.session.params.searches.Results = [];
  }
  var trialsList = req.session.trialsList;
  var results = [];
  results.push({
    "Criteria": `${JSON.stringify(req.session.params.searchCriteria)}`,
    "NumberOfResults": `${req.session.numTrials}`
  })
  for (var trial of trialsList) {
    var nctId = trial.NCTId;
    var url = 'https://clinicaltrials.gov/study/' + trial.NCTId;
    results.push({
      "NCTId": nctId,
      "URL": url
    });
  }
  req.session.params.searches.Results.push(results);

  sql.connect(config, function (err) {
    if (err) {
      errorProtocol(err, req, res);
      console.log(err);
    }

    // create Request object
    var request = new sql.Request();

    let queryString = `
    UPDATE R24
    SET StudyResults = @results
    WHERE ID = @id
    AND VisitNum = @visitNum`

    req.session.params.queryString = queryString;

    request.input('results', sql.VarChar, JSON.stringify(req.session.params.searches.Results));
    request.input('id', sql.VarChar, req.session.params.id);
    request.input('visitNum', sql.Int, req.session.params.visitNum);

    request.query(queryString, function (err, recordset) {
      if (err) {
        errorProtocol(err, req, res);
        console.log(err);
      }
    });
  });
}



module.exports = {
  StudySearchRouter: router,
  errorProtocol,
}