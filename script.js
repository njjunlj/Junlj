/* =====================================================
   ELEMENTS
===================================================== */
const page = document.querySelector("#page");
const heart = document.querySelector("#heartScene");
const faces = [...document.querySelectorAll(".face")];
const juneTitle = document.querySelector("#juneTitle");
const progressFill = document.querySelector("#progressFill");
const percentage = document.querySelector("#percentage");
const loadingMessage = document.querySelector("#loadingMessage");
const loadingCopy = document.querySelector("#loadingCopy");
const topStatus = document.querySelector("#topStatus");
const errorPopup = document.querySelector("#errorPopup");
const cursor = document.querySelector("#cursor");
const coordinate = document.querySelector("#coordinate");
const grid = document.querySelector(".system-grid");
const navObjects = [...document.querySelectorAll(".nav-object")];
const currentStatus = document.querySelector("#currentStatus");

/* =====================================================
   GLOBAL STATES
===================================================== */
let currentProgress = 0;
let ready = false;
let opened = false;
let erasedCount = 0;

let scrollLocked = false;
let scrollAccumulator = 0;
let lastScrollTime = 0;

/* =====================================================
   LOADING MESSAGES
===================================================== */
const messages = [
  "loading personality...",
  "loading weird ideas...",
  "loading sketch faces...",
  "loading motion...",
  "loading code...",
  "loading cute stuff...",
  "loading questionable decisions...",
  "loading too many tabs...",
  "rendering chaos...",
  "almost there..."
];

const shuffledFaces = [...faces].sort(
  () => Math.random() - 0.5
);

/* =====================================================
   LOADING SYSTEM
===================================================== */
function updateLoadedFaces(progress) {
  const amount = Math.floor(
    progress / 100 * shuffledFaces.length
  );

  shuffledFaces.forEach((face, index) => {
    if (index < amount) {
      face.classList.add("loaded");
    }
  });
}

function runLoading() {
  if (ready) return;

  const random = Math.random();
  let change;

  if (random < 0.08) {
    change = -Math.floor(
      Math.random() * 3
    );
  } else if (random < 0.18) {
    change = 0;
  } else if (random > 0.85) {
    change = 10 + Math.random() * 12;
  } else {
    change = 4 + Math.random() * 7;
  }

  currentProgress += change;
  currentProgress = Math.max(0, currentProgress);

  let displayedProgress = Math.round(currentProgress);

  if (currentProgress > 86 && Math.random() < 0.08) {
    displayedProgress = 103;
  }

  progressFill.style.width = `${Math.min(currentProgress, 100)}%`;
  percentage.textContent = `${displayedProgress}%`;

  updateLoadedFaces(Math.min(currentProgress, 100));

  const messageIndex = Math.min(
    messages.length - 1,
    Math.floor(currentProgress / 10)
  );

  loadingMessage.textContent = messages[messageIndex];

  if (Math.random() < 0.055 && currentProgress > 25) {
    triggerError();
  }

  if (currentProgress >= 100) {
    finishLoading();
    return;
  }

  const nextDelay = 35 + Math.random() * 100;
  setTimeout(runLoading, nextDelay);
}

function finishLoading() {
  currentProgress = 100;

  faces.forEach(face => {
    face.classList.add("loaded");
  });

  progressFill.style.width = "100%";
  percentage.textContent = "100%";

  loadingMessage.textContent = "identity ready";
  loadingCopy.textContent = "erase / scroll ↓";
  topStatus.textContent = "READY";

  page.classList.add("ready");

  setTimeout(() => {
    percentage.textContent = "99%";
    progressFill.style.width = "99%";
  }, 450);

  setTimeout(() => {
    percentage.textContent = "100%";
    progressFill.style.width = "100%";
    ready = true;
  }, 800);
}

/* =====================================================
   ERROR POPUP
===================================================== */
function triggerError() {
  errorPopup.classList.remove("show");
  void errorPopup.offsetWidth;
  errorPopup.classList.add("show");
}

/* =====================================================
   FACE ERASER
===================================================== */
function eraseFacesAt(x, y) {
  if (!ready || opened) return;

  const heartRect = heart.getBoundingClientRect();
  const insideHeart =
    x >= heartRect.left &&
    x <= heartRect.right &&
    y >= heartRect.top &&
    y <= heartRect.bottom;

  cursor.classList.toggle("eraser", insideHeart);

  if (!insideHeart) return;

  const eraseRadius = 54;

  faces.forEach(face => {
    const notLoaded = !face.classList.contains("loaded");
    const alreadyErased = face.classList.contains("erased");

    if (notLoaded || alreadyErased) return;

    const rect = face.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const differenceX = centerX - x;
    const differenceY = centerY - y;
    const distance = Math.sqrt(differenceX * differenceX + differenceY * differenceY);
    const faceRadius = Math.min(rect.width, rect.height) * 0.25;

    if (distance < eraseRadius + faceRadius) {
      face.classList.add("erased");
      erasedCount++;
      updateReveal();
    }
  });
}

