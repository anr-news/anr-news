/**
 * ANR NEWS - Frontend Reader Portal Controller
 */

let currentArticles = [];
let currentArticleInModal = null;
let currentFontSize = 20;
let isAudioPlaying = false;
let activeCategory = null;

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initStickyShrinkNav();
  loadContent();

  window.addEventListener('anr_news_updated', () => {
    loadContent();
  });
});

function initTheme() {
  const savedTheme = localStorage.getItem('ANR_THEME') || 'day';
  setTheme(savedTheme);
}

function setTheme(theme) {
  document.body.classList.remove('theme-paper', 'theme-night');
  if (theme === 'paper') document.body.classList.add('theme-paper');
  if (theme === 'night') document.body.classList.add('theme-night');
  localStorage.setItem('ANR_THEME', theme);
}

async function loadContent() {
  try {
    currentArticles = await ANR_Store.getArticles();
    const breaking = await ANR_Store.getBreakingAlert();
    const opinions = ANR_Store.getOpinions();
    const settings = await ANR_Store.getSiteSettings();

    // Apply Site Settings if available
    if (settings) {
      const mastheadEl = document.getElementById('siteMastheadText');
      const mottoEl = document.getElementById('siteMottoText');
      const editionEl = document.getElementById('siteEditionText');
      if (mastheadEl && settings.siteName) mastheadEl.innerText = settings.siteName;
      if (mottoEl && settings.tagline) mottoEl.innerText = settings.tagline;
      if (editionEl && settings.edition) editionEl.innerText = settings.edition;
    }

    renderBreaking(breaking);
    renderFilteredStories();
    renderOpinions(opinions);
  } catch (err) {
    console.error('Failed to load content:', err);
  }
}

function filterByCategory(category) {
  activeCategory = category;
  const filterBar = document.getElementById('activeCategoryFilterBar');
  const catName = document.getElementById('activeCategoryName');
  if (filterBar && catName) {
    catName.innerText = category;
    filterBar.classList.remove('hidden');
  }
  updateCategoryNavPills(category);
  renderFilteredStories();
  window.scrollTo({ top: 220, behavior: 'smooth' });
}

