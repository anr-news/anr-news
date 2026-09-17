/**
 * ANR NEWS - Frontend Reader Portal Controller
 */

let currentArticles = [];
let currentArticleInModal = null;
let currentFontSize = 18;
let isAudioPlaying = false;
let activeCategory = null;

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
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
  renderFilteredStories();
  window.scrollTo({ top: 220, behavior: 'smooth' });
}

function resetCategoryFilter() {
  activeCategory = null;
  const filterBar = document.getElementById('activeCategoryFilterBar');
  if (filterBar) {
    filterBar.classList.add('hidden');
  }
  renderFilteredStories();
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

  container.classList.remove('hidden');
  container.innerHTML = `
    <div class="border-b border-t border-red-700 bg-red-50/40 dark:bg-red-950/20 py-2 px-3 flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2.5 flex-1 overflow-hidden">
        <span class="px-2 py-0.5 bg-[#D0021B] text-white font-bold text-[10px] rounded-sm flex items-center gap-1.5 flex-shrink-0 font-nyt-ui">
          <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span> ការផ្សាយផ្ទាល់
        </span>
        <span class="text-xs text-[#666666] font-mono flex-shrink-0">${breaking.updatedAt || 'ថ្មីៗនេះ'}</span>
        <a href="javascript:void(0)" onclick="openStoryByHeadline('${encodeURIComponent(breaking.text)}')" class="text-xs font-semibold text-inherit hover:underline hover:text-red-700 truncate font-nyt-ui">
          ${breaking.text}
        </a>
      </div>
      <span class="text-xs text-red-700 font-semibold cursor-pointer hover:underline flex-shrink-0 font-nyt-ui" onclick="openStory('art-1')">អានសេចក្តីវិភាគ →</span>
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
    <article class="space-y-3 cursor-pointer group" onclick="openStory('${lead.id}')">
      <span class="text-[11px] font-bold text-[#D0021B] font-nyt-ui">${lead.category || 'ការស៊ើបអង្កេតពិសេស'}</span>
      <h2 class="font-nyt-headline text-2xl sm:text-3xl md:text-4xl font-bold leading-[1.45] text-inherit group-hover:text-[#666666] transition">
        ${lead.headline}
      </h2>
      <p class="font-nyt-body text-base sm:text-[17px] text-[var(--text-body)] leading-[1.8]">
        ${lead.deck}
      </p>
      <div class="text-xs text-[var(--text-muted)] font-nyt-ui flex items-center gap-2">
        <span class="font-semibold text-inherit">ដោយ ${lead.author}</span>
        <span>•</span>
        <span>${lead.readTime}</span>
      </div>

      ${lead.image ? `
        <div class="pt-2">
          <div class="bg-neutral-800 text-neutral-300 rounded-sm overflow-hidden aspect-[16/9] flex items-center justify-center relative">
            <img src="${lead.image}" alt="រូបភាពអត្ថបទសំខាន់" class="w-full h-full object-cover"/>
          </div>
          <p class="text-xs text-[var(--text-muted)] font-nyt-body mt-1.5 leading-[1.6]">
            ${lead.caption || ''} <span class="text-[var(--text-light)] text-[10px] ml-1 font-nyt-ui">${lead.credit || ''}</span>
          </p>
        </div>
      ` : ''}

      <!-- NYT Style Audio Bar (Khmer) -->
      <div class="bg-[var(--bg-subtle)] border border-nyt-subtle p-2.5 rounded-sm flex items-center justify-between text-xs font-nyt-ui" onclick="event.stopPropagation()">
        <div class="flex items-center gap-2.5">
          <button onclick="toggleAudio(this)" class="w-7 h-7 rounded-full bg-[var(--text-main)] text-[var(--bg-page)] flex items-center justify-center hover:opacity-80 transition shadow-sm">
            <span id="audioPlaySymbol">▶</span>
          </button>
          <div>
            <span class="font-semibold text-inherit block leading-none">ស្តាប់អត្ថបទជាសំឡេង</span>
            <span class="text-[10px] text-[var(--text-muted)]">${lead.audio ? `${lead.audio.duration} • អានដោយ ${lead.audio.narrator}` : 'មានកំណែជាសំឡេង'}</span>
          </div>
        </div>
        <span class="text-[11px] font-mono text-[var(--text-muted)]">1.0x</span>
      </div>
    </article>
  `;
}

