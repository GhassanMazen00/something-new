# Clearline workspace

The staff-only system that runs the 32 analysis services on client files. It runs on one computer and is
reached through the browser on that computer only. Nothing is published online.

- **Models, not AI.** Every number comes from a named statistical model (statsforecast, statsmodels,
  scikit-learn, lifelines, scipy). The AI slot is built in but switched off (`clearline/ai.py`).
- **Roles.** Admin (people and clients), analyst (works only on the clients assigned to them), reviewer
  (approves reports before they go out).
- **Security.** Two-step sign-in with an authenticator app, a separate encryption key for each client, and
  files encrypted on disk under random names. Files are deleted on schedule (60 days after the client is opened, or 30 days after
  delivery), and every action goes into a tamper-evident activity log.
- **Reports.** Word and Excel files, and a print view that saves as PDF. You don't need Excel, Power BI or
  any other software to produce them.

## Install on Windows (once)

1. Install **Python 3.12** from <https://www.python.org/downloads/windows/>. On the first screen of the
   installer, tick **“Add python.exe to PATH”**.
2. Download this repository (green **Code** button → **Download ZIP**) and unzip it, for example to
   `Documents\Clearline`.
3. Open the `platform` folder and double-click **`setup.bat`**. It creates a private Python environment
   in the folder and installs the libraries. This takes 3–5 minutes the first time.

You don't need Node.js: the screens are already built into `clearline/static`.

## Every day

Double-click **`start.bat`**. The workspace opens in your browser at <http://127.0.0.1:8000>. Keep the black
window open while you work, and close it to stop.

On Mac or Linux, run `./start.sh` instead. It sets itself up on first run.

### First time

1. **Set up the workspace.** Create the admin account and scan the code with an authenticator app
   (Google Authenticator, Microsoft Authenticator, 1Password…).
2. **People.** Add analysts and reviewers. Each gets a temporary password, shown once, to give them in
   person. At first sign-in they choose their own password and scan their own code.
3. **Clients → New client.** Pick the analyst and the reviewer, and set the currency. The currency also sets
   the calendar: Ramadan and a Friday–Saturday weekend for EGP, SAR and similar currencies. You can change
   this in the client's details.

### A client job

1. **Files.** Drop in the client's CSV or Excel exports. Each one is encrypted as soon as it arrives.
2. **Check columns.** The workspace guesses what each file is and which column means what, in English or
   Arabic. You confirm it once per file, then it cleans the data and gives the file a health score.
3. **Services.** Each service shows how confidently it can run on these files. Open one to see its result,
   change the what-if settings, and press **Add to report**.
4. **Report.** Write the summary and a note on each section, then **Send for review**.
5. The reviewer **Approves** or **Asks for changes**. Once the report is approved, download it as
   **Word** / **Excel**, or **Print or PDF**, and mark it **delivered**. The files are deleted 30 days later.

### If someone loses their phone

An admin can press **Reset** on the People page. If the admin is the one locked out, open a command window
in the `platform` folder and run:

```
.venv\Scripts\python -m clearline reset admin@yourfirm.com
```

## Your data and backups

Everything lives in `platform\data`:

