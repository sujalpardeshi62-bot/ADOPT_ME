// ============ ADD THIS AT THE VERY TOP (MongoDB Connection for Admin Volunteers) ============
const API_BASE_URL = 'http://localhost:5000/api';

// Load volunteers from MongoDB
async function loadVolunteersFromMongoDB() {
    try {
        console.log('🔄 Loading volunteers from MongoDB...');
        const response = await fetch(`${API_BASE_URL}/volunteers/all`);
        const result = await response.json();
        
        console.log('📥 API Response:', result);
        
        if (result.success && result.data && result.data.length > 0) {
            const formattedVolunteers = result.data.map(volunteer => ({
                id: volunteer._id,
                volunteerId: volunteer.volunteerId,
                name: volunteer.name,
                email: volunteer.email,
                phone: volunteer.phone,
                city: volunteer.city,
                photoFileName: volunteer.photoFileName,
                skills: volunteer.skills,
                availability: volunteer.availability,
                rolePreference: volunteer.rolePreference,
                reason: volunteer.reason,
                emergencyContact: volunteer.emergencyContact,
                consentAccepted: volunteer.consentAccepted,
                verificationStatus: volunteer.verificationStatus || "Verified Registration Submitted",
                createdAt: volunteer.createdAt,
                updatedAt: volunteer.updatedAt
            }));
            
            localStorage.setItem("adoptme_volunteers", JSON.stringify(formattedVolunteers));
            console.log(`✅ Loaded ${formattedVolunteers.length} volunteers from MongoDB`);
            return formattedVolunteers;
        } else {
            console.log('⚠️ No volunteers found in MongoDB or empty response');
        }
        return [];
    } catch (error) {
        console.error('❌ Error loading volunteers from MongoDB:', error);
        return [];
    }
}

// Delete volunteer from MongoDB
async function deleteVolunteerFromMongoDB(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/volunteers/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('✅ Volunteer deleted from MongoDB');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting volunteer from MongoDB:', error);
        return false;
    }
}

// ============ YOUR ORIGINAL CODE (WITH MODIFICATIONS FOR BACKEND SYNC) ============

