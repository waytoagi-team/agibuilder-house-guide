(function () {
  const toast = document.querySelector("[data-toast]");
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 1800);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    return Promise.resolve();
  }

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", () => {
      copyText(button.dataset.copy)
        .then(() => showToast("已复制"))
        .catch(() => showToast("复制失败，请手动选择文本"));
    });
  });

  const menuButton = document.querySelector("[data-menu-button]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
      const open = mobileNav.classList.toggle("open");
      document.body.classList.toggle("menu-open", open);
      menuButton.setAttribute("aria-expanded", String(open));
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.classList.remove("open");
        document.body.classList.remove("menu-open");
        menuButton.setAttribute("aria-expanded", "false");
      });
    });
  }

  const searchInput = document.querySelector("[data-search-input]");
  const searchResult = document.querySelector("[data-search-result]");
  const searchCards = [...document.querySelectorAll("[data-search-card]")];
  if (searchInput && searchCards.length) {
    const updateSearch = () => {
      const query = searchInput.value.trim().toLowerCase();
      let visible = 0;

      searchCards.forEach((card) => {
        const haystack = `${card.textContent} ${card.dataset.search || ""}`.toLowerCase();
        const matched = !query || haystack.includes(query);
        card.hidden = !matched;
        if (matched) visible += 1;
      });

      if (searchResult) {
        searchResult.textContent = query ? `找到 ${visible} 个相关入口` : "输入关键词可筛选下方入口";
      }
    };

    searchInput.addEventListener("input", updateSearch);
    updateSearch();
  }

  const periodButtons = [...document.querySelectorAll("[data-period-filter]")];
  const scheduleItems = [...document.querySelectorAll("[data-period]")];
  periodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const period = button.dataset.periodFilter;
      periodButtons.forEach((item) => item.classList.toggle("active", item === button));
      scheduleItems.forEach((item) => {
        item.hidden = period !== "all" && item.dataset.period !== period;
      });
    });
  });

  const header = document.querySelector(".site-header");
  const navLinks = [...document.querySelectorAll(".desktop-nav a")];
  const observedSections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && observedSections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        const active = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!active) return;
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${active.target.id}`);
        });
      },
      {
        rootMargin: `-${header ? header.offsetHeight + 10 : 80}px 0px -62% 0px`,
        threshold: [0.1, 0.25, 0.5]
      }
    );
    observedSections.forEach((section) => observer.observe(section));
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
})();
