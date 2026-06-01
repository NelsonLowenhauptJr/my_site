(function () {
  "use strict";

  var KEY = "site_lang";
  var currentIsEN = /en\.html$/i.test(location.pathname);
  var current = currentIsEN ? "en" : "pt";

  var stored = null;
  try {
    stored = localStorage.getItem(KEY);
  } catch (e) {
    stored = null;
  }

  var target = stored;
  if (target !== "pt" && target !== "en") {
    var nav = (navigator.language || navigator.userLanguage || "pt").toLowerCase();
    target = nav.indexOf("en") === 0 ? "en" : "pt";
  }

  if (target !== current) {
    location.replace(target === "en" ? "en.html" : "index.html");
    return;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".lang-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", function () {
      try {
        localStorage.setItem(KEY, toggle.getAttribute("data-lang"));
      } catch (e) {
        /* sem localStorage, segue a navegação normal */
      }
    });
  });
})();
