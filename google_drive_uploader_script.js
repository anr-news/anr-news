/**
 * ============================================================================
 * ANR NEWS - Google Drive Direct Uploader (Google Apps Script)
 * ============================================================================
 * 
 * This free script runs on Google's cloud and allows your Newsroom CMS (admin.html)
 * to upload photos and audio files directly into your Google Drive folder.
 * 
 * 3-MINUTE SETUP INSTRUCTIONS:
 * 1. Open your browser and go to: https://script.google.com/
 * 2. Click "+ New project".
 * 3. Delete any default code in Code.gs, paste this ENTIRE file into it.
 * 4. Replace "PASTE_YOUR_FOLDER_ID_HERE" below with your Google Drive Folder ID.
 *    (To get the Folder ID: Open your folder in drive.google.com. Look at the URL in your
 *     browser: drive.google.com/drive/folders/1A2B3C... -> "1A2B3C..." is your Folder ID).
 * 5. Click "Deploy" (top right) -> "New deployment".
 * 6. Click the gear icon next to "Select type" -> select "Web app".
 * 7. Set:
 *    - Description: "ANR News Uploader"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone"  <-- CRITICAL so the CMS can send files!
 * 8. Click "Deploy" -> authorize permissions -> Copy the "Web app URL" (it starts with https://script.google.com/macros/s/...)
 * 9. Paste that URL into the Newsroom CMS (admin.html)!
 * ============================================================================
 */

// Replace this with your Google Drive folder ID:
var UPLOAD_FOLDER_ID = "PASTE_YOUR_FOLDER_ID_HERE";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var filename = data.filename || ("news_asset_" + new Date().getTime());
    var mimeType = data.mimeType || "image/jpeg";
    var base64Data = data.base64;

    // Decode file content
    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, mimeType, filename);

    // Get the designated Google Drive folder
    var folder;
    if (UPLOAD_FOLDER_ID && UPLOAD_FOLDER_ID !== "PASTE_YOUR_FOLDER_ID_HERE") {
      folder = DriveApp.getFolderById(UPLOAD_FOLDER_ID);
    } else {
      folder = DriveApp.getRootFolder();
    }

    // Save the file into Google Drive
    var file = folder.createFile(blob);

    // Ensure the file is publicly viewable on the website
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileId = file.getId();
    
    // High-speed Google UserContent CDN link for images
    var directImageUrl = "https://lh3.googleusercontent.com/d/" + fileId;
    // Streaming download link for audio narration
    var directAudioUrl = "https://drive.google.com/uc?export=download&id=" + fileId;

    var responsePayload = {
      status: "success",
      fileId: fileId,
      filename: filename,
      imageUrl: directImageUrl,
      audioUrl: directAudioUrl,
      downloadUrl: file.getDownloadUrl(),
      message: "File uploaded successfully to Google Drive"
    };

    return ContentService.createTextOutput(JSON.stringify(responsePayload))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle CORS Pre-flight Options
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    service: "ANR News Google Drive Direct Uploader"
  })).setMimeType(ContentService.MimeType.JSON);
}
