(() => {
  const STYLE_ID = 'page-nav-style';
  const COURSE_NAV_STYLE_ID = 'course-family-navigation-style';
  const script = document.currentScript;
  const courseRoot = new URL('./', script && script.src ? script.src : location.href);

  function ensureCourseNavigation() {
    if (document.querySelector('.course-family-nav')) return;

    if (!document.getElementById(COURSE_NAV_STYLE_ID)) {
      const stylesheet = document.createElement('link');
      stylesheet.id = COURSE_NAV_STYLE_ID;
      stylesheet.rel = 'stylesheet';
      stylesheet.href = new URL('course-family-navigation.css?v=20260818', courseRoot).href;
      document.head.append(stylesheet);
    }

    const path = location.pathname.toLowerCase();
    const rootPath = courseRoot.pathname.replace(/\/$/, '').toLowerCase();
    const isHome = path === `${rootPath}/` || path === `${rootPath}/index.html`;
    const nav = document.createElement('nav');
    nav.className = 'course-family-nav screen-only';
    nav.setAttribute('aria-label', 'Engineering course navigation');

    const inner = document.createElement('div');
    inner.className = 'course-family-nav__inner';
    const brand = document.createElement('a');
    brand.className = 'course-family-nav__brand';
    brand.href = new URL('index.html', courseRoot).href;
    brand.innerHTML = '<span class="course-family-nav__mark" aria-hidden="true">ENG</span><span>Engineering</span>';

    const links = document.createElement('div');
    links.className = 'course-family-nav__links';
    const items = [
      ['Course', 'index.html', isHome],
      ['Modules', 'index.html#year9-heading', !isHome],
      ['Puzzles', 'https://stevencowell.github.io/busy-worksheets/?library=engineering', false, true],
      ['Assessment', 'index.html#assessments-heading', false],
      ['Teacher resources', 'index.html#program-heading', false],
      ['Main Menu', 'https://stevencowell.github.io/Main-Page/', false, true]
    ];

    items.forEach(([label, href, current, external]) => {
      const link = document.createElement('a');
      link.textContent = label;
      link.href = external ? href : new URL(href, courseRoot).href;
      if (current) link.setAttribute('aria-current', 'page');
      links.append(link);
    });

    inner.append(brand, links);
    nav.append(inner);
    document.body.prepend(nav);
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .page-nav {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        margin: 2rem 0 0;
        padding-top: 1rem;
        border-top: 1px solid var(--border, #e2e8f0);
      }
      .page-nav a {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.65rem 1rem;
        border-radius: 999px;
        border: 1px solid rgba(0, 86, 179, 0.18);
        background: rgba(0, 86, 179, 0.06);
        color: var(--brand, #0056b3);
        font-weight: 700;
        text-decoration: none;
        box-shadow: var(--shadow, 0 12px 30px rgba(0, 0, 0, 0.08));
      }
      .page-nav a:hover {
        background: rgba(0, 86, 179, 0.10);
      }
      .page-nav a:focus-visible {
        outline: 3px solid var(--brand, #0056b3);
        outline-offset: 2px;
      }
      .page-nav .spacer {
        flex: 1 1 auto;
      }
    `;
    document.head.appendChild(style);
  }

  function getPathInfo() {
    const rawPath = location.pathname || '';
    const decodedPath = decodeURIComponent(rawPath);
    const parts = decodedPath.split('/').filter(Boolean);
    const file = parts[parts.length - 1] || '';
    const dir = parts.length > 1 ? parts[parts.length - 2] : '';
    return { rawPath, decodedPath, parts, file, dir };
  }

  function buildNav({ prevHref, nextHref }) {
    if (!prevHref && !nextHref) return null;

    const nav = document.createElement('nav');
    nav.className = 'page-nav';
    nav.setAttribute('aria-label', 'Page navigation');

    const prev = document.createElement('a');
    prev.textContent = '← Previous';
    if (prevHref) {
      prev.href = prevHref;
    } else {
      prev.style.visibility = 'hidden';
      prev.setAttribute('aria-hidden', 'true');
      prev.tabIndex = -1;
    }

    const next = document.createElement('a');
    next.textContent = 'Next →';
    if (nextHref) {
      next.href = nextHref;
    } else {
      next.style.visibility = 'hidden';
      next.setAttribute('aria-hidden', 'true');
      next.tabIndex = -1;
    }

    nav.appendChild(prev);
    nav.appendChild(next);
    return nav;
  }

  function computeModuleNav(file, dirName) {
    const match = file.match(/^module(\d+)\.html$/i);
    if (!match) return null;

    const moduleNumber = Number(match[1]);
    if (!Number.isFinite(moduleNumber)) return null;

    const maxByDir = new Map([
      ['Year9 T1 Modules', 4],
      ['Year9 T2 Modules', 4],
      ['Year9 T3 Modules', 4],
      ['Year9 T4 Modules', 4],
    ]);
    const max = maxByDir.get(dirName);
    if (!max) return null;

    const prevHref = moduleNumber > 1 ? `module${moduleNumber - 1}.html` : null;
    const nextHref = moduleNumber < max ? `module${moduleNumber + 1}.html` : null;
    return { prevHref, nextHref };
  }

  function computeTermNav(file) {
    const match = file.match(/^year9_term(\d+)\.html$/i);
    if (!match) return null;

    const termNumber = Number(match[1]);
    if (!Number.isFinite(termNumber)) return null;

    const prevHref = termNumber > 1 ? `year9_term${termNumber - 1}.html` : null;
    const nextHref = termNumber < 4 ? `year9_term${termNumber + 1}.html` : null;
    return { prevHref, nextHref };
  }

  function computeAssessmentNav(file) {
    const match = file.match(/^year9_term(\d+)_assessment\.html$/i);
    if (!match) return null;

    const termNumber = Number(match[1]);
    if (!Number.isFinite(termNumber)) return null;

    const prevHref = `year9_term${termNumber}.html`;
    const nextHref = `Year9%20T${termNumber}%20Modules/module1.html`;
    return { prevHref, nextHref };
  }

  function init() {
    ensureCourseNavigation();
    ensureStyles();

    const { file, dir } = getPathInfo();

    const navInfo =
      computeModuleNav(file, dir) ||
      computeTermNav(file) ||
      computeAssessmentNav(file);

    if (!navInfo) return;

    const existing = document.querySelector('.page-nav');
    if (existing) return;

    const main = document.querySelector('main') || document.body;
    const nav = buildNav(navInfo);
    if (!nav) return;
    main.appendChild(nav);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

