/* =========================================================
   DOM
========================================================= */

const body =
  document.body;


const faces =
  document.querySelectorAll(
    ".face"
  );


const resetButton =
  document.getElementById(
    "resetButton"
  );


const portraits =
  document.querySelectorAll(
    ".portrait"
  );


const processSteps =
  document.querySelectorAll(
    ".process-step"
  );


const processText =
  document.getElementById(
    "processText"
  );



/* =========================================================
   SAFE STATE
========================================================= */

body.dataset.view =
  body.dataset.view ||
  "home";



/* =========================================================
   FACE NAVIGATION
========================================================= */

faces.forEach(
  (face) => {

    face.addEventListener(
      "click",
      () => {

        const target =
          face.dataset.target;


        if (
          body.dataset.view ===
          target
        ) {

          resetPage();

          return;

        }


        body.dataset.view =
          target;


        clearProfiles();

        clearProcess();

      }
    );

  }
);



/* =========================================================
   RESET
========================================================= */

function resetPage() {

  body.dataset.view =
    "home";


  clearProfiles();

  clearProcess();

}



resetButton.addEventListener(
  "click",
  resetPage
);



window.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key ===
      "Escape"
    ) {

      resetPage();

    }

  }
);



/* =========================================================
   PROFILE
========================================================= */

portraits.forEach(
  (portrait) => {

    portrait.addEventListener(
      "click",
      (event) => {

        event.stopPropagation();


        const profile =
          portrait.dataset.profile;


        const alreadyActive =
          profile ===
          "quynh"

            ? body.classList.contains(
                "profile-quynh"
              )

            : body.classList.contains(
                "profile-june"
              );


        if (
          alreadyActive
        ) {

          clearProfiles();

          return;

        }


        clearProfiles();


        if (
          profile ===
          "quynh"
        ) {

          body.classList.add(
            "profile-quynh"
          );

        }


        if (
          profile ===
          "june"
        ) {

          body.classList.add(
            "profile-june"
          );

        }

      }
    );

  }
);



function clearProfiles() {

  body.classList.remove(
    "profile-quynh"
  );


  body.classList.remove(
    "profile-june"
  );

}



/* =========================================================
   PROCESS
========================================================= */

const processContent = {

  1:
    "Start with a rough sketch. I need to see an idea before I fully understand what it wants to become.",

  2:
    "Move things around, test scale, timing and interaction. Bad ideas are allowed to exist here.",

  3:
    "Push the system until something breaks. Sometimes the mistake becomes more interesting than the original plan.",

  4:
    "Keep the parts that communicate. Fix what interrupts the experience without cleaning away all the personality.",

  5:
    "Test it again. Move it again. Break something else. The process usually loops instead of ending neatly."

};



let typingTimer =
  null;



processSteps.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        const step =
          button.dataset.step;


        processSteps.forEach(
          (item) => {

            item.classList.remove(
              "active"
            );

          }
        );


        button.classList.add(
          "active"
        );


        typeText(
          processContent[
            step
          ]
        );

      }
    );

  }
);



function typeText(
  text
) {

  clearInterval(
    typingTimer
  );


  processText.textContent =
    "";


  let index =
    0;


  typingTimer =
    setInterval(
      () => {

        processText.textContent +=
          text.charAt(
            index
          );


        index +=
          1;


        if (
          index >=
          text.length
        ) {

          clearInterval(
            typingTimer
          );

        }

      },
      13
    );

}



function clearProcess() {

  clearInterval(
    typingTimer
  );


  processSteps.forEach(
    (button) => {

      button.classList.remove(
        "active"
      );

    }
  );


  if (
    processText
  ) {

    processText.textContent =
      "Select one part of the loop.";

  }

}



/* =========================================================
   CUSTOM CURSOR
========================================================= */

const customCursor =
  document.getElementById(
    "customCursor"
  );


const cursorReadout =
  document.getElementById(
    "cursorReadout"
  );



let cursorTargetX =
  window.innerWidth / 2;


let cursorTargetY =
  window.innerHeight / 2;


let cursorCurrentX =
  cursorTargetX;


