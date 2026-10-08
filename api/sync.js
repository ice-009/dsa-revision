// Sync proxy: every device talks to GitHub through here, so no device needs a token.
// The token lives only in the Vercel env (GITHUB_TOKEN). Locked to the three sync files
// of one repo, GET and PUT only — it can't read or touch anything else on GitHub.
const REPO = process.env.SYNC_REPO || 'ice-009/dsa-revise-data';
const FILES = new Set(['progress.json', 'code.json', 'reviews.json']);
const ACCEPT = new Set(['application/vnd.github+json', 'application/vnd.github.raw+json']);
const MAX_BODY = 4 * 1024 * 1024;

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const path = String(req.query.path || '');
  if (!FILES.has(path)) return res.status(400).json({ error: 'unknown file' });
  if (req.method !== 'GET' && req.method !== 'PUT') return res.status(405).json({ error: 'method not allowed' });
  if (!process.env.GITHUB_TOKEN) return res.status(500).json({ error: 'sync server has no GitHub token' });

  const accept = ACCEPT.has(req.headers.accept) ? req.headers.accept : 'application/vnd.github+json';
  const init = {
    method: req.method,
    headers: { Accept: accept, Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'dsa-revise-sync' },
  };
  if (req.method === 'PUT') {
    const b = req.body || {};
    if (typeof b.content !== 'string' || b.content.length > MAX_BODY) return res.status(400).json({ error: 'bad body' });
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify({ message: String(b.message || 'Update').slice(0, 200), content: b.content, ...(b.sha ? { sha: String(b.sha) } : {}) });
  }

  let gh;
  try {
    gh = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, init);
  } catch (e) {
    return res.status(502).json({ error: 'GitHub unreachable' });
  }
  const text = await gh.text();
  const remaining = gh.headers.get('x-ratelimit-remaining');
  if (remaining) res.setHeader('x-ratelimit-remaining', remaining);
  res.status(gh.status).setHeader('Content-Type', gh.headers.get('content-type') || 'application/json');
  return res.send(text);
};
