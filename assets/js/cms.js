/**
 * ANR NEWS - Newsroom Editorial CMS Controller (Scoop & Oak System)
 * Enhanced with Direct File Upload to Google Drive, URL Converter, & Firebase Sync
 */

let allArticles = [];
let activeArticleId = 'art-1';

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initCms();
  initDriveUploader();
});

async function initCms() {
  allArticles = await ANR_Store.getArticles();
  renderStoryDeskQueue();
  loadArticleIntoCanvas(activeArticleId);

  const headlineInput = document.getElementById('editorHeadline');
  if (headlineInput) {
    headlineInput.addEventListener('input', updateHeadlineCharCount);
  }
}

function initDriveUploader() {
  const savedUrl = localStorage.getItem('ANR_DRIVE_WEBAPP_URL') || (window.ANR_DRIVE_CONFIG ? window.ANR_DRIVE_CONFIG.webAppUrl : '');
  const urlInput = document.getElementById('driveWebAppUrlInput');
  if (urlInput && savedUrl) {
    urlInput.value = savedUrl;
  }

  const fileInput = document.getElementById('directDriveFileInput');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelectPreview);
  }
}

function handleFileSelectPreview(e) {
  const file = e.target.files[0];
  if (!file) return;

  const previewBox = document.getElementById('directUploadFilePreviewBox');
  const previewImg = document.getElementById('directUploadThumbnailImg');
  const fileNameText = document.getElementById('directUploadFileName');
  const fileSizeText = document.getElementById('directUploadFileSize');

  fileNameText.innerText = file.name;
  fileSizeText.innerText = `${(file.size / 1024).toFixed(1)} KB • ${file.type || 'file'}`;

  if (file.type.startsWith('image/')) {
    previewImg.src = URL.createObjectURL(file);
    previewImg.classList.remove('hidden');
  } else {
    previewImg.classList.add('hidden');
  }

  previewBox.classList.remove('hidden');
}

function renderStoryDeskQueue() {
  const queueContainer = document.getElementById('storyQueueList');
  if (!queueContainer) return;

  queueContainer.innerHTML = allArticles.map(art => {
    const isActive = art.id === activeArticleId;
    const badgeColor = art.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';
    return `
      <div onclick="selectArticle('${art.id}')" class="p-3 rounded-lg border ${isActive ? 'border-2 border-[#121212] bg-neutral-100' : 'border-gray-200 bg-white hover:bg-gray-50'} cursor-pointer transition shadow-sm">
        <div class="flex items-center justify-between mb-1.5">
          <span class="px-1.5 py-0.5 rounded ${badgeColor} font-bold text-[10px] uppercase">${art.status || 'DRAFT'}</span>
          <span class="text-[10px] text-gray-500 font-mono">${art.slot === 'lead-anchor' ? '★ LEAD ANCHOR' : 'SLOT'}</span>
        </div>
        <h4 class="font-nyt-serif font-bold text-sm text-gray-900 line-clamp-2 leading-snug">
          ${art.headline}
        </h4>
        <div class="text-[11px] text-gray-500 mt-2 flex justify-between">
          <span>${art.author || 'Staff'}</span>
          <span class="font-semibold text-neutral-800">${art.wordCount || 1000} words</span>
        </div>
      </div>
    `;
  }).join('');
}

function selectArticle(id) {
  activeArticleId = id;
  renderStoryDeskQueue();
  loadArticleIntoCanvas(id);
}

function loadArticleIntoCanvas(id) {
  const art = allArticles.find(a => a.id === id);
  if (!art) return;

  document.getElementById('editorHeadline').value = art.headline;
  document.getElementById('editorDeck').value = art.deck || '';
  document.getElementById('editorAuthor').value = art.author || '';
  document.getElementById('editorCategory').value = art.category || 'Special Investigation';
  document.getElementById('editorSlot').value = art.slot || 'lead-anchor';
  document.getElementById('editableBody').innerHTML = art.content || `<p class="drop-cap">${art.deck}</p>`;

  // Update lead cover photo preview if exists
  const coverPreview = document.getElementById('coverPhotoPreview');
  const coverUrlInput = document.getElementById('editorCoverPhotoUrl');
  if (coverUrlInput) coverUrlInput.value = art.image || '';
  if (coverPreview) {
    if (art.image) {
      coverPreview.src = art.image;
      coverPreview.classList.remove('hidden');
    } else {
      coverPreview.classList.add('hidden');
    }
  }

  updateHeadlineCharCount();
  updateWordCount();
}

