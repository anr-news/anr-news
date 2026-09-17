/**
 * ANR NEWS - Google Drive Direct Uploader Configuration
 * 
 * You can paste your Google Apps Script Web App URL here,
 * or enter it directly in the Newsroom CMS modal.
 */

window.ANR_DRIVE_CONFIG = {
  // Deployed Google Apps Script Web App URL for 5TB Google Drive vault
  webAppUrl: localStorage.getItem('ANR_DRIVE_WEBAPP_URL') || "https://script.google.com/macros/s/AKfycbymyJtgZfENV4tixAotqIHEEBlQNPvYVflMbhoDnoARhVXnsSdAJ6aaUjqV6ZpzFCsv/exec"
};
