import packageJson from "../package.json";

/**
 * App version + build identity, shown in the UI (see ui/components/VersionFooter.tsx)
 * so the deployed site always reveals what it's actually running.
 *
 * APP_VERSION is package.json's version — bump it by hand for a notable release.
 * BUILD_COMMIT/BUILD_DATE are generated automatically at build time (vite.config.ts)
 * from the current git commit, so the label still changes on every deploy even if
 * the version wasn't bumped for a given change.
 */
export const APP_VERSION = packageJson.version;
export const BUILD_COMMIT = __BUILD_COMMIT__;
export const BUILD_DATE = __BUILD_DATE__;
export const VERSION_LABEL = `v${APP_VERSION} · ${BUILD_COMMIT} · ${BUILD_DATE}`;