function updateHeadlineCharCount() {
  const text = document.getElementById('editorHeadline').value;
  const count = text.length;
  const indicator = document.getElementById('headlineCharBadge');

  if (count <= 80) {
    indicator.className = 'text-emerald-600 font-semibold font-mono text-[11px]';
    indicator.innerText = `${count} / 80 Chars (Optimal Fit)`;
  } else {
    indicator.className = 'text-red-600 font-semibold font-mono text-[11px]';
    indicator.innerText = `${count} / 80 Chars (Grid Overflow Warning)`;
  }
}

function updateWordCount() {
  const bodyText = document.getElementById('editableBody').innerText;
  const words = bodyText.trim().split(/\s+/).filter(w => w.length > 0).length;
  const wordBadge = document.getElementById('cmsWordCount');
  const readTimeBadge = document.getElementById('cmsReadTime');

  if (wordBadge) wordBadge.innerText = `${words} words`;
  if (readTimeBadge) {
    const mins = Math.max(1, Math.round(words / 200));
    readTimeBadge.innerText = `${mins} min read`;
  }
}

function formatDoc(cmd, value = null) {
  document.execCommand(cmd, false, value);
}

// =========================================================================
// GOOGLE DRIVE DIRECT UPLOAD & PARSER
// =========================================================================

function openDriveModal(tab = 'upload') {
  const modal = document.getElementById('driveMediaModal');
  if (modal) {
    modal.classList.remove('hidden');
    switchDriveTab(tab);
  }
}

function closeDriveModal() {
  const modal = document.getElementById('driveMediaModal');
  if (modal) modal.classList.add('hidden');
}

function switchDriveTab(tab) {
  const tabUpload = document.getElementById('driveTabUpload');
  const tabPaste = document.getElementById('driveTabPaste');
  const tabAudio = document.getElementById('driveTabAudio');

  const btnUpload = document.getElementById('tabBtnDriveUpload');
  const btnPaste = document.getElementById('tabBtnDrivePaste');
  const btnAudio = document.getElementById('tabBtnDriveAudio');

  const activeClasses = "px-4 py-2 border-b-2 border-neutral-900 font-bold text-xs text-neutral-900";
  const inactiveClasses = "px-4 py-2 border-b-2 border-transparent font-medium text-xs text-gray-500 hover:text-neutral-900";

  tabUpload.classList.add('hidden');
  tabPaste.classList.add('hidden');
  tabAudio.classList.add('hidden');
  btnUpload.className = inactiveClasses;
  btnPaste.className = inactiveClasses;
  btnAudio.className = inactiveClasses;

  if (tab === 'upload') {
    tabUpload.classList.remove('hidden');
    btnUpload.className = activeClasses;
  } else if (tab === 'paste') {
    tabPaste.classList.remove('hidden');
    btnPaste.className = activeClasses;
  } else if (tab === 'audio') {
    tabAudio.classList.remove('hidden');
    btnAudio.className = activeClasses;
  }
}

function toggleDriveSetupGuide() {
  const guide = document.getElementById('driveSetupGuide');
  guide.classList.toggle('hidden');
}

