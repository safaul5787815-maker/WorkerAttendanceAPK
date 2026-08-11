#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const manifest = path.join(
    "platforms",
    "android",
    "app",
    "src",
    "main",
    "AndroidManifest.xml"
);

if (!fs.existsSync(manifest)) {
    console.log("Manifest not found");
    process.exit(0);
}

let text = fs.readFileSync(manifest, "utf8");

const before = text;

text = text.replace(
    /\s*<uses-permission\b(?=[^>]*android:name="android\.permission\.WRITE_EXTERNAL_STORAGE")(?=[^>]*android:maxSdkVersion="32")[^>]*\/>\s*/g,
    "\n"
);

fs.writeFileSync(manifest, text);

console.log(
    text !== before
        ? "Duplicate WRITE_EXTERNAL_STORAGE permission removed"
        : "No duplicate WRITE_EXTERNAL_STORAGE permission found"
);
