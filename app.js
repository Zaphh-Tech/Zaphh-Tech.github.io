/* cyberjake — interaction layer. Vanilla, dependency-free, progressive. */
(function () {
  "use strict";
  var root = document.documentElement;

  /* ---- theme: respect stored choice, else system ---- */
  var THEME_KEY = "cj-theme";
  function stored() { try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } }
  function apply(t) {
    root.setAttribute("data-theme", t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "dark" ? "#15120d" : "#f7f3ea");
  }
  var pref = stored();
  if (pref === "dark" || pref === "light") apply(pref);
  var toggle = document.getElementById("theme");
  if (toggle) toggle.addEventListener("click", function () {
    var cur = root.getAttribute("data-theme");
    if (!cur) cur = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    var next = cur === "dark" ? "light" : "dark";
    apply(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  });

  /* ---- sticky bar: light over the dark cover, ink in the codex ---- */
  var bar = document.getElementById("bar");
  var cover = document.getElementById("cover");
  function onScroll() {
    if (!bar) return;
    var y = window.scrollY;
    if (cover) {
      var threshold = cover.offsetHeight - 76;
      var over = y < threshold;
      bar.classList.toggle("over-cover", over);
      bar.classList.toggle("scrolled", !over);
    } else {
      bar.classList.toggle("scrolled", y > 8);
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  /* ---- mobile nav ---- */
  var nt = document.getElementById("navToggle"), nav = document.getElementById("nav");
  if (nt && nav) {
    function close() { nav.classList.remove("open"); nt.classList.remove("open"); nt.setAttribute("aria-expanded", "false"); }
    nt.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      nt.classList.toggle("open", open);
      nt.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) { if (e.target.tagName === "A") close(); });
  }

  /* ---- scroll reveal ---- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = document.querySelectorAll(".reveal, .rung");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        /* stagger the ladder rungs within their group */
        if (el.classList.contains("ladder")) {
          var rungs = el.querySelectorAll(".rung");
          rungs.forEach(function (r, i) { setTimeout(function () { r.classList.add("in"); }, i * 70); });
        }
        el.classList.add("in");
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    items.forEach(function (el) { if (!el.classList.contains("rung")) io.observe(el); });
    /* observe the ladder container so rungs stagger together */
    var ladder = document.querySelector(".ladder");
    if (ladder) io.observe(ladder);
  }
})();
