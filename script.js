/* Max Pressure Washing — script.js */

// ---------- Before/After sliders ----------
// Each slider is a range input (invisible, but draggable and keyboard-friendly)
// that controls how much of the "after" layer is revealed.
document.querySelectorAll("[data-ba]").forEach((slider) => {
  const range = slider.querySelector(".ba-range");
  const after = slider.querySelector(".ba-after");
  const handle = slider.querySelector(".ba-handle");

  const update = () => {
    const pct = range.value;
    // before shows left of the handle, after shows right of it
    after.style.clipPath = `inset(0 0 0 ${pct}%)`;
    handle.style.left = `${pct}%`;
  };

  range.addEventListener("input", update);
  update();
});

// ---------- Sticky header shadow ----------
const header = document.querySelector(".site-header");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ---------- Mobile menu ----------
const navToggle = document.getElementById("nav-toggle");
const mainNav = document.getElementById("main-nav");

navToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", open);
  navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});

// Close the menu after tapping a link
mainNav.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  })
);

// ---------- First-car fund tracker ----------
// Update data-saved on the .fund element in index.html as savings grow.
const fund = document.querySelector(".fund");
if (fund) {
  const goal = Number(fund.dataset.goal) || 10000;
  const saved = Math.min(Number(fund.dataset.saved) || 0, goal);
  const pct = Math.max((saved / goal) * 100, 4); // keep the car visible even at $0

  fund.querySelector("[data-fund-saved]").textContent =
    "$" + saved.toLocaleString("en-US");
  fund.querySelector(".fund-track").setAttribute("aria-valuenow", saved);
  fund.querySelector(".fund-track").setAttribute("aria-valuemax", goal);

  // Animate the bar the first time it scrolls into view
  // (with a timed fallback so the bar always fills, even if the
  // browser never reports the scroll)
  const fill = fund.querySelector("[data-fund-fill]");
  const show = () => { fill.style.width = pct + "%"; };
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          show();
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(fund);
    setTimeout(show, 2500);
  } else {
    show();
  }
}

// ---------- "Book Now" buttons pre-select the service ----------
document.querySelectorAll("[data-service]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const select = document.getElementById("f-service");
    const wanted = btn.dataset.service;
    [...select.options].forEach((opt) => {
      if (opt.text === wanted) select.value = opt.value || opt.text;
    });
  });
});

// ---------- Contact form → opens the visitor's email app ----------
// (No server needed. If you later want submissions to land in an inbox
// automatically, a free service like Formspree can replace this.)
document.getElementById("quote-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;

  if (!form.reportValidity()) return;

  const get = (name) => form.elements[name].value.trim();
  const subject = `Quote request — ${get("service")}`;
  const body = [
    `Name: ${get("name")}`,
    `Phone: ${get("phone")}`,
    `Address: ${get("address") || "(not given)"}`,
    `Service: ${get("service")}`,
    "",
    get("message") || "(no extra details)",
  ].join("\n");

  window.location.href =
    "mailto:maxwellhamlin12@gmail.com" +
    "?subject=" + encodeURIComponent(subject) +
    "&body=" + encodeURIComponent(body);
});

// ---------- Scroll-in reveal ----------
// Everything is visible without JavaScript. When the browser supports
// IntersectionObserver, we hide sections and fade them in on scroll —
// with a safety timer that reveals anything still hidden after 2.5s.
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const reveals = document.querySelectorAll(".reveal");

if (!prefersReduced && "IntersectionObserver" in window) {
  document.documentElement.classList.add("anim");

  const revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  reveals.forEach((el) => revealIO.observe(el));

  setTimeout(() => reveals.forEach((el) => el.classList.add("in")), 2500);
}

// ---------- Footer year ----------
document.querySelector("[data-year]").textContent = new Date().getFullYear();
