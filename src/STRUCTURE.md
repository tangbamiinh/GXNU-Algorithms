# Project Structure

This document describes the refactored project structure.

## Directory Structure

```
src/
├── components/           # Reusable UI components
│   ├── Badge.jsx        # Badge component
│   ├── Card.jsx         # Card container component
│   ├── CodeViewer.jsx   # Code display with syntax highlighting
│   ├── ControlButton.jsx # Play/pause/step control buttons
│   ├── Tooltip.jsx      # Tooltip component
│   ├── VizTitle.jsx     # Visualization title with tooltip
│   ├── TextHighlight.jsx # Text highlighting utility
│   ├── AlgorithmLayout.jsx # Shared layout for algorithm pages
│   └── visualizations/  # Algorithm-specific visualizations
│       ├── Naive/       # Naive algorithm components
│       ├── KMP/         # KMP algorithm components
│       ├── RK/          # Rabin-Karp algorithm components
│       └── AC/          # Aho-Corasick algorithm components
├── constants/           # Constants and configuration
│   ├── colors.js        # Color constants
│   └── codeSnippets.js  # Algorithm code snippets
├── utils/               # Utility functions
│   ├── trieLayout.js    # Trie layout calculation
│   └── algorithmGenerators.js # Step generators for each algorithm
├── pages/               # Page components (future use)
├── App.jsx              # Main application component
├── main.jsx             # React entry point
└── index.css            # Global styles
```

## Component Organization

### Core Components (`components/`)
- **Badge**: Colored badge component
- **Card**: Container with title and content
- **CodeViewer**: Syntax-highlighted code display
- **ControlButton**: Playback/ause/step controls
- **Tooltip**: Hover tooltip with positioning
- **VizTitle**: Title with help tooltip
- **TextHighlight**: Text highlighting with match visualization
- **AlgorithmLayout**: Shared layout wrapper

### Algorithm Visualizations (`components/visualizations/`)

#### Naive (`Naive/`)
- `NaiveMatchHistory`: Displays match history
- `NaiveStatistics`: Shows algorithm statistics

#### KMP (`KMP/`)
- `KMPNextTable`: Next/LPS table visualization
- `KMPJumpVisualization`: Jump history display
- `KMPStatistics`: Algorithm statistics

#### Rabin-Karp (`RK/`)
- `RKHashVisualization`: Hash value display
- `RKHashDetails`: Hash parameters and formulas
- `RKStatistics`: Algorithm statistics

#### Aho-Corasick (`AC/`)
- `ACAutomaton`: Interactive trie automaton SVG
- `TransitionTable`: State transition matrix
- `MatchHistoryTimeline`: Chronological match list
- `StateTransitionHistory`: State visit breadcrumbs
- `OutputSetVisualization`: States with output patterns
- `CharacterProcessingFlow`: Step-by-step processing
- `OptimizationVisualization`: Direct transitions display
- `FailureLinkTree`: Failure link relationships
- `MatchCounterStats`: Match statistics

## Constants (`constants/`)

### `colors.js`
Color palette constants used throughout the app.

### `codeSnippets.js`
- Algorithm code arrays (NAIVE_CODE, KMP_CODE, RK_CODE, AC_CODE)
- `getCodeLineForStep()`: Maps step types to code line numbers

## Utilities (`utils/`)

### `trieLayout.js`
- `calculateTrieLayout()`: Calculates node positions for AC automaton visualization

### `algorithmGenerators.js`
- `generateNaiveSteps()`: Generates execution steps for Naive algorithm
- `generateKMPSteps()`: Generates execution steps for KMP algorithm
- `generateRKSteps()`: Generates execution steps for Rabin-Karp algorithm
- `generateACSteps()`: Generates execution steps for Aho-Corasick algorithm

## Main Application (`App.jsx`)

The main App component:
- Manages algorithm selection and state
- Handles step-by-step execution
- Renders algorithm-specific visualizations
- Coordinates all components

## Benefits of This Structure

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be easily reused or modified
3. **Maintainability**: Easy to locate and update specific features
4. **Scalability**: Simple to add new algorithms or visualizations
5. **Testability**: Components can be tested in isolation

