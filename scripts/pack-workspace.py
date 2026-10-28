# Packs the built workspace (npm run build:app) into one self-contained page for a private claude.ai link.
# Usage: python3 scripts/pack-workspace.py <output.html>
import base64, re, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent / 'dist-app'
out = pathlib.Path(sys.argv[1])
html = (root / 'app/index.html').read_text()
js_name = re.search(r'src="\.\./assets/([^"]+\.js)"', html).group(1)
css_name = re.search(r'href="\.\./assets/([^"]+\.css)"', html).group(1)
css = (root / 'assets' / css_name).read_text()
# Fonts: keep latin and latin-ext only, embedded as data URIs; drop the other subsets' @font-face rules.
def font_face(m):
    block = m.group(0)
    if 'url(data:' in block:
        return block  # already embedded by the bundler
    url = re.search(r'url\(\.?/?([^)]+\.woff2)\)', block)
    if not url or not re.search(r'-latin(-ext)?-wght', url.group(1)):
        return ''
    data = base64.b64encode((root / 'assets' / url.group(1)).read_bytes()).decode()
    return block.replace(url.group(0), f'url(data:font/woff2;base64,{data})')
css = re.sub(r'@font-face\{[^}]*\}', font_face, css)
js = (root / 'assets' / js_name).read_text().replace('</script', '<\\/script')
theme = re.search(r'<script>(.*?)</script>', html, re.S).group(1)
page = f'''<title>Clearline Workspace</title>
<meta name="robots" content="noindex, nofollow" />
<script>{theme}</script>
<style>{css}</style>
<div id="root"></div>
<script type="module">{js}</script>
'''
out.write_text(page)
print(len(page) // 1024, 'KB')
