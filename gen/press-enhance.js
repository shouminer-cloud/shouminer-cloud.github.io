/* Press page enhancer: download tracking + press-kit ZIP. Reads window.__KIT. */
(function () {
  var K = window.__KIT || {};
  var q = new URLSearchParams(location.search), t = q.get("t");

  function beacon(f) {
    try {
      var url = K.dl + "?slug=" + encodeURIComponent(K.slug) + "&f=" + f + "&apikey=" + K.pub + (t ? "&t=" + encodeURIComponent(t) : "");
      navigator.sendBeacon(url);
    } catch (e) {}
  }

  document.querySelectorAll("a.dlx").forEach(function (a) {
    a.addEventListener("click", function () { beacon(a.getAttribute("data-f")); });
  });

  var kb = document.getElementById("kitbtn");
  if (kb) kb.addEventListener("click", function () { buildKit(kb); });

  function loadJSZip(cb) {
    if (window.JSZip) return cb();
    var s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    s.onload = cb;
    s.onerror = function () { alert("שגיאה בטעינת רכיב הדחיסה, נסי שוב"); };
    document.head.appendChild(s);
  }

  function buildKit(kb) {
    loadJSZip(function () {
      kb.disabled = true;
      var old = kb.textContent;
      kb.textContent = "מכינה חבילה…";
      (async function () {
        try {
          var zip = new JSZip();
          var folder = zip.folder("שירה הומינר - " + K.title);
          folder.file("קומוניקט.txt", K.communique || "");
          if (K.lyrics) folder.file("מילים.txt", K.lyrics);
          if (K.credits) folder.file("קרדיטים.txt", K.credits);
          async function add(url, name) { try { var r = await fetch(url); if (r.ok) folder.file(name, await r.blob()); } catch (e) {} }
          if (K.cover) await add(K.cover, "עטיפה.jpg");
          if (K.artist) await add(K.artist, "תמונת אמן.jpg");
          if (K.mp3) await add(K.mp3, K.title + " - MP3.mp3");
          if (K.wavLink) folder.file("קובץ מאסטר WAV - קישור.txt", "להורדת קובץ המאסטר (WAV) באיכות מלאה: " + K.wavLink);
          var blob = await zip.generateAsync({ type: "blob" });
          var a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "שירה הומינר - " + K.title + " - חבילת עיתונות.zip";
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(a.href); }, 6000);
          beacon("zip");
        } catch (e) { alert("שגיאה בהכנת החבילה"); }
        kb.disabled = false;
        kb.textContent = old;
      })();
    });
  }
})();