function resetCategoryFilter() {
  activeCategory = null;
  const filterBar = document.getElementById('activeCategoryFilterBar');
  if (filterBar) {
    filterBar.classList.add('hidden');
  }
  updateCategoryNavPills(null);
  renderFilteredStories();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateCategoryNavPills(activeCat) {
  const buttons = document.querySelectorAll('#categoryNavList .nav-category-pill');
  buttons.forEach(btn => {
    const cat = btn.getAttribute('data-category');
    if ((activeCat === null && cat === 'all') || (cat === activeCat)) {
      btn.classList.add('active');
      if (typeof btn.scrollIntoView === 'function') {
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    } else {
      btn.classList.remove('active');
    }
  });
}

function renderFilteredStories() {
  let displayList = currentArticles;
  if (activeCategory) {
    displayList = currentArticles.filter(a => a.category === activeCategory);
    if (displayList.length === 0) {
      displayList = currentArticles; // fallback if no articles in that category
    }
  }
  renderStories(displayList);
}

function renderBreaking(breaking) {
  const container = document.getElementById('breakingAlertContainer');
  if (!container) return;

  if (!breaking || !breaking.active) {
    container.classList.add('hidden');
    return;
  }

  // Ensure breaking text is authentic Khmer without English leftovers
  let breakingText = breaking.text || '';
  if (breakingText.includes('Diplomats Reach Landmark Accord') || !/[\u1780-\u17FF]/.test(breakingText)) {
    breakingText = 'ដំណឹងទាន់ហេតុការណ៍៖ ប្រទេសជាសមាជិកអង្គការសហប្រជាជាតិបានអនុម័តសន្ធិសញ្ញាជាប្រវត្តិសាស្ត្រស្តីពីការគ្រប់គ្រង AI នាទីក្រុងហ្សឺណែវ';
  }
  let timeText = breaking.updatedAt || '៨ នាទីមុន';
  if (timeText.includes('ago')) {
    timeText = timeText.replace(/(\d+)\s*m\s*ago/i, '$1 នាទីមុន').replace(/just now/i, 'ទើបតែចេញផ្សាយ');
  }

  container.classList.remove('hidden');
  container.innerHTML = `
    <div class="border-b border-t-2 border-red-700 bg-red-50/70 dark:bg-red-950/30 py-3 px-4 flex flex-wrap items-center justify-between gap-3 rounded-sm shadow-sm">
      <div class="flex items-center gap-3 flex-1 overflow-hidden">
        <span class="px-3 py-1 bg-[#D0021B] text-white font-bold text-xs sm:text-sm rounded-full flex items-center gap-1.5 flex-shrink-0 font-nyt-ui shadow-sm">
          <span class="w-2 h-2 rounded-full bg-white animate-ping"></span> ការផ្សាយផ្ទាល់
        </span>
        <span class="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-bold flex-shrink-0 font-nyt-ui">${timeText}</span>
        <a href="javascript:void(0)" onclick="openStoryByHeadline('${encodeURIComponent(breakingText)}')" class="text-base sm:text-lg font-bold text-inherit hover:underline hover:text-red-700 truncate font-nyt-ui">
          ${breakingText}
        </a>
      </div>
      <span class="text-sm font-bold text-red-700 cursor-pointer hover:underline flex-shrink-0 font-nyt-ui" onclick="openStory('art-1')">អានសេចក្តីវិភាគ →</span>
    </div>
  `;
}

function renderStories(articles) {
  const lead = articles.find(a => a.slot === 'lead-anchor') || articles[0];
  const secondaries = articles.filter(a => a.id !== lead.id);

  renderLeadStory(lead);
  renderSecondaryStories(secondaries);
}

function renderLeadStory(lead) {
  const col1 = document.getElementById('colLeadStory');
  if (!col1 || !lead) return;

  col1.innerHTML = `
    <article class="space-y-3.5 cursor-pointer group" onclick="openStory('${lead.id}')">
      <span class="text-xs sm:text-sm font-bold text-[#D0021B] font-nyt-ui">${lead.category || 'ការស៊ើបអង្កេតពិសេស'}</span>
      <h2 class="font-nyt-headline text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.38] text-inherit group-hover:text-[#666666] transition">
        ${lead.headline}
      </h2>
      <p class="font-nyt-body text-lg sm:text-xl text-[var(--text-body)] leading-[1.85]">
        ${lead.deck}
      </p>
      <div class="text-sm text-[var(--text-muted)] font-nyt-ui flex items-center gap-2.5">
        <span class="font-semibold text-inherit">ដោយ ${lead.author}</span>
        <span>•</span>
        <span>${lead.readTime}</span>
      </div>

      ${lead.image ? `
        <div class="pt-2">
          <div class="bg-neutral-800 text-neutral-300 rounded-sm overflow-hidden aspect-[16/9] flex items-center justify-center relative">
            <img src="${lead.image}" alt="រូបភាពអត្ថបទសំខាន់" class="w-full h-full object-cover"/>
          </div>
          <p class="text-sm text-[var(--text-muted)] font-nyt-body mt-2 leading-[1.6]">
            ${lead.caption || ''} <span class="text-[var(--text-light)] text-xs ml-1 font-nyt-ui">${lead.credit || ''}</span>
          </p>
        </div>
      ` : ''}

      <!-- Senior Quick Action Bar (Audio + 1-Tap Telegram Share) -->
      <div class="bg-[var(--bg-subtle)] border-2 border-nyt-subtle p-3.5 rounded-md flex flex-wrap items-center justify-between gap-3 text-sm sm:text-base font-nyt-ui shadow-sm" onclick="event.stopPropagation()">
        <div class="flex items-center gap-3">
          <button onclick="toggleLeadAudio('${lead.id}')" class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition shadow-sm font-bold text-base flex-shrink-0" title="ស្តាប់អត្ថបទជាសំឡេង">
            <span id="leadAudioPlaySymbol">▶</span>
          </button>
          <div>
            <span class="font-bold text-inherit block leading-tight text-sm sm:text-base">ស្តាប់ព័ត៌មានជាសំឡេង</span>
            <span class="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5 block">${lead.audio ? `${lead.audio.duration} • អានដោយ ${lead.audio.narrator}` : 'ចុចដើម្បីស្តាប់ការអានស្វ័យប្រវត្តិ'}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="shareArticleToTelegram('${lead.id}')" class="px-4 py-2 rounded-full bg-[#229ED9] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm hover:bg-[#1a8bc0] transition" title="ចែករំលែកទៅ Telegram">
            <span>✈</span>
            <span>ចែករំលែក Telegram</span>
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderSecondaryStories(secondaries) {
  const col2 = document.getElementById('colSecondaryStories');
  if (!col2) return;

  col2.innerHTML = secondaries.map((art, idx) => `
    <article class="space-y-2 cursor-pointer group pb-4 border-b border-nyt-subtle" onclick="openStory('${art.id}')">
      <span class="text-xs font-bold text-[var(--accent-blue)] font-nyt-ui">${art.category || 'ព័ត៌មាន'}</span>
      <div class="flex gap-3">
        <div class="flex-1">
          <h3 class="font-nyt-headline text-lg sm:text-xl font-bold leading-[1.45] text-inherit group-hover:text-[#666666] transition">
            ${art.headline}
          </h3>
          <p class="font-nyt-body text-sm sm:text-base text-[var(--text-muted)] mt-1.5 leading-[1.75]">
            ${art.deck || ''}
          </p>
          <div class="flex items-center justify-between mt-2 pt-1.5 border-t border-dashed border-nyt-subtle">
            <span class="text-xs sm:text-sm text-[var(--text-light)] font-nyt-ui">ដោយ ${art.author} • ${art.readTime}</span>
            <button onclick="event.stopPropagation(); shareArticleToTelegram('${art.id}')" class="text-xs text-[#229ED9] hover:underline font-bold flex items-center gap-1 font-nyt-ui px-2 py-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40 transition" title="ចែករំលែកតាម Telegram">
              <span>✈</span>
              <span>Telegram</span>
            </button>
          </div>
        </div>
        ${art.image ? `
          <div class="w-28 h-24 bg-neutral-200 rounded-sm flex-shrink-0 overflow-hidden">
            <img src="${art.image}" alt="${art.headline}" class="w-full h-full object-cover"/>
          </div>
        ` : ''}
      </div>
    </article>
  `).join('');
}

function renderOpinions(opinions) {
  const col3 = document.getElementById('colOpinionList');
  if (!col3) return;

  col3.innerHTML = opinions.map((op, idx) => `
    <article class="flex gap-3.5 items-start group cursor-pointer ${idx > 0 ? 'pt-3.5 border-t border-nyt-subtle' : ''}" onclick="alert('កំពុងបើកអត្ថបទវិចារណកថារបស់ ${op.author}')">
      <div class="w-13 h-13 rounded-full bg-neutral-300 overflow-hidden flex-shrink-0 border border-nyt-subtle">
        <img src="${op.image}" alt="${op.author}" class="w-full h-full object-cover"/>
      </div>
      <div class="space-y-1">
        <span class="text-sm font-bold text-inherit block font-nyt-ui">${op.author}</span>
        <h4 class="font-nyt-headline text-base font-bold leading-[1.5] text-inherit group-hover:text-[#666666] transition">
          ${op.headline}
        </h4>
        <span class="text-xs text-[var(--text-muted)] block font-nyt-ui">${op.readTime}</span>
      </div>
    </article>
  `).join('');
}

let speechUtterance = null;
let isAudioNarrating = false;

function openStory(id) {
  const article = currentArticles.find(a => a.id === id);
  if (!article) return;
  currentArticleInModal = article;

  const modal = document.getElementById('storyModal');
  const title = document.getElementById('modalTitle');
  const deck = document.getElementById('modalDeck');
  const byline = document.getElementById('modalByline');
  const body = document.getElementById('modalBody');
  const catBadge = document.getElementById('modalCategoryBadge');
  const dateStamp = document.getElementById('modalDateStamp');
  const imgContainer = document.getElementById('modalImageContainer');
  const imgEl = document.getElementById('modalImage');
  const imgCaption = document.getElementById('modalImageCaption');

  if (catBadge) catBadge.innerText = article.category || 'ព័ត៌មានទាន់ហេតុការណ៍';
  if (dateStamp) dateStamp.innerText = article.date || 'ថ្ងៃនេះ';

  title.innerText = article.headline;
  deck.innerText = article.deck || '';
  byline.innerText = `ដោយ ${article.author} • រយៈពេលអាន ${article.readTime || '៣ នាទី'}`;

  // Image handling in modal
  if (imgContainer && imgEl) {
    if (article.image) {
      imgEl.src = article.image;
      imgEl.alt = article.headline;
      if (imgCaption) {
        imgCaption.innerText = article.caption || (article.credit ? 'ប្រភពរូបភាព៖ ' + article.credit : '');
        imgCaption.style.display = (article.caption || article.credit) ? 'block' : 'none';
      }
      imgContainer.classList.remove('hidden');
    } else {
      imgContainer.classList.add('hidden');
    }
  }

  // Use editorial-lead for safe Khmer cluster handling instead of broken drop-caps
  let contentHtml = article.content || '';
  if (contentHtml.includes('class="drop-cap"')) {
    contentHtml = contentHtml.replace(/class="drop-cap"/g, 'class="editorial-lead"');
  } else if (!contentHtml) {
    contentHtml = `<p class="editorial-lead">${article.deck || ''}</p><p>អត្ថបទព័ត៌មានពេញលេញចេញពីការិយាល័យនិពន្ធ អេអិនអ័រ។</p>`;
  }
  body.innerHTML = contentHtml;

  // Apply optical font sizing
  applyFontSizeUI();

  // Reset audio state
  stopAudioNarration();

  // Initialize saved font preference
  const savedFont = localStorage.getItem('ANR_READER_FONT') || 'sans';
  setReaderFont(savedFont, false);

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function setReaderFont(fontType, save = true) {
  const body = document.getElementById('modalBody');
  const btnSans = document.getElementById('btnReaderFontSans');
  const btnSerif = document.getElementById('btnReaderFontSerif');

  if (body) {
    if (fontType === 'serif') {
      body.classList.add('reader-font-serif');
    } else {
      body.classList.remove('reader-font-serif');
    }
  }

  if (btnSans && btnSerif) {
    if (fontType === 'serif') {
      btnSerif.className = "px-2 py-0.5 bg-[var(--text-main)] text-[var(--bg-page)] font-semibold transition";
      btnSans.className = "px-2 py-0.5 bg-[var(--bg-subtle)] text-[var(--text-main)] hover:bg-neutral-200 dark:hover:bg-neutral-700 transition";
    } else {
      btnSans.className = "px-2 py-0.5 bg-[var(--text-main)] text-[var(--bg-page)] font-semibold transition";
      btnSerif.className = "px-2 py-0.5 bg-[var(--bg-subtle)] text-[var(--text-main)] hover:bg-neutral-200 dark:hover:bg-neutral-700 transition";
    }
  }

  if (save) {
    localStorage.setItem('ANR_READER_FONT', fontType);
  }
}

function openStoryByHeadline(encoded) {
  openStory('art-1');
}

function closeStoryModal() {
  stopAudioNarration();
  const modal = document.getElementById('storyModal');
  modal.classList.add('hidden');
  document.body.style.overflow = 'auto';
}

function adjustFontSize(delta) {
  currentFontSize = Math.max(16, Math.min(36, currentFontSize + delta));
  applyFontSizeUI();
}

function applyFontSizeUI() {
  const body = document.getElementById('modalBody');
  if (body) {
    body.style.fontSize = `${currentFontSize}px`;
    body.style.lineHeight = '1.9';
  }
  const display1 = document.getElementById('fontSizeDisplay');
  const display2 = document.getElementById('fontSizeDisplayTop');
  if (display1) display1.innerText = `${currentFontSize}px`;
  if (display2) display2.innerText = `${currentFontSize}px`;
}

// Audio Narration Controller (Senior Friendly)
function toggleAudioNarration() {
  if (!('speechSynthesis' in window)) {
    alert('ឧបករណ៍របស់អ្នកមិនទាន់គាំទ្រមុខងារអានជាសំឡេង Text-To-Speech នៅឡើយទេ។');
    return;
  }

  if (window.speechSynthesis.speaking) {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setAudioUIState(true);
    } else {
      window.speechSynthesis.pause();
      setAudioUIState(false, true);
    }
    return;
  }

  if (!currentArticleInModal) return;

  const titleText = currentArticleInModal.headline || '';
  const deckText = currentArticleInModal.deck || '';
  const bodyEl = document.getElementById('modalBody');
  const bodyText = bodyEl ? bodyEl.innerText : '';

  const fullSpeechText = `${titleText}។ ${deckText}។ ${bodyText}`;
  speechUtterance = new SpeechSynthesisUtterance(fullSpeechText);

  // Pick voice
  const voices = window.speechSynthesis.getVoices();
  const khmerVoice = voices.find(v => v.lang && (v.lang.includes('km') || v.lang.includes('kh')));
  if (khmerVoice) {
    speechUtterance.voice = khmerVoice;
  }

  // Slightly slower rate for elderly comprehension
  speechUtterance.rate = 0.92;
  speechUtterance.pitch = 1.0;

  speechUtterance.onstart = () => {
    setAudioUIState(true);
  };
  speechUtterance.onend = () => {
    setAudioUIState(false);
  };
  speechUtterance.onerror = () => {
    setAudioUIState(false);
  };

  window.speechSynthesis.speak(speechUtterance);
}

function stopAudioNarration() {
  if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  setAudioUIState(false);
}

function setAudioUIState(isPlaying, isPaused = false) {
  isAudioNarrating = isPlaying;
  const icon = document.getElementById('modalAudioIcon');
  const text = document.getElementById('modalAudioText');
  const btn = document.getElementById('btnModalAudio');

  if (icon && text) {
    if (isPlaying) {
      icon.innerText = '⏸';
      text.innerText = 'ផ្អាកសំឡេង';
      if (btn) btn.classList.add('animate-pulse');
    } else if (isPaused) {
      icon.innerText = '▶';
      text.innerText = 'បន្តស្តាប់';
      if (btn) btn.classList.remove('animate-pulse');
    } else {
      icon.innerText = '▶';
      text.innerText = 'ស្តាប់ព័ត៌មាន';
      if (btn) btn.classList.remove('animate-pulse');
    }
  }
}

// Frontpage Lead Story Audio Toggle
function toggleLeadAudio(id) {
  const article = currentArticles.find(a => a.id === id);
  if (!article) return;
  
  const sym = document.getElementById('leadAudioPlaySymbol');

  if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    if (sym) sym.innerText = '▶';
    return;
  }

  if (sym) sym.innerText = '⏸';

  const textToRead = `${article.headline}។ ${article.deck || ''}`;
  const utterance = new SpeechSynthesisUtterance(textToRead);
  utterance.rate = 0.92;
  utterance.onend = () => {
    if (sym) sym.innerText = '▶';
  };
  utterance.onerror = () => {
    if (sym) sym.innerText = '▶';
  };
  window.speechSynthesis.speak(utterance);
}

// 1-Tap Share to Telegram
function shareToTelegram() {
  if (!currentArticleInModal) return;
  const url = window.location.origin + window.location.pathname;
  const headline = currentArticleInModal.headline;
  const deck = currentArticleInModal.deck || '';
  const shareText = `📰 ${headline}\n\n${deck}\n\n👉 អានព័ត៌មានលម្អិតនៅលើ ANR NEWS៖`;
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;
  window.open(shareUrl, '_blank');
}

function shareArticleToTelegram(id) {
  const article = currentArticles.find(a => a.id === id);
  if (!article) return;
  const url = window.location.origin + window.location.pathname;
  const shareText = `📰 ${article.headline}\n\n${article.deck || ''}\n\n👉 អានព័ត៌មានលម្អិតនៅលើ ANR NEWS៖`;
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;
  window.open(shareUrl, '_blank');
}

// Share to Facebook
function shareToFacebook() {
  const url = window.location.origin + window.location.pathname;
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(shareUrl, '_blank');
}

function giftArticle() {
  navigator.clipboard.writeText(window.location.href);
  alert('🎁 [តំណភ្ជាប់អំណោយត្រូវបានចម្លង]\nតំណភ្ជាប់អានព័ត៌មានពេញលេញត្រូវបានចម្លងទៅកាន់ Clipboard។ លោកអ្នកអាចយកទៅ Paste ផ្ញើជូនមិត្តភក្តិ ឬគ្រួសារបានដោយសេរី។');
}

// Shrink Navigation on Scroll Controller
function initStickyShrinkNav() {
  const stickyNav = document.getElementById('stickyNavWrapper');
  const shrinkLogo = document.getElementById('shrinkBrandLogo');
  const shrinkBackToTop = document.getElementById('shrinkBackToTop');

  if (!stickyNav) return;

  function handleScroll() {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    if (scrollY > 140) {
      stickyNav.classList.add('is-shrunk');
      if (shrinkLogo) {
        shrinkLogo.classList.remove('hidden');
        shrinkLogo.classList.add('flex');
      }
      if (shrinkBackToTop) {
        shrinkBackToTop.classList.remove('hidden');
        shrinkBackToTop.classList.add('flex');
      }
    } else {
      stickyNav.classList.remove('is-shrunk');
      if (shrinkLogo) {
        shrinkLogo.classList.add('hidden');
        shrinkLogo.classList.remove('flex');
      }
      if (shrinkBackToTop) {
        shrinkBackToTop.classList.add('hidden');
        shrinkBackToTop.classList.remove('flex');
      }
    }
  }

  // Initial check on load
  handleScroll();

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

