# 🪐 NovaCalc — Next-Gen Scientific & Glassmorphic Calculator

NovaCalc is an ultra-modern, glassmorphic calculator and unit conversion web application built with vanilla web technologies (HTML5, modern CSS3, and high-precision JavaScript).

---

## ✨ Features

### 1. 🧮 Modes
- **Standard Mode**: Everyday arithmetic, decimals, signs ($\pm$), percentage, backspace, and parentheses.
- **Scientific Mode**: Trigonometry ($\sin, \cos, \tan, \sin^{-1}, \cos^{-1}, \tan^{-1}$ with DEG/RAD switch), logarithms ($\ln, \log_{10}$), powers ($x^y, x^2, x^3$), roots ($\sqrt{x}, \sqrt[3]{x}$), factorial ($n!$), reciprocal ($1/x$), absolute value ($|x|$), constants ($\pi \approx 3.14159, e \approx 2.71828$), and modulus ($\%$).
- **Unit Converter**: Real-time conversions across 6 categories:
  - **Length**: Meters, Kilometers, Centimeters, Millimeters, Miles, Yards, Feet, Inches
  - **Mass / Weight**: Kilograms, Grams, Milligrams, Pounds, Ounces, Metric Tons
  - **Temperature**: Celsius (°C), Fahrenheit (°F), Kelvin (K)
  - **Digital Storage**: Bytes, Kilobytes, Megabytes, Gigabytes, Terabytes
  - **Speed**: m/s, km/h, mph, Knots
  - **Time**: Milliseconds, Seconds, Minutes, Hours, Days, Weeks, Years
  - **Send to Calculator**: Directly inject conversion results into the calculator.

### 2. 🎨 Themes (Glassmorphism & Ambient Glow)
- **Cosmic Nebula** (Deep indigo with radiant purple & cyan ambient glow)
- **Aurora Emerald** (Teal & mint neon glass)
- **Cyber Neon** (High-contrast magenta, cyan, and electric yellow)
- **Solar Sunset** (Warm crimson, amber, and coral hues)
- **OLED Obsidian** (Pure pitch black with crisp ice blue accents)
- **Porcelain Prism** (Crisp frosted white light mode)

### 3. 🔊 Synthesized Web Audio FX
- Built-in sound synthesizer using the **Web Audio API** (zero external MP3 files needed; 100% offline).
- Subtle mechanical tactile click for digits.
- Warm frequency blip for operators.
- Melodic harmonic chime on calculation (`=`).
- Alert sound on syntax or domain errors.
- One-click mute/unmute button or keyboard shortcut (`M`).

### 4. 📜 Calculation Tape & History Drawer
- Live calculation history with timestamps, full expressions, and results.
- Click any history item to recall its result or formula back into the display.
- One-click clear history.
- Persisted automatically in `localStorage`.

### 5. 💾 Memory Registers
- `MC` (Clear), `MR` (Recall), `M+` (Add), `M-` (Subtract), `MS` (Store) with on-screen visual indicator chip (`M`).

---

## ⌨️ Keyboard Shortcuts Reference

| Key | Action |
| --- | --- |
| `0` – `9` | Input digits |
| `+`, `-`, `*`, `/` | Arithmetic operators |
| `Enter` or `=` | Calculate result |
| `Backspace` | Delete last digit |
| `Esc` or `C` | All Clear (AC) |
| `(` and `)` | Parentheses grouping |
| `.` | Decimal point |
| `%` | Percentage / Modulo |
| `^` | Power / Exponent |
| `S` / `O` / `T` | Sine / Cosine / Tangent |
| `P` / `E` | Constants ($\pi$, $e$) |
| `H` | Toggle calculation tape / history |
| `M` | Toggle mechanical audio sound |
| `?` | Keyboard shortcuts reference dialog |

---

## 🚀 How to Run

NovaCalc runs standalone in any modern web browser without dependencies or build steps:

1. Double-click [index.html](file:///c:/Users/thanm/Downloads/Antigravity/index.html) or open it in Chrome, Edge, Firefox, or Safari.
2. Enjoy the calculation experience!
