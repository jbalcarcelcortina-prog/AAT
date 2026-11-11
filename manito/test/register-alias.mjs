/**
 * Resolves the `@/` alias for node:test. The app resolves it via tsconfig;
 * the test runner does not.
 */
import { register } from "node:module";

register("./alias-hooks.mjs", import.meta.url);
