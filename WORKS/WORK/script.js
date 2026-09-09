/* =========================================================
   PROJECT DATA
========================================================= */

const projects = Array.isArray(window.PORTFOLIO_PROJECTS)
    ? window.PORTFOLIO_PROJECTS
    : [];


/* =========================================================
   DOM
========================================================= */

const projectLayer = document.getElementById("projectLayer");
const folderBack = document.getElementById("folderBack");
const folderFront = document.getElementById("folderFront");
const folderCount = document.getElementById("folderCount");
const progressFill = document.getElementById("progressFill");
const stateIndex = document.getElementById("stateIndex");
const stateLabel = document.getElementById("stateLabel");
const stageHint = document.getElementById("stageHint");
const filterText = document.getElementById("filterText");
const coordsDisplay = document.getElementById("coordsDisplay");
const customCursor = document.getElementById("customCursor");
const cursorReadout = document.getElementById("cursorReadout");
const categorySystem = document.getElementById("categorySystem");
const categoryToggle = document.getElementById("categoryToggle");


/* =========================================================
   MOTION STATE
========================================================= */

let targetProgress = 0;
let progress = 0;

const GRID_POINT = 0.42;
let activeFilter = "all";
const projectItems = [];
let topZ = 500;


/* =========================================================
   HELPERS
========================================================= */

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function ease(t) {
    return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}


/* =========================================================
   INITIAL PILE
========================================================= */

const pilePositions = [
    { x: -102, y: -92 }, { x: -30, y: -112 }, { x: 55, y: -99 }, { x: 95, y: -62 },
    { x: -122, y: -43 }, { x: -55, y: -54 }, { x: 20, y: -63 }, { x: 92, y: -20 },
    { x: -100, y: 5 },  { x: -22, y: -15 },  { x: 51, y: 10 },  { x: 112, y: 26 },
    { x: -80, y: 40 },   { x: -10, y: 30 },   { x: 40, y: 45 },   { x: 85, y: 50 }
];

const pileZ = [
    103, 108, 102, 107,
    104, 110, 105, 101,
    106, 109, 103, 100,
    111, 102, 108, 104
];

/* =========================================================
   GRID 
========================================================= */

function createGridPositions() {
    const rect = projectLayer.getBoundingClientRect();
    const screenW = rect.width;
    const screenH = rect.height;
    
    const isMobile = screenW < 768;
    const isTablet = screenW >= 768 && screenW <= 1024;
  
    const columns = isMobile ? 2 : (isTablet ? 3 : 4);
    const rows = Math.ceil(projects.length / columns);
  
    const cardWidth = isMobile ? 140 : (isTablet ? 170 : 220);
    const safePadding = isMobile ? 40 : 80; 
   
    const safeWidth = screenW - cardWidth - safePadding;
    
    const totalWidth = Math.max(100, Math.min(safeWidth, 840));
    const totalHeight = Math.min(screenH * 0.65, isMobile ? 320 : (isTablet ? 400 : 460));
    
    const xGap = columns > 1 ? totalWidth / (columns - 1) : 0;
    const yGap = rows > 1 ? totalHeight / (rows - 1) : 0;

    return projects.map((_, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;
        const itemsThisRow = Math.min(columns, projects.length - row * columns);
        const rowWidth = xGap * (itemsThisRow - 1);

        return {
            x: -rowWidth / 2 + col * xGap,
            y: -totalHeight / 2 + row * yGap + (isMobile ? 0 : 20)
        };
    });
}
/* =========================================================
   CREATE PROJECTS
========================================================= */

