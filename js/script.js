
/* ===================================
   ORNAMENT DETAILS
=================================== */

function showOrnament(type) {
  const menu = document.getElementById("ornament-menu");

  if (menu) menu.hidden = true;

  document.querySelectorAll(".ornament-detail").forEach(detail => {
    detail.hidden = detail.id !== type;
  });
}

function backToOrnaments() {
  const menu = document.getElementById("ornament-menu");

  document.querySelectorAll(".ornament-detail").forEach(detail => {
    detail.hidden = true;
  });

  if (menu) menu.hidden = false;
}


/* ===================================
   WEBSITE SCREENS
=================================== */

const screens = Array.from(
  document.querySelectorAll("main > section[id]")
);

const screenIds = new Set(
  screens.map(screen => screen.id)
);

const intro = document.getElementById("intro");

let introProgress = 0;
let transitionLocked = false;
let transitionTimer = null;
let animationFrame = null;


/* ===================================
   INTRO ANIMATION
=================================== */

function updateIntro() {
  if (!intro) return;

  const progress = Math.max(
    0,
    Math.min(1, introProgress)
  );

  intro.style.setProperty("--intro-progress", progress);

  // Text gradually disappears
  const opacity = Math.pow(1 - progress, 1.5);

  const content = intro.querySelector(".intro-content");
  const hint = intro.querySelector(".scroll-hint");

  if (content) {
    content.style.opacity = opacity;
  }

  if (hint) {
    hint.style.opacity = opacity;
  }

  // Both windows gradually become larger
  const scale = 1 + progress * 0.35;

  // Window opening progress
  const rawOpening = Math.max(
  0,
  Math.min(1, (progress - 0.05) / 0.85)
);

const opening =
  rawOpening * rawOpening * (3 - 2 * rawOpening);
  // Update both windows
  intro.querySelectorAll(".intro-window").forEach(win => {

    win.style.transform = `scale(${scale})`;

    win.style.setProperty("--opening", opening);

  });
}


/* ===================================
   SCREEN NAVIGATION
=================================== */

function showScreen() {
  const requestedId = decodeURIComponent(
    window.location.hash.slice(1)
  );

  const activeId = screenIds.has(requestedId)
    ? requestedId
    : "intro";

  // Cancel previous transition
  if (transitionTimer !== null) {
    clearTimeout(transitionTimer);
    transitionTimer = null;
  }

  // Cancel previous animation
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  screens.forEach(screen => {
    const isActive = screen.id === activeId;

    screen.classList.toggle("is-active", isActive);

    screen.setAttribute(
      "aria-hidden",
      String(!isActive)
    );
  });

  // Reset windows when returning to intro
  if (activeId === "intro") {
    introProgress = 0;
    updateIntro();
  }

  window.scrollTo(0, 0);

  transitionLocked = false;
}


/* ===================================
   FINISH INTRO ANIMATION
=================================== */

function finishIntro() {
  introProgress = 1;

  updateIntro();

  transitionTimer = setTimeout(() => {

    window.location.hash = "ornaments";

  }, 500);
}


/* ===================================
   SMOOTH BUTTON ANIMATION
=================================== */

function goToOrnaments() {
  if (transitionLocked) return;

  transitionLocked = true;

  const startProgress = introProgress;
  const duration = 2200;
  const startTime = performance.now();

  function animate(currentTime) {

    const elapsed = currentTime - startTime;

    const timeProgress = Math.min(
      elapsed / duration,
      1
    );

    // Smooth easing
    const easedProgress =
      timeProgress * timeProgress *
      (3 - 2 * timeProgress);

    introProgress =
      startProgress +
      (1 - startProgress) * easedProgress;

    updateIntro();

    if (timeProgress < 1) {

      animationFrame = requestAnimationFrame(animate);

    } else {

      animationFrame = null;

      finishIntro();

    }
  }

  animationFrame = requestAnimationFrame(animate);
}


/* ===================================
   INITIALIZATION
=================================== */

document.body.classList.add("js-enabled");

window.addEventListener("hashchange", showScreen);