| File | What it is |
| --- | --- |
| `master.key` | The key that unlocks every client key. **Without it, nothing can be read.** |
| `clearline.db` | People, clients, results, the activity log (client content inside is encrypted) |
| `files\` | The encrypted client files |

To back up, copy the whole `data` folder to an encrypted USB drive or an encrypted cloud folder. Store
`master.key` apart from the rest if you can. Never email it. `data` is excluded from git, so it never goes to
GitHub.

To keep the data somewhere else, set the environment variable `CLEARLINE_DATA` to that folder before
starting.

## Testing with public data

Make a test client for each dataset and upload the file as it is. The first four were run through every
service while this was built. The rest are well-known open datasets you can download on your own computer.

| Dataset | Where | Read as | Services it exercises |
| --- | --- | --- | --- |
| **Online Retail**: 541,909 invoice lines from a UK gift wholesaler, 2010–11 (tested) | [UCI](https://archive.ics.uci.edu/dataset/352/online+retail) · [CSV copy](https://raw.githubusercontent.com/databricks/Spark-The-Definitive-Guide/master/data/retail-data/all/online-retail-dataset.csv) | Sales list (set the currency to GBP) | Snapshot, KPI dashboard, trends, drivers, benchmarking (countries as branches), forecast, price what-if, ranking, stock plan, customer groups, churn, profit projection, staffing |
| **IBM HR Attrition**: 1,470 employees (tested) | [CSV](https://raw.githubusercontent.com/IBM/employee-attrition-aif360/master/data/emp_attrition.csv) | Staff list | Staff turnover, pay fairness |
| **Meta Robyn** weekly marketing sample (tested) | [CSV](https://raw.githubusercontent.com/facebookexperimental/Robyn/main/python/src/robyn/tutorials/resources/dt_simulated_weekly.csv) | Weekly marketing sheet | Budget split across channels |
| **Google Meridian** national sample (tested) | [CSV](https://raw.githubusercontent.com/google/meridian/main/meridian/data/simulated_data/csv/national_all_channels.csv) | Weekly marketing sheet | Budget split across channels |
| **Online Retail II**: the same shop, 2009–11 | [UCI](https://archive.ics.uci.edu/dataset/502/online+retail+ii) | Sales list (pick the sheet) | As Online Retail, with two years for the forecast |
| **Superstore** sales | Kaggle, “Superstore Sales” | Sales list | Sales and customer services |
| **A/B test** `ab_data.csv` | Kaggle, “A/B testing” | A/B test (one row per visitor) | A/B test check |
| **City of Chicago Payments** | [data.cityofchicago.org](https://data.cityofchicago.org/), “Payments” | General ledger | Error and fraud scan (Benford, duplicates, outliers) |
| **UK government spend over £25,000** | [data.gov.uk](https://www.data.gov.uk/), search “spend over 25000” | General ledger | Error and fraud scan, including gaps in transaction numbers |
| **NYC Citywide Payroll** | [data.cityofnewyork.us](https://data.cityofnewyork.us/), “Citywide Payroll Data” | Payroll | Payroll error scan (overtime spikes, duplicates) |
| **Google Trends** | [trends.google.com](https://trends.google.com/): search a product, then the download icon | Search trends | Demand trends |

There is no good public source for bank statements, accounts payable, or surveys. For those:

- export your own business bank account as CSV;
- use the made-up clients in `samples/` (Nile Home Furnishings, Lotus Beauty, Delta Medical Supplies),
  which cover every file type, including Arabic headers;
- or make a Google Form: an eNPS question from 0 to 10 plus a comment box for the employee survey, or the four
  Van Westendorp price questions for the customer survey. Export the responses as CSV.

## Do we need Excel or Power BI?

No. The workspace makes the Word and Excel files and a printable PDF view itself. Your team needs Excel or
Word only to open those files, and the client can open them in anything. Power BI or Looker Studio are only
worth adding later, if clients want a live dashboard they can click around in.

## The AI slot

`clearline/ai.py` reserves three jobs for Claude, all switched off:

- reading PDF bank statements into tables;
- suggesting column matches the rules can't settle;
- drafting the report summary for the analyst to edit.

It stays off until the workspace moves to a secure server, client data is covered by a zero-retention
agreement, and every AI call is written to the activity log. The AI will never produce the numbers.

## For developers

```
pip install -r requirements-dev.txt
python -m pytest tests               # API end to end, intake, all services on the samples
npm run build:platform               # rebuild the screens into clearline/static (from the repo root)
npm run dev:platform                 # live-reload the screens against a server on port 8000
```

Folder map:

- `clearline/api.py`: routes and permission checks.
- `clearline/intake.py`: reading and mapping files.
- `clearline/engine/`: the 32 services.
- `clearline/reports.py`: Word and Excel.
- `src/platform/` (repo root): the screens.
