"""Read official catalogue links; no credentials or unrelated browsing."""
import re
import urllib.request
from pathlib import Path

cache = Path('.cache/catalogues')
cache.mkdir(parents=True, exist_ok=True)

pages = {
    'abs': 'https://www.abs.gov.au/census/find-census-data/datapacks',
    'aihw': 'https://www.aihw.gov.au/reports/housing-assistance/cwlth-rent-assistance-in-australia-quarterly-data/data',
    'cpi': 'https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/consumer-price-index-australia/latest-release',
}
for name, url in pages.items():
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req, timeout=40).read().decode('utf-8')
        (cache / (name + '.html')).write_text(html, encoding='utf-8')
        print(name)
        for link in dict.fromkeys(re.findall(r'(?:href|src)=[\"\']([^\"\']+)', html)):
            if name == 'abs' and '2021' in link and any(x in link for x in ['GCP_SA3_', 'GCP_SA4_', 'GCP_AUS_', 'GCP_STE_', 'GCP_GCCSA_']):
                print(link)
            elif name != 'abs' and any(x in link.lower() for x in ['.xlsx', 'getmedia', 'viz.aihw']):
                print(link)
    except Exception as exc:
        print(name, type(exc).__name__, str(exc))
