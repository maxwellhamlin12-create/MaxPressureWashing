// Max Pressure Washing — services.js
// Pulls the services & pricing list from Supabase and swaps it into the
// page. If the fetch fails for any reason (offline, etc.), the static
// pricing cards already in index.html stay put — nothing breaks.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function renderPricingGrid(services) {
  const grid = document.getElementById("pricing-grid");
  if (!grid) return;

  grid.innerHTML = services
    .map(
      (s) => `
      <article class="price-card ${s.featured ? "price-card-featured" : ""} reveal in">
        ${s.featured ? '<p class="badge">Most popular</p>' : ""}
        <h3>${escapeHtml(s.name)}</h3>
        <p class="price"><span class="price-num">${escapeHtml(s.price_label)}</span></p>
        <p class="price-desc">${escapeHtml(s.description)}</p>
        <a class="btn ${s.featured ? "btn-primary" : "btn-outline"} btn-block" href="#contact" data-service="${escapeHtml(s.name)} (${escapeHtml(s.price_label)})">Book Now</a>
      </article>`
    )
    .join("");

  // script.js already wired up click handlers for the original cards, but
  // we just replaced those elements — rebind on the fresh ones.
  grid.querySelectorAll("[data-service]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const select = document.getElementById("f-service");
      if (!select) return;
      const wanted = btn.dataset.service;
      [...select.options].forEach((opt) => {
        if (opt.text === wanted) select.value = opt.value || opt.text;
      });
    });
  });
}

function renderServiceOptions(services) {
  const select = document.getElementById("f-service");
  if (!select) return;

  const featuredIndex = services.findIndex((s) => s.featured);
  const options = services.map(
    (s, i) =>
      `<option${i === featuredIndex ? " selected" : ""}>${escapeHtml(s.name)} (${escapeHtml(s.price_label)})</option>`
  );
  options.push("<option>Combination / larger job (free quote)</option>");
  options.push("<option>Something else</option>");

  select.innerHTML = options.join("");
}

async function loadServices() {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("display_order", { ascending: true });

  if (error || !data || data.length === 0) return;

  renderPricingGrid(data);
  renderServiceOptions(data);
}

loadServices();