function renderSecondaryStories(secondaries) {
  const col2 = document.getElementById('colSecondaryStories');
  if (!col2) return;

  col2.innerHTML = secondaries.map((art, idx) => `
    <article class="space-y-2 cursor-pointer group pb-4 border-b border-nyt-subtle" onclick="openStory('${art.id}')">
      <span class="text-[10px] font-bold text-[var(--accent-blue)] font-nyt-ui">${art.category || 'ព័ត៌មាន'}</span>
      <div class="flex gap-3">
        <div class="flex-1">
          <h3 class="font-nyt-headline text-base sm:text-lg font-bold leading-[1.45] text-inherit group-hover:text-[#666666] transition">
            ${art.headline}
          </h3>
          <p class="font-nyt-body text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-[1.7]">
            ${art.deck || ''}
          </p>
          <span class="text-[11px] text-[var(--text-light)] block mt-1.5 font-nyt-ui">ដោយ ${art.author} • ${art.readTime}</span>
        </div>
        ${art.image ? `
          <div class="w-24 h-20 bg-neutral-200 rounded-sm flex-shrink-0 overflow-hidden">
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
    <article class="flex gap-3 items-start group cursor-pointer ${idx > 0 ? 'pt-3 border-t border-nyt-subtle' : ''}" onclick="alert('កំពុងបើកអត្ថបទវិចារណកថារបស់ ${op.author}')">
      <div class="w-12 h-12 rounded-full bg-neutral-300 overflow-hidden flex-shrink-0 border border-nyt-subtle">
        <img src="${op.image}" alt="${op.author}" class="w-full h-full object-cover"/>
      </div>
      <div class="space-y-1">
        <span class="text-xs font-semibold text-inherit block font-nyt-ui">${op.author}</span>
        <h4 class="font-nyt-headline text-sm font-bold leading-[1.48] text-inherit group-hover:text-[#666666] transition">
          ${op.headline}
        </h4>
        <span class="text-[11px] text-[var(--text-muted)] block font-nyt-ui">${op.readTime}</span>
      </div>
    </article>
  `).join('');
}

function openStory(id) {
  const article = currentArticles.find(a => a.id === id);
  if (!article) return;
  currentArticleInModal = article;

  const modal = document.getElementById('storyModal');
  const title = document.getElementById('modalTitle');
  const deck = document.getElementById('modalDeck');
  const byline = document.getElementById('modalByline');
  const body = document.getElementById('modalBody');

  title.innerText = article.headline;
  deck.innerText = article.deck || '';
  byline.innerText = `ដោយ ${article.author} • ${article.date || 'ថ្ងៃនេះ'} • ${article.readTime}`;

  // Use editorial-lead for safe Khmer cluster handling instead of broken drop-caps
  let contentHtml = article.content || '';
  if (contentHtml.includes('class="drop-cap"')) {
    contentHtml = contentHtml.replace(/class="drop-cap"/g, 'class="editorial-lead"');
  } else if (!contentHtml) {
    contentHtml = `<p class="editorial-lead">${article.deck || ''}</p><p>អត្ថបទព័ត៌មានពេញលេញចេញពីការិយាល័យនិពន្ធ។</p>`;
  }
  body.innerHTML = contentHtml;

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
  const modal = document.getElementById('storyModal');
  modal.classList.add('hidden');
  document.body.style.overflow = 'auto';
}

function adjustFontSize(delta) {
  currentFontSize = Math.max(14, Math.min(26, currentFontSize + delta));
  const body = document.getElementById('modalBody');
  if (body) {
    body.style.fontSize = `${currentFontSize}px`;
    body.style.lineHeight = '1.85';
  }
}

function toggleAudio(btn) {
  isAudioPlaying = !isAudioPlaying;
  const symbol = document.getElementById('audioPlaySymbol');
  if (isAudioPlaying) {
    symbol.innerText = '⏸';
  } else {
    symbol.innerText = '▶';
  }
}

function giftArticle() {
  navigator.clipboard.writeText(window.location.href);
  alert('🎁 [តំណភ្ជាប់អំណោយត្រូវបានបង្កើត]\nតំណភ្ជាប់សម្រាប់អានអត្ថបទពេញដោយឥតគិតថ្លៃត្រូវបានចម្លង។ មិត្តភក្តិរបស់អ្នកអាចអានអត្ថបទនេះដោយមិនចាំបាច់ជាវសមាជិកឡើយ។');
}
