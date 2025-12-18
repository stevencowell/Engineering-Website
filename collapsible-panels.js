(() => {
  const STYLE_ID = 'collapsible-panels-style';

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .is-collapsible .collapsible-toggle {
        appearance: none;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0;
        margin: 0;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        cursor: pointer;
        text-align: left;
      }

      .is-collapsible .collapsible-title {
        display: inline-block;
      }

      .is-collapsible .collapsible-chevron {
        display: inline-grid;
        place-items: center;
        width: 2rem;
        height: 2rem;
        border-radius: 999px;
        border: 1px solid rgba(0, 86, 179, 0.18);
        background: rgba(0, 86, 179, 0.06);
        color: rgba(0, 86, 179, 0.85);
        flex: 0 0 auto;
        transform: rotate(0deg);
        transition: transform 160ms ease;
      }

      .assessment-panel.is-collapsible .collapsible-chevron {
        border-color: rgba(255, 152, 0, 0.28);
        background: rgba(255, 152, 0, 0.10);
        color: rgba(133, 100, 4, 0.95);
      }

      .is-collapsible.is-collapsed .collapsible-chevron {
        transform: rotate(-90deg);
      }

      .is-collapsible.is-collapsed {
        padding-bottom: 1.25rem;
      }

      .is-collapsible .collapsible-body {
        margin-top: 0.5rem;
      }
    `;
    document.head.appendChild(style);
  }

  function isHeadingElement(el) {
    return !!el && /^H[1-6]$/.test(el.tagName);
  }

  function makeCollapsible(section, { defaultCollapsed }) {
    const heading = Array.from(section.children).find(isHeadingElement);
    if (!heading) return;

    if (heading.querySelector('.collapsible-toggle')) return;

    const body = document.createElement('div');
    body.className = 'collapsible-body';

    let node = heading.nextSibling;
    while (node) {
      const next = node.nextSibling;
      body.appendChild(node);
      node = next;
    }
    section.appendChild(body);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'collapsible-toggle';

    const title = document.createElement('span');
    title.className = 'collapsible-title';
    while (heading.firstChild) title.appendChild(heading.firstChild);

    const chevron = document.createElement('span');
    chevron.className = 'collapsible-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.textContent = '\u25BE';

    button.appendChild(title);
    button.appendChild(chevron);
    heading.appendChild(button);

    section.classList.add('is-collapsible');

    const collapsed = defaultCollapsed;
    section.classList.toggle('is-collapsed', collapsed);
    body.hidden = collapsed;
    button.setAttribute('aria-expanded', String(!collapsed));

    button.addEventListener('click', () => {
      const isCollapsed = section.classList.toggle('is-collapsed');
      body.hidden = isCollapsed;
      button.setAttribute('aria-expanded', String(!isCollapsed));
    });
  }

  function init() {
    ensureStyles();

    const panels = document.querySelectorAll('section.panel');
    panels.forEach((section) => {
      const defaultCollapsed = section.dataset.collapsibleDefault !== 'open';
      makeCollapsible(section, { defaultCollapsed });
    });

    const assessmentPanels = document.querySelectorAll('section.assessment-panel');
    assessmentPanels.forEach((section) => {
      const defaultCollapsed = section.dataset.collapsibleDefault !== 'open';
      makeCollapsible(section, { defaultCollapsed });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
