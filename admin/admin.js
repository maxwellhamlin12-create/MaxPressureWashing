// Max Pressure Washing — admin.js
// Handles login (Supabase Auth) and editing the services/pricing table.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../supabase-config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginView = document.getElementById("login-view");
const dashboardView = document.getElementById("dashboard-view");
const logoutBtn = document.getElementById("logout-btn");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const servicesList = document.getElementById("services-list");
const servicesStatus = document.getElementById("services-status");
const addForm = document.getElementById("add-form");

function escapeAttr(str) {
  return (str ?? "").replace(/"/g, "&quot;");
}

function showLoggedIn(isLoggedIn) {
  loginView.hidden = isLoggedIn;
  dashboardView.hidden = !isLoggedIn;
  logoutBtn.hidden = !isLoggedIn;
  if (isLoggedIn) loadServices();
}

// ---------- Auth ----------

supabase.auth.getSession().then(({ data }) => {
  showLoggedIn(!!data.session);
});

supabase.auth.onAuthStateChange((_event, session) => {
  showLoggedIn(!!session);
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.hidden = true;

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    loginError.textContent = "Couldn't log in: " + error.message;
    loginError.hidden = false;
  }
});

logoutBtn.addEventListener("click", () => supabase.auth.signOut());

// ---------- Services list ----------

async function loadServices() {
  servicesStatus.textContent = "Loading…";
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    servicesStatus.textContent = "Couldn't load services: " + error.message;
    return;
  }

  servicesStatus.textContent = "";
  renderServices(data);
}

function renderServices(services) {
  servicesList.innerHTML = services.map((s) => `
    <div class="admin-service-row" data-id="${s.id}">
      <div class="form-row">
        <label>Name</label>
        <input type="text" value="${escapeAttr(s.name)}" data-field="name" />
      </div>
      <div class="form-row">
        <label>Price label</label>
        <input type="text" value="${escapeAttr(s.price_label)}" data-field="price_label" />
      </div>
      <div class="form-row admin-form-full">
        <label>Description</label>
        <textarea rows="2" data-field="description">${escapeAttr(s.description)}</textarea>
      </div>
      <div class="form-row">
        <label>Order</label>
        <input type="number" value="${s.display_order}" data-field="display_order" />
      </div>
      <div class="form-row form-row-checkbox">
        <label><input type="checkbox" data-field="featured" ${s.featured ? "checked" : ""} /> Most popular</label>
      </div>
      <div class="admin-service-row-actions">
        <button type="button" class="btn btn-primary" data-action="save">Save</button>
        <button type="button" class="btn btn-danger" data-action="delete">Delete</button>
        <span class="admin-status" data-row-status></span>
      </div>
    </div>
  `).join("");
}

servicesList.addEventListener("click", async (e) => {
  const action = e.target.dataset.action;
  if (!action) return;

  const row = e.target.closest(".admin-service-row");
  const id = row.dataset.id;
  const status = row.querySelector("[data-row-status]");

  if (action === "save") {
    const update = {
      name: row.querySelector('[data-field="name"]').value.trim(),
      price_label: row.querySelector('[data-field="price_label"]').value.trim(),
      description: row.querySelector('[data-field="description"]').value.trim(),
      display_order: Number(row.querySelector('[data-field="display_order"]').value) || 0,
      featured: row.querySelector('[data-field="featured"]').checked,
      updated_at: new Date().toISOString(),
    };
    status.textContent = "Saving…";
    const { error } = await supabase.from("services").update(update).eq("id", id);
    status.textContent = error ? "Error: " + error.message : "Saved.";
  }

  if (action === "delete") {
    if (!confirm("Delete this service? This can't be undone.")) return;
    status.textContent = "Deleting…";
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) {
      status.textContent = "Error: " + error.message;
    } else {
      loadServices();
    }
  }
});

// ---------- Add service ----------

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const insert = {
    name: document.getElementById("add-name").value.trim(),
    price_label: document.getElementById("add-price").value.trim(),
    description: document.getElementById("add-description").value.trim(),
    display_order: Number(document.getElementById("add-order").value) || 0,
    featured: document.getElementById("add-featured").checked,
  };

  const { error } = await supabase.from("services").insert(insert);
  if (error) {
    alert("Couldn't add service: " + error.message);
    return;
  }

  addForm.reset();
  document.getElementById("add-order").value = "10";
  loadServices();
});
