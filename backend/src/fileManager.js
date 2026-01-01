const fs = require('fs');
const path = require('path');

// Base upload directory
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

/**
 * Safely delete a file from the uploads directory
 * @param {string} filePath - The URL path (e.g., /uploads/filename.jpg) or full path
 * @returns {boolean} - True if file was deleted, false otherwise
 */
const deleteFile = (filePath) => {
  if (!filePath) return false;
  
  try {
    // Extract filename from URL path
    const filename = getFilenameFromUrl(filePath);
    if (!filename) return false;
    
    const fullPath = path.join(UPLOAD_DIR, filename);
    
    // Security: Ensure the resolved path is still within UPLOAD_DIR
    const resolvedPath = path.resolve(fullPath);
    const resolvedUploadDir = path.resolve(UPLOAD_DIR);
    
    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      console.warn('Security: Attempted path traversal attack detected');
      return false;
    }
    
    // Check if file exists
    if (fs.existsSync(resolvedPath)) {
      fs.unlinkSync(resolvedPath);
      console.log(`Deleted file: ${filename}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Extract filename from URL path
 * @param {string} url - The URL path (e.g., /uploads/filename.jpg)
 * @returns {string|null} - The filename or null
 */
const getFilenameFromUrl = (url) => {
  if (!url) return null;
  
  // Handle full URLs and relative paths
  try {
    // If it's a full URL, extract the path
    if (url.startsWith('http')) {
      const urlObj = new URL(url);
      url = urlObj.pathname;
    }
    
    // Check if it's an upload path
    if (url.includes('/uploads/')) {
      const match = url.match(/\/uploads\/([^?#]+)/);
      return match ? match[1] : null;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Get all files in the uploads directory
 * @returns {Array} - Array of file info objects
 */
const getAllFiles = () => {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      return [];
    }
    
    const files = fs.readdirSync(UPLOAD_DIR);
    return files.map(filename => {
      const filePath = path.join(UPLOAD_DIR, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        url: `/uploads/${filename}`,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      };
    });
  } catch (error) {
    console.error('Error reading upload directory:', error);
    return [];
  }
};

/**
 * Get storage stats
 * @returns {Object} - Storage statistics
 */
const getStorageStats = () => {
  try {
    const files = getAllFiles();
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    
    return {
      totalFiles: files.length,
      totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      files,
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return {
      totalFiles: 0,
      totalSize: 0,
      totalSizeMB: '0.00',
      files: [],
    };
  }
};

/**
 * Delete multiple files
 * @param {Array<string>} urls - Array of file URLs to delete
 * @returns {Object} - Result with deleted count and errors
 */
const deleteFiles = (urls) => {
  let deleted = 0;
  const errors = [];
  
  for (const url of urls) {
    if (deleteFile(url)) {
      deleted++;
    } else if (url && getFilenameFromUrl(url)) {
      errors.push(url);
    }
  }
  
  return { deleted, errors };
};

module.exports = {
  deleteFile,
  deleteFiles,
  getFilenameFromUrl,
  getAllFiles,
  getStorageStats,
  UPLOAD_DIR,
};
