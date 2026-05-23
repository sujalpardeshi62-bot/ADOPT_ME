// ============ NEW: MongoDB Connection Functions for Donations ============
const API_BASE_URL = 'http://localhost:5000/api';

// New function to load donations from MongoDB
async function loadDonationsFromBackend() {
    try {
        const response = await fetch(`${API_BASE_URL}/donations/all`);
        const result = await response.json();
        
        if (result.success && result.data) {
            // Convert backend data format to match your existing format
            const formattedData = result.data.map(donation => ({
                id: donation._id,
                name: donation.donorName || donation.name,
                email: donation.donorEmail || donation.email,
                phone: donation.donorPhone || donation.phone,
                amount: donation.amount,
                type: donation.type || "Donation",
                paymentMethod: donation.paymentMethod,
                upiApp: donation.upiApp,
                upiRedirected: donation.upiRedirected,
                paymentVerified: donation.paymentVerified,
                location: donation.location,
                city: donation.city,
                note: donation.note,
                consent: donation.consent,
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
                createdAt: donation.createdAt
            }));
            
            // Save to localStorage for existing functions to work
            localStorage.setItem("adoptme_donations", JSON.stringify(formattedData));
            return formattedData;
        }
        return [];
    } catch (error) {
        console.error('Error loading donations from backend:', error);
        return JSON.parse(localStorage.getItem("adoptme_donations")) || [];
    }
}

