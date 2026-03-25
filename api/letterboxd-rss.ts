export default async function handler(req: any, res: any) {
  const { username, type } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const url = type === 'watchlist'
    ? `https://letterboxd.com/${username}/watchlist/rss/`
    : `https://letterboxd.com/${username}/rss/`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });

    if (!response.ok) {
        return res.status(response.status).json({ error: `Letterboxd returned ${response.status} ${response.statusText}` });
    }

    const xml = await response.text();

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cache-Control', 'max-age=0, s-maxage=3600');
    
    return res.status(200).send(xml);
  } catch (error: any) {
    console.error('RSS Fetch Error:', error);
    return res.status(500).json({ error: 'Failed to fetch RSS feed from Letterboxd' });
  }
}
