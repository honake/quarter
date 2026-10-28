// QUARTER landing page — the only script on the page.
// Runs the level-fit difficulty carousel, keeps every video usable when autoplay
// is refused, and fires the app's marker ink-sweeps once each as their phrases
// enter view. The hero word reveal is pure CSS and needs nothing here. Decorative motion collapses to its final state under
// prefers-reduced-motion; the hero tour keeps playing because the journey itself
// is the content.

const calmMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* Video ---------------------------------------------------------------- */

const carousel = document.querySelector("[data-demo]");
const clips = carousel ? [...carousel.querySelectorAll(".media-video")] : [];
const levelTabs = carousel ? [...carousel.querySelectorAll(".level-tab")] : [];
const caption = carousel ? carousel.querySelector("[data-demo-caption]") : null;
const audioToggle = carousel ? carousel.querySelector("[data-demo-audio]") : null;
const contentVideos = [...document.querySelectorAll("video[data-autoplay-content]")];
const looping = [...document.querySelectorAll("video[loop]:not([data-autoplay-content])")];
let level = 0;
let audioEnabled = false;

function start(video) {
  const started = video.play();
  // Autoplay can still be refused (battery saver, browser policy). Fall back to controls.
  if (started && typeof started.catch === "function") {
    started.catch(() => {
      video.controls = true;
    });
  }
}

// Hiding a clip also rewinds it, so the one being shown is already at its first
// frame and never has to be seeked — a clip that has not loaded yet would
// refuse the seek anyway.
function showLevel(next, autoplay) {
  level = (next + clips.length) % clips.length;
  clips.forEach((clip, index) => {
    if (index === level) {
      clip.hidden = false;
      if (!clip.getAttribute("src") && clip.dataset.src) clip.src = clip.dataset.src;
      return;
    }
    clip.hidden = true;
    clip.pause();
    if (clip.currentTime) clip.currentTime = 0;
  });
  for (const [index, tab] of levelTabs.entries()) {
    tab.classList.toggle("is-active", index === level);
    tab.setAttribute("aria-pressed", index === level ? "true" : "false");
  }
  const active = clips[level];
  if (caption && levelTabs[level]) caption.textContent = levelTabs[level].dataset.caption || "";
  active.muted = !audioEnabled;
  if (audioEnabled && active.currentTime) active.currentTime = 0;
  active.controls = !autoplay;
  if (autoplay) start(active);
  else active.pause();
}

for (const [index, tab] of levelTabs.entries()) {
  tab.addEventListener("click", () => showLevel(index, audioEnabled || !calmMotion.matches));
}

function renderAudioToggle() {
  if (!audioToggle) return;
  const label = audioEnabled ? audioToggle.dataset.labelPlaying : audioToggle.dataset.labelMuted;
  audioToggle.textContent = label;
  audioToggle.setAttribute("aria-label", label);
  audioToggle.setAttribute("aria-pressed", audioEnabled ? "true" : "false");
}

if (audioToggle) {
  audioToggle.addEventListener("click", () => {
    audioEnabled = !audioEnabled;
    renderAudioToggle();
    if (audioEnabled) {
      showLevel(level, true);
    } else if (clips[level]) {
      clips[level].muted = true;
    }
  });
  renderAudioToggle();
}

// One level plays, then the next, cycling: a visitor who stays put still sees
// all three. Never under reduced motion, where nothing may move on its own.
for (const clip of clips) {
  clip.addEventListener("ended", () => {
    if (calmMotion.matches) return;
    showLevel(level + 1, true);
  });
}

function applyMotionPreference() {
  // The full-journey tour is informational rather than decorative, so reduced
  // motion does not pause it. Autoplay refusal still exposes native controls.
  for (const video of contentVideos) {
    video.controls = false;
    start(video);
  }
  for (const video of looping) {
    if (calmMotion.matches) {
      video.pause();
      video.controls = true;
      continue;
    }
    video.controls = false;
    start(video);
  }
  if (clips.length) showLevel(level, audioEnabled || !calmMotion.matches);
}

applyMotionPreference();

if (typeof calmMotion.addEventListener === "function") {
  calmMotion.addEventListener("change", applyMotionPreference);
}

/* Celebration ---------------------------------------------------------- */

const marks = document.querySelectorAll("[data-mark]");
const chips = document.querySelectorAll("[data-chip]");

// The chip belongs to the mark it sits next to, so a section can never light a
// stranger's bubble.
function chipFor(mark) {
  return mark.parentElement ? mark.parentElement.querySelector("[data-chip]") : null;
}

function settle() {
  for (const mark of marks) {
    mark.classList.add("is-lit");
  }
  for (const chip of chips) {
    chip.classList.add("is-shown");
  }
}

function celebrate(mark) {
  const delay = Number(mark.dataset.delay || 0);
  window.setTimeout(() => {
    mark.classList.add("is-lit");
    const chip = chipFor(mark);
    if (chip) {
      window.setTimeout(() => chip.classList.add("is-shown"), 300);
    }
  }, delay);
}

if (calmMotion.matches || typeof window.IntersectionObserver !== "function") {
  settle();
} else {
  const watcher = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        watcher.unobserve(entry.target);
        celebrate(entry.target);
      }
    },
    { rootMargin: "0px 0px -10% 0px" }
  );
  for (const mark of marks) {
    watcher.observe(mark);
  }
}

/* FAQ deep link --------------------------------------------------------- */

// The cost card links to #faq-free; a <details> target that stays closed would
// scroll to a shut row, so the anchor opens it.
const freeFaq = document.querySelector("#faq-free");

if (freeFaq) {
  const openFromHash = () => {
    if (window.location.hash === "#faq-free") freeFaq.open = true;
  };
  window.addEventListener("hashchange", openFromHash);
  openFromHash();
}
