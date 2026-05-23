document.addEventListener("DOMContentLoaded", () => {
  const USERS_KEY = "adoptme_users";
  const CURRENT_USER_KEY = "adoptme_current_user";
  const THEME_KEY = "adoptme_theme";

  const page = document.body.dataset.page;
  const themeToggleBtn = document.getElementById("themeToggleBtn");

  function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)) || null;
  }

  function setCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  function clearCurrentUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  function normalizeRole(role) {
    const value = String(role || "").toLowerCase();
    if (value === "user") return "User";
    if (value === "shelter staff" || value === "shelter") return "Shelter Staff";
    if (value === "volunteer") return "Volunteer";
    if (value === "admin") return "Admin";
    return "User";
  }

  function ensureDefaultAdmins() {
    const users = getUsers();

    const hasAshish = users.some(user => user.email === "ashish.admin@adoptme.local");
    const hasSujal = users.some(user => user.email === "sujal.admin@adoptme.local");

    if (!hasAshish) {
      users.push({
        id: "USR-ADMIN-ASHISH",
        name: "Ashish",
        email: "ashish.admin@adoptme.local",
        phone: "",
        password: "Ashish@123",
        role: "Admin",
        profilePhoto: "",
        city: "",
        bio: "Admin Account",
        shelterName: "",
        shelterLocation: "",
        volunteerSkills: "",
        volunteerAvailability: "",
        createdAt: new Date().toLocaleString()
      });
    }

    if (!hasSujal) {
      users.push({
        id: "USR-ADMIN-SUJAL",
        name: "Sujal",
        email: "sujal.admin@adoptme.local",
        phone: "",
        password: "Sujal@123",
        role: "Admin",
        profilePhoto: "",
        city: "",
        bio: "Admin Account",
        shelterName: "",
        shelterLocation: "",
        volunteerSkills: "",
        volunteerAvailability: "",
        createdAt: new Date().toLocaleString()
      });
    }

    saveUsers(users);
  }

  function syncCurrentUserWithStoredUsers() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const users = getUsers();
    const matchedUser = users.find(user => user.email === currentUser.email);

    if (!matchedUser) return;

    const updatedSessionUser = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      phone: matchedUser.phone || "",
      role: normalizeRole(matchedUser.role),
      profilePhoto: matchedUser.profilePhoto || "",
      city: matchedUser.city || "",
      bio: matchedUser.bio || "",
      shelterName: matchedUser.shelterName || "",
      shelterLocation: matchedUser.shelterLocation || "",
      volunteerSkills: matchedUser.volunteerSkills || "",
      volunteerAvailability: matchedUser.volunteerAvailability || "",
      loggedIn: true
    };

    setCurrentUser(updatedSessionUser);
  }

  function requireDashboardLogin() {
    const currentUser = getCurrentUser();
    const protectedPages = ["dashboard", "profile"];

    if (protectedPages.includes(page) && !currentUser) {
      window.location.href = "newlogin.html";
    }
  }

  function protectAdminPages() {
    const currentUser = getCurrentUser();
    const isAdminPage = window.location.pathname.includes("/admin/") || page === "admin-dashboard";

    if (!isAdminPage) return;

    if (!currentUser) {
      window.location.href = "../newlogin.html";
      return;
    }

    if (normalizeRole(currentUser.role) !== "Admin") {
      alert("Access denied. Admins only.");
      window.location.href = "../index.html";
    }
  }

  function setupLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        clearCurrentUser();
        window.location.href = "newlogin.html";
      });
    }
  }

  function updateDashboardUserInfo() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const dashboardUserName = document.getElementById("dashboardUserName");
    const dashboardUserRole = document.getElementById("dashboardUserRole");

    if (dashboardUserName) dashboardUserName.textContent = currentUser.name || "User";
    if (dashboardUserRole) dashboardUserRole.textContent = normalizeRole(currentUser.role);
  }

  function injectNavbarProfileStyles() {
    if (document.getElementById("navbarProfileInlineStyles")) return;

    const style = document.createElement("style");
    style.id = "navbarProfileInlineStyles";
    style.textContent = `
      .navbar-profile-item {
        position: relative;
        list-style: none;
      }

      .navbar-profile-btn {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        background: transparent;
        border: none;
        color: inherit;
        cursor: pointer;
        font: inherit;
        padding: 8px 10px;
        border-radius: 999px;
      }

      .navbar-profile-btn:hover {
        background: rgba(139, 94, 60, 0.08);
      }

      .navbar-profile-avatar,
      .navbar-profile-avatar-lg {
        object-fit: cover;
        border-radius: 50%;
        overflow: hidden;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .navbar-profile-avatar {
        width: 34px;
        height: 34px;
      }

      .navbar-profile-avatar-lg {
        width: 54px;
        height: 54px;
      }

      .navbar-profile-avatar-placeholder {
        background: #f7efe3;
        color: #8B5E3C;
      }

      .navbar-profile-name {
        font-weight: 700;
      }

      .navbar-profile-menu {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        min-width: 240px;
        background: #fff;
        border: 1px solid rgba(139, 94, 60, 0.1);
        border-radius: 16px;
        box-shadow: 0 18px 44px rgba(0,0,0,0.12);
        padding: 12px;
        display: none;
        z-index: 999;
      }

      .navbar-profile-menu.show {
        display: block;
      }

      .navbar-profile-menu-head {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 10px 14px;
        border-bottom: 1px solid rgba(139, 94, 60, 0.1);
        margin-bottom: 8px;
      }

      .navbar-profile-menu-head strong {
        display: block;
        color: #8B5E3C;
      }

      .navbar-profile-menu-head small {
        color: #666;
      }

      .navbar-profile-menu a {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 12px;
        color: #333;
        text-decoration: none;
      }

      .navbar-profile-menu a:hover {
        background: #f7efe3;
        color: #8B5E3C;
      }

      body.dark-theme .navbar-profile-menu {
        background: #2a241f;
        border-color: rgba(255,255,255,0.06);
      }

      body.dark-theme .navbar-profile-menu a {
        color: #f1e9de;
      }

      body.dark-theme .navbar-profile-menu a:hover {
        background: #342d27;
      }

      body.dark-theme .navbar-profile-menu-head small {
        color: #ddd1c2;
      }

      body.dark-theme .navbar-profile-avatar-placeholder {
        background: #342d27;
        color: #f1e9de;
      }
    `;
    document.head.appendChild(style);
  }

  function injectNavbarProfileCard() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const navMenu = document.getElementById("navMenu");
    if (!navMenu) return;
    if (document.getElementById("navbarProfileDropdown")) return;

    const profileHtml = `
      <li class="navbar-profile-item" id="navbarProfileDropdown">
        <button class="navbar-profile-btn" id="navbarProfileBtn" type="button">
          ${
            currentUser.profilePhoto
              ? `<img src="${currentUser.profilePhoto}" alt="${currentUser.name}" class="navbar-profile-avatar" />`
              : `<span class="navbar-profile-avatar navbar-profile-avatar-placeholder"><i class="fa-solid fa-user"></i></span>`
          }
          <span class="navbar-profile-name">${currentUser.name || "User"}</span>
          <i class="fa-solid fa-chevron-down"></i>
        </button>

        <div class="navbar-profile-menu" id="navbarProfileMenu">
          <div class="navbar-profile-menu-head">
            ${
              currentUser.profilePhoto
                ? `<img src="${currentUser.profilePhoto}" alt="${currentUser.name}" class="navbar-profile-avatar-lg" />`
                : `<span class="navbar-profile-avatar-lg navbar-profile-avatar-placeholder"><i class="fa-solid fa-user"></i></span>`
            }
            <div>
              <strong>${currentUser.name || "User"}</strong>
              <small>${normalizeRole(currentUser.role)}</small>
            </div>
          </div>
          <a href="dashboard.html"><i class="fa-solid fa-table-columns"></i> Dashboard</a>
          <a href="profile.html"><i class="fa-solid fa-user-gear"></i> Profile Settings</a>
          <a href="#" id="navbarProfileLogoutLink"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
        </div>
      </li>
    `;

    navMenu.insertAdjacentHTML("beforeend", profileHtml);

    const profileBtn = document.getElementById("navbarProfileBtn");
    const profileMenu = document.getElementById("navbarProfileMenu");
    const logoutLink = document.getElementById("navbarProfileLogoutLink");

    if (profileBtn && profileMenu) {
      profileBtn.addEventListener("click", () => {
        profileMenu.classList.toggle("show");
      });

      document.addEventListener("click", (e) => {
        if (!document.getElementById("navbarProfileDropdown")?.contains(e.target)) {
          profileMenu.classList.remove("show");
        }
      });
    }

    if (logoutLink) {
      logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        clearCurrentUser();
        window.location.href = "newlogin.html";
      });
    }
  }

  function applyTheme(theme) {
    document.body.classList.toggle("dark-theme", theme === "dark");
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML =
        theme === "dark"
          ? '<i class="fa-solid fa-sun"></i>'
          : '<i class="fa-solid fa-moon"></i>';
    }
  }

  function setupThemeToggle() {
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const savedTheme = localStorage.getItem("adoptme_theme") || "light";
    applyTheme(savedTheme);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", () => {
        const newTheme = document.body.classList.contains("dark-theme") ? "light" : "dark";
        localStorage.setItem("adoptme_theme", newTheme);
        applyTheme(newTheme);
      });
    }
  }

  function toggleGuestLinks() {
  const currentUser = getCurrentUser();
  const guestLinks = document.querySelectorAll(".guest-only-link");

  guestLinks.forEach(link => {
    link.style.display = currentUser ? "none" : "";
  });
}

  ensureDefaultAdmins();
  syncCurrentUserWithStoredUsers();
  setupThemeToggle();
  requireDashboardLogin();
  protectAdminPages();
  setupLogout();
  updateDashboardUserInfo();
  injectNavbarProfileStyles();
  injectNavbarProfileCard();
  toggleGuestLinks();
});
