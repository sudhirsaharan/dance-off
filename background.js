"use strict";

const NUMBER_OF_SOUNDS = 16;
const SOUND_FILE_PATH = "sound/Elon Musk - Quote %.mp3";
const NUMBER_OF_SOUNDS_IN_INSANE_MODE = 5;

let options;
let sounds = new Set();

chrome.runtime.onMessage.addListener(function () {
  l("");
  l("runtime.onMessage()");

  // stop and remove previous sounds
  sounds.forEach((sound) => sound.pause());
  sounds.clear();

  if (options.isInsaneMode) {
    for (let i = 0; i < NUMBER_OF_SOUNDS_IN_INSANE_MODE; ++i) {
      createRandomSound();
    }
  } else {
    createRandomSound();
  }
});

function createRandomSound() {
  const audio = new Audio(
    SOUND_FILE_PATH.replace("%", getRandomInteger(1, NUMBER_OF_SOUNDS))
  );
  audio.addEventListener("canplay", function () {
    audio.play();
  });
  sounds.add(audio);
  audio.addEventListener("ended", function () {
    sounds.delete(this);
  });
}

function getRandomInteger(from, to) {
  const num = Math.floor(from + Math.random() * (to - from + 1));
  l("getRandomInteger()", from, to, "->", num);
  return num;
}

chrome.storage.sync.get(
  {
    options: { isPlaySound: false, isShowImage: true, isInsaneMode: false },
  },
  function (items) {
    l("storage.get()", items);

    options = items.options;
  }
);

chrome.storage.onChanged.addListener(function ({ options: { newValue } }) {
  l("storage.onChanged()", newValue);

  options = newValue;
});

// dev
Object.defineProperty(window, "s", {
  get() {
    console.group("current state");
    l("options", options);
    l("sounds", sounds);

    chrome.storage.sync.get(function (items) {
      l("storage.get()", items);
      console.groupEnd();
    });
  },
});
