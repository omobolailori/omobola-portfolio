const siteLoader = document.querySelector("[data-site-loader]");
const loaderCount = siteLoader?.querySelector("[data-loader-count]");

const removeSiteLoader = () => {
  siteLoader?.remove();
  document.body.classList.remove("is-loading");
};

if (siteLoader && loaderCount) {
  let loaderSeen = false;

  try {
    loaderSeen = sessionStorage.getItem("portfolio-loader-seen") === "true";
  } catch (_) {
    loaderSeen = false;
  }

  const forceLoader = new URLSearchParams(window.location.search).get("loader") === "1";

  if (loaderSeen && !forceLoader) {
    removeSiteLoader();
  } else {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hold = reducedMotion ? 80 : 350;

    const finishLoader = () => {
      try {
        sessionStorage.setItem("portfolio-loader-seen", "true");
      } catch (_) {
        // The animation can still finish when storage is unavailable.
      }

      window.setTimeout(() => {
        siteLoader.classList.add("is-leaving");
        siteLoader.addEventListener("transitionend", removeSiteLoader, { once: true });
        window.setTimeout(removeSiteLoader, reducedMotion ? 260 : 900);
      }, hold);
    };

    if (reducedMotion) {
      loaderCount.textContent = "100";
      finishLoader();
    } else {
      const reel = document.createElement("span");
      reel.className = "site-loader-reel";
      reel.setAttribute("aria-hidden", "true");

      const values = [0, 20, 50, 80, 100];

      values.forEach((value) => {
        const number = document.createElement("span");
        number.className = "site-loader-number";
        number.textContent = String(value);
        reel.appendChild(number);
      });

      loaderCount.replaceChildren(reel);

      requestAnimationFrame(() => {
        const rowHeight = loaderCount.getBoundingClientRect().height;
        const position = (index) => `translate3d(0, ${-index * rowHeight}px, 0)`;
        const roll = reel.animate(
          [
            { transform: position(0), offset: 0 },
            { transform: position(0), offset: 0.14, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
            { transform: position(1), offset: 0.22 },
            { transform: position(1), offset: 0.36, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
            { transform: position(2), offset: 0.44 },
            { transform: position(2), offset: 0.58, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
            { transform: position(3), offset: 0.66 },
            { transform: position(3), offset: 0.8, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
            { transform: position(4), offset: 0.88 },
            { transform: position(4), offset: 1 },
          ],
          {
            duration: 3600,
            easing: "linear",
            fill: "forwards",
          },
        );

        roll.addEventListener("finish", finishLoader, { once: true });
      });
    }
  }
}

const brandMenu = document.querySelector(".brand-menu");
const menuButton = document.querySelector(".menu-button");
const menuPanel = document.querySelector(".menu-panel");

const setMenuOpen = (isOpen) => {
  brandMenu?.classList.toggle("is-open", isOpen);
  menuPanel?.classList.toggle("is-open", isOpen);
  menuButton?.setAttribute("aria-expanded", String(isOpen));
  menuButton?.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  menuPanel?.setAttribute("aria-hidden", String(!isOpen));
};

menuButton?.addEventListener("click", (event) => {
  event.preventDefault();
  setMenuOpen(!brandMenu?.classList.contains("is-open"));
});

menuPanel?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && brandMenu?.classList.contains("is-open")) {
    setMenuOpen(false);
    menuButton?.focus();
  }
});

const addExclusiveLinkInteraction = (selector) => {
  const links = [...document.querySelectorAll(selector)];

  const setActiveLink = (activeLink) => {
    links.forEach((link) => {
      link.classList.toggle("is-active", link === activeLink);
    });
  };

  links.forEach((link) => {
    link.addEventListener("pointerenter", () => setActiveLink(link));
    link.addEventListener("pointerleave", () => {
      if (!link.matches(":focus-visible")) {
        setActiveLink(null);
      }
    });
    link.addEventListener("focus", () => setActiveLink(link));
    link.addEventListener("blur", () => setActiveLink(null));
  });
};

addExclusiveLinkInteraction(".menu-socials a");
addExclusiveLinkInteraction(".footer-links a");


const projectAccordions = [...document.querySelectorAll("[data-project]")];

const setProjectOpen = (project, isOpen) => {
  const toggle = project.querySelector(".project-toggle");
  const panel = project.querySelector(".project-panel");
  const label = project.querySelector("[data-project-label]");

  project.classList.toggle("is-open", isOpen);
  toggle?.setAttribute("aria-expanded", String(isOpen));
  panel?.setAttribute("aria-hidden", String(!isOpen));
  if (label) label.textContent = isOpen ? "See less" : "See more";
};

projectAccordions.forEach((project) => {
  const toggle = project.querySelector(".project-toggle");

  toggle?.addEventListener("click", () => {
    const willOpen = !project.classList.contains("is-open");

    projectAccordions.forEach((item) => {
      if (item !== project) setProjectOpen(item, false);
    });

    setProjectOpen(project, willOpen);
  });
});

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const track = carousel.querySelector(".project-carousel-track");

  if (carousel.hasAttribute("data-auto-carousel")) {
    const originalSlides = [...track.querySelectorAll(":scope > .project-slide")];

    originalSlides.forEach((slide) => {
      const clone = slide.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.querySelector("img")?.setAttribute("alt", "");
      track.appendChild(clone);
    });

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let loopWidth = 0;
    let previousTime = 0;

    const measureLoop = () => {
      const firstSlide = track.children[0];
      const firstClone = track.children[originalSlides.length];
      loopWidth = firstSlide && firstClone
        ? firstClone.offsetLeft - firstSlide.offsetLeft
        : 0;
    };

    const advanceCarousel = (time) => {
      if (!previousTime) previousTime = time;
      const elapsed = Math.min(time - previousTime, 50);
      previousTime = time;

      if (
        loopWidth &&
        !reducedMotion.matches &&
        carousel.closest("[data-project]")?.classList.contains("is-open") &&
        !document.hidden
      ) {
        track.scrollLeft += elapsed * 0.05;
        if (track.scrollLeft >= loopWidth) track.scrollLeft -= loopWidth;
      }

      requestAnimationFrame(advanceCarousel);
    };

    measureLoop();
    window.addEventListener("resize", measureLoop);
    requestAnimationFrame(advanceCarousel);
    return;
  }

  const originalSlides = [...track.querySelectorAll(".project-slide")];

  originalSlides.forEach((slide) => {
    const clone = slide.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.removeAttribute("role");
    clone.removeAttribute("aria-label");
    track.appendChild(clone);
  });

  const slideDistance = () => {
    const slide = track.querySelector(".project-slide");
    return slide ? slide.getBoundingClientRect().width + 20 : track.clientWidth;
  };

  carousel.querySelector("[data-carousel-prev]")?.addEventListener("click", () => {
    track.scrollBy({ left: -slideDistance(), behavior: "smooth" });
  });

  carousel.querySelector("[data-carousel-next]")?.addEventListener("click", () => {
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) {
      track.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    track.scrollBy({ left: slideDistance(), behavior: "smooth" });
  });

  track.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    track.scrollBy({
      left: event.key === "ArrowRight" ? slideDistance() : -slideDistance(),
      behavior: "smooth",
    });
  });

  let dragStartX = 0;
  let dragStartScroll = 0;
  let isDragging = false;

  track.addEventListener("pointerdown", (event) => {
    isDragging = true;
    dragStartX = event.clientX;
    dragStartScroll = track.scrollLeft;
    track.classList.add("is-dragging");
    track.setPointerCapture(event.pointerId);
  });

  track.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    track.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
  });

  const stopDragging = (event) => {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove("is-dragging");
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
  };

  track.addEventListener("pointerup", stopDragging);
  track.addEventListener("pointercancel", stopDragging);
});