/* ===================================
   SCROLL ANIMATION
=================================== */

window.addEventListener("wheel", event => {

  if (!intro || !intro.classList.contains("is-active")) {
    return;
  }

  event.preventDefault();

  if (transitionLocked) return;

  // Scroll down opens windows
  // Scroll up closes windows

  introProgress = Math.max(
    0,
    Math.min(
      1,
      introProgress + event.deltaY * 0.00045
    )
  );

  updateIntro();

  // Continue to ornaments after opening
  if (introProgress >= 1 && event.deltaY > 0) {

    transitionLocked = true;

    finishIntro();

  }

}, { passive: false });


/* ===================================
   EXPLORE BUTTON
=================================== */

const exploreButton = intro?.querySelector(".main-button");

if (exploreButton) {

  exploreButton.addEventListener("click", event => {

    event.preventDefault();

    goToOrnaments();

  });

}



/* REGIONS — shared map transition */
let regionBusy = false;
document.addEventListener("click", async event => {
  const link = event.target.closest(".map-marker, .city-back-button");
  if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const from = link.closest("main > section");
  const to = document.getElementById(link.hash.slice(1));
  if (!from || !to || !from.classList.contains("is-active")) return;
  event.preventDefault();
  if (regionBusy) return;

if (to.id === "regions") {
  to.classList.add("instant-return");

  location.hash = "regions";
  showScreen();

  requestAnimationFrame(() => {
    to.classList.remove("instant-return");
  });

  return;
}

if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
  location.hash = to.id;
  return;
}

regionBusy = true;
const forward = from.id === "regions";
  const source = from.querySelector(forward ? ".regions-map" : ".city-small-map");
  const target = to.querySelector(forward ? ".city-small-map" : ".regions-map");
  if (!source || !target) { regionBusy = false; location.hash = to.id; return; }
  const start = source.getBoundingClientRect();
  const clone = source.cloneNode(true);
  clone.classList.add("region-flying-map");
  clone.setAttribute("aria-hidden", "true");
  clone.inert = true;
  Object.assign(clone.style, {left: start.left + "px", top: start.top + "px", width: start.width + "px", height: start.height + "px", margin: "0"});
  document.body.appendChild(clone);
  from.classList.add("region-transition-out");
  to.classList.add("region-transition-in");
  target.classList.add("region-map-hidden");
  window.scrollTo({top:0, behavior:"instant"});
  const end = target.getBoundingClientRect();
  const duration = 1100;
  const options = {duration, easing:"cubic-bezier(0.22, 1, 0.36, 1)", fill:"both"};
  const motion = clone.animate([{transform:"none"},{transform:`translate(${end.left-start.left}px, ${end.top-start.top}px) scale(${end.width/start.width}, ${end.height/start.height})`}], options);
  const fade = to.animate([{opacity:0},{opacity:1}], {...options, delay:100});
  const content = to.querySelector(forward ? ".city-detail-inner" : ".regions-heading");
  const slide = content.animate([{transform:"translateY(-35px)",opacity:0},{transform:"translateY(0)",opacity:1}], {...options, delay:100});
  try { await Promise.all([motion.finished, fade.finished, slide.finished]); }
  finally {
    clone.remove();
    from.classList.remove("region-transition-out");
    to.classList.remove("region-transition-in");
    target.classList.remove("region-map-hidden");
    fade.cancel(); slide.cancel();
    location.hash = to.id;
    showScreen();
    regionBusy = false;
  }
});

/* ===================================
   INTERACTIVE ORNAMENT SLIDERS
=================================== */

document.querySelectorAll(".ornament-slider")
  .forEach(slider => {

    const range = slider.querySelector(
      ".ornament-range"
    );

    if (!range) return;

    function updateComparison() {

      slider.style.setProperty(
        "--split",
        `${range.value}%`
      );

    }

    // Update while dragging
    range.addEventListener(
      "input",
      updateComparison
    );

    // Initial position
    range.value = 50;
    updateComparison();

  });


/* ===================================
   RESET SLIDER WHEN OPENING A PAGE
=================================== */

