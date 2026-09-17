/**
 * ANR NEWS - Frontend Reader Portal Controller
 */

let currentArticles = [];
let currentArticleInModal = null;
let currentFontSize = 18;
let isAudioPlaying = false;

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

    renderBreaking(breaking);
    renderStories(currentArticles);
    renderOpinions(opinions);
  } catch (err) {
    console.error('Failed to load content:', err);
  }
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
        <span class="px-2 py-0.5 bg-[#D0021B] text-white font-bold text-[10px] tracking-wider uppercase rounded-sm flex items-center gap-1.5 flex-shrink-0">
          <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span> Live Updates
        </span>
        <span class="text-xs text-[#666666] font-mono flex-shrink-0">${breaking.updatedAt || 'Recently'}</span>
        <a href="javascript:void(0)" onclick="openStoryByHeadline('${encodeURIComponent(breaking.text)}')" class="text-xs font-semibold text-inherit hover:underline hover:text-red-700 truncate">
          ${breaking.text}
        </a>
      </div>
      <span class="text-xs text-red-700 font-semibold cursor-pointer hover:underline flex-shrink-0" onclick="openStory('art-1')">Read analysis →</span>
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
      <span class="text-[11px] font-bold tracking-wider uppercase text-[#D0021B]">${lead.category || 'Special Investigation'}</span>
      <h2 class="font-nyt-serif text-3xl sm:text-4xl font-bold leading-[1.12] text-inherit group-hover:text-[#666666] transition">
        ${lead.headline}
      </h2>
      <p class="font-nyt-serif text-base text-[var(--text-body)] leading-snug">
        ${lead.deck}
      </p>
      <div class="text-[11px] text-[var(--text-muted)] font-nyt-sans flex items-center gap-2">
        <span class="font-semibold text-inherit">By ${lead.author}</span>
        <span>•</span>
        <span>${lead.readTime}</span>
      </div>

      ${lead.image ? `
        <div class="pt-2">
          <div class="bg-neutral-800 text-neutral-300 rounded-sm overflow-hidden aspect-[16/9] flex items-center justify-center relative">
            <img src="${lead.image}" alt="Lead Image" class="w-full h-full object-cover"/>
          </div>
          <p class="text-[11px] text-[var(--text-muted)] font-nyt-serif italic mt-1.5 leading-tight">
            ${lead.caption || ''} <span class="not-italic text-[var(--text-light)] uppercase text-[9px] ml-1">${lead.credit || ''}</span>
          </p>
        </div>
      ` : ''}

      <!-- NYT Style Audio Bar -->
      <div class="bg-[var(--bg-subtle)] border border-nyt-subtle p-2.5 rounded-sm flex items-center justify-between text-xs" onclick="event.stopPropagation()">
        <div class="flex items-center gap-2.5">
          <button onclick="toggleAudio(this)" class="w-7 h-7 rounded-full bg-[var(--text-main)] text-[var(--bg-page)] flex items-center justify-center hover:opacity-80 transition shadow-sm">
            <span id="audioPlaySymbol">▶</span>
          </button>
          <div>
            <span class="font-semibold text-inherit block leading-none">Listen to this story</span>
            <span class="text-[10px] text-[var(--text-muted)]">${lead.audio ? `${lead.audio.duration} • Narrated by ${lead.audio.narrator}` : 'Audio edition available'}</span>
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
      <span class="text-[10px] font-bold tracking-wider uppercase text-[var(--accent-blue)]">${art.category || 'News'}</span>
      <div class="flex gap-3">
        <div class="flex-1">
          <h3 class="font-nyt-serif text-lg font-bold leading-snug text-inherit group-hover:text-[#666666] transition">
            ${art.headline}
          </h3>
          <p class="font-nyt-serif text-xs text-[var(--text-muted)] mt-1 leading-normal">
            ${art.deck || ''}
          </p>
          <span class="text-[10px] text-[var(--text-light)] block mt-1">By ${art.author} • ${art.readTime}</span>
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
    <article class="flex gap-3 items-start group cursor-pointer ${idx > 0 ? 'pt-3 border-t border-nyt-subtle' : ''}" onclick="alert('Opening opinion column by ${op.author}')">
      <div class="w-12 h-12 rounded-full bg-neutral-300 overflow-hidden flex-shrink-0 border border-nyt-subtle">
        <img src="${op.image}" alt="${op.author}" class="w-full h-full object-cover"/>
      </div>
      <div class="space-y-1">
        <span class="text-xs font-semibold text-inherit block">${op.author}</span>
        <h4 class="font-nyt-serif text-sm font-bold leading-snug text-inherit group-hover:text-[#666666] transition">
          ${op.headline}
        </h4>
        <span class="text-[10px] text-[var(--text-muted)] block">${op.readTime}</span>
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
  byline.innerText = `By ${article.author} • ${article.date || 'Today'} • ${article.readTime}`;
  body.innerHTML = article.content || `<p class="drop-cap">${article.deck}</p><p>Full reporting filed from the international desk.</p>`;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
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
    body.style.lineHeight = '1.65';
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
  alert('🎁 [Gift Article Token Generated]\nA free reading link has been copied to your clipboard. Non-subscribers can read this full story for 14 days.');
}
