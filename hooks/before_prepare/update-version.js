#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const configPath = path.join(root, "config.xml");
const outputPath = path.join(root, "www/version.js");

const xml = fs.readFileSync(configPath, "utf8");
const match = xml.match(/<widget\b[^>]*\bversion\s*=\s*["']([^"']+)["']/i);

if (!match) {
    console.error("ERROR: Version not found in config.xml");
    process.exit(1);
}

const version = match[1];

fs.writeFileSync(
    outputPath,
    "window.APP_VERSION = " + JSON.stringify(version) + ";\n"
);

console.log("About App version updated to " + version);
