/**
 * ANR NEWS - Shared Data Store & Sync Layer
 * Supports:
 * 1. Google Firebase Firestore (Real-time cloud database)
 * 2. Node.js Local HTTP REST API
 * 3. Browser localStorage Fallback (direct file:// viewing)
 */

const SEED_ARTICLES = [
  {
    id: "art-1",
    slot: "lead-anchor",
    category: "Special Investigation",
    headline: "Global Accord Reached to Regulate Algorithmic Commerce Across Border Rails",
    deck: "Negotiators in Geneva approved binding protocols requiring automated procurement agents to hold verifiable human legal backstops, concluding fifteen months of contentious closed-door debates.",
    author: "David Sanger and Julian Barnes",
    readTime: "8 min read",
    date: "September 17, 2026",
    audio: {
      narrator: "Michael Barbaro",
      duration: "7:14"
    },
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1000&q=80",
    caption: "Delegations from 42 countries assembled at the Palais des Nations in Geneva before the final vote on Thursday morning.",
    credit: "Andrew Testa for The Chronicle Times",
    status: "published",
    wordCount: 1420,
    content: `
      <p class="drop-cap">Negotiators from 42 nations reached a decisive compromise early Thursday morning on sovereign jurisdiction over cross-border algorithmic purchasing contracts, concluding more than a year of fraught sessions behind closed doors at the United Nations complex.</p>
      <p>The treaty, which will require ratification by member parliaments over the coming eighteen months, establishes a universal threshold: whenever autonomous agents execute contractual transfers exceeding five million dollars, an authenticated human compliance officer must be bound to the cryptographic ledger.</p>
      <blockquote class="nyt-pull-quote">"We could not allow a regulatory vacuum where billions in physical goods change hands at microsecond intervals without clear legal liability."</blockquote>
      <p>Early telemetry indicates that over 40 percent of standard procurement transactions across automotive and consumer electronics supply webs are now signed off by verified software agents running local constraint models.</p>
      <p>While transaction speeds have collapsed from days to fractions of a second, systemic exposure questions linger. Regulators worldwide are drafting protocols to enforce verifiable traceability and human override kill-switches.</p>
    `
  },
  {
    id: "art-2",
    slot: "secondary-1",
    category: "Climate & Energy",
    headline: "How Offshore Wind Is Surviving the Deep-Water Supply Chain Crisis",
    deck: "Floating platforms off the coast of Maine and Scotland demonstrate profitable grid delivery despite steel price surges.",
    author: "Brad Plumer",
    readTime: "5 min read",
    date: "September 17, 2026",
    image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=400&q=80",
    status: "published",
    wordCount: 850,
    content: "<p>Deep-water wind installations have achieved reliable high-capacity output, defying early supply-chain skeptics through innovative ballast engineering.</p>"
  },
  {
    id: "art-3",
    slot: "secondary-2",
    category: "Architecture & Urbanism",
    headline: "Converting Commercial Towers to Apartments: The Cost Math Finally Works",
    deck: "Tax abatements and floorplate cutting innovations have unlocked 18,000 new units in downtown Chicago and Manhattan.",
    author: "Stefanos Chen",
    readTime: "6 min read",
    date: "September 17, 2026",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80",
    status: "published",
    wordCount: 1100,
    content: "<p>Office-to-residential conversions have surpassed initial projections as city tax incentives and zoning adjustments take hold.</p>"
  },
  {
    id: "art-4",
    slot: "secondary-3",
    category: "Science & Computation",
    headline: "Silicon Photonics Replaces Copper Interconnects in Hyperscale Clusters",
    deck: "A paradigm transition to laser-guided data routing reduces data center thermal load by 35 percent.",
    author: "Cade Metz",
    readTime: "4 min read",
    date: "September 17, 2026",
    image: null,
    status: "published",
    wordCount: 920,
    content: "<p>Laser routing on silicon wafer packages marks a monumental leap in computational energy efficiency across cloud networks.</p>"
  }
];

const SEED_BREAKING = {
  text: "Diplomats Reach Landmark Accord on Sovereign AI Oversight at Geneva Summit",
  url: "#",
  updatedAt: "8m ago",
  active: true
};

const SEED_OPINIONS = [
  {
    id: "op-1",
    author: "Maureen Dowd",
    headline: "The Solitude of Modern Power and the Ghost in the Diplomatic Machine",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "op-2",
    author: "David Brooks",
    headline: "Why Character Matters More Than Ever in an Algorithmic Age",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "op-3",
    author: "Paul Krugman",
    headline: "Don't Bet Against Industrial Policy in North America",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
  }
];

