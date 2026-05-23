// ============ MongoDB Connection for Lost & Found ============
const API_BASE_URL = 'http://localhost:5000/api';

// Save lost report to MongoDB
async function saveLostReportToMongoDB(reportData) {
    try {
        console.log('📤 Saving lost report to MongoDB:', reportData.petName);
        const response = await fetch(`${API_BASE_URL}/lost/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reportData)
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('✅ Lost report saved to MongoDB');
            return result.data;
        }
        return null;
    } catch (error) {
        console.error('Error saving lost report to MongoDB:', error);
        return null;
    }
}

// Save found report to MongoDB
async function saveFoundReportToMongoDB(reportData) {
    try {
        console.log('📤 Saving found report to MongoDB:', reportData.species);
        const response = await fetch(`${API_BASE_URL}/found/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reportData)
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('✅ Found report saved to MongoDB');
            return result.data;
        }
        return null;
    } catch (error) {
        console.error('Error saving found report to MongoDB:', error);
        return null;
    }
}

// Delete lost report from MongoDB
async function deleteLostReportFromMongoDB(reportId) {
    try {
        const response = await fetch(`${API_BASE_URL}/lost/${reportId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('✅ Lost report deleted from MongoDB');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting lost report from MongoDB:', error);
        return false;
    }
}

// Delete found report from MongoDB
async function deleteFoundReportFromMongoDB(reportId) {
    try {
        const response = await fetch(`${API_BASE_URL}/found/${reportId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('✅ Found report deleted from MongoDB');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting found report from MongoDB:', error);
        return false;
    }
}

// Load lost reports from MongoDB
async function loadLostReportsFromMongoDB() {
    try {
        const response = await fetch(`${API_BASE_URL}/lost/all`);
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            const formattedReports = result.data.map(report => ({
                id: report._id,
                reportId: report.reportId,
                petName: report.petName,
                species: report.species,
                breed: report.breed,
                color: report.color,
                gender: report.gender,
                age: report.age,
                uniqueMark: report.uniqueMark,
                city: report.city,
                location: report.location,
                latitude: report.latitude,
                longitude: report.longitude,
                lostDate: report.lostDate,
                ownerName: report.ownerName,
                ownerPhone: report.ownerPhone,
                ownerEmail: report.ownerEmail,
                description: report.description,
                status: report.status || "Active Lost Report",
                verificationStatus: report.verificationStatus || "Owner Report Submitted",
                petPhoto: report.petPhoto,
                createdAt: report.createdAt,
                updatedAt: report.updatedAt
            }));
            
            localStorage.setItem("adoptme_lost_reports", JSON.stringify(formattedReports));
            console.log(`✅ Loaded ${formattedReports.length} lost reports from MongoDB`);
            return formattedReports;
        }
        return [];
    } catch (error) {
        console.error('Error loading lost reports from MongoDB:', error);
        return [];
    }
}

// Load found reports from MongoDB
async function loadFoundReportsFromMongoDB() {
    try {
        const response = await fetch(`${API_BASE_URL}/found/all`);
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            const formattedReports = result.data.map(report => ({
                id: report._id,
                reportId: report.reportId,
                species: report.species,
                breed: report.breed,
                color: report.color,
                gender: report.gender,
                uniqueMark: report.uniqueMark,
                city: report.city,
                location: report.location,
                latitude: report.latitude,
                longitude: report.longitude,
                foundDate: report.foundDate,
                condition: report.condition,
                finderName: report.finderName,
                finderPhone: report.finderPhone,
                finderEmail: report.finderEmail,
                description: report.description,
                status: report.status || "Active Found Report",
                verificationStatus: report.verificationStatus || "Finder Report Submitted",
                petPhoto: report.petPhoto,
                createdAt: report.createdAt,
                updatedAt: report.updatedAt
            }));
            
            localStorage.setItem("adoptme_found_reports", JSON.stringify(formattedReports));
            console.log(`✅ Loaded ${formattedReports.length} found reports from MongoDB`);
            return formattedReports;
        }
        return [];
    } catch (error) {
        console.error('Error loading found reports from MongoDB:', error);
        return [];
    }
}

// ============ YOUR ORIGINAL WORKING CODE ============

// Global variables
let lostCameraStreamRef = null;
let foundCameraStreamRef = null;
let lostCapturedImage = "";
let foundCapturedImage = "";

function getCurrentUserSafe() {
    return JSON.parse(localStorage.getItem("adoptme_current_user")) || null;
}

