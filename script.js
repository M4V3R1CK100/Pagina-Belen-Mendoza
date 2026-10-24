/* =========================================================
   Dra. Belén Mendoza — Dermatología
   ========================================================= */

// ⚠️ CAMBIAR: número de WhatsApp con código de país, sin "+" ni espacios
const WHATSAPP_NUMBER = "593979893430";
const WHATSAPP_DEFAULT_MSG = "Hola Dra. Belén, me gustaría agendar una cita.";

document.addEventListener("DOMContentLoaded", () => {
  setupWhatsAppLinks();
  setupNav();
  setupActiveLink();
  setupReel();
  setupServiceNav();
  setupCaseFilters();
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

/* ---------- Novedades: carrete ----------
   Las miniaturas se crean solas a partir de cada <article class="reel__item">.
   Avanza cada data-interval ms, se pausa con el cursor encima. */
function setupReel() {
  const reel = document.querySelector(".reel");
  if (!reel) return;

  const items = [...reel.querySelectorAll(".reel__item")];
  const thumbsBox = reel.querySelector(".reel__thumbs");
  const interval = Number(reel.dataset.interval) || 6000;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  reel.style.setProperty("--reel-time", `${interval}ms`);
  let index = 0;
  let timer;

  const thumbs = items.map((item, i) => {
    const btn = document.createElement("button");
    btn.className = "reel__thumb";
    btn.setAttribute("role", "tab");
    const img = item.querySelector("img");
    const title = item.querySelector("h3")?.textContent || `Noticia ${i + 1}`;
    btn.innerHTML = `<img src="${img.getAttribute("src")}" alt="" loading="lazy"><span></span>`;
    btn.querySelector("span").textContent = title;
    btn.setAttribute("aria-label", title);
    btn.addEventListener("click", () => go(i));
    thumbsBox.appendChild(btn);
    return btn;
  });

  function go(i) {
    index = (i + items.length) % items.length;
    items.forEach((el, j) => el.classList.toggle("is-active", j === index));
    thumbs.forEach((el, j) => {
      el.classList.toggle("is-active", j === index);
      el.setAttribute("aria-selected", j === index);
    });
    play();
  }

  function play() {
    clearTimeout(timer);
    if (reduceMotion) return;
    // Reinicia la barra de progreso de la miniatura activa
    reel.classList.remove("is-playing");
    void reel.offsetWidth;
    reel.classList.add("is-playing");
    timer = setTimeout(() => go(index + 1), interval);
  }

  function pause() {
    clearTimeout(timer);
    reel.classList.remove("is-playing");
  }

  reel.addEventListener("mouseenter", pause);
  reel.addEventListener("mouseleave", play);

  // Deslizar con el dedo en móvil
  const stage = reel.querySelector(".reel__stage");
  let startX = 0;
  stage.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
  });

  go(0);
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

function setYear() {
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
}
