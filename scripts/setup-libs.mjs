#!/usr/bin/env node

/**
 * Copy client-side libraries from node_modules to public/lib/
 * Run automatically after npm install via postinstall script
 */

import { copyFile, mkdir } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const libDir = path.join(projectRoot, "code", "public", "lib");

async function copyLibraries() {
    try {
        // Create lib directory if it doesn't exist
        await mkdir(libDir, { recursive: true });

        // Copy Handlebars
        await copyFile(
            path.join(projectRoot, "node_modules", "handlebars", "dist", "handlebars.min.js"),
            path.join(libDir, "handlebars.js"),
        );
        console.log("✓ Handlebars copied to public/lib/");

        // Copy Moment.js with locales
        await copyFile(
            path.join(projectRoot, "node_modules", "moment", "min", "moment-with-locales.min.js"),
            path.join(libDir, "moment.js"),
        );
        console.log("✓ Moment.js copied to public/lib/");
    } catch (error) {
        console.error("Error copying libraries:", error.message);
        process.exit(1);
    }
}

copyLibraries();