const Store = {
  isHttp: window.location.protocol.startsWith('http'),
  hasFirebase: false,
  firestoreDb: null,

  initFirebase() {
    if (typeof firebase !== 'undefined' && window.ANR_FIREBASE_CONFIG && window.ANR_FIREBASE_CONFIG.projectId !== 'YOUR_PROJECT_ID') {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(window.ANR_FIREBASE_CONFIG);
        }
        this.firestoreDb = firebase.firestore();
        this.hasFirebase = true;
        console.log('⚡ Connected to Google Cloud Firestore');

        // Subscribe to live breaking news alerts
        this.firestoreDb.collection('breaking').doc('live').onSnapshot(doc => {
          if (doc.exists) {
            localStorage.setItem('ANR_NEWS_BREAKING', JSON.stringify(doc.data()));
            this.notifyUpdate();
          }
        });

        // Subscribe to live articles stream
        this.firestoreDb.collection('articles').onSnapshot(snapshot => {
          const list = [];
          snapshot.forEach(doc => list.push(doc.data()));
          if (list.length > 0) {
            localStorage.setItem('ANR_NEWS_ARTICLES', JSON.stringify(list));
            this.notifyUpdate();
          }
        });
      } catch (e) {
        console.warn('Firebase initialization error, using local fallback:', e);
      }
    }
  },

  async getArticles() {
    // Check if Firebase is active
    if (this.hasFirebase && this.firestoreDb) {
      try {
        const snap = await this.firestoreDb.collection('articles').get();
        const list = [];
        snap.forEach(d => list.push(d.data()));
        if (list.length > 0) {
          return list;
        } else {
          // Cloud Firestore is empty: auto-seed initial news stories
          console.log('🌱 Initializing Firestore with seed news stories...');
          for (const art of SEED_ARTICLES) {
            await this.firestoreDb.collection('articles').doc(art.id).set(art);
          }
          await this.firestoreDb.collection('breaking').doc('live').set(SEED_BREAKING);
          return SEED_ARTICLES;
        }
      } catch (e) {
        console.warn('Firestore fetch failed, falling back:', e);
      }
    }

    if (this.isHttp) {
      try {
        const res = await fetch('/api/articles');
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('API error, falling back to local storage', e);
      }
    }
    const local = localStorage.getItem('ANR_NEWS_ARTICLES');
    if (local) return JSON.parse(local);
    localStorage.setItem('ANR_NEWS_ARTICLES', JSON.stringify(SEED_ARTICLES));
    return SEED_ARTICLES;
  },

  async saveArticle(article) {
    // Write to Firebase if enabled
    if (this.hasFirebase && this.firestoreDb) {
      try {
        await this.firestoreDb.collection('articles').doc(article.id).set(article, { merge: true });
        console.log('⚡ Saved article to Google Cloud Firestore:', article.id);
        this.notifyUpdate();
        return article;
      } catch (e) {
        console.warn('Firestore write failed, using local:', e);
      }
    }

    if (this.isHttp) {
      try {
        const res = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(article)
        });
        if (res.ok) {
          this.notifyUpdate();
          return (await res.json()).article;
        }
      } catch (e) {
        console.warn('API error, saving to local storage', e);
      }
    }

    const articles = await this.getArticles();
    const idx = articles.findIndex(a => a.id === article.id);
    if (idx >= 0) {
      articles[idx] = { ...articles[idx], ...article };
    } else {
      articles.unshift(article);
    }
    localStorage.setItem('ANR_NEWS_ARTICLES', JSON.stringify(articles));
    this.notifyUpdate();
    return article;
  },

  async getBreakingAlert() {
    if (this.hasFirebase && this.firestoreDb) {
      try {
        const doc = await this.firestoreDb.collection('breaking').doc('live').get();
        if (doc.exists) return doc.data();
      } catch (e) {
        console.warn('Firestore breaking read failed:', e);
      }
    }

    if (this.isHttp) {
      try {
        const res = await fetch('/api/breaking');
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('API error, using local storage for breaking alert', e);
      }
    }
    const local = localStorage.getItem('ANR_NEWS_BREAKING');
    if (local) return JSON.parse(local);
    localStorage.setItem('ANR_NEWS_BREAKING', JSON.stringify(SEED_BREAKING));
    return SEED_BREAKING;
  },

  async saveBreakingAlert(alertData) {
    const updated = { ...alertData, updatedAt: 'Just now' };

    if (this.hasFirebase && this.firestoreDb) {
      try {
        await this.firestoreDb.collection('breaking').doc('live').set(updated, { merge: true });
        this.notifyUpdate();
        return updated;
      } catch (e) {
        console.warn('Firestore breaking write failed:', e);
      }
    }

    if (this.isHttp) {
      try {
        const res = await fetch('/api/breaking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alertData)
        });
        if (res.ok) {
          this.notifyUpdate();
          return (await res.json()).breaking;
        }
      } catch (e) {
        console.warn('API error saving breaking', e);
      }
    }

    const current = await this.getBreakingAlert();
    const merged = { ...current, ...updated };
    localStorage.setItem('ANR_NEWS_BREAKING', JSON.stringify(merged));
    this.notifyUpdate();
    return merged;
  },

  getOpinions() {
    return SEED_OPINIONS;
  },

  getSavedArticles() {
    return JSON.parse(localStorage.getItem('ANR_SAVED_QUEUE') || '[]');
  },

  toggleSave(articleId) {
    let saved = this.getSavedArticles();
    if (saved.includes(articleId)) {
      saved = saved.filter(id => id !== articleId);
    } else {
      saved.push(articleId);
    }
    localStorage.setItem('ANR_SAVED_QUEUE', JSON.stringify(saved));
    return saved.includes(articleId);
  },

  notifyUpdate() {
    window.dispatchEvent(new CustomEvent('anr_news_updated'));
  }
};

// Initialize Firebase if present
if (typeof window !== 'undefined') {
  Store.initFirebase();
}

window.ANR_Store = Store;
