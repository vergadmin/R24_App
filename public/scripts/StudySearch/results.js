// Get the email modal
var emailModal = document.getElementById("emailModal");


// Get the <span> element that closes the email modal
var emailCloseBtn = document.getElementsByClassName("close")[0];

var sentEmailCloseBtn = document.getElementById("close-btn")

var openModalEmail;
var openModalTitle;
var openModalNctId;
var openModalMessage;
// When the user clicks the button, open the email modal 
function openEmailModal(role, contactName, contactEmail, studyTitle, briefSummary, nctID) {
  console.log("here!")
  openModalEmail = contactEmail;
  openModalTitle = studyTitle;
  openModalNctId = nctID;
  emailModal.style.display = "flex";
  let alexInfoText = `What is ALEX?\nThe ALEX portal and associated research was developed through the support of the U01CA274970 grant from the National Cancer Institute, part of the National Institute of Health. The ALEX portal is a web-based tool for patients, caregivers, and providers which aims to increase referral of patients to clinical trials. ALEX helps a user search for and learn about potential study opportunities and understand the complex language that can be a barrier for many patients and their caregivers. If you have questions about why you are receiving this email, or to learn more about the ALEX portal, please reach out to the ALEX Research team at ETCH@mayo.edu.`
  let patientText= `Hello, \n\nI saw the following research study on the ALEX website. I am interested in participating and would like more information about the study and how to enroll.\n\nTitle: ${studyTitle}\nNCT ID: ${nctID}\nLink To Study: https://clinicaltrials.gov/study${nctID}\n\nAI-Summarized Description I Read from ALEX: ${briefSummary}`
  let caregiverText= `Hello,\n\nI saw the following research study on the ALEX website. I am the caregiver of someone who is interested in participating and would like more information about the study and how to enroll them.\n\nTitle: ${studyTitle}\nNCT ID: ${nctID}\nLink To Study: https://clinicaltrials.gov/study${nctID}\n\nAI-Summarized Description I Read from ALEX: ${briefSummary}`

  var text
  if (role === 'Patient') {
    text = patientText
  } else {
    text = caregiverText
  }
  text = text + '\n\n' + alexInfoText
    document.getElementById("message").value = text;
    openModalMessage =text;

    if (contactName && contactEmail !== null) {
      document.getElementById("coordinator-contact").innerHTML = contactName + ": " + contactEmail + " "
    } else {
      document.getElementById("coordinator-contact").style.display = none;
    }
}

// When the user clicks on <span> (x), close the email modal
emailCloseBtn.onclick = function() {
  emailModal.style.display = "none";
}

// When the user clicks on <span> (x), close the email modal
sentEmailCloseBtn.onclick = function() {
  document.getElementById("email-form").style.display = ''
  document.getElementById("close").style.display = ''
  document.getElementById("email-sending-loading").style.display = 'none'
  emailModal.style.display = "none";
}

// When the user clicks anywhere outside of the email modal, close it
window.onclick = function(event) {
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

  const subject = `[ACTION REQUESTED] Potential Participant Requesting Information about ${title}`

  let id = sessionStorage.getItem("id") || "tempId";
  let type = sessionStorage.getItem("type") || "tempType";
  let vCHE = sessionStorage.getItem("vCHE") || "tempvCHE";
  let url =`/${id}/${type}/${vCHE}/StudySearch/SendEmailPatient`;
  let data = {
    message: openModalMessage,
    subject: subject,
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

function openSurvey () {
  let id = sessionStorage.getItem("id") || "tempId";
  const url =  `https://ufl.qualtrics.com/jfe/form/SV_0v1xFWcmSi5MRPE?PreScreenerID=${id}`;
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

  let title = openModalTitle <= 25 ? openModalTitle : openModalTitle.substring(0, 25) + "...";

  const subject = `[ACTION REQUESTED] Potential Participant Requesting Information about ${title}`

  let id = sessionStorage.getItem("id") || "tempId";
  let type = sessionStorage.getItem("type") || "tempType";
  let vCHE = sessionStorage.getItem("vCHE") || "tempvCHE";
  let url =`/${id}/${type}/${vCHE}/StudySearch/SendEmailCaregiver`;

  let data = {
    message: openModalMessage,
    subject: subject,
    studyContact: openModalEmail,
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

// Handle submission of email
/*
var submitEmailButton = document.getElementById("submitEmailButton");
submitEmailButton.onclick = function() {
  if (contactName && contactEmail !== null) {
    document.getElementById("coordinator-contact").innerHTML = contactName + ": " + contactEmail + " "
  } else {
    document.getElementById("coordinator-contact").style.display = none;
  }
  // Perform any action with the entered email here, such as sending it to a server
  console.log("Submitted email:", emailInput);
  // Close the email modal after submission
  emailModal.style.display = "none";
}
  */