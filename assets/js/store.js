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
    category: "ការស៊ើបអង្កេតពិសេស",
    headline: "កិច្ចព្រមព្រៀងជាប្រវត្តិសាស្ត្រស្តីពីការគ្រប់គ្រងបញ្ញាសិប្បនិម្មិតឆ្លងដែន ត្រូវបានអនុម័តនៅទីក្រុងហ្សឺណែវ",
    deck: "គណៈប្រតិភូមកពី ៤២ ប្រទេសបានឈានដល់ការសម្រុះសម្រួលលើក្របខ័ណ្ឌច្បាប់តឹងរ៉ឹងសម្រាប់ប្រព័ន្ធស្វ័យប្រវត្តិកម្ម បន្ទាប់ពីការចរចារយ៉ាងស្វិតស្វាញរយៈពេល ១៥ ខែ។",
    author: "ដាវីឌ សាងហ្គឺ និង ជូលៀន បារនេស",
    readTime: "អាន ៨ នាទី",
    date: "ថ្ងៃទី១៧ ខែកញ្ញា ឆ្នាំ២០២៦",
    audio: {
      narrator: "សម មករា",
      duration: "៧:១៤"
    },
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1000&q=80",
    caption: "គណៈប្រតិភូនានាជួបប្រជុំគ្នានៅវិមាន Palais des Nations ក្នុងទីក្រុងហ្សឺណែវ មុនពេលការបោះឆ្នោតចុងក្រោយកាលពីព្រឹកថ្ងៃព្រហស្បតិ៍។",
    credit: "អាន់ឌ្រូ ថេស្តា សម្រាប់ The Chronicle Times",
    status: "published",
    wordCount: 1420,
    content: `
      <p class="drop-cap">គណៈប្រតិភូមកពី ៤២ ប្រទេសបានឈានដល់ការសម្រុះសម្រួលជាប្រវត្តិសាស្ត្រនៅព្រឹកថ្ងៃព្រហស្បតិ៍នេះ ស្តីពីយុត្តាធិការអធិបតេយ្យភាពលើកិច្ចសន្យាពាណិជ្ជកម្មឆ្លងដែនដែលដំណើរការដោយក្បួនដោះស្រាយ (Algorithm) បន្ទាប់ពីកិច្ចប្រជុំបិទទ្វារដ៏តានតឹងជាងមួយឆ្នាំនៅទីស្នាក់ការអង្គការសហប្រជាជាតិ។</p>
      <p>សន្ធិសញ្ញានេះ ដែលទាមទារឱ្យមានការផ្តល់សច្ចាប័នពីសភានៃប្រទេសជាសមាជិកក្នុងរយៈពេល ១៨ ខែខាងមុខ បានកំណត់បទប្បញ្ញត្តិជាសកលមួយថា៖ រាល់ប្រតិបត្តិការស្វ័យប្រវត្តដែលលើសពី ៥ លានដុល្លារ ត្រូវតែមានមន្ត្រីអនុលោមភាពជាមនុស្សពិតប្រាកដចុះហត្ថលេខាលើប្រព័ន្ធ Cryptographic Ledger។</p>
      <blockquote class="nyt-pull-quote">«យើងមិនអាចបណ្តែតបណ្តោយឱ្យមានចន្លោះប្រហោងផ្លូវច្បាប់ ដែលទំនិញតម្លៃរាប់ពាន់លានដុល្លារផ្លាស់ប្តូរដៃគ្នាក្នុងរយៈពេលប៉ុន្មានមីលីវិនាទី ដោយគ្មានការទទួលខុសត្រូវផ្លូវច្បាប់ច្បាស់លាស់នោះឡើយ។»</blockquote>
      <p>ទិន្នន័យដំបូងបង្ហាញថាជាង ៤០ ភាគរយនៃប្រតិបត្តិការទិញលក់ទំនិញស្តង់ដារក្នុងវិស័យយានយន្ត និងអេឡិចត្រូនិក ឥឡូវនេះត្រូវបានអនុម័តដោយភ្នាក់ងារសូហ្វវែរស្វ័យប្រវត្តិ។</p>
      <p>ទោះបីជាល្បឿននៃប្រតិបត្តិការបានកើនឡើងរហ័សយ៉ាងណាក្តី ក៏បញ្ហាប្រឈមនៃហានិភ័យប្រព័ន្ធនៅតែបន្តកើតមាន។ និយតករទូទាំងពិភពលោកកំពុងរៀបចំសេចក្តីព្រាងពិធីសារដើម្បីពង្រឹងការតាមដានដែលអាចផ្ទៀងផ្ទាត់បាន និងការគ្រប់គ្រងដោយមនុស្ស។</p>
    `
  },
  {
    id: "art-2",
    slot: "secondary-1",
    category: "បរិស្ថាន & ថាមពល",
    headline: "ភាពជោគជ័យនៃកសិដ្ឋានខ្យល់បក់លើផ្ទៃសមុទ្រជ្រៅ ចំពេលវិបត្តិខ្សែច្រវាក់ផ្គត់ផ្គង់",
    deck: "បច្ចេកវិទ្យាវេទិកាបណ្តែតទឹកថ្មីនៅឆ្នេរសមុទ្រស្កុតឡែន និងអាមេរិក បង្ហាញពីប្រាក់ចំណេញខ្ពស់ និងការផ្គត់ផ្គង់អគ្គិសនីប្រកបដោយស្ថិរភាព បើទោះបីជាតម្លៃដែកថែបហក់ឡើងខ្ពស់ក៏ដោយ។",
    author: "ប្រេដ ផ្លូម័រ",
    readTime: "អាន ៥ នាទី",
    date: "ថ្ងៃទី១៧ ខែកញ្ញា ឆ្នាំ២០២៦",
    image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=400&q=80",
    status: "published",
    wordCount: 850,
    content: "<p>ការដំឡើងទួរប៊ីនខ្យល់នៅតំបន់សមុទ្រជ្រៅទទួលបានទិន្នផលថាមពលគួរឱ្យកត់សម្គាល់ ដែលជាការឆ្លើយតបយ៉ាងច្បាស់ទៅកាន់អ្នករិះគន់តាមរយៈបច្ចេកវិទ្យាវិស្វកម្មទំនើប។</p>"
  },
  {
    id: "art-3",
    slot: "secondary-2",
    category: "សេដ្ឋកិច្ច & ទីផ្សារ",
    headline: "ការកែច្នៃអគារពាណិជ្ជកម្មចាស់ៗឱ្យទៅជាខុនដូរស់នៅ៖ គំរូសេដ្ឋកិច្ចថ្មីដែលទទួលបានជោគជ័យ",
    deck: "ការបន្ធូរបន្ថយពន្ធ និងបច្ចេកវិទ្យាកាត់បន្ថយថ្លៃដើមសំណង់ បានបង្កើតលំនៅឋានថ្មីជាង ១៨,០០០ យូនីត នៅកណ្តាលទីក្រុងធំៗ។",
    author: "ស្តេហ្វាណូស ឆេន",
    readTime: "អាន ៦ នាទី",
    date: "ថ្ងៃទី១៧ ខែកញ្ញា ឆ្នាំ២០២៦",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80",
    status: "published",
    wordCount: 1100,
    content: "<p>ការកែច្នៃអគារការិយាល័យទៅជាលំនៅឋានបានកើនឡើងលើសពីការរំពឹងទុកដំបូង ដោយសារតែការលើកទឹកចិត្តពន្ធរបស់រដ្ឋាភិបាល និងការកែសម្រួលច្បាប់រៀបចំដែនដី។</p>"
  },
  {
    id: "art-4",
    slot: "secondary-3",
    category: "បច្ចេកវិទ្យា & AI",
    headline: "បច្ចេកវិទ្យា Silicon Photonics ចូលមកជំនួសខ្សែស្ពាន់ក្នុងមជ្ឈមណ្ឌលទិន្នន័យខ្នាតយក្ស",
    deck: "ការបញ្ជូនទិន្នន័យតាមរយៈពន្លឺឡាស៊ែរជួយកាត់បន្ថយកម្ដៅ និងការប្រើប្រាស់ថាមពលអគ្គិសនីបានដល់ទៅ ៣៥ ភាគរយ នៅក្នុងបណ្តាញ Server ទូទាំងពិភពលោក។",
    author: "ខេដ មេត្ស",
    readTime: "អាន ៤ នាទី",
    date: "ថ្ងៃទី១៧ ខែកញ្ញា ឆ្នាំ២០២៦",
    image: null,
    status: "published",
    wordCount: 920,
    content: "<p>ការបញ្ជូនទិន្នន័យដោយប្រើឡាស៊ែរនៅលើបន្ទះ Silicon បង្ហាញពីការបោះជំហានដ៏ធំមួយក្នុងការសន្សំសំចៃថាមពលកុំព្យូទ័រនៅទូទាំងបណ្តាញក្លោដ។</p>"
  }
];

