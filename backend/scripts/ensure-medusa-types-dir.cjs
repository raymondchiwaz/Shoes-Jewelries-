const fs = require("fs");
const path = require("path");

/**
 * Medusa's dev flow generates `.medusa/types/modules-bindings.d.ts`.
 * On Windows (and some setups), the parent folder might not exist yet,
 * causing ENOENT on startup. Ensure it exists before `medusa develop`.
 */
const typesDir = path.resolve(__dirname, "..", ".medusa", "types");

try {
  fs.mkdirSync(typesDir, { recursive: true });
} catch (e) {
  // If this fails, dev will fail anyway; keep the error readable.
  console.error(`Failed to create directory: ${typesDir}`);
  throw e;
}







