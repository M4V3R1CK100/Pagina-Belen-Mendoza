/* =========================================================
   Dra. Belén Mendoza — Dermatología
   ========================================================= */

// ⚠️ CAMBIAR: número de WhatsApp con código de país, sin "+" ni espacios
const WHATSAPP_NUMBER = "593000000000";
const WHATSAPP_DEFAULT_MSG = "Hola Dra. Belén, me gustaría agendar una cita.";

document.addEventListener("DOMContentLoaded", () => {
  setupWhatsAppLinks();
  setupNav();
  setupActiveLink();
  setupCarousel();
  setupServiceNav();
  setupCaseFilters();
  setupBeforeAfter();
  setupReveal();
  setYear();
});

/* ---------- Enlaces de WhatsApp ----------
   Cualquier elemento con data-wa se convierte en enlace a WhatsApp.
   data-wa="Mensaje personalizado" (opcional). */
function setupWhatsAppLinks() {
  document.querySelectorAll("[data-wa]").forEach((el) => {
    const msg = el.dataset.wa || WHATSAPP_DEFAULT_MSG;
    el.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    el.target = "_blank";
    el.rel = "noopener";
  });
}

/* ---------- Menú móvil + submenú ---------- */
function setupNav() {
  const toggle = document.querySelector(".nav-toggle");
  const body = document.body;

  toggle?.addEventListener("click", () => {
    const open = body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", open);
  });

  document.querySelectorAll(".has-submenu > .nav__link").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const parent = btn.parentElement;
      // En escritorio el enlace va a /servicios; en móvil abre el submenú
      if (window.matchMedia("(max-width: 900px)").matches) {
        e.preventDefault();
        const open = parent.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open);
      }
    });
  });

  // Cerrar el menú móvil al elegir un enlace
  document.querySelectorAll(".nav a:not(.has-submenu > .nav__link)").forEach((a) => {
    a.addEventListener("click", () => body.classList.remove("nav-open"));
  });
}

/* ---------- Marcar página activa ---------- */
function setupActiveLink() {
  const page = document.body.dataset.page;
  if (!page) return;
  document.querySelectorAll(`.nav__link[data-page="${page}"]`).forEach((a) => a.classList.add("is-active"));
}

/* ---------- Carrusel de noticias ---------- */
function setupCarousel() {
  const carousel = document.querySelector(".carousel");
  if (!carousel) return;

  const track = carousel.querySelector(".carousel__track");
  const slides = [...track.children];
  const dotsBox = carousel.querySelector(".carousel__dots");
  let index = 0;
  let timer;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.setAttribute("aria-label", `Ir a la noticia ${i + 1}`);
    dot.addEventListener("click", () => { go(i); restart(); });
    dotsBox.appendChild(dot);
  });
  const dots = [...dotsBox.children];

  function go(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, j) => d.classList.toggle("is-active", j === index));
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(() => go(index + 1), 6000);
  }

  carousel.querySelector(".carousel__btn--prev").addEventListener("click", () => { go(index - 1); restart(); });
  carousel.querySelector(".carousel__btn--next").addEventListener("click", () => { go(index + 1); restart(); });
  carousel.addEventListener("mouseenter", () => clearInterval(timer));
  carousel.addEventListener("mouseleave", restart);

  // Deslizar con el dedo en móvil
  let startX = 0;
  track.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) { go(index + (dx < 0 ? 1 : -1)); restart(); }
  });

  go(0);
  restart();
}

/* ---------- Barra de servicios: resaltar la sección visible ---------- */
function setupServiceNav() {
  const links = document.querySelectorAll(".service-nav a");
  if (!links.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        links.forEach((a) => a.classList.toggle("is-active", a.hash === `#${entry.target.id}`));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });

  document.querySelectorAll(".service").forEach((s) => observer.observe(s));
}

/* ---------- Filtros de casos ---------- */
function setupCaseFilters() {
  const buttons = document.querySelectorAll(".filters button");
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.toggle("is-active", b === btn));
      const filter = btn.dataset.filter;
      document.querySelectorAll(".case").forEach((c) => {
        c.hidden = filter !== "todos" && c.dataset.category !== filter;
      });
    });
  });
}

/* ---------- Comparador antes / después ---------- */
function setupBeforeAfter() {
  document.querySelectorAll(".ba").forEach((ba) => {
    const range = ba.querySelector(".ba__range");
    const update = () => ba.style.setProperty("--pos", `${range.value}%`);
    range.addEventListener("input", update);
    update();
  });
}

/* ---------- Animación al hacer scroll ---------- */
function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((el) => observer.observe(el));
}

function setYear() {
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
}
