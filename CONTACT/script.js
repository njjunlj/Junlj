/* =========================================================
   ELEMENTS
========================================================= */

const cursor = document.getElementById("cursor");
const cursorDot = document.getElementById("cursorDot");

const mailModal = document.getElementById("mailModal");
const openMail = document.getElementById("openMail");
const closeMail = document.getElementById("closeMail");

const sendMail = document.getElementById("sendMail");

const senderEmail = document.getElementById("senderEmail");
const mailSubject = document.getElementById("mailSubject");
const mailMessage = document.getElementById("mailMessage");

const phoneCard = document.getElementById("phoneCard");
const phoneOptions = document.getElementById("phoneOptions");


/* =========================================================
   CUSTOM CURSOR
========================================================= */

let mouseX = 0;
let mouseY = 0;

let cursorX = 0;
let cursorY = 0;


document.addEventListener("mousemove", (event) => {

  mouseX = event.clientX;
  mouseY = event.clientY;

  cursorDot.style.left = `${mouseX}px`;
  cursorDot.style.top = `${mouseY}px`;

});


function animateCursor() {

  cursorX += (mouseX - cursorX) * 0.16;
  cursorY += (mouseY - cursorY) * 0.16;

  cursor.style.left = `${cursorX}px`;
  cursor.style.top = `${cursorY}px`;

  requestAnimationFrame(animateCursor);

}

animateCursor();


const hoverTargets = document.querySelectorAll(
  "a, button, input, textarea"
);


hoverTargets.forEach((element) => {

  element.addEventListener("mouseenter", () => {
    document.body.classList.add("cursor-hover");
  });

  element.addEventListener("mouseleave", () => {
    document.body.classList.remove("cursor-hover");
  });

});


/* =========================================================
   EMAIL MODAL
========================================================= */

function showMailWindow() {

  mailModal.classList.add("open");

  document.body.style.overflow = "hidden";

}


function hideMailWindow() {

  mailModal.classList.remove("open");

  document.body.style.overflow = "";

}


openMail.addEventListener("click", showMailWindow);

closeMail.addEventListener("click", hideMailWindow);


mailModal.addEventListener("click", (event) => {

  if (event.target === mailModal) {

    hideMailWindow();

  }

});


document.addEventListener("keydown", (event) => {

  if (event.key === "Escape") {

    hideMailWindow();

    phoneOptions.classList.remove("open");

    phoneCard.setAttribute(
      "aria-expanded",
      "false"
    );

  }

});


/* =========================================================
   MAILTO SEND
========================================================= */

sendMail.addEventListener("click", () => {

  const receiver =
    "quynhanh258456@gmail.com";

  const subject =
    mailSubject.value.trim() ||
    "Hi June!";

  const sender =
    senderEmail.value.trim();

  let message =
    mailMessage.value.trim();

  if (!message) {

    mailMessage.focus();

    mailMessage.placeholder =
      "you forgot the message :(";

    return;

  }


  /*
    Add sender information inside message
    because mailto cannot control the From field.
  */

  if (sender) {

    message +=
      `\n\n—\nReply to: ${sender}`;

  }


  const mailtoLink =
    `mailto:${receiver}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(message)}`;


  window.location.href =
    mailtoLink;

});


/* =========================================================
   PHONE REVEAL
========================================================= */

phoneCard.addEventListener("click", () => {

  const isOpen =
    phoneOptions.classList.contains("open");


  phoneOptions.classList.toggle("open");


  phoneCard.setAttribute(
    "aria-expanded",
    String(!isOpen)
  );

});


/* =========================================================
   CARD PARALLAX / PLAYFUL MOTION
========================================================= */

const cards =
  document.querySelectorAll(".contact-card");


cards.forEach((card) => {

  card.addEventListener(
    "mousemove",
    (event) => {

      const bounds =
        card.getBoundingClientRect();

      const x =
        event.clientX -
        bounds.left;

      const y =
        event.clientY -
        bounds.top;

      const percentX =
        x / bounds.width -
        0.5;

      const percentY =
        y / bounds.height -
        0.5;


      card.style.setProperty(
        "--mouse-x",
        percentX
      );

      card.style.setProperty(
        "--mouse-y",
        percentY
      );

    }
  );

});


/* =========================================================
   SMALL RANDOM WOBBLE
========================================================= */

const fragments =
  document.querySelectorAll(".fragment");


function randomFragmentPosition() {

  fragments.forEach((fragment) => {

    const x =
      Math.random() * 7 - 3.5;

    const y =
      Math.random() * 7 - 3.5;

    fragment.style.marginLeft =
      `${x}px`;

    fragment.style.marginTop =
      `${y}px`;

  });

}


setInterval(
  randomFragmentPosition,
  1800
);