const SEED_BREAKING = {
  text: "ដំណឹងបន្ទាន់៖ ប្រទេសជាសមាជិកអង្គការសហប្រជាជាតិបានអនុម័តសន្ធិសញ្ញាជាប្រវត្តិសាស្ត្រស្តីពីការគ្រប់គ្រង AI នាទីក្រុងហ្សឺណែវ",
  url: "#",
  updatedAt: "៨ នាទីមុន",
  active: true
};

const SEED_OPINIONS = [
  {
    id: "op-1",
    author: "ម៉ូរីន ដាវដ៍",
    headline: "ភាពឯកោនៃអំណាចសម័យទំនើប និងស្រមោលនៅក្នុងវិស័យការទូតស្វ័យប្រវត្តិ",
    readTime: "អាន ៧ នាទី",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "op-2",
    author: "ដាវីឌ ប្រូក្ស",
    headline: "ហេតុអ្វីគុណធម៌ និងសីលធម៌កាន់តែមានតម្លៃបំផុតនៅក្នុងយុគសម័យក្បួនដោះស្រាយ",
    readTime: "អាន ៥ នាទី",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "op-3",
    author: "ផល គ្រូកមែន",
    headline: "កុំមើលស្រាលគោលនយោបាយឧស្សាហកម្មថ្មី និងការវិនិយោគលើថាមពលបៃតង",
    readTime: "អាន ៦ នាទី",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
  }
];

