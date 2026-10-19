/* =========================================================
   IRO – Issues Reporting Outlet
   Core application logic (client-side, localStorage based)
   ========================================================= */

/* ---------- Constants ---------- */
const STORAGE_KEY = "iro_issues";
const SESSION_KEY = "iro_admin_session";

// Demo administrator account (for coursework demonstration only)
const ADMIN = { username: "admin", password: "iro2026" };

const CATEGORIES = [
  "Security / Safety",
  "Accommodation / Rent",
  "Student–Indigene Conflict",
  "Harassment / Extortion",
  "Land / Property Dispute",
  "Road / Transport",
  "Water / Electricity",
  "Environment / Sanitation",
  "Health",
  "Other"
];

const COMMUNITIES = ["Akungba", "Iwaro", "Etioro", "Ayegunle", "Other"];
const STATUSES = ["Pending", "Under Review", "Resolved", "Rejected"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

/* ---------- Class: Issue ---------- */
class Issue {
  constructor(data) {
    this.id = data.id || Issue.generateId();
    this.reporterType = data.reporterType;         // "Student" | "Indigene"
    this.anonymous = !!data.anonymous;
    this.name = this.anonymous ? "Anonymous" : (data.name || "Anonymous");
    this.phone = this.anonymous ? "" : (data.phone || "");
    this.matricNo = data.matricNo || "";            // students only
    this.community = data.community || "";          // indigenes / location
    this.category = data.category;
    this.priority = data.priority || "Medium";
    this.title = data.title;
    this.description = data.description;
    this.location = data.location || "";
    this.status = data.status || "Pending";
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updates = data.updates || [
      { status: "Pending", note: "Issue submitted.", date: this.createdAt }
    ];
  }

  static generateId() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return "IRO-" + code;
  }

  addUpdate(status, note) {
    this.status = status;
    this.updates.push({ status, note, date: new Date().toISOString() });
  }
}

/* ---------- Class: IssueStore (data access) ---------- */
class IssueStore {
  static load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return raw.map(d => new Issue(d));
    } catch (e) {
      return [];
    }
  }

  static saveAll(issues) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(issues)); } catch (e) { /* storage blocked */ }
  }

  static add(issue) {
    const all = IssueStore.load();
    all.unshift(issue);
    IssueStore.saveAll(all);
    return issue;
  }

  static find(id) {
    id = (id || "").trim().toUpperCase();
    return IssueStore.load().find(i => i.id === id);
  }

  static update(issue) {
    const all = IssueStore.load().map(i => (i.id === issue.id ? issue : i));
    IssueStore.saveAll(all);
  }

  static remove(id) {
    IssueStore.saveAll(IssueStore.load().filter(i => i.id !== id));
  }

  static stats() {
    const all = IssueStore.load();
    const count = s => all.filter(i => i.status === s).length;
    return {
      total: all.length,
      pending: count("Pending"),
      review: count("Under Review"),
      resolved: count("Resolved"),
      students: all.filter(i => i.reporterType === "Student").length,
      indigenes: all.filter(i => i.reporterType === "Indigene").length
    };
  }
}

/* ---------- Class: Auth (admin session) ---------- */
class Auth {
  static login(username, password) {
    if (username === ADMIN.username && password === ADMIN.password) {
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (e) {}
      return true;
    }
    return false;
  }
  static isLoggedIn() {
    try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch (e) { return false; }
  }
  static logout() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
  }
}

/* ---------- Helpers ---------- */
function $(sel) { return document.querySelector(sel); }

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
}

function badge(status) {
  return `<span class="badge s-${status.replace(/\s/g, "-")}">${status}</span>`;
}

function fillSelect(select, options, placeholder) {
  select.innerHTML = (placeholder ? `<option value="">${placeholder}</option>` : "") +
    options.map(o => `<option>${o}</option>`).join("");
}

/* =========================================================
   Page: Report Issue (report.html)
   ========================================================= */
