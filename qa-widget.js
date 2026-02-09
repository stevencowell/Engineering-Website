// qa-widget.js - interactive quiz logic (shared across toolkits)
(function () {
  const DEFAULT_MIN_WORDS_BEFORE_REVEAL = 5;
  const DEFAULT_MIN_KEY_TERMS_BEFORE_REVEAL = 0;

  function slugify(s) {
    return String(s || '')
      .toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 64) || 'quiz';
  }

  function safeParse(json) {
    try { return JSON.parse(json); } catch (e) { return null; }
  }

  function safeGetStore(storageKey) {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? safeParse(raw) : null;
      if (!parsed || typeof parsed !== 'object') return { version: 1, items: {}, updatedAt: null };
      if (!parsed.items || typeof parsed.items !== 'object') parsed.items = {};
      return parsed;
    } catch (e) {
      return { version: 1, items: {}, updatedAt: null, __disabled: true };
    }
  }

  function safeSetStore(storageKey, store) {
    try {
      store.updatedAt = new Date().toISOString();
      localStorage.setItem(storageKey, JSON.stringify(store));
      return true;
    } catch (e) {
      return false;
    }
  }

  function escapeHtml(text) {
    return String(text ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getThemeVars() {
    try {
      const styles = window.getComputedStyle(document.documentElement);
      const getVar = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
      return {
        brand: getVar('--brand', '#0056b3'),
        text: getVar('--text', '#1f2a3d'),
        muted: getVar('--muted', '#5c667a'),
        border: getVar('--border', '#e2e8f0'),
      };
    } catch (e) {
      return { brand: '#0056b3', text: '#1f2a3d', muted: '#5c667a', border: '#e2e8f0' };
    }
  }

  function scoreLabel(score) {
    switch (score) {
      case 3: return '3 – Fully correct';
      case 2: return '2 – Mostly correct';
      case 1: return '1 – Partly correct';
      case 0: return '0 – Not yet';
      default: return null;
    }
  }

  const metaState = {}; // qaId -> { wordCountText?: string, keywordCountText?: string, statusText?: string }

  function setMeta(qaId, partial) {
    if (!qaId) return;
    metaState[qaId] = { ...(metaState[qaId] || {}), ...(partial || {}) };
    const el = document.querySelector(`[data-qa-meta-for="${qaId}"]`);
    if (!el) return;
    const wc = metaState[qaId].wordCountText;
    const kc = metaState[qaId].keywordCountText;
    const status = metaState[qaId].statusText;
    el.textContent = [wc, kc, status].filter(Boolean).join(' | ');
  }

  function wordCount(text) {
    return String(text || '').trim().split(/\s+/).filter(Boolean).length;
  }

  function normaliseWord(w) {
    return String(w || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .trim();
  }

  const keywordStop = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'you', 'your', 'are', 'can', 'should', 'must',
    'why', 'what', 'how', 'when', 'where', 'before', 'after', 'then', 'than', 'from', 'into',
    'need', 'using', 'use', 'used', 'have', 'has', 'had', 'does', 'do', 'did', 'not',
    'a', 'an', 'to', 'of', 'in', 'on', 'at', 'is', 'it', 'its', 'be', 'as', 'or',
  ]);

  function extractKeywords(questionText) {
    const raw = String(questionText || '').replace(/[^\w\s']/g, ' ');
    const parts = raw.split(/\s+/).filter(Boolean);
    const kws = [];
    for (const p of parts) {
      const n = normaliseWord(p);
      if (!n) continue;
      if (keywordStop.has(n)) continue;
      if (n.length >= 4 || ['whs', 'ppe', 'swms', 'drabc', 'onguard', 'cpr', 'dpc'].includes(n)) {
        kws.push(n);
      }
    }
    const seen = new Set();
    return kws.filter((k) => (seen.has(k) ? false : (seen.add(k), true)));
  }

  function countKeywordMatches(answerText, keywords) {
    const ans = String(answerText || '').toLowerCase();
    let count = 0;
    for (const k of (keywords || [])) {
      if (!k) continue;
      const re = new RegExp(`\\b${k.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'i');
      if (re.test(ans)) count++;
    }
    return count;
  }

  function updateAttemptMeta({ qaId, response, questionText, minWords, minKeyTerms }) {
    const wc = wordCount(response);
    const keywords = extractKeywords(questionText);
    const matched = countKeywordMatches(response, keywords);
    setMeta(qaId, {
      wordCountText: `Word count: ${wc}/${minWords}`,
      keywordCountText: minKeyTerms > 0 ? `Key terms: ${matched}/${minKeyTerms}` : null,
    });
    return { wc, matched };
  }

  function updateProgressSummary(summaryEl, qaIds, store) {
    const progressEl = summaryEl ? summaryEl.querySelector('[data-qa-progress-text]') : null;
    const avgEl = summaryEl ? summaryEl.querySelector('[data-qa-average-text]') : null;

    const scores = (qaIds || [])
      .map((id) => {
        const v = store.items && store.items[id] ? store.items[id] : null;
        return v && typeof v.score === 'number' ? v.score : null;
      })
      .filter((v) => typeof v === 'number');

    if (progressEl) progressEl.textContent = `${scores.length}/${(qaIds || []).length} scored`;

    if (avgEl) {
      if (!scores.length) {
        avgEl.textContent = 'Average: –';
      } else {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        avgEl.textContent = `Average: ${avg.toFixed(1)}/3`;
      }
    }
  }

  function ensureQuestionUI(qaItem, qaId) {
    let student = qaItem.querySelector('.qa-student');
    if (!student) {
      student = document.createElement('div');
      student.className = 'qa-student';
      student.innerHTML = `
        <label for="${qaId}-student">Your answer</label>
        <textarea id="${qaId}-student" class="qa-student-input" data-qa-id="${qaId}" placeholder="Write your answer here..."></textarea>
        <div class="qa-meta" data-qa-meta-for="${qaId}"></div>
      `;
      const questionRow = qaItem.querySelector('.qa-question');
      if (questionRow) questionRow.insertAdjacentElement('afterend', student);
      else qaItem.insertAdjacentElement('afterbegin', student);
    }

    let scorePanel = qaItem.querySelector(`[data-qa-score-panel="${qaId}"]`);
    if (!scorePanel) {
      scorePanel = document.createElement('div');
      scorePanel.className = 'qa-score';
      scorePanel.setAttribute('data-qa-score-panel', qaId);
      scorePanel.innerHTML = `
        <div class="qa-score-title">Self-assess (0–3)</div>
        <div class="qa-score-buttons" role="group" aria-label="Self-assess score">
          <button type="button" class="score-btn" data-score="3" aria-pressed="false">3 – Fully correct</button>
          <button type="button" class="score-btn" data-score="2" aria-pressed="false">2 – Mostly correct</button>
          <button type="button" class="score-btn" data-score="1" aria-pressed="false">1 – Partly correct</button>
          <button type="button" class="score-btn" data-score="0" aria-pressed="false">0 – Not yet</button>
        </div>
      `;
      qaItem.appendChild(scorePanel);
    }
  }

  function ensureSummaryUI(card, qaList) {
    let summary = card.querySelector('[data-qa-summary]');
    if (!summary) {
      summary = document.createElement('div');
      summary.className = 'qa-summary';
      summary.setAttribute('data-qa-summary', '');
      summary.setAttribute('aria-live', 'polite');
      summary.innerHTML = `
        <div>
          <strong>Progress:</strong>
          <span data-qa-progress-text>0/0 scored</span>
          <span aria-hidden="true"> • </span>
          <span data-qa-average-text>Average: –</span>
        </div>
        <div class="qa-summary-actions"></div>
      `;
      qaList.insertAdjacentElement('beforebegin', summary);
    }
    return summary;
  }

  function initQuizBlock(qaList, quizIndex) {
    const minWords = Number(qaList.getAttribute('data-qa-min-words') || DEFAULT_MIN_WORDS_BEFORE_REVEAL);
    const minKeyTerms = Number(qaList.getAttribute('data-qa-min-keyterms') || DEFAULT_MIN_KEY_TERMS_BEFORE_REVEAL);

    const card = qaList.closest('.card') || document.body;
    const titleEl = card.querySelector('h2');
    const quizTitle = titleEl ? titleEl.textContent.trim() : `Quiz ${quizIndex + 1}`;

    const pathname = (window.location && window.location.pathname) ? window.location.pathname : '';
    const pageId = slugify((pathname.split('/').pop()) || document.title || 'page');
    const storageKey = `qa.${pageId}.${slugify(quizTitle)}.${quizIndex}.v1`;
    const store = safeGetStore(storageKey);

    const summaryEl = ensureSummaryUI(card, qaList);

    // Ensure the guidance note matches the "serious attempt" requirement.
    const note = card.querySelector('.card-note');
    const requirementText = `Try answering first (aim for ${minWords}+ words). You can reveal the model answer at any time, then self-assess using the 0–3 rubric.`;
    if (note) {
      note.textContent = requirementText;
    } else {
      const p = document.createElement('p');
      p.className = 'card-note';
      p.textContent = requirementText;
      qaList.insertAdjacentElement('beforebegin', p);
    }

    const summaryActions = summaryEl.querySelector('.qa-summary-actions') || summaryEl;
    let printBtn = summaryEl.querySelector('[data-qa-print]');
    if (!printBtn) {
      printBtn = document.createElement('button');
      printBtn.type = 'button';
      printBtn.className = 'qa-secondary-btn';
      printBtn.setAttribute('data-qa-print', '');
      printBtn.textContent = 'Print / save PDF';
      summaryActions.appendChild(printBtn);
    }

    const qaItems = Array.from(qaList.querySelectorAll('.qa-item'))
      .filter((item) => item.querySelector('.qa-toggle') && item.querySelector('.qa-answer'));

    const qaIds = qaItems
      .map((item) => {
        const answer = item.querySelector('.qa-answer');
        return answer && answer.id ? answer.id : null;
      })
      .filter(Boolean);

    qaItems.forEach((item) => {
      const answer = item.querySelector('.qa-answer');
      const qaId = answer && answer.id ? answer.id : null;
      if (!qaId) return;

      const btn = item.querySelector('.qa-toggle');
      if (btn && (!btn.textContent || btn.textContent.trim().toLowerCase() === 'show answer')) {
        btn.textContent = 'Reveal model answer';
      }

      ensureQuestionUI(item, qaId);
    });

    // Prefill saved responses + scores
    qaItems.forEach((item) => {
      const answer = item.querySelector('.qa-answer');
      const qaId = answer && answer.id ? answer.id : null;
      if (!qaId) return;

      const saved = store.items[qaId];
      const textarea = item.querySelector(`.qa-student-input[data-qa-id="${qaId}"]`);
      if (textarea && saved && typeof saved.response === 'string') textarea.value = saved.response;

      const qTextEl = item.querySelector('.qa-question span');
      const questionText = qTextEl ? qTextEl.textContent.trim() : '';
      updateAttemptMeta({
        qaId,
        response: textarea ? textarea.value : '',
        questionText,
        minWords,
        minKeyTerms,
      });

      const savedScore = saved && typeof saved.score === 'number' ? saved.score : null;
      if (typeof savedScore === 'number') {
        setMeta(qaId, { statusText: `Saved score: ${scoreLabel(savedScore)}` });
        item.querySelectorAll('.score-btn').forEach((b) => {
          const bScore = Number(b.getAttribute('data-score'));
          b.setAttribute('aria-pressed', String(bScore === savedScore));
        });
      } else if (saved && typeof saved.response === 'string' && saved.response.trim().length) {
        setMeta(qaId, { statusText: 'Draft saved.' });
      }
    });

    // Toggle model answer + show scoring panel
    qaItems.forEach((qaItem) => {
      const btn = qaItem.querySelector('.qa-toggle');
      const answer = qaItem.querySelector('.qa-answer');
      if (!btn || !answer || !answer.id) return;

      btn.addEventListener('click', () => {
        const answerId = btn.getAttribute('aria-controls');
        const answerEl = answerId ? document.getElementById(answerId) : null;
        if (!answerEl) return;

        const isOpen = btn.getAttribute('aria-expanded') === 'true';

        if (!isOpen) {
          const ta = qaItem.querySelector(`.qa-student-input[data-qa-id="${answerId}"]`);
          const attempt = ta ? ta.value : '';
          const qTextEl = qaItem.querySelector('.qa-question span');
          const questionText = qTextEl ? qTextEl.textContent.trim() : '';
          updateAttemptMeta({
            qaId: answerId,
            response: attempt,
            questionText,
            minWords,
            minKeyTerms,
          });
        }

        btn.setAttribute('aria-expanded', String(!isOpen));
        btn.textContent = isOpen ? 'Reveal model answer' : 'Hide model answer';
        answerEl.style.display = isOpen ? 'none' : 'block';

        const scorePanel = qaItem.querySelector(`[data-qa-score-panel="${answerId}"]`);
        if (scorePanel) scorePanel.style.display = isOpen ? 'none' : 'block';
      });
    });

    // Save draft response
    qaItems.forEach((qaItem) => {
      const answer = qaItem.querySelector('.qa-answer');
      const qaId = answer && answer.id ? answer.id : null;
      if (!qaId) return;

      const textarea = qaItem.querySelector(`.qa-student-input[data-qa-id="${qaId}"]`);
      if (!textarea) return;

      textarea.addEventListener('input', () => {
        const qTextEl = qaItem.querySelector('.qa-question span');
        const questionText = qTextEl ? qTextEl.textContent.trim() : '';

        const next = safeGetStore(storageKey);
        next.items[qaId] = {
          ...(next.items[qaId] || {}),
          response: textarea.value,
          responseUpdatedAt: new Date().toISOString(),
        };
        const ok = safeSetStore(storageKey, next);
        if (ok) {
          const savedScore = typeof next.items[qaId].score === 'number' ? next.items[qaId].score : null;
          updateAttemptMeta({ qaId, response: textarea.value, questionText, minWords, minKeyTerms });
          if (typeof savedScore === 'number') setMeta(qaId, { statusText: `Saved score: ${scoreLabel(savedScore)} (draft updated)` });
          else if (textarea.value && textarea.value.trim().length) setMeta(qaId, { statusText: 'Draft saved.' });
          else setMeta(qaId, { statusText: '' });
        }
      });
    });

    // Self-assess scoring
    qaItems.forEach((qaItem) => {
      qaItem.querySelectorAll('.score-btn').forEach((scoreBtn) => {
        scoreBtn.addEventListener('click', () => {
          const score = Number(scoreBtn.getAttribute('data-score'));
          if (![0, 1, 2, 3].includes(score)) return;

          const answer = qaItem.querySelector('.qa-answer');
          const qaId = answer && answer.id ? answer.id : null;
          if (!qaId) return;

          const next = safeGetStore(storageKey);
          next.items[qaId] = {
            ...(next.items[qaId] || {}),
            score,
            scoredAt: new Date().toISOString(),
          };
          const ok = safeSetStore(storageKey, next);

          qaItem.querySelectorAll('.score-btn').forEach((b) => {
            const bScore = Number(b.getAttribute('data-score'));
            b.setAttribute('aria-pressed', String(bScore === score));
          });

          if (ok) setMeta(qaId, { statusText: `Saved score: ${scoreLabel(score)}` });
          updateProgressSummary(summaryEl, qaIds, ok ? next : store);
        });
      });
    });

    // Print / save PDF (uses the browser print dialog)
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        const theme = getThemeVars();
        const pageTitle = (document && document.title) ? document.title : '';
        const pagePath = (window.location && window.location.pathname) ? window.location.pathname : '';
        const generatedAt = new Date().toLocaleString();

        const items = qaItems.map((item, idx) => {
          const qTextEl = item.querySelector('.qa-question span');
          const questionText = qTextEl ? qTextEl.textContent.trim() : '';
          const answerEl = item.querySelector('.qa-answer');
          const qaId = answerEl && answerEl.id ? answerEl.id : `q${idx + 1}`;

          const textarea = item.querySelector(`.qa-student-input[data-qa-id="${qaId}"]`);
          const response = textarea ? textarea.value : '';

          const pressed = item.querySelector('.score-btn[aria-pressed="true"]');
          const score = pressed ? Number(pressed.getAttribute('data-score')) : null;
          const scored = Number.isFinite(score) && [0, 1, 2, 3].includes(score);

          const toggleBtn = item.querySelector('.qa-toggle');
          const revealed = toggleBtn ? toggleBtn.getAttribute('aria-expanded') === 'true' : false;

          return {
            id: qaId,
            idx,
            questionText,
            response,
            score: scored ? score : null,
            revealed,
            modelAnswerHtml: revealed && answerEl ? answerEl.innerHTML : '',
          };
        });

        const scoredScores = items
          .map((it) => (typeof it.score === 'number' ? it.score : null))
          .filter((v) => typeof v === 'number');

        const progressText = `${scoredScores.length}/${items.length} scored`;
        const avgText = scoredScores.length
          ? `${(scoredScores.reduce((a, b) => a + b, 0) / scoredScores.length).toFixed(1)}/3`
          : '–';

        const docHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(quizTitle)} – PDF</title>
    <style>
      :root {
        --brand: ${escapeHtml(theme.brand)};
        --text: ${escapeHtml(theme.text)};
        --muted: ${escapeHtml(theme.muted)};
        --border: ${escapeHtml(theme.border)};
        --bg: #ffffff;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 24px;
        font-family: Arial, Helvetica, sans-serif;
        color: var(--text);
        background: var(--bg);
        line-height: 1.45;
      }
      h1 {
        margin: 0 0 6px;
        font-size: 20px;
        color: var(--brand);
      }
      .meta {
        font-size: 12px;
        color: var(--muted);
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 12px 14px;
        margin: 0 0 16px;
      }
      .meta-row { display: flex; flex-wrap: wrap; gap: 10px 18px; }
      .meta-row > div { white-space: nowrap; }
      .meta strong { color: var(--text); }
      .items { margin: 0; padding: 0; list-style: none; }
      .item {
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 12px 14px;
        margin: 0 0 12px;
      }
      .q {
        font-weight: 700;
        margin: 0 0 6px;
      }
      .label {
        font-weight: 700;
        margin: 10px 0 4px;
        color: var(--text);
      }
      .response {
        white-space: pre-wrap;
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 10px 12px;
        margin: 0;
      }
      .response.empty { color: var(--muted); }
      .score {
        margin-top: 10px;
        color: var(--muted);
        font-size: 12px;
      }
      .model {
        margin-top: 10px;
        color: var(--muted);
      }
      .model .model-body {
        border-left: 3px solid var(--border);
        padding-left: 12px;
      }
      .model .model-body p { margin: 6px 0; }
      .footer {
        margin-top: 16px;
        font-size: 11px;
        color: var(--muted);
      }
      @media print {
        body { padding: 0; }
        .item { break-inside: avoid; page-break-inside: avoid; }
      }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(quizTitle)}</h1>
    <div class="meta">
      <div class="meta-row">
        <div><strong>Page:</strong> ${escapeHtml(pageTitle)}</div>
        <div><strong>Path:</strong> ${escapeHtml(pagePath)}</div>
        <div><strong>Generated:</strong> ${escapeHtml(generatedAt)}</div>
      </div>
      <div class="meta-row" style="margin-top:8px;">
        <div><strong>Progress:</strong> ${escapeHtml(progressText)}</div>
        <div><strong>Average:</strong> ${escapeHtml(avgText)}</div>
      </div>
    </div>
    <ol class="items">
      ${items.map((it) => {
          const scoreText = typeof it.score === 'number' ? scoreLabel(it.score) : 'Not scored';
          const responseText = String(it.response || '').trim();
          const responseHtml = responseText ? escapeHtml(responseText) : '—';
          const responseClass = responseText ? 'response' : 'response empty';
          const model = it.revealed && it.modelAnswerHtml
            ? `<div class="model"><div class="label">Model answer</div><div class="model-body">${it.modelAnswerHtml}</div></div>`
            : '';
          return `<li class="item">
            <div class="q">${it.idx + 1}. ${escapeHtml(it.questionText)}</div>
            <div class="label">Your answer</div>
            <div class="${responseClass}">${responseHtml}</div>
            <div class="score"><strong>Score:</strong> ${escapeHtml(scoreText)}</div>
            ${model}
          </li>`;
        }).join('')}
    </ol>
    <div class="footer">Tip: In the print dialog choose “Save as PDF”.</div>
  </body>
</html>`;

        const iframe = document.createElement('iframe');
        iframe.setAttribute('title', 'Quiz print preview');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.style.position = 'fixed';
        iframe.style.left = '-9999px';
        iframe.style.top = '0';
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        iframe.style.border = '0';
        iframe.style.opacity = '0';
        iframe.style.pointerEvents = 'none';
        document.body.appendChild(iframe);

        const cleanup = () => {
          try { iframe.remove(); } catch (e) {}
        };

        const win = iframe.contentWindow;
        const doc = iframe.contentDocument || (win && win.document);
        if (!win || !doc) {
          cleanup();
          alert('Unable to open print preview in this browser.');
          return;
        }

        doc.open();
        doc.write(docHtml);
        doc.close();

        try { void doc.body.offsetHeight; } catch (e) {}

        try {
          win.focus();
          win.print();
        } catch (e) {}

        try { win.addEventListener('afterprint', cleanup, { once: true }); } catch (e) {}
        try { window.addEventListener('afterprint', cleanup, { once: true }); } catch (e) {}
        setTimeout(cleanup, 2000);
      });
    }

    updateProgressSummary(summaryEl, qaIds, store);
  }

  const quizBlocks = Array.from(document.querySelectorAll('.qa-list'));
  quizBlocks.forEach((qaList, idx) => initQuizBlock(qaList, idx));
})();
