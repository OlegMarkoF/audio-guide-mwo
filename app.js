/**
 * Аудиогид — Музей Мирового океана
 * Карта на Leaflet + ImageOverlay (ощущение настоящей карты)
 */

(() => {
  "use strict";

  // ========== КОНФИГ ==========
  // Координаты точек: x и y в долях от ширины/высоты изображения (0..1)
  // 0,0 — левый верхний угол картинки
  const POINTS = [
    {
      id: "vitiaz",
      title: "Витязь",
      description: "История научно-исследовательского судна «Витязь»",
      audio: "./content/Аудиогид_Витязь/001.mp3",
      x: 0.57,
      y: 0.52,
    },
    {
      id: "mkk",
      title: "Морской конный клуб",
      description: "О морском конном клубе",
      audio: "./content/Аудиогид_Витязь/002.mp3",
      x: 0.40,
      y: 0.35,
    },
    {
      id: "bpl",
      title: "БПЛ",
      description: "Объект БПЛ",
      audio: "./content/Аудиогид_Витязь/003.mp3",
      x: 0.10,
      y: 0.40,
    },
  ];

  const MAP_IMAGE = "./content/img/территория.png";

  // ========== DOM ==========
  const modal = document.getElementById("modal");
  const backdrop = modal.querySelector(".modal-backdrop");
  const closeBtn = modal.querySelector(".close-btn");
  const modalTitle = modal.querySelector(".modal-title");
  const modalDesc = modal.querySelector(".modal-desc");
  const audioContainer = modal.querySelector(".audio-container");
  const playBtn = modal.querySelector(".play-btn");
  const iconPlay = playBtn.querySelector(".icon-play");
  const iconPause = playBtn.querySelector(".icon-pause");
  const progress = modal.querySelector(".progress");
  const timeCurrent = modal.querySelector(".time-current");
  const timeDuration = modal.querySelector(".time-duration");
  const volume = modal.querySelector(".volume");
  const statusEl = modal.querySelector(".status");
  const fitBtn = document.getElementById("fitBtn");

  let map = null;
  let imageOverlay = null;
  let bounds = null;
  let currentAudio = null;
  let isSeeking = false;
  let mapReady = false;

  // ========== УТИЛИТЫ ==========

  function formatTime(sec) {
    if (!Number.isFinite(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function setPlayingUI(playing) {
    iconPlay.hidden = playing;
    iconPause.hidden = !playing;
  }

  // ========== КАРТА ==========

  function initMap(imgWidth, imgHeight) {
    // CRS.Simple: координаты в пикселях изображения
    // y растёт вниз, поэтому bounds: [[0,0], [height, width]] → юг-запад / север-восток
    bounds = L.latLngBounds([0, 0], [imgHeight, imgWidth]);

    map = L.map("map", {
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: 2,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      maxBounds: bounds.pad(0.15),      // небольшой запас, но не улетаем далеко
      maxBoundsViscosity: 0.85,
      attributionControl: false,
      zoomControl: false,             // на телефоне зум пальцами
    });

    imageOverlay = L.imageOverlay(MAP_IMAGE, bounds, {
      interactive: false,
      opacity: 1,
    }).addTo(map);

    // Подгоняем под экран
    map.fitBounds(bounds, { padding: [12, 12] });

    // Кастомная иконка маркера
    const icon = L.divIcon({
      className: "audio-marker",
      html: `<div class="marker-pin"><span>🎧</span></div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 44],       // острие пина
      popupAnchor: [0, -40],
    });

    // Добавляем точки
    POINTS.forEach((p) => {
      // x,y — доли от 0 до 1 → координаты Leaflet (y, x) потому что [lat, lng] = [row, col]
      const lat = p.y * imgHeight;
      const lng = p.x * imgWidth;

      const marker = L.marker([lat, lng], { icon, title: p.title }).addTo(map);

      marker.on("click", () => openPlayer(p));
    });

    mapReady = true;
  }

  function loadImageAndInit() {
    const img = new Image();
    img.onload = () => {
      initMap(img.naturalWidth, img.naturalHeight);
    };
    img.onerror = () => {
      // Fallback, если картинка не найдена — условные размеры
      console.warn("Карта не загрузилась, используются размеры по умолчанию");
      initMap(2000, 1200);
    };
    img.src = MAP_IMAGE;
  }

  // ========== ПЛЕЕР ==========

  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.removeAttribute("src");
      currentAudio.load();
      currentAudio = null;
    }
    setPlayingUI(false);
    progress.value = 0;
    timeCurrent.textContent = "0:00";
    timeDuration.textContent = "0:00";
    statusEl.textContent = "";
    statusEl.classList.remove("error");
  }

  function openPlayer(point) {
    stopAudio();

    modalTitle.textContent = point.title;
    modalDesc.textContent = point.description || "";

    audioContainer.innerHTML = "";
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.src = point.audio;
    audioContainer.appendChild(audio);
    currentAudio = audio;

    statusEl.textContent = "Загрузка…";

    audio.addEventListener("loadedmetadata", () => {
      timeDuration.textContent = formatTime(audio.duration);
      statusEl.textContent = "";
    });

    audio.addEventListener("canplay", () => {
      statusEl.textContent = "";
    });

    audio.addEventListener("waiting", () => {
      statusEl.textContent = "Буферизация…";
    });

    audio.addEventListener("playing", () => setPlayingUI(true));
    audio.addEventListener("pause", () => setPlayingUI(false));

    audio.addEventListener("ended", () => {
      setPlayingUI(false);
      progress.value = 0;
      timeCurrent.textContent = "0:00";
    });

    audio.addEventListener("error", () => {
      statusEl.textContent = "Не удалось загрузить аудио";
      statusEl.classList.add("error");
    });

    audio.addEventListener("timeupdate", () => {
      if (isSeeking || !audio.duration) return;
      progress.value = (audio.currentTime / audio.duration) * 100;
      timeCurrent.textContent = formatTime(audio.currentTime);
    });

    // Автостарт
    audio.play().catch(() => {
      statusEl.textContent = "Нажмите ▶ для воспроизведения";
    });

    modal.classList.add("is-open");
  }

  function closePlayer() {
    stopAudio();
    modal.classList.remove("is-open");
  }

  // Управление
  playBtn.addEventListener("click", () => {
    if (!currentAudio) return;
    if (currentAudio.paused) {
      currentAudio.play().catch(() => {
        statusEl.textContent = "Не удалось воспроизвести";
        statusEl.classList.add("error");
      });
    } else {
      currentAudio.pause();
    }
  });

  volume.addEventListener("input", () => {
    if (currentAudio) currentAudio.volume = Number(volume.value);
  });

  progress.addEventListener("pointerdown", () => { isSeeking = true; });
  progress.addEventListener("pointerup", () => { isSeeking = false; });
  progress.addEventListener("input", () => {
    if (!currentAudio || !currentAudio.duration) return;
    const t = (Number(progress.value) / 100) * currentAudio.duration;
    currentAudio.currentTime = t;
    timeCurrent.textContent = formatTime(t);
  });

  closeBtn.addEventListener("click", closePlayer);
  backdrop.addEventListener("click", closePlayer);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closePlayer();
    }
  });

  fitBtn.addEventListener("click", () => {
    if (map && bounds) {
      map.fitBounds(bounds, { padding: [12, 12], animate: true });
    }
  });

  // ========== СТАРТ ==========
  loadImageAndInit();
})();