window.addEventListener("hashchange", () => {

  const activeId = window.location.hash.slice(1);

  const activeSection = document.getElementById(
    activeId
  );

  if (!activeSection) return;

  const slider = activeSection.querySelector(
    ".ornament-slider"
  );

  if (!slider) return;

  const range = slider.querySelector(
    ".ornament-range"
  );

  if (!range) return;

  range.value = 50;

  slider.style.setProperty(
    "--split",
    "50%"
  );

});

/* ===================================
   VERTICAL WINDOW CAROUSELS
=================================== */

(() => {

  const cities = [
    {
      name: "TOMSK",
      id: "tomsk",
      image: "tomsk-window.png"
    },
    {
      name: "VOLOGDA",
      id: "vologda",
      image: "vologda-window.png"
    },
    {
      name: "NIZHNY NOVGOROD",
      id: "nizhny",
      image: "nizhny-window.png"
    }
  ];

  const selected = {
    left: 0,
    right: 1
  };

  const compareButton = document.getElementById(
    "selected-comparison"
  );

  if (!compareButton) return;


  /* SELECT COMPARISON PAGE */

  
function updateCompareButton() {

  const left = cities[selected.left];
  const right = cities[selected.right];

  if (left.id === right.id) {

    compareButton.classList.add("is-disabled");
    compareButton.setAttribute("aria-disabled", "true");
    compareButton.textContent = "SELECT DIFFERENT REGIONS";
    compareButton.removeAttribute("href");

    return;
  }

  compareButton.classList.remove("is-disabled");
  compareButton.removeAttribute("aria-disabled");

  compareButton.textContent = "COMPARE ORNAMENTS →";

  const pair = [left.id, right.id];

  let pageId;

  if (
    pair.includes("tomsk") &&
    pair.includes("vologda")
  ) {
    pageId = "compare-tomsk-vologda";
  }

  else if (
    pair.includes("nizhny") &&
    pair.includes("vologda")
  ) {
    pageId = "compare-nizhny-vologda";
  }

  else {
    pageId = "compare-tomsk-nizhny";
  }

  const ornamentImages = {
    tomsk: "tomsk-ornament.png",
    vologda: "vologda-ornament.png",
    nizhny: "novgorod-ornament.png"
  };

  const page = document.getElementById(pageId);

  if (!page) return;

  // Update city names

  const labels = page.querySelectorAll(
    ".comparison-labels h3"
  );

  if (labels.length >= 2) {
    labels[0].textContent = left.name;
    labels[1].textContent = right.name;
  }

  // Update left ornament

  const leftImage = page.querySelector(
    ".ornament-left"
  );

  if (leftImage) {
    leftImage.src =
      `images/${ornamentImages[left.id]}`;

    leftImage.alt = left.name + " ornament";
  }

  // Update right ornament

  const rightImage = page.querySelector(
    ".ornament-right"
  );

  if (rightImage) {
    rightImage.src =
      `images/${ornamentImages[right.id]}`;

    rightImage.alt = right.name + " ornament";
  }

  // Open the correct comparison page

  compareButton.href = `#${pageId}`;

}



  /* CREATE INDEPENDENT WINDOW REEL */

  function createReel(elementId, side) {

    const reel = document.getElementById(elementId);

    if (!reel) return;

    const viewport = reel.querySelector(
      ".reel-viewport"
    );

    const name = reel.querySelector(".reel-name");

    let animating = false;
    let wheelAmount = 0;
    let lastWheel = 0;


    /* CHANGE WINDOW */

    function changeWindow(direction) {

      if (animating) return;

      animating = true;

      const nextIndex = (
        selected[side] +
        direction +
        cities.length
      ) % cities.length;

      const city = cities[nextIndex];

      const oldItem = viewport.querySelector(
        ".reel-item"
      );

      const newItem = document.createElement("div");

      newItem.className = "reel-item";

      const image = document.createElement("img");

      image.src = `images/${city.image}`;
      image.alt = city.name;

      image.draggable = false;

      newItem.appendChild(image);
      viewport.appendChild(newItem);

      const duration = 750;

      const options = {
        duration: duration,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards"
      };


      /* OLD WINDOW SLIDES OUT */

      const outgoing = oldItem.animate(
        [
          {
            transform: "translateY(0%)",
            opacity: 1
          },
          {
            transform:
              `translateY(${-direction * 100}%)`,
            opacity: 0
          }
        ],
        options
      );


      /* NEW WINDOW SLIDES IN */

      const incoming = newItem.animate(
        [
          {
            transform:
              `translateY(${direction * 100}%)`,
            opacity: 0
          },
          {
            transform: "translateY(0%)",
            opacity: 1
          }
        ],
        options
      );


      /* CHANGE CITY NAME */

      name.animate(
        [
          { opacity: 1 },
          { opacity: 0 },
          { opacity: 1 }
        ],
        {
          duration: duration,
          easing: "ease-in-out"
        }
      );

      setTimeout(() => {

        name.textContent = city.name;

      }, duration / 2);


      /* FINISH ANIMATION */

      selected[side] = nextIndex;

      updateCompareButton();

      Promise.all([
        outgoing.finished,
        incoming.finished
      ]).then(() => {

        oldItem.remove();

        incoming.cancel();

        animating = false;

      });

    }


    /* ARROW BUTTONS */

    reel.querySelectorAll(".reel-arrow")
      .forEach(button => {

        button.addEventListener("click", () => {

          changeWindow(
            Number(button.dataset.direction)
          );

        });

      });


    /* MOUSE AND TRACKPAD SCROLL */

    reel.addEventListener("wheel", event => {

      event.preventDefault();

      const now = performance.now();

      if (now - lastWheel > 180) {
        wheelAmount = 0;
      }

      lastWheel = now;

      if (animating) return;

      const multiplier =
        event.deltaMode === 1 ? 16 :
        event.deltaMode === 2 ? 800 : 1;

      wheelAmount += event.deltaY * multiplier;

      if (Math.abs(wheelAmount) < 35) return;

      changeWindow(wheelAmount > 0 ? 1 : -1);

      wheelAmount = 0;

    }, { passive: false });


    /* TOUCH SWIPE */

    let touchStart = 0;

    viewport.addEventListener("touchstart", event => {

      touchStart = event.touches[0].clientY;

    }, { passive: true });

    viewport.addEventListener("touchend", event => {

      const touchEnd =
        event.changedTouches[0].clientY;

      const distance = touchStart - touchEnd;

      if (Math.abs(distance) > 35) {

        changeWindow(distance > 0 ? 1 : -1);

      }

    });

  }


  /* INITIALIZE BOTH SIDES */

  createReel("left-reel", "left");
  createReel("right-reel", "right");

  updateCompareButton();

})();

