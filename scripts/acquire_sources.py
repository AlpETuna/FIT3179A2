"""Download public source files into the ignored cache. Never ship raw archives."""
from pathlib import Path
import html
import io
import re
import json
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pypdf import PdfReader

CACHE = Path('.cache/sources')
CACHE.mkdir(parents=True, exist_ok=True)
HEADERS = {'User-Agent': 'Mozilla/5.0', 'Accept': '*/*'}

def get(url, filename):
    path = CACHE / filename
    if path.exists():
        return path
    req = urllib.request.Request(html.unescape(url), headers=HEADERS)
    with urllib.request.urlopen(req, timeout=90) as response:
        data = response.read()
    path.write_bytes(data)
    print(filename, len(data), flush=True)
    return path

def safe_get(task):
    try:
        return get(*task)
    except Exception as exc:
        print('FAILED', task[1], type(exc).__name__, str(exc), flush=True)

tasks = [
    (f'https://www.abs.gov.au/census/find-census-data/datapacks/download/2021_GCP_{g}_for_AUS_short-header.zip', f'census-{g}.zip')
    for g in ['AUS', 'STE', 'SA3', 'SA4']
]
tasks += [
    ('https://www.aihw.gov.au/getmedia/b85bc0f4-b3e6-4d9a-a061-8e177a0d64bd/AIHW-HOU-341-CRA_Data-tables_March-2026.xlsx', 'cra-quarterly.xlsx'),
    ('https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/consumer-price-index-australia/jul-2026/640103.xlsx', 'cpi-03.xlsx'),
    ('https://www.aihw.gov.au/scripts/components/dataAndResources.js', 'aihw-resources.js'),
    ('https://www.aihw.gov.au/scripts/modules/dataOrResource.js', 'aihw-resource-module.js'),
    ('https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs/edition-3-july-2021-june-2026/access-and-downloads/digital-boundary-files/SA3_2021_AUST_SHP_GDA2020.zip', 'boundaries-SA3.zip'),
    ('https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/consumer-price-index-australia/jul-2026/640101.xlsx', 'cpi-01.xlsx'),
    ('https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/consumer-price-index-australia/jul-2026/640102.xlsx', 'cpi-02.xlsx'),
    ('https://www.aihw.gov.au/getmedia/3a78dfc6-1a28-4efc-86bf-1cce0510cfbb/Commonwealth-Rent-Assistance-in-Australia-quarterly-data.pdf?v=20260819105040&inline=true', 'aihw-report.pdf'),
    ('https://www.aihw.gov.au/scripts/scripts.js', 'aihw-scripts.js'),
]
with ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(safe_get, tasks))

# The pinned workbook above is the source of the implemented story. The public
# catalogue below records how its official download URL was originally found.
catalogue = CACHE / 'aihw-downloads.json'
if not catalogue.exists():
    filters = dict(enableTagFilter=False, keywords=[], itemsPerPage=10,
        filterByCurrentReport=False, filterByCurrentTopic=False,
        filterByContentType=False, contentType='', filterByChildrenOfCurrentNode=True,
        filterByChildrenOfSelectedNode='', orderByColumn='NodeOrder',
        reportNodeGuid='f2eead56-e21e-4141-94c2-096694590a2a', currentNodeId=83381,
        showDescription=True, showReportLink=False, showTopicsAndTags=False,
        showDate=False, showNumResults=False, isTopicLevel=False,
        ignoredResourceGuids='', includeDataReports=False, page=1)
    req = urllib.request.Request('https://www.aihw.gov.au/api/search/all-downloadable-resources',
        data=json.dumps(filters).encode(), headers={**HEADERS, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=90) as response:
        catalogue.write_bytes(response.read())

pdf = CACHE / 'aihw-report.pdf'
if pdf.exists():
    reader = PdfReader(io.BytesIO(pdf.read_bytes()))
    for page in reader.pages:
        for annotation in page.get('/Annots', []):
            uri = str(annotation.get_object().get('/A', {}).get('/URI', ''))
            if '.xlsx' in uri.lower():
                print('AIHW WORKBOOK', uri, flush=True)
                safe_get((uri, 'cra-quarterly.xlsx'))
