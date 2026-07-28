# Dinesh Ram S P — Portfolio Website

> **Live Website:** [dreamfyre23.github.io](https://dreamfyre23.github.io)

Personal portfolio website of **Dinesh Ram S P** — Artificial Intelligence Engineer & Researcher specializing in **Deep Learning**, **Computer Vision**, **Explainable AI (XAI)**, and **Cloud-Deployed AI Applications**.

---

## 🌟 Key Highlights & Credentials

- 📄 **Peer-Reviewed Publication:** Author of *"Development of Smart Water IoT System to Assess and Monitor the Quality of Indian River Water"*, published in *IJLTEMAS*, Vol. 15, Issue 6 (2026). DOI: [10.51583/IJLTEMAS.2026.150600128](https://doi.org/10.51583/IJLTEMAS.2026.150600128)
- 🎤 **Conference Presentation:** Presented M.Tech research on *"Multi-Class Oral Cancer Classification Using EfficientNetV2 on Oral Photographs"* at **ICCCSP 2026**.
- ☁️ **Production Cloud Deployments:** Experience hosting PyTorch and SpectralFormer inference pipelines on Google Cloud Platform (App Engine & Cloud Storage).

---

## 🚀 Featured Case Studies

### 1. Oral Cancer Classification (Medical Imaging · Research)
- **Pipeline:** U-Net (oral cavity segmentation) → EfficientNetV2-M (multi-class disease classification) → Grad-CAM++ (Explainable AI lesion localization).
- **Focus:** Low-cost, accessible oral disease screening using smartphone photographs. Addressed severe class imbalance via geometric/photometric data augmentation and weighted focal loss.
- **Outcome:** Presented at **ICCCSP 2026**.

### 2. Land Cover Classification on GCP (Remote Sensing · Cloud)
- **Architecture:** Custom **SpectralFormer** (Transformer for multispectral satellite imagery) trained on 27,000 Sentinel-2 EuroSAT patches.
- **XAI Integration:** Integrated **Grad-CAM**, **LIME**, and **Layer-wise Relevance Propagation (LRP)** to make model predictions transparent.
- **Deployment:** Flask backend hosted on **Google App Engine** with weights loaded from **Google Cloud Storage**.

### 3. Smart Water IoT Monitoring System (IoT · Applied ML)
- **Pipeline:** Hardware sensors (pH, turbidity, temp, TDS) → Arduino Uno → ESP8266 Wi-Fi → Cloud → **XGBoost** potability classification & Water Quality Index (WQI) calculation.
- **Feature:** Live web dashboard with automated email alert notifications.
- **Outcome:** Published in peer-reviewed journal **IJLTEMAS (2026)**.

---

## 🎨 Design & Motion Engineering Highlights

Built with intent, vanilla web standards, and high-performance UI engineering — zero heavy framework bloat.

- **Dual-System Atmospheric Aurora Canvas:** A custom HTML5 2D canvas simulating translucent vertical light curtains (Northern Lights) flowing autonomously across the upper atmosphere, with a secondary localized magnetic mouse disturbance layer ($R = 280\text{px}$). 100% subordinate to content.
- **Dual Light/Dark Theme:** Styled with CSS custom property design tokens and smooth circular ripple transitions via the **View Transition API**.
- **`Cmd+K` Quick Navigation Command Palette:** Instant keyboard-driven search and jump palette with keyboard focus trap and fuzzy filtering.
- **AWS-Inspired Interactions:**
  - 3D parallax card tilt (`rotateX`/`rotateY`) with dynamic radial spotlight illumination overlay (`--mouse-x`, `--mouse-y`).
  - Magnetic button hover response with spotlight shimmer gradients.
- **Smart Sticky Header:** Scroll direction tracking hides header on downward scroll and reveals smoothly on upward scroll, with `IntersectionObserver` active section ScrollSpy tracking.

---

## 📁 Repository Structure

```
my-website/
├── index.html                          # Main single-page portfolio
├── README.md                           # Repository documentation
├── assets/
│   ├── css/
│   │   └── style.css                   # Design tokens, layouts, and motion styles
│   ├── js/
│   │   └── main.js                     # Aurora engine, Cmd+K, ScrollSpy, 3D tilt & magnetic handlers
│   ├── partials/
│   │   ├── nav.html                    # Shared header & navigation partial
│   │   └── footer.html                 # Shared footer partial
│   ├── covers/                         # Project cover images
│   ├── dp.jpg                          # Profile photograph
│   └── Dinesh_Ram_S_P_Resume.pdf       # Downloadable resume
└── projects/                           # Detailed case studies
    ├── oral-cancer-classification.html
    ├── land-cover-classification-gcp.html
    └── smart-water-quality-monitoring.html
```

---

## 🛠️ Local Development

No build step or compilation required — served directly as static web files.

1. Clone the repository:
   ```bash
   git clone https://github.com/Dreamfyre23/Dreamfyre23.github.io.git
   cd Dreamfyre23.github.io
   ```
2. Serve locally using any HTTP server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Or using Node npx
   npx serve .
   ```
3. Open `http://localhost:8000` in your browser.

---

## 📬 Contact & Connect

- **Email:** [dineshramsp@gmail.com](mailto:dineshramsp@gmail.com)
- **LinkedIn:** [linkedin.com/in/dineshramsp](https://www.linkedin.com/in/dineshramsp)
- **GitHub:** [github.com/Dreamfyre23](https://github.com/Dreamfyre23)
- **Portfolio:** [dreamfyre23.github.io](https://dreamfyre23.github.io)

---

*© 2026 Dinesh Ram S P. Built with intent, not templates.*
