const API_BASE_URL = "http://localhost:5000/api";

async function saveAdoptionToBackend(formData) {
  try {
    const response = await fetch(`${API_BASE_URL}/adoptions/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const result = await response.json();
    if (result.success) {
      console.log("✅ Adoption saved to MongoDB backend");
      return result.data;
    }
    return null;
  } catch (error) {
    console.error("Error saving to backend:", error);
    return null;
  }
}

/* =========================================================
   Adopt Page Controller
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page !== "adopt") return;

  // Ensure animals seed exists before reading localStorage
  seedData();

  const animalsGrid = document.getElementById("animalsGrid");
  const speciesFilter = document.getElementById("speciesFilter");
  const ageFilter = document.getElementById("ageFilter");
  const locationFilter = document.getElementById("locationFilter");

  const adoptModal = document.getElementById("adoptModal");
  const closeAdoptModal = document.getElementById("closeAdoptModal");
  const adoptionForm = document.getElementById("adoptionForm");

  const petDetailsModal = document.getElementById("petDetailsModal");
  const closePetDetailsModal = document.getElementById("closePetDetailsModal");
  const petDetailsContent = document.getElementById("petDetailsContent");

  const downloadCertificateBtn = document.getElementById("downloadCertificateBtn");
  const printCertificateBtn = document.getElementById("printCertificateBtn");
  const getLocationBtn = document.getElementById("getLocationBtn");

  const emailError = document.getElementById("emailError");
  const phoneError = document.getElementById("phoneError");
  const consentError = document.getElementById("consentError");

  if (!animalsGrid) return;

  /* =========================================================
     Pet Profile Defaults + Normalization
     ========================================================= */
  const ANIMAL_PROFILE_DEFAULTS = {
    type: "Rescue",
    color: "Unknown",
    sex: "Unknown",

    heightCm: "",
    weightKg: "",
    patchesColor: "",

    injected: [],
    medicine: [],

    sterilized: "Unknown",
    microchipped: "Unknown",
    vetChecked: "Unknown",

    fromWhere: "",
    previousAdopted: "Unknown",
    previousAdoptedBy: "", // do not show publicly
    returnedReason: "",

    healthNotes: "",
    behaviorNotes: "",

    homeSuitability: {
      apartmentOk: "Unknown",
      kidFriendly: "Unknown",
      petFriendly: "Unknown",
      aloneHoursMax: ""
    }
  };

  function ensureArray(v) {
    if (Array.isArray(v)) return v;
    if (typeof v === "string" && v.trim()) return [v.trim()];
    return [];
  }

  function normalizeAnimal(animal) {
    return {
      ...ANIMAL_PROFILE_DEFAULTS,
      ...animal,
      injected: ensureArray(animal.injected),
      medicine: ensureArray(animal.medicine),
      homeSuitability: {
        ...ANIMAL_PROFILE_DEFAULTS.homeSuitability,
        ...(animal.homeSuitability || {})
      }
    };
  }

  let animals = getStorage("adoptme_animals", []).map(normalizeAnimal);
  setStorage("adoptme_animals", animals); // keep consistent

  let lastApplication = null;

  /* =========================================================
     Draft Save / Restore
     ========================================================= */
  const formFieldIds = [
    "adoptName",
    "adoptEmail",
    "adoptPhone",
    "adoptDob",
    "adoptGender",
    "adoptOccupation",
    "adoptCitizenship",
    "adoptIdType",
    "adoptAadhaarNumber",
    "adoptIdNumber",
    "adoptAddress",
    "adoptCity",
    "adoptState",
    "adoptPincode",
    "adoptLiveLocation",
    "adoptLivingType",
    "adoptOwnership",
    "adoptYard",
    "adoptOtherPets",
    "adoptFamilySupport",
    "adoptExperience",
    "adoptReason",
    "adoptDailyCare",
    "adoptEmergencyPlan"
  ];

  function saveDraft() {
    const draft = {};

    formFieldIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) draft[id] = el.value;
    });

    ["adoptConsent1", "adoptConsent2", "adoptConsent3", "adoptConsent4", "adoptConsent5"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) draft[id] = el.checked;
    });

    localStorage.setItem("adoptme_adoption_draft", JSON.stringify(draft));
  }

  function restoreDraft() {
    const draft = getStorage("adoptme_adoption_draft", {});

    formFieldIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el && draft[id] !== undefined) el.value = draft[id];
    });

    ["adoptConsent1", "adoptConsent2", "adoptConsent3", "adoptConsent4", "adoptConsent5"].forEach((id) => {
      const el = document.getElementById(id);
      if (el && typeof draft[id] === "boolean") el.checked = draft[id];
    });
  }

  formFieldIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", saveDraft);
    el.addEventListener("change", saveDraft);
  });

  ["adoptConsent1", "adoptConsent2", "adoptConsent3", "adoptConsent4", "adoptConsent5"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", saveDraft);
  });

  restoreDraft();

  /* =========================================================
     Animal Cards (Badges)
     ========================================================= */
  function getCardBadgesHTML(animal) {
    const vet = animal.vetChecked === "Yes" ? "Vet Checked" : `Vet: ${animal.vetChecked || "Unknown"}`;
    const vax =
      Array.isArray(animal.injected) && animal.injected.length ? "Vaccination Record" : "Vax: Not Listed";

    const steril =
      animal.sterilized && animal.sterilized !== "Unknown" && animal.sterilized !== "N/A"
        ? `Sterilized: ${animal.sterilized}`
        : "";

    return `
      <div class="pet-card-badges">
        <span class="pet-mini-badge verified">Verified</span>
        <span class="pet-mini-badge">${vet}</span>
        <span class="pet-mini-badge">${vax}</span>
        ${steril ? `<span class="pet-mini-badge">${steril}</span>` : ""}
      </div>
    `;
  }

  /* =========================================================
     Animal Rendering
     ========================================================= */
  function renderAnimals() {
    const species = speciesFilter ? speciesFilter.value : "all";
    const age = ageFilter ? ageFilter.value : "all";
    const location = locationFilter ? locationFilter.value : "all";

    const filteredAnimals = animals.filter(
      (animal) =>
        (species === "all" || animal.species === species) &&
        (age === "all" || animal.age === age) &&
        (location === "all" || animal.location === location)
    );

    animalsGrid.innerHTML = filteredAnimals.length
      ? filteredAnimals
          .map(
            (animal) => `
        <div class="card animal-card dynamic-animal-card">
          <img 
            src="${animal.image}" 
            alt="${animal.name}"
            onerror="this.src='https://placehold.co/900x600/F4E9D8/8B5E3C?text=AdoptMe+Pet';"
          >
          <div class="animal-card-content">
            ${getCardBadgesHTML(animal)}
            <h3>${animal.name}</h3>
            <p class="animal-meta">${animal.species} • ${animal.age} • ${animal.location}</p>
            <p>${animal.breed}</p>
            <div class="animal-card-actions">
              <button class="btn btn-secondary btn-sm view-details-btn" data-id="${animal.id}">View Details</button>
              <button class="btn btn-primary btn-sm open-adopt-btn" data-id="${animal.id}" data-name="${animal.name}">Adopt Now</button>
            </div>
          </div>
        </div>
      `
          )
          .join("")
      : `<div class="card"><p>No animals match the selected filters.</p></div>`;

    bindViewDetailsButtons();
    bindAdoptButtons();
  }

  /* =========================================================
     View Details (Full Pet Profile + Eye-Catching)
     ========================================================= */
  function formatValue(v) {
    if (v === null || v === undefined) return "Not available";
    const s = String(v).trim();
    return s ? s : "Not available";
  }

  function formatList(arr) {
    return Array.isArray(arr) && arr.length ? arr.join(", ") : "Not available";
  }

  function detailRow(label, value, iconClass = "fa-paw") {
    return `
      <div class="pet-attr">
        <div class="pet-attr-top">
          <span class="pet-attr-icon"><i class="fa-solid ${iconClass}"></i></span>
          <span class="pet-attr-label">${label}</span>
        </div>
        <div class="pet-attr-value">${formatValue(value)}</div>
      </div>
    `;
  }

  function getSafetySummary(animal) {
    const vetOk = animal.vetChecked === "Yes";
    const injectedOk = Array.isArray(animal.injected) && animal.injected.length > 0;
    const meds = Array.isArray(animal.medicine) && animal.medicine.length > 0;

    if (vetOk && injectedOk && !meds) {
      return { level: "good", text: "Good: Vet-checked + vaccination record available. No ongoing medicines listed." };
    }
    if (vetOk && injectedOk && meds) {
      return {
        level: "moderate",
        text: "Moderate: Vet-checked + vaccination record available. Ongoing medicines listed—please review carefully."
      };
    }
    if (vetOk && !injectedOk) {
      return { level: "moderate", text: "Moderate: Vet-checked but vaccination/injection record is missing." };
    }
    return {
      level: "needs",
      text: "Needs Verification: Medical/vaccination records are incomplete. Please confirm with shelter/rescue and a vet before final adoption."
    };
  }

  function bindViewDetailsButtons() {
    document.querySelectorAll(".view-details-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const animalId = Number(button.dataset.id);
        const animal = animals.find((item) => item.id === animalId);
        if (!animal) return;

        const safety = getSafetySummary(animal);

        petDetailsContent.innerHTML = `
          <div class="pet-detail-layout">
            <div class="pet-detail-image">
              <img 
                src="${animal.image}" 
                alt="${animal.name}" 
                onerror="this.src='https://placehold.co/900x600/F4E9D8/8B5E3C?text=AdoptMe+Pet';"
              >
            </div>

            <div class="pet-detail-info">
              <div class="pet-top-badges">
                <span class="pet-top-badge verified">Verified</span>
                <span class="pet-top-badge">${formatValue(animal.type)}</span>
                <span class="pet-top-badge">Vet: ${formatValue(animal.vetChecked)}</span>
                <span class="pet-top-badge">${
                  Array.isArray(animal.injected) && animal.injected.length ? "Vaccination Record" : "Vax: Not Listed"
                }</span>
              </div>

              <h2>${animal.name}</h2>
              <p class="pet-detail-meta">${animal.age} • ${animal.location}</p>

              <div class="pet-profile-section">
                <h3><i class="fa-solid fa-id-card-clip"></i> Pet Description</h3>
                <div class="pet-attr-grid">
                  ${detailRow("Species", animal.species, "fa-shield-dog")}
                  ${detailRow("Breed", animal.breed, "fa-dna")}
                  ${detailRow("Color", animal.color, "fa-palette")}
                  ${detailRow("Patches Color", animal.patchesColor, "fa-circle-half-stroke")}
                  ${detailRow("Sex", animal.sex, "fa-venus-mars")}
                  ${detailRow("Height (cm)", animal.heightCm, "fa-ruler-vertical")}
                  ${detailRow("Weight (kg)", animal.weightKg, "fa-weight-scale")}
                  ${detailRow("From Where", animal.fromWhere, "fa-location-dot")}
                </div>
              </div>

              <div class="pet-profile-section">
                <h3><i class="fa-solid fa-kit-medical"></i> Medical Details</h3>
                <div class="pet-attr-grid">
                  ${detailRow("Injected / Vaccinations", formatList(animal.injected), "fa-syringe")}
                  ${detailRow("Current Medicine", formatList(animal.medicine), "fa-pills")}
                  ${detailRow("Sterilized", animal.sterilized, "fa-user-shield")}
                  ${detailRow("Microchipped", animal.microchipped, "fa-microchip")}
                </div>
                ${animal.healthNotes ? `<p><strong>Health Notes:</strong> ${animal.healthNotes}</p>` : ""}
              </div>

              <div class="pet-profile-section">
                <h3><i class="fa-solid fa-clock-rotate-left"></i> Background / History</h3>
                <div class="pet-attr-grid">
                  ${detailRow("Previously Adopted", animal.previousAdopted, "fa-clipboard-check")}
                  ${detailRow("Returned Reason", animal.returnedReason, "fa-circle-info")}
                </div>
                <p style="font-size:12px; color:#666; margin-top:6px;">
                  Previous adopter identity/contact is kept confidential for privacy & safety.
                </p>
              </div>

              <div class="pet-profile-section">
                <h3><i class="fa-solid fa-house-chimney-heart"></i> Home Suitability</h3>
                <div class="pet-attr-grid">
                  ${detailRow("Apartment OK", animal.homeSuitability?.apartmentOk, "fa-building")}
                  ${detailRow("Kid Friendly", animal.homeSuitability?.kidFriendly, "fa-children")}
                  ${detailRow("Pet Friendly", animal.homeSuitability?.petFriendly, "fa-paw")}
                  ${detailRow("Max Alone Hours", animal.homeSuitability?.aloneHoursMax, "fa-clock")}
                </div>
                ${animal.behaviorNotes ? `<p><strong>Behavior Notes:</strong> ${animal.behaviorNotes}</p>` : ""}
              </div>

              <div class="safety-box ${safety.level}">
                <div class="safety-title">Safety at Home (Record-Based)</div>
                <p style="margin:0; font-weight:700;">${safety.text}</p>
                <small style="display:block; margin-top:8px; color:#555; font-weight:600;">
                  Note: This is based on available shelter/rescue records and should be confirmed with a vet after adoption.
                </small>
              </div>

              <div class="pet-detail-highlights">
                <span>✔ Verified Listing</span>
                <span>✔ Welfare Checked</span>
                <span>✔ Adoption Supported</span>
              </div>

              <div class="pet-detail-actions">
                <button class="btn btn-primary" id="detailAdoptNowBtn">Adopt ${animal.name}</button>
              </div>
            </div>
          </div>
        `;

        petDetailsModal.classList.add("show");

        const detailAdoptNowBtn = document.getElementById("detailAdoptNowBtn");
        if (detailAdoptNowBtn) {
          detailAdoptNowBtn.addEventListener("click", () => {
            petDetailsModal.classList.remove("show");
            openAdoptionForm(animal.id, animal.name);
          });
        }
      });
    });
  }

  function openAdoptionForm(id, name) {
    document.getElementById("adoptAnimalId").value = id;
    document.getElementById("adoptAnimalName").value = name;
    document.getElementById("adoptPetTitle").textContent = `Applying to adopt ${name}`;

    const user = currentUser();
    if (user) {
      document.getElementById("adoptName").value = user.name || "";
      document.getElementById("adoptEmail").value = user.email || "";
    }

    saveDraft();
    if (downloadCertificateBtn) downloadCertificateBtn.disabled = true;
    if (printCertificateBtn) printCertificateBtn.disabled = true;

    adoptModal.classList.add("show");
  }

  function bindAdoptButtons() {
    document.querySelectorAll(".open-adopt-btn").forEach((button) => {
      button.addEventListener("click", () => {
        openAdoptionForm(button.dataset.id, button.dataset.name);
      });
    });
  }

  /* =========================================================
     Modal Close
     ========================================================= */
  function closeAdoptionModal() {
    if (adoptModal) adoptModal.classList.remove("show");
  }

  if (closeAdoptModal) closeAdoptModal.addEventListener("click", closeAdoptionModal);

  if (adoptModal) {
    adoptModal.addEventListener("click", (e) => {
      if (e.target === adoptModal) closeAdoptionModal();
    });
  }

  if (closePetDetailsModal) {
    closePetDetailsModal.addEventListener("click", () => petDetailsModal.classList.remove("show"));
  }

  if (petDetailsModal) {
    petDetailsModal.addEventListener("click", (e) => {
      if (e.target === petDetailsModal) petDetailsModal.classList.remove("show");
    });
  }

  [speciesFilter, ageFilter, locationFilter].forEach((filter) => {
    if (filter) filter.addEventListener("change", renderAnimals);
  });

  /* =========================================================
     Live Location
     ========================================================= */
  if (getLocationBtn) {
    getLocationBtn.addEventListener("click", () => {
      const locationField = document.getElementById("adoptLiveLocation");

      if (!navigator.geolocation) {
        showMessage("adoptionMessage", "Geolocation is not supported by your browser.", "error");
        return;
      }

      getLocationBtn.disabled = true;
      getLocationBtn.textContent = "Fetching...";

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude.toFixed(6);
          const longitude = position.coords.longitude.toFixed(6);
          locationField.value = `${latitude}, ${longitude}`;
          saveDraft();
          getLocationBtn.disabled = false;
          getLocationBtn.textContent = "Use My Location";
        },
        () => {
          getLocationBtn.disabled = false;
          getLocationBtn.textContent = "Use My Location";
          showMessage("adoptionMessage", "Unable to fetch live location. Please allow location access.", "error");
        }
      );
    });
  }

  /* =========================================================
     Validation
     ========================================================= */
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    return /^[6-9]\d{9}$/.test(phone);
  }

  function validatePincode(pincode) {
    return /^\d{6}$/.test(pincode);
  }

  function validateAadhaar(aadhaar) {
    return /^\d{12}$/.test(aadhaar);
  }

  function validateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 18;
  }

  function clearFieldErrors() {
    if (emailError) emailError.textContent = "";
    if (phoneError) phoneError.textContent = "";
    if (consentError) consentError.textContent = "";
  }

  /* =========================================================
     Certificate
     ========================================================= */
  function fillCertificate(application) {
    document.getElementById("certificateUserName").textContent = application.name;
    document.getElementById("certificatePetName").textContent = application.animalName;
    document.getElementById("certificateApplicationId").textContent = application.id;
    document.getElementById("certificateDate").textContent = application.createdAt;
  }

  function getCertificateHTML() {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>AdoptMe Certificate</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f4e9d8; padding: 30px; }
          .adoption-certificate { max-width: 900px; margin: auto; background: #fff; border: 8px solid #8B5E3C; border-radius: 20px; padding: 40px; text-align: center; position: relative; overflow: hidden; }
          .certificate-watermark { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 72px; font-weight: 800; color: rgba(139,94,60,0.06); transform: rotate(-24deg); pointer-events: none; }
          .certificate-stamp { position: absolute; top: 24px; right: 24px; border: 3px solid #8B5E3C; color: #8B5E3C; padding: 10px 16px; border-radius: 50px; font-weight: bold; transform: rotate(-12deg); }
          .certificate-header, .certificate-subtitle, .certificate-body { position: relative; z-index: 2; }
          .certificate-header { font-size: 42px; font-weight: 700; color: #8B5E3C; }
          .certificate-subtitle { font-size: 18px; margin: 10px 0 30px; color: #555; }
          .certificate-body h2, .certificate-body h3 { color: #8B5E3C; }
          .certificate-details { margin: 30px 0; display: grid; gap: 10px; }
          .certificate-signatures { margin-top: 40px; display: flex; justify-content: space-between; gap: 30px; }
          .certificate-signatures div { text-align: center; }
          .certificate-signatures strong, .certificate-signatures small { display: block; margin-top: 6px; }
          .signature-name { margin-top: 10px; font-family: "Brush Script MT", cursive; font-size: 1.6rem; color: #8B5E3C; }
        </style>
      </head>
      <body>${document.getElementById("adoptionCertificate").outerHTML}</body>
      </html>
    `;
  }

  if (downloadCertificateBtn) {
    downloadCertificateBtn.addEventListener("click", () => {
      if (!lastApplication) return;
      const blob = new Blob([getCertificateHTML()], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `adoptme-certificate-${lastApplication.id}.html`;
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  if (printCertificateBtn) {
    printCertificateBtn.addEventListener("click", () => {
      if (!lastApplication) return;
      const printWindow = window.open("", "_blank");
      printWindow.document.write(getCertificateHTML());
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 300);
    });
  }

  /* =========================================================
     Submit Form (localStorage + MongoDB)
     ========================================================= */
  if (adoptionForm) {
    adoptionForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearFieldErrors();

      const formData = {
        id: "ADM-" + Date.now(),
        animalId: document.getElementById("adoptAnimalId").value,
        animalName: document.getElementById("adoptAnimalName").value,

        name: document.getElementById("adoptName").value.trim(),
        email: document.getElementById("adoptEmail").value.trim(),
        phone: document.getElementById("adoptPhone").value.trim(),
        dob: document.getElementById("adoptDob").value,
        gender: document.getElementById("adoptGender").value,
        occupation: document.getElementById("adoptOccupation").value.trim(),

        citizenship: document.getElementById("adoptCitizenship").value,
        idType: document.getElementById("adoptIdType").value,
        aadhaarNumber: document.getElementById("adoptAadhaarNumber").value.trim(),
        idNumber: document.getElementById("adoptIdNumber").value.trim(),

        address: document.getElementById("adoptAddress").value.trim(),
        city: document.getElementById("adoptCity").value.trim(),
        state: document.getElementById("adoptState").value.trim(),
        pincode: document.getElementById("adoptPincode").value.trim(),
        liveLocation: document.getElementById("adoptLiveLocation").value.trim(),

        livingType: document.getElementById("adoptLivingType").value,
        ownership: document.getElementById("adoptOwnership").value,
        yard: document.getElementById("adoptYard").value,
        otherPets: document.getElementById("adoptOtherPets").value,
        familySupport: document.getElementById("adoptFamilySupport").value,

        experience: document.getElementById("adoptExperience").value.trim(),
        reason: document.getElementById("adoptReason").value.trim(),
        dailyCare: document.getElementById("adoptDailyCare").value.trim(),
        emergencyPlan: document.getElementById("adoptEmergencyPlan").value.trim(),

        photoFileName: document.getElementById("adoptPhoto").files[0]?.name || "",
        documentFileName: document.getElementById("adoptDocument").files[0]?.name || "",

        consentAccepted: true,
        status: "Pending Review",
        createdAt: new Date().toLocaleString()
      };

      let hasError = false;

      if (!validateEmail(formData.email)) {
        if (emailError) emailError.textContent = "Please enter a valid email address.";
        hasError = true;
      }

      if (!validatePhone(formData.phone)) {
        if (phoneError) phoneError.textContent = "Please enter a valid 10-digit Indian mobile number.";
        hasError = true;
      }

      if (!validateAge(formData.dob)) {
        showMessage("adoptionMessage", "Applicant must be at least 18 years old.", "error");
        hasError = true;
      }

      if (!validateAadhaar(formData.aadhaarNumber)) {
        showMessage("adoptionMessage", "Please enter a valid 12-digit Aadhaar number.", "error");
        hasError = true;
      }

      if (!validatePincode(formData.pincode)) {
        showMessage("adoptionMessage", "Please enter a valid 6-digit pincode.", "error");
        hasError = true;
      }

      const consentIds = ["adoptConsent1", "adoptConsent2", "adoptConsent3", "adoptConsent4", "adoptConsent5"];
      const allConsented = consentIds.every((id) => document.getElementById(id).checked);

      if (!allConsented) {
        if (consentError) consentError.textContent = "Please accept all terms and conditions.";
        hasError = true;
      }

      if (!document.getElementById("adoptPhoto").files.length || !document.getElementById("adoptDocument").files.length) {
        showMessage("adoptionMessage", "Please upload both profile photo and valid ID document.", "error");
        hasError = true;
      }

      if (hasError) return;

      // Save to localStorage
      const applications = getStorage("adoptme_adoptions", []);
      applications.push(formData);
      setStorage("adoptme_adoptions", applications);

      // Save to backend
      const backendResult = await saveAdoptionToBackend(formData);
      if (backendResult) console.log("✅ Adoption also saved to MongoDB Compass!");
      else console.warn("⚠️ Adoption saved to localStorage only (backend may not be running).");

      lastApplication = formData;
      fillCertificate(formData);

      localStorage.removeItem("adoptme_adoption_draft");

      if (downloadCertificateBtn) downloadCertificateBtn.disabled = false;
      if (printCertificateBtn) printCertificateBtn.disabled = false;

      showMessage(
        "adoptionMessage",
        `Verified adoption application submitted successfully for ${formData.animalName}. Certificate is ready.`,
        "success"
      );
    });
  }

  /* =========================================================
     Init
     ========================================================= */
  renderAnimals();
});

/* =========================================================
   Global Utilities
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
  themeToggleBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
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
   Seed Data (UPDATED with Full Pet Profiles + India Locations)
   ========================================================= */
function seedData() {
  if (!localStorage.getItem("adoptme_animals")) {
    const animals = [
      {
        id: 1,
        name: "Bella",
        species: "Dog",
        age: "Young",
        location: "Mumbai",
        breed: "Labrador Mix",
        image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "Golden",
        sex: "Female",
        heightCm: 52,
        weightKg: 18,
        patchesColor: "White chest patch",
        injected: ["Rabies", "DHPP (Dose 1)"],
        medicine: ["Deworming completed", "Flea/Tick prevention"],
        sterilized: "No",
        microchipped: "Yes",
        vetChecked: "Yes",
        fromWhere: "Partner Shelter (Mumbai Zone)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Healthy. Booster due in 3 weeks.",
        behaviorNotes: "Friendly, playful. Leash training in progress.",
        homeSuitability: { apartmentOk: "Yes", kidFriendly: "Yes", petFriendly: "Yes", aloneHoursMax: 5 }
      },
      {
        id: 2,
        name: "Milo",
        species: "Cat",
        age: "Adult",
        location: "New Delhi",
        breed: "Tabby",
        image: "https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "Brown/Gray Tabby",
        sex: "Male",
        heightCm: 25,
        weightKg: 4.8,
        patchesColor: "White paws",
        injected: ["Rabies", "FVRCP"],
        medicine: [],
        sterilized: "Yes",
        microchipped: "No",
        vetChecked: "Yes",
        fromWhere: "Community Rescue Intake (New Delhi)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Good appetite and normal vitals.",
        behaviorNotes: "Calm, litter trained.",
        homeSuitability: { apartmentOk: "Yes", kidFriendly: "Yes", petFriendly: "Unknown", aloneHoursMax: 7 }
      },
      {
        id: 3,
        name: "Daisy",
        species: "Rabbit",
        age: "Baby",
        location: "Uttar Pradesh",
        breed: "Mini Lop",
        image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "Cream",
        sex: "Female",
        heightCm: 18,
        weightKg: 1.2,
        patchesColor: "Light brown ear tips",
        injected: ["N/A (species-based)"],
        medicine: ["Deworming completed"],
        sterilized: "No",
        microchipped: "No",
        vetChecked: "Yes",
        fromWhere: "Foster Network (UP Zone)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Healthy baby rabbit; monitor diet and temperature.",
        behaviorNotes: "Shy at first; gentle handling recommended.",
        homeSuitability: { apartmentOk: "Yes", kidFriendly: "Yes (supervised)", petFriendly: "Unknown", aloneHoursMax: 4 }
      },
      {
        id: 4,
        name: "Rocky",
        species: "Dog",
        age: "Adult",
        location: "Chennai",
        breed: "German Shepherd Mix",
        image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80",
        type: "Owner Surrender",
        color: "Black/Tan",
        sex: "Male",
        heightCm: 62,
        weightKg: 28,
        patchesColor: "Tan eyebrows/legs",
        injected: ["Rabies", "DHPP"],
        medicine: ["Joint supplement (vet advised)"],
        sterilized: "Yes",
        microchipped: "Yes",
        vetChecked: "Yes",
        fromWhere: "Owner Surrender (Chennai Zone)",
        previousAdopted: "Yes",
        previousAdoptedBy: "",
        returnedReason: "Family relocation; unable to keep",
        healthNotes: "Active adult; mild joint stiffness in cold weather.",
        behaviorNotes: "Protective; needs experienced handler.",
        homeSuitability: { apartmentOk: "No", kidFriendly: "Unknown", petFriendly: "Unknown", aloneHoursMax: 4 }
      },
      {
        id: 5,
        name: "Luna",
        species: "Cat",
        age: "Young",
        location: "Mumbai",
        breed: "Siamese Mix",
        image: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "Cream with dark points",
        sex: "Female",
        heightCm: 24,
        weightKg: 3.9,
        patchesColor: "Dark tail/ears",
        injected: ["Rabies", "FVRCP (Dose 1)"],
        medicine: [],
        sterilized: "No",
        microchipped: "No",
        vetChecked: "Yes",
        fromWhere: "Partner Shelter (Mumbai Zone)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Healthy; booster due.",
        behaviorNotes: "Affectionate, vocal, playful.",
        homeSuitability: { apartmentOk: "Yes", kidFriendly: "Yes", petFriendly: "Yes (slow intro)", aloneHoursMax: 6 }
      },
      {
        id: 6,
        name: "Coco",
        species: "Dog",
        age: "Baby",
        location: "New Delhi",
        breed: "Beagle Mix",
        image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "Tri-color",
        sex: "Male",
        heightCm: 28,
        weightKg: 6.5,
        patchesColor: "White blaze on face",
        injected: ["DHPP (Puppy Dose 1)"],
        medicine: ["Deworming completed"],
        sterilized: "No",
        microchipped: "No",
        vetChecked: "Yes",
        fromWhere: "Rescue Pickup (New Delhi Zone)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Puppy—vaccination schedule to be continued.",
        behaviorNotes: "Energetic; needs chewing toys and training.",
        homeSuitability: { apartmentOk: "Yes", kidFriendly: "Yes", petFriendly: "Yes", aloneHoursMax: 3 }
      },
      {
        id: 7,
        name: "Oliver",
        species: "Cat",
        age: "Adult",
        location: "Gujarat",
        breed: "British Shorthair Mix",
        image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "Gray",
        sex: "Male",
        heightCm: 26,
        weightKg: 5.6,
        patchesColor: "",
        injected: ["Rabies", "FVRCP"],
        medicine: [],
        sterilized: "Yes",
        microchipped: "Yes",
        vetChecked: "Yes",
        fromWhere: "Partner Shelter (Gujarat Zone)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Healthy adult; regular grooming recommended.",
        behaviorNotes: "Quiet, prefers calm home.",
        homeSuitability: { apartmentOk: "Yes", kidFriendly: "Unknown", petFriendly: "Unknown", aloneHoursMax: 8 }
      },
      {
        id: 8,
        name: "Ruby",
        species: "Dog",
        age: "Young",
        location: "Uttar Pradesh",
        breed: "Golden Retriever Mix",
        image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "Golden",
        sex: "Female",
        heightCm: 55,
        weightKg: 20,
        patchesColor: "White chest spot",
        injected: ["Rabies", "DHPP"],
        medicine: [],
        sterilized: "No",
        microchipped: "Yes",
        vetChecked: "Yes",
        fromWhere: "Foster Home (UP Zone)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Healthy; regular exercise needed.",
        behaviorNotes: "Friendly, social; good family dog.",
        homeSuitability: { apartmentOk: "Yes", kidFriendly: "Yes", petFriendly: "Yes", aloneHoursMax: 5 }
      },
      {
        id: 9,
        name: "Snow",
        species: "Rabbit",
        age: "Young",
        location: "Chennai",
        breed: "Angora Rabbit",
        image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "White",
        sex: "Unknown",
        heightCm: 20,
        weightKg: 1.8,
        patchesColor: "",
        injected: ["N/A (species-based)"],
        medicine: [],
        sterilized: "Unknown",
        microchipped: "No",
        vetChecked: "Yes",
        fromWhere: "Partner Shelter (Chennai Zone)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Coat needs regular grooming to avoid matting.",
        behaviorNotes: "Calm; prefers quiet environment.",
        homeSuitability: { apartmentOk: "Yes", kidFriendly: "Yes (supervised)", petFriendly: "Unknown", aloneHoursMax: 4 }
      },
      {
        id: 10,
        name: "Charlie",
        species: "Dog",
        age: "Adult",
        location: "Gujarat",
        breed: "Poodle Mix",
        image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "White",
        sex: "Male",
        heightCm: 45,
        weightKg: 14,
        patchesColor: "Cream ears",
        injected: ["Rabies", "DHPP"],
        medicine: [],
        sterilized: "Yes",
        microchipped: "No",
        vetChecked: "Yes",
        fromWhere: "Partner Shelter (Gujarat Zone)",
        previousAdopted: "Yes",
        previousAdoptedBy: "",
        returnedReason: "Owner health issues",
        healthNotes: "Healthy adult; grooming required.",
        behaviorNotes: "Smart; responds well to training.",
        homeSuitability: { apartmentOk: "Yes", kidFriendly: "Yes", petFriendly: "Yes", aloneHoursMax: 6 }
      },
      {
        id: 11,
        name: "Nala",
        species: "Cat",
        age: "Baby",
        location: "New Delhi",
        breed: "Calico",
        image: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "Calico (white/orange/black)",
        sex: "Female",
        heightCm: 18,
        weightKg: 1.4,
        patchesColor: "Orange patch on head",
        injected: ["FVRCP (Kitten Dose 1)"],
        medicine: ["Deworming completed"],
        sterilized: "No",
        microchipped: "No",
        vetChecked: "Yes",
        fromWhere: "Rescue Intake (New Delhi Zone)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Kitten—vaccines to be continued.",
        behaviorNotes: "Playful; litter training in progress.",
        homeSuitability: { apartmentOk: "Yes", kidFriendly: "Yes", petFriendly: "Yes (slow intro)", aloneHoursMax: 3 }
      },
      {
        id: 12,
        name: "Bruno",
        species: "Dog",
        age: "Young",
        location: "Mumbai",
        breed: "Boxer Mix",
        image: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "Brown",
        sex: "Male",
        heightCm: 58,
        weightKg: 22,
        patchesColor: "White chest",
        injected: ["Rabies", "DHPP"],
        medicine: [],
        sterilized: "No",
        microchipped: "Yes",
        vetChecked: "Yes",
        fromWhere: "Partner Shelter (Mumbai Zone)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Healthy young dog; high energy.",
        behaviorNotes: "Needs daily exercise and basic training.",
        homeSuitability: { apartmentOk: "Yes (active family)", kidFriendly: "Yes", petFriendly: "Yes", aloneHoursMax: 5 }
      },
      {
        id: 13,
        name: "Kiwi",
        species: "Bird",
        age: "Young",
        location: "Uttar Pradesh",
        breed: "Lovebird",
        image: "https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "Green/Yellow",
        sex: "Unknown",
        heightCm: 15,
        weightKg: 0.05,
        patchesColor: "Orange face tint",
        injected: ["N/A (avian)"],
        medicine: [],
        sterilized: "N/A",
        microchipped: "N/A",
        vetChecked: "Yes",
        fromWhere: "Bird Rescue (UP Zone)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Feathers healthy; needs proper cage and diet.",
        behaviorNotes: "Active; needs enrichment and interaction.",
        homeSuitability: { apartmentOk: "Yes", kidFriendly: "Yes (supervised)", petFriendly: "Unknown", aloneHoursMax: 4 }
      },
      {
        id: 14,
        name: "Mithu",
        species: "Parrot",
        age: "Adult",
        location: "Gujarat",
        breed: "Indian Ringneck",
        image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=900&q=80",
        type: "Owner Surrender",
        color: "Green",
        sex: "Male",
        heightCm: 40,
        weightKg: 0.12,
        patchesColor: "Neck ring",
        injected: ["N/A (avian)"],
        medicine: [],
        sterilized: "N/A",
        microchipped: "N/A",
        vetChecked: "Yes",
        fromWhere: "Owner Surrender (Gujarat Zone)",
        previousAdopted: "Yes",
        previousAdoptedBy: "",
        returnedReason: "Noise complaints / housing issue",
        healthNotes: "Healthy; needs socialization.",
        behaviorNotes: "Can bite if stressed; needs calm handler.",
        homeSuitability: { apartmentOk: "Yes (noise-aware)", kidFriendly: "Unknown", petFriendly: "Unknown", aloneHoursMax: 3 }
      },
      {
        id: 15,
        name: "Nibbles",
        species: "Hamster",
        age: "Baby",
        location: "New Delhi",
        breed: "Syrian Hamster",
        image: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "Golden",
        sex: "Unknown",
        heightCm: 10,
        weightKg: 0.12,
        patchesColor: "",
        injected: ["N/A (small mammal)"],
        medicine: [],
        sterilized: "N/A",
        microchipped: "N/A",
        vetChecked: "Yes",
        fromWhere: "Small Pet Rescue (New Delhi Zone)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Healthy; needs clean bedding and wheel.",
        behaviorNotes: "Nocturnal; gentle handling required.",
        homeSuitability: { apartmentOk: "Yes", kidFriendly: "Yes (supervised)", petFriendly: "No (separate habitat)", aloneHoursMax: 6 }
      },
      {
        id: 16,
        name: "Peanut",
        species: "Guinea Pig",
        age: "Young",
        location: "Chennai",
        breed: "Abyssinian Guinea Pig",
        image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "Brown/White",
        sex: "Male",
        heightCm: 22,
        weightKg: 0.8,
        patchesColor: "White stripe",
        injected: ["N/A (small mammal)"],
        medicine: ["Vitamin C supplementation (diet plan)"],
        sterilized: "N/A",
        microchipped: "N/A",
        vetChecked: "Yes",
        fromWhere: "Foster Network (Chennai Zone)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Diet must include Vitamin C.",
        behaviorNotes: "Social; prefers gentle handling.",
        homeSuitability: { apartmentOk: "Yes", kidFriendly: "Yes (supervised)", petFriendly: "No (separate habitat)", aloneHoursMax: 6 }
      },
      {
        id: 17,
        name: "Shelly",
        species: "Turtle",
        age: "Adult",
        location: "Uttar Pradesh",
        breed: "Red-Eared Slider",
        image: "https://images.unsplash.com/photo-1496196614460-48988a57fccf?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "Olive/Green",
        sex: "Unknown",
        heightCm: 20,
        weightKg: 1.5,
        patchesColor: "Red ear markings",
        injected: ["N/A (reptile)"],
        medicine: [],
        sterilized: "N/A",
        microchipped: "N/A",
        vetChecked: "Yes",
        fromWhere: "Wildlife Support Intake (UP Zone)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Needs UVB light and proper basking area.",
        behaviorNotes: "Low handling; habitat-focused care.",
        homeSuitability: { apartmentOk: "Yes", kidFriendly: "Yes (supervised)", petFriendly: "No (separate habitat)", aloneHoursMax: 8 }
      },
      {
        id: 18,
        name: "Bubbles",
        species: "Fish",
        age: "Young",
        location: "Gujarat",
        breed: "Goldfish",
        image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=900&q=80",
        type: "Owner Surrender",
        color: "Orange",
        sex: "Unknown",
        heightCm: 8,
        weightKg: 0.05,
        patchesColor: "",
        injected: ["N/A (aquatic)"],
        medicine: [],
        sterilized: "N/A",
        microchipped: "N/A",
        vetChecked: "Unknown",
        fromWhere: "Owner Surrender (Gujarat Zone)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Needs proper tank size and filtration.",
        behaviorNotes: "Peaceful; keep water parameters stable.",
        homeSuitability: { apartmentOk: "Yes", kidFriendly: "Yes (supervised)", petFriendly: "No (separate habitat)", aloneHoursMax: 10 }
      },
      {
        id: 19,
        name: "Storm",
        species: "Horse",
        age: "Adult",
        location: "Uttar Pradesh",
        breed: "Arabian",
        image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "Gray",
        sex: "Male",
        heightCm: 155,
        weightKg: 420,
        patchesColor: "",
        injected: ["Tetanus", "Equine Influenza"],
        medicine: [],
        sterilized: "Unknown",
        microchipped: "Unknown",
        vetChecked: "Yes",
        fromWhere: "Large Animal Rescue (UP Zone)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Healthy; requires regular farrier visits.",
        behaviorNotes: "Trained; needs experienced caretaker.",
        homeSuitability: { apartmentOk: "No", kidFriendly: "Unknown", petFriendly: "Unknown", aloneHoursMax: 2 }
      },
      {
        id: 20,
        name: "Golu",
        species: "Goat",
        age: "Young",
        location: "Chennai",
        breed: "Boer Goat",
        image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "White/Brown",
        sex: "Male",
        heightCm: 60,
        weightKg: 35,
        patchesColor: "Brown head patch",
        injected: ["CDT (Clostridial)"],
        medicine: ["Deworming completed"],
        sterilized: "Unknown",
        microchipped: "Unknown",
        vetChecked: "Yes",
        fromWhere: "Farm Rescue Intake (Chennai Zone)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Healthy; requires proper enclosure.",
        behaviorNotes: "Curious; can be mischievous.",
        homeSuitability: { apartmentOk: "No", kidFriendly: "Yes (supervised)", petFriendly: "Unknown", aloneHoursMax: 3 }
      },
      {
        id: 21,
        name: "Gauri",
        species: "Cow",
        age: "Adult",
        location: "New Delhi",
        breed: "Jersey Cow",
        image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "Light brown",
        sex: "Female",
        heightCm: 130,
        weightKg: 380,
        patchesColor: "White muzzle",
        injected: ["FMD (as per schedule)"],
        medicine: [],
        sterilized: "N/A",
        microchipped: "Unknown",
        vetChecked: "Yes",
        fromWhere: "Gaushala Partner Intake (New Delhi)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Healthy adult; needs open space and feeding plan.",
        behaviorNotes: "Calm; gentle handling.",
        homeSuitability: { apartmentOk: "No", kidFriendly: "Yes (supervised)", petFriendly: "Unknown", aloneHoursMax: 2 }
      },
      {
        id: 22,
        name: "Donald",
        species: "Duck",
        age: "Young",
        location: "Mumbai",
        breed: "Pekin Duck",
        image: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "White",
        sex: "Unknown",
        heightCm: 35,
        weightKg: 2.6,
        patchesColor: "Orange beak/feet",
        injected: ["N/A (poultry)"],
        medicine: [],
        sterilized: "N/A",
        microchipped: "N/A",
        vetChecked: "Yes",
        fromWhere: "Rescue Intake (Mumbai Zone)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Needs clean water access and safe enclosure.",
        behaviorNotes: "Social; best with proper space.",
        homeSuitability: { apartmentOk: "No", kidFriendly: "Yes (supervised)", petFriendly: "Unknown", aloneHoursMax: 3 }
      },
      {
        id: 23,
        name: "Clucky",
        species: "Chicken",
        age: "Adult",
        location: "Gujarat",
        breed: "Silkie",
        image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "White",
        sex: "Female",
        heightCm: 28,
        weightKg: 1.6,
        patchesColor: "Fluffy crest",
        injected: ["N/A (poultry)"],
        medicine: [],
        sterilized: "N/A",
        microchipped: "N/A",
        vetChecked: "Yes",
        fromWhere: "Rescue Intake (Gujarat Zone)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Requires clean coop; check for mites regularly.",
        behaviorNotes: "Docile breed; easy to manage.",
        homeSuitability: { apartmentOk: "No", kidFriendly: "Yes (supervised)", petFriendly: "Unknown", aloneHoursMax: 4 }
      },
      {
        id: 24,
        name: "Skyler",
        species: "Pigeon",
        age: "Young",
        location: "Mumbai",
        breed: "Homing Pigeon",
        image: "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "Gray",
        sex: "Unknown",
        heightCm: 30,
        weightKg: 0.35,
        patchesColor: "Iridescent neck",
        injected: ["N/A (avian)"],
        medicine: [],
        sterilized: "N/A",
        microchipped: "N/A",
        vetChecked: "Yes",
        fromWhere: "Rescue Pickup (Mumbai Zone)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Healthy; needs safe flight space or proper aviary.",
        behaviorNotes: "Gentle; may take time to trust.",
        homeSuitability: { apartmentOk: "Yes (aviary)", kidFriendly: "Yes (supervised)", petFriendly: "Unknown", aloneHoursMax: 5 }
      },
      {
        id: 25,
        name: "Slinky",
        species: "Ferret",
        age: "Young",
        location: "Chennai",
        breed: "Domestic Ferret",
        image: "https://images.unsplash.com/photo-1591561582301-7ce6588cc286?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "Sable",
        sex: "Female",
        heightCm: 38,
        weightKg: 1.1,
        patchesColor: "Dark face mask",
        injected: ["N/A (species-based)"],
        medicine: [],
        sterilized: "Unknown",
        microchipped: "Unknown",
        vetChecked: "Yes",
        fromWhere: "Exotic Pet Rescue (Chennai Zone)",
        previousAdopted: "Yes",
        previousAdoptedBy: "",
        returnedReason: "Care requirements too high",
        healthNotes: "Needs secure enclosure; monitor diet.",
        behaviorNotes: "Very playful; needs supervision outside cage.",
        homeSuitability: { apartmentOk: "Yes", kidFriendly: "Unknown", petFriendly: "Unknown", aloneHoursMax: 4 }
      },
      {
        id: 26,
        name: "Spike",
        species: "Hedgehog",
        age: "Adult",
        location: "Uttar Pradesh",
        breed: "African Pygmy Hedgehog",
        image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "Brown/White spines",
        sex: "Male",
        heightCm: 18,
        weightKg: 0.45,
        patchesColor: "",
        injected: ["N/A (exotic)"],
        medicine: [],
        sterilized: "N/A",
        microchipped: "N/A",
        vetChecked: "Yes",
        fromWhere: "Exotic Pet Rescue (UP Zone)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Needs correct temperature and bedding.",
        behaviorNotes: "Nocturnal; may be shy initially.",
        homeSuitability: { apartmentOk: "Yes", kidFriendly: "Yes (supervised)", petFriendly: "No (separate habitat)", aloneHoursMax: 6 }
      },
      {
        id: 27,
        name: "Rocky Shell",
        species: "Tortoise",
        age: "Adult",
        location: "New Delhi",
        breed: "Indian Star Tortoise",
        image: "https://images.unsplash.com/photo-1456926631375-92c8ce872def?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "Brown/Yellow shell",
        sex: "Unknown",
        heightCm: 22,
        weightKg: 2.2,
        patchesColor: "Star shell pattern",
        injected: ["N/A (reptile)"],
        medicine: [],
        sterilized: "N/A",
        microchipped: "N/A",
        vetChecked: "Yes",
        fromWhere: "Wildlife Support Intake (New Delhi)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Needs UVB and proper diet.",
        behaviorNotes: "Low handling; habitat-focused care.",
        homeSuitability: { apartmentOk: "Yes", kidFriendly: "Yes (supervised)", petFriendly: "No (separate habitat)", aloneHoursMax: 10 }
      },
      {
        id: 28,
        name: "Momo",
        species: "Parrot",
        age: "Young",
        location: "Delhi",
        breed: "Alexandrine Parakeet",
        image: "https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "Green",
        sex: "Unknown",
        heightCm: 55,
        weightKg: 0.25,
        patchesColor: "Red shoulder patch",
        injected: ["N/A (avian)"],
        medicine: [],
        sterilized: "N/A",
        microchipped: "N/A",
        vetChecked: "Yes",
        fromWhere: "Bird Rescue (Delhi)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Healthy; needs large cage and enrichment.",
        behaviorNotes: "Active and vocal; training recommended.",
        homeSuitability: { apartmentOk: "Yes (noise-aware)", kidFriendly: "Yes (supervised)", petFriendly: "Unknown", aloneHoursMax: 3 }
      },
      {
        id: 29,
        name: "Fluffy",
        species: "Guinea Pig",
        age: "Baby",
        location: "Pune",
        breed: "Peruvian Guinea Pig",
        image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "White/Brown",
        sex: "Female",
        heightCm: 18,
        weightKg: 0.55,
        patchesColor: "Brown back patch",
        injected: ["N/A (small mammal)"],
        medicine: ["Vitamin C supplementation (diet plan)"],
        sterilized: "N/A",
        microchipped: "N/A",
        vetChecked: "Yes",
        fromWhere: "Foster Network (Pune Zone)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Long coat needs gentle grooming.",
        behaviorNotes: "Very gentle; handle softly.",
        homeSuitability: { apartmentOk: "Yes", kidFriendly: "Yes (supervised)", petFriendly: "No (separate habitat)", aloneHoursMax: 6 }
      },
      {
        id: 30,
        name: "Marsh",
        species: "Duck",
        age: "Adult",
        location: "Bangalore",
        breed: "Runner Duck",
        image: "https://images.unsplash.com/photo-1466721591366-2d5fba72006d?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "Brown",
        sex: "Unknown",
        heightCm: 50,
        weightKg: 2.0,
        patchesColor: "",
        injected: ["N/A (poultry)"],
        medicine: [],
        sterilized: "N/A",
        microchipped: "N/A",
        vetChecked: "Yes",
        fromWhere: "Rescue Intake (Bangalore Zone)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Needs safe outdoor area and clean water.",
        behaviorNotes: "Active; best with proper space.",
        homeSuitability: { apartmentOk: "No", kidFriendly: "Yes (supervised)", petFriendly: "Unknown", aloneHoursMax: 3 }
      },
      {
        id: 31,
        name: "Bunny",
        species: "Rabbit",
        age: "Young",
        location: "Pune",
        breed: "Dutch Rabbit",
        image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "Black/White",
        sex: "Male",
        heightCm: 22,
        weightKg: 2.0,
        patchesColor: "Dutch face pattern",
        injected: ["N/A (species-based)"],
        medicine: [],
        sterilized: "Unknown",
        microchipped: "No",
        vetChecked: "Yes",
        fromWhere: "Foster Network (Pune Zone)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Healthy; needs hay-based diet.",
        behaviorNotes: "Curious; gentle handling recommended.",
        homeSuitability: { apartmentOk: "Yes", kidFriendly: "Yes (supervised)", petFriendly: "Unknown", aloneHoursMax: 4 }
      },
      {
        id: 32,
        name: "Thunder",
        species: "Horse",
        age: "Adult",
        location: "Jaipur",
        breed: "Marwari Horse",
        image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=900&q=80",
        type: "Rescue",
        color: "Bay",
        sex: "Male",
        heightCm: 160,
        weightKg: 450,
        patchesColor: "Black mane/tail",
        injected: ["Tetanus", "Equine Influenza"],
        medicine: [],
        sterilized: "Unknown",
        microchipped: "Unknown",
        vetChecked: "Yes",
        fromWhere: "Large Animal Rescue (Jaipur Zone)",
        previousAdopted: "No",
        previousAdoptedBy: "",
        returnedReason: "",
        healthNotes: "Healthy; requires trained caretaker and stable.",
        behaviorNotes: "Trained; needs regular exercise.",
        homeSuitability: { apartmentOk: "No", kidFriendly: "Unknown", petFriendly: "Unknown", aloneHoursMax: 2 }
      }
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

  container.innerHTML = animals
    .map(
      (animal) => `
    <div class="card animal-card dynamic-animal-card">
      <img src="${animal.image}" alt="${animal.name}" onerror="this.src='https://placehold.co/900x600/F4E9D8/8B5E3C?text=AdoptMe+Pet';">
      <div class="animal-card-content">
        <h3>${animal.name}</h3>
        <p class="animal-meta">${animal.species} • ${animal.age} • ${animal.location}</p>
        <p>${animal.breed}</p>
        <a href="adopt.html" class="btn btn-primary btn-sm">View & Adopt</a>
      </div>
    </div>
  `
    )
    .join("");
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
    subscribers.push({ email, createdAt: new Date().toLocaleString() });
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

  if (topBtn) topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  if (bottomBtn) {
    bottomBtn.addEventListener("click", () =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })
    );
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

  const adoptions = getStorage("adoptme_adoptions", []).filter((item) => item.email === user.email);
  const donations = getStorage("adoptme_donations", []).filter((item) => item.email === user.email);
  const volunteers = getStorage("adoptme_volunteers", []).filter((item) => item.email === user.email);

  const myAdoptionsCount = document.getElementById("myAdoptionsCount");
  const myDonationsCount = document.getElementById("myDonationsCount");
  const myVolunteerCount = document.getElementById("myVolunteerCount");
  if (myAdoptionsCount) myAdoptionsCount.textContent = adoptions.length;
  if (myDonationsCount) myDonationsCount.textContent = donations.length;
  if (myVolunteerCount) myVolunteerCount.textContent = volunteers.length;

  const adoptionsList = document.getElementById("dashboardAdoptionsList");
  if (adoptionsList) {
    adoptionsList.innerHTML = adoptions.length
      ? adoptions
          .map(
            (a) => `
        <div class="list-item">
          <strong>${a.animalName}</strong><br>
          <small>Status: ${a.status} • ${a.createdAt}</small>
        </div>
      `
          )
          .join("")
      : `<div class="list-item">No adoption requests yet.</div>`;
  }

  const contributions = document.getElementById("dashboardContributions");
  if (contributions) {
    const rows = [
      ...donations.map(
        (d) => `
        <div class="list-item">
          <strong>Donation:</strong> ₹${d.amount}<br>
          <small>${d.type} • ${d.paymentMethod} • ${d.createdAt}</small>
        </div>
      `
      ),
      ...volunteers.map(
        (v) => `
        <div class="list-item">
          <strong>Volunteer:</strong> ${v.skills}<br>
          <small>${v.availability} • ${v.createdAt}</small>
        </div>
      `
      )
    ];

    contributions.innerHTML = rows.length ? rows.join("") : `<div class="list-item">No contributions yet.</div>`;
  }

  const advanced = document.getElementById("dashboardAdvancedAdoptions");
  if (advanced) {
    advanced.innerHTML = adoptions.length
      ? adoptions
          .map(
            (app) => `
        <div class="list-item">
          <strong>${app.animalName}</strong> • ${app.status}<br>
          <small>ID Type: ${app.idType || "-"} | Aadhaar: ${app.aadhaarNumber || "-"}</small><br>
          <small>Citizenship: ${app.citizenship || "-"} | City: ${app.city || "-"}, ${app.state || "-"}</small><br>
          <small>Photo: ${app.photoFileName || "Not uploaded"} | Document: ${app.documentFileName || "Not uploaded"}</small>
        </div>
      `
          )
          .join("")
      : `<div class="list-item">No verified adoption details yet.</div>`;
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
  if (adminRescueCount) adminRescueCount.textContent = rescues.length;
}

/* =========================================================
   Home Welcome Cards (unchanged utility)
   ========================================================= */
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
    guestLinks.forEach((link) => (link.style.display = ""));
    if (navbarWelcomeCard) navbarWelcomeCard.classList.remove("show", "open");
    if (heroWelcomeCard) heroWelcomeCard.classList.remove("show");
    return;
  }

  guestLinks.forEach((link) => (link.style.display = "none"));
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
   Init All Pages
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