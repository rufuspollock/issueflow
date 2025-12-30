# IssueFlow

Issues form a DAG 😉

## Features Implemented

- GitHub Integration: Fetch issues from any public or private repository using a Personal Access Token (PAT).
- Dependency Parsing: Automatically extracts dependencies from issue descriptions (e.g., depends on #123 or blocked by #123).
- DAG Visualization: Renders issues as interactive nodes in a React Flow canvas, with automatic layout using dagre.
- Premium Design: A modern, glassmorphism-inspired UI with custom issue nodes showing status, author, and links.
- Local Caching: Persists your repository, token, and fetched issues in localStorage for a seamless experience.

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open the app**:
   Navigate to [http://localhost:5173](http://localhost:5173).

## Implementation Details

- **Frontend**: Vite + React + TypeScript for a fast, modern development experience.
- **Graph Visualization**: [React Flow](https://reactflow.dev/) for an interactive, canvas-like experience with drag-and-drop support.
- **Layout Engine**: [Dagre](https://github.com/dagrejs/dagre) for automatic hierarchical layout of the issue graph.
- **GitHub Integration**: Fetches repository issues via the GitHub REST API.
- **Dependency Parsing**: Automatically extracts issue relationships from descriptions using conventions like `depends on #XX` or `blocked by #XX`.
- **Local Caching**: Persists repository configurations and fetched issues in `localStorage` for a zero-setup return experience.
- **Styling**: Vanilla CSS with a focus on modern aesthetics, including glassmorphism and smooth transitions.


## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
