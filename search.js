// Full-text search functionality for Engineering Website
// Builds an index and searches individual words

(function() {
  'use strict';

  let searchIndex = null;
  let indexLoaded = false;

  // List of pages to index
  const pagesToIndex = [
    { url: 'index.html', title: 'Stage 5 Engineering Home' },
    { url: 'year9_term1.html', title: 'Year 9 Term 1: Water Tower Project' },
    { url: 'year9_term2.html', title: 'Year 9 Term 2: Concrete Beam Project' },
    { url: 'year9_term3.html', title: 'Year 9 Term 3: Hydraulic Digger Project' },
    { url: 'year9_term4.html', title: 'Year 9 Term 4: Geared Lolly Dispenser Project' },
    { url: 'Year9 T1 Modules/module1.html', title: 'Toolkit 1: WHS & Risk Control (T1)' },
    { url: 'Year9 T1 Modules/module2.html', title: 'Toolkit 2: Structural Concepts (T1)' },
    { url: 'Year9 T1 Modules/module3.html', title: 'Toolkit 3: Water Tower Design & Planning (T1)' },
    { url: 'Year9 T1 Modules/module4.html', title: 'Toolkit 4: Water Tower Build, Test & Evaluate (T1)' },
    { url: 'Year9 T2 Modules/module1.html', title: 'Toolkit 1: Materials & Corrosion (T2)' },
    { url: 'Year9 T2 Modules/module2.html', title: 'Toolkit 2: Concrete & Composite Materials (T2)' },
    { url: 'Year9 T2 Modules/module3.html', title: 'Toolkit 3: Concrete Beam Design & Planning (T2)' },
    { url: 'Year9 T2 Modules/module4.html', title: 'Toolkit 4: Concrete Beam Casting, Test & Evaluate (T2)' },
    { url: 'Year9 T3 Modules/module1.html', title: 'Toolkit 1: Fluid Power & Mechanisms (T3)' },
    { url: 'Year9 T3 Modules/module2.html', title: 'Toolkit 2: Hydraulic Digger Design (T3)' },
    { url: 'Year9 T3 Modules/module3.html', title: 'Toolkit 3: Hydraulic Digger Build (T3)' },
    { url: 'Year9 T3 Modules/module4.html', title: 'Toolkit 4: Testing & Evaluation (T3)' },
    { url: 'Year9 T4 Modules/module1.html', title: 'Toolkit 1: Gear Systems & Mechanisms (T4)' },
    { url: 'Year9 T4 Modules/module2.html', title: 'Toolkit 2: Geared Lolly Dispenser Design (T4)' },
    { url: 'Year9 T4 Modules/module3.html', title: 'Toolkit 3: Build & Manufacture (T4)' },
    { url: 'Year9 T4 Modules/module4.html', title: 'Toolkit 4: Testing, Reliability & Evaluation (T4)' },
    { url: 'year9_term1_assessment.html', title: 'Term 1 Assessment: Water Tower Project' },
    { url: 'year9_term2_assessment.html', title: 'Term 2 Assessment: Task 1 - Concrete Beam' },
    { url: 'year9_term3_assessment.html', title: 'Term 3 Assessment: Hydraulic Digger Project' },
    { url: 'year9_term4_assessment.html', title: 'Term 4 Assessment: Task 2 - Geared Lolly Dispenser' },
    { url: 'year9_program_complete.html', title: 'Year 9 Complete Program - Scope & Sequence' }
  ];

  // Fallback keyword-based pages (works even if fetch is blocked, e.g., file://)
  const fallbackKeywordPages = [
    { title: 'Stage 5 Engineering Home', url: 'index.html', keywords: 'engineering stage 5 year 9 year 10 course materials resources syllabus NESA home overview introduction' },
    { title: 'Year 9 Term 1: Water Tower Project', url: 'year9_term1.html', keywords: 'water tower structures WHS forces structural concepts design build test evaluation' },
    { title: 'Year 9 Term 2: Concrete Beam Project', url: 'year9_term2.html', keywords: 'concrete beam materials corrosion composite materials casting testing evaluation reinforcement rebar' },
    { title: 'Year 9 Term 3: Hydraulic Digger Project', url: 'year9_term3.html', keywords: 'hydraulic digger fluid power Pascal principle mechanisms lever linkages build test' },
    { title: 'Year 9 Term 4: Geared Lolly Dispenser Project', url: 'year9_term4.html', keywords: 'geared lolly dispenser gear systems mechanisms CAD CAM build test reliability evaluation' },
    { title: 'Toolkit 1: WHS & Risk Control (T1)', url: 'Year9 T1 Modules/module1.html', keywords: 'WHS safety OnGuard PPE hierarchy control DRABC risk management drill glue gun' },
    { title: 'Toolkit 2: Structural Concepts (T1)', url: 'Year9 T1 Modules/module2.html', keywords: 'forces loads trusses bridges SI units structural analysis dead live wind loads tension compression buckling' },
    { title: 'Toolkit 3: Water Tower Design & Planning (T1)', url: 'Year9 T1 Modules/module3.html', keywords: 'water tower design brief layouts joints materials build sequence planning' },
    { title: 'Toolkit 4: Water Tower Build, Test & Evaluate (T1)', url: 'Year9 T1 Modules/module4.html', keywords: 'water tower build test evaluation folio load deflection failure' },
    { title: 'Toolkit 1: Materials & Corrosion (T2)', url: 'Year9 T2 Modules/module1.html', keywords: 'materials corrosion metals polymers concrete damp proof course DPC saltwater experiments' },
    { title: 'Toolkit 2: Concrete & Composite Materials (T2)', url: 'Year9 T2 Modules/module2.html', keywords: 'concrete composite materials mix design reinforcement curing properties' },
    { title: 'Toolkit 3: Concrete Beam Design & Planning (T2)', url: 'Year9 T2 Modules/module3.html', keywords: 'concrete beam design geometry mix planning casting sequence test procedures' },
    { title: 'Toolkit 4: Concrete Beam Casting, Test & Evaluate (T2)', url: 'Year9 T2 Modules/module4.html', keywords: 'concrete beam casting testing data analysis evaluation folio' },
    { title: 'Toolkit 1: Fluid Power & Mechanisms (T3)', url: 'Year9 T3 Modules/module1.html', keywords: 'fluid power hydraulic mechanisms Pascal principle mechanical advantage velocity ratio levers' },
    { title: 'Toolkit 2: Hydraulic Digger Design (T3)', url: 'Year9 T3 Modules/module2.html', keywords: 'hydraulic digger design brief lever geometry syringe sizing performance prediction' },
    { title: 'Toolkit 3: Hydraulic Digger Build (T3)', url: 'Year9 T3 Modules/module3.html', keywords: 'hydraulic digger build frame assembly hydraulic system bleeding air mounting' },
    { title: 'Toolkit 4: Testing & Evaluation (T3)', url: 'Year9 T3 Modules/module4.html', keywords: 'hydraulic digger testing data analysis efficiency evaluation folio' },
    { title: 'Toolkit 1: Gear Systems & Mechanisms (T4)', url: 'Year9 T4 Modules/module1.html', keywords: 'gear systems mechanisms gear ratios torque speed compound gears cams ratchets' },
    { title: 'Toolkit 2: Geared Lolly Dispenser Design (T4)', url: 'Year9 T4 Modules/module2.html', keywords: 'geared lolly dispenser design gear train cam ratchet materials selection CAD Onshape' },
    { title: 'Toolkit 3: Build & Manufacture (T4)', url: 'Year9 T4 Modules/module3.html', keywords: 'build manufacture CAD-CAM fabrication assembly guards safety' },
    { title: 'Toolkit 4: Testing, Reliability & Evaluation (T4)', url: 'Year9 T4 Modules/module4.html', keywords: 'testing reliability evaluation systematic testing data analysis folio showcase' },
    { title: 'Term 1 Assessment: Water Tower Project', url: 'year9_term1_assessment.html', keywords: 'assessment task notification term 1 water tower formative learning task folio requirements' },
    { title: 'Term 2 Assessment: Task 1 - Concrete Beam', url: 'year9_term2_assessment.html', keywords: 'assessment task notification term 2 concrete beam summative task 1 folio requirements' },
    { title: 'Term 3 Assessment: Hydraulic Digger Project', url: 'year9_term3_assessment.html', keywords: 'assessment task notification term 3 hydraulic digger formative learning task folio requirements' },
    { title: 'Term 4 Assessment: Task 2 - Geared Lolly Dispenser', url: 'year9_term4_assessment.html', keywords: 'assessment task notification term 4 geared lolly dispenser summative task 2 folio requirements' },
    { title: 'Year 9 Complete Program - Scope & Sequence', url: 'year9_program_complete.html', keywords: 'program scope sequence week-by-week outcomes mapping assessment schedule resources' }
  ];

  // Stop words to filter out
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'this', 'but', 'they', 'have',
    'had', 'what', 'said', 'each', 'which', 'their', 'time', 'if', 'up',
    'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would',
    'make', 'like', 'into', 'him', 'two', 'more', 'very', 'after',
    'words', 'long', 'than', 'first', 'been', 'call', 'who', 'oil', 'sit',
    'now', 'find', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part',
    'can', 'could', 'should', 'when', 'where', 'how', 'why', 'all', 'any'
  ]);

  // Extract text content from HTML
  function extractText(html) {
    // Remove script and style tags
    html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    let text = '';
    
    // Get title (weighted heavily)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      const titleText = titleMatch[1].replace(/<[^>]+>/g, '').trim();
      text += titleText + ' ' + titleText + ' ' + titleText + ' '; // Triple weight
    }
    
    // Get h1-h6 headings (weighted)
    const headings = html.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi);
    if (headings) {
      headings.forEach(h => {
        const content = h.replace(/<[^>]+>/g, '').trim();
        if (content) text += content + ' ' + content + ' '; // Double weight
      });
    }
    
    // Get paragraph text
    const paragraphs = html.match(/<p[^>]*>([^<]+)<\/p>/gi);
    if (paragraphs) {
      paragraphs.forEach(p => {
        const content = p.replace(/<[^>]+>/g, '').trim();
        if (content) text += content + ' ';
      });
    }
    
    // Get list items
    const listItems = html.match(/<li[^>]*>([^<]+)<\/li>/gi);
    if (listItems) {
      listItems.forEach(li => {
        const content = li.replace(/<[^>]+>/g, '').trim();
        if (content) text += content + ' ';
      });
    }
    
    // Get strong/bold text (weighted)
    const strong = html.match(/<strong[^>]*>([^<]+)<\/strong>/gi);
    if (strong) {
      strong.forEach(s => {
        const content = s.replace(/<[^>]+>/g, '').trim();
        if (content) text += content + ' ' + content + ' '; // Double weight
      });
    }
    
    // Get all remaining text content
    html = html.replace(/<[^>]+>/g, ' ');
    html = html.replace(/&nbsp;/g, ' ');
    html = html.replace(/&amp;/g, '&');
    html = html.replace(/&lt;/g, '<');
    html = html.replace(/&gt;/g, '>');
    html = html.replace(/&quot;/g, '"');
    html = html.replace(/&#39;/g, "'");
    text += html;
    
    return text;
  }

  // Tokenize text into words
  function tokenize(text) {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  // Build inverted index
  function buildIndex(pagesData) {
    const index = {
      pages: [],
      wordIndex: {} // word -> [{pageIndex, frequency}, ...]
    };
    
    pagesData.forEach((pageData, pageIndex) => {
      const text = extractText(pageData.html);
      const words = tokenize(text);
      
      // Count word frequencies
      const wordFreq = {};
      words.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });
      
      // Add page info
      index.pages.push({
        title: pageData.title,
        url: pageData.url,
        wordCount: words.length
      });
      
      // Build inverted index
      Object.keys(wordFreq).forEach(word => {
        if (!index.wordIndex[word]) {
          index.wordIndex[word] = [];
        }
        index.wordIndex[word].push({
          pageIndex: pageIndex,
          frequency: wordFreq[word]
        });
      });
    });
    
    return index;
  }

  // Load index from pre-built JSON file or build it
  async function loadIndex() {
    if (indexLoaded && searchIndex) return searchIndex;
    
    try {
      // Try to load pre-built index first
      const response = await fetch('search-index.json');
      if (response.ok) {
        const data = await response.json();
        if (data && data.pages && data.wordIndex) {
          searchIndex = data;
          indexLoaded = true;
          console.log('Search index loaded:', Object.keys(data.wordIndex).length, 'words');
          return searchIndex;
        }
      } else {
        console.warn('Could not load search-index.json, status:', response.status);
      }
    } catch (e) {
      console.warn('Error loading search-index.json:', e.message);
      // Index file doesn't exist, will build dynamically
    }
    
    // If running from file://, fetch for HTML pages will likely fail.
    // In that case, fall back to a keyword-only index so search still works.
    const isFileProtocol = window.location.protocol === 'file:';
    
    // Build index dynamically by fetching pages
    const pagesData = [];
    
    if (!isFileProtocol) {
      for (const pageInfo of pagesToIndex) {
        try {
          const response = await fetch(pageInfo.url);
          if (response.ok) {
            const html = await response.text();
            pagesData.push({
              title: pageInfo.title,
              url: pageInfo.url,
              html: html
            });
          }
        } catch (e) {
          console.warn('Could not fetch:', pageInfo.url);
        }
      }
    }
    
    if (pagesData.length > 0) {
      searchIndex = buildIndex(pagesData);
      indexLoaded = true;
      return searchIndex;
    }
    
    // Fallback: build a lightweight index from keywords only (works offline/file://)
    const fallbackPagesData = fallbackKeywordPages.map(p => ({
      title: p.title,
      url: p.url,
      html: `${p.title}. ${p.keywords}`
    }));
    searchIndex = buildIndex(fallbackPagesData);
    indexLoaded = true;
    console.warn('Using fallback keyword-only search index (no page fetch available).');
    return searchIndex;
  }

  // Search function using inverted index
  async function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    if (!searchInput || !searchResults) return;

    const query = searchInput.value.trim().toLowerCase();
    
    if (!query) {
      searchResults.innerHTML = '';
      return;
    }

    // Ensure index is loaded
    if (!indexLoaded || !searchIndex) {
      searchResults.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 1rem;">Loading search index...</div>';
      try {
        await loadIndex();
        // Retry search after index loads
        if (indexLoaded && searchIndex) {
          performSearch();
        } else {
          searchResults.innerHTML = '<div style="text-align: center; color: #dc3545; padding: 1rem;">Error loading search index. Please refresh the page.</div>';
        }
      } catch (error) {
        console.error('Error loading index:', error);
        searchResults.innerHTML = '<div style="text-align: center; color: #dc3545; padding: 1rem;">Error loading search index. Please refresh the page.</div>';
      }
      return;
    }

    // Tokenize query into individual words
    const queryWords = tokenize(query);
    
    if (queryWords.length === 0) {
      searchResults.innerHTML = `
        <div style="background: #fff; padding: 1.5rem; border-radius: 8px; text-align: center; color: #6c757d;">
          <p style="margin: 0; font-size: 1rem;">Please enter a search term (minimum 3 characters).</p>
        </div>
      `;
      return;
    }
    
    // Debug: log search query and words (can be removed in production)
    if (console && console.log) {
      console.log('Search query:', query);
      console.log('Tokenized words:', queryWords);
      console.log('Index available:', !!searchIndex);
      if (searchIndex && searchIndex.wordIndex) {
        console.log('Words in index:', Object.keys(searchIndex.wordIndex).length);
        queryWords.forEach(word => {
          const matches = searchIndex.wordIndex[word] || [];
          console.log(`Word "${word}": ${matches.length} matches`);
        });
      } else {
        console.error('Search index not properly loaded!');
      }
    }

    // Verify index structure
    if (!searchIndex || !searchIndex.wordIndex || !searchIndex.pages) {
      searchResults.innerHTML = `
        <div style="background: #fff; padding: 1.5rem; border-radius: 8px; text-align: center; color: #dc3545;">
          <p style="margin: 0; font-size: 1rem;">Search index not loaded. Please refresh the page.</p>
        </div>
      `;
      return;
    }

    // Score pages based on word matches
    const pageScores = {};
    
    queryWords.forEach(word => {
      const matches = searchIndex.wordIndex[word] || [];
      if (matches.length === 0 && console && console.log) {
        console.log(`No matches found for word: "${word}"`);
      }
      matches.forEach(match => {
        const pageIndex = match.pageIndex;
        if (!pageScores[pageIndex]) {
          pageScores[pageIndex] = {
            score: 0,
            matchedWords: new Set(),
            wordFrequencies: {}
          };
        }
        pageScores[pageIndex].score += match.frequency;
        pageScores[pageIndex].matchedWords.add(word);
        pageScores[pageIndex].wordFrequencies[word] = match.frequency;
      });
    });

    // Boost scores for:
    // 1. Title matches
    // 2. Multiple word matches
    // 3. Exact phrase matches
    Object.keys(pageScores).forEach(pageIndex => {
      const page = searchIndex.pages[pageIndex];
      const scoreData = pageScores[pageIndex];
      
      // Title match boost
      const titleLower = page.title.toLowerCase();
      queryWords.forEach(word => {
        if (titleLower.includes(word)) {
          scoreData.score += 50;
        }
      });
      
      // Multiple word match boost
      if (scoreData.matchedWords.size > 1) {
        scoreData.score += scoreData.matchedWords.size * 20;
      }
      
      // Exact phrase match boost
      if (titleLower.includes(query)) {
        scoreData.score += 100;
      }
    });

    // Convert to array and sort by score
    const results = Object.keys(pageScores)
      .map(pageIndex => ({
        page: searchIndex.pages[pageIndex],
        score: pageScores[pageIndex].score,
        matchedWords: Array.from(pageScores[pageIndex].matchedWords)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    if (results.length === 0) {
      searchResults.innerHTML = `
        <div style="background: #fff; padding: 1.5rem; border-radius: 8px; text-align: center; color: #6c757d;">
          <p style="margin: 0; font-size: 1rem;">No results found for "${query}".</p>
          <p style="margin: 0.5rem 0 0; font-size: 0.9rem;">Try different keywords or check spelling.</p>
        </div>
      `;
      return;
    }

    // Limit to top 15 results
    const topResults = results.slice(0, 15);
    
    const resultsHTML = topResults.map(result => {
      const { page, matchedWords } = result;
      
      // Highlight matching words in title
      let displayTitle = page.title;
      matchedWords.forEach(word => {
        const regex = new RegExp(`\\b(${word})\\b`, 'gi');
        displayTitle = displayTitle.replace(regex, '<strong>$1</strong>');
      });
      
      // Show matched words as tags
      const matchedWordsText = matchedWords.slice(0, 5).join(', ');
      
      return `
      <div style="background: #fff; padding: 1.25rem; border-radius: 8px; margin-bottom: 0.75rem; box-shadow: 0 2px 6px rgba(0,0,0,0.08); transition: transform 0.2s ease;">
        <a href="${page.url}" style="text-decoration: none; color: inherit; display: block;">
            <h3 style="margin: 0 0 0.5rem; color: #0056b3; font-size: 1.1rem; font-weight: 600;">${displayTitle}</h3>
            <p style="margin: 0 0 0.25rem; color: #6c757d; font-size: 0.85rem;">${page.url}</p>
            <p style="margin: 0; color: #999; font-size: 0.8rem; font-style: italic;">Matched: ${matchedWordsText}</p>
        </a>
      </div>
      `;
    }).join('');

    const moreResultsText = results.length > 15 ? `<p style="margin-top: 1rem; color: #6c757d; font-size: 0.9rem; text-align: center;">Showing top 15 of ${results.length} results</p>` : '';

    searchResults.innerHTML = `
      <div style="margin-bottom: 1rem; color: #fff; font-weight: 600;">
        Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"
      </div>
      ${resultsHTML}
      ${moreResultsText}
    `;

    // Add hover effects
    const resultLinks = searchResults.querySelectorAll('a');
    resultLinks.forEach(link => {
      link.addEventListener('mouseenter', function() {
        this.parentElement.style.transform = 'translateX(4px)';
        this.parentElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
      });
      link.addEventListener('mouseleave', function() {
        this.parentElement.style.transform = 'translateX(0)';
        this.parentElement.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
      });
    });
  }

  // Make function available globally
  window.performSearch = performSearch;

  // Initialize index on page load
  document.addEventListener('DOMContentLoaded', function() {
    // Pre-load index immediately
    loadIndex().catch(error => {
      console.error('Failed to load search index:', error);
    });
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      // Auto-search on input (debounced)
      let searchTimeout;
      searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          performSearch().catch(error => {
            console.error('Search error:', error);
            const searchResults = document.getElementById('search-results');
            if (searchResults) {
              searchResults.innerHTML = '<div style="text-align: center; color: #dc3545; padding: 1rem;">Search error occurred. Please try again.</div>';
            }
          });
        }, 300);
      });
    }
  });
})();
