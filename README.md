# Algorithm 3D Visualization

A React + Vite application for visualizing string searching and pattern matching algorithms in 3D using Three.js.

## Features

- **Naive String Matching**: Basic pattern matching algorithm visualization
- **KMP Algorithm**: Knuth-Morris-Pratt algorithm with failure function visualization
- **Rabin-Karp Algorithm**: Rolling hash-based pattern matching
- **Aho-Corasick Algorithm**: Multi-pattern matching with trie visualization

## Tech Stack

- React 18
- Vite
- Three.js (loaded via CDN)
- Tailwind CSS
- Lucide React Icons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
├── index.html          # HTML entry point
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── postcss.config.js   # PostCSS configuration
├── package.json        # Dependencies and scripts
└── src/
    ├── main.jsx        # React entry point
    ├── App.jsx         # Main application component
    └── index.css       # Global styles with Tailwind directives
```

## Usage

1. Select an algorithm from the header (NAIVE, KMP, RK, or AC)
2. Enter your text and pattern(s) in the configuration panel
3. Use the play/pause controls to step through the algorithm visualization
4. Adjust the speed slider to control animation speed
5. Move your mouse to rotate the 3D camera view

## License

MIT

