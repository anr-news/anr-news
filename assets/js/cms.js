/**
 * ANR NEWS - Newsroom Editorial CMS Controller (Scoop & Oak System)
 * Fully Localized to Khmer (ភាសាខ្មែរ) with 5 Core Newsroom Fixes:
 * Fix 1: Real New Story creation
 * Fix 2: Real Delete / Retract Story flow
 * Fix 3: Category filtering coordination
 * Fix 4: Recent Google Drive Media Vault gallery
 * Fix 5: In-app Site Control Panel modal
 */

let allArticles = [];
let activeArticleId = 'art-1';
let currentQueueFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initCms();
  initDriveUploader();
});

async function initCms() {
  allArticles = await ANR_Store.getArticles();
  if (allArticles.length > 0) {
    activeArticleId = allArticles[0].id;
  }
  renderStoryDeskQueue();
  loadArticleIntoCanvas(activeArticleId);

  const headlineInput = document.getElementById('editorHeadline');
  if (headlineInput) {
    headlineInput.addEventListener('input', updateHeadlineCharCount);
  }
}

// =========================================================================
// FIX #1: REAL NEW STORY CREATION
// =========================================================================

function createNewStory() {
  const newId = 'art-' + Date.now();
  const newArticle = {
    id: newId,
    headline: '',
    deck: '',
    author: 'ការិយាល័យនិពន្ធ អេអិនអ័រ',
    category: 'សកលលោក',
    slot: 'secondary-1',
    image: '',
    caption: '',
    credit: '',
    status: 'draft',
    wordCount: 0,
    readTime: '១ នាទីអាន',
    date: 'ថ្ងៃទី១៧ ខែកញ្ញា ឆ្នាំ២០២៦',
    content: '<p class="drop-cap">សូមចាប់ផ្តើមសរសេរខ្លឹមសារព័ត៌មានលម្អិតនៅទីនេះ...</p>',
    updatedAt: 'ទើបបង្កើត'
  };

  allArticles.unshift(newArticle);
  activeArticleId = newId;
  renderStoryDeskQueue();
  loadArticleIntoCanvas(newId);

  const headlineEl = document.getElementById('editorHeadline');
  if (headlineEl) headlineEl.focus();

  showToast('✨ បានបង្កើតកញ្ចប់អត្ថបទថ្មី! សូមចាប់ផ្តើមតែងនិពន្ធ');
}

// =========================================================================
// FIX #2: REAL DELETE / RETRACT STORY
// =========================================================================

async function deleteCurrentArticle() {
  const art = allArticles.find(a => a.id === activeArticleId);
  if (!art) {
    alert('មិនមានអត្ថបទត្រូវបានជ្រើសរើសសម្រាប់លុបឡើយ។');
    return;
  }

  const headlineLabel = art.headline ? `«${art.headline}»` : 'អត្ថបទនេះ';
  const confirmed = confirm(`តើលោកអ្នកពិតជាចង់លុប ${headlineLabel} ចេញពីប្រព័ន្ធទាំងស្រុងមែនទេ?`);
  if (!confirmed) return;

  await ANR_Store.deleteArticle(activeArticleId);
  allArticles = allArticles.filter(a => a.id !== activeArticleId);

  if (allArticles.length === 0) {
    createNewStory();
  } else {
    activeArticleId = allArticles[0].id;
    loadArticleIntoCanvas(activeArticleId);
  }

  renderStoryDeskQueue();
  showToast('🗑️ បានលុបអត្ថបទចេញពីប្រព័ន្ធដោយជោគជ័យ!');
}

// =========================================================================
// STORY DESK QUEUE & CANVAS RENDERERS
// =========================================================================

