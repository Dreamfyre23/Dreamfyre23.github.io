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

## 🎨 Design System & Motion Engineering

Built with intent, vanilla web standards, and high-performance UI engineering — zero heavy framework bloat. Adopts the design language from [Sathyam Auto Finance](https://github.com/Dreamfyre23/FinanceLoanCaculator) as its visual foundation.

- **Interactive Glowing Square Grid Canvas:** HTML5 2D grid canvas that illuminates in response to mouse movement with crimson glow (`#e63946`) in dark mode and blue glow (`#3b82f6`) in light mode.
- **Dynamic Scroll & Page-Aware Background Intensity System:**
  - **Home Page Hero Top:** 100% visibility & full interaction, serving as the visual focal point.
  - **Smooth Scroll Progression:** $100\% \text{ (Hero Top)} \rightarrow 70\% \text{ (Mid Hero)} \rightarrow 50\% \text{ (End Hero)} \rightarrow 25\% \text{ (Sections)}$.
  - **Project Detail Pages:** Begins immediately at ~25% calm, non-intrusive background depth.
  - **Multi-Property Depth Shift:** Dynamically scales opacity, glow brightness, mouse disturbance radius ($180\text{px} \rightarrow 90\text{px}$), interaction strength ($100\% \rightarrow 25\%$), and grid contrast — creating a natural sense of the canvas retreating into the distance rather than fading out.
- **Glassmorphism & Depth System:** Semi-transparent dark glass surfaces (`rgba(18, 20, 28, 0.72)` + `backdrop-filter: blur(16px)`), ultra-thin light-reflecting borders, and deep floating elevation shadows (`0 32px 80px rgba(0,0,0,0.6)`).
- **Tactile & Parallax Interactions:**
  - **3D Card Parallax Tilt:** 3D perspective rotation (`rotateX`/`rotateY`) with dynamic radial cursor spotlight illumination (`--mouse-x`, `--mouse-y`).
  - **Magnetic Buttons:** Cursor-following spotlight shimmer (`--btn-x`, `--btn-y`), spring hover lift (`scale(1.015)`), and tactile press response (`scale(0.97)`).
- **Radial Theme Transition:** Radial circular sweep expanding from the toggle button's exact coordinates (`--origin-x`, `--origin-y` CSS custom properties with `cubic-bezier(0.22, 1, 0.36, 1)` spring easing).
- **`Cmd+K` Quick Navigation Command Palette:** Keyboard-driven navigation modal with fuzzy searching and focus trapping.
- **Smart Sticky Header & ScrollSpy:** Scroll direction-sensitive header navigation with `IntersectionObserver` section tracking.

---

## 📁 Repository Structure

```
my-website/
├── index.html                          # Main single-page portfolio
├── README.md                           # Repository documentation
├── assets/
│   ├── css/
│   │   └── style.css                   # Design tokens, layouts, glassmorphism & motion styles
│   ├── js/
│   │   └── main.js                     # Grid engine, scroll intensity lerp, Cmd+K, ScrollSpy & 3D tilt
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