const DEFAULT_SITE_SETTINGS = {
  siteName: "សារព័ត៌មាន អេអិនអ័រ",
  tagline: "«ព័ត៌មានពិត សុក្រឹត និងស៊ីជម្រៅ»",
  edition: "ការផ្សាយសកល — ភ្នំពេញ ញូវយ៉ក ឡុងដ៍ ប៉ារីស",
  categories: [
    "សកលលោក",
    "នយោបាយ",
    "សេដ្ឋកិច្ច & ទីផ្សារ",
    "បច្ចេកវិទ្យា & AI",
    "បរិស្ថាន & ថាមពល",
    "វិទ្យាសាស្ត្រ",
    "សុខភាព",
    "កីឡា",
    "ទស្សនៈ & វិចារណកថា",
    "វប្បធម៌ & សិល្បៈ"
  ]
};

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
    if (local) {
      try {
        const parsed = JSON.parse(local);
        // Guarantee authentic Khmer articles (ignore old English cache)
        if (Array.isArray(parsed) && parsed.length > 0 && /[\u1780-\u17FF]/.test(parsed[0].headline)) {
          return parsed;
        }
      } catch (e) {}
    }
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

  async deleteArticle(articleId) {
    if (this.hasFirebase && this.firestoreDb) {
      try {
        await this.firestoreDb.collection('articles').doc(articleId).delete();
        console.log('⚡ Deleted article from Google Cloud Firestore:', articleId);
      } catch (e) {
        console.warn('Firestore delete failed:', e);
      }
    }

    if (this.isHttp) {
      try {
        await fetch(`/api/articles/${articleId}`, { method: 'DELETE' });
      } catch (e) {
        console.warn('API delete error:', e);
      }
    }

    const currentArticles = (await this.getArticles()).filter(a => a.id !== articleId);
    localStorage.setItem('ANR_NEWS_ARTICLES', JSON.stringify(currentArticles));
    this.notifyUpdate();
    return true;
  },

  async getSiteSettings() {
    if (this.hasFirebase && this.firestoreDb) {
      try {
        const doc = await this.firestoreDb.collection('settings').doc('site').get();
        if (doc.exists) return { ...DEFAULT_SITE_SETTINGS, ...doc.data() };
      } catch (e) {
        console.warn('Firestore settings read error:', e);
      }
    }
    const local = localStorage.getItem('ANR_SITE_SETTINGS');
    if (local) return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(local) };
    return DEFAULT_SITE_SETTINGS;
  },

  async saveSiteSettings(settings) {
    const merged = { ...DEFAULT_SITE_SETTINGS, ...settings };
    if (this.hasFirebase && this.firestoreDb) {
      try {
        await this.firestoreDb.collection('settings').doc('site').set(merged, { merge: true });
      } catch (e) {
        console.warn('Firestore settings write error:', e);
      }
    }
    localStorage.setItem('ANR_SITE_SETTINGS', JSON.stringify(merged));
    this.notifyUpdate();
    return merged;
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
