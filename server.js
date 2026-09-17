const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'news_data.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Initial seed data if not present
const initialData = {
  breaking: {
    text: "Diplomats Reach Landmark Accord on Sovereign AI Oversight at Geneva Summit",
    url: "#leadStory",
    updatedAt: "8m ago",
    active: true
  },
  articles: [
    {
      id: "art-1",
      slot: "lead-anchor",
      category: "World & Technology",
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
      content: "<p>Deep-water wind installations have achieved reliable high-capacity output, defying early supply-chain skeptics.</p>"
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
      content: "<p>Office-to-residential conversions have surpassed initial projections as city tax incentives take hold.</p>"
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
      content: "<p>Laser routing on silicon wafer packages marks a monumental leap in computational energy efficiency.</p>"
    }
  ],
  opinions: [
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
  ]
};

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    return initialData;
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;

  // CORS headers for easy local testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- API ROUTES ---
  if (pathname === '/api/articles' && req.method === 'GET') {
    const data = loadData();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data.articles));
    return;
  }

  if (pathname === '/api/articles' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const newArticle = JSON.parse(body);
        const data = loadData();
        const existingIdx = data.articles.findIndex(a => a.id === newArticle.id);
        if (existingIdx >= 0) {
          data.articles[existingIdx] = { ...data.articles[existingIdx], ...newArticle };
        } else {
          data.articles.unshift(newArticle);
        }
        saveData(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, article: newArticle }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (pathname === '/api/breaking' && req.method === 'GET') {
    const data = loadData();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data.breaking));
    return;
  }

  if (pathname === '/api/breaking' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const alert = JSON.parse(body);
        const data = loadData();
        data.breaking = { ...data.breaking, ...alert, updatedAt: 'Just now' };
        saveData(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, breaking: data.breaking }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // --- STATIC FILE SERVING ---
  let filePath = '';
  if (pathname === '/' || pathname === '/index.html') {
    filePath = path.join(__dirname, 'index.html');
  } else if (pathname === '/admin' || pathname === '/admin.html') {
    filePath = path.join(__dirname, 'admin.html');
  } else {
    filePath = path.join(__dirname, pathname);
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1><p>The requested asset was not found.</p>');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`📰 ANR NEWS - The New York Times Style Platform`);
  console.log(`=======================================================`);
  console.log(`- Reader Frontend : http://localhost:${PORT}/`);
  console.log(`- Newsroom CMS    : http://localhost:${PORT}/admin`);
  console.log(`=======================================================`);
});
