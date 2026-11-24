#!/usr/bin/env python3
"""Validate multilingual canonical/hreflang and sitemap consistency without dependencies."""
from html.parser import HTMLParser
from pathlib import Path
import argparse
import sys
import xml.etree.ElementTree as ET

BASE = "https://www.hlaglobal.com.tw"
LANGS = ("zh-Hant-TW", "en", "ja")
ROOT = Path(__file__).resolve().parents[1]
SKIP = {"404.html"}

def url(path):
    if path == "index.html":
        return BASE + "/"
    if path in ("en/index.html", "ja/index.html"):
        return BASE + "/" + path.split("/")[0] + "/"
    return BASE + "/" + path

class Head(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonicals = []
        self.alternates = {}
        self.lang = None
        self.robots = ""
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "html":
            self.lang = a.get("lang")
        if tag == "link":
            rel = a.get("rel", "").lower().split()
            if "canonical" in rel:
                self.canonicals.append(a.get("href", ""))
            if "alternate" in rel and a.get("hreflang"):
                key = a["hreflang"]
                self.alternates.setdefault(key, []).append(a.get("href", ""))
        if tag == "meta" and a.get("name", "").lower() == "robots":
            self.robots = a.get("content", "").lower()

def check():
    errors = []
    def err(msg):
        errors.append(msg)
    pages = sorted(p.relative_to(ROOT).as_posix() for p in ROOT.rglob("*.html")
                   if ".git" not in p.parts and p.name not in SKIP)
    pages = [p for p in pages if not p.startswith(("node_modules/", "dist/", "build/"))]
    parsed = {}
    for p in pages:
        h = Head()
        h.feed((ROOT / p).read_text(encoding="utf-8"))
        parsed[p] = h
    for p, h in parsed.items():
        prefix = p.split("/")[0]
        lang = prefix if prefix in ("en", "ja") else "zh-Hant-TW"
        suffix = p[len(prefix)+1:] if prefix in ("en", "ja") else p
        counterparts = {
            "zh-Hant-TW": suffix,
            "en": "en/" + suffix,
            "ja": "ja/" + suffix,
        }
        if h.lang != lang:
            err(f"{p}: html lang {h.lang!r}, expected {lang!r}")
        if h.canonicals != [url(p)]:
            err(f"{p}: canonical {h.canonicals!r}, expected {url(p)}")
        if "noindex" in h.robots:
            err(f"{p}: noindex")
        for code, target in counterparts.items():
            if target not in parsed:
                err(f"{p}: missing language counterpart {target}")
                continue
            values = h.alternates.get(code, [])
            if values != [url(target)]:
                err(f"{p}: hreflang {code} = {values!r}, expected {url(target)}")
        if h.alternates.get("x-default") != [url(counterparts["zh-Hant-TW"])]:
            err(f"{p}: x-default mismatch")
        for code, values in h.alternates.items():
            if code not in (*LANGS, "x-default"):
                err(f"{p}: unexpected hreflang {code}")
            if len(values) != 1:
                err(f"{p}: duplicate hreflang {code}")
    sitemap = ROOT / "sitemap.xml"
    if not sitemap.exists():
        err("sitemap.xml missing")
    else:
        ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9",
              "x": "http://www.w3.org/1999/xhtml"}
        try:
            tree = ET.parse(sitemap)
            entries = {}
            for node in tree.findall("s:url", ns):
                loc = node.findtext("s:loc", namespaces=ns)
                alts = {}
                for link in node.findall("x:link", ns):
                    alts.setdefault(link.attrib.get("hreflang"), []).append(link.attrib.get("href"))
                if loc in entries:
                    err(f"sitemap: duplicate {loc}")
                entries[loc] = alts
            for p, h in parsed.items():
                u = url(p)
                if u not in entries:
                    err(f"sitemap: missing {u}")
                    continue
                for code, values in h.alternates.items():
                    if entries[u].get(code) != values:
                        err(f"sitemap: {u} hreflang {code} mismatch")
            for u in entries:
                if u not in {url(p) for p in parsed}:
                    err(f"sitemap: unexpected or missing local page {u}")
        except ET.ParseError as e:
            err(f"sitemap: invalid XML: {e}")
    print(f"Checked {len(parsed)} HTML pages and sitemap.xml; {len(errors)} issue(s).")
    for issue in errors[:100]:
        print("ERROR:", issue)
    if len(errors) > 100:
        print(f"... {len(errors)-100} more")
    return 1 if errors else 0

if __name__ == "__main__":
    sys.exit(check())
