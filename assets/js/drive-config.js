/**
 * ANR NEWS - Google Drive Direct Uploader Configuration
 * 
 * You can paste your Google Apps Script Web App URL here,
 * or enter it directly in the Newsroom CMS modal.
 */

window.ANR_DRIVE_CONFIG = {
  // Replace with your Web App URL (starts with https://script.google.com/macros/s/...)
  webAppUrl: localStorage.getItem('ANR_DRIVE_WEBAPP_URL') || ""
};
