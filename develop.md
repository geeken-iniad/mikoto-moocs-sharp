# Development Guide

This guide provides instructions for setting up the development environment and building the project.

## Project Structure

This repository is a monorepo containing two main projects:

- **`./` (Root):** The browser extension, built with `wxt`.
- **`userscript/`:** A userscript project, built with `Vite` and `React`.

The two projects are designed to work together. The `userscript` project is built first, and its output is a single JavaScript file, `mikoto-userscript.js`. This file is then placed in the root project's `public/` directory.

The browser extension then programmatically injects `mikoto-userscript.js` into the target web pages (`https://moocs.iniad.org/*`) using the background script (`entrypoints/background.ts`).

## Development Workflow

1.  **Install Dependencies:**
    Run the following command in the root directory to install dependencies for both the extension and the userscript project:
    ```sh
    pnpm i
    ```
    A `postinstall` script in the root `package.json` will automatically run `pnpm install` in the `userscript/` directory.

2.  **Run the Development Server:**
    To start the development server for the browser extension, run:
    ```sh
    pnpm dev
    ```
    This will watch for changes in the extension code. Note that this does **not** automatically rebuild the userscript. If you make changes to the `userscript/` project, you will need to rebuild it manually.

## Build Process

You can use the following `pnpm` scripts from the root directory to build the projects:

-   **`pnpm build:userscript`**: Builds only the userscript. This is useful when you are only making changes to the userscript.
-   **`pnpm build`**: Builds both the userscript and the browser extension. It first runs `build:userscript` and then builds the extension.
-   **`pnpm build:firefox`**: Builds the userscript and the browser extension for Firefox.

## Distribution

To create a zip file for distribution, use the following commands:

-   **`pnpm zip`**: Creates a zip file for Chrome.
-   **`pnpm zip:firefox`**: Creates a zip file for Firefox.