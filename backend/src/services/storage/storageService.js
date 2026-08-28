// Image Storage Abstraction
// Switch between local, Cloudinary, or S3 via STORAGE_PROVIDER env var

const path = require('path');
const fs = require('fs');

// ── Provider Interface ────────────────────────────────────────────────────────

class StorageProvider {
  async upload(file, folder) { throw new Error('Not implemented'); }
  async delete(fileId) { throw new Error('Not implemented'); }
}

// ── Local Storage Provider (Development) ──────────────────────────────────────

class LocalStorageProvider extends StorageProvider {
  async upload(file, folder = 'uploads') {
    // Multer handles saving to disk; we just return the public URL
    const relativePath = file.path.replace(/\\/g, '/');
    const filename = path.basename(relativePath);
    return {
      url: `/uploads/${filename}`,
      fileId: filename,
      provider: 'local',
    };
  }

  async delete(filename) {
    const filePath = path.join(__dirname, '../../../uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return { success: true };
  }
}

// ── Cloudinary Provider (Production) ─────────────────────────────────────────

class CloudinaryProvider extends StorageProvider {
  constructor() {
    super();
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    this.cloudinary = cloudinary;
  }

  async upload(file, folder = 'farmdirect') {
    const result = await this.cloudinary.uploader.upload(file.path, { folder });
    return {
      url: result.secure_url,
      fileId: result.public_id,
      provider: 'cloudinary',
    };
  }

  async delete(publicId) {
    await this.cloudinary.uploader.destroy(publicId);
    return { success: true };
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────

function getStorageProvider() {
  const provider = process.env.STORAGE_PROVIDER || 'local';
  switch (provider) {
    case 'cloudinary': return new CloudinaryProvider();
    default: return new LocalStorageProvider();
  }
}

const storageProvider = getStorageProvider();

module.exports = {
  uploadFile: (file, folder) => storageProvider.upload(file, folder),
  deleteFile: (fileId) => storageProvider.delete(fileId),
};
