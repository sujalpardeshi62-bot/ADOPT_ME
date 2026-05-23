document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page !== "dashboard") return;

  const themeToggleBtn = document.getElementById("themeToggleBtn");

  const adoptionPreview = document.getElementById("dashboardCertificatePreview");
  const adoptionDownloadBtn = document.getElementById("dashboardDownloadCertificateBtn");
  const adoptionPrintBtn = document.getElementById("dashboardPrintCertificateBtn");

  const donationPreview = document.getElementById("dashboardDonationReceiptPreview");
  const donationDownloadBtn = document.getElementById("dashboardDownloadDonationReceiptBtn");
  const donationPrintBtn = document.getElementById("dashboardPrintDonationReceiptBtn");

  const volunteerPreview = document.getElementById("dashboardVolunteerIdPreview");
  const volunteerDownloadBtn = document.getElementById("dashboardDownloadVolunteerIdBtn");
  const volunteerPrintBtn = document.getElementById("dashboardPrintVolunteerIdBtn");
  const volunteerPrevBtn = document.getElementById("dashboardPrevVolunteerBtn");
  const volunteerNextBtn = document.getElementById("dashboardNextVolunteerBtn");
  const volunteerPreviewCount = document.getElementById("dashboardVolunteerPreviewCount");

  const rescueList = document.getElementById("dashboardRescueList");
  const latestRescuePreview = document.getElementById("dashboardLatestRescuePreview");

  const myAdoptionsCount = document.getElementById("myAdoptionsCount");
  const myDonationsCount = document.getElementById("myDonationsCount");
  const myVolunteerCount = document.getElementById("myVolunteerCount");
  const myRescueCount = document.getElementById("myRescueCount");
  const myLostFoundCount = document.getElementById("myLostFoundCount");
  const myEventsCount = document.getElementById("myEventsCount");

  const dashboardLostFoundList = document.getElementById("dashboardLostFoundList");
  const dashboardLatestLostFoundPreview = document.getElementById("dashboardLatestLostFoundPreview");

  const dashboardEventsList = document.getElementById("dashboardEventsList");
  const dashboardEventAlertsList = document.getElementById("dashboardEventAlertsList");
  const dashboardLatestEventPreview = document.getElementById("dashboardLatestEventPreview");

  const dashboardUserProfileCard = document.getElementById("dashboardUserProfileCard");

  let userVolunteers = [];
  let currentVolunteerIndex = 0;

  function currentUserSafe() {
    return JSON.parse(localStorage.getItem("adoptme_current_user")) || null;
  }

  function applyTheme(theme) {
    document.body.classList.toggle("dark-theme", theme === "dark");
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML =
        theme === "dark"
          ? '<i class="fa-solid fa-sun"></i>'
          : '<i class="fa-solid fa-moon"></i>';
    }
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeText(text) {
    return String(text || "").trim().toLowerCase();
  }

  function lostFoundMatch(lost, found) {
    const speciesMatch = normalizeText(lost.species) === normalizeText(found.species);
    const colorMatch = normalizeText(lost.color) === normalizeText(found.color);
    const breedMatch = normalizeText(lost.breed) === normalizeText(found.breed);
    const cityMatch = normalizeText(lost.city) === normalizeText(found.city);

    const markMatch =
      normalizeText(lost.uniqueMark) &&
      normalizeText(found.uniqueMark) &&
      (
        normalizeText(lost.uniqueMark).includes(normalizeText(found.uniqueMark)) ||
        normalizeText(found.uniqueMark).includes(normalizeText(lost.uniqueMark))
      );

    const locationMatch =
      normalizeText(lost.location) &&
      normalizeText(found.location) &&
      (
        normalizeText(lost.location).includes(normalizeText(found.location)) ||
        normalizeText(found.location).includes(normalizeText(lost.location))
      );

    return speciesMatch && (colorMatch || breedMatch || cityMatch || markMatch || locationMatch);
  }

  function renderDashboardUserProfile(user) {
    if (!dashboardUserProfileCard || !user) return;

    const role = user.role || "User";
    let extraFields = "";

    if (role === "Shelter Staff") {
      extraFields += `
        <div class="dashboard-user-info-item">
          <strong>Shelter Name</strong>
          <span>${escapeHtml(user.shelterName || "-")}</span>
        </div>
        <div class="dashboard-user-info-item">
          <strong>Shelter Location</strong>
          <span>${escapeHtml(user.shelterLocation || "-")}</span>
        </div>
      `;
    }

    if (role === "Volunteer") {
      extraFields += `
        <div class="dashboard-user-info-item">
          <strong>Skills</strong>
          <span>${escapeHtml(user.volunteerSkills || "-")}</span>
        </div>
        <div class="dashboard-user-info-item">
          <strong>Availability</strong>
          <span>${escapeHtml(user.volunteerAvailability || "-")}</span>
        </div>
      `;
    }

    dashboardUserProfileCard.innerHTML = `
      <div class="dashboard-user-profile-box">
        <div class="dashboard-user-photo-box">
          ${
            user.profilePhoto
              ? `<img src="${user.profilePhoto}" alt="${escapeHtml(user.name)}" class="dashboard-user-photo" />`
              : `<div class="dashboard-user-photo-placeholder"><i class="fa-solid fa-user"></i></div>`
          }
        </div>

        <div class="dashboard-user-content-box">
          <h3 class="dashboard-user-name">${escapeHtml(user.name || "User")}</h3>
          <div class="dashboard-user-role-pill">
            <i class="fa-solid fa-id-badge"></i> ${escapeHtml(role)}
          </div>

          <div class="dashboard-user-info-grid">
            <div class="dashboard-user-info-item">
              <strong>Email</strong>
              <span>${escapeHtml(user.email || "-")}</span>
            </div>
            <div class="dashboard-user-info-item">
              <strong>Phone</strong>
              <span>${escapeHtml(user.phone || "-")}</span>
            </div>
            <div class="dashboard-user-info-item">
              <strong>City</strong>
              <span>${escapeHtml(user.city || "-")}</span>
            </div>
            <div class="dashboard-user-info-item">
              <strong>Registered Role</strong>
              <span>${escapeHtml(role)}</span>
            </div>
            ${extraFields}
          </div>

          <div class="dashboard-user-bio-box">
            <strong>About / Profile Note</strong>
            <p>${escapeHtml(user.bio || "No profile bio added yet.")}</p>
          </div>
        </div>
      </div>
    `;
  }

  const savedTheme = localStorage.getItem("adoptme_theme") || "light";
  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const newTheme = document.body.classList.contains("dark-theme") ? "light" : "dark";
      localStorage.setItem("adoptme_theme", newTheme);
      applyTheme(newTheme);
    });
  }

  const user = currentUserSafe();
  if (!user) return;

  renderDashboardUserProfile(user);

  const allAdoptions = JSON.parse(localStorage.getItem("adoptme_adoptions")) || [];
  const userAdoptions = allAdoptions.filter(item => item.email === user.email);

  const allDonations = JSON.parse(localStorage.getItem("adoptme_donations")) || [];
  const userDonations = allDonations.filter(item => item.email === user.email);

  const allVolunteers = JSON.parse(localStorage.getItem("adoptme_volunteers")) || [];
  userVolunteers = allVolunteers.filter(item => item.email === user.email).slice().reverse();

  const allRescues = JSON.parse(localStorage.getItem("adoptme_rescue_requests")) || [];
  const userRescues = allRescues.filter(item => (item.email || item.userEmail || "") === user.email);

  const allLostReports = JSON.parse(localStorage.getItem("adoptme_lost_reports")) || [];
  const allFoundReports = JSON.parse(localStorage.getItem("adoptme_found_reports")) || [];
  const userLostReports = allLostReports.filter(item => (item.ownerEmail || item.userEmail || "") === user.email);
  const userFoundReports = allFoundReports.filter(item => (item.finderEmail || item.userEmail || "") === user.email);

  const allEventRegistrations = JSON.parse(localStorage.getItem("adoptme_event_registrations")) || [];
  const allEventAlerts = JSON.parse(localStorage.getItem("adoptme_event_alerts")) || [];
  const allEvents = JSON.parse(localStorage.getItem("adoptme_events")) || [];
  const userEventRegistrations = allEventRegistrations.filter(
    item => (item.email || item.userEmail || "") === user.email
  );

  if (myAdoptionsCount) myAdoptionsCount.textContent = userAdoptions.length;
  if (myDonationsCount) myDonationsCount.textContent = userDonations.length;
  if (myVolunteerCount) myVolunteerCount.textContent = userVolunteers.length;
  if (myRescueCount) myRescueCount.textContent = userRescues.length;
  if (myLostFoundCount) myLostFoundCount.textContent = userLostReports.length + userFoundReports.length;
  if (myEventsCount) myEventsCount.textContent = userEventRegistrations.length;

  if (adoptionPreview) {
    if (!userAdoptions.length) {
      adoptionPreview.innerHTML = `<div class="list-item">No adoption certificate available yet.</div>`;
    } else {
      const latestAdoption = userAdoptions[userAdoptions.length - 1];

      adoptionPreview.innerHTML = `
        <div class="dashboard-certificate-card">
          <div class="dashboard-certificate-stamp">ADOPTME VERIFIED</div>
          <h2>🐾 AdoptMe</h2>
          <p class="dashboard-certificate-subtitle">Official Verified Pet Adoption Certificate</p>
          <p>This certificate is issued to</p>
          <h3>${escapeHtml(latestAdoption.name)}</h3>
          <p>for submitting a verified adoption request for</p>
          <h4>${escapeHtml(latestAdoption.animalName)}</h4>
          <div class="dashboard-certificate-meta">
            <div><strong>Application ID:</strong> ${escapeHtml(latestAdoption.id)}</div>
            <div><strong>Date:</strong> ${escapeHtml(latestAdoption.createdAt)}</div>
            <div><strong>Status:</strong> ${escapeHtml(latestAdoption.status)}</div>
            <div><strong>Aadhaar:</strong> ${escapeHtml(latestAdoption.aadhaarNumber || "-")}</div>
          </div>
          <div class="dashboard-certificate-signatures">
            <div>
              <span>Founder</span>
              <strong>Vishwakarma Ashish</strong>
              <small>Web Developer</small>
              <small>BCA Student</small>
              <div class="dashboard-signature-line">Ashish</div>
            </div>
            <div>
              <span>Co-Founder</span>
              <strong>Pardeshi Sujal</strong>
              <small>Full stack developer</small>
              <small>BCA Student</small>
              <div class="dashboard-signature-line">Sujal</div>
            </div>
          </div>
        </div>
      `;

      if (adoptionDownloadBtn) adoptionDownloadBtn.disabled = false;
      if (adoptionPrintBtn) adoptionPrintBtn.disabled = false;

      function getAdoptionCertificateHTML() {
        return `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>AdoptMe Adoption Certificate</title>
          </head>
          <body>${adoptionPreview.innerHTML}</body>
          </html>
        `;
      }

      if (adoptionDownloadBtn) {
        adoptionDownloadBtn.addEventListener("click", () => {
          const blob = new Blob([getAdoptionCertificateHTML()], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `adoptme-adoption-certificate-${latestAdoption.id}.html`;
          link.click();
          URL.revokeObjectURL(url);
        });
      }

      if (adoptionPrintBtn) {
        adoptionPrintBtn.addEventListener("click", () => {
          const printWindow = window.open("", "_blank");
          printWindow.document.write(getAdoptionCertificateHTML());
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => printWindow.print(), 300);
        });
      }
    }
  }

  if (donationPreview) {
    if (!userDonations.length) {
      donationPreview.innerHTML = `<div class="list-item">No donation receipt available yet.</div>`;
    } else {
      const latestDonation = userDonations[userDonations.length - 1];

      donationPreview.innerHTML = `
        <div class="dashboard-certificate-card dashboard-donation-card">
          <div class="dashboard-certificate-stamp">ADOPTME DONATION VERIFIED</div>
          <h2>🐾 AdoptMe</h2>
          <p class="dashboard-certificate-subtitle">Official Donation Receipt</p>
          <p>This receipt is issued to</p>
          <h3>${escapeHtml(latestDonation.name)}</h3>
          <p>for contributing an amount of</p>
          <h4>₹${escapeHtml(latestDonation.amount)}</h4>
          <div class="dashboard-certificate-meta">
            <div><strong>Receipt ID:</strong> ${escapeHtml(latestDonation.id)}</div>
            <div><strong>Donation Type:</strong> ${escapeHtml(latestDonation.type)}</div>
            <div><strong>Payment Method:</strong> ${escapeHtml(latestDonation.paymentMethod)}</div>
            <div><strong>UPI App / Transfer:</strong> ${escapeHtml(latestDonation.upiApp || latestDonation.paymentMethod || "-")}</div>
            <div><strong>Payment Verification:</strong> ${latestDonation.paymentVerified ? "Verified" : "Pending"}</div>
            <div><strong>Email Verified:</strong> ${latestDonation.emailVerified ? "Yes" : "No"}</div>
            <div><strong>Phone Verified:</strong> ${latestDonation.phoneVerified ? "Yes" : "No"}</div>
            <div><strong>Location:</strong> ${escapeHtml(latestDonation.location || "-")}</div>
            <div><strong>Authorized:</strong> ${latestDonation.transactionAuthorized ? "Yes" : "No"}</div>
            <div><strong>Bank:</strong> ${escapeHtml(latestDonation.bankName || "-")}</div>
            <div><strong>Wallet:</strong> ${escapeHtml(latestDonation.walletProvider || "-")}</div>
            <div><strong>Card Holder:</strong> ${escapeHtml(latestDonation.cardName || "-")}</div>
            <div><strong>Date:</strong> ${escapeHtml(latestDonation.createdAt)}</div>
          </div>
          <div class="dashboard-certificate-signatures">
            <div>
              <span>Founder</span>
              <strong>Vishwakarma Ashish</strong>
              <small>Web Developer</small>
              <small>BCA Student</small>
              <div class="dashboard-signature-line">Ashish</div>
            </div>
            <div>
              <span>Co-Founder</span>
              <strong>Pardeshi Sujal</strong>
              <small>Full stack developer</small>
              <small>BCA Student</small>
              <div class="dashboard-signature-line">Sujal</div>
            </div>
          </div>
        </div>
      `;

      if (donationDownloadBtn) donationDownloadBtn.disabled = false;
      if (donationPrintBtn) donationPrintBtn.disabled = false;

      function getDonationReceiptHTML() {
        return `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>AdoptMe Donation Receipt</title>
          </head>
          <body>${donationPreview.innerHTML}</body>
          </html>
        `;
      }

      if (donationDownloadBtn) {
        donationDownloadBtn.addEventListener("click", () => {
          const blob = new Blob([getDonationReceiptHTML()], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `adoptme-donation-receipt-${latestDonation.id}.html`;
          link.click();
          URL.revokeObjectURL(url);
        });
      }

      if (donationPrintBtn) {
        donationPrintBtn.addEventListener("click", () => {
          const printWindow = window.open("", "_blank");
          printWindow.document.write(getDonationReceiptHTML());
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => printWindow.print(), 300);
        });
      }
    }
  }

  function buildVolunteerCardMarkup(volunteer) {
    return `
      <div class="volunteer-id-card">
        <div class="certificate-watermark">🐾 AdoptMe</div>
        <div class="certificate-stamp">ADOPTME VOLUNTEER VERIFIED</div>
        <div class="certificate-header">🐾 AdoptMe</div>
        <div class="certificate-subtitle">Official Volunteer Registration ID</div>
        <div class="certificate-body">
          <p>This is to certify that</p>
          <h2>${escapeHtml(volunteer.name)}</h2>
          <p>has been successfully registered as an official volunteer of</p>
          <h3>AdoptMe Welfare & Rescue Platform</h3>
          <div class="certificate-details">
            <div><strong>Volunteer ID:</strong> ${escapeHtml(volunteer.volunteerId)}</div>
            <div><strong>Email:</strong> ${escapeHtml(volunteer.email)}</div>
            <div><strong>Phone:</strong> ${escapeHtml(volunteer.phone)}</div>
            <div><strong>City:</strong> ${escapeHtml(volunteer.city)}</div>
            <div><strong>Role:</strong> ${escapeHtml(volunteer.rolePreference)}</div>
            <div><strong>Availability:</strong> ${escapeHtml(volunteer.availability)}</div>
            <div><strong>Skills:</strong> ${escapeHtml(volunteer.skills)}</div>
            <div><strong>Registered On:</strong> ${escapeHtml(volunteer.createdAt)}</div>
          </div>
          <p class="receipt-thankyou-text">Thank you for standing with rescued animals and the AdoptMe mission. 🐾</p>
        </div>
      </div>
    `;
  }

  function getVolunteerIdHTML(volunteer) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>AdoptMe Volunteer ID</title>
      </head>
      <body>${buildVolunteerCardMarkup(volunteer)}</body>
      </html>
    `;
  }

  function renderVolunteerPreview() {
    if (!volunteerPreview) return;

    if (!userVolunteers.length) {
      volunteerPreview.innerHTML = `<div class="list-item">No volunteer ID available yet.</div>`;
      if (volunteerPreviewCount) volunteerPreviewCount.textContent = "Volunteer 0 of 0";
      if (volunteerPrevBtn) volunteerPrevBtn.disabled = true;
      if (volunteerNextBtn) volunteerNextBtn.disabled = true;
      if (volunteerDownloadBtn) volunteerDownloadBtn.disabled = true;
      if (volunteerPrintBtn) volunteerPrintBtn.disabled = true;
      return;
    }

    if (currentVolunteerIndex < 0) currentVolunteerIndex = 0;
    if (currentVolunteerIndex >= userVolunteers.length) currentVolunteerIndex = userVolunteers.length - 1;

    const volunteer = userVolunteers[currentVolunteerIndex];
    volunteerPreview.innerHTML = buildVolunteerCardMarkup(volunteer);

    if (volunteerPreviewCount) {
      volunteerPreviewCount.textContent = `Volunteer ${currentVolunteerIndex + 1} of ${userVolunteers.length}`;
    }

    if (volunteerPrevBtn) volunteerPrevBtn.disabled = currentVolunteerIndex === 0;
    if (volunteerNextBtn) volunteerNextBtn.disabled = currentVolunteerIndex === userVolunteers.length - 1;
    if (volunteerDownloadBtn) volunteerDownloadBtn.disabled = false;
    if (volunteerPrintBtn) volunteerPrintBtn.disabled = false;
  }

  if (volunteerPrevBtn) {
    volunteerPrevBtn.addEventListener("click", () => {
      if (currentVolunteerIndex > 0) {
        currentVolunteerIndex--;
        renderVolunteerPreview();
      }
    });
  }

  if (volunteerNextBtn) {
    volunteerNextBtn.addEventListener("click", () => {
      if (currentVolunteerIndex < userVolunteers.length - 1) {
        currentVolunteerIndex++;
        renderVolunteerPreview();
      }
    });
  }

  if (volunteerDownloadBtn) {
    volunteerDownloadBtn.addEventListener("click", () => {
      if (!userVolunteers.length) return;
      const volunteer = userVolunteers[currentVolunteerIndex];
      const blob = new Blob([getVolunteerIdHTML(volunteer)], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `adoptme-volunteer-id-${volunteer.volunteerId}.html`;
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  if (volunteerPrintBtn) {
    volunteerPrintBtn.addEventListener("click", () => {
      if (!userVolunteers.length) return;
      const volunteer = userVolunteers[currentVolunteerIndex];
      const printWindow = window.open("", "_blank");
      printWindow.document.write(getVolunteerIdHTML(volunteer));
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 300);
    });
  }

  renderVolunteerPreview();

  if (rescueList) {
    rescueList.innerHTML = userRescues.length
      ? userRescues.slice().reverse().map(item => `
        <div class="list-item">
          <strong>${escapeHtml(item.animalType || "Animal Rescue")}</strong>
          <span class="rescue-badge ${String(item.emergencyLevel || "").toLowerCase()}">${escapeHtml(item.emergencyLevel || "Emergency")}</span><br>
          <small><strong>Request ID:</strong> ${escapeHtml(item.requestId || item.id)}</small><br>
          <small><strong>Condition:</strong> ${escapeHtml(item.animalCondition || "-")}</small><br>
          <small><strong>Location:</strong> ${escapeHtml(item.location || "-")}</small><br>
          <small><strong>Status:</strong> ${escapeHtml(item.status || "Open")}</small><br>
          <small><strong>Date:</strong> ${escapeHtml(item.createdAt || "-")}</small>
        </div>
      `).join("")
      : `<div class="list-item">No rescue requests found yet.</div>`;
  }

  if (latestRescuePreview) {
    if (!userRescues.length) {
      latestRescuePreview.innerHTML = `<div class="list-item">No rescue request available yet.</div>`;
    } else {
      const latestRescue = userRescues[userRescues.length - 1];

      latestRescuePreview.innerHTML = `
        <div class="dashboard-certificate-card">
          <div class="dashboard-certificate-stamp">EMERGENCY RESCUE LOGGED</div>
          <h2>🚨 AdoptMe Rescue</h2>
          <p class="dashboard-certificate-subtitle">Latest Emergency Rescue Request</p>
          <p>This emergency request was submitted by</p>
          <h3>${escapeHtml(latestRescue.name || "Rescuer")}</h3>
          <p>for</p>
          <h4>${escapeHtml(latestRescue.animalType || "Animal Rescue Case")}</h4>
          <div class="dashboard-certificate-meta">
            <div><strong>Request ID:</strong> ${escapeHtml(latestRescue.requestId || latestRescue.id)}</div>
            <div><strong>Emergency Level:</strong> ${escapeHtml(latestRescue.emergencyLevel || "-")}</div>
            <div><strong>Condition:</strong> ${escapeHtml(latestRescue.animalCondition || "-")}</div>
            <div><strong>Animal Count:</strong> ${escapeHtml(latestRescue.animalCount || "-")}</div>
            <div><strong>Location:</strong> ${escapeHtml(latestRescue.location || "-")}</div>
            <div><strong>Landmark:</strong> ${escapeHtml(latestRescue.landmark || "-")}</div>
            <div><strong>Status:</strong> ${escapeHtml(latestRescue.status || "Open")}</div>
            <div><strong>Assigned Team:</strong> ${escapeHtml(latestRescue.assignedTeam || "Pending Assignment")}</div>
            <div><strong>Reported:</strong> ${escapeHtml(latestRescue.createdAt || "-")}</div>
            <div><strong>Noticed At:</strong> ${escapeHtml(latestRescue.noticedAt || "-")}</div>
          </div>
          ${latestRescue.animalPhoto ? `
            <div style="margin-top:20px;">
              <img src="${latestRescue.animalPhoto}" alt="Rescue proof" style="max-width:320px; width:100%; border-radius:14px; border:1px solid rgba(139,94,60,0.12);" />
            </div>
          ` : ""}
          <div class="dashboard-certificate-signatures">
            <div>
              <span>Rescue System</span>
              <strong>AdoptMe Emergency Desk</strong>
              <small>Logged & Tracked</small>
            </div>
            <div>
              <span>Response Status</span>
              <strong>${escapeHtml(latestRescue.status || "Open")}</strong>
              <small>${escapeHtml(latestRescue.assignedTeam || "Pending Assignment")}</small>
            </div>
          </div>
        </div>
      `;
    }
  }

  const combinedLostFound = [
    ...userLostReports.map(item => ({ ...item, entryType: "Lost" })),
    ...userFoundReports.map(item => ({ ...item, entryType: "Found" }))
  ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  if (dashboardLostFoundList) {
    dashboardLostFoundList.innerHTML = combinedLostFound.length
      ? combinedLostFound.map(item => `
        <div class="list-item">
          <strong>${escapeHtml(item.petName || item.species || "Pet Report")}</strong>
          <span class="lostfound-type-badge ${String(item.entryType || "").toLowerCase()}">${escapeHtml(item.entryType)}</span><br>
          <small><strong>Report ID:</strong> ${escapeHtml(item.reportId || item.id)}</small><br>
          <small><strong>Species:</strong> ${escapeHtml(item.species || "-")}</small><br>
          <small><strong>Breed:</strong> ${escapeHtml(item.breed || "-")}</small><br>
          <small><strong>Color:</strong> ${escapeHtml(item.color || "-")}</small><br>
          <small><strong>City:</strong> ${escapeHtml(item.city || "-")}</small><br>
          <small><strong>Location:</strong> ${escapeHtml(item.location || "-")}</small><br>
          <small><strong>Status:</strong> ${escapeHtml(item.status || "-")}</small><br>
          <small><strong>Date:</strong> ${escapeHtml(item.createdAt || "-")}</small>
        </div>
      `).join("")
      : `<div class="list-item">No lost or found reports available yet.</div>`;
  }

  if (dashboardLatestLostFoundPreview) {
    if (!combinedLostFound.length) {
      dashboardLatestLostFoundPreview.innerHTML = `<div class="list-item">No lost or found activity available yet.</div>`;
    } else {
      const latestItem = combinedLostFound[0];

      let possibleMatches = [];

      if (latestItem.entryType === "Lost") {
        possibleMatches = allFoundReports.filter(found => lostFoundMatch(latestItem, found));
      } else if (latestItem.entryType === "Found") {
        possibleMatches = allLostReports.filter(lost => lostFoundMatch(lost, latestItem));
      }

      dashboardLatestLostFoundPreview.innerHTML = `
        <div class="dashboard-certificate-card">
          <div class="dashboard-certificate-stamp">${latestItem.entryType === "Lost" ? "LOST PET REPORTED" : "FOUND PET REPORTED"}</div>
          <h2>🐾 AdoptMe Lost & Found</h2>
          <p class="dashboard-certificate-subtitle">Latest Lost / Found Report</p>
          <p>This report was submitted by</p>
          <h3>${escapeHtml(
            latestItem.ownerName ||
            latestItem.finderName ||
            latestItem.name ||
            "User"
          )}</h3>
          <p>for</p>
          <h4>${escapeHtml(latestItem.petName || latestItem.species || "Pet Report")}</h4>
          <div class="dashboard-certificate-meta">
            <div><strong>Report ID:</strong> ${escapeHtml(latestItem.reportId || latestItem.id)}</div>
            <div><strong>Type:</strong> ${escapeHtml(latestItem.entryType || "-")}</div>
            <div><strong>Species:</strong> ${escapeHtml(latestItem.species || "-")}</div>
            <div><strong>Breed:</strong> ${escapeHtml(latestItem.breed || "-")}</div>
            <div><strong>Color:</strong> ${escapeHtml(latestItem.color || "-")}</div>
            <div><strong>Gender:</strong> ${escapeHtml(latestItem.gender || "-")}</div>
            <div><strong>Age:</strong> ${escapeHtml(latestItem.age || "-")}</div>
            <div><strong>Unique Mark:</strong> ${escapeHtml(latestItem.uniqueMark || "-")}</div>
            <div><strong>City:</strong> ${escapeHtml(latestItem.city || "-")}</div>
            <div><strong>Location:</strong> ${escapeHtml(latestItem.location || "-")}</div>
            <div><strong>Latitude:</strong> ${escapeHtml(latestItem.latitude || "-")}</div>
            <div><strong>Longitude:</strong> ${escapeHtml(latestItem.longitude || "-")}</div>
            <div><strong>Status:</strong> ${escapeHtml(latestItem.status || "-")}</div>
            <div><strong>Verification:</strong> ${escapeHtml(latestItem.verificationStatus || "-")}</div>
            <div><strong>Reported On:</strong> ${escapeHtml(latestItem.createdAt || "-")}</div>
          </div>
          ${latestItem.petPhoto ? `
            <div style="margin-top:20px;">
              <img
                src="${latestItem.petPhoto}"
                alt="Lost or found pet proof"
                style="max-width:320px; width:100%; border-radius:14px; border:1px solid rgba(139,94,60,0.12);"
              />
            </div>
          ` : ""}
          <div class="card" style="margin-top:20px; text-align:left;">
            <h3 style="margin-bottom:10px; color:#8B5E3C;">Description</h3>
            <p>${escapeHtml(latestItem.description || "-")}</p>
          </div>
          <div style="margin-top:16px;">
            <span class="match-pill">Possible Matches: ${possibleMatches.length}</span>
          </div>
          <div class="dashboard-certificate-signatures">
            <div>
              <span>Lost & Found Desk</span>
              <strong>AdoptMe Tracking System</strong>
              <small>Verified Submission</small>
            </div>
            <div>
              <span>Current Status</span>
              <strong>${escapeHtml(latestItem.status || "-")}</strong>
              <small>${escapeHtml(latestItem.verificationStatus || "-")}</small>
            </div>
          </div>
        </div>
      `;
    }
  }

  if (dashboardEventsList) {
    dashboardEventsList.innerHTML = userEventRegistrations.length
      ? userEventRegistrations.slice().reverse().map(item => `
        <div class="list-item">
          <strong>${escapeHtml(item.eventTitle || "Event Registration")}</strong><br>
          <small><strong>Registration ID:</strong> ${escapeHtml(item.registrationId || item.id)}</small><br>
          <small><strong>Role:</strong> ${escapeHtml(item.role || "-")}</small><br>
          <small><strong>City:</strong> ${escapeHtml(item.city || "-")}</small><br>
          <small><strong>Date:</strong> ${escapeHtml(item.eventDate || "-")}</small><br>
          <small><strong>Status:</strong> ${escapeHtml(item.status || "Registered")}</small>
        </div>
      `).join("")
      : `<div class="list-item">No event registrations available yet.</div>`;
  }

  if (dashboardEventAlertsList) {
    dashboardEventAlertsList.innerHTML = allEventAlerts.length
      ? allEventAlerts.slice().reverse().map(alert => `
        <div class="list-item">
          <strong>${escapeHtml(alert.title || "Event Alert")}</strong><br>
          <small>${escapeHtml(alert.message || "-")}</small>
        </div>
      `).join("")
      : `<div class="list-item">No event alerts available yet.</div>`;
  }

  if (dashboardLatestEventPreview) {
    if (!userEventRegistrations.length) {
      dashboardLatestEventPreview.innerHTML = `<div class="list-item">No event registration available yet.</div>`;
    } else {
      const latestEvent = userEventRegistrations[userEventRegistrations.length - 1];
      const eventInfo = allEvents.find(event => event.id === latestEvent.eventId);

      dashboardLatestEventPreview.innerHTML = `
        <div class="dashboard-certificate-card">
          <div class="dashboard-certificate-stamp">EVENT REGISTERED</div>
          <h2>🎉 AdoptMe Events</h2>
          <p class="dashboard-certificate-subtitle">Latest Event Registration</p>
          <p>This registration was submitted by</p>
          <h3>${escapeHtml(latestEvent.name || "Participant")}</h3>
          <p>for</p>
          <h4>${escapeHtml(latestEvent.eventTitle || "Community Event")}</h4>
          <div class="dashboard-certificate-meta">
            <div><strong>Registration ID:</strong> ${escapeHtml(latestEvent.registrationId || latestEvent.id)}</div>
            <div><strong>Email:</strong> ${escapeHtml(latestEvent.email || "-")}</div>
            <div><strong>Phone:</strong> ${escapeHtml(latestEvent.phone || "-")}</div>
            <div><strong>City:</strong> ${escapeHtml(latestEvent.city || "-")}</div>
            <div><strong>Participation Type:</strong> ${escapeHtml(latestEvent.role || "-")}</div>
            <div><strong>Event Date:</strong> ${escapeHtml(latestEvent.eventDate || "-")}</div>
            <div><strong>Venue:</strong> ${escapeHtml(latestEvent.eventVenue || eventInfo?.venue || "-")}</div>
            <div><strong>Status:</strong> ${escapeHtml(latestEvent.status || "Registered")}</div>
            <div><strong>Registered On:</strong> ${escapeHtml(latestEvent.createdAt || "-")}</div>
          </div>
          <div class="card" style="margin-top:20px; text-align:left;">
            <h3 style="margin-bottom:10px; color:#8B5E3C;">Participant Note</h3>
            <p>${escapeHtml(latestEvent.note || "No additional note submitted.")}</p>
          </div>
          <div class="dashboard-certificate-signatures">
            <div>
              <span>Events Desk</span>
              <strong>AdoptMe Community Team</strong>
              <small>Verified Registration</small>
            </div>
            <div>
              <span>Event Status</span>
              <strong>${escapeHtml(eventInfo?.status || "Upcoming")}</strong>
              <small>${escapeHtml(latestEvent.status || "Registered")}</small>
            </div>
          </div>
        </div>
      `;
    }
  }
});

/* =========================================================
   AdoptMe - Global Main JS
   Used for:
   - index.html
   - adopt.html
   - donate.html
   - dashboard.html
   ========================================================= */

function getStorage(key, fallback = []) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function showMessage(elementId, text, type = "success") {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.textContent = text;
  element.className = `message ${type}`;
}

function currentUser() {
  try {
    return JSON.parse(localStorage.getItem("adoptme_current_user")) || null;
  } catch (error) {
    return null;
  }
}

/* =========================================================
   Theme
   ========================================================= */
function updateThemeIcon() {
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (!themeToggleBtn) return;

  const isDark = document.body.classList.contains("dark-theme");
  themeToggleBtn.innerHTML = isDark
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
}

function applyGlobalTheme() {
  const savedTheme = localStorage.getItem("adoptme_theme") || "light";
  document.body.classList.toggle("dark-theme", savedTheme === "dark");
  updateThemeIcon();
}

function initThemeToggle() {
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (!themeToggleBtn) return;

  themeToggleBtn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-theme");
    localStorage.setItem("adoptme_theme", isDark ? "dark" : "light");
    updateThemeIcon();
  });
}

/* =========================================================
   Seed Data
   ========================================================= */
function seedData() {
  if (!localStorage.getItem("adoptme_animals")) {
    const animals = [
      { id: 1, name: "Bella", species: "Dog", age: "Young", location: "New York", breed: "Labrador Mix", image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=900&q=80" },
      { id: 2, name: "Milo", species: "Cat", age: "Adult", location: "Chicago", breed: "Tabby", image: "https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=80" },
      { id: 3, name: "Daisy", species: "Rabbit", age: "Baby", location: "Austin", breed: "Mini Lop", image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=80" },
      { id: 4, name: "Rocky", species: "Dog", age: "Adult", location: "Seattle", breed: "German Shepherd Mix", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80" },
      { id: 5, name: "Luna", species: "Cat", age: "Young", location: "New York", breed: "Siamese Mix", image: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=900&q=80" },
      { id: 6, name: "Coco", species: "Dog", age: "Baby", location: "Chicago", breed: "Beagle Mix", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80" },
      { id: 7, name: "Oliver", species: "Cat", age: "Adult", location: "Miami", breed: "British Shorthair Mix", image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=80" },
      { id: 8, name: "Ruby", species: "Dog", age: "Young", location: "Austin", breed: "Golden Retriever Mix", image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=80" },
      { id: 9, name: "Snow", species: "Rabbit", age: "Young", location: "Seattle", breed: "Angora Rabbit", image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=80" },
      { id: 10, name: "Charlie", species: "Dog", age: "Adult", location: "Miami", breed: "Poodle Mix", image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80" },
      { id: 11, name: "Nala", species: "Cat", age: "Baby", location: "Chicago", breed: "Calico", image: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=900&q=80" },
      { id: 12, name: "Bruno", species: "Dog", age: "Young", location: "New York", breed: "Boxer Mix", image: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=900&q=80" },
      { id: 13, name: "Kiwi", species: "Bird", age: "Young", location: "Austin", breed: "Lovebird", image: "https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?auto=format&fit=crop&w=900&q=80" },
      { id: 14, name: "Mithu", species: "Parrot", age: "Adult", location: "Miami", breed: "Indian Ringneck", image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=900&q=80" },
      { id: 15, name: "Nibbles", species: "Hamster", age: "Baby", location: "Chicago", breed: "Syrian Hamster", image: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=900&q=80" },
      { id: 16, name: "Peanut", species: "Guinea Pig", age: "Young", location: "Seattle", breed: "Abyssinian Guinea Pig", image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80" },
      { id: 17, name: "Shelly", species: "Turtle", age: "Adult", location: "Austin", breed: "Red-Eared Slider", image: "https://images.unsplash.com/photo-1496196614460-48988a57fccf?auto=format&fit=crop&w=900&q=80" },
      { id: 18, name: "Bubbles", species: "Fish", age: "Young", location: "Miami", breed: "Goldfish", image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=900&q=80" },
      { id: 19, name: "Storm", species: "Horse", age: "Adult", location: "Austin", breed: "Arabian", image: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&q=80" },
      { id: 20, name: "Golu", species: "Goat", age: "Young", location: "Seattle", breed: "Boer Goat", image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=900&q=80" },
      { id: 21, name: "Gauri", species: "Cow", age: "Adult", location: "Chicago", breed: "Jersey Cow", image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=80" },
      { id: 22, name: "Donald", species: "Duck", age: "Young", location: "New York", breed: "Pekin Duck", image: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=900&q=80" },
      { id: 23, name: "Clucky", species: "Chicken", age: "Adult", location: "Miami", breed: "Silkie", image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=900&q=80" },
      { id: 24, name: "Skyler", species: "Pigeon", age: "Young", location: "New York", breed: "Homing Pigeon", image: "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=900&q=80" },
      { id: 25, name: "Slinky", species: "Ferret", age: "Young", location: "Seattle", breed: "Domestic Ferret", image: "https://images.unsplash.com/photo-1591561582301-7ce6588cc286?auto=format&fit=crop&w=900&q=80" },
      { id: 26, name: "Spike", species: "Hedgehog", age: "Adult", location: "Austin", breed: "African Pygmy Hedgehog", image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=900&q=80" },
      { id: 27, name: "Rocky Shell", species: "Tortoise", age: "Adult", location: "Chicago", breed: "Indian Star Tortoise", image: "https://images.unsplash.com/photo-1456926631375-92c8ce872def?auto=format&fit=crop&w=900&q=80" },
      { id: 28, name: "Momo", species: "Parrot", age: "Young", location: "Delhi", breed: "Alexandrine Parakeet", image: "https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&w=900&q=80" },
      { id: 29, name: "Fluffy", species: "Guinea Pig", age: "Baby", location: "Pune", breed: "Peruvian Guinea Pig", image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=900&q=80" },
      { id: 30, name: "Marsh", species: "Duck", age: "Adult", location: "Bangalore", breed: "Runner Duck", image: "https://images.unsplash.com/photo-1466721591366-2d5fba72006d?auto=format&fit=crop&w=900&q=80" },
      { id: 31, name: "Bunny", species: "Rabbit", age: "Young", location: "Pune", breed: "Dutch Rabbit", image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=80" },
      { id: 32, name: "Thunder", species: "Horse", age: "Adult", location: "Jaipur", breed: "Marwari Horse", image: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&q=80" }
    ];

    setStorage("adoptme_animals", animals);
  }

  if (!localStorage.getItem("adoptme_users")) {
    setStorage("adoptme_users", [
      {
        id: Date.now(),
        name: "Admin User",
        email: "admin@adoptme.local",
        password: "admin123",
        role: "Admin"
      }
    ]);
  }

  if (!localStorage.getItem("adoptme_events")) {
    setStorage("adoptme_events", [
      { id: 1, title: "Weekend Adoption Fair", location: "Downtown Shelter", date: "Saturday • 11:00 AM" },
      { id: 2, title: "Volunteer Orientation", location: "Community Hall", date: "Sunday • 2:00 PM" },
      { id: 3, title: "Fundraising Walk", location: "Central Park", date: "Next Week • 9:00 AM" }
    ]);
  }
}

/* =========================================================
   Navbar
   ========================================================= */
function initNavbar() {
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      navMenu.classList.toggle("show");
      navToggle.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navMenu.classList.remove("show");
        navToggle.classList.remove("active");
      }
    });
  }

  const authLink = document.getElementById("navAuthLink");
  const user = currentUser();

  if (authLink && user) {
    authLink.textContent = "Dashboard";
    authLink.href = user.role === "Admin" ? "admin/admin-dashboard.html" : "dashboard.html";
  }
}

/* =========================================================
   Loader
   ========================================================= */
function initLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;

  window.addEventListener("load", () => {
    setTimeout(() => loader.classList.add("hide"), 900);
  });
}

/* =========================================================
   Featured Animals
   ========================================================= */
function renderFeaturedAnimals() {
  const container = document.getElementById("featuredAnimals");
  if (!container) return;

  const animals = getStorage("adoptme_animals", []).slice(0, 3);

  container.innerHTML = animals.map(animal => `
    <div class="card animal-card dynamic-animal-card">
      <img src="${animal.image}" alt="${animal.name}" onerror="this.src='https://placehold.co/900x600/F4E9D8/8B5E3C?text=AdoptMe+Pet';">
      <div class="animal-card-content">
        <h3>${animal.name}</h3>
        <p class="animal-meta">${animal.species} • ${animal.age} • ${animal.location}</p>
        <p>${animal.breed}</p>
        <a href="adopt.html" class="btn btn-primary btn-sm">View & Adopt</a>
      </div>
    </div>
  `).join("");
}

/* =========================================================
   Newsletter
   ========================================================= */
function initNewsletter() {
  const form = document.getElementById("newsletterForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const emailInput = document.getElementById("newsletterEmail");
    if (!emailInput) return;

    const email = emailInput.value.trim();
    if (!email) return;

    const subscribers = getStorage("adoptme_newsletter", []);
    subscribers.push({
      email,
      createdAt: new Date().toLocaleString()
    });

    setStorage("adoptme_newsletter", subscribers);
    alert("Thanks for subscribing to AdoptMe updates!");
    form.reset();
  });
}

/* =========================================================
   Scroll Buttons
   ========================================================= */
function initScrollButtons() {
  const topBtn = document.getElementById("backToTopBtn");
  const bottomBtn = document.getElementById("backToBottomBtn");

  function toggleButtons() {
    if (!topBtn || !bottomBtn) return;

    const scrollable = document.documentElement.scrollHeight > window.innerHeight + 50;

    if (scrollable) {
      topBtn.classList.add("show");
      bottomBtn.classList.add("show");
    } else {
      topBtn.classList.remove("show");
      bottomBtn.classList.remove("show");
    }
  }

  if (topBtn) {
    topBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (bottomBtn) {
    bottomBtn.addEventListener("click", () => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth"
      });
    });
  }

  window.addEventListener("scroll", toggleButtons);
  window.addEventListener("resize", toggleButtons);
  setTimeout(toggleButtons, 100);
}

/* =========================================================
   Dashboard
   ========================================================= */
function renderDashboard() {
  const page = document.body.dataset.page;
  if (page !== "dashboard") return;

  const user = currentUser();
  if (!user) {
    window.location.href = "newlogin.html";
    return;
  }

  const userName = document.getElementById("dashboardUserName");
  const userRole = document.getElementById("dashboardUserRole");

  if (userName) userName.textContent = user.name;
  if (userRole) userRole.textContent = user.role;

  const adoptions = getStorage("adoptme_adoptions", []).filter(item => item.email === user.email);
  const donations = getStorage("adoptme_donations", []).filter(item => item.email === user.email);
  const volunteers = getStorage("adoptme_volunteers", []).filter(item => item.email === user.email);

  const myAdoptionsCount = document.getElementById("myAdoptionsCount");
  const myDonationsCount = document.getElementById("myDonationsCount");
  const myVolunteerCount = document.getElementById("myVolunteerCount");

  if (myAdoptionsCount) myAdoptionsCount.textContent = adoptions.length;
  if (myDonationsCount) myDonationsCount.textContent = donations.length;
  if (myVolunteerCount) myVolunteerCount.textContent = volunteers.length;

  const adoptionsList = document.getElementById("dashboardAdoptionsList");
  if (adoptionsList) {
    adoptionsList.innerHTML = adoptions.length
      ? adoptions.map(a => `
        <div class="list-item">
          <strong>${a.animalName}</strong><br>
          <small>Status: ${a.status} • ${a.createdAt}</small>
        </div>
      `).join("")
      : `<div class="list-item">No adoption requests yet.</div>`;
  }

  const contributions = document.getElementById("dashboardContributions");
  if (contributions) {
    const rows = [
      ...donations.map(d => `
        <div class="list-item">
          <strong>Donation:</strong> ₹${d.amount}<br>
          <small>${d.type} • ${d.paymentMethod} • ${d.createdAt}</small>
        </div>
      `),
      ...volunteers.map(v => `
        <div class="list-item">
          <strong>Volunteer:</strong> ${v.skills}</strong><br>
          <small>${v.availability} • ${v.createdAt}</small>
        </div>
      `)
    ];

    contributions.innerHTML = rows.length
      ? rows.join("")
      : `<div class="list-item">No contributions yet.</div>`;
  }

  const advanced = document.getElementById("dashboardAdvancedAdoptions");
  if (advanced) {
    advanced.innerHTML = adoptions.length
      ? adoptions.map(app => `
        <div class="list-item">
          <strong>${app.animalName}</strong> • ${app.status}<br>
          <small>ID Type: ${app.idType || "-"} | Aadhaar: ${app.aadhaarNumber || "-"}</small><br>
          <small>Citizenship: ${app.citizenship || "-"} | City: ${app.city || "-"}, ${app.state || "-"}</small><br>
          <small>Photo: ${app.photoFileName || "Not uploaded"} | Document: ${app.documentFileName || "Not uploaded"}</small>
        </div>
      `).join("")
      : `<div class="list-item">No verified adoption details yet.</div>`;
  }

  const donationVerificationList = document.getElementById("dashboardDonationVerificationList");
  if (donationVerificationList) {
    donationVerificationList.innerHTML = donations.length
      ? donations.map(d => `
        <div class="list-item">
          <strong>${d.name}</strong> donated ₹${d.amount}<br>
          <small>Method: ${d.paymentMethod || "-"} | UPI App: ${d.upiApp || "-"}</small><br>
          <small>Email Verified: ${d.emailVerified ? "Yes" : "No"} | Phone Verified: ${d.phoneVerified ? "Yes" : "No"}</small><br>
          <small>Payment Verified: ${d.paymentVerified ? "Yes" : "No"} | Authorized: ${d.transactionAuthorized ? "Yes" : "No"}</small><br>
          <small>Location: ${d.location || "-"} | Bank: ${d.bankName || "-"} | Wallet: ${d.walletProvider || "-"}</small>
        </div>
      `).join("")
      : `<div class="list-item">No donation verification records yet.</div>`;
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("adoptme_current_user");
      window.location.href = "newlogin.html";
    });
  }
}

/* =========================================================
   Admin Rescue Count
   ========================================================= */
function updateAdminRescueCount() {
  const rescues = getStorage("adoptme_rescue_requests", []);
  const adminRescueCount = document.getElementById("adminRescueCount");
  if (adminRescueCount) {
    adminRescueCount.textContent = rescues.length;
  }
}

/* =========================================================
   Init All
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  applyGlobalTheme();
  initThemeToggle();
  seedData();
  initNavbar();
  initLoader();
  renderFeaturedAnimals();
  initNewsletter();
  initScrollButtons();
  renderDashboard();
  updateAdminRescueCount();
  initHomeWelcomeCards();
});

function getUserInitial(name = "") {
  return name.trim().charAt(0).toUpperCase() || "U";
}

function initHomeWelcomeCards() {
  const page = document.body.dataset.page;
  if (page !== "home") return;

  const user = currentUser();

  const navbarWelcomeCard = document.getElementById("navbarWelcomeCard");
  const navbarWelcomeToggle = document.getElementById("navbarWelcomeToggle");
  const navbarWelcomeDropdown = document.getElementById("navbarWelcomeDropdown");
  const navbarUserImage = document.getElementById("navbarUserImage");
  const navbarUserAvatar = document.getElementById("navbarUserAvatar");
  const navbarUserName = document.getElementById("navbarUserName");
  const navbarUserRole = document.getElementById("navbarUserRole");

  const heroWelcomeCard = document.getElementById("homeUserWelcomeCard");
  const homeUserImage = document.getElementById("homeUserImage");
  const homeUserAvatar = document.getElementById("homeUserAvatar");
  const homeWelcomeTitle = document.getElementById("homeWelcomeTitle");
  const homeUserRolePill = document.getElementById("homeUserRolePill");
  const homeWelcomeText = document.getElementById("homeWelcomeText");

  const guestLinks = document.querySelectorAll(".guest-only-link");
  const navDashboardLink = document.getElementById("navDashboardLink");
  const heroDashboardLink = document.getElementById("heroDashboardLink");
  const dropdownDashboardLink = document.getElementById("dropdownDashboardLink");
  const logoutBtn = document.getElementById("homeLogoutBtn");

  if (!user) {
    guestLinks.forEach(link => (link.style.display = ""));
    if (navbarWelcomeCard) {
      navbarWelcomeCard.classList.remove("show", "open");
    }
    if (heroWelcomeCard) {
      heroWelcomeCard.classList.remove("show");
    }
    return;
  }

  guestLinks.forEach(link => (link.style.display = "none"));
  if (navbarWelcomeCard) navbarWelcomeCard.classList.add("show");
  if (heroWelcomeCard) heroWelcomeCard.classList.add("show");

  const initial = getUserInitial(user.name || "User");
  const profileImage = user.profilePhoto || user.profileImage || user.avatar || "";
  const dashboardHref = user.role === "Admin" ? "admin/admin-dashboard.html" : "dashboard.html";

  if (navDashboardLink) navDashboardLink.href = dashboardHref;
  if (heroDashboardLink) heroDashboardLink.href = dashboardHref;
  if (dropdownDashboardLink) dropdownDashboardLink.href = dashboardHref;

  if (navbarUserName) navbarUserName.textContent = `Hi, ${user.name || "User"}`;
  if (navbarUserRole) navbarUserRole.textContent = user.role || "User";

  if (homeWelcomeTitle) homeWelcomeTitle.textContent = `Welcome back, ${user.name || "User"}`;
  if (homeUserRolePill) {
    homeUserRolePill.innerHTML = `
      <i class="fa-solid ${user.role === "Admin" ? "fa-shield-cat" : "fa-user"}"></i>
      ${user.role || "User"}
    `;
  }

  if (homeWelcomeText) {
    homeWelcomeText.textContent =
      user.role === "Admin"
        ? "You are logged in as Admin. Quickly manage platform activity, users, animals, and rescue updates."
        : "Continue your pet welfare journey with quick access to adoption, donations, volunteering, and events.";
  }

  if (profileImage) {
    if (navbarUserImage) {
      navbarUserImage.src = profileImage;
      navbarUserImage.classList.add("show");
    }
    if (navbarUserAvatar) {
      navbarUserAvatar.classList.add("hide");
      navbarUserAvatar.textContent = initial;
    }

    if (homeUserImage) {
      homeUserImage.src = profileImage;
      homeUserImage.classList.add("show");
    }
    if (homeUserAvatar) {
      homeUserAvatar.classList.add("hide");
      homeUserAvatar.textContent = initial;
    }
  } else {
    if (navbarUserImage) {
      navbarUserImage.classList.remove("show");
      navbarUserImage.removeAttribute("src");
    }
    if (navbarUserAvatar) {
      navbarUserAvatar.classList.remove("hide");
      navbarUserAvatar.textContent = initial;
    }

    if (homeUserImage) {
      homeUserImage.classList.remove("show");
      homeUserImage.removeAttribute("src");
    }
    if (homeUserAvatar) {
      homeUserAvatar.classList.remove("hide");
      homeUserAvatar.textContent = initial;
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("adoptme_current_user");
      window.location.reload();
    });
  }

  if (navbarWelcomeToggle && navbarWelcomeCard) {
    navbarWelcomeToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = navbarWelcomeCard.classList.toggle("open");
      navbarWelcomeToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    document.addEventListener("click", (e) => {
      if (!navbarWelcomeCard.contains(e.target)) {
        navbarWelcomeCard.classList.remove("open");
        navbarWelcomeToggle.setAttribute("aria-expanded", "false");
      }
    });

    if (navbarWelcomeDropdown) {
      navbarWelcomeDropdown.addEventListener("click", (e) => {
        const link = e.target.closest("a");
        if (link && link.id !== "homeLogoutBtn") {
          navbarWelcomeCard.classList.remove("open");
          navbarWelcomeToggle.setAttribute("aria-expanded", "false");
        }
      });
    }
  }
}

/* =========================================================
   Auth js for Dashboard
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const USERS_KEY = "adoptme_users";
  const CURRENT_USER_KEY = "adoptme_current_user";
  const THEME_KEY = "adoptme_theme";

  const page = document.body.dataset.page;
  const themeToggleBtn = document.getElementById("themeToggleBtn");

  function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)) || null;
  }

  function setCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  function clearCurrentUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  function normalizeRole(role) {
    const value = String(role || "").toLowerCase();
    if (value === "user") return "User";
    if (value === "shelter staff" || value === "shelter") return "Shelter Staff";
    if (value === "volunteer") return "Volunteer";
    if (value === "admin") return "Admin";
    return "User";
  }

  function ensureDefaultAdmins() {
    const users = getUsers();

    const hasAshish = users.some(user => user.email === "ashish.admin@adoptme.local");
    const hasSujal = users.some(user => user.email === "sujal.admin@adoptme.local");

    if (!hasAshish) {
      users.push({
        id: "USR-ADMIN-ASHISH",
        name: "Ashish",
        email: "ashish.admin@adoptme.local",
        phone: "",
        password: "Ashish@123",
        role: "Admin",
        profilePhoto: "",
        city: "",
        bio: "Admin Account",
        shelterName: "",
        shelterLocation: "",
        volunteerSkills: "",
        volunteerAvailability: "",
        createdAt: new Date().toLocaleString()
      });
    }

    if (!hasSujal) {
      users.push({
        id: "USR-ADMIN-SUJAL",
        name: "Sujal",
        email: "sujal.admin@adoptme.local",
        phone: "",
        password: "Sujal@123",
        role: "Admin",
        profilePhoto: "",
        city: "",
        bio: "Admin Account",
        shelterName: "",
        shelterLocation: "",
        volunteerSkills: "",
        volunteerAvailability: "",
        createdAt: new Date().toLocaleString()
      });
    }

    saveUsers(users);
  }

  function syncCurrentUserWithStoredUsers() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const users = getUsers();
    const matchedUser = users.find(user => user.email === currentUser.email);

    if (!matchedUser) return;

    const updatedSessionUser = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      phone: matchedUser.phone || "",
      role: normalizeRole(matchedUser.role),
      profilePhoto: matchedUser.profilePhoto || "",
      city: matchedUser.city || "",
      bio: matchedUser.bio || "",
      shelterName: matchedUser.shelterName || "",
      shelterLocation: matchedUser.shelterLocation || "",
      volunteerSkills: matchedUser.volunteerSkills || "",
      volunteerAvailability: matchedUser.volunteerAvailability || "",
      loggedIn: true
    };

    setCurrentUser(updatedSessionUser);
  }

  function requireDashboardLogin() {
    const currentUser = getCurrentUser();
    const protectedPages = ["dashboard", "profile"];

    if (protectedPages.includes(page) && !currentUser) {
      window.location.href = "newlogin.html";
    }
  }

  function protectAdminPages() {
    const currentUser = getCurrentUser();
    const isAdminPage = window.location.pathname.includes("/admin/") || page === "admin-dashboard";

    if (!isAdminPage) return;

    if (!currentUser) {
      window.location.href = "../newlogin.html";
      return;
    }

    if (normalizeRole(currentUser.role) !== "Admin") {
      alert("Access denied. Admins only.");
      window.location.href = "../index.html";
    }
  }

  function setupLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        clearCurrentUser();
        window.location.href = "newlogin.html";
      });
    }
  }

  function updateDashboardUserInfo() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const dashboardUserName = document.getElementById("dashboardUserName");
    const dashboardUserRole = document.getElementById("dashboardUserRole");

    if (dashboardUserName) dashboardUserName.textContent = currentUser.name || "User";
    if (dashboardUserRole) dashboardUserRole.textContent = normalizeRole(currentUser.role);
  }

  function injectNavbarProfileStyles() {
    if (document.getElementById("navbarProfileInlineStyles")) return;

    const style = document.createElement("style");
    style.id = "navbarProfileInlineStyles";
    style.textContent = `
      .navbar-profile-item {
        position: relative;
        list-style: none;
      }

      .navbar-profile-btn {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        background: transparent;
        border: none;
        color: inherit;
        cursor: pointer;
        font: inherit;
        padding: 8px 10px;
        border-radius: 999px;
      }

      .navbar-profile-btn:hover {
        background: rgba(139, 94, 60, 0.08);
      }

      .navbar-profile-avatar,
      .navbar-profile-avatar-lg {
        object-fit: cover;
        border-radius: 50%;
        overflow: hidden;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .navbar-profile-avatar {
        width: 34px;
        height: 34px;
      }

      .navbar-profile-avatar-lg {
        width: 54px;
        height: 54px;
      }

      .navbar-profile-avatar-placeholder {
        background: #f7efe3;
        color: #8B5E3C;
      }

      .navbar-profile-name {
        font-weight: 700;
      }

      .navbar-profile-menu {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        min-width: 240px;
        background: #fff;
        border: 1px solid rgba(139, 94, 60, 0.1);
        border-radius: 16px;
        box-shadow: 0 18px 44px rgba(0,0,0,0.12);
        padding: 12px;
        display: none;
        z-index: 999;
      }

      .navbar-profile-menu.show {
        display: block;
      }

      .navbar-profile-menu-head {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 10px 14px;
        border-bottom: 1px solid rgba(139, 94, 60, 0.1);
        margin-bottom: 8px;
      }

      .navbar-profile-menu-head strong {
        display: block;
        color: #8B5E3C;
      }

      .navbar-profile-menu-head small {
        color: #666;
      }

      .navbar-profile-menu a {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 12px;
        color: #333;
        text-decoration: none;
      }

      .navbar-profile-menu a:hover {
        background: #f7efe3;
        color: #8B5E3C;
      }

      body.dark-theme .navbar-profile-menu {
        background: #2a241f;
        border-color: rgba(255,255,255,0.06);
      }

      body.dark-theme .navbar-profile-menu a {
        color: #f1e9de;
      }

      body.dark-theme .navbar-profile-menu a:hover {
        background: #342d27;
      }

      body.dark-theme .navbar-profile-menu-head small {
        color: #ddd1c2;
      }

      body.dark-theme .navbar-profile-avatar-placeholder {
        background: #342d27;
        color: #f1e9de;
      }
    `;
    document.head.appendChild(style);
  }

  function injectNavbarProfileCard() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const navMenu = document.getElementById("navMenu");
    if (!navMenu) return;
    if (document.getElementById("navbarProfileDropdown")) return;

    const profileHtml = `
      <li class="navbar-profile-item" id="navbarProfileDropdown">
        <button class="navbar-profile-btn" id="navbarProfileBtn" type="button">
          ${
            currentUser.profilePhoto
              ? `<img src="${currentUser.profilePhoto}" alt="${currentUser.name}" class="navbar-profile-avatar" />`
              : `<span class="navbar-profile-avatar navbar-profile-avatar-placeholder"><i class="fa-solid fa-user"></i></span>`
          }
          <span class="navbar-profile-name">${currentUser.name || "User"}</span>
          <i class="fa-solid fa-chevron-down"></i>
        </button>

        <div class="navbar-profile-menu" id="navbarProfileMenu">
          <div class="navbar-profile-menu-head">
            ${
              currentUser.profilePhoto
                ? `<img src="${currentUser.profilePhoto}" alt="${currentUser.name}" class="navbar-profile-avatar-lg" />`
                : `<span class="navbar-profile-avatar-lg navbar-profile-avatar-placeholder"><i class="fa-solid fa-user"></i></span>`
            }
            <div>
              <strong>${currentUser.name || "User"}</strong>
              <small>${normalizeRole(currentUser.role)}</small>
            </div>
          </div>
          <a href="dashboard.html"><i class="fa-solid fa-table-columns"></i> Dashboard</a>
          <a href="profile.html"><i class="fa-solid fa-user-gear"></i> Profile Settings</a>
          <a href="#" id="navbarProfileLogoutLink"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
        </div>
      </li>
    `;

    navMenu.insertAdjacentHTML("beforeend", profileHtml);

    const profileBtn = document.getElementById("navbarProfileBtn");
    const profileMenu = document.getElementById("navbarProfileMenu");
    const logoutLink = document.getElementById("navbarProfileLogoutLink");

    if (profileBtn && profileMenu) {
      profileBtn.addEventListener("click", () => {
        profileMenu.classList.toggle("show");
      });

      document.addEventListener("click", (e) => {
        if (!document.getElementById("navbarProfileDropdown")?.contains(e.target)) {
          profileMenu.classList.remove("show");
        }
      });
    }

    if (logoutLink) {
      logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        clearCurrentUser();
        window.location.href = "newlogin.html";
      });
    }
  }

  function applyTheme(theme) {
    document.body.classList.toggle("dark-theme", theme === "dark");
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML =
        theme === "dark"
          ? '<i class="fa-solid fa-sun"></i>'
          : '<i class="fa-solid fa-moon"></i>';
    }
  }

  function setupThemeToggle() {
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const savedTheme = localStorage.getItem("adoptme_theme") || "light";
    applyTheme(savedTheme);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", () => {
        const newTheme = document.body.classList.contains("dark-theme") ? "light" : "dark";
        localStorage.setItem("adoptme_theme", newTheme);
        applyTheme(newTheme);
      });
    }
  }

  function toggleGuestLinks() {
  const currentUser = getCurrentUser();
  const guestLinks = document.querySelectorAll(".guest-only-link");

  guestLinks.forEach(link => {
    link.style.display = currentUser ? "none" : "";
  });
}

  ensureDefaultAdmins();
  syncCurrentUserWithStoredUsers();
  setupThemeToggle();
  requireDashboardLogin();
  protectAdminPages();
  setupLogout();
  updateDashboardUserInfo();
  injectNavbarProfileStyles();
  injectNavbarProfileCard();
  toggleGuestLinks();
});

