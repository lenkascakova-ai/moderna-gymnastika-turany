// Moderná gymnastika Turany — odoslanie registračného formulára
//
// Formulár posiela dáta na Google Apps Script webhook, ktorý zapíše
// prihlášku do Google Sheet a pošle e-mailovú notifikáciu.
// Postup nastavenia je v súbore `navod-formular-backend.md`.
//
// Po nastavení sem vlož URL nasadenej Google Apps Script webovej aplikácie:
var WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyZGi4gkT4Tuif2iMTEm8xMiU4Z8732kuXcz_lmhcc0EMDW6hF4-KhlOpfHUM6Npr1Y/exec";

// ---------- Zápis modal (pop-up s termínmi) ----------
(function () {
  var modal = document.getElementById("zapis-modal");
  if (!modal) return;

  var closeBtn = modal.querySelector(".modal-close");
  var lastFocused = null;

  function openModal() {
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    if (closeBtn) closeBtn.focus();
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  document.querySelectorAll("[data-open-zapis]").forEach(function (btn) {
    btn.addEventListener("click", openModal);
  });
  modal.querySelectorAll("[data-close-zapis]").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });
  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (modal.hidden) return;
    if (e.key === "Escape") {
      closeModal();
      return;
    }
    if (e.key === "Tab") {
      var focusable = modal.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Automaticky raz za návštevu (session), s malým oneskorením
  try {
    if (!sessionStorage.getItem("zapisModalShown")) {
      setTimeout(function () {
        openModal();
        sessionStorage.setItem("zapisModalShown", "1");
      }, 1200);
    }
  } catch (err) {
    // localStorage/sessionStorage môže byť blokovaný — pop-up jednoducho preskočíme
  }
})();

(function () {
  var narodenieInput = document.getElementById("dieta-narodenie");
  if (narodenieInput) {
    narodenieInput.setAttribute("max", new Date().toISOString().split("T")[0]);
  }
})();

(function () {
  var form = document.getElementById("prihlaska-form");
  var status = document.getElementById("form-status");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Honeypot — ak je vyplnené, ticho ignorujeme (pravdepodobne bot)
    var honeypot = form.querySelector('[name="web"]');
    if (honeypot && honeypot.value) {
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var submitBtn = form.querySelector('button[type="submit"]');

    if (!WEBHOOK_URL) {
      status.textContent = "⚠️ Formulár momentálne nie je napojený na odoslanie. Kontaktujte nás prosím telefonicky.";
      status.style.color = "var(--turquoise)";
      return;
    }

    submitBtn.disabled = true;
    status.textContent = "Odosielam...";
    status.style.color = "var(--ink-soft)";

    // Poznámka: Google Apps Script web app response nejde spoľahlivo čítať
    // cez fetch (chýbajúce CORS hlavičky), preto posielame v režime "no-cors"
    // a úspech vyhodnocujeme podľa toho, že request neskončil sieťovou chybou.
    fetch(WEBHOOK_URL, {
      method: "POST",
      body: new FormData(form),
      mode: "no-cors",
    })
      .then(function () {
        form.reset();
        status.textContent = "✅ Ďakujeme! Prihláška bola odoslaná, čoskoro sa vám ozveme.";
        status.style.color = "var(--turquoise)";
      })
      .catch(function () {
        status.textContent = "⚠️ Niečo sa pokazilo. Skúste to prosím znova, alebo nás kontaktujte telefonicky.";
        status.style.color = "var(--raspberry)";
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  });
})();
