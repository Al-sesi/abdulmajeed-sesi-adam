(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  /* Year -------------------------------------------------- */
  const year = $("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  /* Header state ------------------------------------------ */
  const header = $("[data-header]");
  if (header) {
    const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 6);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  /* Dialog helpers ---------------------------------------- */
  const syncDialogState = () => {
    const open = document.querySelector("dialog[open]");
    document.body.classList.toggle("has-dialog", Boolean(open));
  };

  /* Mobile menu ------------------------------------------- */
  const menu = $("#menu");
  const menuOpen = $("[data-menu-open]");
  const menuClose = $("[data-menu-close]");

  if (menu && menuOpen) {
    menuOpen.addEventListener("click", () => {
      if (!menu.open) menu.showModal();
      menuOpen.setAttribute("aria-expanded", "true");
      syncDialogState();
    });

    if (menuClose) {
      menuClose.addEventListener("click", () => menu.close());
    }

    $$("[data-menu-link]", menu).forEach((link) => {
      link.addEventListener("click", () => menu.close());
    });

    menu.addEventListener("close", () => {
      menuOpen.setAttribute("aria-expanded", "false");
      syncDialogState();
    });
  }

  /* Lightbox ---------------------------------------------- */
  const lightbox = $("#lightbox");
  const lightboxImg = $("[data-lightbox-img]", lightbox || document);
  const lightboxCaption = $("[data-lightbox-caption]", lightbox || document);
  const lightboxFrame = $(".lightbox-frame", lightbox || document);

  if (lightbox && lightboxImg && lightboxCaption) {
    lightboxImg.removeAttribute("src");
    lightboxImg.alt = "";

    const openLightbox = (trigger) => {
      const src = trigger.getAttribute("data-img");
      const caption = trigger.getAttribute("data-caption") || "Certificate preview";
      if (!src) return;
      lightboxImg.src = src;
      lightboxImg.alt = caption;
      lightboxCaption.textContent = caption;
      if (lightboxFrame) lightboxFrame.scrollTop = 0;
      if (!lightbox.open) lightbox.showModal();
      syncDialogState();
    };

    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-lightbox]");
      if (!trigger) return;
      event.preventDefault();
      openLightbox(trigger);
    });

    const closeLightbox = () => {
      if (lightbox.open) lightbox.close();
    };

    $$("[data-lightbox-close]", lightbox).forEach((button) => {
      button.addEventListener("click", closeLightbox);
    });

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    lightbox.addEventListener("close", () => {
      lightboxImg.removeAttribute("src");
      lightboxImg.alt = "";
      syncDialogState();
    });
  }

  /* Print ------------------------------------------------- */
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-print]");
    if (!trigger) return;
    document.querySelectorAll("dialog[open]").forEach((dialog) => dialog.close());
    window.setTimeout(() => window.print(), 80);
  });

  /* Recognition filters ----------------------------------- */
  const filterButtons = $$(".filter-btn");
  const recCards = $$(".rec-card");
  const filterStatus = $("[data-filter-status]");

  if (filterButtons.length && recCards.length) {
    const tagsFor = (card) => (card.getAttribute("data-tags") || "").split(/\s+/).filter(Boolean);

    filterButtons.forEach((button) => {
      const key = button.getAttribute("data-filter");
      const counter = $(".filter-count", button);
      if (!counter) return;
      const count = key === "all"
        ? recCards.length
        : recCards.filter((card) => tagsFor(card).includes(key)).length;
      counter.textContent = String(count);
    });

    const applyFilter = (key) => {
      let visible = 0;

      recCards.forEach((card) => {
        const show = key === "all" || tagsFor(card).includes(key);
        card.hidden = !show;
        if (show) visible += 1;
      });

      filterButtons.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.getAttribute("data-filter") === key));
      });

      if (filterStatus) {
        filterStatus.textContent = `Showing ${visible} ${visible === 1 ? "entry" : "entries"}`;
      }
    };

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => applyFilter(button.getAttribute("data-filter")));
    });

    applyFilter("all");
  }

  /* Scrollspy --------------------------------------------- */
  const navLinks = $$(".site-nav a");
  const spySections = ["work", "experience", "credentials", "recognition", "skills", "references"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (navLinks.length && spySections.length && "IntersectionObserver" in window) {
    const setActive = (id) => {
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
      });
    };

    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-42% 0px -50% 0px", threshold: 0 }
    );

    spySections.forEach((section) => spy.observe(section));

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const id = link.getAttribute("href")?.slice(1);
        if (id) setActive(id);
      });
    });
  }

  /* Reveal on scroll -------------------------------------- */
  const reveals = $$(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reveals.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      reveals.forEach((element) => element.classList.add("is-in"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -6% 0px", threshold: 0.04 }
      );

      reveals.forEach((element) => revealObserver.observe(element));

      /* Safety net: never leave content hidden if the observer is unreliable. */
      window.setTimeout(() => {
        reveals.forEach((element) => element.classList.add("is-in"));
      }, 2200);
    }
  }
})();
