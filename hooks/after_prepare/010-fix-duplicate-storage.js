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
    console.log("AndroidManifest.xml not found - skipping storage permission fix");
    process.exit(0);
}

let text = fs.readFileSync(manifest, "utf8");

const duplicate =
    /\s*<uses-permission\s+android:maxSdkVersion="32"\s+android:name="android\.permission\.WRITE_EXTERNAL_STORAGE"\s*\/>\s*/g;

const before = text;
text = text.replace(duplicate, "\n");

if (text !== before) {
    fs.writeFileSync(manifest, text);
    console.log("Removed duplicate WRITE_EXTERNAL_STORAGE permission");
} else {
    console.log("No duplicate WRITE_EXTERNAL_STORAGE permission found");
}