function initReportPage() {
  const form = $("#reportForm");
  if (!form) return;

  fillSelect($("#category"), CATEGORIES, "-- Select category --");
  fillSelect($("#community"), COMMUNITIES, "-- Select community --");
  fillSelect($("#priority"), PRIORITIES);
  $("#priority").value = "Medium";

  // Show matric number for students, community for indigenes
  const toggleReporterFields = () => {
    const type = form.reporterType.value;
    $("#studentFields").classList.toggle("hidden", type !== "Student");
    $("#communityLabel").textContent =
      type === "Student" ? "Location of issue (community)" : "Your community";
  };
  form.querySelectorAll('input[name="reporterType"]').forEach(r =>
    r.addEventListener("change", toggleReporterFields));

  // Hide identity fields when anonymous
  $("#anonymous").addEventListener("change", e => {
    $("#identityFields").classList.toggle("hidden", e.target.checked);
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const errors = validateReport(form);
    const box = $("#formMessage");
    if (errors.length) {
      box.className = "alert alert-error";
      box.innerHTML = "<b>Please fix the following:</b><br>" + errors.join("<br>");
      box.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const issue = new Issue({
      reporterType: form.reporterType.value,
      anonymous: $("#anonymous").checked,
      name: $("#name").value.trim(),
      phone: $("#phone").value.trim(),
      matricNo: form.reporterType.value === "Student" ? $("#matricNo").value.trim() : "",
      community: $("#community").value,
      category: $("#category").value,
      priority: $("#priority").value,
      title: $("#title").value.trim(),
      description: $("#description").value.trim(),
      location: $("#location").value.trim()
    });
    IssueStore.add(issue);

    form.reset();
    toggleReporterFields();
    $("#identityFields").classList.remove("hidden");
    box.className = "alert alert-success";
    box.innerHTML = `Your issue has been submitted successfully.<br>
      Your tracking ID is <span class="tracking-id">${issue.id}</span><br>
      Keep this ID to <a href="track.html?id=${issue.id}">track your issue</a>.`;
    box.scrollIntoView({ behavior: "smooth" });
  });
}

function validateReport(form) {
  const errors = [];
  if (!form.reporterType.value) errors.push("Select whether you are a Student or an Indigene.");
  if (!$("#category").value) errors.push("Select an issue category.");
  if (!$("#community").value) errors.push("Select a community.");
  if ($("#title").value.trim().length < 5) errors.push("Issue title must be at least 5 characters.");
  if ($("#description").value.trim().length < 20) errors.push("Description must be at least 20 characters.");
  const phone = $("#phone").value.trim();
  if (!$("#anonymous").checked && phone && !/^(\+234|0)[789][01]\d{8}$/.test(phone))
    errors.push("Enter a valid Nigerian phone number (e.g. 08012345678).");
  return errors;
}

/* =========================================================
   Page: Track Issue (track.html)
   ========================================================= */
function initTrackPage() {
  const form = $("#trackForm");
  if (!form) return;

  const show = id => {
    const issue = IssueStore.find(id);
    const out = $("#trackResult");
    if (!issue) {
      out.innerHTML = `<div class="alert alert-error">No issue found with ID <b>${escapeHTML(id)}</b>.</div>`;
      return;
    }
    out.innerHTML = `
      <div class="card">
        <h3>${escapeHTML(issue.title)} ${badge(issue.status)}</h3>
        <p><b>ID:</b> ${issue.id} &nbsp;|&nbsp; <b>Category:</b> ${issue.category}
          &nbsp;|&nbsp; <b>Community:</b> ${issue.community}</p>
        <p><b>Submitted:</b> ${formatDate(issue.createdAt)}</p>
        <h4 style="margin-top:14px">Progress</h4>
        <ul class="timeline">
          ${issue.updates.map(u => `<li>${badge(u.status)} ${escapeHTML(u.note)}<br>
            <small>${formatDate(u.date)}</small></li>`).join("")}
        </ul>
      </div>`;
  };

  form.addEventListener("submit", e => {
    e.preventDefault();
    show($("#trackId").value);
  });

  const qid = new URLSearchParams(location.search).get("id");
  if (qid) { $("#trackId").value = qid; show(qid); }
}

/* =========================================================
   Page: Admin Dashboard (admin.html)
   ========================================================= */
function initAdminPage() {
  const loginForm = $("#loginForm");
  if (!loginForm) return;

  const render = () => {
    const loggedIn = Auth.isLoggedIn();
    $("#loginSection").classList.toggle("hidden", loggedIn);
    $("#dashboard").classList.toggle("hidden", !loggedIn);
    if (loggedIn) renderDashboard();
  };

  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    if (Auth.login($("#username").value.trim(), $("#password").value)) {
      $("#loginMessage").className = "hidden";
      render();
    } else {
      $("#loginMessage").className = "alert alert-error";
      $("#loginMessage").textContent = "Invalid username or password.";
    }
  });

  $("#logoutBtn").addEventListener("click", () => { Auth.logout(); render(); });

  fillSelect($("#fStatus"), STATUSES, "All statuses");
  fillSelect($("#fType"), ["Student", "Indigene"], "All reporters");
  fillSelect($("#fCategory"), CATEGORIES, "All categories");
  ["#fStatus", "#fType", "#fCategory", "#fSearch"].forEach(s =>
    $(s).addEventListener("input", renderDashboard));

  render();
}

