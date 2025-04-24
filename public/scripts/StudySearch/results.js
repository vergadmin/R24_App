function download() {
  sendToDatabase(`DownloadGuide`, `clicked`)
  window.open(`https://vpf2content.s3.amazonaws.com/Uploads/Videos/R24/pdfs/questions.pdf`, '_blank');
}

// Get the email modal
var emailModal = document.getElementById("emailModal");


// Get the <span> element that closes the email modal
var emailCloseBtn = document.getElementsByClassName("close")[0];

var sentEmailCloseBtn = document.getElementById("close-btn")

var openModalEmail;
var openModalTitle;
var openModalNctId;
var openModalMessage;

var htmlText;
const alexInfoText = `NOTE TO STUDY COORDINATOR:
  You are receiving this email from The ALEX Research Referral Portal. The ALEX (Agents Leveraging Empathy for Exams) Portal was developed through the support of the R24AG074867 grant from the National Institute on Aging, part of the National Institute of Health. The ALEX portal is a web-based tool for patients, caregivers, and healthcare professionals to increase referral of patients to clinical trials. ALEX helps a user learn about and search for potential study opportunities based on their sex, age, location, and health condition(s). It translates complex study information that can be a barrier for many patients and their caregivers to a 6th grade reading level, and pre-generates this email to contact you. Please follow up with the individual listed above about the study for which you are the contact. If you have questions about why you are receiving this email, or to learn more about the ALEX portal, please reach out to the ALEX Research team at ETCH@mayo.edu`

const htmlAlexInfoText = `
  <hr>
  <p>NOTE TO STUDY COORDINATOR:</p>
  <p>
    You are receiving this email from The ALEX Research Referral Portal. The ALEX (Agents Leveraging Empathy for Exams) Portal was developed through the support of the R24AG074867 grant from the National Institute on Aging, part of the National Institute of Health. The ALEX portal is a web-based tool for patients, caregivers, and healthcare professionals to increase referral of patients to clinical trials. ALEX helps a user learn about and search for potential study opportunities based on their sex, age, location, and health condition(s).  It translates complex study information that can be a barrier for many patients and their caregivers to a 6th grade reading level, and pre-generates this email to contact you. <strong><u>Please follow up with the individual listed above about the study for which you are the contact</u></strong>. If you have questions about why you are receiving this email, or to learn more about the ALEX portal, please reach out to the ALEX Research team at <a href="mailto:ETCH@mayo.edu">ETCH@mayo.edu</a>.
  </p>
`;
// When the user clicks the button, open the email modal 
// When the user clicks the button, open the email modal 
function openEmailModal(role, contactName, contactEmail, studyTitle, briefSummary, nctID) {
  console.log("here!")
  openModalEmail = contactEmail;
  openModalTitle = studyTitle;
  openModalNctId = nctID;
  emailModal.style.display = "flex";
  var text;
  const { message, html } = generateEmailTemplate(role, studyTitle, nctID, briefSummary);
  htmlText = html;
  text = message;
  text = text + '\n\n' + alexInfoText
  document.getElementById("message").value = text;
  openModalMessage = text;

  if (contactName && contactEmail !== null) {
    document.getElementById("coordinator-contact").innerHTML = contactName + ": " + contactEmail + " "
  } else {
    document.getElementById("coordinator-contact").style.display = none;
  }
}

// When the user clicks on <span> (x), close the email modal
emailCloseBtn.onclick = function () {
  emailModal.style.display = "none";
}

// When the user clicks on <span> (x), close the email modal
sentEmailCloseBtn.onclick = function () {
  document.getElementById("email-form").style.display = ''
  document.getElementById("close").style.display = ''
  document.getElementById("email-sending-loading").style.display = 'none'
  emailModal.style.display = "none";
}

// When the user clicks anywhere outside of the email modal, close it
window.onclick = function (event) {
  if (event.target == emailModal) {
    emailModal.style.display = "none";
  }
}

async function emailPatient() {
  var patientName, patientEmail, caregiverName, caregiverEmail;
  document.getElementById("email-form").style.display = 'none'
  document.getElementById("close").style.display = 'none'
  document.getElementById("email-sending-loading").style.display = 'flex'
  if (document.getElementById("patientName")) {
    patientName = document.getElementById("patientName").value;
  }
  if (document.getElementById("patientEmail")) {
    patientEmail = document.getElementById("patientEmail").value;
  }

  let title = openModalTitle <= 25 ? openModalTitle : openModalTitle.substring(0, 25) + "...";
  const htmlMessage = htmlText
    .replace("[Patient Name]", patientName || "[Patient Name]")
    .replace("[Patient Email]", patientEmail || "[Patient Email]");
  const subject = `[ACTION NEEDED] Requesting Study Info: ${title}`

  let url = `/StudySearch/SendEmailPatient`;
  let data = {
    subject: subject,
    message: openModalMessage,
    htmlMessage: htmlMessage,
    htmlCoordinator: htmlAlexInfoText,
    studyContact: openModalEmail,
    patientEmail: patientEmail,
    nctId: openModalNctId
  }
  console.log(data);
  let res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  console.log("HERE!")
  console.log(res)

  if (res.ok) {
    let ret = await res.json();
    console.log(ret);
    document.getElementById("email-status").innerText = "🎉 Success!"
    document.getElementById("status-message").innerText = "Your email has been successfully sent to the research coordinator. Please click the button below to continue browsing other trials."
  } else {
    document.getElementById("email-status").innerText = "😕 Hmm, something went wrong..."
    document.getElementById("status-message").innerText = "There was an error sending your email."
  }

}



