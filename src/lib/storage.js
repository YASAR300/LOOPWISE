// src/lib/storage.js
// File storage abstraction — local driver + S3 stub
import path from "path";
import fs from "fs/promises";

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

// ==============================================================================
// LOCAL DRIVER
// ==============================================================================
const localDriver = {
  async upload({ buffer, filename, mimetype, folder = "misc" }) {
    const dir = path.join(LOCAL_UPLOAD_DIR, folder);
    await ensureDir(dir);
    const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const filePath = path.join(dir, safeName);
    await fs.writeFile(filePath, buffer);
    return `/uploads/${folder}/${safeName}`;
  },

  async delete(url) {
    const relative = url.startsWith("/uploads/") ? url.slice(1) : null;
    if (!relative) return;
    const abs = path.join(process.cwd(), "public", relative);
    await fs.unlink(abs).catch(() => null);
  },
};

// ==============================================================================
// S3 DRIVER (stub — real implementation when AWS SDK is added)
// ==============================================================================
const s3Driver = {
  async upload({ buffer, filename, mimetype, folder = "misc" }) {
    // TODO: Wire in @aws-sdk/client-s3 + getSignedUrl
    throw new Error(
      "S3 driver is not yet implemented. Set STORAGE_DRIVER=local for development."
    );
  },
  async delete(url) {
    throw new Error("S3 driver delete not yet implemented.");
  },
};

function getDriver() {
  const driver = process.env.STORAGE_DRIVER || "local";
  if (driver === "s3") return s3Driver;
  return localDriver;
}

/**
 * Upload a file buffer and return a public URL.
 *
 * @param {Object} opts
 * @param {Buffer} opts.buffer
 * @param {string} opts.filename   Original filename
 * @param {string} opts.mimetype   e.g. "image/png"
 * @param {string} [opts.folder]  Subfolder ("avatars", "attachments", …)
 * @returns {Promise<string>} Public URL
 */
export async function uploadFile(opts) {
  return getDriver().upload(opts);
}

/**
 * Delete a file by its public URL.
 */
export async function deleteFile(url) {
  return getDriver().delete(url);
}