/* ===================================
   INTERACTIVE ORNAMENT SLIDER
=================================== */

document.querySelectorAll(".ornament-slider")
  .forEach(slider => {

    const range = slider.querySelector(".ornament-range");

    if (!range) return;

    function updateSlider() {

      slider.style.setProperty(
        "--position",
        `${range.value}%`
      );

    }

    range.addEventListener("input", updateSlider);

    range.addEventListener("change", updateSlider);

    updateSlider();

  });
/* ===================================
   SMOOTH MAP APPEARANCE
=================================== */

(() => {

  const map = document.getElementById("regions");

  if (!map) return;

  let wasActive = map.classList.contains("is-active");

  const observer = new MutationObserver(() => {

    const isActive = map.classList.contains("is-active");

   if (isActive && !wasActive && !map.classList.contains("instant-return")) {

      map.getAnimations().forEach(animation => {
        animation.cancel();
      });

      map.animate(
        [
          {
            opacity: 0,
            transform: "translateY(25px) scale(0.96)"
          },
          {
            opacity: 1,
            transform: "translateY(0) scale(1)"
          }
        ],
        {
          duration: 1400,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "none"
        }
      );

    }

    wasActive = isActive;

  });

  observer.observe(map, {
    attributes: true,
    attributeFilter: ["class"]
  });

})();
showScreen();
