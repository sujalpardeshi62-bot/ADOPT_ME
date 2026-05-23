// ============ ADD THIS AT THE VERY TOP (MongoDB Connection) ============
const API_BASE_URL = 'http://localhost:5000/api';

// Save event to MongoDB
async function saveEventToMongoDB(eventData) {
    try {
        console.log('📤 Saving event to MongoDB:', eventData.title);
        const response = await fetch(`${API_BASE_URL}/events/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('✅ Event saved to MongoDB');
            return result.data;
        }
        return null;
    } catch (error) {
        console.error('Error saving event to MongoDB:', error);
        return null;
    }
}

// Load events from MongoDB
async function loadEventsFromMongoDB() {
    try {
        const response = await fetch(`${API_BASE_URL}/events/all`);
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            const formattedEvents = result.data.map(event => ({
                id: event._id,
                title: event.title,
                date: event.date,
                city: event.city,
                venue: event.venue,
                category: event.category,
                seats: event.seats,
                status: event.status,
                description: event.description
            }));
            
            localStorage.setItem("adoptme_events", JSON.stringify(formattedEvents));
            console.log(`✅ Loaded ${formattedEvents.length} events from MongoDB`);
            return formattedEvents;
        }
        return [];
    } catch (error) {
        console.error('Error loading events from MongoDB:', error);
        return [];
    }
}

// ============ NEW: Load registrations from MongoDB ============
async function loadRegistrationsFromMongoDB() {
    try {
        const response = await fetch(`${API_BASE_URL}/events/registrations/all`);
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            const formattedRegistrations = result.data.map(reg => ({
                id: reg._id,
                registrationId: reg.registrationId,
                userEmail: reg.userEmail,
                name: reg.name,
                email: reg.email,
                phone: reg.phone,
                city: reg.city,
                eventId: reg.eventId,
                eventTitle: reg.eventTitle,
                eventDate: reg.eventDate,
                eventVenue: reg.eventVenue,
                role: reg.role,
                note: reg.note,
                consentAccepted: reg.consentAccepted,
                status: reg.status || "Registered",
                createdAt: reg.createdAt
            }));
            
            localStorage.setItem("adoptme_event_registrations", JSON.stringify(formattedRegistrations));
            console.log(`✅ Loaded ${formattedRegistrations.length} registrations from MongoDB`);
            return formattedRegistrations;
        }
        return [];
    } catch (error) {
        console.error('Error loading registrations from MongoDB:', error);
        return [];
    }
}

// ============ NEW: Save alert to MongoDB ============
async function saveAlertToMongoDB(alertData) {
    try {
        console.log('🔔 Saving alert to MongoDB:', alertData.title);
        const response = await fetch(`${API_BASE_URL}/events/alerts/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alertData)
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('✅ Alert saved to MongoDB');
            return result.data;
        }
        return null;
    } catch (error) {
        console.error('Error saving alert to MongoDB:', error);
        return null;
    }
}

// ============ NEW: Load alerts from MongoDB ============
async function loadAlertsFromMongoDB() {
    try {
        const response = await fetch(`${API_BASE_URL}/events/alerts/all`);
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            const formattedAlerts = result.data.map(alert => ({
                id: alert._id,
                title: alert.title,
                message: alert.message,
                level: alert.level,
                createdAt: alert.createdAt
            }));
            
            localStorage.setItem("adoptme_event_alerts", JSON.stringify(formattedAlerts));
            console.log(`✅ Loaded ${formattedAlerts.length} alerts from MongoDB`);
            return formattedAlerts;
        }
        return [];
    } catch (error) {
        console.error('Error loading alerts from MongoDB:', error);
        return [];
    }
}

// ============ NEW: Delete registration from MongoDB ============
async function deleteRegistrationFromMongoDB(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/events/registrations/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('✅ Registration deleted from MongoDB');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting registration from MongoDB:', error);
        return false;
    }
}

// ============ NEW: Delete alert from MongoDB ============
async function deleteAlertFromMongoDB(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/events/alerts/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('✅ Alert deleted from MongoDB');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting alert from MongoDB:', error);
        return false;
    }
}

