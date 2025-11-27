# Algorithm Visualization

A React + Vite application for visualizing string searching and pattern matching algorithms with interactive step-by-step demonstrations.

## Features

- **Naive String Matching**: Basic pattern matching algorithm with character-by-character comparison visualization
- **KMP Algorithm**: Knuth-Morris-Pratt algorithm with Next (LPS) table visualization and failure function demonstration
- **Rabin-Karp Algorithm**: Rolling hash-based pattern matching with hash value visualization
- **Aho-Corasick Algorithm**: Multi-pattern matching with interactive trie automaton visualization and side-by-side code viewer

### Key Features

- **Interactive Step-by-Step Execution**: Play, pause, step forward/backward through algorithm execution
- **Real-time Code Highlighting**: For AC algorithm, see the executing code line highlighted alongside the visualization
- **Visual Text Stream**: Character-by-character visualization with index indicators
- **Dynamic Visualizations**:
  - Pattern window sliding for Naive and KMP algorithms
  - Hash value displays for Rabin-Karp
  - Interactive trie graph with tooltips for Aho-Corasick
- **Bilingual Interface**: English and Chinese descriptions for all steps
- **Adjustable Speed**: Control animation speed with a slider

## Tech Stack

- React 18
- Vite
- SVG for graph visualizations
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

1. **Select an Algorithm**: Choose from NAIVE, KMP, RK (Rabin-Karp), or AC (Aho-Corasick) in the header
2. **Configure Input**:
   - Enter your text string in the "Text (Main String)" field
   - Enter pattern(s):
     - For Naive, KMP, and RK: Enter a single pattern
     - For AC: Enter comma-separated patterns (e.g., "arrows, row, sun, under")
3. **Control Playback**:
   - Use the play/pause button to start/stop automatic execution
   - Use step forward/backward buttons to navigate manually
   - Use reset button to return to the beginning
4. **Adjust Speed**: Use the speed slider to control how fast the algorithm steps execute
5. **View Visualizations**:
   - Watch the text stream highlight as characters are processed
   - Observe pattern window movements (Naive/KMP)
   - See hash values update (Rabin-Karp)
   - Explore the trie automaton graph with tooltips (Aho-Corasick)
   - For AC algorithm, view the executing code line highlighted in the code viewer

## License

MIT