function updateReveal() {
  const reveal = Math.min(
    erasedCount / Math.max(faces.length * 0.48, 1),
    1
  );

  juneTitle.style.opacity = String(reveal);
  juneTitle.style.transform = `translate(-50%, -50%) scale(${0.9 + reveal * 0.1})`;

  if (reveal >= 0.95) {
    loadingCopy.textContent = "Junlj found :) / scroll ↓";
  } else if (reveal >= 0.9) {
    loadingCopy.textContent = "Junlj detected / scroll ↓";
  } else {
    loadingCopy.textContent = "keep erasing / scroll ↓";
  }
}

function restoreFaces() {
  faces.forEach(face => {
    face.classList.remove("erased");
    face.style.translate = "";
  });
  erasedCount = 0;
  juneTitle.style.opacity = "0";
}

/* =====================================================
   OPEN PORTFOLIO
===================================================== */
function openHeart() {
  if (!ready) {
    triggerError();
    loadingCopy.textContent = "still loading :(";
    setTimeout(() => {
      loadingCopy.textContent = "loading junlj...";
    }, 700);
    return;
  }

  if (opened || scrollLocked) return;

  scrollLocked = true;
  opened = true;

  restoreFaces();

  page.classList.remove(
    "frame-about",
    "frame-work",
    "frame-contact",
    "returning"
  );

  page.classList.add("open");
  cursor.classList.remove("eraser");

  loadingMessage.textContent = "portfolio online";
  loadingCopy.textContent = "portfolio loaded :)";
  topStatus.textContent = "ONLINE";
  currentStatus.textContent = "CURRENTLY: WAITING FOR U";

  setTimeout(() => {
    scrollLocked = false;
  }, 1000);
}

/* =====================================================
   CLOSE PORTFOLIO
===================================================== */
function closeHeart() {
  if (!opened || scrollLocked) return;

  scrollLocked = true;

  page.classList.remove(
    "frame-about",
    "frame-work",
    "frame-contact"
  );

  page.classList.add("returning");
  page.classList.remove("open");

  opened = false;
  topStatus.textContent = "READY";
  loadingMessage.textContent = "identity ready";
  loadingCopy.textContent = "erase / scroll ↓";

  juneTitle.style.opacity = "0";
  juneTitle.style.transform = "translate(-50%, -50%) scale(.92)";

  setTimeout(() => {
    page.classList.remove("returning");
    scrollLocked = false;
  }, 1000);
}

/* =====================================================
   HEART CLICK & KEYBOARD
===================================================== */
heart.addEventListener("click", () => {
  if (!opened) openHeart();
});

heart.addEventListener("keydown", event => {
  const canOpen = event.key === "Enter" || event.key === " ";
  if (!canOpen) return;
  event.preventDefault();
  if (!opened) openHeart();
});

/* =====================================================
   DESKTOP SCROLL
===================================================== */
window.addEventListener(
  "wheel",
  event => {
    event.preventDefault();

    if (!ready || scrollLocked) return;

    const currentTime = performance.now();
    if (currentTime - lastScrollTime > 180) {
      scrollAccumulator = 0;
    }
    lastScrollTime = currentTime;

    const delta = Math.max(-45, Math.min(45, event.deltaY));
    scrollAccumulator += delta;

    const threshold = 55;

    if (!opened && scrollAccumulator > threshold) {
      scrollAccumulator = 0;
      openHeart();
      return;
    }

    if (opened && scrollAccumulator < -threshold) {
      scrollAccumulator = 0;
      closeHeart();
    }
  },
  { passive: false }
);

/* =====================================================
   MOBILE / TABLET SWIPE
===================================================== */
let touchStartY = null;

window.addEventListener(
  "touchstart",
  event => {
    if (event.touches.length !== 1) return;
    touchStartY = event.touches[0].clientY;
    
    // Cập nhật vị trí custom cursor ngay khi chạm vào màn hình mobile/tablet
    updateMousePosition(event.touches[0].clientX, event.touches[0].clientY, true);
  },
  { passive: true }
);

