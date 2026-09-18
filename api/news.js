export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const apiKey = process.env.NEWS_API_KEY;
    
    if (!apiKey) {
      return res.status(200).json(getFallbackNews());
    }

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=Monero%20XMR&sortBy=publishedAt&language=en&pageSize=10`,
      { headers: { 'Authorization': `Bearer ${apiKey}` } }
    );

    const data = await response.json();
    
    if (!data.articles || data.articles.length === 0) {
      return res.status(200).json(getFallbackNews());
    }

    const formatted = data.articles.slice(0, 8).map(article => ({
      title: article.title,
      summary: article.description || 'Read more...',
      source: article.source.name,
      time: getRelativeTime(new Date(article.publishedAt)),
      link: article.url || 'https://www.getmonero.org'
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Error:', error);
    res.status(200).json(getFallbackNews());
  }
}

function getRelativeTime(date) {
  const diffMs = new Date() - date;
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

function getFallbackNews() {
  return [
    {
      title: "Monero Development Update",
      source: "GitHub",
      time: "1 day ago",
      summary: "Latest cryptographic improvements and security enhancements.",
      link: "https://github.com/monero-project"
    },
    {
      title: "Privacy Coins Surge in Adoption",
      source: "CoinDesk",
      time: "2 days ago",
      summary: "Growing institutional interest in privacy-enhanced digital assets.",
      link: "https://www.coindesk.com"
    },
    {
      title: "Monero Network Resilience Report",
      source: "Monero Official",
      time: "3 days ago",
      summary: "Analysis confirms robust security and privacy mechanisms.",
      link: "https://www.getmonero.org"
    }
  ];
}
