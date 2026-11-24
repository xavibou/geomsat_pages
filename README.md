# GeomSat paper website

Project page for **GeomSat: Learning Geometric-Aware Representations for Very High Resolution Satellite Imagery**, by Xavier Bou, Gabriele Facciolo, and Thibaud Ehret.

Expected website address: https://xavibou.github.io/geomsat_pages/

## Publish

In this repository, open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select **main** and **/(root)**, then save. GitHub Pages republishes subsequent commits to `main` automatically.

The site uses static HTML, CSS, and JavaScript. No build step or API keys are required.

## Preview locally

```bash
python3 -m http.server 8080 --bind 127.0.0.1
```

Open http://localhost:8080. Use HTTP rather than opening `index.html` directly, so the scene manifest can load.

## Edit

- `index.html`: paper text, authors, resource placeholders, figures, and citation.
- `style.css`: page and responsive layout.
- `app.js`: scene selection and paired input/output comparison, with a prediction/ground-truth switch.
- `scenes.json`: scene manifest and frozen model provenance.
- `assets/`: public figures, observations, predictions, and thumbnails.

The interactive gallery uses the frozen 150k DPT model with normal-loss weight 0.1, selected by minimum validation RMSE at epoch 60. The original teaser is explicitly separate and uses an earlier checkpoint. The arXiv/code links and citation remain placeholders until publication details are available.

## Demo scenes

The demo shows ten native large-area mosaics, each approximately 800 m per side:

- Ordinary Paris neighbourhoods (two areas).
- Collioure, Rochefort, Arcachon, and La Baule, from France test sites.
- Rio de Janeiro: the Maracanã area from the teaser.
- Ordinary urban areas in Libreville, Dakar, and Tehran, avoiding the Eiffel/Azadi Tower examples.

The three original ground-truth test crops remain available at the end of the thumbnail strip. Their output can switch between prediction and aligned LiDAR ground truth. Mosaics have no aligned full-area GT, so they show prediction only. Click an image to open its full-resolution PNG.

## Native tiling and provenance

Large regions are read from original sensor-image products at native resolution. Product-window offsets are verified against the saved dataset crops for exact pixel equality. Image extent is chosen using adjusted RPC pixel geometry, giving roughly 800 m per side, comparable to the Rio teaser area. No image upscaling is used.

Inference uses overlapping 512 × 512 tiles at 384 px stride with the frozen 150k DPT model, normal-loss weight 0.1, selected by minimum validation RMSE at epoch 60. Positive cosine feathering merges heights in the original image coordinates. RGB display stretch is calculated once over the entire region. No GT height fitting or prediction scale alignment is performed. All outputs share a 0–60 m square-root viridis display scale.

Four non-Paris France mosaics are verified members of the pre-training test split. Some Paris/world scenes are pre-training train/validation sites; these illustrative examples are not claimed as geographically unseen evaluations. Exact image sizes, approximate extents, acquisition split status, tile counts, and model/source hashes are recorded in `scenes.json`. The original teaser uses an earlier checkpoint.

The three retained GT crops were selected using reference heights only: >=80% valid ground truth, >=20% of valid heights above 5 m, and >=5% above 10 m. Selection does not rank prediction accuracy.