let cursorCurrentY =
  cursorTargetY;



window.addEventListener(
  "mousemove",
  (event) => {

    cursorTargetX =
      event.clientX;


    cursorTargetY =
      event.clientY;


    customCursor
      .classList
      .add(
        "visible"
      );


    cursorReadout.innerHTML =
      `X:${String(
        Math.round(
          event.clientX
        )
      ).padStart(
        3,
        "0"
      )}<br>` +

      `Y:${String(
        Math.round(
          event.clientY
        )
      ).padStart(
        3,
        "0"
      )}`;

  }
);



function animateCursor() {

  cursorCurrentX +=
    (
      cursorTargetX -
      cursorCurrentX
    ) *
    .38;


  cursorCurrentY +=
    (
      cursorTargetY -
      cursorCurrentY
    ) *
    .38;


  customCursor.style.left =
    `${cursorCurrentX}px`;


  customCursor.style.top =
    `${cursorCurrentY}px`;


  requestAnimationFrame(
    animateCursor
  );

}



animateCursor();



document.addEventListener(
  "mouseleave",
  () => {

    customCursor
      .classList
      .remove(
        "visible"
      );

  }
);



document.addEventListener(
  "mouseenter",
  () => {

    customCursor
      .classList
      .add(
        "visible"
      );

  }
);



const cursorTargets =
  document.querySelectorAll(
    `
    button,
    a,
    .skill-box,
    .software-marquee
    `
  );



cursorTargets.forEach(
  (target) => {

    target.addEventListener(
      "mouseenter",
      () => {

        customCursor
          .classList
          .add(
            "is-interactive"
          );

      }
    );


    target.addEventListener(
      "mouseleave",
      () => {

        customCursor
          .classList
          .remove(
            "is-interactive"
          );

      }
    );

  }
);



/* =========================================================
   SCANNER
========================================================= */

const scannerHorizontal =
  document.getElementById(
    "scannerHorizontal"
  );


const scannerVertical =
  document.getElementById(
    "scannerVertical"
  );


let scanDirection =
  "horizontal";



function runScanner() {

  scannerHorizontal
    .classList
    .remove(
      "is-scanning"
    );


  scannerVertical
    .classList
    .remove(
      "is-scanning"
    );


  /* force reflow */

  void scannerHorizontal.offsetWidth;

  void scannerVertical.offsetWidth;



  if (
    scanDirection ===
    "horizontal"
  ) {

    scannerHorizontal
      .classList
      .add(
        "is-scanning"
      );


    scanDirection =
      "vertical";

  }

  else {

    scannerVertical
      .classList
      .add(
        "is-scanning"
      );


    scanDirection =
      "horizontal";

  }

}



runScanner();



setInterval(
  runScanner,
  6500
);



/* =========================================================
   SOFTWARE MARQUEE
   AUTO + DRAG + MOMENTUM
========================================================= */

const softwareTrack =
  document.getElementById(
    "softwareTrack"
  );


const softwareMarquee =
  document.getElementById(
    "softwareMarquee"
  );



