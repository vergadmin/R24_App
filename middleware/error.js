const AWS = require('aws-sdk');
require('dotenv').config()
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });
const ses = new AWS.SES({ apiVersion: '2010-12-01' });


const errorProtocol = async (error, req, res) => {
    const email = "alexu01console@gmail.com";
    const id = req.session.params.id;
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
    const subject = `[U01Provider] [User ${id}] Error at ${timeStamp}`;
    const message = `Error occurred at ${timeStamp} for [USER ID: ${id}]. The error log can be found below. 
  
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
  
  
  module.exports = {
    errorProtocol
  }