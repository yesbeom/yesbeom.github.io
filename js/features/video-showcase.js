import { formatTime } from "../utils/format.js";

const initPlayer = (player) => {
  const video = player.querySelector("video");
  const track = player.querySelector("[data-seek-track]");
  if (!video || !track) return;

  const playButton = player.querySelector("[data-play-toggle]");
  const fullscreenButton = player.querySelector("[data-fullscreen]");
  const fill = player.querySelector("[data-seek-fill]");
  const currentLabel = player.querySelector("[data-seek-current]");
  const durationLabel = player.querySelector("[data-seek-duration]");

  const render = (time) => {
    const ratio = video.duration ? Math.min(time / video.duration, 1) : 0;
    if (fill) fill.style.width = `${ratio * 100}%`;
    if (currentLabel) currentLabel.textContent = formatTime(time);
  };

  const syncDuration = () => {
    if (durationLabel) durationLabel.textContent = formatTime(video.duration);
    render(video.currentTime);
  };

  if (video.readyState >= 1) syncDuration();
  video.addEventListener("loadedmetadata", syncDuration);
  video.addEventListener("timeupdate", () => render(video.currentTime));

  const togglePlay = () => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  playButton?.addEventListener("click", togglePlay);
  video.addEventListener("click", togglePlay);

  video.addEventListener("play", () => {
    player.classList.add("is-playing");
    if (playButton) playButton.textContent = "❚❚";
  });
  video.addEventListener("pause", () => {
    player.classList.remove("is-playing");
    if (playButton) playButton.textContent = "▶";
  });

  fullscreenButton?.addEventListener("click", () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      player.requestFullscreen?.();
    }
  });

  const seekToEvent = (event) => {
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    const time = ratio * video.duration;
    video.currentTime = time;
    render(time);
  };

  track.addEventListener("pointerdown", (event) => {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    event.preventDefault();
    track.setPointerCapture(event.pointerId);
    seekToEvent(event);

    const onMove = (moveEvent) => seekToEvent(moveEvent);
    const stopScrub = () => {
      track.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerup", stopScrub);
      track.removeEventListener("pointercancel", stopScrub);
    };

    track.addEventListener("pointermove", onMove);
    track.addEventListener("pointerup", stopScrub);
    track.addEventListener("pointercancel", stopScrub);
  });
};

export function initVideoShowcase() {
  document.querySelectorAll("[data-video-player]").forEach(initPlayer);
}
