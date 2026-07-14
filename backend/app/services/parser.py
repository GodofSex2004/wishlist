import re
import logging
from typing import Optional

import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

SITE_RULES: dict[str, list[dict]] = {
    "stockx.com": [
        {"selector": "meta[itemprop='price']", "attr": "content"},
        {"selector": ".price .current-price", "attr": "text"},
    ],
    "farfetch.com": [
        {"selector": "meta[property='product:price:amount']", "attr": "content"},
        {"selector": "[data-tstid='priceInfo']", "attr": "text"},
    ],
    "endclothing.com": [
        {"selector": ".product-price .price", "attr": "text"},
        {"selector": "[data-price]", "attr": "data-price"},
    ],
    "sneakersnstuff.com": [
        {"selector": ".product-price__current", "attr": "text"},
    ],
}

FALLBACK_PATTERNS = [
    r'["\']?price["\']?\s*[:\=]\s*["\']?(\d+[\.,]?\d*)',
    r'€\s*(\d+[\.,]?\d*)',
    r'\$\s*(\d+[\.,]?\d*)',
    r'£\s*(\d+[\.,]?\d*)',
    r'(\d+[\.,]?\d*)\s*€',
    r'(\d+[\.,]?\d*)\s*\$',
]


def _find_rules(url: str) -> list[dict]:
    for domain, rules in SITE_RULES.items():
        if domain in url.lower():
            return rules
    return []


def _clean_price(text: str) -> Optional[float]:
    cleaned = re.sub(r'[^\d.,]', '', text)
    cleaned = cleaned.replace(',', '.')
    try:
        return float(cleaned)
    except ValueError:
        return None


async def parse_price(url: str) -> Optional[float]:
    rules = _find_rules(url)
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/125.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "en-US,en;q=0.9",
    }

    try:
        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
    except Exception as e:
        logger.warning("Failed to fetch %s: %s", url, e)
        return None

    soup = BeautifulSoup(resp.text, "lxml")

    for rule in rules:
        try:
            elements = soup.select(rule["selector"])
            if not elements:
                continue
            for el in elements:
                value = el.get(rule["attr"]) if rule["attr"] != "text" else el.get_text(strip=True)
                if value:
                    price = _clean_price(str(value))
                    if price is not None and price > 0:
                        logger.info("Parsed price %.2f from %s with rule %s", price, url, rule)
                        return price
        except Exception as e:
            logger.debug("Rule failed for %s: %s", url, e)
            continue

    text = soup.get_text()
    for pattern in FALLBACK_PATTERNS:
        match = re.search(pattern, text)
        if match:
            price = _clean_price(match.group(1))
            if price is not None and price > 0:
                logger.info("Parsed price %.2f from %s with fallback pattern", price, url)
                return price

    logger.info("Could not parse price from %s", url)
    return None
