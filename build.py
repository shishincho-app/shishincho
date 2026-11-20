"""Wrap src/app.html into a standalone PWA in docs/ (served by GitHub Pages)."""
import shutil, pathlib
root = pathlib.Path(__file__).parent
src, dist = root / "src", root / "docs"
dist.mkdir(exist_ok=True)
body = (src / "app.html").read_text(encoding="utf-8")
head = """<!doctype html>
<html lang="ja"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0A0A0B">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="指針帳">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icon-192.png">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font-size:14px}img{max-width:100%}[hidden]{display:none!important}</style>
"""
tail = """
<script>if('serviceWorker' in navigator){var hadSW=!!navigator.serviceWorker.controller,reloaded=false;
navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(function(r){r.update();document.addEventListener('visibilitychange',function(){if(!document.hidden)r.update();});}).catch(function(){});
navigator.serviceWorker.addEventListener('controllerchange',function(){if(hadSW&&!reloaded){reloaded=true;location.reload();}});}</script>
</body></html>
"""
# put <title>/<link>/<style> in head, rest in body
split = body.index('<header id="bar"')
(dist / "index.html").write_text(head + body[:split] + "</head><body>\n" + body[split:] + tail, encoding="utf-8")
import hashlib
ver = hashlib.sha1((dist / "index.html").read_bytes()).hexdigest()[:10]  # new version string on every change
(dist / "sw.js").write_text((src / "sw.js").read_text(encoding="utf-8").replace("__BUILD__", ver), encoding="utf-8")
for f in ["manifest.webmanifest", "icon-192.png", "icon-512.png"]:
    shutil.copy(src / f, dist / f)
print("built", dist)
