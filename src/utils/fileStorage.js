import fs from "fs";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "ids");

function ensureDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

function getKey() {
  const key = process.env.FILE_ENCRYPTION_KEY || process.env.JWT_SECRET || "default_secret_key_please_change";
  // ensure 32 bytes
  return crypto.createHash("sha256").update(key).digest();
}

export async function saveEncryptedFile(buffer, originalName, userId) {
  ensureDir();
  const iv = crypto.randomBytes(16);
  const key = getKey();
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const filename = `${Date.now()}_${userId || "anon"}_${originalName.replace(/[^a-zA-Z0-9.\-_]/g, "_")}.enc`;
  const filePath = path.join(UPLOAD_DIR, filename);
  // Store iv + encrypted data so we can decrypt later if needed
  const payload = Buffer.concat([iv, encrypted]);
  await fs.promises.writeFile(filePath, payload);
  return filePath;
}

export async function readEncryptedFile(filePath) {
  ensureDir();
  const payload = await fs.promises.readFile(filePath);
  const iv = payload.slice(0, 16);
  const encrypted = payload.slice(16);
  const key = getKey();
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted;
}

export default { saveEncryptedFile, readEncryptedFile };