// New function to save donation to MongoDB
async function saveDonationToBackend(donationData) {
    try {
        // Send the COMPLETE donation data directly
        const response = await fetch(`${API_BASE_URL}/donations/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(donationData)
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('✅ Donation saved to MongoDB');
            return result.data;
        }
        return null;
    } catch (error) {
        console.error('Error saving donation to backend:', error);
        return null;
    }
}

// New function to sync donations with backend on page load
async function syncDonationsWithBackend() {
    try {
        const backendData = await loadDonationsFromBackend();
        if (backendData.length > 0) {
            console.log(`✅ Loaded ${backendData.length} donations from MongoDB`);
        }
        renderDonations();
    } catch (error) {
        console.error('Failed to sync donations with backend:', error);
        renderDonations();
    }
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page !== "donate") return;

  const donationForm = document.getElementById("donationForm");
  const donationsList = document.getElementById("donationsList");
  const downloadReceiptBtn = document.getElementById("downloadReceiptBtn");
  const printReceiptBtn = document.getElementById("printReceiptBtn");
  const previewReceiptBtn = document.getElementById("previewReceiptBtn");

  const donorEmailError = document.getElementById("donorEmailError");
  const donorPhoneError = document.getElementById("donorPhoneError");
  const donationAmountError = document.getElementById("donationAmountError");
  const donationConsentError = document.getElementById("donationConsentError");

  const quickAmountButtons = document.querySelectorAll(".quick-amount-btn");
  const paymentMethod = document.getElementById("paymentMethod");
  const upiPanel = document.getElementById("upiPanel");
  const bankPanel = document.getElementById("bankPanel");
  const creditCardPanel = document.getElementById("creditCardPanel");
  const debitCardPanel = document.getElementById("debitCardPanel");
  const netBankingPanel = document.getElementById("netBankingPanel");
  const walletPanel = document.getElementById("walletPanel");

  const getDonationLocationBtn = document.getElementById("getDonationLocationBtn");
  const donorLocation = document.getElementById("donorLocation");

  const scannerVideo = document.getElementById("scannerVideo");
  const startScannerBtn = document.getElementById("startScannerBtn");
  const stopScannerBtn = document.getElementById("stopScannerBtn");
  const scannerStatus = document.getElementById("scannerStatus");

  const donorEmailInput = document.getElementById("donorEmail");
  const donorPhoneInput = document.getElementById("donorPhone");

  const upiAppButtons = document.querySelectorAll(".upi-app-btn");
  const selectedUpiApp = document.getElementById("selectedUpiApp");
  const upiRedirectStatus = document.getElementById("upiRedirectStatus");
  const simulateUpiRedirectBtn = document.getElementById("simulateUpiRedirectBtn");
  const confirmUpiPaidBtn = document.getElementById("confirmUpiPaidBtn");
  const merchantUpiIdText = document.getElementById("merchantUpiIdText");
  const adoptmeQrImage = document.getElementById("adoptmeQrImage");

  const receiptPreviewModal = document.getElementById("receiptPreviewModal");
  const closeReceiptPreviewModal = document.getElementById("closeReceiptPreviewModal");
  const receiptPreviewContainer = document.getElementById("receiptPreviewContainer");

  let lastDonation = null;
  let chosenUpiApp = "";
  let upiRedirected = false;
  let upiPaid = false;
  let scannerStream = null;

  /* Replace with your real UPI ID */
  const merchantUpiId = "ashishvishwakarma@oksbi";
  const merchantName = "AdoptMe Welfare Foundation";

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    return /^[6-9]\d{9}$/.test(phone);
  }

  function clearErrors() {
    donorEmailError.textContent = "";
    donorPhoneError.textContent = "";
    donationAmountError.textContent = "";
    donationConsentError.textContent = "";
  }

  function validateEmailField() {
  const email = (donorEmailInput?.value || "").trim();
  if (!email) {
    donorEmailError.textContent = "Email is required.";
    return false;
  }
  if (!validateEmail(email)) {
    donorEmailError.textContent = "Please enter a valid email address.";
    return false;
  }
  donorEmailError.textContent = "";
  return true;
}

function validatePhoneField() {
  const phone = (donorPhoneInput?.value || "").trim();
  if (!phone) {
    donorPhoneError.textContent = "Phone number is required.";
    return false;
  }
  if (!validatePhone(phone)) {
    donorPhoneError.textContent = "Please enter a valid 10-digit Indian mobile number.";
    return false;
  }
  donorPhoneError.textContent = "";
  return true;
}

// Live validation
if (donorEmailInput) donorEmailInput.addEventListener("input", validateEmailField);
if (donorPhoneInput) donorPhoneInput.addEventListener("input", validatePhoneField);

  function renderDonations() {
  const donations = JSON.parse(localStorage.getItem("adoptme_donations")) || [];
  donationsList.innerHTML = donations.length
    ? donations.slice().reverse().map(d => `
      <div class="list-item">
        <strong>${d.name}</strong> donated <strong>₹${d.amount}</strong><br>
        <small>${d.type} • ${d.paymentMethod} • ${d.createdAt}</small><br>
        <small>Payment: ${d.paymentVerified ? "Confirmed" : "Pending"}</small>
      </div>
    `).join("")
    : `<div class="list-item">No donations yet.</div>`;
}
 
  function updateUpiLinkAndQr() {
    const amount = document.getElementById("donationAmount").value.trim() || "1";
    const donorName = document.getElementById("donorName").value.trim() || "Donor";
    const donationType = document.getElementById("donationType").value || "Donation";

    const upiLink = `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(donationType + " by " + donorName)}`;

    if (merchantUpiIdText) {
      merchantUpiIdText.textContent = merchantUpiId;
    }

    if (simulateUpiRedirectBtn) {
      simulateUpiRedirectBtn.href = upiLink;
    }

    if (adoptmeQrImage) {
      adoptmeQrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiLink)}`;
    }
  }

  function fillReceipt(donation) {
    document.getElementById("receiptDonorName").textContent = donation.name;
    document.getElementById("receiptAmount").textContent = `₹${donation.amount}`;
    document.getElementById("receiptId").textContent = donation.id;
    document.getElementById("receiptType").textContent = donation.type;
    document.getElementById("receiptPaymentMethod").textContent = donation.paymentMethod;
    document.getElementById("receiptUpiApp").textContent = donation.upiApp || donation.paymentMethod || "-";
    document.getElementById("receiptVerificationStatus").textContent = donation.paymentVerified ? "Verified" : "Pending";
    document.getElementById("receiptDate").textContent = donation.createdAt;
    document.getElementById("receiptEmail").textContent = donation.email;
    document.getElementById("receiptPhone").textContent = donation.phone;
    document.getElementById("receiptLocation").textContent = donation.location || "-";
    document.getElementById("receiptBankInfo").textContent =
      donation.bankName
        ? `${donation.beneficiary || "AdoptMe Welfare Foundation"} • ${donation.bankName}`
        : "AdoptMe Welfare Foundation • SBI";
  }

  function getReceiptHTML() {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>AdoptMe Donation Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f4e9d8; padding: 30px; }
          .adoption-certificate {
            width: 900px;
            max-width: 100%;
            margin: auto;
            background: #fff;
            border: 8px solid #8B5E3C;
            border-radius: 24px;
            padding: 40px;
            text-align: center;
            color: #333;
            position: relative;
            overflow: hidden;
          }
          .receipt-corner {
            position: absolute;
            top: 50%;
            width: 26px;
            height: 26px;
            background: #f4e9d8;
            border-radius: 50%;
            transform: translateY(-50%);
            z-index: 3;
          }
          .receipt-corner-left { left: -13px; }
          .receipt-corner-right { right: -13px; }
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
          .certificate-header, .certificate-subtitle, .certificate-body {
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
          .certificate-body h2, .certificate-body h3 { color: #8B5E3C; }
          .certificate-details {
            margin: 26px 0;
            display: grid;
            gap: 10px;
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
      <body>${document.getElementById("donationReceiptCard").outerHTML}</body>
      </html>
    `;
  }

  function openReceiptPreview() {
    if (!lastDonation) return;
    receiptPreviewContainer.innerHTML = `
      <div class="receipt-preview-wrapper">
        ${document.getElementById("donationReceiptCard").outerHTML}
      </div>
    `;
    receiptPreviewModal.classList.add("show");
  }

  if (closeReceiptPreviewModal) {
    closeReceiptPreviewModal.addEventListener("click", () => {
      receiptPreviewModal.classList.remove("show");
    });
  }

  if (receiptPreviewModal) {
    receiptPreviewModal.addEventListener("click", (e) => {
      if (e.target === receiptPreviewModal) {
        receiptPreviewModal.classList.remove("show");
      }
    });
  }

  if (previewReceiptBtn) {
    previewReceiptBtn.addEventListener("click", openReceiptPreview);
  }

  if (downloadReceiptBtn) {
    downloadReceiptBtn.addEventListener("click", () => {
      if (!lastDonation) return;
      const blob = new Blob([getReceiptHTML()], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `adoptme-donation-receipt-${lastDonation.id}.html`;
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  if (printReceiptBtn) {
    printReceiptBtn.addEventListener("click", () => {
      if (!lastDonation) return;
      const printWindow = window.open("", "_blank");
      printWindow.document.write(getReceiptHTML());
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 300);
    });
  }

  const donationAmountInput = document.getElementById("donationAmount");
  const donorNameInput = document.getElementById("donorName");
  const donationTypeInput = document.getElementById("donationType");

  if (donationAmountInput) donationAmountInput.addEventListener("input", updateUpiLinkAndQr);
  if (donorNameInput) donorNameInput.addEventListener("input", updateUpiLinkAndQr);
  if (donationTypeInput) donationTypeInput.addEventListener("change", updateUpiLinkAndQr);

  quickAmountButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      quickAmountButtons.forEach(item => item.classList.remove("active"));
      btn.classList.add("active");
      donationAmountInput.value = btn.dataset.amount;
      updateUpiLinkAndQr();
    });
  });

  function hideAllPaymentPanels() {
    upiPanel.classList.remove("show");
    bankPanel.classList.remove("show");
    creditCardPanel.classList.remove("show");
    debitCardPanel.classList.remove("show");
    netBankingPanel.classList.remove("show");
    walletPanel.classList.remove("show");
  }

  if (paymentMethod) {
    paymentMethod.addEventListener("change", () => {
      hideAllPaymentPanels();

      if (paymentMethod.value === "UPI") upiPanel.classList.add("show");
      if (paymentMethod.value === "Bank Transfer") bankPanel.classList.add("show");
      if (paymentMethod.value === "Credit Card") creditCardPanel.classList.add("show");
      if (paymentMethod.value === "Debit Card") debitCardPanel.classList.add("show");
      if (paymentMethod.value === "Net Banking") netBankingPanel.classList.add("show");
      if (paymentMethod.value === "Wallet") walletPanel.classList.add("show");

      updateUpiLinkAndQr();
    });
  }

  if (getDonationLocationBtn) {
    getDonationLocationBtn.addEventListener("click", () => {
      if (!navigator.geolocation) return;
      getDonationLocationBtn.disabled = true;
      getDonationLocationBtn.textContent = "Fetching...";

      navigator.geolocation.getCurrentPosition(
        (position) => {
          donorLocation.value = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
          getDonationLocationBtn.disabled = false;
          getDonationLocationBtn.textContent = "Use My Location";
        },
        () => {
          getDonationLocationBtn.disabled = false;
          getDonationLocationBtn.textContent = "Use My Location";
          showMessage("donationMessage", "Unable to fetch donation location.", "error");
        }
      );
    });
  }

  if (startScannerBtn) {
    startScannerBtn.addEventListener("click", async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        scannerStatus.textContent = "Camera access is not supported in this browser.";
        return;
      }

      try {
        scannerStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false
        });
        scannerVideo.srcObject = scannerStream;
        scannerStatus.textContent = "Scanner camera started successfully.";
      } catch {
        scannerStatus.textContent = "Camera access denied or unavailable.";
      }
    });
  }

  if (stopScannerBtn) {
    stopScannerBtn.addEventListener("click", () => {
      if (scannerStream) {
        scannerStream.getTracks().forEach(track => track.stop());
        scannerVideo.srcObject = null;
        scannerStream = null;
        scannerStatus.textContent = "Scanner camera stopped.";
      }
    });
  }

  upiAppButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      upiAppButtons.forEach(item => item.classList.remove("active"));
      btn.classList.add("active");
      chosenUpiApp = btn.dataset.upiapp;
      selectedUpiApp.textContent = chosenUpiApp;
      upiRedirectStatus.textContent = "UPI app selected";
      updateUpiLinkAndQr();
    });
  });

  if (simulateUpiRedirectBtn) {
    simulateUpiRedirectBtn.addEventListener("click", () => {
      if (!chosenUpiApp) {
        upiRedirectStatus.textContent = "Please select a UPI app first.";
        simulateUpiRedirectBtn.href = "#";
        return;
      }

      updateUpiLinkAndQr();
      upiRedirected = true;
      upiRedirectStatus.textContent = `Opening ${chosenUpiApp} payment...`;
    });
  }

  if (confirmUpiPaidBtn) {
    confirmUpiPaidBtn.addEventListener("click", () => {
      if (!upiRedirected) {
        upiRedirectStatus.textContent = "Please open the UPI payment first.";
        return;
      }
      upiPaid = true;
      upiRedirectStatus.textContent = `${chosenUpiApp} payment confirmed (simulated)`;
    });
  }

  if (donationForm) {
    donationForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors();

      let hasError = false;

if (!validateEmailField()) hasError = true;
if (!validatePhoneField()) hasError = true;

      const method = paymentMethod.value;

      const donation = {
        id: "DON-" + Date.now(),
        name: document.getElementById("donorName").value.trim(),
        email: document.getElementById("donorEmail").value.trim(),
        phone: document.getElementById("donorPhone").value.trim(),
        city: document.getElementById("donorCity").value.trim(),
        location: document.getElementById("donorLocation").value.trim(),
        amount: document.getElementById("donationAmount").value.trim(),
        type: document.getElementById("donationType").value,
        paymentMethod: method,
        upiApp: chosenUpiApp || "",
        upiRedirected,
        paymentVerified: method === "UPI" ? upiPaid : true,
        note: document.getElementById("donationMessageText").value.trim(),
        consent: document.getElementById("donationConsent").checked,
        bankName: method === "Bank Transfer" ? "State Bank of India" : (method === "Net Banking" ? document.getElementById("netBankingBankName").value.trim() : ""),
        bankAccount: method === "Bank Transfer" ? "123456789012" : "",
        beneficiary: "AdoptMe Welfare Foundation",
        cardNumber: method === "Credit Card" ? document.getElementById("creditCardNumber").value.trim() : method === "Debit Card" ? document.getElementById("debitCardNumber").value.trim() : "",
        cardName: method === "Credit Card" ? document.getElementById("creditCardName").value.trim() : method === "Debit Card" ? document.getElementById("debitCardName").value.trim() : "",
        cardExpiry: method === "Credit Card" ? document.getElementById("creditCardExpiry").value.trim() : method === "Debit Card" ? document.getElementById("debitCardExpiry").value.trim() : "",
        walletProvider: method === "Wallet" ? document.getElementById("walletProvider").value.trim() : "",
        walletMobile: method === "Wallet" ? document.getElementById("walletMobile").value.trim() : "",
        netBankingUserId: method === "Net Banking" ? document.getElementById("netBankingUserId").value.trim() : "",
        transactionAuthorized: true,
        createdAt: new Date().toLocaleString()
      };

      if (!validateEmail(donation.email)) {
        donorEmailError.textContent = "Please enter a valid email address.";
        hasError = true;
      }

      if (!validatePhone(donation.phone)) {
        donorPhoneError.textContent = "Please enter a valid 10-digit Indian mobile number.";
        hasError = true;
      }

      if (!donation.amount || Number(donation.amount) <= 0) {
        donationAmountError.textContent = "Please enter a valid donation amount.";
        hasError = true;
      }

      if (!donation.location) {
        showMessage("donationMessage", "Please capture live donation location.", "error");
        hasError = true;
      }

      if (method === "UPI" && !donation.paymentVerified) {
        showMessage("donationMessage", "Please complete and confirm the UPI payment flow.", "error");
        hasError = true;
      }

      if (method === "Credit Card" && (!donation.cardNumber || !donation.cardName || !donation.cardExpiry)) {
        showMessage("donationMessage", "Please fill all credit card details.", "error");
        hasError = true;
      }

      if (method === "Debit Card" && (!donation.cardNumber || !donation.cardName || !donation.cardExpiry)) {
        showMessage("donationMessage", "Please fill all debit card details.", "error");
        hasError = true;
      }

      if (method === "Wallet" && (!donation.walletProvider || !donation.walletMobile)) {
        showMessage("donationMessage", "Please fill all wallet details.", "error");
        hasError = true;
      }

      if (method === "Net Banking" && (!donation.bankName || !donation.netBankingUserId)) {
        showMessage("donationMessage", "Please fill all net banking details.", "error");
        hasError = true;
      }

      if (!donation.consent) {
        donationConsentError.textContent = "You must accept the donation consent.";
        hasError = true;
      }

      if (hasError) return;

      // Save to localStorage (existing functionality)
      const donations = JSON.parse(localStorage.getItem("adoptme_donations")) || [];
      donations.push(donation);
      localStorage.setItem("adoptme_donations", JSON.stringify(donations));
      
      // NEW: Save to MongoDB backend
      const backendResult = await saveDonationToBackend(donation);
      if (backendResult) {
        console.log("✅ Donation also saved to MongoDB Compass!");
      } else {
        console.warn("⚠️ Donation saved to localStorage only, backend may not be running");
      }

      lastDonation = donation;
      fillReceipt(donation);

      previewReceiptBtn.disabled = false;
      downloadReceiptBtn.disabled = false;
      printReceiptBtn.disabled = false;

      showMessage("donationMessage", `Thank you ${donation.name}! Your donation of ₹${donation.amount} has been recorded successfully.`, "success");

      donationForm.reset();
      quickAmountButtons.forEach(item => item.classList.remove("active"));
      upiAppButtons.forEach(item => item.classList.remove("active"));
      hideAllPaymentPanels();

      chosenUpiApp = "";
      upiRedirected = false;
      upiPaid = false;
      selectedUpiApp.textContent = "-";
      upiRedirectStatus.textContent = "Waiting";

      if (scannerStream) {
        scannerStream.getTracks().forEach(track => track.stop());
        scannerVideo.srcObject = null;
        scannerStream = null;
      }

      renderDonations();
    });
  }

  updateUpiLinkAndQr();
  // MODIFIED: Use syncDonationsWithBackend instead of renderDonations directly
  syncDonationsWithBackend();
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