function showMore(button, moreCount) {
  var moreItems = button.nextElementSibling;
  if (moreItems.style.display === "none") {
    moreItems.style.display = "block";
    button.textContent = "Show Less Conditions";
  } else {
    moreItems.style.display = "none";
    button.textContent = `...More (${moreCount})`;
  }
}

function openSurvey() {
  let id = sessionStorage.getItem("id") || "tempId";
  const url = `https://ufl.qualtrics.com/jfe/form/SV_1B4qIsmRrAJirl4?ID=${id}`;
  window.open(url, '_blank');
}

async function emailCaregiver() {
  var patientName, patientEmail, caregiverName, caregiverEmail;
  document.getElementById("email-form").style.display = 'none'
  document.getElementById("close").style.display = 'none'
  document.getElementById("email-sending-loading").style.display = 'flex'
  if (document.getElementById("patientName")) {
    patientName = document.getElementById("patientName").value;
  }
  if (document.getElementById("patientEmail")) {
    patientEmail = document.getElementById("patientEmail").value;
  }

  if (document.getElementById("caregiverName")) {
    caregiverName = document.getElementById("caregiverName").value;
  }
  if (document.getElementById("caregiverEmail")) {
    caregiverEmail = document.getElementById("caregiverEmail").value;
  }

  const htmlMessage = htmlText
  .replace("[Patient Name]", patientName || "[Patient Name]")
  .replace("[Patient Email]", patientEmail || "[Patient Email]")
  .replace("[Caregiver Name]", caregiverName || "[Caregiver Name]")
  .replace("[Caregiver Email]", caregiverEmail || "[Caregiver Email]")

  let title = openModalTitle <= 25 ? openModalTitle : openModalTitle.substring(0, 25) + "...";

  const subject = `[ACTION NEEDED] Requesting Study Info: ${title}`

  let url = `/StudySearch/SendEmailCaregiver`;

  let data = {
    subject: subject,
    message: openModalMessage,
    studyContact: openModalEmail,
    htmlMessage: htmlMessage,
    htmlCoordinator: htmlAlexInfoText,
    patientEmail: patientEmail,
    caregiverEmail: caregiverEmail,
    nctId: openModalNctId
  }
  console.log(data);

  let res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (res.ok) {
    let ret = await res.json();
    console.log(ret);
    document.getElementById("email-status").innerText = "🎉 Success!"
    document.getElementById("status-message").innerText = "Your email has been successfully sent to the research coordinator. Please click the button below to continue browsing other trials."
  } else {
    document.getElementById("email-status").innerText = "😕 Hmm, something went wrong..."
    document.getElementById("status-message").innerText = "There was an error sending your email."
  }

}


function generateEmailTemplate(role, studyTitle, nctID, briefSummary) {
  let message;
  let html; 
  if (role === "Patient") {
    message = `Hello,
  
    I saw the following research study on the ALEX website. I am interested in participating and would like more information about the study and how to enroll.
  
    Title: ${studyTitle}
    NCT ID: ${nctID}
    Link To Study: https://clinicaltrials.gov/study/${nctID}
  
    Please follow up with me to discuss the study, using the following information:
    
    AI-Summarized Description I Read from ALEX:
    ${briefSummary}
    
    Please follow up with me to discuss the study, using the following information:
  
    Name: [Patient Name]
    Email: [Patient Email]
    
    Thank you, and I look forward to hearing from you!`;


    html = `
    <p>Hello,</p>

    <p>
      I saw the following research study on the ALEX website. I am interested in participating and would like more information about the study and how to enroll.
    </p>

    <p>
      Title: ${studyTitle}<br>
      NCT ID: ${nctID}<br>
     Link To Study: <a href="https://clinicaltrials.gov/study/${nctID}">https://clinicaltrials.gov/study/${nctID}</a>
    </p>

    <p>
      AI-Summarized Description I Read from ALEX:<br>
      ${briefSummary}
    </p>

    <p>
      <strong><u>Please follow up with me to discuss the study, using the following information</u></strong>:
    </p>

    <p>
      Name: [Patient Name]<br>
      Email: [Patient Email]
    </p>

    <p>Thank you, and I look forward to hearing from you!</p>
`;

  }

  else {
    message = `Hello,
  
    I saw the following research study on the ALEX website. I am the caregiver of someone who is interested in participating and would like more information about the study and how to enroll them.
    
    Title: ${studyTitle}
    NCT ID: ${nctID}
    Link To Study: https://clinicaltrials.gov/study/${nctID}
    
    AI-Summarized Description I Read from ALEX: ${briefSummary}
    
    Please follow up with us to discuss the study, using the following information: 
  
    Patient Name: [Patient Name]
    Patient Email: [Patient Email]
  
    Caregiver Name: [Caregiver Name]
    Caregiver Email: [Caregiver Email]
  
    Thank you, and we look forward to hearing from you!`;

    html = `
    <p>Hello,</p>
  
    <p>
      I saw the following research study on the ALEX website. I am the caregiver of someone who is interested in participating and would like more information about the study and how to enroll them.
    </p>
  
    <p>
      Title: ${studyTitle}<br>
      NCT ID: ${nctID}<br>
     Link To Study: <a href="https://clinicaltrials.gov/study/${nctID}">https://clinicaltrials.gov/study/${nctID}</a>
    </p>
  
    <p>
      AI-Summarized Description I Read from ALEX:<br>
      ${briefSummary}
    </p>
  
    <p>
      <strong><u>Please follow up with me to discuss the study, using the following information</u></strong>:
    </p>
  
    <p>
      Patient Name: [Patient Name]<br>
      Patient Email: [Patient Email]<br>
      Caregiver Name: [Caregiver Name]<br>
      Caregiver Email: [Caregiver Email]
    </p>
  
    <p>Thank you, and I look forward to hearing from you!</p>
  `;
  }

  return { message, html };

}