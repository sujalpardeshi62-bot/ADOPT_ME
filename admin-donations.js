// ============ ADD THIS AT THE VERY TOP (MongoDB Connection) ============
const API_BASE_URL = 'http://localhost:5000/api';

// Load donations from MongoDB and save to localStorage
async function loadDonationsFromMongoDB() {
    try {
        const response = await fetch(`${API_BASE_URL}/donations/all`);
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            // Convert MongoDB data to match your existing format
            const formattedData = result.data.map(donation => ({
                id: donation._id,
                name: donation.name || donation.donorName,
                email: donation.email || donation.donorEmail,
                phone: donation.phone || donation.donorPhone,
                city: donation.city,
                location: donation.location,
                amount: donation.amount,
                type: donation.type || "Donation",
                paymentMethod: donation.paymentMethod,
                upiApp: donation.upiApp,
                upiRedirected: donation.upiRedirected,
                paymentVerified: donation.paymentVerified,
                emailVerified: donation.emailVerified,
                phoneVerified: donation.phoneVerified,
                consent: donation.consent,
                note: donation.note,
                bankName: donation.bankName,
                bankAccount: donation.bankAccount,
                beneficiary: donation.beneficiary,
                cardNumber: donation.cardNumber,
                cardName: donation.cardName,
                cardExpiry: donation.cardExpiry,
                walletProvider: donation.walletProvider,
                walletMobile: donation.walletMobile,
                netBankingUserId: donation.netBankingUserId,
                transactionAuthorized: donation.transactionAuthorized,
                createdAt: donation.createdAt,
                status: donation.status
            }));
            
            // Save to localStorage so your existing code can read it
            localStorage.setItem("adoptme_donations", JSON.stringify(formattedData));
            console.log(`✅ Loaded ${formattedData.length} donations from MongoDB`);
        }
        return true;
    } catch (error) {
        console.error('Error loading from MongoDB:', error);
        return false;
    }
}

// ============ YOUR ORIGINAL CODE (EXACTLY THE SAME, NO CHANGES) ============