function createProjects() {
    const grid = createGridPositions();
    projectLayer.innerHTML = "";

    projects.forEach((project, index) => {
        const card = document.createElement("article");
        card.className = "project-card";
        card.dataset.id = project.id;
        card.dataset.tags = project.tags.join(" ");

        card.innerHTML = `
            <div class="project-thumb" style="--accent:${project.color}">
                <div class="thumb-image">
                    <img src="../assets/projects/${project.assetFolder}/${project.cover}" alt="${project.title} cover" loading="lazy" decoding="async">
                    <span class="thumb-mark" aria-hidden="true">
                        <span class="thumb-label">${project.title}</span>
                    </span>
                </div>
            </div>
            <div class="project-meta">
                <span class="project-title">${project.title}</span>
            </div>
        `;

        const item = {
            project,
            element: card,
            index,
            pileX: pilePositions[index].x,
            pileY: pilePositions[index].y,
            gridX: grid[index].x,
            gridY: grid[index].y,
            offsetX: 0,
            offsetY: 0,
            stored: false,
            dragging: false,
            customZ: null
        };

        projectItems.push(item);
        setupDragging(item);
        projectLayer.appendChild(card);
    });

    updateStoredCount();
}


/* =========================================================
   SPIRAL
========================================================= */

function getSpiralPosition(item, t) {
    const baseAngle = (item.index / projects.length) * Math.PI * 2;
    const angle = baseAngle + t * Math.PI * 2.25;

    const layer = item.index % 4;
    const startRadius = 145 + layer * 18;
    const endRadius = 280 + layer * 26;
    const radius = lerp(startRadius, endRadius, Math.min(t, 1));

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * .67;

    const drift = Math.sin(item.index * 2.1 + t * 7) * 22 * Math.min(t, 1);

    return {
        x: x + Math.cos(angle + Math.PI / 2) * drift,
        y: y + Math.sin(angle + Math.PI / 2) * drift * .35
    };
}


/* =========================================================
   BASE MOTION
========================================================= */

function getMotionPosition(item) {
    if (progress <= GRID_POINT) {
        const local = clamp(progress / GRID_POINT, 0, 1);
        const stagger = item.index * .018;
        const delayed = clamp((local - stagger) / (.82 - stagger), 0, 1);
        const e = ease(delayed);
        const lift = Math.sin(e * Math.PI) * 55;

        return {
            x: lerp(item.pileX, item.gridX, e),
            y: lerp(item.pileY, item.gridY, e) - lift
        };
    }

    const spiralT = (progress - GRID_POINT) / (1 - GRID_POINT);
    const spiral = getSpiralPosition(item, spiralT);
    const e = ease(Math.min(spiralT, 1));

    return {
        x: lerp(item.gridX, spiral.x, e),
        y: lerp(item.gridY, spiral.y, e)
    };
}


/* =========================================================
   RENDER 
========================================================= */

function render() {
    progress = lerp(progress, targetProgress, .085);

    if (Math.abs(targetProgress - progress) < .0001) {
        progress = targetProgress;
    }

    projectItems.forEach(item => {
        if (item.stored) return;

        const base = getMotionPosition(item);
        let dragStrength = 1;

        if (progress > GRID_POINT) {
            dragStrength = lerp(1, .35, Math.min((progress - GRID_POINT) / (1 - GRID_POINT), 1));
        }

        if (progress < .12) {
            dragStrength = progress / .12;
        }

        // Tự động snap về ngay hàng thẳng lối khi cuộn về trạng thái Grid/Folder
        if (progress <= GRID_POINT + 0.05) {
            item.offsetX = lerp(item.offsetX, 0, 0.15);
            item.offsetY = lerp(item.offsetY, 0, 0.15);
        }

        const x = base.x + item.offsetX;
        const y = base.y + item.offsetY;

        item.element.style.transform = `
            translate(-50%, -50%)
            translate3d(${x}px, ${y}px, 0)
        `;

        if (progress < .15 && !item.dragging) {
            item.element.style.zIndex = pileZ[item.index];
        } else if (!item.dragging) {
            item.element.style.zIndex = item.customZ || (200 + Math.round(y + 500));
        }
    });

    renderFolder();
    renderStatus();
    requestAnimationFrame(render);
}


/* =========================================================
   FOLDER MOTION & STATUS
========================================================= */

function renderFolder() {
    const fade = clamp(1 - progress / .36, 0, 1);
    const scale = lerp(1, .84, clamp(progress / .42, 0, 1));

    folderBack.style.opacity = fade;
    folderFront.style.opacity = fade;
    folderBack.style.transform = `translate(-50%,-50%) scale(${scale})`;
    folderFront.style.transform = `translate(-50%,-50%) scale(${scale})`;
    folderFront.style.pointerEvents = progress < .25 ? "auto" : "none";
}

