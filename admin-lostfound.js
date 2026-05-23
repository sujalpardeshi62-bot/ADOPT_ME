// ============ MongoDB Connection for Lost & Found ============
const API_BASE_URL = 'http://localhost:5000/api';

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
                status: report.status || "Open",
                verificationStatus: report.verificationStatus || "Pending",
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
                foundDate: report.foundDate,
                condition: report.condition,
                finderName: report.finderName,
                finderPhone: report.finderPhone,
                finderEmail: report.finderEmail,
                description: report.description,
                status: report.status || "Open",
                verificationStatus: report.verificationStatus || "Pending",
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

// Update lost report status in MongoDB
async function updateLostReportStatusInMongoDB(id, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/lost/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status })
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('✅ Lost report status updated in MongoDB');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating lost report status:', error);
        return false;
    }
}

// Update found report status in MongoDB
async function updateFoundReportStatusInMongoDB(id, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/found/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status })
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('✅ Found report status updated in MongoDB');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating found report status:', error);
        return false;
    }
}

// Delete lost report from MongoDB
async function deleteLostReportFromMongoDB(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/lost/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('✅ Lost report deleted from MongoDB');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting lost report:', error);
        return false;
    }
}

// Delete found report from MongoDB
async function deleteFoundReportFromMongoDB(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/found/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('✅ Found report deleted from MongoDB');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting found report:', error);
        return false;
    }
}

// ============ YOUR ORIGINAL CODE (WITH MODIFICATIONS FOR BACKEND SYNC) ============

