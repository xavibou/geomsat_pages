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
- `app.js`: scene selection and image/prediction comparison.
- `scenes.json`: scene manifest and frozen model provenance.
- `assets/`: public figures, observations, predictions, and thumbnails.

The interactive gallery uses the frozen 150k DPT model with normal-loss weight 0.1, selected by minimum validation RMSE at epoch 60. The original teaser is explicitly separate and uses an earlier checkpoint. The arXiv/code links and citation remain placeholders until publication details are available.
