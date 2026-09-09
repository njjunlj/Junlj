const allProjects = Array.isArray(window.PORTFOLIO_PROJECTS) ? window.PORTFOLIO_PROJECTS : [];
const pageParams = new URLSearchParams(window.location.search);

function findProject() {
  const requestedId = pageParams.get("id");
  const legacyTitle = pageParams.get("project");

  return allProjects.find(project => project.id === requestedId)
    || allProjects.find(project => project.title === legacyTitle)
    || allProjects[0];
}

const project = findProject();

if (!project) {
  document.body.innerHTML = "<p class='load-error'>PROJECT DATA COULD NOT BE LOADED.</p>";
  throw new Error("Portfolio project data is missing.");
}

function assetUrl(fileName) {
  return `../assets/projects/${project.assetFolder}/${fileName}`;
}

function setLines(element, lines) {
  const fragment = document.createDocumentFragment();

  lines.forEach((line, index) => {
    if (index > 0) fragment.appendChild(document.createElement("br"));
    fragment.appendChild(document.createTextNode(line));
  });

  element.replaceChildren(fragment);
}

function getReadableTextColor(color) {
  const match = color.trim().match(/^#([0-9a-f]{6})$/i);
  if (!match) return "#111";

  const hex = match[1];
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (r * 299 + g * 587 + b * 114) / 1000;
  return luminance > 145 ? "#111" : "#fff";
}

function createImage(fileName, alt) {
  const image = document.createElement("img");
  image.src = assetUrl(fileName);
  image.alt = alt;
  image.loading = "lazy";
  image.decoding = "async";
  return image;
}

function createHeroCard() {
  const card = document.createElement("article");
  card.className = "stack-card hero-card";
  card.dataset.index = "0";

  const cover = document.createElement("div");
  cover.className = "hero-cover";
  cover.id = "heroCover";

  const image = createImage(project.cover, `${project.title} cover`);
  image.loading = "eager";
  cover.appendChild(image);

  if (project.youtube) {
    const play = document.createElement("button");
    play.className = "play-project";
    play.id = "playProject";
    play.type = "button";
    play.innerHTML = "<span aria-hidden='true'>▶</span> PLAY PROJECT";
    cover.appendChild(play);
  }

  const videoShell = document.createElement("div");
  videoShell.className = "video-shell";
  videoShell.id = "videoShell";

  const iframe = document.createElement("iframe");
  iframe.id = "projectVideo";
  iframe.title = `${project.title} — YouTube video`;
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.allowFullscreen = true;
  videoShell.appendChild(iframe);

  const warning = document.createElement("div");
  warning.className = "youtube-warning";
  warning.id = "youtubeWarning";
  warning.innerHTML = `
    <strong>YOUTUBE PLAYER BLOCKED</strong>
    <p id="youtubeWarningText"></p>
    <a id="youtubeFallback" href="${project.youtube || "https://www.youtube.com/"}" target="_blank" rel="noopener">OPEN ON YOUTUBE ↗</a>
  `;
  videoShell.appendChild(warning);

  card.append(cover, videoShell);
  return card;
}

function createAssetCard(fileName, index) {
  const card = document.createElement("article");
  card.className = "stack-card asset-card";
  card.dataset.index = String(index);
  card.dataset.time = String(index * 4);
  card.appendChild(createImage(fileName, `${project.title} project frame ${index}`));
  return card;
}

function renderProject() {
  document.documentElement.style.setProperty("--project-accent", project.color);
  document.documentElement.style.setProperty("--project-on-accent", getReadableTextColor(project.color));

  document.getElementById("projectTitle").textContent = project.title;
  document.getElementById("projectType").textContent = project.type;
  document.getElementById("projectCaption").textContent = project.caption;
  document.getElementById("projectOverview").textContent = project.overview;
  document.getElementById("projectYear").textContent = project.year;
  setLines(document.getElementById("projectRole"), project.role);
  setLines(document.getElementById("projectTools"), project.tools);

  const visitWebsite = document.getElementById("visitWebsite");
  if (project.website) {
    visitWebsite.href = project.website;
    visitWebsite.hidden = false;
  } else {
    visitWebsite.hidden = true;
  }

  const stage = document.getElementById("stackStage");
  const mediaCount = document.getElementById("mediaCount");
  stage.replaceChildren(mediaCount, createHeroCard());
  project.media.forEach((fileName, index) => stage.appendChild(createAssetCard(fileName, index + 1)));

  const videoTitle = document.getElementById("videoTitle");
  const blink = document.createElement("span");
  blink.className = "blink-dot";
  videoTitle.replaceChildren(blink, document.createTextNode(`${project.title.toUpperCase()}.YOUTUBE`));

  document.title = `${project.title} — June Portfolio`;
}

renderProject();

const cards = [...document.querySelectorAll(".stack-card")];
const hero = document.querySelector(".hero-card");
const heroCover = document.getElementById("heroCover");
const playProject = document.getElementById("playProject");
const videoShell = document.getElementById("videoShell");
const projectVideo = document.getElementById("projectVideo");
const floatingVideo = document.getElementById("floatingVideo");
const floatingSlot = document.getElementById("floatingSlot");
const returnVideo = document.getElementById("returnVideo");
const resetVideoPosition = document.getElementById("resetVideoPosition");
const videoDragbar = document.getElementById("videoDragbar");
const loveTrack = document.getElementById("loveTrack");
const loveFill = document.getElementById("loveFill");
const loveKnob = document.getElementById("loveKnob");
const loveReaction = document.getElementById("loveReaction");
const cursor = document.getElementById("cursor");
const cursorDot = document.getElementById("cursorDot");
const scrollSpace = document.getElementById("scrollSpace");
const mediaCount = document.getElementById("mediaCount");
const stackStage = document.getElementById("stackStage");
const youtubeWarningText = document.getElementById("youtubeWarningText");
const youtubeFallback = document.getElementById("youtubeFallback");

/* Keep every image at its original aspect ratio while fitting it inside the stage. */
function fitCardToImage(card) {
  const image = card.querySelector("img");
  if (!image || !image.naturalWidth || !image.naturalHeight) return;

  const maxWidth = Math.max(1, stackStage.clientWidth);
  const maxHeight = Math.max(1, stackStage.clientHeight);
  const ratio = image.naturalWidth / image.naturalHeight;

  let width = maxWidth;
  let height = width / ratio;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * ratio;
  }

  card.style.width = `${Math.round(width)}px`;
  card.style.height = `${Math.round(height)}px`;
}