function renderStatus() {
    progressFill.style.width = `${Math.min(progress, 1) * 100}%`;

    if (progress < .12) {
        stateIndex.textContent = "00";
        stateLabel.textContent = "FOLDER";
        stageHint.textContent = "↓ SCROLL TO UNPACK";
    } else if (progress < .34) {
        stateIndex.textContent = "01";
        stateLabel.textContent = "UNPACKING";
        stageHint.textContent = "↓ ORGANIZING PROJECTS";
    } else if (progress < .52) {
        stateIndex.textContent = "02";
        stateLabel.textContent = "GRID";
        stageHint.textContent = "DRAG PROJECTS / ↓ KEEP SCROLLING";
    } else if (progress < 1.2) {
        stateIndex.textContent = "03";
        stateLabel.textContent = "SPIRAL";
        stageHint.textContent = "↑ SCROLL UP TO ORGANIZE / CONTINUE SCROLLING";
    } else {
        stateIndex.textContent = "04";
        stateLabel.textContent = "FULL SPIRAL";
        stageHint.textContent = "↑ RETURN TO FOLDER";
    }
}


/* =========================================================
   SCROLL
========================================================= */

window.addEventListener("wheel", event => {
    if (document.querySelector(".project-overlay.open")) return;
    if (projectItems.some(item => item.dragging)) return;

    event.preventDefault();

    targetProgress += event.deltaY * .00055;
    targetProgress = clamp(targetProgress, 0, 2.5);

    if (targetProgress < .01) {
        projectItems.forEach(item => {
            item.offsetX = 0;
            item.offsetY = 0;
            item.customZ = null;
        });
    }
}, { passive: false });


/* =========================================================
   DRAG PROJECT 
========================================================= */

function setupDragging(item) {
    const card = item.element;
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let startOffsetX = 0;
    let startOffsetY = 0;
    let moved = 0;

    card.addEventListener("pointerdown", event => {
        if (event.button !== undefined && event.button !== 0) return;
        item.dragging = true;
        pointerId = event.pointerId;
        startX = event.clientX;
        startY = event.clientY;
        startOffsetX = item.offsetX;
        startOffsetY = item.offsetY;
        moved = 0;

        card.setPointerCapture(pointerId);
        card.classList.add("dragging");
        
        topZ++;
        item.customZ = topZ;
        card.style.zIndex = topZ;
    });

    card.addEventListener("pointermove", event => {
        if (!item.dragging || event.pointerId !== pointerId) return;

        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        moved = Math.hypot(dx, dy);

        let newOffsetX = startOffsetX + dx;
        let newOffsetY = startOffsetY + dy;

        // Giới hạn nhẹ trên thiết bị nhỏ để tránh mất tệp khỏi khung nhìn
        if (window.innerWidth < 900) {
            const maxW = window.innerWidth / 2 - 40;
            const maxH = window.innerHeight / 2 - 60;
            newOffsetX = clamp(newOffsetX, -maxW, maxW);
            newOffsetY = clamp(newOffsetY, -maxH, maxH);
        }

        item.offsetX = newOffsetX;
        item.offsetY = newOffsetY;
    });

    function finishDrag(event) {
        if (!item.dragging) return;
        item.dragging = false;
        card.classList.remove("dragging");

        try {
            card.releasePointerCapture(pointerId);
        } catch(error) {}

        if (moved < 6) {
            openProject(item.project);
            return;
        }

        if (progress < .32 && isCardOverFolder(card)) {
            storeProject(item);
        }
    }

    card.addEventListener("pointerup", finishDrag);
    card.addEventListener("pointercancel", finishDrag);
}


/* =========================================================
   FOLDER UTILITIES & MODALS
========================================================= */

function isCardOverFolder(card) {
    const cardRect = card.getBoundingClientRect();
    const folderRect = folderFront.getBoundingClientRect();
    const cardCenterX = cardRect.left + cardRect.width / 2;
    const cardCenterY = cardRect.top + cardRect.height / 2;

    return (
        cardCenterX > folderRect.left &&
        cardCenterX < folderRect.right &&
        cardCenterY > folderRect.top &&
        cardCenterY < folderRect.bottom
    );
}

