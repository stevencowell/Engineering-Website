// Build full-text search index for Engineering Website
// This script extracts text content from HTML files and builds an inverted index
// Run with: node build-search-index.js

const fs = require('fs');
const path = require('path');

// List of HTML files to index
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

// Stop words to filter out common words
const stopWords = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'the', 'this', 'but', 'they', 'have',
  'had', 'what', 'said', 'each', 'which', 'their', 'time', 'if', 'up',
  'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would',
  'make', 'like', 'into', 'him', 'has', 'two', 'more', 'very', 'after',
  'words', 'long', 'than', 'first', 'been', 'call', 'who', 'oil', 'sit',
  'now', 'find', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part'
]);

// Extract text content from HTML
function extractText(html) {
  // Remove script and style tags
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Extract text from common content tags
  let text = '';
  
  // Get title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) text += titleMatch[1] + ' ';
  
  // Get h1-h6 headings (weighted more heavily)
  const headings = html.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi);
  if (headings) {
    headings.forEach(h => {
      const content = h.replace(/<[^>]+>/g, '').trim();
      if (content) text += content + ' ' + content + ' '; // Double weight for headings
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
  // Convert to lowercase and split into words
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word)); // Filter short words and stop words
  
  return words;
}

// Build inverted index
function buildIndex() {
  const index = {
    pages: [],
    wordIndex: {} // word -> [pageIndex, pageIndex, ...]
  };
  
  pagesToIndex.forEach((pageInfo, pageIndex) => {
    const filePath = path.join(__dirname, pageInfo.url);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: File not found: ${filePath}`);
      return;
    }
    
    try {
      const html = fs.readFileSync(filePath, 'utf8');
      const text = extractText(html);
      const words = tokenize(text);
      
      // Count word frequencies for this page
      const wordFreq = {};
      words.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });
      
      // Add to index
      index.pages.push({
        title: pageInfo.title,
        url: pageInfo.url,
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
      
      console.log(`Indexed: ${pageInfo.title} (${words.length} words)`);
    } catch (error) {
      console.error(`Error indexing ${filePath}:`, error.message);
    }
  });
  
  return index;
}

// Main execution
console.log('Building search index...\n');
const index = buildIndex();

// Save index to JSON file
const outputPath = path.join(__dirname, 'search-index.json');
fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));
console.log(`\nSearch index built successfully!`);
console.log(`Indexed ${index.pages.length} pages`);
console.log(`Found ${Object.keys(index.wordIndex).length} unique words`);
console.log(`Index saved to: ${outputPath}`);








