# Algorithm Visualization

A React + Vite application for visualizing string searching and pattern matching algorithms with interactive step-by-step demonstrations. Features comprehensive visualizations, real-time code highlighting, and bilingual (English/Chinese) interface.

## Algorithms

### 1. Naive String Matching (朴素算法)
Basic pattern matching algorithm with character-by-character comparison visualization.

**Visualizations:**
- **Code Viewer**: Real-time C++ code execution with syntax highlighting
- **Text Stream**: Character-by-character visualization with index indicators
- **Pattern Window**: Visual sliding window showing current comparison position
- **Match History**: Chronological list of all matches found with positions
- **Statistics**: Total comparisons, matches found, and performance metrics

### 2. KMP Algorithm (KMP算法)
Knuth-Morris-Pratt algorithm with Next (LPS) table visualization and failure function demonstration.

**Visualizations:**
- **Code Viewer**: Real-time C++ code execution with syntax highlighting
- **Text Stream**: Character-by-character visualization with index indicators
- **Pattern Window**: Visual sliding window showing current comparison position
- **Next Table (LPS)**: Longest Proper Prefix Suffix table visualization
- **Jump Visualization**: Visual representation of pattern index jumps when mismatches occur
- **Statistics**: Total comparisons, matches found, and jump efficiency metrics

### 3. Rabin-Karp Algorithm (RK算法)
Rolling hash-based pattern matching with comprehensive hash value visualization.

**Visualizations:**
- **Code Viewer**: Real-time C++ code execution with syntax highlighting
- **Text Stream**: Character-by-character visualization with index indicators
- **Hash Values**: Animated visualization of pattern hash (Hp) and rolling window hash (Ht)
- **Hash Details**: Hash parameters, rolling hash formula, and collision information
- **Statistics**: Total comparisons, hash collisions, matches found, and performance metrics

### 4. Aho-Corasick Algorithm (AC自动机)
Multi-pattern matching with interactive trie automaton visualization and comprehensive analysis tools.

**Visualizations:**
- **Code Viewer**: Real-time C++ code execution with syntax highlighting
- **Interactive Trie Automaton**: SVG graph showing the AC automaton structure
  - Solid arrows: Character transitions
  - Dashed red arrows: Failure links
  - Blue highlight: Current state
  - Hover tooltips: State information
- **Transition Table**: Complete state transition matrix showing all possible character transitions
- **Match History Timeline**: Chronological list of all patterns found with positions and states
- **State Transition History**: Breadcrumb trail of states visited during execution
- **Character Processing Flow**: Step-by-step visualization of character processing logic
- **Match Counter & Statistics**: Total matches, matches per pattern, and processing statistics
- **Output Sets**: Visualization of states with output patterns
- **Optimized Transitions**: Shows O(1) direct transitions avoiding failure link traversal
- **Failure Link Tree**: Simplified view showing only failure links in the automaton
- **Matched Patterns Highlighting**: Color-coded pattern matches in the text stream
- **Failure Link Path Animation**: Animated paths showing failure link traversal

## Key Features

### Interactive Controls
- **Play/Pause**: Start/stop automatic execution
- **Step Forward/Backward**: Navigate manually through algorithm steps
- **Reset**: Return to the beginning of execution
- **Speed Control**: Adjustable slider to control animation speed
- **Step Counter**: Real-time display of current step number

### Code Visualization
- **Real-time Code Highlighting**: All algorithms feature live code execution highlighting
- **Syntax Highlighting**: C++ code with proper syntax colors
- **File Headers**: Code blocks display algorithm name and filename
- **Compact Layout**: Optimized spacing for better readability

### User Interface
- **Bilingual Support**: Full English and Chinese (中文) interface
- **Tooltips**: Interactive help tooltips for all visualizations (hover over ℹ️ icons)
- **Responsive Design**: Optimized layouts for different screen sizes
- **Consistent Layout**: Unified configuration panels and controls across all algorithms
- **Screen-Fitting Layout**: Visualizations automatically fit to viewport height

### Visual Enhancements
- **Color-Coded Elements**: Different colors for matches, comparisons, states, and transitions
- **Animated Transitions**: Smooth animations for state changes and pattern matching
- **Interactive Elements**: Hover effects and clickable components
- **Visual Feedback**: Clear indicators for current position, matches, and algorithm state

## Tech Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **SVG**: Scalable vector graphics for graph visualizations
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

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
    ├── App.jsx         # Main application component (all algorithms and visualizations)
    └── index.css       # Global styles with Tailwind directives
```

## Usage

1. **Select an Algorithm**: Choose from Naive, KMP, Rabin-Karp, or Aho-Corasick in the header

2. **Configure Input**:
   - Enter your text string in the "Text (Main String) / 文本（主字符串）" field
   - Enter pattern(s):
     - For Naive, KMP, and Rabin-Karp: Enter a single pattern
     - For Aho-Corasick: Enter comma-separated patterns (e.g., "arrows, row, sun, under")

3. **Control Playback**:
   - Use the play/pause button in the title bar to start/stop automatic execution
   - Use step forward/backward buttons to navigate manually
   - Use reset button to return to the beginning
   - Monitor the step counter to track progress

4. **Adjust Speed**: Use the speed slider to control how fast the algorithm steps execute

5. **Explore Visualizations**:
   - **All Algorithms**: Watch the code viewer highlight executing lines
   - **Naive/KMP**: Observe pattern window movements and character comparisons
   - **Rabin-Karp**: See hash values update with rolling hash animations
   - **Aho-Corasick**: Explore the interactive trie automaton with multiple visualization panels
   - Hover over ℹ️ icons for detailed explanations of each visualization

6. **View Statistics**: Check match counts, comparisons, and performance metrics in the statistics panels

## Algorithm Details

### Naive String Matching
- **Time Complexity**: O(nm) where n is text length, m is pattern length
- **Space Complexity**: O(1)
- **Best Use Case**: Simple pattern matching, educational purposes

### KMP Algorithm
- **Time Complexity**: O(n + m) preprocessing + O(n) matching
- **Space Complexity**: O(m) for the Next/LPS table
- **Best Use Case**: Single pattern matching with repeated substrings

### Rabin-Karp Algorithm
- **Time Complexity**: O(n + m) average case, O(nm) worst case
- **Space Complexity**: O(1)
- **Best Use Case**: Multiple pattern matching, plagiarism detection

### Aho-Corasick Algorithm
- **Time Complexity**: O(n + m + z) where z is number of matches
- **Space Complexity**: O(m) where m is total pattern length
- **Best Use Case**: Multiple pattern matching simultaneously

## License

MIT
