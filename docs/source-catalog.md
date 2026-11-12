# Source catalog

The home route `/` shows the SVN tree rooted at `battery/jaro/` and the EpiServe model-run list. `/about` retains the previous homepage. Existing SVN run URLs are unchanged. `/episerve/:runId` shows metadata and files for any model, including failed runs and non-EpiSim results.

## EpiServe storage contract (proposed)

The model writes its visualization package under `/work/output/`. The model runner preserves nested files in lakeFS and lists them in FDO components. The API exposes their DOIP download URLs in `output_files`. No HTML directory listing is required from DOIP.

```text
output/
  metadata.yaml
  _info.txt
  notes.md
  chart-incidence.yaml       # optional chart*.yaml files
  summaries/
    0.zip
    1.zip
    ...
  observed/                  # optional, declared in metadata.yaml
    weekly.tsv
```

Keep the same relative paths, ZIP contents, `_info.txt` format and scenario option definitions as an existing SVN visualization package. `metadata.yaml` selects `viewerVersion: 1` or `2`, and declares `city`, `readme`, `zipFolder`, `graphStartDate` and `optionGroups`. For new multi-pathogen packages use Viewer V2 and explicitly declare pathogen and observed data. All files needed by the viewer must appear in the FDO component manifest, otherwise DOIP will not serve them. Package identification checks metadata shape and the presence of `_info.txt` and a ZIP under `zipFolder`; this does not validate ZIP contents or guarantee all optional plots exist.

Generic `predictions.tsv` runs remain downloadable but are not passed to EpiSim. No forecast viewer is implemented. Infection-map navigation still uses the legacy SVN-specific route and is not supported for EpiServe packages yet.

## Networking and deployment

Vite proxies these same-origin routes during `npm run dev`:

- `/sources/episerve/*` → `https://api.episerve.zib.de/*`
- `/sources/doip/*` → `https://doip.episerve.zib.de/*`
- `/sources/catalog/*` → `https://data.episerve.zib.de/*`

Production hosting must provide the same mappings before its SPA fallback. The workspace `deploy/Caddyfile` includes them for `viz.episim.info`. A static build alone cannot provide these proxies. No API tokens are needed for public runs. Restricted resources may return 401/403; the viewer does not obtain credentials or bypass their access policy. The SVN source uses its existing cross-origin access.

Development: `npm run dev`. Build: `npm run build`. Relevant checks: `npm run test:run -- tests/unit/runSources.spec.ts tests/unit/observedData.spec.ts`.

## Upstream references checked

- https://github.com/The-EPISERVE-Consortium/episerve_api_server
- https://github.com/The-EPISERVE-Consortium/workflow-prefect__model-runner
- https://github.com/The-EPISERVE-Consortium/episerve_doip_server
- https://api.episerve.zib.de/openapi.json

The integration has been checked against public generic runs. A real EpiSim run is not yet available in EpiServe, so full EpiSim rendering from DOIP remains to be verified when such a package is published.