window.addEventListener(
  "touchmove",
  event => {
    if (event.touches.length !== 1) return;
    // Đồng bộ vị trí custom cursor theo ngón tay khi vuốt trên mobile/tablet
    updateMousePosition(event.touches[0].clientX, event.touches[0].clientY);
  },
  { passive: true }
);

window.addEventListener(
  "touchend",
  event => {
    if (touchStartY === null || !ready || scrollLocked) {
      touchStartY = null;
      return;
    }

    const endY = event.changedTouches[0].clientY;
    const difference = touchStartY - endY;
    touchStartY = null;

    if (difference > 60 && !opened) {
      openHeart();
      return;
    }

    if (difference < -60 && opened) {
      closeHeart();
    }
  },
  { passive: true }
);

window.addEventListener(
  "touchcancel",
  () => { touchStartY = null; },
  { passive: true }
);

/* =====================================================
   NAVIGATION HOVER & STATUS
===================================================== */
const navStatus = {
  about: { text: "CURRENTLY: OVERSHARING" },
  work: { text: "CURRENTLY: MAKING STUFF" },
  contact: { text: "CURRENTLY: REACHABLE (probably)" }
};

navObjects.forEach(object => {
  object.addEventListener("mouseenter", () => {
    if (!opened) return;
    const mode = object.dataset.mode;
    page.classList.remove("frame-about", "frame-work", "frame-contact");
    page.classList.add(`frame-${mode}`);
    currentStatus.textContent = navStatus[mode].text;
  });

  object.addEventListener("mouseleave", () => {
    if (!opened) return;
    page.classList.remove("frame-about", "frame-work", "frame-contact");
    currentStatus.textContent = "CURRENTLY: WAITING FOR U";
  });
});

/* =====================================================
   CUSTOM CURSOR 
===================================================== */
let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
let cursorHasPosition = false;

function updateMousePosition(x, y, instant = false) {
  mouseX = Math.max(0, Math.min(window.innerWidth, x));
  mouseY = Math.max(0, Math.min(window.innerHeight, y));

  if (!cursorHasPosition || instant) {
    cursorX = mouseX;
    cursorY = mouseY;
    cursorHasPosition = true;
  }

  cursor.classList.add("is-visible");

  coordinate.textContent = `X:${Math.round(mouseX)} Y:${Math.round(mouseY)}`;

  const gridX = (mouseX / window.innerWidth - 0.5) * 12;
  const gridY = (mouseY / window.innerHeight - 0.5) * 12;

  grid.style.transform = `translate(${Math.round(gridX)}px, ${Math.round(gridY)}px)`;

  eraseFacesAt(mouseX, mouseY);
}

window.addEventListener("pointermove", event => {
  if (event.isPrimary === false) return;
  updateMousePosition(event.clientX, event.clientY);
});

window.addEventListener("pointerdown", event => {
  if (event.isPrimary === false) return;
  updateMousePosition(event.clientX, event.clientY, true);
});

if (!window.PointerEvent) {
  window.addEventListener("mousemove", event => {
    updateMousePosition(event.clientX, event.clientY);
  });
}

document.documentElement.addEventListener("mouseleave", () => {
  cursor.classList.remove("is-visible", "eraser");
});

document.documentElement.addEventListener("mouseenter", event => {
  if (event.clientX === undefined || event.clientY === undefined) return;
  updateMousePosition(event.clientX, event.clientY, true);
});

/* =====================================================
   CURSOR ANIMATION 
===================================================== */
function animateCursor() {
  if (!cursorHasPosition) {
    requestAnimationFrame(animateCursor);
    return;
  }

  cursorX += (mouseX - cursorX) * 0.35;
  cursorY += (mouseY - cursorY) * 0.35;

  cursor.style.left = `${cursorX}px`;
  cursor.style.top = `${cursorY}px`;

  requestAnimationFrame(animateCursor);
}

animateCursor();

/* =====================================================
   RANDOM FACE POP
===================================================== */
function randomFacePop() {
  const availableFaces = faces.filter(face => {
    const loaded = face.classList.contains("loaded");
    const erased = face.classList.contains("erased");
    return loaded && !erased;
  });

  if (availableFaces.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableFaces.length);
    const selectedFace = availableFaces[randomIndex];

    selectedFace.animate(
      [
        { scale: 1 },
        { scale: 1.13 },
        { scale: 0.97 },
        { scale: 1 }
      ],
      {
        duration: 350 + Math.random() * 300,
        easing: "cubic-bezier(.2,.8,.2,1)"
      }
    );
  }

  setTimeout(randomFacePop, 1200 + Math.random() * 3500);
}

randomFacePop();

/* =====================================================
   START LOADING
===================================================== */
setTimeout(runLoading, 500);