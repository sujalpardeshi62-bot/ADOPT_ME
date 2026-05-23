// ============ NEW: MongoDB Connection Functions ============
// These connect to your backend without affecting existing code

const API_BASE_URL = 'http://localhost:5000/api';

// New function to load data from MongoDB
async function loadAdoptionsFromBackend() {
    try {
        const response = await fetch(`${API_BASE_URL}/adoptions/all`);
        const result = await response.json();
        
        if (result.success && result.data) {
            // Convert backend data format to match your existing format
            const formattedData = result.data.map(adoption => ({
                id: adoption._id,
                _id: adoption._id,
                // Applicant Info (support both naming conventions)
                name: adoption.name || adoption.applicantName,
                applicantName: adoption.applicantName || adoption.name,
                email: adoption.email || adoption.applicantEmail,
                applicantEmail: adoption.applicantEmail || adoption.email,
                phone: adoption.phone || adoption.applicantPhone,
                applicantPhone: adoption.applicantPhone || adoption.phone,
                // Pet Info
                animalName: adoption.animalName || adoption.petName,
                petName: adoption.petName || adoption.animalName,
                animalId: adoption.animalId,
                // Status & Dates
                status: adoption.status || "Pending Review",
                createdAt: adoption.createdAt ? new Date(adoption.createdAt).toLocaleString() : adoption.applicationDate,
                applicationDate: adoption.applicationDate,
                reviewedAt: adoption.reviewedAt,
                // Personal Details
                dob: adoption.dob || "",
                gender: adoption.gender || "",
                occupation: adoption.occupation || "",
                // Citizenship & Identity
                citizenship: adoption.citizenship || "",
                idType: adoption.idType || "",
                idNumber: adoption.idNumber || "",
                aadhaarNumber: adoption.aadhaarNumber || "",
                // Address
                address: adoption.address || "",
                city: adoption.city || "",
                state: adoption.state || "",
                pincode: adoption.pincode || "",
                liveLocation: adoption.liveLocation || "",
                // Housing & Family
                livingType: adoption.livingType || "",
                ownership: adoption.ownership || "",
                yard: adoption.yard || "",
                otherPets: adoption.otherPets || "",
                familySupport: adoption.familySupport || "",
                livingSituation: adoption.livingSituation || "",
                hasOtherPets: adoption.hasOtherPets || false,
                // Adoption Readiness
                experience: adoption.experience || "",
                reason: adoption.reason || adoption.reasonForAdoption || "",
                reasonForAdoption: adoption.reasonForAdoption || adoption.reason || "",
                dailyCare: adoption.dailyCare || "",
                emergencyPlan: adoption.emergencyPlan || "",
                // Uploads
                photoFileName: adoption.photoFileName || "",
                documentFileName: adoption.documentFileName || "",
                // Consent
                consentAccepted: adoption.consentAccepted || false
            }));
            
            // Save to localStorage for existing functions to work
            localStorage.setItem("adoptme_adoptions", JSON.stringify(formattedData));
            return formattedData;
        }
        return [];
    } catch (error) {
        console.error('Error loading from backend:', error);
        // Fallback to localStorage if backend fails
        return JSON.parse(localStorage.getItem("adoptme_adoptions")) || [];
    }
}

// New function to save to MongoDB
async function saveAdoptionToBackend(adoptionData) {
    try {
        // Send the COMPLETE data object directly (no mapping needed)
        const response = await fetch(`${API_BASE_URL}/adoptions/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adoptionData)
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('✅ Adoption saved to MongoDB');
            return result.data;
        }
        return null;
    } catch (error) {
        console.error('Error saving to backend:', error);
        return null;
    }
}

// New function to update status in MongoDB
async function updateAdoptionStatusInBackend(id, newStatus) {
    try {
        const response = await fetch(`${API_BASE_URL}/adoptions/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('✅ Status updated in MongoDB');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating status:', error);
        return false;
    }
}

// New function to delete from MongoDB
async function deleteAdoptionFromBackend(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/adoptions/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('✅ Adoption deleted from MongoDB');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting:', error);
        return false;
    }
}

// ============ ORIGINAL FUNCTIONS (Preserved as-is) ============

function getApplications() {
    return JSON.parse(localStorage.getItem("adoptme_adoptions")) || [];
}