function renderDashboard() {
  const s = IssueStore.stats();
  $("#stats").innerHTML = `
    <div class="stat"><b>${s.total}</b><span>Total issues</span></div>
    <div class="stat"><b>${s.pending}</b><span>Pending</span></div>
    <div class="stat"><b>${s.review}</b><span>Under review</span></div>
    <div class="stat"><b>${s.resolved}</b><span>Resolved</span></div>
    <div class="stat"><b>${s.students}</b><span>From students</span></div>
    <div class="stat"><b>${s.indigenes}</b><span>From indigenes</span></div>`;

  const status = $("#fStatus").value, type = $("#fType").value,
        cat = $("#fCategory").value, q = $("#fSearch").value.toLowerCase();

  const rows = IssueStore.load().filter(i =>
    (!status || i.status === status) &&
    (!type || i.reporterType === type) &&
    (!cat || i.category === cat) &&
    (!q || (i.title + i.description + i.id).toLowerCase().includes(q)));

  $("#issueRows").innerHTML = rows.length ? rows.map(i => `
    <tr>
      <td><b>${i.id}</b><br><small>${formatDate(i.createdAt)}</small></td>
      <td>${escapeHTML(i.title)}<br><small>${escapeHTML(i.description.slice(0, 90))}${i.description.length > 90 ? "…" : ""}</small></td>
      <td>${i.reporterType}<br><small>${escapeHTML(i.name)}${i.matricNo ? " · " + escapeHTML(i.matricNo) : ""}</small></td>
      <td>${i.category}<br><small>${i.community}</small></td>
      <td class="${i.priority === "Urgent" ? "p-Urgent" : ""}">${i.priority}</td>
      <td>${badge(i.status)}</td>
      <td>
        <select data-id="${i.id}" class="statusSel">
          ${STATUSES.map(st => `<option ${st === i.status ? "selected" : ""}>${st}</option>`).join("")}
        </select>
        <button class="btn btn-green btn-sm updateBtn" data-id="${i.id}">Update</button>
        <button class="btn btn-danger btn-sm deleteBtn" data-id="${i.id}">Delete</button>
      </td>
    </tr>`).join("") :
    `<tr><td colspan="7" style="text-align:center;color:#5f6f68">No issues found.</td></tr>`;

  document.querySelectorAll(".updateBtn").forEach(b => b.addEventListener("click", () => {
    const issue = IssueStore.find(b.dataset.id);
    const newStatus = document.querySelector(`.statusSel[data-id="${b.dataset.id}"]`).value;
    const note = prompt("Response note to the reporter:", `Status changed to ${newStatus}.`);
    if (note === null) return;
    issue.addUpdate(newStatus, note || `Status changed to ${newStatus}.`);
    IssueStore.update(issue);
    renderDashboard();
  }));

  document.querySelectorAll(".deleteBtn").forEach(b => b.addEventListener("click", () => {
    if (confirm(`Delete issue ${b.dataset.id}? This cannot be undone.`)) {
      IssueStore.remove(b.dataset.id);
      renderDashboard();
    }
  }));
}

/* ---------- Home page counters ---------- */
function initHomePage() {
  const el = $("#homeStats");
  if (!el) return;
  const s = IssueStore.stats();
  el.innerHTML = `
    <div class="stat"><b>${s.total}</b><span>Issues reported</span></div>
    <div class="stat"><b>${s.resolved}</b><span>Issues resolved</span></div>
    <div class="stat"><b>${s.pending + s.review}</b><span>In progress</span></div>`;
}

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initHomePage();
  initReportPage();
  initTrackPage();
  initAdminPage();
});