document.addEventListener("DOMContentLoaded", async () => {
  const page = document.body.dataset.page;
  if (page !== "manage-lostfound") return;

  // Load data from MongoDB first
  await loadLostReportsFromMongoDB();
  await loadFoundReportsFromMongoDB();

  const listContainer = document.getElementById("adminLostFoundList");
  const searchInput = document.getElementById("lostFoundSearch");
  const typeFilter = document.getElementById("lostFoundTypeFilter");
  const statusFilter = document.getElementById("lostFoundStatusFilter");
  const refreshBtn = document.getElementById("refreshLostFoundBtn");
  const exportBtn = document.getElementById("exportLostFoundBtn");

  const modal = document.getElementById("adminLostFoundModal");
  const modalContent = document.getElementById("adminLostFoundModalContent");
  const closeModalBtn = document.getElementById("closeAdminLostFoundModal");

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

  function normalize(text) {
    return String(text || "").trim().toLowerCase();
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function lostFoundMatch(lost, found) {
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

  function getCombinedReports() {
    const lost = getLostReports().map(item => ({ ...item, entryType: "Lost" }));
    const found = getFoundReports().map(item => ({ ...item, entryType: "Found" }));
    return [...lost, ...found];
  }

  function updateStats() {
    const lost = getLostReports();
    const found = getFoundReports();
    const combined = [...lost, ...found];

    document.getElementById("adminLostFoundTotal").textContent = combined.length;
    document.getElementById("adminLostCount").textContent = lost.length;
    document.getElementById("adminFoundCount").textContent = found.length;
    document.getElementById("adminLostFoundClosed").textContent =
      combined.filter(item => item.status === "Reunited" || item.status === "Closed").length;
  }

  function getFilteredReports() {
    const reports = getCombinedReports();
    const searchText = normalize(searchInput.value);
    const selectedType = typeFilter.value;
    const selectedStatus = statusFilter.value;

    return reports.filter(item => {
      const searchable =
        normalize(item.reportId) + " " +
        normalize(item.petName) + " " +
        normalize(item.ownerName) + " " +
        normalize(item.finderName) + " " +
        normalize(item.species) + " " +
        normalize(item.breed) + " " +
        normalize(item.color) + " " +
        normalize(item.city) + " " +
        normalize(item.location) + " " +
        normalize(item.status);

      const matchesSearch = searchable.includes(searchText);
      const matchesType = selectedType === "all" || item.entryType === selectedType;
      const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }

  function badgeClass(type) {
    return type === "Lost" ? "error" : "success";
  }

  function renderReports() {
    updateStats();
    const reports = getFilteredReports();

    listContainer.innerHTML = reports.length
      ? reports
          .slice()
          .reverse()
.map(item => `
  <div class="list-item adoption-admin-card">
    <div class="adoption-admin-summary">
      <div class="lostfound-admin-inline">
        ${
          item.petPhoto
            ? `<img src="${item.petPhoto}" alt="Pet photo" class="lostfound-admin-photo-thumb" />`
            : ""
        }

        <div>
          <h3>${escapeHtml(item.petName || item.species || "Pet Report")}</h3>
          <p><strong>Report ID:</strong> ${escapeHtml(item.reportId || item.id)}</p>
          <p><strong>Species:</strong> ${escapeHtml(item.species || "-")}</p>
          <p><strong>Breed:</strong> ${escapeHtml(item.breed || "-")}</p>
          <p><strong>Color:</strong> ${escapeHtml(item.color || "-")}</p>
          <p><strong>City:</strong> ${escapeHtml(item.city || "-")}</p>
          <p><strong>Location:</strong> ${escapeHtml(item.location || "-")}</p>
        </div>
      </div>

      <div class="adoption-admin-meta">
        <span class="lostfound-admin-badge ${String(item.entryType || "").toLowerCase()}">${escapeHtml(item.entryType)}</span>
        <span class="admin-status-badge warning">${escapeHtml(item.status || "-")}</span>
        <small>${escapeHtml(item.createdAt || "-")}</small>
      </div>
    </div>

    <div class="adoption-admin-tags">
      <span class="mini-tag">Gender: ${escapeHtml(item.gender || "-")}</span>
      <span class="mini-tag">Unique Mark: ${escapeHtml(item.uniqueMark || "-")}</span>
      <span class="mini-tag">Verification: ${escapeHtml(item.verificationStatus || "-")}</span>
    </div>

    <div class="adoption-admin-files">
      <span><strong>Owner:</strong> ${escapeHtml(item.ownerName || "-")}</span>
      <span><strong>Finder:</strong> ${escapeHtml(item.finderName || "-")}</span>
      <span><strong>Coordinates:</strong> ${escapeHtml(item.latitude || "-")}, ${escapeHtml(item.longitude || "-")}</span>
    </div>

    <div class="adoption-admin-actions">
      <button class="btn btn-secondary btn-sm" data-view-id="${item.id}" data-type="${item.entryType}">View Details</button>
      <button class="btn btn-primary btn-sm" data-match-id="${item.id}" data-type="${item.entryType}">Mark Possible Match</button>
      <button class="btn btn-secondary btn-sm" data-reunited-id="${item.id}" data-type="${item.entryType}">Mark Reunited</button>
      <button class="btn btn-sm admin-reject-btn" data-delete-id="${item.id}" data-type="${item.entryType}">Delete</button>
    </div>
  </div>
`)
          .join("")
      : `<div class="list-item">No lost or found records found.</div>`;

    bindActions();
  }

  async function updateStatus(id, type, status) {
    if (type === "Lost") {
      const items = getLostReports();
      const index = items.findIndex(item => String(item.id) === String(id));
      if (index === -1) return;
      items[index].status = status;
      items[index].updatedAt = new Date().toLocaleString();
      saveLostReports(items);
      
      // Update in MongoDB
      await updateLostReportStatusInMongoDB(id, status);
    } else {
      const items = getFoundReports();
      const index = items.findIndex(item => String(item.id) === String(id));
      if (index === -1) return;
      items[index].status = status;
      items[index].updatedAt = new Date().toLocaleString();
      saveFoundReports(items);
      
      // Update in MongoDB
      await updateFoundReportStatusInMongoDB(id, status);
    }

    renderReports();
  }

  async function deleteReport(id, type) {
    const confirmDelete = confirm("Are you sure you want to delete this record?");
    if (!confirmDelete) return;

    if (type === "Lost") {
      const updated = getLostReports().filter(item => String(item.id) !== String(id));
      saveLostReports(updated);
      await deleteLostReportFromMongoDB(id);
    } else {
      const updated = getFoundReports().filter(item => String(item.id) !== String(id));
      saveFoundReports(updated);
      await deleteFoundReportFromMongoDB(id);
    }

    renderReports();
  }

  function getPossibleMatchesForRecord(item) {
    if (item.entryType === "Lost") {
      return getFoundReports().filter(found => lostFoundMatch(item, found));
    }
    return getLostReports().filter(lost => lostFoundMatch(lost, item));
  }

  function openDetails(id, type) {
    const item =
      type === "Lost"
        ? getLostReports().find(report => String(report.id) === String(id))
        : getFoundReports().find(report => String(report.id) === String(id));

    if (!item) return;

    const entryType = type;
    const possibleMatches = getPossibleMatchesForRecord({ ...item, entryType });

    modalContent.innerHTML = `
      <div class="admin-adoption-detail">
        <h2>${entryType} Pet Report Details</h2>
        <p><strong>Report ID:</strong> ${escapeHtml(item.reportId || item.id)}</p>
        <p><strong>Type:</strong> <span class="admin-status-badge ${badgeClass(entryType)}">${escapeHtml(entryType)}</span></p>
        <p><strong>Status:</strong> <span class="admin-status-badge warning">${escapeHtml(item.status || "-")}</span></p>
        <p><strong>Created At:</strong> ${escapeHtml(item.createdAt || "-")}</p>
        <p><strong>Updated At:</strong> ${escapeHtml(item.updatedAt || "Not updated yet")}</p>

        <div class="admin-detail-grid">
          <div class="card">
            <h3>Contact Information</h3>
            <p><strong>Owner Name:</strong> ${escapeHtml(item.ownerName || "-")}</p>
            <p><strong>Owner Phone:</strong> ${escapeHtml(item.ownerPhone || "-")}</p>
            <p><strong>Owner Email:</strong> ${escapeHtml(item.ownerEmail || "-")}</p>
            <p><strong>Finder Name:</strong> ${escapeHtml(item.finderName || "-")}</p>
            <p><strong>Finder Phone:</strong> ${escapeHtml(item.finderPhone || "-")}</p>
            <p><strong>Finder Email:</strong> ${escapeHtml(item.finderEmail || "-")}</p>
          </div>

          <div class="card">
            <h3>Pet Details</h3>
            <p><strong>Pet Name:</strong> ${escapeHtml(item.petName || "-")}</p>
            <p><strong>Species:</strong> ${escapeHtml(item.species || "-")}</p>
            <p><strong>Breed:</strong> ${escapeHtml(item.breed || "-")}</p>
            <p><strong>Color:</strong> ${escapeHtml(item.color || "-")}</p>
            <p><strong>Gender:</strong> ${escapeHtml(item.gender || "-")}</p>
            <p><strong>Age:</strong> ${escapeHtml(item.age || "-")}</p>
            <p><strong>Unique Mark:</strong> ${escapeHtml(item.uniqueMark || "-")}</p>
          </div>
        </div>

        <div class="admin-detail-grid mt-24">
          <div class="card">
  <h3>Location & Report Info</h3>
  <p><strong>City:</strong> ${escapeHtml(item.city || "-")}</p>
  <p><strong>Location:</strong> ${escapeHtml(item.location || "-")}</p>

  <div class="lostfound-coordinates-box">
    <p><strong>Latitude:</strong> ${escapeHtml(item.latitude || "-")}</p>
    <p><strong>Longitude:</strong> ${escapeHtml(item.longitude || "-")}</p>
  </div>

  <p><strong>Lost Date:</strong> ${escapeHtml(item.lostDate || "-")}</p>
  <p><strong>Found Date:</strong> ${escapeHtml(item.foundDate || "-")}</p>
  <p><strong>Condition:</strong> ${escapeHtml(item.condition || "-")}</p>
  <p><strong>Verification:</strong> ${escapeHtml(item.verificationStatus || "-")}</p>
</div>
          <div class="card">
            <h3>Possible Match Summary</h3>
            <p><strong>Total Matches:</strong> ${possibleMatches.length}</p>
            ${
  possibleMatches.length
    ? possibleMatches
        .slice(0, 5)
        .map(match => `
          <div class="lostfound-match-item">
            <p><strong>${escapeHtml(match.reportId || match.id)}</strong></p>
            <p>${escapeHtml(match.species || "-")} • ${escapeHtml(match.breed || "-")} • ${escapeHtml(match.color || "-")}</p>
            <p>${escapeHtml(match.city || "-")} • ${escapeHtml(match.location || "-")}</p>
          </div>
        `)
        .join("")
    : `<p>No possible matches found yet.</p>`
}

          </div>
        </div>

<div class="card mt-24">
  <h3>Pet Photo</h3>
  ${
    item.petPhoto
      ? `<img src="${item.petPhoto}" alt="Pet proof" class="lostfound-modal-photo" />`
      : `<p>No pet photo available.</p>`
  }
</div>

        <div class="card mt-24">
          <h3>Description</h3>
          <p>${escapeHtml(item.description || "-")}</p>
        </div>

        <div class="admin-modal-actions mt-24">
          <button class="btn btn-primary" id="modalMatchBtn">Mark Possible Match</button>
          <button class="btn btn-secondary" id="modalReunitedBtn">Mark Reunited</button>
          <button class="btn btn-secondary" id="modalClosedBtn">Mark Closed</button>
          <button class="btn admin-reject-btn" id="modalDeleteBtn">Delete</button>
          <button class="btn btn-secondary" id="modalCloseBtn">Close</button>
        </div>
      </div>
    `;

    modal.classList.add("show");

    document.getElementById("modalMatchBtn").addEventListener("click", () => {
      updateStatus(id, type, "Possible Match");
      modal.classList.remove("show");
    });

    document.getElementById("modalReunitedBtn").addEventListener("click", () => {
      updateStatus(id, type, "Reunited");
      modal.classList.remove("show");
    });

    document.getElementById("modalClosedBtn").addEventListener("click", () => {
      updateStatus(id, type, "Closed");
      modal.classList.remove("show");
    });

    document.getElementById("modalDeleteBtn").addEventListener("click", () => {
      deleteReport(id, type);
      modal.classList.remove("show");
    });

    document.getElementById("modalCloseBtn").addEventListener("click", () => {
      modal.classList.remove("show");
    });
  }

  function bindActions() {
    document.querySelectorAll("[data-view-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        openDetails(btn.dataset.viewId, btn.dataset.type);
      });
    });

    document.querySelectorAll("[data-match-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        updateStatus(btn.dataset.matchId, btn.dataset.type, "Possible Match");
      });
    });

    document.querySelectorAll("[data-reunited-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        updateStatus(btn.dataset.reunitedId, btn.dataset.type, "Reunited");
      });
    });

    document.querySelectorAll("[data-delete-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        deleteReport(btn.dataset.deleteId, btn.dataset.type);
      });
    });
  }

  function exportCSV() {
    const rows = getFilteredReports();
    if (!rows.length) {
      alert("No lost or found records available for export.");
      return;
    }

    const headers = [
      "Report ID",
      "Type",
      "Pet Name",
      "Owner Name",
      "Owner Phone",
      "Owner Email",
      "Finder Name",
      "Finder Phone",
      "Finder Email",
      "Species",
      "Breed",
      "Color",
      "Gender",
      "Age",
      "Unique Mark",
      "City",
      "Location",
      "Latitude",
      "Longitude",
      "Lost Date",
      "Found Date",
      "Condition",
      "Status",
      "Verification Status",
      "Created At",
      "Updated At"
    ];

    const csvRows = [
      headers.join(","),
      ...rows.map(item => [
        `"${item.reportId || item.id || ""}"`,
        `"${item.entryType || ""}"`,
        `"${item.petName || ""}"`,
        `"${item.ownerName || ""}"`,
        `"${item.ownerPhone || ""}"`,
        `"${item.ownerEmail || ""}"`,
        `"${item.finderName || ""}"`,
        `"${item.finderPhone || ""}"`,
        `"${item.finderEmail || ""}"`,
        `"${item.species || ""}"`,
        `"${item.breed || ""}"`,
        `"${item.color || ""}"`,
        `"${item.gender || ""}"`,
        `"${item.age || ""}"`,
        `"${item.uniqueMark || ""}"`,
        `"${item.city || ""}"`,
        `"${item.location || ""}"`,
        `"${item.latitude || ""}"`,
        `"${item.longitude || ""}"`,
        `"${item.lostDate || ""}"`,
        `"${item.foundDate || ""}"`,
        `"${item.condition || ""}"`,
        `"${item.status || ""}"`,
        `"${item.verificationStatus || ""}"`,
        `"${item.createdAt || ""}"`,
        `"${item.updatedAt || ""}"`
      ].join(","))
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "adoptme-lost-found-export.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (searchInput) searchInput.addEventListener("input", renderReports);
  if (typeFilter) typeFilter.addEventListener("change", renderReports);
  if (statusFilter) statusFilter.addEventListener("change", renderReports);
  if (refreshBtn) refreshBtn.addEventListener("click", async () => {
    await loadLostReportsFromMongoDB();
    await loadFoundReportsFromMongoDB();
    renderReports();
  });
  if (exportBtn) exportBtn.addEventListener("click", exportCSV);

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      modal.classList.remove("show");
    });
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("show");
    });
  }

  renderReports();
});