function saveApplications(data) {
    localStorage.setItem("adoptme_adoptions", JSON.stringify(data));
}

function updateStats(applications) {
    document.getElementById("adminAdoptionTotal").textContent = applications.length;
    document.getElementById("adminAdoptionPending").textContent = applications.filter(a => a.status === "Pending Review" || a.status === "Pending").length;
    document.getElementById("adminAdoptionApproved").textContent = applications.filter(a => a.status === "Approved").length;
    document.getElementById("adminAdoptionRejected").textContent = applications.filter(a => a.status === "Rejected").length;
}

function badgeClass(status) {
    if (status === "Approved") return "success";
    if (status === "Rejected") return "error";
    return "warning";
}

function getFilteredApplications() {
    const applications = getApplications();
    const searchText = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;

    return applications.filter(app => {
      const matchesSearch =
        (app.name || "").toLowerCase().includes(searchText) ||
        (app.email || "").toLowerCase().includes(searchText) ||
        (app.animalName || "").toLowerCase().includes(searchText) ||
        (app.city || "").toLowerCase().includes(searchText) ||
        (app.state || "").toLowerCase().includes(searchText) ||
        (app.idType || "").toLowerCase().includes(searchText) ||
        (app.aadhaarNumber || "").toLowerCase().includes(searchText);

      const matchesStatus = selectedStatus === "all" || app.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
}

function renderApplications() {
    const applications = getApplications();
    const filtered = getFilteredApplications();

    updateStats(applications);

    listContainer.innerHTML = filtered.length
      ? filtered.slice().reverse().map(app => `
        <div class="list-item adoption-admin-card">
          <div class="adoption-admin-summary">
            <div>
              <h3>${app.name || "Unknown Applicant"}</h3>
              <p><strong>Pet:</strong> ${app.animalName || "-"}</p>
              <p><strong>Email:</strong> ${app.email || "-"}</p>
              <p><strong>Phone:</strong> ${app.phone || "-"}</p>
              <p><strong>ID:</strong> ${app.idType || "-"} • ${app.idNumber || "-"}</p>
            </div>
            <div class="adoption-admin-meta">
              <span class="admin-status-badge ${badgeClass(app.status)}">${app.status || "Pending Review"}</span>
              <small>${app.createdAt || "-"}</small>
              <small>${app.citizenship || "-"}</small>
            </div>
          </div>

          <div class="adoption-admin-tags">
            <span class="mini-tag">Aadhaar: ${app.aadhaarNumber || "-"}</span>
            <span class="mini-tag">City: ${app.city || "-"}</span>
            <span class="mini-tag">State: ${app.state || "-"}</span>
            <span class="mini-tag">Pincode: ${app.pincode || "-"}</span>
          </div>

          <div class="adoption-admin-files">
            <span><strong>Live Location:</strong> ${app.liveLocation || "Not added"}</span>
            <span><strong>Photo:</strong> ${app.photoFileName || "Not uploaded"}</span>
            <span><strong>Document:</strong> ${app.documentFileName || "Not uploaded"}</span>
          </div>

          <div class="adoption-admin-actions">
            <button class="btn btn-secondary btn-sm" data-view-id="${app.id}">View Details</button>
            <button class="btn btn-primary btn-sm" data-approve-id="${app.id}">Approve</button>
            <button class="btn btn-sm admin-reject-btn" data-reject-id="${app.id}">Reject</button>
            <button class="btn btn-sm admin-reject-btn" data-delete-id="${app.id}">Delete</button>
          </div>
        </div>
      `).join("")
      : `<div class="list-item">No adoption applications found.</div>`;

    bindActions();
}

function bindActions() {
    document.querySelectorAll("[data-view-id]").forEach(btn => {
      btn.addEventListener("click", () => openDetails(btn.dataset.viewId));
    });

    document.querySelectorAll("[data-approve-id]").forEach(btn => {
      btn.addEventListener("click", () => updateStatus(btn.dataset.approveId, "Approved"));
    });

    document.querySelectorAll("[data-reject-id]").forEach(btn => {
      btn.addEventListener("click", () => updateStatus(btn.dataset.rejectId, "Rejected"));
    });

    document.querySelectorAll("[data-delete-id]").forEach(btn => {
      btn.addEventListener("click", () => deleteApplication(btn.dataset.deleteId));
    });
}

function deleteApplication(id) {
    const confirmed = confirm("Are you sure you want to delete this adoption record?");
    if (!confirmed) return;

    const updated = getApplications().filter(app => String(app.id) !== String(id));
    saveApplications(updated);
    
    // Delete from backend (if it's a MongoDB ID)
    if (String(id).length > 20) {
        deleteAdoptionFromBackend(id);
    }
    
    renderApplications();
}

function updateStatus(id, newStatus) {
    const applications = getApplications();
    const index = applications.findIndex(app => String(app.id) === String(id));
    if (index === -1) return;

    applications[index].status = newStatus;
    applications[index].reviewedAt = new Date().toLocaleString();

    saveApplications(applications);
    
    // Update backend (if it's a MongoDB ID)
    if (String(id).length > 20) {
        updateAdoptionStatusInBackend(id, newStatus);
    }
    
    renderApplications();
}

function openDetails(id) {
    const applications = getApplications();
    const app = applications.find(item => String(item.id) === String(id));
    if (!app) return;

    modalContent.innerHTML = `
      <div class="admin-adoption-detail">
        <h2>Verified Adoption Application</h2>
        <p><strong>Application ID:</strong> ${app.id || "-"}</p>
        <p><strong>Status:</strong> <span class="admin-status-badge ${badgeClass(app.status)}">${app.status || "-"}</span></p>
        <p><strong>Submitted:</strong> ${app.createdAt || "-"}</p>
        <p><strong>Reviewed:</strong> ${app.reviewedAt || "Not reviewed yet"}</p>

        <div class="admin-detail-grid">
          <div class="card">
            <h3>Applicant Profile</h3>
            <p><strong>Name:</strong> ${app.name || "-"}</p>
            <p><strong>Email:</strong> ${app.email || "-"}</p>
            <p><strong>Phone:</strong> ${app.phone || "-"}</p>
            <p><strong>DOB:</strong> ${app.dob || "-"}</p>
            <p><strong>Gender:</strong> ${app.gender || "-"}</p>
            <p><strong>Occupation:</strong> ${app.occupation || "-"}</p>
            <p><strong>Citizenship:</strong> ${app.citizenship || "-"}</p>
          </div>

          <div class="card">
            <h3>Identity & Address</h3>
            <p><strong>ID Type:</strong> ${app.idType || "-"}</p>
            <p><strong>ID Number:</strong> ${app.idNumber || "-"}</p>
            <p><strong>Aadhaar Number:</strong> ${app.aadhaarNumber || "-"}</p>
            <p><strong>Address:</strong> ${app.address || "-"}</p>
            <p><strong>City:</strong> ${app.city || "-"}</p>
            <p><strong>State:</strong> ${app.state || "-"}</p>
            <p><strong>Pincode:</strong> ${app.pincode || "-"}</p>
            <p><strong>Live Location:</strong> ${app.liveLocation || "-"}</p>
          </div>
        </div>

        <div class="admin-detail-grid mt-24">
          <div class="card">
            <h3>Housing & Family Readiness</h3>
            <p><strong>Selected Pet:</strong> ${app.animalName || "-"}</p>
            <p><strong>Living Type:</strong> ${app.livingType || "-"}</p>
            <p><strong>Ownership:</strong> ${app.ownership || "-"}</p>
            <p><strong>Has Yard:</strong> ${app.yard || "-"}</p>
            <p><strong>Other Pets:</strong> ${app.otherPets || "-"}</p>
            <p><strong>Family Support:</strong> ${app.familySupport || "-"}</p>
          </div>

          <div class="card">
            <h3>Commitment Details</h3>
            <p><strong>Experience:</strong><br>${app.experience || "-"}</p>
            <p><strong>Reason:</strong><br>${app.reason || "-"}</p>
            <p><strong>Daily Care Plan:</strong><br>${app.dailyCare || "-"}</p>
            <p><strong>Emergency Plan:</strong><br>${app.emergencyPlan || "-"}</p>
          </div>
        </div>

        <div class="card mt-24">
          <h3>Verification Uploads & Consent</h3>
          <p><strong>Profile Photo:</strong> ${app.photoFileName || "Not uploaded"}</p>
          <p><strong>ID Document:</strong> ${app.documentFileName || "Not uploaded"}</p>
          <p><strong>Consent Accepted:</strong> ${app.consentAccepted ? "Yes" : "No"}</p>
        </div>

        <div class="admin-modal-actions mt-24">
          <button class="btn btn-primary" id="modalApproveBtn">Approve</button>
          <button class="btn admin-reject-btn" id="modalRejectBtn">Reject</button>
          <button class="btn admin-reject-btn" id="modalDeleteBtn">Delete</button>
          <button class="btn btn-secondary" id="modalCloseBtn">Close</button>
        </div>
      </div>
    `;

    modal.classList.add("show");

    document.getElementById("modalApproveBtn").addEventListener("click", () => {
      updateStatus(id, "Approved");
      modal.classList.remove("show");
    });

    document.getElementById("modalRejectBtn").addEventListener("click", () => {
      updateStatus(id, "Rejected");
      modal.classList.remove("show");
    });

    document.getElementById("modalDeleteBtn").addEventListener("click", () => {
      deleteApplication(id);
      modal.classList.remove("show");
    });

    document.getElementById("modalCloseBtn").addEventListener("click", () => {
      modal.classList.remove("show");
    });
}

function exportCSV() {
    const rows = getFilteredApplications();
    if (!rows.length) {
      alert("No adoption applications available for export.");
      return;
    }

    const headers = [
      "Application ID",
      "Applicant Name",
      "Email",
      "Phone",
      "Pet Name",
      "Status",
      "Citizenship",
      "ID Type",
      "ID Number",
      "Aadhaar Number",
      "City",
      "State",
      "Pincode",
      "Live Location",
      "Photo File",
      "Document File",
      "Created At",
      "Reviewed At"
    ];

    const csvRows = [
      headers.join(","),
      ...rows.map(app => [
        `"${app.id || ""}"`,
        `"${app.name || ""}"`,
        `"${app.email || ""}"`,
        `"${app.phone || ""}"`,
        `"${app.animalName || ""}"`,
        `"${app.status || ""}"`,
        `"${app.citizenship || ""}"`,
        `"${app.idType || ""}"`,
        `"${app.idNumber || ""}"`,
        `"${app.aadhaarNumber || ""}"`,
        `"${app.city || ""}"`,
        `"${app.state || ""}"`,
        `"${app.pincode || ""}"`,
        `"${app.liveLocation || ""}"`,
        `"${app.photoFileName || ""}"`,
        `"${app.documentFileName || ""}"`,
        `"${app.createdAt || ""}"`,
        `"${app.reviewedAt || ""}"`
      ].join(","))
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "adoptme-adoptions-export.csv";
    link.click();
    URL.revokeObjectURL(url);
}

// ============ DOMContentLoaded ============

document.addEventListener("DOMContentLoaded", async () => {
  const page = document.body.dataset.page;
  if (page !== "manage-adoptions") return;

  // Make variables accessible to all functions
  window.listContainer = document.getElementById("adminAdoptionsList");
  window.searchInput = document.getElementById("adoptionSearch");
  window.statusFilter = document.getElementById("adoptionStatusFilter");
  const exportBtn = document.getElementById("exportAdoptionsBtn");
  const refreshBtn = document.getElementById("refreshAdoptionsBtn");

  window.modal = document.getElementById("adminAdoptionModal");
  window.modalContent = document.getElementById("adminAdoptionModalContent");
  const closeModalBtn = document.getElementById("closeAdminAdoptionModal");

  // NEW: Load data from backend on page load
  async function syncWithBackend() {
    try {
      const backendData = await loadAdoptionsFromBackend();
      if (backendData.length > 0) {
        console.log(`✅ Loaded ${backendData.length} adoptions from MongoDB`);
      }
      renderApplications();
    } catch (error) {
      console.error('Failed to sync with backend:', error);
      renderApplications();
    }
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => modal.classList.remove("show"));
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("show");
    });
  }

  searchInput.addEventListener("input", renderApplications);
  statusFilter.addEventListener("change", renderApplications);
  if (refreshBtn) refreshBtn.addEventListener("click", () => syncWithBackend());
  if (exportBtn) exportBtn.addEventListener("click", exportCSV);

  // Load from backend
  await syncWithBackend();
});