function getLostReports() {
    return JSON.parse(localStorage.getItem("adoptme_lost_reports")) || [];
}

function getFoundReports() {
    return JSON.parse(localStorage.getItem("adoptme_found_reports")) || [];
}

function saveLostReports(data) {
    localStorage.setItem("adoptme_lost_reports", JSON.stringify(data));
}

function saveFoundReports(data) {
    localStorage.setItem("adoptme_found_reports", JSON.stringify(data));
}

function validatePhone(phone) {
    return /^[6-9]\d{9}$/.test(phone);
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalize(text) {
    return String(text || "").trim().toLowerCase();
}

function isPotentialMatch(lost, found) {
    const speciesMatch = normalize(lost.species) === normalize(found.species);
    const colorMatch = normalize(lost.color) === normalize(found.color);
    const breedMatch = normalize(lost.breed) === normalize(found.breed);
    const cityMatch = normalize(lost.city) === normalize(found.city);

    const markMatch =
        normalize(lost.uniqueMark) &&
        normalize(found.uniqueMark) &&
        (
            normalize(lost.uniqueMark).includes(normalize(found.uniqueMark)) ||
            normalize(found.uniqueMark).includes(normalize(lost.uniqueMark))
        );

    const locationMatch =
        normalize(lost.location) &&
        normalize(found.location) &&
        (
            normalize(lost.location).includes(normalize(found.location)) ||
            normalize(found.location).includes(normalize(lost.location))
        );

    return speciesMatch && (colorMatch || breedMatch || cityMatch || markMatch || locationMatch);
}

// SINGLE DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", async () => {
  const page = document.body.dataset.page;
  if (page !== "lostfound") return;

  // Load data from MongoDB first
  await loadLostReportsFromMongoDB();
  await loadFoundReportsFromMongoDB();

  const lostForm = document.getElementById("lostForm");
  const foundForm = document.getElementById("foundForm");
  const lostPetsList = document.getElementById("lostPetsList");
  const matchesList = document.getElementById("matchesList");

  const lostOwnerPhoneError = document.getElementById("lostOwnerPhoneError");
  const lostOwnerEmailError = document.getElementById("lostOwnerEmailError");
  const lostConsentError = document.getElementById("lostConsentError");

  const finderPhoneError = document.getElementById("finderPhoneError");
  const finderEmailError = document.getElementById("finderEmailError");
  const foundConsentError = document.getElementById("foundConsentError");

  function clearErrors() {
    lostOwnerPhoneError.textContent = "";
    lostOwnerEmailError.textContent = "";
    lostConsentError.textContent = "";
    finderPhoneError.textContent = "";
    finderEmailError.textContent = "";
    foundConsentError.textContent = "";
  }

  function fillUserDetails() {
    const user = getCurrentUserSafe();
    if (!user) return;

    const lostOwnerName = document.getElementById("lostOwnerName");
    const lostOwnerEmail = document.getElementById("lostOwnerEmail");
    const finderName = document.getElementById("finderName");
    const finderEmail = document.getElementById("finderEmail");

    if (lostOwnerName && !lostOwnerName.value) lostOwnerName.value = user.name || "";
    if (lostOwnerEmail && !lostOwnerEmail.value) lostOwnerEmail.value = user.email || "";
    if (finderName && !finderName.value) finderName.value = user.name || "";
    if (finderEmail && !finderEmail.value) finderEmail.value = user.email || "";
  }

  // Function to delete a lost report
  async function deleteLostReport(reportId) {
    if (confirm('Are you sure you want to delete this lost report?')) {
        // Remove from localStorage
        const reports = getLostReports();
        const updatedReports = reports.filter(r => r.id !== reportId);
        saveLostReports(updatedReports);
        
        // Remove from MongoDB
        await deleteLostReportFromMongoDB(reportId);
        
        // Refresh the display
        renderLostReports();
        renderMatches();
        showMessage("lostMessage", "Lost report deleted successfully!", "success");
    }
  }

  // Function to delete a found report
  async function deleteFoundReport(reportId) {
    if (confirm('Are you sure you want to delete this found report?')) {
        // Remove from localStorage
        const reports = getFoundReports();
        const updatedReports = reports.filter(r => r.id !== reportId);
        saveFoundReports(updatedReports);
        
        // Remove from MongoDB
        await deleteFoundReportFromMongoDB(reportId);
        
        // Refresh the display
        renderMatches();
        showMessage("foundMessage", "Found report deleted successfully!", "success");
    }
  }

  function renderLostReports() {
    const lostReports = getLostReports();

    lostPetsList.innerHTML = lostReports.length
      ? lostReports.slice().reverse().map(item => `
        <div class="list-item">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="flex: 1;">
              <strong>${item.petName}</strong>
              <span class="lostfound-type-badge lost">Lost</span><br>
              <small><strong>Species:</strong> ${item.species}</small><br>
              <small><strong>Breed:</strong> ${item.breed || "-"}</small><br>
              <small><strong>Color:</strong> ${item.color}</small><br>
              <small><strong>City:</strong> ${item.city}</small><br>
              <small><strong>Last Seen:</strong> ${item.location}</small><br>
              <small><strong>Status:</strong> ${item.status}</small>
            </div>
            <button class="delete-report-btn" onclick="if(typeof deleteLostReport === 'function') deleteLostReport('${item.id}')" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Delete</button>
          </div>
        </div>
      `).join("")
      : `<div class="list-item">No lost pet reports yet.</div>`;
    
    // Attach delete event listeners
    document.querySelectorAll('.delete-report-btn').forEach(btn => {
        btn.removeEventListener('click', btn.clickHandler);
        btn.clickHandler = () => deleteLostReport(btn.getAttribute('onclick').match(/'([^']+)'/)[1]);
        btn.addEventListener('click', btn.clickHandler);
    });
  }

  function renderMatches() {
    const lostReports = getLostReports();
    const foundReports = getFoundReports();

    const matches = [];

    lostReports.forEach(lost => {
      foundReports.forEach(found => {
        if (isPotentialMatch(lost, found)) {
          matches.push({ lost, found });
        }
      });
    });

    matchesList.innerHTML = matches.length
      ? matches.slice().reverse().map(match => `
        <div class="list-item">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="flex: 1;">
              <strong>${match.lost.petName || "Unnamed Pet"}</strong>
              <span class="match-pill">Possible Match Found</span><br>
              <small><strong>Species:</strong> ${match.lost.species}</small><br>
              <small><strong>Color:</strong> ${match.lost.color}</small><br>
              <small><strong>Lost City:</strong> ${match.lost.city}</small><br>
              <small><strong>Found City:</strong> ${match.found.city}</small><br>
              <small><strong>Lost Location:</strong> ${match.lost.location}</small><br>
              <small><strong>Found Location:</strong> ${match.found.location}</small>
            </div>
            <div>
              <button class="delete-found-btn" data-id="${match.found.id}" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; margin-left: 10px;">Delete Found</button>
            </div>
          </div>
        </div>
      `).join("")
      : `<div class="list-item">No possible matches found yet.</div>`;
    
    // Attach delete event listeners for found reports in matches
    document.querySelectorAll('.delete-found-btn').forEach(btn => {
        btn.removeEventListener('click', btn.clickHandler);
        btn.clickHandler = () => deleteFoundReport(btn.dataset.id);
        btn.addEventListener('click', btn.clickHandler);
    });
  }

  function setupLocation(buttonId, statusId, latId, lngId) {
    const button = document.getElementById(buttonId);
    const statusText = document.getElementById(statusId);
    const latInput = document.getElementById(latId);
    const lngInput = document.getElementById(lngId);

    if (!button) return;

    button.addEventListener("click", () => {
      if (!navigator.geolocation) {
        statusText.textContent = "Geolocation is not supported by your browser.";
        return;
      }

      statusText.textContent = "Fetching live location...";

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          latInput.value = lat;
          lngInput.value = lng;
          statusText.textContent = `Location captured: Latitude ${lat.toFixed(6)}, Longitude ${lng.toFixed(6)}`;
        },
        () => {
          statusText.textContent = "Unable to fetch location. Please allow location access.";
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  function setupCamera(startBtnId, captureBtnId, stopBtnId, videoId, canvasId, previewId, type) {
    const startBtn = document.getElementById(startBtnId);
    const captureBtn = document.getElementById(captureBtnId);
    const stopBtn = document.getElementById(stopBtnId);
    const video = document.getElementById(videoId);
    const canvas = document.getElementById(canvasId);
    const preview = document.getElementById(previewId);

    if (!startBtn || !captureBtn || !stopBtn || !video || !canvas || !preview) return;

    startBtn.addEventListener("click", async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false
        });

        if (type === "lost") {
          lostCameraStreamRef = stream;
        } else {
          foundCameraStreamRef = stream;
        }

        video.srcObject = stream;
        video.style.display = "block";
        captureBtn.disabled = false;
        stopBtn.disabled = false;
        startBtn.disabled = true;
      } catch (error) {
        showMessage(type === "lost" ? "lostMessage" : "foundMessage", "Camera access denied or unavailable.", "error");
      }
    });

    captureBtn.addEventListener("click", () => {
      const stream = type === "lost" ? lostCameraStreamRef : foundCameraStreamRef;
      if (!stream) return;

      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, width, height);

      const imageData = canvas.toDataURL("image/png");
      preview.src = imageData;
      preview.style.display = "block";

      if (type === "lost") {
        lostCapturedImage = imageData;
      } else {
        foundCapturedImage = imageData;
      }

      showMessage(type === "lost" ? "lostMessage" : "foundMessage", "Pet photo captured successfully.", "success");
    });

    stopBtn.addEventListener("click", () => {
      const stream = type === "lost" ? lostCameraStreamRef : foundCameraStreamRef;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      if (type === "lost") {
        lostCameraStreamRef = null;
      } else {
        foundCameraStreamRef = null;
      }

      video.srcObject = null;
      video.style.display = "none";
      captureBtn.disabled = true;
      stopBtn.disabled = true;
      startBtn.disabled = false;
    });
  }

  setupLocation("getLostLocationBtn", "lostLocationStatusText", "lostLatitude", "lostLongitude");
  setupLocation("getFoundLocationBtn", "foundLocationStatusText", "foundLatitude", "foundLongitude");

  setupCamera("startLostCameraBtn", "captureLostPhotoBtn", "stopLostCameraBtn", "lostCameraStream", "lostCaptureCanvas", "lostCapturedPreview", "lost");
  setupCamera("startFoundCameraBtn", "captureFoundPhotoBtn", "stopFoundCameraBtn", "foundCameraStream", "foundCaptureCanvas", "foundCapturedPreview", "found");

  // Flag to prevent double submission
  let isSubmittingLost = false;
  
  if (lostForm) {
    lostForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      if (isSubmittingLost) {
        console.log('Already submitting, ignoring duplicate...');
        return;
      }
      isSubmittingLost = true;
      
      clearErrors();

      const consentAccepted = document.getElementById("lostConsent").checked;

      const report = {
        id: Date.now(),
        reportId: "LOST-" + Date.now(),
        reportType: "Lost",
        userEmail: document.getElementById("lostOwnerEmail").value.trim().toLowerCase(),
        ownerName: document.getElementById("lostOwnerName").value.trim(),
        ownerPhone: document.getElementById("lostOwnerPhone").value.trim(),
        ownerEmail: document.getElementById("lostOwnerEmail").value.trim().toLowerCase(),
        petName: document.getElementById("lostName").value.trim(),
        species: document.getElementById("lostSpecies").value,
        breed: document.getElementById("lostBreed").value,
        color: document.getElementById("lostColor").value,
        gender: document.getElementById("lostGender").value,
        age: document.getElementById("lostAge").value.trim(),
        uniqueMark: document.getElementById("lostUniqueMark").value.trim(),
        city: document.getElementById("lostCity").value,
        location: document.getElementById("lostLocation").value.trim(),
        latitude: document.getElementById("lostLatitude").value || "",
        longitude: document.getElementById("lostLongitude").value || "",
        lostDate: document.getElementById("lostDate").value,
        description: document.getElementById("lostDescription").value.trim(),
        petPhoto: lostCapturedImage || "",
        consentAccepted,
        verificationStatus: "Owner Report Submitted",
        status: "Active Lost Report",
        createdAt: new Date().toLocaleString()
      };

      let hasError = false;

      if (!validatePhone(report.ownerPhone)) {
        lostOwnerPhoneError.textContent = "Please enter a valid 10-digit Indian mobile number.";
        hasError = true;
      }

      if (!validateEmail(report.ownerEmail)) {
        lostOwnerEmailError.textContent = "Please enter a valid email address.";
        hasError = true;
      }

      if (!consentAccepted) {
        lostConsentError.textContent = "Please accept the reporting consent.";
        hasError = true;
      }

      if (!report.latitude || !report.longitude) {
        showMessage("lostMessage", "Please fetch the live location.", "error");
        hasError = true;
      }

      if (!report.petPhoto) {
        showMessage("lostMessage", "Please capture a lost pet photo.", "error");
        hasError = true;
      }

      if (hasError) {
        isSubmittingLost = false;
        return;
      }

      // Save to localStorage
      const reports = getLostReports();
      reports.push(report);
      saveLostReports(reports);
      
      // Save to MongoDB
      await saveLostReportToMongoDB(report);

      showMessage("lostMessage", `Lost pet report submitted successfully! Report ID: ${report.reportId}`, "success");

      lostForm.reset();
      lostCapturedImage = "";
      document.getElementById("lostCapturedPreview").src = "";
      document.getElementById("lostCapturedPreview").style.display = "none";
      document.getElementById("lostLatitude").value = "";
      document.getElementById("lostLongitude").value = "";
      document.getElementById("lostLocationStatusText").textContent = "Lost pet location not captured yet.";
      fillUserDetails();
      renderLostReports();
      renderMatches();
      
      setTimeout(() => { isSubmittingLost = false; }, 2000);
    });
  }

  let isSubmittingFound = false;
  
  if (foundForm) {
    foundForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      if (isSubmittingFound) {
        console.log('Already submitting, ignoring duplicate...');
        return;
      }
      isSubmittingFound = true;
      
      clearErrors();

      const consentAccepted = document.getElementById("foundConsent").checked;

      const report = {
        id: Date.now(),
        reportId: "FOUND-" + Date.now(),
        reportType: "Found",
        userEmail: document.getElementById("finderEmail").value.trim().toLowerCase(),
        finderName: document.getElementById("finderName").value.trim(),
        finderPhone: document.getElementById("finderPhone").value.trim(),
        finderEmail: document.getElementById("finderEmail").value.trim().toLowerCase(),
        species: document.getElementById("foundSpecies").value,
        breed: document.getElementById("foundBreed").value,
        color: document.getElementById("foundColor").value,
        gender: document.getElementById("foundGender").value,
        uniqueMark: document.getElementById("foundUniqueMark").value.trim(),
        city: document.getElementById("foundCity").value,
        location: document.getElementById("foundLocation").value.trim(),
        latitude: document.getElementById("foundLatitude").value || "",
        longitude: document.getElementById("foundLongitude").value || "",
        foundDate: document.getElementById("foundDate").value,
        condition: document.getElementById("foundCondition").value,
        description: document.getElementById("foundDescription").value.trim(),
        petPhoto: foundCapturedImage || "",
        consentAccepted,
        verificationStatus: "Finder Report Submitted",
        status: "Active Found Report",
        createdAt: new Date().toLocaleString()
      };

      let hasError = false;

      if (!validatePhone(report.finderPhone)) {
        finderPhoneError.textContent = "Please enter a valid 10-digit Indian mobile number.";
        hasError = true;
      }

      if (!validateEmail(report.finderEmail)) {
        finderEmailError.textContent = "Please enter a valid email address.";
        hasError = true;
      }

      if (!consentAccepted) {
        foundConsentError.textContent = "Please accept the finder consent.";
        hasError = true;
      }

      if (!report.latitude || !report.longitude) {
        showMessage("foundMessage", "Please fetch the live location.", "error");
        hasError = true;
      }

      if (!report.petPhoto) {
        showMessage("foundMessage", "Please capture a found pet photo.", "error");
        hasError = true;
      }

      if (hasError) {
        isSubmittingFound = false;
        return;
      }

      // Save to localStorage
      const reports = getFoundReports();
      reports.push(report);
      saveFoundReports(reports);
      
      // Save to MongoDB
      await saveFoundReportToMongoDB(report);

      showMessage("foundMessage", `Found pet report submitted successfully! Report ID: ${report.reportId}`, "success");

      foundForm.reset();
      foundCapturedImage = "";
      document.getElementById("foundCapturedPreview").src = "";
      document.getElementById("foundCapturedPreview").style.display = "none";
      document.getElementById("foundLatitude").value = "";
      document.getElementById("foundLongitude").value = "";
      document.getElementById("foundLocationStatusText").textContent = "Found pet location not captured yet.";
      fillUserDetails();
      renderMatches();
      
      setTimeout(() => { isSubmittingFound = false; }, 2000);
    });
  }

  fillUserDetails();
  renderLostReports();
  renderMatches();
});

// ============================================================
// YOUR EXISTING GLOBAL FUNCTIONS (Keep them as they are)
// ============================================================

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

// Keep ALL your existing global functions (theme, navbar, seedData, initHomeWelcomeCards, etc.)
// ... (they remain exactly as you have them)