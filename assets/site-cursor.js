(() => {
  const cursor = document.getElementById("siteCursor");
  if (!cursor) return;

  let targetX = 0;
  let targetY = 0;
  let cursorX = 0;
  let cursorY = 0;
  let hasPosition = false;

  function updatePosition(x, y, instant = false) {
    targetX = Math.max(0, Math.min(window.innerWidth, x));
    targetY = Math.max(0, Math.min(window.innerHeight, y));

    if (!hasPosition || instant) {
      cursorX = targetX;
      cursorY = targetY;
      hasPosition = true;
    }

    cursor.classList.add("is-visible");
  }

  window.addEventListener("pointermove", event => {
    if (event.isPrimary === false || event.pointerType === "touch") return;
    updatePosition(event.clientX, event.clientY);
  });

  window.addEventListener("pointerdown", event => {
    if (event.isPrimary === false || event.pointerType === "touch") return;
    updatePosition(event.clientX, event.clientY, true);
  });

  if (!window.PointerEvent) {
    window.addEventListener("mousemove", event => {
      updatePosition(event.clientX, event.clientY);
    });
  }

  document.documentElement.addEventListener("mouseleave", () => {
    cursor.classList.remove("is-visible");
  });

  document.documentElement.addEventListener("mouseenter", event => {
    if (event.clientX === undefined || event.clientY === undefined) return;
    updatePosition(event.clientX, event.clientY, true);
  });

  window.addEventListener("blur", () => {
    cursor.classList.remove("is-visible");
  });

  function animateCursor() {
    if (hasPosition) {
      cursorX += (targetX - cursorX) * .35;
      cursorY += (targetY - cursorY) * .35;
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
    }

    requestAnimationFrame(animateCursor);
  }

  animateCursor();
})();
