(function () {
  /* ===========================================================================
     main.js — Costantini & Gallotti
     Script clásico (sin módulos) envuelto en IIFE: funciona en file://, FTP
     y CDN. El JS solo enriquece: todo el contenido ya está escrito en el HTML.
     =========================================================================== */
  "use strict";

  var data = window.__BRAND__ || {};

  /* --------------------------- Helpers --------------------------- */
  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(sel));
  };

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function escHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ------------------- Enriquecimiento de contacto -------------------
     Si lib/manifest.js tiene los datos cargados, los placeholders
     [PENDIENTE: ...] se reemplazan por enlaces reales. Si no, se dejan
     tal cual: es preferible un pendiente visible a un dato inventado. */
  function mountContact() {
    var c = data.contact || {};
    var s = data.social || {};

    if (c.email) {
      $$("[data-contact-email]").forEach(function (el) {
        el.classList.remove("is-pending");
        el.innerHTML = '<a class="contact-value" href="mailto:' + escHTML(c.email) + '">' +
                       escHTML(c.email) + "</a>";
      });
    }

    if (c.whatsapp) {
      var label = c.whatsappLabel || c.whatsapp;
      var num = String(c.whatsapp).replace(/[^0-9]/g, "");
      $$("[data-contact-whatsapp]").forEach(function (el) {
        el.classList.remove("is-pending");
        el.innerHTML = '<a class="contact-value" href="https://wa.me/' + escHTML(num) +
                       '" rel="noopener" target="_blank">' + escHTML(label) + "</a>";
      });
    }

    var links = [];
    if (s.linkedinTomas) {
      links.push('<a class="contact-value" href="' + escHTML(s.linkedinTomas) +
                 '" rel="noopener" target="_blank">Tomás</a>');
    }
    if (s.linkedinFrancisco) {
      links.push('<a class="contact-value" href="' + escHTML(s.linkedinFrancisco) +
                 '" rel="noopener" target="_blank">Francisco</a>');
    }
    if (s.extra) {
      links.push('<a class="contact-value" href="' + escHTML(s.extra) +
                 '" rel="noopener" target="_blank">Más</a>');
    }

    if (links.length) {
      $$("[data-contact-social]").forEach(function (el) {
        el.classList.remove("is-pending");
        el.innerHTML = links.join(" · ");
      });
    }
  }

  /* ----------------------- Año del footer ----------------------- */
  function mountYear() {
    $$("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ----------------- Degradado reactivo al cursor -----------------
     Efecto firma. Se gatea por capacidad de hover, no por
     reduced-motion: en un dispositivo táctil no hay cursor que seguir. */
  function initMouseGradient() {
    if (!fineHover) return;

    var root = document.documentElement;
    var targetX = 62, targetY = 18, curX = 62, curY = 18;
    var raf = null;

    function loop() {
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;
      root.style.setProperty("--mx", curX.toFixed(2) + "%");
      root.style.setProperty("--my", curY.toFixed(2) + "%");

      if (Math.abs(targetX - curX) > 0.05 || Math.abs(targetY - curY) > 0.05) {
        raf = window.requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    }

    window.addEventListener("mousemove", function (e) {
      targetX = (e.clientX / window.innerWidth) * 100;
      targetY = (e.clientY / window.innerHeight) * 100;
      if (raf === null) raf = window.requestAnimationFrame(loop);
    }, { passive: true });
  }

  /* ------------------------ Header sticky ------------------------ */
  function initHeader() {
    var header = $("[data-header]");
    if (!header) return;

    function update() {
      if (window.scrollY > 12) header.classList.add("is-stuck");
      else header.classList.remove("is-stuck");
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ------------------------ Menú móvil ------------------------ */
  function initNav() {
    var toggle = $("[data-nav-toggle]");
    var nav = $("#nav-principal");
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menú");
      document.body.classList.remove("nav-open");
    }

    function open() {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Cerrar menú");
      document.body.classList.add("nav-open");
    }

    toggle.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) close(); else open();
    });

    // Cerrar al elegir un destino
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });

    // Cerrar con Escape y devolver el foco al botón
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        close();
        toggle.focus();
      }
    });

    // Si se pasa a escritorio con el menú abierto, restablecer el estado
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 960 && nav.classList.contains("is-open")) close();
    });
  }

  /* --------------- Scroll suave para enlaces ancla --------------- */
  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;

      var id = a.getAttribute("href");
      if (!id || id === "#") return;

      var el = document.querySelector(id);
      if (!el) return;

      e.preventDefault();

      var navOffset = 88;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - navOffset,
        behavior: reduced ? "auto" : "smooth"
      });

      // Llevar también el foco, para quien navega con teclado o lector
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    });
  }

  /* ------------------- Reveals al hacer scroll -------------------
     threshold bajo + red de seguridad a los 6 s (gotcha A.8): si por
     cualquier motivo el observer no dispara, nada queda invisible. */
  function initReveals() {
    var items = $$(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.03, rootMargin: "0px 0px -3% 0px" });

    items.forEach(function (el) { io.observe(el); });

    window.setTimeout(function () {
      $$(".reveal:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight * 1.5) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  /* ------------- Resaltado del enlace de sección activo ------------- */
  function initActiveNav() {
    var links = $$('.nav-list a[href^="#"]');
    if (!links.length || !("IntersectionObserver" in window)) return;

    var map = {};
    var sections = [];

    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var section = document.getElementById(id);
      if (!section) return;
      map[id] = a;
      sections.push(section);
    });
    if (!sections.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var a = map[entry.target.id];
        if (!a || !entry.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove("is-active"); });
        a.classList.add("is-active");
      });
    }, { threshold: 0.04, rootMargin: "-40% 0px -50% 0px" });

    sections.forEach(function (s) { io.observe(s); });
  }

  /* ------------------------ Formulario ------------------------
     Validación en cliente + salida honesta:
     · Con contact.email cargado → abre el cliente de correo con todo
       prellenado (un envío real que la persona confirma).
     · Sin email cargado → lo dice claramente. Nunca simula un envío. */
  function initForm() {
    var form = $("[data-form]");
    if (!form) return;

    var status = $("[data-form-status]", form);
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function fieldOf(input) { return input.closest(".field"); }

    function setError(input, message) {
      var field = fieldOf(input);
      var box = field ? field.querySelector("[data-error-for='" + input.id + "']") : null;
      if (field) field.classList.add("has-error");
      input.setAttribute("aria-invalid", "true");
      if (box) {
        box.id = input.id + "-err";
        box.textContent = message;
        box.hidden = false;
        input.setAttribute("aria-describedby", box.id);
      }
    }

    function clearError(input) {
      var field = fieldOf(input);
      var box = field ? field.querySelector("[data-error-for='" + input.id + "']") : null;
      if (field) field.classList.remove("has-error");
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
      if (box) { box.textContent = ""; box.hidden = true; }
    }

    function validate() {
      var problems = [];

      var nombre = $("#f-nombre", form);
      var email = $("#f-email", form);
      var mensaje = $("#f-mensaje", form);

      [nombre, email, mensaje].forEach(clearError);

      if (!nombre.value.trim()) {
        setError(nombre, "Contanos cómo te llamás.");
        problems.push(nombre);
      }
      if (!EMAIL_RE.test(email.value.trim())) {
        setError(email, "Necesitamos un email válido para poder responderte.");
        problems.push(email);
      }
      if (mensaje.value.trim().length < 10) {
        setError(mensaje, "Contanos un poco más: con dos o tres líneas alcanza.");
        problems.push(mensaje);
      }

      return problems;
    }

    // Limpiar el error en cuanto la persona corrige
    $$("input, textarea", form).forEach(function (input) {
      input.addEventListener("input", function () {
        var field = fieldOf(input);
        if (field && field.classList.contains("has-error")) clearError(input);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var problems = validate();
      if (problems.length) {
        status.className = "form-status is-error";
        status.textContent = "Revisá los campos marcados y volvé a intentar.";
        problems[0].focus();
        return;
      }

      var c = data.contact || {};

      if (!c.email) {
        // Sin backend ni email cargado: no se promete un envío que no ocurre.
        status.className = "form-status is-warning";
        status.textContent =
          "El formulario todavía no está conectado a una casilla de correo. " +
          "Mientras tanto, escribinos por los canales de al lado y te respondemos.";
        return;
      }

      var nombre = $("#f-nombre", form).value.trim();
      var email = $("#f-email", form).value.trim();
      var empresa = $("#f-empresa", form).value.trim();
      var mensaje = $("#f-mensaje", form).value.trim();

      var subject = "Consulta desde la web — " + nombre + (empresa ? " (" + empresa + ")" : "");
      var body =
        "Nombre: " + nombre + "\n" +
        "Email: " + email + "\n" +
        "Empresa: " + (empresa || "—") + "\n\n" +
        "Proceso a revisar:\n" + mensaje + "\n";

      status.className = "form-status is-ok";
      status.textContent =
        "Abrimos tu programa de correo con el mensaje listo. Revisalo y dale enviar.";

      // El "@" va literal: encodeURIComponent lo convierte en %40 y algunos
      // clientes de correo no lo interpretan bien (RFC 6068).
      var to = encodeURIComponent(c.email).replace(/%40/g, "@");

      window.location.href =
        "mailto:" + to +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });
  }

  /* ------------------- Registro de GSAP -------------------
     Los reveals NO se animan con GSAP a propósito: los resuelve CSS +
     IntersectionObserver, que sobreviven a que la librería no cargue.
     GSAP queda registrado y disponible para futuras ampliaciones. */
  function initGsap() {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.refresh();
  }

  /* ---------------------------- Boot ---------------------------- */
  function boot() {
    // Marca de "JS activo": habilita las reglas de reveal en CSS.
    // Si el JS no corre, el contenido nunca llega a ocultarse.
    document.documentElement.classList.add("is-ready");

    safe(mountContact, "mountContact");
    safe(mountYear, "mountYear");

    safe(initHeader, "initHeader");
    safe(initNav, "initNav");
    safe(initSmoothScroll, "initSmoothScroll");
    safe(initReveals, "initReveals");
    safe(initActiveNav, "initActiveNav");
    safe(initForm, "initForm");
    safe(initMouseGradient, "initMouseGradient");

    if (window.gsap && window.ScrollTrigger) {
      safe(initGsap, "initGsap");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
