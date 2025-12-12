// Search functionality for Engineering Website
// Searches across HTML pages and displays results

(function() {
  'use strict';

  // Comprehensive search index - covers all available pages and key topics
  const searchIndex = {
    pages: [
      { title: 'Stage 5 Engineering Home', url: 'index.html', keywords: 'engineering stage 5 year 9 year 10 course materials resources syllabus NESA' },
      { title: 'Year 9 Term 1: Water Tower Project', url: 'year9_term1.html', keywords: 'water tower structures WHS forces structural concepts design build test evaluation' },
      { title: 'Year 9 Term 2: Concrete Beam Project', url: 'year9_term2.html', keywords: 'concrete beam materials corrosion composite materials casting testing evaluation' },
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
      { title: 'Toolkit 4: Testing, Reliability & Evaluation (T4)', url: 'Year9 T4 Modules/module4.html', keywords: 'testing reliability evaluation systematic testing data analysis folio showcase' }
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

