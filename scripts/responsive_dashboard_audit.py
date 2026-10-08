#!/usr/bin/env python3
"""Responsive smoke audit for the dashboard at 320, 375 and 430 CSS pixels."""
import json
import os
from playwright.sync_api import sync_playwright

URL = os.environ.get("RESPONSIVE_URL", "http://127.0.0.1:3000/")
WIDTHS = (320, 375, 430)


def click(page, name):
    locator = page.get_by_role("button", name=name, exact=True)
    if locator.count():
        locator.first.click(timeout=5000)
        page.wait_for_timeout(300)
        return True
    return False


def audit(page, page_name, width):
    return page.evaluate(
        """
        ({pageName, width}) => {
          const viewport = window.innerWidth;
          const candidates = [...document.querySelectorAll('button,a,input,textarea,select,[role="button"]')];
          const clipped = candidates.map((el, index) => {
            const rect = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            return {
              index,
              tag: el.tagName,
              text: (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || '').trim().replace(/\\s+/g, ' ').slice(0, 100),
              left: Math.round(rect.left * 10) / 10,
              right: Math.round(rect.right * 10) / 10,
              visible: Boolean(rect.width && rect.height && style.visibility !== 'hidden' && style.display !== 'none'),
              clipped: rect.left < -1 || rect.right > viewport + 1,
            };
          }).filter((item) => item.visible && item.clipped);
          return {
            page: pageName,
            width,
            innerWidth: viewport,
            scrollWidth: document.documentElement.scrollWidth,
            bodyScrollWidth: document.body.scrollWidth,
            clipped,
          };
        }
        """,
        {"pageName": page_name, "width": width},
    )


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(
        executable_path=os.environ.get("CHROMIUM", "/usr/bin/chromium"),
        headless=True,
        args=["--no-sandbox"],
    )
    results = []
    for width in WIDTHS:
        page = browser.new_page(viewport={"width": width, "height": 900})
        page.goto(URL, wait_until="networkidle", timeout=30000)
        if click(page, "Connexion"):
            click(page, "Lancer la session Démo & Explorer")
            page.wait_for_timeout(800)
            click(page, "Passer")

        results.append(audit(page, "dashboard", width))

        # Creator dashboard navigation items that are present in the demo workspace.
        for page_name, button in (
            ("accueil", "Accueil"),
            ("assistance", "Assistance"),
            ("affilies", "Affiliés"),
            ("parametres_entreprise", "Paramètres Entreprise"),
            ("parametres_compte", "Paramètres Compte"),
        ):
            if click(page, button):
                results.append(audit(page, page_name, width))

        for page_name, button in (("communaute", "Communauté"), ("decouvrir", "Découvrir"), ("compte", "Compte")):
            click(page, button)
            results.append(audit(page, page_name, width))

        page.close()

    browser.close()

print(json.dumps(results, ensure_ascii=False, indent=2))
failed = [result for result in results if result["scrollWidth"] != result["width"] or result["clipped"]]
raise SystemExit(1 if failed else 0)