if (
  softwareTrack &&
  softwareMarquee
) {


  /* =======================================================
     duplicate contents once for seamless looping
  ======================================================== */

  if (
    !softwareTrack.dataset.cloned
  ) {

    const originalItems =
      Array.from(
        softwareTrack.children
      );


    originalItems.forEach(
      (item) => {

        const clone =
          item.cloneNode(
            true
          );


        clone.setAttribute(
          "aria-hidden",
          "true"
        );


        softwareTrack.appendChild(
          clone
        );

      }
    );


    softwareTrack.dataset.cloned =
      "true";

  }



  /* =======================================================
     marquee state
  ======================================================== */

  let marqueeX =
    0;


  let dragging =
    false;


  let pointerStartX =
    0;


  let marqueeStartX =
    0;


  let previousPointerX =
    0;


  let velocity =
    0;


  let lastFrameTime =
    performance.now();



  /*
    px per second
  */

  const autoSpeed =
    24;



  /* =======================================================
     width of one copy
  ======================================================== */

  function getLoopWidth() {

    return (
      softwareTrack.scrollWidth /
      2
    );

  }



  /* =======================================================
     seamless wrapping
  ======================================================== */

  function normalizeMarquee() {

    const loopWidth =
      getLoopWidth();


    if (
      !loopWidth
    ) {

      return;

    }


    while (
      marqueeX <=
      -loopWidth
    ) {

      marqueeX +=
        loopWidth;

    }


    while (
      marqueeX >
      0
    ) {

      marqueeX -=
        loopWidth;

    }

  }



  /* =======================================================
     pointer down
  ======================================================== */

  softwareMarquee.addEventListener(
    "pointerdown",
    (event) => {

      dragging =
        true;


      pointerStartX =
        event.clientX;


      marqueeStartX =
        marqueeX;


      previousPointerX =
        event.clientX;


      velocity =
        0;


      softwareMarquee
        .classList
        .add(
          "is-dragging"
        );


      customCursor
        .classList
        .add(
          "is-dragging"
        );


      softwareMarquee
        .setPointerCapture(
          event.pointerId
        );

    }
  );



  /* =======================================================
     pointer move
  ======================================================== */

  softwareMarquee.addEventListener(
    "pointermove",
    (event) => {

      if (
        !dragging
      ) {

        return;

      }


      const dragDistance =
        event.clientX -
        pointerStartX;


      marqueeX =
        marqueeStartX +
        dragDistance;


      /*
        velocity based on
        current pointer delta
      */

      velocity =
        event.clientX -
        previousPointerX;


      previousPointerX =
        event.clientX;


      normalizeMarquee();

    }
  );



  /* =======================================================
     pointer release
  ======================================================== */

  function stopDragging(
    event
  ) {

    if (
      !dragging
    ) {

      return;

    }


    dragging =
      false;


    softwareMarquee
      .classList
      .remove(
        "is-dragging"
      );


    customCursor
      .classList
      .remove(
        "is-dragging"
      );


    if (
      softwareMarquee
        .hasPointerCapture(
          event.pointerId
        )
    ) {

      softwareMarquee
        .releasePointerCapture(
          event.pointerId
        );

    }

  }



  softwareMarquee.addEventListener(
    "pointerup",
    stopDragging
  );


  softwareMarquee.addEventListener(
    "pointercancel",
    stopDragging
  );



  /* =======================================================
     wheel / trackpad horizontal support
  ======================================================== */

  softwareMarquee.addEventListener(
    "wheel",
    (event) => {

      /*
        horizontal trackpad or
        shift + wheel
      */

      const amount =
        Math.abs(
          event.deltaX
        ) >
        Math.abs(
          event.deltaY
        )

          ? event.deltaX

          : event.shiftKey
            ? event.deltaY
            : 0;


      if (
        amount ===
        0
      ) {

        return;

      }


      event.preventDefault();


      marqueeX -=
        amount;


      velocity =
        -amount *
        .12;


      normalizeMarquee();

    },
    {
      passive: false
    }
  );



  /* =======================================================
     animation
  ======================================================== */

  function animateMarquee(
    currentTime
  ) {

    const deltaTime =
      Math.min(
        (
          currentTime -
          lastFrameTime
        ) /
        1000,

        .05
      );


    lastFrameTime =
      currentTime;



    if (
      !dragging
    ) {


      /* momentum */

      if (
        Math.abs(
          velocity
        ) >
        .03
      ) {

        marqueeX +=
          velocity *
          2.1;


        velocity *=
          .9;

      }


      /* when inertia finishes,
         continue auto-scroll */

      else {

        velocity =
          0;


        marqueeX -=
          autoSpeed *
          deltaTime;

      }

    }



    normalizeMarquee();



    softwareTrack.style.transform =
      `translate3d(${marqueeX}px, 0, 0)`;



    requestAnimationFrame(
      animateMarquee
    );

  }



  requestAnimationFrame(
    animateMarquee
  );

}



/* =========================================================
   PREVENT IMAGE DRAG
========================================================= */

document
  .querySelectorAll(
    "img"
  )
  .forEach(
    (image) => {

      image.setAttribute(
        "draggable",
        "false"
      );

    }
  );