document.addEventListener("DOMContentLoaded", async () => {
  // FIRST: Load data from MongoDB before rendering
  await loadDonationsFromMongoDB();
  
  const page = document.body.dataset.page;
  if (page !== "manage-donations") return;

  const listContainer = document.getElementById("adminDonationsList");
  const searchInput = document.getElementById("donationSearch");
  const typeFilter = document.getElementById("donationTypeFilter");
  const exportBtn = document.getElementById("exportDonationsBtn");
  const refreshBtn = document.getElementById("refreshDonationsBtn");

  const modal = document.getElementById("adminDonationModal");
  const modalContent = document.getElementById("adminDonationModalContent");
  const closeModalBtn = document.getElementById("closeAdminDonationModal");

  function getDonations() {
    return JSON.parse(localStorage.getItem("adoptme_donations")) || [];
  }

  function saveDonations(data) {
    localStorage.setItem("adoptme_donations", JSON.stringify(data));
  }

  function updateStats(donations) {
    const total = donations.length;
    const totalAmount = donations.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const upiCount = donations.filter(item => item.paymentMethod === "UPI").length;
    const monthlyCount = donations.filter(item => item.type === "Monthly").length;

    const totalEl = document.getElementById("adminDonationTotal");
    const amountEl = document.getElementById("adminDonationAmount");
    const upiEl = document.getElementById("adminDonationUPI");
    const monthlyEl = document.getElementById("adminDonationMonthly");

    if (totalEl) totalEl.textContent = total;
    if (amountEl) amountEl.textContent = `₹${totalAmount}`;
    if (upiEl) upiEl.textContent = upiCount;
    if (monthlyEl) monthlyEl.textContent = monthlyCount;
  }

  function getFilteredDonations() {
    const donations = getDonations();
    const searchText = searchInput.value.trim().toLowerCase();
    const selectedType = typeFilter.value;

    return donations.filter(item => {
      const matchesSearch =
        (item.name || "").toLowerCase().includes(searchText) ||
        (item.email || "").toLowerCase().includes(searchText) ||
        (item.city || "").toLowerCase().includes(searchText) ||
        (item.paymentMethod || "").toLowerCase().includes(searchText) ||
        (item.type || "").toLowerCase().includes(searchText) ||
        (item.upiApp || "").toLowerCase().includes(searchText) ||
        (item.walletProvider || "").toLowerCase().includes(searchText) ||
        (item.bankName || "").toLowerCase().includes(searchText);

      const matchesType = selectedType === "all" || item.type === selectedType;
      return matchesSearch && matchesType;
    });
  }

  function paymentBadge(item) {
    return item.paymentVerified
      ? `<span class="payment-verified-box">Payment Verified</span>`
      : `<span class="payment-pending-box">Payment Pending</span>`;
  }

  function authBlock(item) {
    return `
      <div class="auth-status-grid">
        <div class="auth-status-card">
          <strong>Email</strong>
          <span>${item.emailVerified ? "Verified" : "Pending"}</span>
        </div>
        <div class="auth-status-card">
          <strong>Phone</strong>
          <span>${item.phoneVerified ? "Verified" : "Pending"}</span>
        </div>
        <div class="auth-status-card">
          <strong>Auth</strong>
          <span>${item.transactionAuthorized ? "Authorized" : "Not Authorized"}</span>
        </div>
      </div>
    `;
  }

  function renderDonations() {
    const donations = getDonations();
    const filtered = getFilteredDonations();

    updateStats(donations);

    if (!listContainer) return;

    listContainer.innerHTML = filtered.length
      ? filtered.slice().reverse().map(item => `
        <div class="list-item adoption-admin-card donation-summary-card">
          <div class="adoption-admin-summary">
            <div>
              <h3>${item.name || "Unknown Donor"}</h3>
              <p><strong>Email:</strong> ${item.email || "-"}</p>
              <p><strong>Phone:</strong> ${item.phone || "-"}</p>
              <p><strong>City:</strong> ${item.city || "-"}</p>
              <p><strong>Live Location:</strong> ${item.location || "-"}</p>
            </div>

            <div class="adoption-admin-meta">
              ${paymentBadge(item)}
              <small>${item.createdAt || "-"}</small>
              <small>${item.paymentMethod || "-"}</small>
            </div>
          </div>

          <div class="adoption-admin-tags">
            <span class="mini-tag">Amount: ₹${item.amount || 0}</span>
            <span class="mini-tag">Type: ${item.type || "-"}</span>
            <span class="mini-tag">Method: ${item.paymentMethod || "-"}</span>
            <span class="mini-tag">UPI App: ${item.upiApp || "-"}</span>
          </div>

          <div class="adoption-admin-files">
            <span><strong>Email Verified:</strong> ${item.emailVerified ? "Yes" : "No"}</span>
            <span><strong>Phone Verified:</strong> ${item.phoneVerified ? "Yes" : "No"}</span>
            <span><strong>Authorized:</strong> ${item.transactionAuthorized ? "Yes" : "No"}</span>
          </div>

          <div class="adoption-admin-actions">
            <button class="btn btn-secondary btn-sm" data-view-id="${item.id}">View Details</button>
            <button class="btn btn-sm admin-reject-btn" data-delete-id="${item.id}">Delete</button>
          </div>
        </div>
      `).join("")
      : `<div class="list-item">No donation records found.</div>`;

    bindActions();
  }

  function bindActions() {
    document.querySelectorAll("[data-view-id]").forEach(btn => {
      btn.addEventListener("click", () => openDonationDetails(btn.dataset.viewId));
    });

    document.querySelectorAll("[data-delete-id]").forEach(btn => {
      btn.addEventListener("click", () => deleteDonation(btn.dataset.deleteId));
    });
  }

  function deleteDonation(id) {
    const confirmed = confirm("Are you sure you want to delete this donation record?");
    if (!confirmed) return;

    const updated = getDonations().filter(item => String(item.id) !== String(id));
    saveDonations(updated);
    renderDonations();
  }

  function paymentDetailMarkup(item) {
    const method = item.paymentMethod || "-";

    if (method === "UPI") {
      return `
        <div class="card">
          <h3>UPI Details</h3>
          <p><strong>UPI App:</strong> ${item.upiApp || "-"}</p>
          <p><strong>UPI Redirected:</strong> ${item.upiRedirected ? "Yes" : "No"}</p>
          <p><strong>Payment Verified:</strong> ${item.paymentVerified ? "Yes" : "No"}</p>
        </div>
      `;
    }

    if (method === "Credit Card" || method === "Debit Card") {
      return `
        <div class="card">
          <h3>${method} Details</h3>
          <p><strong>Cardholder Name:</strong> ${item.cardName || "-"}</p>
          <p><strong>Card Number:</strong> ${item.cardNumber ? "**** **** **** " + item.cardNumber.slice(-4) : "-"}</p>
          <p><strong>Expiry:</strong> ${item.cardExpiry || "-"}</p>
          <p><strong>Payment Verified:</strong> ${item.paymentVerified ? "Yes" : "No"}</p>
        </div>
      `;
    }

    if (method === "Wallet") {
      return `
        <div class="card">
          <h3>Wallet Details</h3>
          <p><strong>Wallet Provider:</strong> ${item.walletProvider || "-"}</p>
          <p><strong>Wallet Mobile:</strong> ${item.walletMobile || "-"}</p>
          <p><strong>Payment Verified:</strong> ${item.paymentVerified ? "Yes" : "No"}</p>
        </div>
      `;
    }

    if (method === "Net Banking") {
      return `
        <div class="card">
          <h3>Net Banking Details</h3>
          <p><strong>Bank Name:</strong> ${item.bankName || "-"}</p>
          <p><strong>User ID:</strong> ${item.netBankingUserId || "-"}</p>
          <p><strong>Payment Verified:</strong> ${item.paymentVerified ? "Yes" : "No"}</p>
        </div>
      `;
    }

    if (method === "Bank Transfer") {
      return `
        <div class="card">
          <h3>Bank Transfer Details</h3>
          <div class="bank-info-box">
            <p><strong>Beneficiary:</strong> ${item.beneficiary || "AdoptMe Welfare Foundation"}</p>
            <p><strong>Bank Name:</strong> ${item.bankName || "-"}</p>
            <p><strong>Account:</strong> ${item.bankAccount || "-"}</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="card">
        <h3>Payment Details</h3>
        <p><strong>Method:</strong> ${method}</p>
      </div>
    `;
  }

  function openDonationDetails(id) {
    const donations = getDonations();
    const item = donations.find(d => String(d.id) === String(id));
    if (!item) return;

    modalContent.innerHTML = `
      <div class="admin-adoption-detail">
        <h2>Donation Details</h2>
        <p><strong>Receipt ID:</strong> ${item.id || "-"}</p>
        <p><strong>Date:</strong> ${item.createdAt || "-"}</p>

        <div class="admin-detail-grid">
          <div class="card">
            <h3>Donor Information</h3>
            <p><strong>Name:</strong> ${item.name || "-"}</p>
            <p><strong>Email:</strong> ${item.email || "-"}</p>
            <p><strong>Phone:</strong> ${item.phone || "-"}</p>
            <p><strong>City:</strong> ${item.city || "-"}</p>
            <p><strong>Live Location:</strong> ${item.location || "-"}</p>
          </div>

          <div class="card">
            <h3>Donation Summary</h3>
            <p class="donation-amount-highlight">₹${item.amount || 0}</p>
            <p><strong>Donation Type:</strong> ${item.type || "-"}</p>
            <p><strong>Payment Method:</strong> <span class="donation-method-pill">${item.paymentMethod || "-"}</span></p>
            ${paymentBadge(item)}
          </div>
        </div>

        <div class="mt-24">
          ${authBlock(item)}
        </div>

        <div class="admin-detail-grid mt-24">
          ${paymentDetailMarkup(item)}

          <div class="card">
            <h3>Authorization & Consent</h3>
            <p><strong>Email Verified:</strong> ${item.emailVerified ? "Yes" : "No"}</p>
            <p><strong>Phone Verified:</strong> ${item.phoneVerified ? "Yes" : "No"}</p>
            <p><strong>Transaction Authorized:</strong> ${item.transactionAuthorized ? "Yes" : "No"}</p>
            <p><strong>Consent Accepted:</strong> ${item.consent ? "Yes" : "No"}</p>
          </div>
        </div>

        <div class="card mt-24">
          <h3>Message / Note</h3>
          <div class="donation-note-box">
            <p>${item.note || "No note provided."}</p>
          </div>
        </div>

        <div class="admin-modal-actions mt-24">
          <button class="btn admin-reject-btn" id="modalDonationDeleteBtn">Delete</button>
          <button class="btn btn-secondary" id="modalDonationCloseBtn">Close</button>
        </div>
      </div>
    `;

    modal.classList.add("show");

    const closeBtn = document.getElementById("modalDonationCloseBtn");
    const deleteBtn = document.getElementById("modalDonationDeleteBtn");

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("show");
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        deleteDonation(id);
        modal.classList.remove("show");
      });
    }
  }

  function exportCSV() {
    const rows = getFilteredDonations();
    if (!rows.length) {
      alert("No donations available for export.");
      return;
    }

    const headers = [
      "Receipt ID",
      "Donor Name",
      "Email",
      "Phone",
      "City",
      "Live Location",
      "Amount",
      "Type",
      "Payment Method",
      "UPI App",
      "UPI Redirected",
      "Payment Verified",
      "Email Verified",
      "Phone Verified",
      "Consent",
      "Bank Name",
      "Bank Account",
      "Card Name",
      "Card Number",
      "Card Expiry",
      "Wallet Provider",
      "Wallet Mobile",
      "Net Banking User ID",
      "Beneficiary",
      "Authorized",
      "Created At"
    ];

    const csvRows = [
      headers.join(","),
      ...rows.map(item => [
        `"${item.id || ""}"`,
        `"${item.name || ""}"`,
        `"${item.email || ""}"`,
        `"${item.phone || ""}"`,
        `"${item.city || ""}"`,
        `"${item.location || ""}"`,
        `"${item.amount || ""}"`,
        `"${item.type || ""}"`,
        `"${item.paymentMethod || ""}"`,
        `"${item.upiApp || ""}"`,
        `"${item.upiRedirected ? "Yes" : "No"}"`,
        `"${item.paymentVerified ? "Yes" : "No"}"`,
        `"${item.emailVerified ? "Yes" : "No"}"`,
        `"${item.phoneVerified ? "Yes" : "No"}"`,
        `"${item.consent ? "Yes" : "No"}"`,
        `"${item.bankName || ""}"`,
        `"${item.bankAccount || ""}"`,
        `"${item.cardName || ""}"`,
        `"${item.cardNumber || ""}"`,
        `"${item.cardExpiry || ""}"`,
        `"${item.walletProvider || ""}"`,
        `"${item.walletMobile || ""}"`,
        `"${item.netBankingUserId || ""}"`,
        `"${item.beneficiary || ""}"`,
        `"${item.transactionAuthorized ? "Yes" : "No"}"`,
        `"${item.createdAt || ""}"`
      ].join(","))
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "adoptme-donations-export.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      modal.classList.remove("show");
    });
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("show");
      }
    });
  }

  searchInput.addEventListener("input", renderDonations);
  typeFilter.addEventListener("change", renderDonations);
  if (refreshBtn) refreshBtn.addEventListener("click", () => {
    loadDonationsFromMongoDB().then(() => renderDonations());
  });
  if (exportBtn) exportBtn.addEventListener("click", exportCSV);

  renderDonations();
});