async function startDirectDriveUpload(targetType = 'body') {
  const fileInput = document.getElementById('directDriveFileInput');
  if (!fileInput.files || fileInput.files.length === 0) {
    alert('Please select a photo or audio file to upload.');
    return;
  }

  const file = fileInput.files[0];
  const webAppUrl = document.getElementById('driveWebAppUrlInput').value.trim();

  if (!webAppUrl || !webAppUrl.startsWith('https://script.google.com')) {
    alert('⚠️ Please enter your Google Apps Script Web App URL in the setup section.\n\nSee "google_drive_uploader_script.js" in your project folder for the 3-minute setup instructions.');
    toggleDriveSetupGuide();
    return;
  }

  // Save for future uploads
  localStorage.setItem('ANR_DRIVE_WEBAPP_URL', webAppUrl);
  if (window.ANR_DRIVE_CONFIG) window.ANR_DRIVE_CONFIG.webAppUrl = webAppUrl;

  const progressBox = document.getElementById('driveUploadProgressBox');
  const progressText = document.getElementById('driveUploadProgressText');
  const uploadBtn1 = document.getElementById('btnUploadToBody');
  const uploadBtn2 = document.getElementById('btnUploadToCover');

  progressBox.classList.remove('hidden');
  progressText.innerText = `Uploading "${file.name}" directly to Google Drive (15 GB free)...`;
  if (uploadBtn1) uploadBtn1.disabled = true;
  if (uploadBtn2) uploadBtn2.disabled = true;

  const reader = new FileReader();
  reader.onload = async function() {
    try {
      const base64Content = reader.result.split(',')[1];
      const payload = {
        filename: file.name,
        mimeType: file.type || 'image/jpeg',
        base64: base64Content
      };

      const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids CORS preflight triggers on GAS
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.status === 'success') {
        const imageUrl = result.imageUrl;
        const caption = document.getElementById('directUploadCaption').value.trim() || 'News photograph.';
        const credit = document.getElementById('directUploadCredit').value.trim() || 'Staff for ANR Chronicle';

        if (targetType === 'cover') {
          setCoverPhoto(imageUrl, caption, credit);
          showToast('🌟 Photo uploaded to Google Drive & set as Lead Cover!');
        } else {
          insertImageBlockIntoBody(imageUrl, caption, credit);
          showToast('📷 Photo uploaded to Google Drive & inserted into article!');
        }
        closeDriveModal();
      } else {
        alert('Upload Error: ' + (result.message || 'Unknown response from Google Apps Script'));
      }
    } catch (err) {
      console.error('Google Drive Upload Error:', err);
      alert('Failed to upload to Google Drive: ' + err.message + '\n\nPlease ensure your Google Apps Script Web App has access set to "Anyone"!');
    } finally {
      progressBox.classList.add('hidden');
      if (uploadBtn1) uploadBtn1.disabled = false;
      if (uploadBtn2) uploadBtn2.disabled = false;
    }
  };

  reader.readAsDataURL(file);
}

function insertImageBlockIntoBody(directUrl, caption, credit) {
  const htmlBlock = `
    <div class="my-5 p-2.5 border border-gray-300 rounded bg-gray-50 text-center">
      <img src="${directUrl}" class="w-full h-auto rounded-sm object-cover max-h-96 mx-auto shadow-sm" alt="${caption}"/>
      <p class="text-xs text-gray-600 font-nyt-serif italic mt-2">${caption} <span class="uppercase not-italic text-[10px] text-gray-400 font-sans ml-1">Credit: ${credit}</span></p>
    </div>
  `;

  document.getElementById('editableBody').focus();
  document.execCommand('insertHTML', false, htmlBlock);
}

function setCoverPhoto(directUrl, caption, credit) {
  const art = allArticles.find(a => a.id === activeArticleId);
  if (art) {
    art.image = directUrl;
    art.caption = caption || art.caption;
    art.credit = credit || art.credit;
  }

  const coverUrlInput = document.getElementById('editorCoverPhotoUrl');
  const coverPreview = document.getElementById('coverPhotoPreview');
  if (coverUrlInput) coverUrlInput.value = directUrl;
  if (coverPreview) {
    coverPreview.src = directUrl;
    coverPreview.classList.remove('hidden');
  }
}

// Fallback Link Converter Helpers
function extractGoogleDriveFileId(link) {
  if (!link) return null;
  link = link.trim();
  const matchFileD = link.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) return matchFileD[1];
  const matchIdParam = link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchIdParam && matchIdParam[1]) return matchIdParam[1];
  const matchOpen = link.match(/\/open\?id=([a-zA-Z0-9_-]+)/);
  if (matchOpen && matchOpen[1]) return matchOpen[1];
  if (/^[a-zA-Z0-9_-]{20,50}$/.test(link)) return link;
  return null;
}

