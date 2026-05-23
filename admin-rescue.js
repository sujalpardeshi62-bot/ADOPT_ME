// ============ MongoDB Connection for Admin Rescue ============
const API_BASE_URL = 'http://localhost:5000/api';

// Load rescue requests from MongoDB
async function loadRescueRequestsFromMongoDB() {
    try {
        console.log('🔄 Loading rescue requests from MongoDB...');
        const response = await fetch(`${API_BASE_URL}/rescue/all`);
        const result = await response.json();
        
        console.log('📥 Response from server:', result);
        
        if (result.success && result.data && result.data.length > 0) {
            const formattedRequests = result.data.map(request => ({
                id: request._id,
                requestId: request.requestId,
                userEmail: request.userEmail,
                name: request.name,
                phone: request.phone,
                email: request.email,
                emergencyContactPerson: request.emergencyContactPerson,
                animalType: request.animalType,
                emergencyLevel: request.emergencyLevel,
                animalCondition: request.animalCondition,
                animalCount: request.animalCount,
                location: request.location,
                landmark: request.landmark,
                latitude: request.latitude,
                longitude: request.longitude,
                description: request.description,
                noticedAt: request.noticedAt,
                animalPhoto: request.animalPhoto,
                consentAccepted: request.consentAccepted,
                status: request.status || "Open",
                assignedTeam: request.assignedTeam || "Pending Assignment",
                createdAt: request.createdAt,
                updatedAt: request.updatedAt
            }));
            
            localStorage.setItem("adoptme_rescue_requests", JSON.stringify(formattedRequests));
            console.log(`✅ Loaded ${formattedRequests.length} rescue requests from MongoDB`);
            return formattedRequests;
        } else {
            console.log('⚠️ No rescue requests found in MongoDB or empty response');
        }
        return [];
    } catch (error) {
        console.error('❌ Error loading rescue requests from MongoDB:', error);
        return [];
    }
}

