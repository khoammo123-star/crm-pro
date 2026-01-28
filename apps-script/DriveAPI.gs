// =====================================================
// CRM BACKEND - DRIVE API
// =====================================================
// File: DriveAPI.gs
// Xử lý upload/download files từ Google Drive
// =====================================================

const DriveAPI = {
  
  /**
   * Upload file lên Google Drive
   */
  upload(data) {
    try {
      if (!data.fileName || !data.fileContent) {
        return { success: false, error: 'Missing fileName or fileContent' };
      }
      
      // Decode base64 content
      const decoded = Utilities.base64Decode(data.fileContent);
      const blob = Utilities.newBlob(decoded, data.mimeType || 'application/octet-stream', data.fileName);
      
      // Get or create main folder
      let folder;
      try {
        folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
      } catch (e) {
        // Create folder if not exists
        folder = DriveApp.createFolder('CRM Attachments');
        Logger.log('Created new folder: ' + folder.getId());
      }
      
      // Create subfolder based on entity type
      if (data.entityType) {
        const subfolderName = data.entityType.charAt(0).toUpperCase() + data.entityType.slice(1);
        let subfolder;
        const subfolders = folder.getFoldersByName(subfolderName);
        
        if (subfolders.hasNext()) {
          subfolder = subfolders.next();
        } else {
          subfolder = folder.createFolder(subfolderName);
        }
        folder = subfolder;
      }
      
      // Upload file
      const file = folder.createFile(blob);
      
      // Set sharing
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      const fileRecord = {
        id: file.getId(),
        name: file.getName(),
        mimeType: file.getMimeType(),
        size: file.getSize(),
        url: file.getUrl(),
        downloadUrl: `https://drive.google.com/uc?export=download&id=${file.getId()}`,
        thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.getId()}&sz=w200`,
        entityType: data.entityType || '',
        entityId: data.entityId || '',
        uploadedAt: Utils.now()
      };
      
      return {
        success: true,
        data: fileRecord,
        message: 'Upload thành công'
      };
      
    } catch (error) {
      Logger.log('Upload error: ' + error.toString());
      return { success: false, error: 'Upload thất bại: ' + error.message };
    }
  },
  
  /**
   * Lấy danh sách files
   */
  getFiles(params = {}) {
    try {
      let folder;
      try {
        folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
      } catch (e) {
        return { success: true, data: [] };
      }
      
      // Navigate to subfolder if entityType specified
      if (params.entityType) {
        const subfolderName = params.entityType.charAt(0).toUpperCase() + params.entityType.slice(1);
        const subfolders = folder.getFoldersByName(subfolderName);
        
        if (subfolders.hasNext()) {
          folder = subfolders.next();
        } else {
          return { success: true, data: [] };
        }
      }
      
      const files = folder.getFiles();
      const fileList = [];
      
      while (files.hasNext()) {
        const file = files.next();
        fileList.push({
          id: file.getId(),
          name: file.getName(),
          mimeType: file.getMimeType(),
          size: file.getSize(),
          url: file.getUrl(),
          downloadUrl: `https://drive.google.com/uc?export=download&id=${file.getId()}`,
          thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.getId()}&sz=w200`,
          createdAt: file.getDateCreated().toISOString(),
          updatedAt: file.getLastUpdated().toISOString()
        });
      }
      
      // Sort by date
      fileList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return {
        success: true,
        data: fileList
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Xóa file
   */
  deleteFile(fileId) {
    try {
      const file = DriveApp.getFileById(fileId);
      file.setTrashed(true);
      
      return {
        success: true,
        message: 'Xóa file thành công'
      };
      
    } catch (error) {
      return { success: false, error: 'Không thể xóa file: ' + error.message };
    }
  },
  
  /**
   * Lấy download URL
   */
  getDownloadUrl(fileId) {
    try {
      const file = DriveApp.getFileById(fileId);
      
      return {
        success: true,
        data: {
          url: file.getUrl(),
          downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
          name: file.getName()
        }
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Format file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};
