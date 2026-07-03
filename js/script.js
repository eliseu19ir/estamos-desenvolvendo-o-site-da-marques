/* ==========================================================================
   Marques Marketing - Site interactions
   Pure JavaScript ES6, no frameworks
   ========================================================================== */

(() => {
  "use strict";

  const WHATSAPP_URL = "https://wa.me/5554999050770";
  const WHATSAPP_PHONE = "5554999050770";
  const SCROLL_OFFSET = 86;

  const html = document.documentElement;
  const body = document.body;
  const header = document.querySelector(".header");
  const menu = document.querySelector(".menu");
  const menuButton = document.querySelector(".btn-menu");
  const topButton = document.querySelector(".topo");
  const contactForm = document.querySelector(".form-contato");
  const navLinks = [...document.querySelectorAll('.menu a[href^="#"]')];
  const internalLinks = [...document.querySelectorAll('a[href^="#"]')];
  const faqItems = [...document.querySelectorAll(".faq-item")];
  const revealItems = [
    ...document.querySelectorAll(
      ".hero-content, .sobre-texto, .sobre-imagem, .stat, .card, .portfolio-item, .passo, .depoimento, .faq-item, .cta .container, .contato-info, .form-contato"
    ),
  ];

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 16);
  };

  const setTopButtonState = () => {
    if (!topButton) return;
    topButton.classList.toggle("is-visible", window.scrollY > 520);
  };

  const closeMenu = () => {
    if (!menu || !menuButton) return;
    menu.classList.remove("active");
    menuButton.classList.remove("active");
    menuButton.setAttribute("aria-expanded", "false");
    body.classList.remove("menu-open");
  };

  const toggleMenu = () => {
    if (!menu || !menuButton) return;

    const isOpen = menu.classList.toggle("active");
    menuButton.classList.toggle("active", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    body.classList.toggle("menu-open", isOpen);
  };

  const getTargetFromLink = (link) => {
    const hash = link.getAttribute("href");

    if (!hash || hash === "#") return null;
    return document.querySelector(hash);
  };

  const scrollToTarget = (target) => {
    const targetTop = target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;

    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
    });
  };

  const handleInternalLinkClick = (event) => {
    const target = getTargetFromLink(event.currentTarget);

    if (!target) return;

    event.preventDefault();
    closeMenu();
    scrollToTarget(target);
    history.pushState(null, "", event.currentTarget.getAttribute("href"));
  };

  const updateActiveLink = () => {
    if (!navLinks.length) return;

    const sections = navLinks
      .map((link) => getTargetFromLink(link))
      .filter(Boolean);

    const currentSection = sections
      .filter((section) => window.scrollY >= section.offsetTop - SCROLL_OFFSET - 80)
      .pop();

    navLinks.forEach((link) => {
      const isActive = currentSection && link.getAttribute("href") === `#${currentSection.id}`;
      link.classList.toggle("active", Boolean(isActive));
    });
  };

  const setupMenu = () => {
    if (!menuButton || !menu) return;

    menuButton.addEventListener("click", toggleMenu);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("click", (event) => {
      const clickedInsideMenu = menu.contains(event.target);
      const clickedMenuButton = menuButton.contains(event.target);

      if (!clickedInsideMenu && !clickedMenuButton) closeMenu();
    });
  };

  const setupSmoothScroll = () => {
    internalLinks.forEach((link) => {
      link.addEventListener("click", handleInternalLinkClick);
    });
  };

  const setupFaq = () => {
    faqItems.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;

        faqItems.forEach((otherItem) => {
          if (otherItem !== item) otherItem.open = false;
        });
      });
    });
  };

  const setupRevealAnimations = () => {
    if (!revealItems.length) return;

    revealItems.forEach((item, index) => {
      item.classList.add("js-reveal");
      item.style.setProperty("--reveal-delay", `${Math.min(index * 45, 360)}ms`);
    });

    if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -80px 0px",
      }
    );

    revealItems.forEach((item) => observer.observe(item));
  };

  const sanitizeMessageValue = (value) => value.trim().replace(/\s+/g, " ");

  const setupContactForm = () => {
    if (!contactForm) return;

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(contactForm);
      const name = sanitizeMessageValue(formData.get("nome") || "");
      const email = sanitizeMessageValue(formData.get("email") || "");
      const phone = sanitizeMessageValue(formData.get("telefone") || "");
      const message = sanitizeMessageValue(formData.get("mensagem") || "");

      const text = [
        "Ola, Marques Marketing!",
        "",
        "Quero conversar sobre uma estrategia para minha empresa.",
        "",
        `Nome: ${name}`,
        `E-mail: ${email}`,
        phone ? `WhatsApp: ${phone}` : "",
        `Mensagem: ${message}`,
      ]
        .filter(Boolean)
        .join("\n");

      const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      contactForm.reset();
    });
  };

  const setupStatCounters = () => {
    const stats = [...document.querySelectorAll(".stat strong")];

    if (!stats.length || prefersReducedMotion.matches || !("IntersectionObserver" in window)) return;

    const parseStat = (text) => {
      const number = Number.parseFloat(text.replace(",", ".").replace(/[^\d.]/g, ""));

      return {
        value: Number.isFinite(number) ? number : 0,
        prefix: text.match(/^\D+/)?.[0] || "",
        suffix: text.match(/[^\d.]+$/)?.[0] || "",
        decimals: text.includes(".") ? 1 : 0,
      };
    };

    const animateStat = (element) => {
      const original = element.textContent.trim();
      const { value, prefix, suffix, decimals } = parseStat(original);
      const duration = 1300;
      const startTime = performance.now();

      const tick = (currentTime) => {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = value * eased;
        const formatted = decimals ? current.toFixed(decimals) : Math.round(current).toString();

        element.textContent = `${prefix}${formatted}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          element.textContent = original;
        }
      };

      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          animateStat(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    stats.forEach((stat) => observer.observe(stat));
  };

  const setupExternalLinks = () => {
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
      const rel = new Set((link.getAttribute("rel") || "").split(" ").filter(Boolean));
      rel.add("noopener");
      rel.add("noreferrer");
      link.setAttribute("rel", [...rel].join(" "));
    });

    document.querySelectorAll('a[href*="wa.me/5554999050770"]').forEach((link) => {
      link.setAttribute("aria-label", link.getAttribute("aria-label") || "Falar com a Marques Marketing pelo WhatsApp");
    });
  };

  const handleScroll = () => {
    setHeaderState();
    setTopButtonState();
    updateActiveLink();
  };

  const init = () => {
    html.classList.add("js");

    setupExternalLinks();
    setupMenu();
    setupSmoothScroll();
    setupFaq();
    setupRevealAnimations();
    setupContactForm();
    setupStatCounters();

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", closeMenu);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.MarquesMarketing = {
    closeMenu,
    whatsappUrl: WHATSAPP_URL,
  };
})();