function convertGoogleDriveImage(link) {
  const fileId = extractGoogleDriveFileId(link);
  if (!fileId) return link;
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

function convertGoogleDriveAudio(link) {
  const fileId = extractGoogleDriveFileId(link);
  if (!fileId) return link;
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

function previewPastedDrivePhoto() {
  const input = document.getElementById('drivePhotoUrlInput').value;
  const directUrl = convertGoogleDriveImage(input);
  const previewImg = document.getElementById('drivePhotoPreviewImg');
  const previewContainer = document.getElementById('drivePhotoPreviewBox');

  if (directUrl) {
    previewImg.src = directUrl;
    previewContainer.classList.remove('hidden');
  }
}

function insertPastedDrivePhoto() {
  const input = document.getElementById('drivePhotoUrlInput').value.trim();
  const caption = document.getElementById('drivePhotoCaption').value.trim() || 'News photograph.';
  const credit = document.getElementById('drivePhotoCredit').value.trim() || 'Staff for ANR Chronicle';
  const directUrl = convertGoogleDriveImage(input);

  if (!directUrl) {
    alert('Please paste a valid Google Drive image link.');
    return;
  }

  insertImageBlockIntoBody(directUrl, caption, credit);
  closeDriveModal();
  showToast('📷 Google Drive Photo inserted into article body');
}

function attachDriveAudio() {
  const input = document.getElementById('driveAudioUrlInput').value.trim();
  const narrator = document.getElementById('driveAudioNarrator').value.trim() || 'Michael Barbaro';
  const duration = document.getElementById('driveAudioDuration').value.trim() || '7:14';
  const directAudioUrl = convertGoogleDriveAudio(input);

  if (!directAudioUrl) {
    alert('Please paste a valid Google Drive audio link.');
    return;
  }

  const art = allArticles.find(a => a.id === activeArticleId);
  if (art) {
    art.audio = {
      narrator: narrator,
      duration: duration,
      url: directAudioUrl
    };
  }

  closeDriveModal();
  showToast(`🎙️ Google Drive Narration attached (${narrator} • ${duration})`);
}

// =========================================================================
// PUBLISHING & WORKFLOW ACTIONS
// =========================================================================

async function saveArticleDraft() {
  const coverInput = document.getElementById('editorCoverPhotoUrl');
  const currentArt = allArticles.find(a => a.id === activeArticleId) || {};
  const updatedArticle = {
    ...currentArt,
    id: activeArticleId,
    headline: document.getElementById('editorHeadline').value,
    deck: document.getElementById('editorDeck').value,
    author: document.getElementById('editorAuthor').value,
    category: document.getElementById('editorCategory').value,
    slot: document.getElementById('editorSlot').value,
    image: (coverInput && coverInput.value) ? coverInput.value : currentArt.image,
    content: document.getElementById('editableBody').innerHTML,
    status: 'draft',
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  await ANR_Store.saveArticle(updatedArticle);
  allArticles = await ANR_Store.getArticles();
  renderStoryDeskQueue();
  showToast('💾 Draft saved successfully');
}

async function publishToLiveFront() {
  const coverInput = document.getElementById('editorCoverPhotoUrl');
  const assignedSlot = document.getElementById('editorSlot').value;
  const currentArt = allArticles.find(a => a.id === activeArticleId) || {};

  // If this story is assigned to lead-anchor, demote any previous lead anchor
  if (assignedSlot === 'lead-anchor') {
    for (const art of allArticles) {
      if (art.id !== activeArticleId && art.slot === 'lead-anchor') {
        art.slot = 'secondary-1';
        await ANR_Store.saveArticle(art);
      }
    }
  }

  const updatedArticle = {
    ...currentArt,
    id: activeArticleId,
    headline: document.getElementById('editorHeadline').value,
    deck: document.getElementById('editorDeck').value,
    author: document.getElementById('editorAuthor').value,
    category: document.getElementById('editorCategory').value,
    slot: assignedSlot,
    image: (coverInput && coverInput.value) ? coverInput.value : currentArt.image,
    content: document.getElementById('editableBody').innerHTML,
    status: 'published',
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  await ANR_Store.saveArticle(updatedArticle);
  allArticles = await ANR_Store.getArticles();
  renderStoryDeskQueue();

  showToast('🚀 Published to live front page!');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1200);
}

async function dispatchBreakingPush() {
  const alertText = document.getElementById('breakingPushText').value.trim();
  if (!alertText) {
    alert('Please enter breaking news alert text.');
    return;
  }

  await ANR_Store.saveBreakingAlert({
    text: alertText,
    active: true
  });

  showToast('🚨 Breaking Push Notification Dispatched to 4.8M readers!');
}

function requestLegalScreening() {
  const checkbox = document.getElementById('legalCheckbox');
  if (checkbox) checkbox.checked = true;
  showToast('⚖️ Legal Counsel flagged: PENDING REVIEW APPROVED');
}

function showToast(message) {
  let toast = document.getElementById('cmsToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cmsToast';
    toast.className = 'fixed bottom-6 right-6 bg-[#121212] text-white px-5 py-3 rounded-lg shadow-2xl z-50 text-xs font-semibold flex items-center gap-2 border border-neutral-700 transition-all duration-300';
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 3500);
}

// =========================================================================
// NEWSROOM AUTHENTICATION & LOGIN GATE CONTROLLER
// =========================================================================

function initAuth() {
  if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged(user => {
      const overlay = document.getElementById('newsroomLoginOverlay');
      const userBadge = document.getElementById('authUserBadge');
      const userName = document.getElementById('authUserName');

      if (user) {
        if (overlay) overlay.classList.add('hidden');
        if (userBadge) {
          userBadge.classList.remove('hidden');
          userBadge.classList.add('flex');
        }
        if (userName) userName.innerText = user.displayName || user.email.split('@')[0];
      } else {
        if (overlay) overlay.classList.remove('hidden');
        if (userBadge) {
          userBadge.classList.add('hidden');
          userBadge.classList.remove('flex');
        }
      }
    });
  } else {
    // Offline / Local fallback mode
    const overlay = document.getElementById('newsroomLoginOverlay');
    if (overlay) overlay.classList.add('hidden');
  }
}

function handleGoogleSignIn() {
  if (typeof firebase === 'undefined' || !firebase.auth) {
    alert('Firebase Auth is not available.');
    return;
  }
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .catch(err => {
      showAuthError(err.message + ' (Tip: Enable Google Sign-In provider in Firebase Console -> Build -> Authentication)');
    });
}

function handleEmailSignIn(e) {
  e.preventDefault();
  const email = document.getElementById('authEmailInput').value.trim();
  const password = document.getElementById('authPasswordInput').value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .catch(err => {
      showAuthError(err.message + ' (Tip: If you are new, click "Register Staff")');
    });
}

function handleCreateStaffAccount() {
  const email = document.getElementById('authEmailInput').value.trim();
  const password = document.getElementById('authPasswordInput').value;

  if (!email || !password || password.length < 6) {
    alert('Please enter a valid staff email and a password with at least 6 characters.');
    return;
  }

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {
      showToast('🎉 Staff account registered and signed in!');
    })
    .catch(err => {
      showAuthError(err.message + ' (Tip: Enable Email/Password in Firebase Console -> Build -> Authentication)');
    });
}

function handleSignOut() {
  if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().signOut().then(() => {
      showToast('Signed out of Newsroom CMS');
    });
  }
}

function showAuthError(msg) {
  const box = document.getElementById('authErrorBox');
  if (box) {
    box.innerText = msg;
    box.classList.remove('hidden');
  }
}

function handleLocalBypass() {
  const overlay = document.getElementById('newsroomLoginOverlay');
  const userBadge = document.getElementById('authUserBadge');
  const userName = document.getElementById('authUserName');
  if (overlay) overlay.classList.add('hidden');
  if (userBadge) {
    userBadge.classList.remove('hidden');
    userBadge.classList.add('flex');
  }
  if (userName) userName.innerText = "Guest Editor (Local)";
  showToast('Entered as Local Guest Editor');
}
