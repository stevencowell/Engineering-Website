// Search functionality for Engineering Website
// Searches across HTML pages and displays results

(function() {
  'use strict';

  // Comprehensive search index - covers all available pages and key topics
  const searchIndex = {
    pages: [
      { title: 'Stage 5 Engineering Home', url: 'index.html', keywords: 'engineering stage 5 year 9 year 10 course materials resources syllabus NESA' },
      { title: 'Year 9 Term 1: Structures', url: 'year9_term1.html', keywords: 'structures water tower concrete beam WHS forces materials corrosion testing' },
      { title: 'Year 9 Term 2: Materials & Tensegrity', url: 'year9_term2.html', keywords: 'tensegrity materials renewable energy buoyancy CAD Onshape submarine alternate energies' },
      { title: 'Year 9 Term 3: Mechanisms & Structures', url: 'year9_term3.html', keywords: 'mechanisms hydraulic digger lolly dispenser structures gears cams' },
      { title: 'Year 9 Term 4: Mechanisms', url: 'year9_term4.html', keywords: 'mechanisms geared lolly dispenser CAD timber materials' },
      { title: 'Toolkit 1: WHS & Risk Control', url: 'Year9 T1 Modules/module1.html', keywords: 'WHS safety OnGuard PPE hierarchy control DRABC risk management drill glue gun' },
      { title: 'Toolkit 2: Materials & Corrosion', url: 'Year9 T1 Modules/module2.html', keywords: 'materials corrosion metals polymers concrete damp proof course DPC saltwater experiments' },
      { title: 'Toolkit 3: Structural Concepts', url: 'Year9 T1 Modules/module3.html', keywords: 'forces loads trusses bridges SI units structural analysis dead live wind loads' },
      { title: 'Toolkit 4: Build, Test & Evaluate', url: 'Year9 T1 Modules/module4.html', keywords: 'water tower concrete beam testing evaluation folio load deflection failure' },
      { title: 'Tensegrity & Materials (T2 Toolkit 1)', url: 'Year9 T2 Modules/toolkit 1 Term 2.html', keywords: 'tensegrity tension compression struts cables materials testing' },
      { title: 'Alternate Energies (T2 Toolkit 2)', url: 'Year9 T2 Modules/toolkit 2 Term 2.html', keywords: 'renewable energy wind solar hydro sustainability efficiency' },
      { title: 'Geared Lolly Dispenser (T2 Toolkit 3)', url: 'Year9 T2 Modules/toolkit 3 Term 2.html', keywords: 'gears mechanisms compound gears cams controlled dispensing' },
      { title: 'CAD & Onshape (T2 Toolkit 4)', url: 'Year9 T2 Modules/toolkit 4 Term 2.html', keywords: 'CAD Onshape parametric modelling drawings design' }
    ]
  };

  function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    if (!searchInput || !searchResults) return;

    const query = searchInput.value.trim().toLowerCase();
    
    if (!query) {
      searchResults.innerHTML = '';
      return;
    }

    // Enhanced keyword matching - prioritizes exact matches and title matches
    const queryTerms = query.split(/\s+/).filter(term => term.length > 0);
    const results = searchIndex.pages
      .map(page => {
        const searchText = (page.title + ' ' + page.keywords).toLowerCase();
        let score = 0;
        
        // Exact phrase match gets highest score
        if (searchText.includes(query.toLowerCase())) {
          score += 100;
        }
        
        // Title matches get high score
        if (page.title.toLowerCase().includes(query.toLowerCase())) {
          score += 50;
        }
        
        // Count matching terms
        queryTerms.forEach(term => {
          if (searchText.includes(term)) {
            score += 10;
            // Title matches get bonus
            if (page.title.toLowerCase().includes(term)) {
              score += 5;
            }
          }
        });
        
        return { page, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.page);

    if (results.length === 0) {
      searchResults.innerHTML = `
        <div style="background: #fff; padding: 1.5rem; border-radius: 8px; text-align: center; color: #6c757d;">
          <p style="margin: 0; font-size: 1rem;">No results found for "${query}".</p>
          <p style="margin: 0.5rem 0 0; font-size: 0.9rem;">Try different keywords or check spelling.</p>
        </div>
      `;
      return;
    }

    const resultsHTML = results.map(page => `
      <div style="background: #fff; padding: 1.25rem; border-radius: 8px; margin-bottom: 0.75rem; box-shadow: 0 2px 6px rgba(0,0,0,0.08); transition: transform 0.2s ease;">
        <a href="${page.url}" style="text-decoration: none; color: inherit; display: block;">
          <h3 style="margin: 0 0 0.5rem; color: #0056b3; font-size: 1.1rem; font-weight: 600;">${page.title}</h3>
          <p style="margin: 0; color: #6c757d; font-size: 0.9rem;">${page.url}</p>
        </a>
      </div>
    `).join('');

    searchResults.innerHTML = `
      <div style="margin-bottom: 1rem; color: #fff; font-weight: 600;">
        Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"
      </div>
      ${resultsHTML}
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

  // Auto-search on input (debounced)
  let searchTimeout;
  document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performSearch, 300);
      });
    }
  });
})();

