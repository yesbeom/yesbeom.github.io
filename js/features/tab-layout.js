export const initTabLayout = ({ tablistSelector, panelSelector, onTabChange }) => {
  const tabs = Array.from(document.querySelectorAll(`${tablistSelector} [role="tab"]`));
  const panels = Array.from(document.querySelectorAll(panelSelector));

  const activateTab = (tab) => {
    tabs.forEach((candidate) => {
      const isActive = candidate === tab;
      candidate.classList.toggle("is-active", isActive);
      candidate.setAttribute("aria-selected", String(isActive));
    });

    panels.forEach((panel) => {
      panel.toggleAttribute("hidden", panel.dataset.tabPanel !== tab.dataset.tab);
    });

    onTabChange?.(tab.dataset.tab);
  };

  const activateTabFromHash = () => {
    const hashTab = tabs.find((tab) => tab.dataset.tab === location.hash.slice(1));
    if (hashTab) {
      activateTab(hashTab);
    }
  };

  tabs.forEach((tab) => {
    if (tab.disabled) {
      return;
    }

    tab.addEventListener("click", () => activateTab(tab));
  });

  activateTabFromHash();
  window.addEventListener("hashchange", activateTabFromHash);
};
