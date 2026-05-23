// ============ ADD THIS AT THE VERY TOP (MongoDB Connection for Volunteer) ============
const API_BASE_URL = 'http://localhost:5000/api';

// Save volunteer registration to MongoDB
async function saveVolunteerToMongoDB(volunteerData) {
    try {
        console.log('📤 Saving volunteer registration to MongoDB:', volunteerData.name);
        const response = await fetch(`${API_BASE_URL}/volunteers/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(volunteerData)
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('✅ Volunteer registration saved to MongoDB');
            return result.data;
        }
        return null;
    } catch (error) {
        console.error('Error saving volunteer registration to MongoDB:', error);
        return null;
    }
}

// Load volunteer registrations from MongoDB
async function loadVolunteersFromMongoDB() {
    try {
        const response = await fetch(`${API_BASE_URL}/volunteers/all`);
        const result = await response.json();
        
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
                verificationStatus: volunteer.verificationStatus,
                createdAt: volunteer.createdAt
            }));
            
            localStorage.setItem("adoptme_volunteers", JSON.stringify(formattedVolunteers));
            console.log(`✅ Loaded ${formattedVolunteers.length} volunteers from MongoDB`);
            return formattedVolunteers;
        }
        return [];
    } catch (error) {
        console.error('Error loading volunteers from MongoDB:', error);
        return [];
    }
}

document.addEventListener("DOMContentLoaded", async () => {
  const page = document.body.dataset.page;
  if (page !== "volunteer") return;

  // Load data from MongoDB first
  await loadVolunteersFromMongoDB();

  const volunteerForm = document.getElementById("volunteerForm");
  const volunteersList = document.getElementById("volunteersList");

  const volEmailError = document.getElementById("volEmailError");
  const volPhoneError = document.getElementById("volPhoneError");
  const volConsentError = document.getElementById("volConsentError");

  const previewVolunteerIdBtn = document.getElementById("previewVolunteerIdBtn");
  const downloadVolunteerIdBtn = document.getElementById("downloadVolunteerIdBtn");
  const printVolunteerIdBtn = document.getElementById("printVolunteerIdBtn");

  const volunteerPreviewModal = document.getElementById("volunteerPreviewModal");
  const closeVolunteerPreviewModal = document.getElementById("closeVolunteerPreviewModal");
  const volunteerPreviewContainer = document.getElementById("volunteerPreviewContainer");

  let lastVolunteer = null;

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    return /^[6-9]\d{9}$/.test(phone);
  }

  function clearErrors() {
    volEmailError.textContent = "";
    volPhoneError.textContent = "";
    volConsentError.textContent = "";
  }

  function renderVolunteers() {
    const volunteers = JSON.parse(localStorage.getItem("adoptme_volunteers")) || [];
    volunteersList.innerHTML = volunteers.length
      ? volunteers.slice().reverse().map(v => `
        <div class="list-item">
          <strong>${v.name}</strong><br>
          <small>${v.skills} • ${v.availability} • ${v.rolePreference}</small><br>
          <small>Volunteer ID: ${v.volunteerId}</small>
        </div>
      `).join("")
      : `<div class="list-item">No volunteer registrations yet.</div>`;
  }

  function fillVolunteerCard(volunteer) {
    document.getElementById("volunteerCardName").textContent = volunteer.name;
    document.getElementById("volunteerGeneratedId").textContent = volunteer.volunteerId;
    document.getElementById("volunteerCardEmail").textContent = volunteer.email;
    document.getElementById("volunteerCardPhone").textContent = volunteer.phone;
    document.getElementById("volunteerCardCity").textContent = volunteer.city;
    document.getElementById("volunteerCardRole").textContent = volunteer.rolePreference;
    document.getElementById("volunteerCardAvailability").textContent = volunteer.availability;
    document.getElementById("volunteerCardDate").textContent = volunteer.createdAt;
  }

  function getVolunteerCardHTML() {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>AdoptMe Volunteer ID</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f4e9d8;
            padding: 30px;
          }
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
      <body>${document.getElementById("volunteerIdCard").outerHTML}</body>
      </html>
    `;
  }

  function openVolunteerPreview() {
    if (!lastVolunteer) return;
    volunteerPreviewContainer.innerHTML = `
      <div class="receipt-preview-wrapper">
        ${document.getElementById("volunteerIdCard").outerHTML}
      </div>
    `;
    volunteerPreviewModal.classList.add("show");
  }

  if (closeVolunteerPreviewModal) {
    closeVolunteerPreviewModal.addEventListener("click", () => {
      volunteerPreviewModal.classList.remove("show");
    });
  }

  if (volunteerPreviewModal) {
    volunteerPreviewModal.addEventListener("click", (e) => {
      if (e.target === volunteerPreviewModal) {
        volunteerPreviewModal.classList.remove("show");
      }
    });
  }

  if (previewVolunteerIdBtn) {
    previewVolunteerIdBtn.addEventListener("click", openVolunteerPreview);
  }

  if (downloadVolunteerIdBtn) {
    downloadVolunteerIdBtn.addEventListener("click", () => {
      if (!lastVolunteer) return;
      const blob = new Blob([getVolunteerCardHTML()], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `adoptme-volunteer-id-${lastVolunteer.volunteerId}.html`;
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  if (printVolunteerIdBtn) {
    printVolunteerIdBtn.addEventListener("click", () => {
      if (!lastVolunteer) return;
      const printWindow = window.open("", "_blank");
      printWindow.document.write(getVolunteerCardHTML());
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 300);
    });
  }

  if (volunteerForm) {
    volunteerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors();

      const consentsAccepted =
        document.getElementById("volConsent1").checked &&
        document.getElementById("volConsent2").checked &&
        document.getElementById("volConsent3").checked;

      const volunteer = {
        id: Date.now(),
        volunteerId: "VOL-" + Date.now(),
        name: document.getElementById("volName").value.trim(),
        email: document.getElementById("volEmail").value.trim().toLowerCase(),
        phone: document.getElementById("volPhone").value.trim(),
        city: document.getElementById("volCity").value.trim(),
        photoFileName: document.getElementById("volPhoto").files[0]?.name || "",
        skills: document.getElementById("volSkills").value.trim(),
        availability: document.getElementById("volAvailability").value,
        rolePreference: document.getElementById("volRolePreference").value,
        reason: document.getElementById("volReason").value.trim(),
        emergencyContact: document.getElementById("volEmergencyContact").value.trim(),
        consentAccepted: consentsAccepted,
        verificationStatus: "Verified Registration Submitted",
        createdAt: new Date().toLocaleString()
      };

      let hasError = false;

      if (!validateEmail(volunteer.email)) {
        volEmailError.textContent = "Please enter a valid email address.";
        hasError = true;
      }

      if (!validatePhone(volunteer.phone)) {
        volPhoneError.textContent = "Please enter a valid 10-digit Indian mobile number.";
        hasError = true;
      }

      if (!volunteer.photoFileName) {
        showMessage("volunteerMessage", "Please upload your profile photo.", "error");
        hasError = true;
      }

      if (!consentsAccepted) {
        volConsentError.textContent = "Please accept all terms and conditions.";
        hasError = true;
      }

      if (hasError) return;

      // Save to localStorage (existing functionality)
      const volunteers = JSON.parse(localStorage.getItem("adoptme_volunteers")) || [];
      volunteers.push(volunteer);
      localStorage.setItem("adoptme_volunteers", JSON.stringify(volunteers));
      
      // Save to MongoDB
      await saveVolunteerToMongoDB(volunteer);

      lastVolunteer = volunteer;
      fillVolunteerCard(volunteer);

      previewVolunteerIdBtn.disabled = false;
      downloadVolunteerIdBtn.disabled = false;
      printVolunteerIdBtn.disabled = false;

      showMessage(
        "volunteerMessage",
        `Volunteer registration completed successfully! Your Volunteer ID is ${volunteer.volunteerId}. Verification submitted.`,
        "success"
      );

      volunteerForm.reset();
      renderVolunteers();
    });
  }

  renderVolunteers();
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