function syncCardSizes() {
  cards.forEach(card => {
    const image = card.querySelector("img");
    if (!image) return;

    if (image.complete && image.naturalWidth) {
      fitCardToImage(card);
    } else if (!image.dataset.ratioListener) {
      image.dataset.ratioListener = "true";
      image.addEventListener("load", () => fitCardToImage(card), { once: true });
    }
  });
}

let youtubeLoaded = false;

function getYoutubeId(url) {
  if (!url) return "";

  const raw = url.trim();
  const match = raw.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^\s"']*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/i);
  if (match) return match[1];
  if (/^[\w-]{11}$/.test(raw)) return raw;

  try {
    const parsed = new URL(raw);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.split("/").filter(Boolean)[0] || "";
    return parsed.searchParams.get("v") || "";
  } catch (error) {
    return "";
  }
}

function buildYoutubeEmbed(startAt = 0, autoplay = true) {
  const id = getYoutubeId(project.youtube);
  if (!id) return "";

  const params = new URLSearchParams({
    enablejsapi: "1",
    rel: "0",
    playsinline: "1",
    autoplay: autoplay ? "1" : "0",
    start: String(Math.max(0, Math.floor(startAt)))
  });

  if (["http:", "https:"].includes(window.location.protocol)) params.set("origin", window.location.origin);
  return `https://www.youtube.com/embed/${encodeURIComponent(id)}?${params}`;
}

function showYoutubeError(message) {
  youtubeWarningText.textContent = message;
  youtubeFallback.href = project.youtube || "https://www.youtube.com/";
  videoShell.classList.add("has-error");
}

function loadYoutube(startAt = 0) {
  videoShell.classList.remove("has-error");
  const embedUrl = buildYoutubeEmbed(startAt, true);

  if (!embedUrl) {
    showYoutubeError("This project does not have a valid YouTube video link.");
    return false;
  }

  projectVideo.src = embedUrl;
  youtubeLoaded = true;
  return true;
}

function sendYoutubeCommand(command, args = []) {
  if (!youtubeLoaded || !projectVideo.contentWindow) return;
  projectVideo.contentWindow.postMessage(JSON.stringify({ event: "command", func: command, args }), "*");
}

let videoOpened = false;
let videoDocked = false;
let currentScrollProgress = 0;
let targetIndex = 0;
let displayedIndex = 0;
let scrollStep = 360;
let scrollStart = 0;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep(t) {
  const value = clamp(t, 0, 1);
  return value * value * (3 - 2 * value);
}

