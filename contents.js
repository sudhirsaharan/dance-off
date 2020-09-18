"use strict";

const REG_EXP = /\bwar\b|\bPutin\b|\bTrump\b|\bModi\b|\bCrisis\b/;
const UNIQUE_STRING = "a25b49bd077402a818a5bc2cbf2d28f";

const IMAGE_WIDTH = 330;
const IMAGE_HEIGHT = 510;

const IMAGE_ANGLE_MAX_RANDOM_DEVIATION = 30; // 360 * 2 is more fun
const IMAGE_SCALE_MAX_RANDOM_DEVIATION = 0.5;

// seconds
const IMAGE_TIMEOUT = 12.6;
const IMAGE_TIMEOUT_MAX_RANDOM_BOOST = 3;

// msec
const IMAGE_TRANSITION_DELAY = 100;

const NUMBER_OF_IMAGES_IN_INSANE_MODE = 10;

let options;
const isMainPage = top === window;

// detect new elements on page
new MutationObserver(function (mutationRecords) {
  for (const mutationRecord of mutationRecords) {
    const addedNodes = mutationRecord.addedNodes;

    if (addedNodes.length === 0) {
      continue;
    }

    for (const node of mutationRecord.addedNodes) {
      if (isTextContainsRegExp(node.textContent)) {
        showImage();
        playSound();
        return;
      }
    }
  }
}).observe(document.body, { childList: true, subtree: true });

function isTextContainsRegExp(text) {
  return REG_EXP.test(text);
}

function showImage() {
  l("showImage()");

  if (!options.isShowImage) {
    l("no need");
    return;
  }

  // remove previous images
  document
    .querySelectorAll("img." + UNIQUE_STRING)
    .forEach((img) => img.remove());

  if (isMainPage) {
    // show image only if in main page
    if (options.isInsaneMode) {
      for (let i = 0; i < NUMBER_OF_IMAGES_IN_INSANE_MODE; ++i) {
        setTimeout(showImageInInsaneMode, Math.random() * 1000);
      }
    } else {
      showImageInCorner();
    }
  } else {
    // signal for main page to show image
    top.postMessage(UNIQUE_STRING, "*");
  }
}

function createTimeoutImageOnPage(src) {
  l("createTimeoutImageOnPage('src')");

  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("image/" + src + ".gif");
  img.className = UNIQUE_STRING;
  img.style = `
    position: fixed;
    z-index: 999999;
    pointer-events: none;
  `;

  document.body.append(img);

  setTimeout(function () {
    img.remove();
  }, (IMAGE_TIMEOUT -
    IMAGE_TIMEOUT_MAX_RANDOM_BOOST +
    Math.random() * IMAGE_TIMEOUT_MAX_RANDOM_BOOST) *
    1000);

  return img;
}

function showImageInCorner() {
  // const img1 = createTimeoutImageOnPage("trump");
  const img3 = createTimeoutImageOnPage("trump2");
  const img = createTimeoutImageOnPage("putin");
  const img2 = createTimeoutImageOnPage("mo");
  img.style.left = "40%";
  img.style.bottom = 0;
  //img1.style.right = 0;
  //img1.style.bottom = 0;
  img2.style.right = "15%";
  img2.style.top = "30%";
  img3.style.left = 0;
  img3.style.top = 0;
  // let au = document.getElementsByClassName("UNIQUE_STRING");
  // var audio = new Audio(chrome.runtime.getURL("sounds/boogie.mp3"));
  // img2.addEventListener("mouseover", function (event) {
  //   audio.play();
  //});
}

function showImageInInsaneMode() {
  const img = createTimeoutImageOnPage("trump");
  img.style.left =
    Math.floor(Math.random() * (window.innerWidth - IMAGE_WIDTH)) + "px";
  img.style.bottom =
    Math.floor(Math.random() * (window.innerHeight - IMAGE_HEIGHT)) + "px";

  // random rotation and scale
  const randomAngle =
    Math.random() *
    IMAGE_ANGLE_MAX_RANDOM_DEVIATION *
    Math.sign(Math.random() - 0.5);
  const randomScale =
    Math.random() *
    IMAGE_SCALE_MAX_RANDOM_DEVIATION *
    Math.sign(Math.random() - 0.5);
  const randomDuration = Math.random() * IMAGE_TIMEOUT;
  l(randomAngle.toFixed(2), randomScale.toFixed(2), randomDuration.toFixed(2));
  img.style.transform = `rotate(${randomAngle}deg) scale(${1 - randomScale})`;
  img.style.transitionProperty = "transform";
  img.style.transitionDuration = randomDuration + "s";
  // start transition soon
  setTimeout(function () {
    img.style.transform = `rotate(${-randomAngle}deg) scale(${
      1 + randomScale
    })`;
  }, IMAGE_TRANSITION_DELAY);
}

// listen signal from frame to show image
if (isMainPage) {
  window.addEventListener("message", function (event) {
    if (event.data !== UNIQUE_STRING) {
      return;
    }

    l("msg from extension script in frame", event);
    showImage();
  });
}

function playSound() {
  l("playSound()");

  if (!options.isPlaySound) {
    l("no need");
    return;
  }

  chrome.runtime.sendMessage("");
}

chrome.storage.sync.get(
  {
    options: DEFAULT_OPTIONS,
  },
  function (items) {
    l("storage.get()", items);

    options = items.options;

    // check for keyword after page load
    if (isTextContainsRegExp(document.body.textContent)) {
      showImage();
      playSound();
    }
  }
);

chrome.storage.onChanged.addListener(function ({ options: { newValue } }) {
  l("storage.onChanged()", newValue);

  options = newValue;
});
