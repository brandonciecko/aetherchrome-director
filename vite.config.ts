import { execSync } from "node:child_process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Build-time identifiers baked into the bundle so the deployed site always
// carries proof of exactly which commit and build it came from, independent
// of whether package.json's version was bumped for this change (see
// src/version.ts). Falls back gracefully if git isn't available (e.g. a
// tarball/non-git build environment) rather than failing the build.
function gitShortHash(): string {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "unknown";
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_COMMIT__: JSON.stringify(gitShortHash()),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10))
  }
});