// ============ YOUR ORIGINAL CODE (EXACTLY THE SAME, WITH MINOR MODIFICATIONS) ============

document.addEventListener("DOMContentLoaded", async () => {
  const page = document.body.dataset.page;
  if (page !== "manage-events") return;

  // Load events, registrations, and alerts from MongoDB
  await loadEventsFromMongoDB();
  await loadRegistrationsFromMongoDB();
  await loadAlertsFromMongoDB();

  const adminEventForm = document.getElementById("adminEventForm");
  const adminEventAlertForm = document.getElementById("adminEventAlertForm");

  const eventsSearch = document.getElementById("eventsSearch");
  const eventsStatusFilter = document.getElementById("eventsStatusFilter");
  const refreshEventsBtn = document.getElementById("refreshEventsBtn");
  const exportEventsBtn = document.getElementById("exportEventsBtn");

  const adminEventsList = document.getElementById("adminEventsList");
  const adminEventAlertsList = document.getElementById("adminEventAlertsList");
  const adminEventRegistrationsList = document.getElementById("adminEventRegistrationsList");

  function getEvents() {
    return JSON.parse(localStorage.getItem("adoptme_events")) || [];
  }

  function saveEvents(data) {
    localStorage.setItem("adoptme_events", JSON.stringify(data));
  }

  function getAlerts() {
    return JSON.parse(localStorage.getItem("adoptme_event_alerts")) || [];
  }

  function saveAlerts(data) {
    localStorage.setItem("adoptme_event_alerts", JSON.stringify(data));
  }

  function getRegistrations() {
    return JSON.parse(localStorage.getItem("adoptme_event_registrations")) || [];
  }

  function saveRegistrations(data) {
    localStorage.setItem("adoptme_event_registrations", JSON.stringify(data));
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function updateStats() {
    const events = getEvents();
    const alerts = getAlerts();
    const registrations = getRegistrations();

    document.getElementById("adminEventsTotal").textContent = events.length;
    document.getElementById("adminEventAlertsTotal").textContent = alerts.length;
    document.getElementById("adminEventRegistrationsTotal").textContent = registrations.length;
    document.getElementById("adminUpcomingEventsTotal").textContent =
      events.filter(item => item.status === "Upcoming" || item.status === "Filling Fast").length;
  }

  function getFilteredEvents() {
    const events = getEvents();
    const query = (eventsSearch.value || "").trim().toLowerCase();
    const status = eventsStatusFilter.value;

    return events.filter(event => {
      const matchesSearch =
        (event.title || "").toLowerCase().includes(query) ||
        (event.city || "").toLowerCase().includes(query) ||
        (event.venue || "").toLowerCase().includes(query) ||
        (event.category || "").toLowerCase().includes(query);

      const matchesStatus = status === "all" || event.status === status;
      return matchesSearch && matchesStatus;
    });
  }

  function renderEvents() {
    const events = getFilteredEvents();

    adminEventsList.innerHTML = events.length
      ? events.slice().reverse().map(event => `
        <div class="list-item adoption-admin-card">
          <div class="adoption-admin-summary">
            <div>
              <h3>${escapeHtml(event.title)}</h3>
              <p><strong>Category:</strong> ${escapeHtml(event.category)}</p>
              <p><strong>City:</strong> ${escapeHtml(event.city)}</p>
              <p><strong>Venue:</strong> ${escapeHtml(event.venue)}</p>
            </div>

            <div class="adoption-admin-meta">
              <span class="admin-status-badge ${event.status === "Closed" ? "error" : event.status === "Filling Fast" ? "warning" : "success"}">
                ${escapeHtml(event.status)}
              </span>
              <small>${escapeHtml(event.date)}</small>
              <small>Seats: ${escapeHtml(event.seats)}</small>
            </div>
          </div>

          <div class="adoption-admin-tags">
            <span class="mini-tag">${escapeHtml(event.category)}</span>
            <span class="mini-tag">${escapeHtml(event.city)}</span>
          </div>

          <div class="adoption-admin-files">
            <span><strong>Description:</strong> ${escapeHtml(event.description)}</span>
          </div>

          <div class="adoption-admin-actions">
            <button class="btn btn-sm admin-reject-btn" data-delete-event="${event.id}">Delete</button>
          </div>
        </div>
      `).join("")
      : `<div class="list-item">No event records found.</div>`;

    document.querySelectorAll("[data-delete-event]").forEach(btn => {
      btn.addEventListener("click", () => deleteEvent(btn.dataset.deleteEvent));
    });
  }

  function renderAlerts() {
    const alerts = getAlerts();

    adminEventAlertsList.innerHTML = alerts.length
      ? alerts.slice().reverse().map((alert, index) => `
        <div class="list-item adoption-admin-card">
          <div class="adoption-admin-summary">
            <div>
              <h3>${escapeHtml(alert.title)}</h3>
              <p>${escapeHtml(alert.message)}</p>
            </div>
            <div class="adoption-admin-meta">
              <span class="admin-status-badge ${alert.level === "closed" ? "error" : alert.level === "filling" ? "warning" : "success"}">
                ${escapeHtml(alert.level)}
              </span>
            </div>
          </div>

          <div class="adoption-admin-actions">
            <button class="btn btn-sm admin-reject-btn" data-delete-alert="${index}">Delete</button>
          </div>
        </div>
      `).join("")
      : `<div class="list-item">No event alerts found.</div>`;

    document.querySelectorAll("[data-delete-alert]").forEach(btn => {
      btn.addEventListener("click", () => deleteAlert(btn.dataset.deleteAlert));
    });
  }

  function renderRegistrations() {
    const registrations = getRegistrations();
    const query = (eventsSearch.value || "").trim().toLowerCase();

    const filtered = registrations.filter(item =>
      (item.name || "").toLowerCase().includes(query) ||
      (item.email || "").toLowerCase().includes(query) ||
      (item.city || "").toLowerCase().includes(query) ||
      (item.eventTitle || "").toLowerCase().includes(query)
    );

    adminEventRegistrationsList.innerHTML = filtered.length
      ? filtered.slice().reverse().map(item => `
        <div class="list-item adoption-admin-card">
          <div class="adoption-admin-summary">
            <div>
              <h3>${escapeHtml(item.name)}</h3>
              <p><strong>Event:</strong> ${escapeHtml(item.eventTitle)}</p>
              <p><strong>Email:</strong> ${escapeHtml(item.email)}</p>
              <p><strong>Phone:</strong> ${escapeHtml(item.phone)}</p>
            </div>

            <div class="adoption-admin-meta">
              <span class="admin-status-badge success">${escapeHtml(item.status || "Registered")}</span>
              <small>${escapeHtml(item.createdAt)}</small>
              <small>${escapeHtml(item.role)}</small>
            </div>
          </div>

          <div class="adoption-admin-tags">
            <span class="mini-tag">${escapeHtml(item.city)}</span>
            <span class="mini-tag">${escapeHtml(item.role)}</span>
          </div>

          <div class="adoption-admin-files">
            <span><strong>Venue:</strong> ${escapeHtml(item.eventVenue || "-")}</span>
            <span><strong>Event Date:</strong> ${escapeHtml(item.eventDate || "-")}</span>
          </div>

          <div class="adoption-admin-actions">
            <button class="btn btn-sm admin-reject-btn" data-delete-registration="${item.id}">Delete</button>
          </div>
        </div>
      `).join("")
      : `<div class="list-item">No event registrations found.</div>`;

    document.querySelectorAll("[data-delete-registration]").forEach(btn => {
      btn.addEventListener("click", () => deleteRegistration(btn.dataset.deleteRegistration));
    });
  }

  async function deleteEvent(id) {
    const confirmDelete = confirm("Are you sure you want to delete this event?");
    if (!confirmDelete) return;

    const updated = getEvents().filter(item => String(item.id) !== String(id));
    saveEvents(updated);
    renderAll();
  }

  async function deleteAlert(index) {
    const alerts = getAlerts();
    const alertToDelete = alerts[index];
    alerts.splice(index, 1);
    saveAlerts(alerts);
    
    // Delete from MongoDB if it has an ID (MongoDB ID length > 20)
    if (alertToDelete.id && String(alertToDelete.id).length > 20) {
        await deleteAlertFromMongoDB(alertToDelete.id);
    }
    
    renderAll();
  }

  async function deleteRegistration(id) {
    const confirmDelete = confirm("Are you sure you want to delete this registration?");
    if (!confirmDelete) return;

    const updated = getRegistrations().filter(item => String(item.id) !== String(id));
    saveRegistrations(updated);
    
    // Delete from MongoDB if it's a MongoDB ID
    if (String(id).length > 20) {
        await deleteRegistrationFromMongoDB(id);
    }
    
    renderAll();
  }

  function exportCSV() {
    const rows = getRegistrations();
    if (!rows.length) {
      alert("No event registrations available for export.");
      return;
    }

    const headers = [
      "Registration ID",
      "Name",
      "Email",
      "Phone",
      "City",
      "Event Title",
      "Event Date",
      "Venue",
      "Role",
      "Status",
      "Created At"
    ];

    const csvRows = [
      headers.join(","),
      ...rows.map(item => [
        `"${item.registrationId || item.id || ""}"`,
        `"${item.name || ""}"`,
        `"${item.email || ""}"`,
        `"${item.phone || ""}"`,
        `"${item.city || ""}"`,
        `"${item.eventTitle || ""}"`,
        `"${item.eventDate || ""}"`,
        `"${item.eventVenue || ""}"`,
        `"${item.role || ""}"`,
        `"${item.status || ""}"`,
        `"${item.createdAt || ""}"`
      ].join(","))
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "adoptme-event-registrations-export.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function renderAll() {
    updateStats();
    renderEvents();
    renderAlerts();
    renderRegistrations();
  }

  if (adminEventForm) {
    adminEventForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const event = {
        id: "EVT-" + Date.now(),
        title: document.getElementById("adminEventTitle").value.trim(),
        category: document.getElementById("adminEventCategory").value,
        date: document.getElementById("adminEventDate").value,
        city: document.getElementById("adminEventCity").value.trim(),
        venue: document.getElementById("adminEventVenue").value.trim(),
        seats: document.getElementById("adminEventSeats").value,
        status: document.getElementById("adminEventStatus").value,
        description: document.getElementById("adminEventDescription").value.trim()
      };

      const events = getEvents();
      events.push(event);
      saveEvents(events);
      
      // Save to MongoDB
      await saveEventToMongoDB(event);

      showMessage("adminEventFormMessage", "New event created successfully.", "success");
      adminEventForm.reset();
      renderAll();
    });
  }

  if (adminEventAlertForm) {
    adminEventAlertForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const alert = {
        title: document.getElementById("adminAlertTitle").value.trim(),
        message: document.getElementById("adminAlertMessage").value.trim(),
        level: document.getElementById("adminAlertLevel").value
      };

      const alerts = getAlerts();
      alerts.push(alert);
      saveAlerts(alerts);
      
      // Save to MongoDB
      await saveAlertToMongoDB(alert);

      showMessage("adminAlertFormMessage", "Event alert published successfully.", "success");
      adminEventAlertForm.reset();
      renderAll();
    });
  }

  if (eventsSearch) eventsSearch.addEventListener("input", renderAll);
  if (eventsStatusFilter) eventsStatusFilter.addEventListener("change", renderAll);
  if (refreshEventsBtn) refreshEventsBtn.addEventListener("click", async () => {
    await loadEventsFromMongoDB();
    await loadRegistrationsFromMongoDB();
    await loadAlertsFromMongoDB();
    renderAll();
  });
  if (exportEventsBtn) exportEventsBtn.addEventListener("click", exportCSV);

  renderAll();
});

// Helper function for messages
function showMessage(elementId, text, type = "success") {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.textContent = text;
  element.className = `message ${type}`;
  setTimeout(() => {
    if (element) element.textContent = "";
  }, 3000);
}