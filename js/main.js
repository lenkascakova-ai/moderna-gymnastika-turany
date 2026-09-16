// Moderná gymnastika Turany — odoslanie registračného formulára
//
// Formulár posiela dáta na Google Apps Script webhook, ktorý zapíše
// prihlášku do Google Sheet a pošle e-mailovú notifikáciu.
// Postup nastavenia je v súbore `navod-formular-backend.md`.
//
// Po nastavení sem vlož URL nasadenej Google Apps Script webovej aplikácie:
var WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxGwxP1H-VpcwLrTKLU1Z3fufVXZ0Mf7qNy-yvtmkZgmNKpRFpdLhGCaJ-EFibBPmp8/exec";

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