function calculateCardState(distance) {
  if (distance >= -1 && distance <= 0) {
    const t = smoothstep(Math.abs(distance));
    return { y: lerp(0, -210, t), scale: lerp(1, .72, t), opacity: lerp(1, .18, t), z: 50 };
  }

  if (distance > 0 && distance <= 1) {
    const t = smoothstep(1 - distance);
    return { y: lerp(120, 0, t), scale: lerp(.82, 1, t), opacity: lerp(.92, 1, t), z: 45 };
  }

  if (distance > 1 && distance <= 2) {
    const t = smoothstep(distance - 1);
    return { y: lerp(120, 180, t), scale: lerp(.82, .68, t), opacity: lerp(.92, .65, t), z: 30 };
  }

  if (distance > 2) {
    const d = Math.min(distance - 2, 2);
    return { y: 180 + d * 35, scale: Math.max(.55, .68 - d * .06), opacity: Math.max(.1, .65 - d * .25), z: 15 };
  }

  if (distance < -1 && distance >= -2) {
    const t = smoothstep(Math.abs(distance) - 1);
    return { y: lerp(-210, -260, t), scale: lerp(.72, .58, t), opacity: lerp(.18, 0, t), z: 28 };
  }

  return { y: -270, scale: .55, opacity: 0, z: 5 };
}

