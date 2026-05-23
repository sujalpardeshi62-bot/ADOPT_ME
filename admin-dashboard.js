document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page !== "admin-dashboard") return;

  const animals = JSON.parse(localStorage.getItem("adoptme_animals")) || [];
  const adoptions = JSON.parse(localStorage.getItem("adoptme_adoptions")) || [];
  const donations = JSON.parse(localStorage.getItem("adoptme_donations")) || [];
  const volunteers = JSON.parse(localStorage.getItem("adoptme_volunteers")) || [];
  const rescues = JSON.parse(localStorage.getItem("adoptme_rescue_requests")) || [];
  const lostReports = JSON.parse(localStorage.getItem("adoptme_lost_reports")) || [];
  const foundReports = JSON.parse(localStorage.getItem("adoptme_found_reports")) || [];
  const events = JSON.parse(localStorage.getItem("adoptme_events")) || [];

  const adminAnimalsCount = document.getElementById("adminAnimalsCount");
  const adminAdoptionsCount = document.getElementById("adminAdoptionsCount");
  const adminDonationsCount = document.getElementById("adminDonationsCount");
  const adminVolunteersCount = document.getElementById("adminVolunteersCount");
  const adminRescueCount = document.getElementById("adminRescueCount");
  const adminLostFoundCount = document.getElementById("adminLostFoundCount");
  const adminEventsCount = document.getElementById("adminEventsCount");

  if (adminAnimalsCount) adminAnimalsCount.textContent = animals.length;
  if (adminAdoptionsCount) adminAdoptionsCount.textContent = adoptions.length;
  if (adminDonationsCount) adminDonationsCount.textContent = donations.length;
  if (adminVolunteersCount) adminVolunteersCount.textContent = volunteers.length;
  if (adminRescueCount) adminRescueCount.textContent = rescues.length;
  if (adminLostFoundCount) adminLostFoundCount.textContent = lostReports.length + foundReports.length;
  if (adminEventsCount) adminEventsCount.textContent = events.length;
});