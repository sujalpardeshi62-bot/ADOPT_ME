/* =========================================================
   AdoptMe Admin JS
   - Manage Users
   - Manage Animals
   ========================================================= */

function adminCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("adoptme_current_user")) || null;
  } catch (error) {
    return null;
  }
}

function adminGetStorage(key, fallback = []) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function adminSetStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* =========================================================
   Protect Admin Pages
   ========================================================= */
function protectAdminPage() {
  const user = adminCurrentUser();
  if (!user || user.role !== "Admin") {
    alert("Access denied. Admins only.");
    window.location.href = "../newlogin.html";
  }
}

/* =========================================================
   Manage Users
   ========================================================= */
function renderAdminUsers() {
  const page = document.body.dataset.page;
  if (page !== "manage-users") return;

  const container = document.getElementById("adminUsersList");
  if (!container) return;

  const users = adminGetStorage("adoptme_users", []);
  const current = adminCurrentUser();

  if (!users.length) {
    container.innerHTML = `<div class="list-item">No users found.</div>`;
    return;
  }

  container.innerHTML = users.map(user => `
    <div class="list-item admin-row">
      <div class="admin-row-left">
        <h3>${user.name}</h3>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Role:</strong> ${user.role}</p>
      </div>

      <div class="admin-row-right">
        <select onchange="changeUserRole(${user.id}, this.value)" ${current && current.id === user.id ? "disabled" : ""}>
          <option value="User" ${user.role === "User" ? "selected" : ""}>User</option>
          <option value="Admin" ${user.role === "Admin" ? "selected" : ""}>Admin</option>
        </select>

        <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})" ${current && current.id === user.id ? "disabled" : ""}>
          Delete
        </button>
      </div>
    </div>
  `).join("");
}

function changeUserRole(userId, newRole) {
  const users = adminGetStorage("adoptme_users", []);
  const current = adminCurrentUser();

  const updatedUsers = users.map(user => {
    if (user.id === userId) {
      if (current && current.id === user.id) return user;
      return { ...user, role: newRole };
    }
    return user;
  });

  adminSetStorage("adoptme_users", updatedUsers);
  renderAdminUsers();
}

function deleteUser(userId) {
  const current = adminCurrentUser();
  if (current && current.id === userId) {
    alert("You cannot delete your own admin account.");
    return;
  }

  const confirmed = confirm("Are you sure you want to delete this user?");
  if (!confirmed) return;

  const users = adminGetStorage("adoptme_users", []);
  const updatedUsers = users.filter(user => user.id !== userId);

  adminSetStorage("adoptme_users", updatedUsers);
  renderAdminUsers();
}

/* =========================================================
   Manage Animals
   ========================================================= */
function renderAdminAnimals() {
  const page = document.body.dataset.page;
  if (page !== "manage-animals") return;

  const container = document.getElementById("adminAnimalsList");
  if (!container) return;

  const animals = adminGetStorage("adoptme_animals", []);

  if (!animals.length) {
    container.innerHTML = `<div class="list-item">No animals found.</div>`;
    return;
  }

  container.innerHTML = animals.map(animal => `
    <div class="list-item admin-row animal-admin-item">
      <div class="admin-row-left animal-admin-left">
        <img src="${animal.image}" alt="${animal.name}" class="admin-animal-thumb"
             onerror="this.src='https://placehold.co/120x90/F4E9D8/8B5E3C?text=Pet';">
        <div>
          <h3>${animal.name}</h3>
          <p><strong>Species:</strong> ${animal.species}</p>
          <p><strong>Age:</strong> ${animal.age}</p>
          <p><strong>Breed:</strong> ${animal.breed}</p>
          <p><strong>Location:</strong> ${animal.location}</p>
        </div>
      </div>

      <div class="admin-row-right">
        <button class="btn btn-secondary btn-sm" onclick="editAnimal(${animal.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteAnimal(${animal.id})">Delete</button>
      </div>
    </div>
  `).join("");
}

function initAnimalForm() {
  const page = document.body.dataset.page;
  if (page !== "manage-animals") return;

  const form = document.getElementById("animalForm");
  const resetBtn = document.getElementById("resetAnimalForm");

  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const id = document.getElementById("animalId").value.trim();
    const name = document.getElementById("animalName").value.trim();
    const species = document.getElementById("animalSpecies").value.trim();
    const age = document.getElementById("animalAge").value.trim();
    const location = document.getElementById("animalLocation").value.trim();
    const breed = document.getElementById("animalBreed").value.trim();
    const image = document.getElementById("animalImage").value.trim();

    let animals = adminGetStorage("adoptme_animals", []);

    if (id) {
      animals = animals.map(animal =>
        animal.id === Number(id)
          ? { ...animal, name, species, age, location, breed, image }
          : animal
      );
    } else {
      const newAnimal = {
        id: Date.now(),
        name,
        species,
        age,
        location,
        breed,
        image
      };
      animals.push(newAnimal);
    }

    adminSetStorage("adoptme_animals", animals);
    form.reset();
    document.getElementById("animalId").value = "";
    renderAdminAnimals();
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", resetAnimalForm);
  }
}

function editAnimal(animalId) {
  const animals = adminGetStorage("adoptme_animals", []);
  const animal = animals.find(item => item.id === animalId);
  if (!animal) return;

  document.getElementById("animalId").value = animal.id;
  document.getElementById("animalName").value = animal.name;
  document.getElementById("animalSpecies").value = animal.species;
  document.getElementById("animalAge").value = animal.age;
  document.getElementById("animalLocation").value = animal.location;
  document.getElementById("animalBreed").value = animal.breed;
  document.getElementById("animalImage").value = animal.image;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteAnimal(animalId) {
  const confirmed = confirm("Are you sure you want to delete this animal?");
  if (!confirmed) return;

  const animals = adminGetStorage("adoptme_animals", []);
  const updatedAnimals = animals.filter(animal => animal.id !== animalId);

  adminSetStorage("adoptme_animals", updatedAnimals);
  renderAdminAnimals();
  resetAnimalForm();
}

function resetAnimalForm() {
  const form = document.getElementById("animalForm");
  if (form) form.reset();

  const animalId = document.getElementById("animalId");
  if (animalId) animalId.value = "";
}

/* =========================================================
   Init Admin
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  protectAdminPage();
  renderAdminUsers();
  renderAdminAnimals();
  initAnimalForm();
});