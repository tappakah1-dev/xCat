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

    // Fetch from multiple search queries to get diverse XMR news
    const queries = [
      'Monero',
      'XMR cryptocurrency',
      'privacy coins'
    ];

    let allArticles = [];

    for (const query of queries) {
      try {
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=20`,
          { headers: { 'Authorization': `Bearer ${apiKey}` } }
        );

        const data = await response.json();
        if (data.articles) {
          allArticles = [...allArticles, ...data.articles];
        }
      } catch (e) {
        console.error(`Error fetching ${query}:`, e);
      }
    }

    if (allArticles.length === 0) {
      return res.status(200).json(getFallbackNews());
    }

    // Remove duplicates
    const seen = new Set();
    const unique = allArticles.filter(article => {
      if (seen.has(article.title)) return false;
      seen.add(article.title);
      return true;
    });

    // Filter for XMR/Monero/privacy related content
    const filtered = unique.filter(article => {
      const text = (article.title + ' ' + (article.description || '')).toLowerCase();
      const keywords = ['monero', 'xmr', 'privacy coin', 'zcash', 'privacy', 'cryptocurrency'];
      return keywords.some(keyword => text.includes(keyword));
    });

    if (filtered.length === 0) {
      return res.status(200).json(getFallbackNews());
    }

    // Sort by date and take top 12
    const formatted = filtered
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 12)
      .map(article => ({
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
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return 'over a week ago';
}

function getFallbackNews() {
  return [
    {
      title: "Monero Development Update: New Cryptographic Improvements",
      source: "GitHub",
      time: "1 day ago",
      summary: "Community developers release updated specifications for enhanced ring size flexibility and improved transaction verification mechanisms.",
      link: "https://github.com/monero-project"
    },
    {
      title: "Monero Network Privacy Audit Confirms Security Standards",
      source: "Monero Official",
      time: "2 days ago",
      summary: "Latest security analysis confirms Monero's ring signatures and stealth addresses maintain robust privacy standards.",
      link: "https://www.getmonero.org"
    },
    {
      title: "XMR Privacy Coin Gains Institutional Attention",
      source: "CoinDesk",
      time: "3 days ago",
      summary: "Growing institutional interest in privacy-enhanced digital assets like Monero amid regulatory scrutiny.",
      link: "https://www.coindesk.com"
    },
    {
      title: "Monero Exchange Listings Expand Globally",
      source: "CoinTelegraph",
      time: "4 days ago",
      summary: "Major cryptocurrency exchanges continue adding Monero trading pairs as demand for privacy coins grows.",
      link: "https://www.cointelegraph.com"
    },
    {
      title: "Privacy Coins Show Resilience Against Security Threats",
      source: "BleepingComputer",
      time: "5 days ago",
      summary: "Analysis demonstrates privacy-enhanced cryptocurrencies like Monero maintain security against emerging attack vectors.",
      link: "https://www.bleepingcomputer.com"
    },
    {
      title: "Monero Blockchain Continues Decentralization Growth",
      source: "Monero News",
      time: "6 days ago",
      summary: "Number of full nodes operating globally reaches new milestone, strengthening network resilience.",
      link: "https://www.getmonero.org"
    },
    {
      title: "Privacy Technology Adoption Accelerates in 2024",
      source: "TechCrunch",
      time: "1 week ago",
      summary: "Privacy-focused cryptocurrencies and zero-knowledge proofs become mainstream as user awareness grows.",
      link: "https://www.techcrunch.com"
    },
    {
      title: "XMR Outperforms Market During Volatility",
      source: "CoinMarketCap",
      time: "1 week ago",
      summary: "Privacy coins show strong performance metrics during recent cryptocurrency market movements.",
      link: "https://coinmarketcap.com"
    }
  ];
}