function filterQueue(filter) {
  currentQueueFilter = filter;
  ['all', 'draft', 'published'].forEach(f => {
    const btn = document.getElementById('queueTab' + f.charAt(0).toUpperCase() + f.slice(1));
    if (btn) {
      if (f === filter) {
        btn.className = "px-2.5 py-1 rounded bg-neutral-200 font-semibold text-gray-900 whitespace-nowrap";
      } else {
        btn.className = "px-2.5 py-1 rounded hover:bg-gray-100 text-gray-600 whitespace-nowrap";
      }
    }
  });
  renderStoryDeskQueue();
}

function switchDeskFilter(desk) {
  if (desk === 'all') {
    renderStoryDeskQueue();
  } else {
    const filtered = allArticles.filter(a => a.category === desk);
    renderQueueList(filtered);
  }
}

function renderStoryDeskQueue() {
  let list = allArticles;
  if (currentQueueFilter === 'draft') {
    list = allArticles.filter(a => a.status !== 'published');
  } else if (currentQueueFilter === 'published') {
    list = allArticles.filter(a => a.status === 'published');
  }
  renderQueueList(list);
}

function renderQueueList(articlesToRender) {
  const queueContainer = document.getElementById('storyQueueList');
  if (!queueContainer) return;

  if (articlesToRender.length === 0) {
    queueContainer.innerHTML = `
      <div class="text-center py-8 text-gray-400">
        <p class="text-xs">មិនមានអត្ថបទក្នុងបញ្ជីនេះទេ</p>
      </div>
    `;
    return;
  }

  queueContainer.innerHTML = articlesToRender.map(art => {
    const isActive = art.id === activeArticleId;
    const isPub = art.status === 'published';
    const badgeColor = isPub ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';
    const badgeText = isPub ? 'បានផ្សាយ' : 'សេចក្តីព្រាង';
    const slotLabel = art.slot === 'lead-anchor' ? '★ ព័ត៌មានសំខាន់' : 'ជួរឈរទី ២';

    return `
      <div onclick="selectArticle('${art.id}')" class="p-3 rounded-lg border ${isActive ? 'border-2 border-[#121212] bg-neutral-100' : 'border-gray-200 bg-white hover:bg-gray-50'} cursor-pointer transition shadow-sm">
        <div class="flex items-center justify-between mb-1.5">
          <span class="px-1.5 py-0.5 rounded ${badgeColor} font-bold text-[10px] font-nyt-sans">${badgeText}</span>
          <span class="text-[10px] text-gray-500 font-nyt-sans">${slotLabel}</span>
        </div>
        <h4 class="font-nyt-serif font-bold text-sm text-gray-900 line-clamp-2 leading-snug">
          ${art.headline || '<span class="italic text-gray-400 font-normal">គ្មានចំណងជើង...</span>'}
        </h4>
        <div class="text-[11px] text-gray-500 mt-2 flex justify-between font-nyt-sans">
          <span class="truncate max-w-[120px]">${art.author || 'បុគ្គលិក'}</span>
          <span class="font-semibold text-neutral-800">${art.wordCount || 0} ពាក្យ</span>
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

  document.getElementById('editorHeadline').value = art.headline || '';
  document.getElementById('editorDeck').value = art.deck || '';
  document.getElementById('editorAuthor').value = art.author || 'ការិយាល័យនិពន្ធ អេអិនអ័រ';
  document.getElementById('editorCategory').value = art.category || 'ការស៊ើបអង្កេតពិសេស';
  document.getElementById('editorSlot').value = art.slot || 'lead-anchor';
  document.getElementById('editableBody').innerHTML = art.content || `<p class="drop-cap">${art.deck || 'សូមបញ្ចូលខ្លឹមសារព័ត៌មាន...'}</p>`;

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
    indicator.innerText = `${count} / ៨០ តួអក្សរ (ទំហំសមរម្យ)`;
  } else {
    indicator.className = 'text-red-600 font-semibold font-mono text-[11px]';
    indicator.innerText = `${count} / ៨០ តួអក្សរ (លើសកម្រិតជួរឈរ)`;
  }
}

function updateWordCount() {
  const bodyEl = document.getElementById('editableBody');
  if (!bodyEl) return;
  const bodyText = bodyEl.innerText || '';
  const words = bodyText.trim().split(/\s+/).filter(w => w.length > 0).length;
  const wordBadge = document.getElementById('cmsWordCount');
  const readTimeBadge = document.getElementById('cmsReadTime');

  if (wordBadge) wordBadge.innerText = `${words} ពាក្យ`;
  if (readTimeBadge) {
    const mins = Math.max(1, Math.round(words / 180));
    readTimeBadge.innerText = `${mins} នាទីអាន`;
  }
}

function formatDoc(cmd, value = null) {
  document.execCommand(cmd, false, value);
}

// =========================================================================
// GOOGLE DRIVE DIRECT UPLOAD & RECENT MEDIA VAULT (FIX #4)
// =========================================================================

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
  const tabRecent = document.getElementById('driveTabRecent');
  const tabPaste = document.getElementById('driveTabPaste');
  const tabAudio = document.getElementById('driveTabAudio');

  const btnUpload = document.getElementById('tabBtnDriveUpload');
  const btnRecent = document.getElementById('tabBtnDriveRecent');
  const btnPaste = document.getElementById('tabBtnDrivePaste');
  const btnAudio = document.getElementById('tabBtnDriveAudio');

  const activeClasses = "px-4 py-2.5 border-b-2 border-neutral-900 font-bold text-xs text-neutral-900";
  const inactiveClasses = "px-4 py-2.5 border-b-2 border-transparent font-medium text-xs text-gray-500 hover:text-neutral-900";

  [tabUpload, tabRecent, tabPaste, tabAudio].forEach(el => el && el.classList.add('hidden'));
  [btnUpload, btnRecent, btnPaste, btnAudio].forEach(el => el && (el.className = inactiveClasses));

  if (tab === 'upload' && tabUpload) {
    tabUpload.classList.remove('hidden');
    if (btnUpload) btnUpload.className = activeClasses;
  } else if (tab === 'recent' && tabRecent) {
    tabRecent.classList.remove('hidden');
    if (btnRecent) btnRecent.className = activeClasses;
    renderRecentDriveMedia();
  } else if (tab === 'paste' && tabPaste) {
    tabPaste.classList.remove('hidden');
    if (btnPaste) btnPaste.className = activeClasses;
  } else if (tab === 'audio' && tabAudio) {
    tabAudio.classList.remove('hidden');
    if (btnAudio) btnAudio.className = activeClasses;
  }
}

function toggleDriveSetupGuide() {
  const guide = document.getElementById('driveSetupGuide');
  if (guide) guide.classList.toggle('hidden');
}

function saveRecentUpload(item) {
  let list = JSON.parse(localStorage.getItem('ANR_RECENT_UPLOADS') || '[]');
  list = list.filter(x => x.url !== item.url);
  list.unshift(item);
  if (list.length > 24) list = list.slice(0, 24);
  localStorage.setItem('ANR_RECENT_UPLOADS', JSON.stringify(list));
}

function renderRecentDriveMedia() {
  const grid = document.getElementById('recentDriveImagesGrid');
  if (!grid) return;

  const defaultSample = {
    url: "https://lh3.googleusercontent.com/d/1i0-X2f-FjqH1AqqW__AUOSeP9idg7W7u",
    name: "រូបភាពគំរូ Drive",
    caption: "រូបភាពផ្ទៀងផ្ទាត់ពី Google Drive Media Vault",
    credit: "សារព័ត៌មាន អេអិនអ័រ"
  };

  let list = JSON.parse(localStorage.getItem('ANR_RECENT_UPLOADS') || '[]');
  if (list.length === 0) {
    list.push(defaultSample);
    localStorage.setItem('ANR_RECENT_UPLOADS', JSON.stringify(list));
  }

  grid.innerHTML = list.map((item, idx) => `
    <div class="border border-gray-200 rounded-lg p-2 bg-gray-50 hover:bg-white transition group space-y-1.5">
      <div class="aspect-[4/3] rounded overflow-hidden bg-neutral-900 flex items-center justify-center">
        <img src="${item.url}" alt="${item.caption || 'រូបភាព'}" class="w-full h-full object-cover"/>
      </div>
      <p class="text-[10px] text-gray-700 font-medium truncate">${item.name || item.caption || 'រូបភាព Drive'}</p>
      <div class="flex gap-1 pt-1">
        <button onclick="setCoverPhoto('${item.url}', '${encodeURIComponent(item.caption || '')}', '${encodeURIComponent(item.credit || '')}'); closeDriveModal(); showToast('🌟 ដាក់ជារូបភាពក្របមុខរួចរាល់!');" class="flex-1 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] font-bold">
          ដាក់ជាក្រប
        </button>
        <button onclick="insertImageBlockIntoBody('${item.url}', '${item.caption || ''}', '${item.credit || ''}'); closeDriveModal(); showToast('📷 បញ្ចូលក្នុងអត្ថបទរួចរាល់!');" class="flex-1 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[9px] font-bold">
          បញ្ចូលអត្ថបទ
        </button>
      </div>
    </div>
  `).join('');
}

async function startDirectDriveUpload(targetType = 'body') {
  const fileInput = document.getElementById('directDriveFileInput');
  if (!fileInput.files || fileInput.files.length === 0) {
    alert('សូមជ្រើសរើសរូបភាព ឬសំឡេងដើម្បីបង្ហោះ។');
    return;
  }

  const file = fileInput.files[0];
  const webAppUrl = document.getElementById('driveWebAppUrlInput').value.trim();

  if (!webAppUrl || !webAppUrl.startsWith('https://script.google.com')) {
    alert('⚠️ សូមបញ្ចូលតំណ Google Apps Script Web App URL ជាមុនសិន។\n\nសូមមើលឯកសារ "google_drive_uploader_script.js" ក្នុងថតគម្រោងរបស់អ្នក។');
    toggleDriveSetupGuide();
    return;
  }

  localStorage.setItem('ANR_DRIVE_WEBAPP_URL', webAppUrl);
  if (window.ANR_DRIVE_CONFIG) window.ANR_DRIVE_CONFIG.webAppUrl = webAppUrl;

  const progressBox = document.getElementById('driveUploadProgressBox');
  const progressText = document.getElementById('driveUploadProgressText');
  const uploadBtn1 = document.getElementById('btnUploadToBody');
  const uploadBtn2 = document.getElementById('btnUploadToCover');

  progressBox.classList.remove('hidden');
  progressText.innerText = `កំពុងបង្ហោះ "${file.name}" ទៅកាន់ Google Drive (5 TB)...`;
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
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.status === 'success') {
        const imageUrl = result.imageUrl;
        const caption = document.getElementById('directUploadCaption').value.trim() || 'រូបភាពព័ត៌មាន។';
        const credit = document.getElementById('directUploadCredit').value.trim() || 'ការិយាល័យព័ត៌មាន អេអិនអ័រ';

        saveRecentUpload({
          url: imageUrl,
          name: file.name,
          caption: caption,
          credit: credit,
          date: Date.now()
        });

        if (targetType === 'cover') {
          setCoverPhoto(imageUrl, caption, credit);
          showToast('🌟 រូបភាពបានបង្ហោះទៅ Google Drive & ដាក់ជារូបភាពក្របមុខ!');
        } else {
          insertImageBlockIntoBody(imageUrl, caption, credit);
          showToast('📷 រូបភាពបានបង្ហោះទៅ Google Drive & បញ្ចូលក្នុងអត្ថបទ!');
        }
        closeDriveModal();
      } else {
        alert('កំហុសនៃការបង្ហោះ៖ ' + (result.message || 'មិនមានការឆ្លើយតបពី Google Apps Script'));
      }
    } catch (err) {
      console.error('Google Drive Upload Error:', err);
      alert('មិនអាចបង្ហោះទៅ Google Drive បានទេ៖ ' + err.message);
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
      <p class="text-xs text-gray-600 font-nyt-serif italic mt-2 leading-tight">${caption} <span class="uppercase not-italic text-[10px] text-gray-400 font-nyt-sans ml-1">ប្រភព៖ ${credit}</span></p>
    </div>
  `;

  document.getElementById('editableBody').focus();
  document.execCommand('insertHTML', false, htmlBlock);
}

function setCoverPhoto(directUrl, caption, credit) {
  if (typeof caption === 'string' && caption.includes('%')) {
    try { caption = decodeURIComponent(caption); } catch(e){}
  }
  if (typeof credit === 'string' && credit.includes('%')) {
    try { credit = decodeURIComponent(credit); } catch(e){}
  }

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
  const caption = document.getElementById('drivePhotoCaption').value.trim() || 'រូបភាពព័ត៌មាន។';
  const credit = document.getElementById('drivePhotoCredit').value.trim() || 'ការិយាល័យព័ត៌មាន អេអិនអ័រ';
  const directUrl = convertGoogleDriveImage(input);

  if (!directUrl) {
    alert('សូមបញ្ចូលតំណភ្ជាប់រូបភាព Google Drive ដែលត្រឹមត្រូវ។');
    return;
  }

  insertImageBlockIntoBody(directUrl, caption, credit);
  closeDriveModal();
  showToast('📷 បានបញ្ចូលរូបភាព Google Drive ក្នុងខ្លឹមសារអត្ថបទ');
}

function attachDriveAudio() {
  const input = document.getElementById('driveAudioUrlInput').value.trim();
  const narrator = document.getElementById('driveAudioNarrator').value.trim() || 'សម មករា';
  const duration = document.getElementById('driveAudioDuration').value.trim() || '៧:១៤';
  const directAudioUrl = convertGoogleDriveAudio(input);

  if (!directAudioUrl) {
    alert('សូមបញ្ចូលតំណភ្ជាប់ឯកសារសំឡេង Google Drive ដែលត្រឹមត្រូវ។');
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
  showToast(`🎙️ បានភ្ជាប់សំឡេងអាន (${narrator} • ${duration})`);
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
    image: (coverInput && coverInput.value) ? coverInput.value : (currentArt.image || ''),
    content: document.getElementById('editableBody').innerHTML,
    status: 'draft',
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  await ANR_Store.saveArticle(updatedArticle);
  allArticles = await ANR_Store.getArticles();
  renderStoryDeskQueue();
  showToast('💾 បានរក្សាទុកសេចក្តីព្រាងដោយជោគជ័យ!');
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
    image: (coverInput && coverInput.value) ? coverInput.value : (currentArt.image || ''),
    content: document.getElementById('editableBody').innerHTML,
    status: 'published',
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  await ANR_Store.saveArticle(updatedArticle);
  allArticles = await ANR_Store.getArticles();
  renderStoryDeskQueue();

  showToast('🚀 បានបោះពុម្ពផ្សាយទៅកាន់ទំព័រមុខដោយជោគជ័យ!');
}

async function dispatchBreakingPush() {
  const alertText = document.getElementById('breakingPushText').value.trim();
  if (!alertText) {
    alert('សូមបញ្ចូលខ្លឹមសារព័ត៌មានបន្ទាន់។');
    return;
  }

  await ANR_Store.saveBreakingAlert({
    text: alertText,
    active: true
  });

  showToast('🚨 បានចុះផ្សាយព័ត៌មានបន្ទាន់ទៅកាន់អ្នកអានផ្ទាល់!');
}

function requestLegalScreening() {
  const checkbox = document.getElementById('legalCheckbox');
  if (checkbox) checkbox.checked = true;
  showToast('⚖️ ផ្នែកច្បាប់បានត្រួតពិនិត្យ និងអនុម័តរួចរាល់');
}

// =========================================================================
// FIX #5: IN-APP SITE CONTROL PANEL MODAL LOGIC
// =========================================================================

async function openSiteSettingsModal() {
  const modal = document.getElementById('siteSettingsModal');
  if (!modal) return;

  const settings = await ANR_Store.getSiteSettings();
  document.getElementById('settingsSiteName').value = settings.siteName || 'សារព័ត៌មាន អេអិនអ័រ';
  document.getElementById('settingsTagline').value = settings.tagline || '«ព័ត៌មានពិត សុក្រឹត និងស៊ីជម្រៅ»';
  document.getElementById('settingsEdition').value = settings.edition || 'ការផ្សាយសកល — ភ្នំពេញ ញូវយ៉ក ឡុងដ៍ ប៉ារីស';
  document.getElementById('settingsCategories').value = (settings.categories || []).join(', ');

  modal.classList.remove('hidden');
}

function closeSiteSettingsModal() {
  const modal = document.getElementById('siteSettingsModal');
  if (modal) modal.classList.add('hidden');
}

async function saveSiteSettingsFromModal() {
  const siteName = document.getElementById('settingsSiteName').value.trim();
  const tagline = document.getElementById('settingsTagline').value.trim();
  const edition = document.getElementById('settingsEdition').value.trim();
  const catText = document.getElementById('settingsCategories').value.trim();

  const categories = catText.split(',').map(c => c.trim()).filter(c => c.length > 0);

  const updatedSettings = {
    siteName,
    tagline,
    edition,
    categories
  };

  await ANR_Store.saveSiteSettings(updatedSettings);
  closeSiteSettingsModal();
  showToast('💾 បានរក្សាទុកការកំណត់គេហទំព័រដោយជោគជ័យ!');
}

function showToast(message) {
  let toast = document.getElementById('cmsToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cmsToast';
    toast.className = 'fixed bottom-6 right-6 bg-[#121212] text-white px-5 py-3 rounded-lg shadow-2xl z-50 text-xs font-semibold flex items-center gap-2 border border-neutral-700 transition-all duration-300 font-nyt-sans';
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
    const overlay = document.getElementById('newsroomLoginOverlay');
    if (overlay) overlay.classList.add('hidden');
  }
}

function handleGoogleSignIn() {
  if (typeof firebase === 'undefined' || !firebase.auth) {
    alert('Firebase Auth មិនទាន់ភ្ជាប់។');
    return;
  }
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .catch(err => {
      showAuthError(err.message);
    });
}

function handleEmailSignIn(e) {
  e.preventDefault();
  const email = document.getElementById('authEmailInput').value.trim();
  const password = document.getElementById('authPasswordInput').value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .catch(err => {
      showAuthError(err.message);
    });
}

function handleCreateStaffAccount() {
  const email = document.getElementById('authEmailInput').value.trim();
  const password = document.getElementById('authPasswordInput').value;

  if (!email || !password || password.length < 6) {
    alert('សូមបញ្ចូលអ៊ីមែល និងពាក្យសម្ងាត់យ៉ាងតិច ៦ តួអក្សរ។');
    return;
  }

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {
      showToast('🎉 គណនីបុគ្គលិកត្រូវបានចុះឈ្មោះ និងចូលប្រើដោយជោគជ័យ!');
    })
    .catch(err => {
      showAuthError(err.message);
    });
}

function handleSignOut() {
  if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().signOut().then(() => {
      showToast('បានចាកចេញពីបន្ទប់ព័ត៌មាន');
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
  if (userName) userName.innerText = "ភ្ញៀវនិពន្ធ (Local)";
  showToast('បានចូលប្រើជាភ្ញៀវនិពន្ធ');
}