// Update rescue request status in MongoDB
async function updateRescueRequestStatusInMongoDB(id, status, assignedTeam) {
    try {
        const response = await fetch(`${API_BASE_URL}/rescue/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status, assignedTeam: assignedTeam })
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('✅ Rescue request status updated in MongoDB');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating rescue request status:', error);
        return false;
    }
}

// Delete rescue request from MongoDB
async function deleteRescueRequestFromMongoDB(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/rescue/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('✅ Rescue request deleted from MongoDB');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting rescue request:', error);
        return false;
    }
}

// ============ YOUR ORIGINAL CODE (WITH MODIFICATIONS FOR BACKEND SYNC) ============

document.addEventListener("DOMContentLoaded", async () => {
  const page = document.body.dataset.page;
  if (page !== "manage-rescue") return;

  console.log('📄 Admin Rescue Page Loaded');

  // Load data from MongoDB first
  await loadRescueRequestsFromMongoDB();

  const listContainer = document.getElementById("adminRescueList");
  const searchInput = document.getElementById("rescueSearch");
  const levelFilter = document.getElementById("rescueLevelFilter");
  const statusFilter = document.getElementById("rescueStatusFilter");
  const refreshBtn = document.getElementById("refreshRescueBtn");
  const exportBtn = document.getElementById("exportRescueBtn");

  const modal = document.getElementById("adminRescueModal");
  const modalContent = document.getElementById("adminRescueModalContent");
  const closeModalBtn = document.getElementById("closeAdminRescueModal");

  // Check if elements exist
  if (!listContainer) {
    console.error('❌ adminRescueList element not found!');
    return;
  }

  function getRescues() {
    return JSON.parse(localStorage.getItem("adoptme_rescue_requests")) || [];
  }

  function saveRescues(data) {
    localStorage.setItem("adoptme_rescue_requests", JSON.stringify(data));
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function updateStats(items) {
    const totalEl = document.getElementById("adminRescueTotal");
    const highEl = document.getElementById("adminRescueHigh");
    const progressEl = document.getElementById("adminRescueProgress");
    const closedEl = document.getElementById("adminRescueClosed");
    
    if (totalEl) totalEl.textContent = items.length;
    if (highEl) highEl.textContent = items.filter(item => item.emergencyLevel === "High").length;
    if (progressEl) progressEl.textContent = items.filter(item => item.status === "In Progress").length;
    if (closedEl) closedEl.textContent = items.filter(item => item.status === "Rescued" || item.status === "Closed").length;
    
    console.log(`📊 Stats updated: Total: ${items.length}`);
  }

  function levelBadgeClass(level) {
    const normalized = String(level || "").toLowerCase();
    if (normalized === "high") return "error";
    if (normalized === "medium") return "warning";
    return "success";
  }

  function statusBadgeClass(status) {
    if (status === "Rescued" || status === "Closed") return "success";
    if (status === "In Progress") return "warning";
    return "error";
  }

  function getFilteredRescues() {
    const items = getRescues();
    const searchText = (searchInput?.value || "").trim().toLowerCase();
    const selectedLevel = levelFilter?.value || "all";
    const selectedStatus = statusFilter?.value || "all";

    return items.filter(item => {
      const matchesSearch =
        (item.requestId || "").toLowerCase().includes(searchText) ||
        (item.name || "").toLowerCase().includes(searchText) ||
        (item.phone || "").toLowerCase().includes(searchText) ||
        (item.email || "").toLowerCase().includes(searchText) ||
        (item.location || "").toLowerCase().includes(searchText) ||
        (item.landmark || "").toLowerCase().includes(searchText) ||
        (item.animalType || "").toLowerCase().includes(searchText) ||
        (item.animalCondition || "").toLowerCase().includes(searchText) ||
        (item.description || "").toLowerCase().includes(searchText);

      const matchesLevel = selectedLevel === "all" || item.emergencyLevel === selectedLevel;
      const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;

      return matchesSearch && matchesLevel && matchesStatus;
    });
  }

  function renderRescues() {
    console.log('🎨 Rendering rescue requests...');
    const items = getRescues();
    const filtered = getFilteredRescues();

    console.log(`📋 Total items: ${items.length}, Filtered: ${filtered.length}`);

    updateStats(items);

    if (filtered.length === 0) {
      listContainer.innerHTML = `<div class="list-item">No rescue requests found.</div>`;
      bindActions();
      return;
    }

    listContainer.innerHTML = filtered.slice().reverse().map(item => `
        <div class="list-item adoption-admin-card">
          <div class="adoption-admin-summary">
            <div>
              <h3>${escapeHtml(item.animalType || "Emergency Rescue")}</h3>
              <p><strong>Request ID:</strong> ${escapeHtml(item.requestId || item.id)}</p>
              <p><strong>Rescuer:</strong> ${escapeHtml(item.name || "-")}</p>
              <p><strong>Phone:</strong> ${escapeHtml(item.phone || "-")}</p>
              <p><strong>Location:</strong> ${escapeHtml(item.location || "-")}</p>
            </div>

            <div class="adoption-admin-meta">
              <span class="admin-status-badge ${levelBadgeClass(item.emergencyLevel)}">${escapeHtml(item.emergencyLevel || "Emergency")}</span>
              <span class="admin-status-badge ${statusBadgeClass(item.status)}">${escapeHtml(item.status || "Open")}</span>
              <small>${escapeHtml(item.createdAt || "-")}</small>
            </div>
          </div>

          <div class="adoption-admin-tags">
            <span class="mini-tag">Condition: ${escapeHtml(item.animalCondition || "-")}</span>
            <span class="mini-tag">Count: ${escapeHtml(item.animalCount || "-")}</span>
            <span class="mini-tag">Landmark: ${escapeHtml(item.landmark || "-")}</span>
          </div>

          <div class="adoption-admin-files">
            <span><strong>Latitude:</strong> ${escapeHtml(item.latitude || "-")}</span>
            <span><strong>Longitude:</strong> ${escapeHtml(item.longitude || "-")}</span>
            <span><strong>Assigned Team:</strong> ${escapeHtml(item.assignedTeam || "Pending Assignment")}</span>
          </div>

          <div class="adoption-admin-actions">
            <button class="btn btn-secondary btn-sm" data-view-id="${item.id}">View Details</button>
            <button class="btn btn-primary btn-sm" data-progress-id="${item.id}">Mark In Progress</button>
            <button class="btn btn-secondary btn-sm" data-rescued-id="${item.id}">Mark Rescued</button>
            <button class="btn btn-sm admin-reject-btn" data-delete-id="${item.id}">Delete</button>
          </div>
        </div>
      `).join("");

    bindActions();
  }

  function bindActions() {
    document.querySelectorAll("[data-view-id]").forEach(btn => {
      btn.removeEventListener("click", btn.clickHandler);
      btn.clickHandler = () => openDetails(btn.dataset.viewId);
      btn.addEventListener("click", btn.clickHandler);
    });

    document.querySelectorAll("[data-progress-id]").forEach(btn => {
      btn.removeEventListener("click", btn.clickHandler);
      btn.clickHandler = () => updateStatus(btn.dataset.progressId, "In Progress");
      btn.addEventListener("click", btn.clickHandler);
    });

    document.querySelectorAll("[data-rescued-id]").forEach(btn => {
      btn.removeEventListener("click", btn.clickHandler);
      btn.clickHandler = () => updateStatus(btn.dataset.rescuedId, "Rescued");
      btn.addEventListener("click", btn.clickHandler);
    });

    document.querySelectorAll("[data-delete-id]").forEach(btn => {
      btn.removeEventListener("click", btn.clickHandler);
      btn.clickHandler = () => deleteRescue(btn.dataset.deleteId);
      btn.addEventListener("click", btn.clickHandler);
    });
  }

  async function updateStatus(id, newStatus) {
    console.log(`🔄 Updating status for ${id} to ${newStatus}`);
    const items = getRescues();
    const index = items.findIndex(item => String(item.id) === String(id));
    if (index === -1) return;

    items[index].status = newStatus;
    items[index].updatedAt = new Date().toLocaleString();

    let assignedTeam = items[index].assignedTeam;
    if (newStatus === "In Progress") assignedTeam = "AdoptMe Rescue Team Active";
    if (newStatus === "Rescued") assignedTeam = "Animal Secured";
    if (newStatus === "Closed") assignedTeam = "Case Closed";
    items[index].assignedTeam = assignedTeam;

    saveRescues(items);
    
    // Update in MongoDB
    await updateRescueRequestStatusInMongoDB(id, newStatus, assignedTeam);
    
    renderRescues();
  }

  async function deleteRescue(id) {
    const confirmed = confirm("Are you sure you want to delete this rescue request?");
    if (!confirmed) return;

    const updated = getRescues().filter(item => String(item.id) !== String(id));
    saveRescues(updated);
    
    // Delete from MongoDB
    await deleteRescueRequestFromMongoDB(id);
    
    renderRescues();
  }

  function openDetails(id) {
    const items = getRescues();
    const item = items.find(r => String(r.id) === String(id));
    if (!item) return;

    modalContent.innerHTML = `
      <div class="admin-adoption-detail">
        <h2>Emergency Rescue Details</h2>
        <p><strong>Request ID:</strong> ${escapeHtml(item.requestId || item.id)}</p>
        <p><strong>Status:</strong> <span class="admin-status-badge ${statusBadgeClass(item.status)}">${escapeHtml(item.status || "Open")}</span></p>
        <p><strong>Emergency Level:</strong> <span class="admin-status-badge ${levelBadgeClass(item.emergencyLevel)}">${escapeHtml(item.emergencyLevel || "-")}</span></p>
        <p><strong>Submitted:</strong> ${escapeHtml(item.createdAt || "-")}</p>
        <p><strong>Last Updated:</strong> ${escapeHtml(item.updatedAt || "Not updated yet")}</p>

        <div class="admin-detail-grid">
          <div class="card">
            <h3>Rescuer Information</h3>
            <p><strong>Name:</strong> ${escapeHtml(item.name || "-")}</p>
            <p><strong>Phone:</strong> ${escapeHtml(item.phone || "-")}</p>
            <p><strong>Email:</strong> ${escapeHtml(item.email || "-")}</p>
            <p><strong>Alternate Contact:</strong> ${escapeHtml(item.emergencyContactPerson || "-")}</p>
          </div>

          <div class="card">
            <h3>Animal Emergency Info</h3>
            <p><strong>Animal Type:</strong> ${escapeHtml(item.animalType || "-")}</p>
            <p><strong>Condition:</strong> ${escapeHtml(item.animalCondition || "-")}</p>
            <p><strong>Animal Count:</strong> ${escapeHtml(item.animalCount || "-")}</p>
            <p><strong>Noticed At:</strong> ${escapeHtml(item.noticedAt || "-")}</p>
          </div>
        </div>

        <div class="admin-detail-grid mt-24">
          <div class="card">
            <h3>Location Details</h3>
            <p><strong>Address:</strong> ${escapeHtml(item.location || "-")}</p>
            <p><strong>Landmark:</strong> ${escapeHtml(item.landmark || "-")}</p>
            <p><strong>Latitude:</strong> ${escapeHtml(item.latitude || "-")}</p>
            <p><strong>Longitude:</strong> ${escapeHtml(item.longitude || "-")}</p>
          </div>

          <div class="card">
            <h3>Response Tracking</h3>
            <p><strong>Status:</strong> ${escapeHtml(item.status || "Open")}</p>
            <p><strong>Assigned Team:</strong> ${escapeHtml(item.assignedTeam || "Pending Assignment")}</p>
            <p><strong>Consent Accepted:</strong> ${item.consentAccepted ? "Yes" : "No"}</p>
          </div>
        </div>

        <div class="card mt-24">
          <h3>Emergency Description</h3>
          <p>${escapeHtml(item.description || "-")}</p>
        </div>

        <div class="card mt-24">
          <h3>Rescue Proof Image</h3>
          ${
            item.animalPhoto
              ? `<img src="${item.animalPhoto}" alt="Animal rescue proof" style="max-width: 360px; width: 100%; border-radius: 14px; border: 1px solid rgba(139,94,60,0.12);" />`
              : `<p>No rescue image available.</p>`
          }
        </div>

        <div class="admin-modal-actions mt-24">
          <button class="btn btn-primary" id="modalRescueProgressBtn">Mark In Progress</button>
          <button class="btn btn-secondary" id="modalRescueDoneBtn">Mark Rescued</button>
          <button class="btn btn-secondary" id="modalRescueCloseCaseBtn">Mark Closed</button>
          <button class="btn admin-reject-btn" id="modalRescueDeleteBtn">Delete</button>
          <button class="btn btn-secondary" id="modalRescueCloseBtn">Close</button>
        </div>
      </div>
    `;

    modal.classList.add("show");

    document.getElementById("modalRescueProgressBtn").addEventListener("click", () => {
      updateStatus(id, "In Progress");
      modal.classList.remove("show");
    });

    document.getElementById("modalRescueDoneBtn").addEventListener("click", () => {
      updateStatus(id, "Rescued");
      modal.classList.remove("show");
    });

    document.getElementById("modalRescueCloseCaseBtn").addEventListener("click", () => {
      updateStatus(id, "Closed");
      modal.classList.remove("show");
    });

    document.getElementById("modalRescueDeleteBtn").addEventListener("click", () => {
      deleteRescue(id);
      modal.classList.remove("show");
    });

    document.getElementById("modalRescueCloseBtn").addEventListener("click", () => {
      modal.classList.remove("show");
    });
  }

  function exportCSV() {
    const rows = getFilteredRescues();
    if (!rows.length) {
      alert("No rescue records available for export.");
      return;
    }

    const headers = [
      "Request ID","Rescuer Name","Phone","Email","Alternate Contact","Animal Type",
      "Emergency Level","Condition","Animal Count","Location","Landmark","Latitude",
      "Longitude","Description","Noticed At","Status","Assigned Team","Consent Accepted",
      "Created At","Updated At"
    ];

    const csvRows = [
      headers.join(","),
      ...rows.map(item => [
        `"${item.requestId || item.id || ""}"`,
        `"${item.name || ""}"`,
        `"${item.phone || ""}"`,
        `"${item.email || ""}"`,
        `"${item.emergencyContactPerson || ""}"`,
        `"${item.animalType || ""}"`,
        `"${item.emergencyLevel || ""}"`,
        `"${item.animalCondition || ""}"`,
        `"${item.animalCount || ""}"`,
        `"${item.location || ""}"`,
        `"${item.landmark || ""}"`,
        `"${item.latitude || ""}"`,
        `"${item.longitude || ""}"`,
        `"${item.description || ""}"`,
        `"${item.noticedAt || ""}"`,
        `"${item.status || ""}"`,
        `"${item.assignedTeam || ""}"`,
        `"${item.consentAccepted ? "Yes" : "No"}"`,
        `"${item.createdAt || ""}"`,
        `"${item.updatedAt || ""}"`
      ].join(","))
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "adoptme-rescue-export.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (closeModalBtn) closeModalBtn.addEventListener("click", () => modal.classList.remove("show"));
  if (modal) modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("show"); });

  if (searchInput) searchInput.addEventListener("input", renderRescues);
  if (levelFilter) levelFilter.addEventListener("change", renderRescues);
  if (statusFilter) statusFilter.addEventListener("change", renderRescues);
  if (refreshBtn) refreshBtn.addEventListener("click", async () => {
    console.log('🔄 Refreshing data from MongoDB...');
    await loadRescueRequestsFromMongoDB();
    renderRescues();
  });
  if (exportBtn) exportBtn.addEventListener("click", exportCSV);

  // Initial render
  renderRescues();
  console.log('✅ Admin Rescue Page Initialized');
});