"use strict";

document.querySelector(
  "header span"
).textContent = chrome.runtime.getManifest().name;

const isPlaySoundInput = document.querySelector("#isPlaySound");
const isShowImageInput = document.querySelector("#isShowImage");
const isInsaneModeInput = document.querySelector("#isInsaneMode");

// load and show options
chrome.storage.sync.get(
  {
    options: DEFAULT_OPTIONS,
  },
  function ({ options }) {
    l("storage.get()", options);

    isPlaySoundInput.checked = options.isPlaySound;
    isShowImageInput.checked = options.isShowImage;
    isInsaneModeInput.checked = options.isInsaneMode;
  }
);

// save options
document.querySelector("form").addEventListener("input", function (event) {
  const options = {
    isPlaySound: isPlaySoundInput.checked,
    isShowImage: isShowImageInput.checked,
    isInsaneMode: isInsaneModeInput.checked,
  };
  chrome.storage.sync.set({
    options,
  });
});