document.addEventListener("DOMContentLoaded", async () => {
  const page = document.body.dataset.page;
  if (page !== "manage-volunteers") return;

  console.log('📄 Admin Volunteers Page Loaded');

  // Load data from MongoDB first
  await loadVolunteersFromMongoDB();

  const listContainer = document.getElementById("adminVolunteersList");
  const searchInput = document.getElementById("volunteerSearchInput");
  const availabilityFilter = document.getElementById("volunteerAvailabilityFilter");
  const refreshBtn = document.getElementById("refreshVolunteersBtn");
  const exportBtn = document.getElementById("exportVolunteersBtn");

  const modal = document.getElementById("adminVolunteerModal");
  const modalContent = document.getElementById("adminVolunteerModalContent");
  const closeModalBtn = document.getElementById("closeAdminVolunteerModal");

  // Check if elements exist
  if (!listContainer) {
    console.error('❌ adminVolunteersList element not found!');
    return;
  }

  function getVolunteers() {
    return JSON.parse(localStorage.getItem("adoptme_volunteers")) || [];
  }

  function saveVolunteers(data) {
    localStorage.setItem("adoptme_volunteers", JSON.stringify(data));
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function updateStats(volunteers) {
    const totalEl = document.getElementById("adminVolunteerTotal");
    const verifiedEl = document.getElementById("adminVolunteerVerified");
    const weekendEl = document.getElementById("adminVolunteerWeekend");
    const animalCareEl = document.getElementById("adminVolunteerAnimalCare");
    
    if (totalEl) totalEl.textContent = volunteers.length;
    if (verifiedEl) verifiedEl.textContent = volunteers.filter(v =>
      (v.verificationStatus || "").toLowerCase().includes("verified")
    ).length;
    if (weekendEl) weekendEl.textContent = volunteers.filter(v =>
      (v.availability || "") === "Weekends"
    ).length;
    if (animalCareEl) animalCareEl.textContent = volunteers.filter(v =>
      (v.rolePreference || "") === "Animal Care"
    ).length;
    
    console.log(`📊 Stats updated: Total volunteers: ${volunteers.length}`);
  }

  function getFilteredVolunteers() {
    const volunteers = getVolunteers();
    const searchText = (searchInput?.value || "").trim().toLowerCase();
    const selectedAvailability = availabilityFilter?.value || "all";

    return volunteers.filter(item => {
      const matchesSearch =
        (item.name || "").toLowerCase().includes(searchText) ||
        (item.email || "").toLowerCase().includes(searchText) ||
        (item.phone || "").toLowerCase().includes(searchText) ||
        (item.city || "").toLowerCase().includes(searchText) ||
        (item.skills || "").toLowerCase().includes(searchText) ||
        (item.rolePreference || "").toLowerCase().includes(searchText) ||
        (item.availability || "").toLowerCase().includes(searchText) ||
        (item.emergencyContact || "").toLowerCase().includes(searchText) ||
        (item.volunteerId || "").toLowerCase().includes(searchText);

      const matchesAvailability =
        selectedAvailability === "all" || item.availability === selectedAvailability;

      return matchesSearch && matchesAvailability;
    });
  }

  function buildVolunteerIdCard(volunteer) {
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

          <p class="receipt-thankyou-text">
            Thank you for standing with rescued animals and the AdoptMe mission. 🐾
          </p>

          <div class="certificate-signatures">
            <div>
              <span>Founder Signature</span>
              <strong>Vishwakarma Ashish</strong>
              <small>Web Developer</small>
              <small>BCA Student</small>
              <div class="signature-name">Ashish</div>
            </div>
            <div>
              <span>Co-Founder Signature</span>
              <strong>Pardeshi Sujal</strong>
              <small>Full stack developer</small>
              <small>BCA Student</small>
              <div class="signature-name">Sujal</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function buildVolunteerPrintHTML(volunteer) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Volunteer ID</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f4e9d8;
            padding: 30px;
            margin: 0;
          }
          .volunteer-id-card {
            width: 100%;
            max-width: 900px;
            margin: auto;
            background: #fff;
            border: 8px solid #8B5E3C;
            border-radius: 24px;
            padding: 40px;
            text-align: center;
            color: #333;
            position: relative;
            overflow: hidden;
            box-sizing: border-box;
          }
          .certificate-watermark {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 78px;
            font-weight: 800;
            color: rgba(139, 94, 60, 0.06);
            transform: rotate(-24deg);
            pointer-events: none;
            z-index: 1;
          }
          .certificate-stamp {
            position: absolute;
            top: 24px;
            right: 24px;
            border: 3px solid #8B5E3C;
            color: #8B5E3C;
            padding: 10px 16px;
            border-radius: 50px;
            font-weight: 700;
            transform: rotate(-12deg);
            background: rgba(216, 195, 165, 0.2);
            z-index: 2;
          }
          .certificate-header,
          .certificate-subtitle,
          .certificate-body {
            position: relative;
            z-index: 2;
          }
          .certificate-header {
            font-size: 2.6rem;
            font-weight: 700;
            color: #8B5E3C;
            margin-bottom: 8px;
          }
          .certificate-subtitle {
            font-size: 1.1rem;
            color: #666;
            margin-bottom: 26px;
          }
          .certificate-body h2,
          .certificate-body h3 {
            color: #8B5E3C;
          }
          .certificate-details {
            margin: 26px 0;
            display: grid;
            gap: 10px;
            text-align: left;
          }
          .certificate-details div {
            background: #f8f5f1;
            padding: 10px 12px;
            border-radius: 10px;
          }
          .certificate-signatures {
            margin-top: 34px;
            display: flex;
            justify-content: space-between;
            gap: 30px;
          }
          .signature-name {
            font-family: "Brush Script MT", cursive;
            font-size: 1.5rem;
            color: #8B5E3C;
            margin-top: 10px;
          }
          .certificate-signatures strong,
          .certificate-signatures small {
            display: block;
            margin-top: 4px;
          }
          .receipt-thankyou-text {
            margin-top: 14px;
            font-weight: 700;
            color: #8B5E3C;
          }
        </style>
      </head>
      <body>
        ${buildVolunteerIdCard(volunteer)}
      </body>
      </html>
    `;
  }

  function renderVolunteers() {
    console.log('🎨 Rendering volunteers...');
    const volunteers = getVolunteers();
    const filtered = getFilteredVolunteers();

    console.log(`📋 Total volunteers: ${volunteers.length}, Filtered: ${filtered.length}`);

    updateStats(volunteers);

    if (filtered.length === 0) {
      listContainer.innerHTML = `<div class="list-item">No volunteer records found.</div>`;
      bindActions();
      return;
    }

    listContainer.innerHTML = filtered.slice().reverse().map(item => `
        <div class="list-item adoption-admin-card">
          <div class="adoption-admin-summary">
            <div>
              <h3>${escapeHtml(item.name || "Unknown Volunteer")}</h3>
              <p><strong>Email:</strong> ${escapeHtml(item.email || "-")}</p>
              <p><strong>Phone:</strong> ${escapeHtml(item.phone || "-")}</p>
              <p><strong>Volunteer ID:</strong> ${escapeHtml(item.volunteerId || "-")}</p>
              <p><strong>Role:</strong> ${escapeHtml(item.rolePreference || "-")}</p>
            </div>
            <div class="adoption-admin-meta">
              <span class="admin-status-badge success">${escapeHtml(item.verificationStatus || "Verified Registration Submitted")}</span>
              <small>${escapeHtml(item.createdAt || "-")}</small>
              <small>${escapeHtml(item.availability || "-")}</small>
            </div>
          </div>

          <div class="adoption-admin-tags">
            <span class="mini-tag">City: ${escapeHtml(item.city || "-")}</span>
            <span class="mini-tag">Skills: ${escapeHtml(item.skills || "-")}</span>
            <span class="mini-tag">Availability: ${escapeHtml(item.availability || "-")}</span>
          </div>

          <div class="adoption-admin-files">
            <span><strong>Emergency Contact:</strong> ${escapeHtml(item.emergencyContact || "-")}</span>
            <span><strong>Photo:</strong> ${escapeHtml(item.photoFileName || "Not uploaded")}</span>
          </div>

          <div class="adoption-admin-actions">
            <button class="btn btn-secondary btn-sm" data-view-id="${item.id}">View Details</button>
            <button class="btn btn-secondary btn-sm" data-preview-id="${item.id}">Preview ID</button>
            <button class="btn btn-secondary btn-sm" data-download-id="${item.id}">Download ID</button>
            <button class="btn btn-primary btn-sm" data-print-id="${item.id}">Print ID</button>
            <button class="btn btn-sm admin-reject-btn" data-delete-id="${item.id}">Delete</button>
          </div>
        </div>
      `).join("");

    bindActions();
  }

  function bindActions() {
    document.querySelectorAll("[data-view-id]").forEach(btn => {
      btn.removeEventListener("click", btn.clickHandler);
      btn.clickHandler = () => openVolunteerDetails(btn.dataset.viewId);
      btn.addEventListener("click", btn.clickHandler);
    });

    document.querySelectorAll("[data-preview-id]").forEach(btn => {
      btn.removeEventListener("click", btn.clickHandler);
      btn.clickHandler = () => previewVolunteerId(btn.dataset.previewId);
      btn.addEventListener("click", btn.clickHandler);
    });

    document.querySelectorAll("[data-download-id]").forEach(btn => {
      btn.removeEventListener("click", btn.clickHandler);
      btn.clickHandler = () => downloadVolunteerId(btn.dataset.downloadId);
      btn.addEventListener("click", btn.clickHandler);
    });

    document.querySelectorAll("[data-print-id]").forEach(btn => {
      btn.removeEventListener("click", btn.clickHandler);
      btn.clickHandler = () => printVolunteerId(btn.dataset.printId);
      btn.addEventListener("click", btn.clickHandler);
    });

    document.querySelectorAll("[data-delete-id]").forEach(btn => {
      btn.removeEventListener("click", btn.clickHandler);
      btn.clickHandler = () => deleteVolunteer(btn.dataset.deleteId);
      btn.addEventListener("click", btn.clickHandler);
    });
  }

  function findVolunteer(id) {
    return getVolunteers().find(item => String(item.id) === String(id));
  }

  function previewVolunteerId(id) {
    const volunteer = findVolunteer(id);
    if (!volunteer) return;

    modalContent.innerHTML = `
      <div class="admin-adoption-detail">
        <h2>Volunteer ID Preview</h2>
        ${buildVolunteerIdCard(volunteer)}
        <div class="admin-modal-actions mt-24">
          <button class="btn btn-secondary" id="modalVolunteerDownloadBtn">Download ID</button>
          <button class="btn btn-primary" id="modalVolunteerPrintBtn">Print ID</button>
          <button class="btn btn-secondary" id="modalVolunteerCloseBtn">Close</button>
        </div>
      </div>
    `;

    modal.classList.add("show");

    document.getElementById("modalVolunteerDownloadBtn").addEventListener("click", () => {
      downloadVolunteerId(id);
    });

    document.getElementById("modalVolunteerPrintBtn").addEventListener("click", () => {
      printVolunteerId(id);
    });

    document.getElementById("modalVolunteerCloseBtn").addEventListener("click", () => {
      modal.classList.remove("show");
    });
  }

  function openVolunteerDetails(id) {
    const item = findVolunteer(id);
    if (!item) return;

    modalContent.innerHTML = `
      <div class="admin-adoption-detail">
        <h2>Volunteer Details</h2>
        <p><strong>Volunteer Record ID:</strong> ${escapeHtml(item.id || "-")}</p>
        <p><strong>Volunteer ID:</strong> ${escapeHtml(item.volunteerId || "-")}</p>
        <p><strong>Status:</strong> <span class="admin-status-badge success">${escapeHtml(item.verificationStatus || "-")}</span></p>
        <p><strong>Registered:</strong> ${escapeHtml(item.createdAt || "-")}</p>

        <div class="admin-detail-grid">
          <div class="card">
            <h3>Volunteer Profile</h3>
            <p><strong>Name:</strong> ${escapeHtml(item.name || "-")}</p>
            <p><strong>Email:</strong> ${escapeHtml(item.email || "-")}</p>
            <p><strong>Phone:</strong> ${escapeHtml(item.phone || "-")}</p>
            <p><strong>City:</strong> ${escapeHtml(item.city || "-")}</p>
            <p><strong>Photo File:</strong> ${escapeHtml(item.photoFileName || "-")}</p>
          </div>

          <div class="card">
            <h3>Volunteer Role Details</h3>
            <p><strong>Skills:</strong> ${escapeHtml(item.skills || "-")}</p>
            <p><strong>Availability:</strong> ${escapeHtml(item.availability || "-")}</p>
            <p><strong>Preferred Role:</strong> ${escapeHtml(item.rolePreference || "-")}</p>
            <p><strong>Emergency Contact:</strong> ${escapeHtml(item.emergencyContact || "-")}</p>
          </div>
        </div>

        <div class="card mt-24">
          <h3>Volunteer Reason</h3>
          <p>${escapeHtml(item.reason || "-")}</p>
        </div>

        <div class="card mt-24">
          <h3>Consent & Verification</h3>
          <p><strong>Consent Accepted:</strong> ${item.consentAccepted ? "Yes" : "No"}</p>
          <p><strong>Verification Status:</strong> ${escapeHtml(item.verificationStatus || "-")}</p>
        </div>

        <div class="admin-modal-actions mt-24">
          <button class="btn btn-secondary" id="modalPreviewVolunteerIdBtn">Preview ID</button>
          <button class="btn btn-primary" id="modalPrintVolunteerIdBtn">Print ID</button>
          <button class="btn admin-reject-btn" id="modalDeleteVolunteerBtn">Delete</button>
          <button class="btn btn-secondary" id="modalVolunteerCloseBtn">Close</button>
        </div>
      </div>
    `;

    modal.classList.add("show");

    document.getElementById("modalPreviewVolunteerIdBtn").addEventListener("click", () => {
      previewVolunteerId(id);
    });

    document.getElementById("modalPrintVolunteerIdBtn").addEventListener("click", () => {
      printVolunteerId(id);
    });

    document.getElementById("modalDeleteVolunteerBtn").addEventListener("click", () => {
      deleteVolunteer(id);
      modal.classList.remove("show");
    });

    document.getElementById("modalVolunteerCloseBtn").addEventListener("click", () => {
      modal.classList.remove("show");
    });
  }

  function downloadVolunteerId(id) {
    const volunteer = findVolunteer(id);
    if (!volunteer) return;

    const blob = new Blob([buildVolunteerPrintHTML(volunteer)], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `adoptme-volunteer-id-${volunteer.volunteerId}.html`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function printVolunteerId(id) {
    const volunteer = findVolunteer(id);
    if (!volunteer) return;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(buildVolunteerPrintHTML(volunteer));
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  }

  async function deleteVolunteer(id) {
    const confirmed = confirm("Are you sure you want to delete this volunteer record?");
    if (!confirmed) return;

    const updated = getVolunteers().filter(item => String(item.id) !== String(id));
    saveVolunteers(updated);
    
    // Delete from MongoDB
    await deleteVolunteerFromMongoDB(id);
    
    renderVolunteers();
  }

  function exportCSV() {
    const rows = getFilteredVolunteers();
    if (!rows.length) {
      alert("No volunteer records available for export.");
      return;
    }

    const headers = [
      "Record ID",
      "Volunteer ID",
      "Name",
      "Email",
      "Phone",
      "City",
      "Skills",
      "Availability",
      "Role Preference",
      "Emergency Contact",
      "Photo File",
      "Consent Accepted",
      "Verification Status",
      "Created At"
    ];

    const csvRows = [
      headers.join(","),
      ...rows.map(item => [
        `"${item.id || ""}"`,
        `"${item.volunteerId || ""}"`,
        `"${item.name || ""}"`,
        `"${item.email || ""}"`,
        `"${item.phone || ""}"`,
        `"${item.city || ""}"`,
        `"${item.skills || ""}"`,
        `"${item.availability || ""}"`,
        `"${item.rolePreference || ""}"`,
        `"${item.emergencyContact || ""}"`,
        `"${item.photoFileName || ""}"`,
        `"${item.consentAccepted ? "Yes" : "No"}"`,
        `"${item.verificationStatus || ""}"`,
        `"${item.createdAt || ""}"`
      ].join(","))
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "adoptme-volunteers-export.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => modal.classList.remove("show"));
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("show");
    });
  }

  if (searchInput) searchInput.addEventListener("input", renderVolunteers);
  if (availabilityFilter) availabilityFilter.addEventListener("change", renderVolunteers);
  if (refreshBtn) refreshBtn.addEventListener("click", async () => {
    console.log('🔄 Refreshing volunteers from MongoDB...');
    await loadVolunteersFromMongoDB();
    renderVolunteers();
  });
  if (exportBtn) exportBtn.addEventListener("click", exportCSV);

  // Initial render
  renderVolunteers();
  console.log('✅ Admin Volunteers Page Initialized');
});