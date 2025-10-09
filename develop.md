# Development Guide

This guide provides instructions for setting up the development environment and building the project.

## Project Structure

This repository is a monorepo containing two main projects:

- `./`: The browser extension.
- `userscript/`: A userscript that is built and injected by the browser extension.

## Development

1. Install dependencies for both projects:
   ```sh
   pnpm i
   ```
   This will also automatically install dependencies for the `userscript` project via a `postinstall` script.

2. Run the development server for the browser extension:
   ```sh
   pnpm dev
   ```

To build the projects for production, you can use the following scripts:

- `pnpm build`: Builds both the userscript and the browser extension.
- `pnpm build:userscript`: Builds only the userscript.
- `pnpm build:firefox`: Builds the userscript and the browser extension for Firefox.

To create a zip file for distribution, use the following commands:

- `pnpm zip`: Creates a zip file for Chrome.
- `pnpm zip:firefox`: Creates a zip file for Firefox.