function updateStack(exactIndex) {
  cards.forEach((card, index) => {
    const distance = index - exactIndex;
    const state = calculateCardState(distance);
    const rotation = index % 2 === 0 ? -.35 : .35;

    card.style.transform = `translate(-50%, -50%) translateY(${state.y}px) scale(${state.scale}) rotate(${rotation}deg)`;
    card.style.opacity = state.opacity;
    card.style.zIndex = Math.round(state.z - Math.abs(distance));
    card.style.pointerEvents = Math.abs(distance) < 1.25 ? "auto" : "none";
  });

  const visibleIndex = clamp(Math.round(exactIndex), 0, cards.length - 1);
  mediaCount.textContent = `${String(visibleIndex + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
  mediaCount.classList.toggle("is-exiting", exactIndex > cards.length - .45);
}

let previousFrameTime = performance.now();

function runAnimationLoop(now) {
  const deltaTime = Math.min((now - previousFrameTime) / 1000, .05);
  previousFrameTime = now;
  const smoothing = 1 - Math.exp(-18 * deltaTime);
  displayedIndex = lerp(displayedIndex, targetIndex, smoothing);
  if (Math.abs(displayedIndex - targetIndex) < .0005) displayedIndex = targetIndex;
  updateStack(displayedIndex);
  requestAnimationFrame(runAnimationLoop);
}

function updateScrollMetrics() {
  const transitions = Math.max(cards.length - 1, 0);
  scrollStep = clamp(window.innerHeight * .42, 280, 460);
  scrollStart = document.querySelector(".project-stack-section").offsetTop;
  const exitTravel = scrollStep * .9;
  const travel = transitions * scrollStep + exitTravel;
  scrollSpace.style.height = `${Math.max(window.innerHeight * 1.4, travel + window.innerHeight)}px`;
}

function handleScroll() {
  const lastIndex = Math.max(cards.length - 1, 0);
  const localScroll = Math.max(0, window.scrollY - scrollStart);
  targetIndex = lastIndex > 0 ? clamp(localScroll / scrollStep, 0, lastIndex + .9) : 0;
  currentScrollProgress = lastIndex > 0 ? targetIndex / lastIndex : 0;

  if (videoOpened && currentScrollProgress > .08 && !videoDocked) dockVideo();
  if (videoOpened && currentScrollProgress <= .05 && videoDocked) restoreVideo();
}

window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener("resize", () => {
  syncCardSizes();
  updateScrollMetrics();
  handleScroll();
});

if (playProject) {
  playProject.addEventListener("click", () => {
    videoOpened = true;
    heroCover.style.display = "none";
    videoShell.classList.add("is-visible");
    if (!youtubeLoaded) loadYoutube(0);
    else sendYoutubeCommand("playVideo");
  });
}

function dockVideo() {
  if (videoDocked || !videoOpened) return;
  videoDocked = true;
  floatingSlot.appendChild(videoShell);
  floatingVideo.classList.add("is-visible");
}

function restoreVideo() {
  if (!videoDocked) return;
  videoDocked = false;
  hero.appendChild(videoShell);
  floatingVideo.classList.remove("is-visible");
  resetFloatingVideoPosition();
}

returnVideo.addEventListener("click", () => window.scrollTo({ top: scrollStart, behavior: "smooth" }));

document.querySelectorAll(".asset-card").forEach(card => {
  card.addEventListener("click", () => {
    if (!videoOpened) return;
    const time = Number(card.dataset.time);

    if (Number.isFinite(time)) {
      if (!youtubeLoaded) loadYoutube(time);
      else {
        sendYoutubeCommand("seekTo", [Math.max(0, time), true]);
        sendYoutubeCommand("playVideo");
      }
    }

    if (!videoDocked && currentScrollProgress > .05) dockVideo();
  });
});

let draggingVideo = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

videoDragbar.addEventListener("pointerdown", event => {
  if (event.target.closest("button")) return;
  draggingVideo = true;
  const rect = floatingVideo.getBoundingClientRect();
  dragOffsetX = event.clientX - rect.left;
  dragOffsetY = event.clientY - rect.top;
  floatingVideo.classList.add("is-dragging");
  videoDragbar.setPointerCapture(event.pointerId);
});

videoDragbar.addEventListener("pointermove", event => {
  if (!draggingVideo) return;
  const rect = floatingVideo.getBoundingClientRect();
  const padding = 10;
  const x = clamp(event.clientX - dragOffsetX, padding, window.innerWidth - rect.width - padding);
  const y = clamp(event.clientY - dragOffsetY, padding, window.innerHeight - rect.height - 55);
  floatingVideo.style.right = "auto";
  floatingVideo.style.left = `${x}px`;
  floatingVideo.style.top = `${y}px`;
});

function finishVideoDrag(event) {
  if (!draggingVideo) return;
  draggingVideo = false;
  floatingVideo.classList.remove("is-dragging");
  if (videoDragbar.hasPointerCapture(event.pointerId)) videoDragbar.releasePointerCapture(event.pointerId);
}

videoDragbar.addEventListener("pointerup", finishVideoDrag);
videoDragbar.addEventListener("pointercancel", finishVideoDrag);

function resetFloatingVideoPosition() {
  floatingVideo.style.left = "";
  floatingVideo.style.right = window.innerWidth <= 768 ? "11vw" : "42px";
  floatingVideo.style.top = window.innerWidth <= 768 ? "90px" : "126px";
}

resetVideoPosition.addEventListener("click", resetFloatingVideoPosition);

let loveValue = 45;
let draggingLove = false;

function getReaction(value) {
  if (value < 15) return "hmm...";
  if (value < 35) return "okay?";
  if (value < 55) return "kinda cute";
  if (value < 75) return "i like this";
  if (value < 92) return "waittt...";
  return "SO GOOD!!";
}

function setLove(value) {
  loveValue = clamp(value, 0, 100);
  loveFill.style.width = `${loveValue}%`;
  loveKnob.style.left = `${loveValue}%`;
  loveReaction.textContent = getReaction(loveValue);
}

function updateLoveFromPointer(event) {
  const rect = loveTrack.getBoundingClientRect();
  setLove(((event.clientX - rect.left) / rect.width) * 100);
}

loveTrack.addEventListener("pointerdown", event => {
  draggingLove = true;
  loveKnob.classList.add("is-dragging");
  updateLoveFromPointer(event);
  loveTrack.setPointerCapture(event.pointerId);
});

loveTrack.addEventListener("pointermove", event => {
  if (draggingLove) updateLoveFromPointer(event);
});

function stopLoveDrag(event) {
  if (!draggingLove) return;
  draggingLove = false;
  loveKnob.classList.remove("is-dragging");
  if (loveTrack.hasPointerCapture(event.pointerId)) loveTrack.releasePointerCapture(event.pointerId);
}

loveTrack.addEventListener("pointerup", stopLoveDrag);
loveTrack.addEventListener("pointercancel", stopLoveDrag);
loveKnob.addEventListener("keydown", event => {
  if (event.key === "ArrowRight") setLove(loveValue + 5);
  if (event.key === "ArrowLeft") setLove(loveValue - 5);
});

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let cursorX = mouseX;
let cursorY = mouseY;

window.addEventListener("pointermove", event => {
  mouseX = event.clientX;
  mouseY = event.clientY;
  cursorDot.style.left = `${mouseX}px`;
  cursorDot.style.top = `${mouseY}px`;
});

function animateCursor() {
  cursorX = lerp(cursorX, mouseX, .22);
  cursorY = lerp(cursorY, mouseY, .22);
  cursor.style.left = `${cursorX}px`;
  cursor.style.top = `${cursorY}px`;
  requestAnimationFrame(animateCursor);
}

document.querySelectorAll("a, button, .asset-card, .video-dragbar, .love-track").forEach(element => {
  element.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
  element.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
});

setLove(loveValue);
syncCardSizes();
updateScrollMetrics();
handleScroll();
updateStack(0);
requestAnimationFrame(runAnimationLoop);
animateCursor();