function storeProject(item) {
    item.stored = true;
    item.element.classList.add("stored");
    item.offsetX = 0;
    item.offsetY = 0;
    item.customZ = null;
    updateStoredCount();
}

function updateStoredCount() {
    const visible = projectItems.filter(item => !item.stored).length;
    folderCount.textContent = `${visible} ITEMS`;
}

folderFront.addEventListener("click", () => {
    const stored = projectItems.filter(item => item.stored);
    if (stored.length > 0) {
        stored.forEach((item, index) => {
            setTimeout(() => {
                item.stored = false;
                item.element.classList.remove("stored");
                updateStoredCount();
            }, index * 70);
        });
        return;
    }

    if (targetProgress < .15) {
        targetProgress = GRID_POINT;
    } else {
        targetProgress = 0;
    }
});

document.querySelectorAll(".category-window").forEach(button => {
    button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;
        document.querySelectorAll(".category-window").forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        projectItems.forEach(item => {
            const match = activeFilter === "all" || item.project.tags.includes(activeFilter);
            item.element.classList.toggle("muted", !match);
            item.element.classList.toggle("matched", match && activeFilter !== "all");
        });

        filterText.textContent = `FILTER: ${activeFilter.toUpperCase()}`;
    });
});

categoryToggle.addEventListener("click", () => {
    const isOpen = categorySystem.classList.toggle("open");
    categoryToggle.setAttribute("aria-expanded", String(isOpen));
});

window.addEventListener("mousemove", event => {
    const x = String(Math.round(event.clientX)).padStart(3,"0");
    const y = String(Math.round(event.clientY)).padStart(3,"0");
    coordsDisplay.textContent = `X:${x} Y:${y}`;
    cursorReadout.innerHTML = `X:${x}<br>Y:${y}`;
    customCursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    customCursor.classList.add("visible");
});

document.documentElement.addEventListener("mouseleave", () => customCursor.classList.remove("visible"));
document.documentElement.addEventListener("mouseenter", () => customCursor.classList.add("visible"));

document.addEventListener("mouseover", event => {
    if (event.target.closest("a, button, .project-card, .folder-front")) {
        customCursor.classList.add("is-active");
    }
});

document.addEventListener("mouseout", event => {
    const interactive = event.target.closest("a, button, .project-card, .folder-front");
    if (interactive && !interactive.contains(event.relatedTarget)) {
        customCursor.classList.remove("is-active");
    }
});

const projectOverlay = document.getElementById("projectOverlay");
const viewProjectLink = document.getElementById("viewProjectLink");

function openProject(project) {
    document.getElementById("overlayTitle").textContent = project.title;
    document.getElementById("overlayDescription").textContent = project.caption;

    const tagBox = document.getElementById("overlayTags");
    tagBox.innerHTML = "";
    project.tags.forEach(tag => {
        const el = document.createElement("span");
        el.className = "tag";
        el.textContent = tag;
        tagBox.appendChild(el);
    });

    document.getElementById("overlayVisual").innerHTML = `
        <img src="../assets/projects/${project.assetFolder}/${project.cover}" alt="${project.title} preview">
    `;

    const detailParams = new URLSearchParams({
        id: project.id
    });

    viewProjectLink.href = `../PROJECT/index.html?${detailParams.toString()}`;
    projectOverlay.classList.add("open");
}

document.getElementById("closeProjectBtn").addEventListener("click", () => projectOverlay.classList.remove("open"));
document.getElementById("overlayBackdrop").addEventListener("click", () => projectOverlay.classList.remove("open"));

const aboutOverlay = document.getElementById("aboutOverlay");
document.getElementById("closeAboutBtn").addEventListener("click", () => aboutOverlay.classList.remove("open"));
document.getElementById("aboutBackdrop").addEventListener("click", () => aboutOverlay.classList.remove("open"));

window.addEventListener("resize", () => {
    const grid = createGridPositions();
    projectItems.forEach((item, index) => {
        item.gridX = grid[index].x;
        item.gridY = grid[index].y;
    });
});

createProjects();
requestAnimationFrame(render);