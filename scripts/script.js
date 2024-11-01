let scale = 1;
let posX = 0;
let posY = 0;

const image = document.getElementById("image");
const background = document.getElementById("background");
const playback = document.querySelectorAll(".playback");
const screenContent = document.querySelector(".screen-content");
const audiobox = document.querySelectorAll(".audiobox");
const closeButton = document.querySelector(".close_modal");
const modal = document.querySelector(".modal");
const audioPlayer = document.querySelector(".audiotrack");
const playButton = document.querySelector(".playButton");
const pauseButton = document.querySelector(".pauseButton");
const volumeControl = document.querySelector(".volumeControl");
const progressControl = document.querySelector(".progressControl");
const currentTimeText = document.querySelector(".currentTime__text");
const durationText = document.querySelector(".duration__text");

// Увеличение/уменьшение изображения с помощью колесика мыши
background.addEventListener("wheel", (evt) => {
  evt.preventDefault();
  if (evt.deltaY < 0) {
    scale += 0.1; // Увеличиваем масштаб
  } else {
    scale -= 0.1; // Уменьшаем масштаб
  }
  
  // Ограничение масштаба от 0.5 до 3
  scale = Math.min(Math.max(0.5, scale), 3);
  updateTransform();
});

// Обновление трансформации с учетом ограничений
function updateTransform() {
  // image.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
  image.style.transform = `translate(-50%, -50%) translate(${posX}px, ${posY}px) scale(${scale})`;
  // Ограничение перемещения по оси X
  const imageRect = image.getBoundingClientRect();
  const bgRect = background.getBoundingClientRect();

  // if (imageRect.left > bgRect.left) {
  //   posX = bgRect.left;
  // }
  // if (imageRect.right < bgRect.right) {
  //   posX = bgRect.right - imageRect.width;
  // }

  // if (imageRect.left > bgRect.left) {
  //   posX = bgRect.left / 2; // Центрируем изображение
  // }
  // if (imageRect.right < bgRect.right) {
  //   posX = bgRect.right ; // Центрируем изображение
  // }

  // Ограничение перемещения по оси Y
  // if (imageRect.top > bgRect.top) {
  //   posY = bgRect.top;
  // }
  // if (imageRect.bottom < bgRect.bottom) {
  //   posY = bgRect.bottom - imageRect.height;
  // }

  // if (imageRect.top > bgRect.top) {
  //   posY = bgRect.top ; // Центрируем изображение
  // }
  // if (imageRect.bottom < bgRect.bottom) {
  //   posY = bgRect.bottom; // Центрируем изображение
  //   console.log(imageRect.bottom )
  // }

  // Обновляем трансформацию после применения ограничений
  // image.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
  image.style.transform = `translate(-50%, -50%) translate(${posX}px, ${posY}px) scale(${scale})`;
}

// Перемещение изображения
let isDragging = false;
let startX, startY;

background.addEventListener("mousedown", (evt) => {
  isDragging = true;
  startX = evt.clientX - posX;
  startY = evt.clientY - posY;
});

background.addEventListener("mouseup", () => {
  isDragging = false;
});

background.addEventListener("mousemove", (evt) => {
  if (isDragging) {
    posX = evt.clientX - startX;
    posY = evt.clientY - startY;
    updateTransform();
  }
});

background.addEventListener("mouseleave", () => {
  isDragging = false; // Остановка перетаскивания при выходе мыши
});

// Поддержка сенсорных экранов
let initialDistance = null;

background.addEventListener("touchstart", (evt) => {
  if (evt.touches.length === 1) {
    // Убедитесь, что только один палец на экране
    isDragging = true;
    startX = evt.touches[0].clientX - posX;
    startY = evt.touches[0].clientY - posY;
    initialDistance = null; // Сброс расстояния при новом касании
  } else if (evt.touches.length === 2) {
    // Если два пальца на экране
    initialDistance = getDistance(evt.touches[0], evt.touches[1]);
    isDragging = false; // Остановка перетаскивания при использовании двух пальцев
  }
});

background.addEventListener("touchmove", (evt) => {
  if (isDragging && evt.touches.length === 1) {
    posX = evt.touches[0].clientX - startX;
    posY = evt.touches[0].clientY - startY;
    updateTransform();
    evt.preventDefault(); // Предотвращаем прокрутку страницы
  } else if (evt.touches.length === 2 && initialDistance !== null) {
    const currentDistance = getDistance(evt.touches[0], evt.touches[1]);
    scale *= currentDistance / initialDistance; // Масштабируем изображение по расстоянию между пальцами
    scale = Math.min(Math.max(1, scale), 3); // Ограничиваем масштаб от 1 до 3
    initialDistance = currentDistance; // Обновляем начальное расстояние
    updateTransform();
    evt.preventDefault(); // Предотвращаем прокрутку страницы
  }
});

background.addEventListener("touchend", () => {
  isDragging = false; // Остановка перетаскивания при отпускании пальца
});

function getDistance(touch1, touch2) {
  const dx = touch2.clientX - touch1.clientX;
  const dy = touch2.clientY - touch1.clientY;
  return Math.sqrt(dx * dx + dy * dy); // Расстояние между двумя касаниями
}

let isTouching = false;

for (let i = 0; i < playback.length; i++) {
  playback[i].addEventListener("click", () => {
    if (!isTouching) {
      openPopup(i)
    }
    });
  playback[i].addEventListener("touchstart", () => {
    isTouching = true;
    openPopup(i)
  });
  playback[i].addEventListener("touchend", () => {
    isTouching = false;
  });
}

// Открываем попап
function openPopup (n) {
  modal.style.display = "flex";
  audioPlayer.innerHTML = audiobox[n].innerHTML;
  const audio = modal.querySelector(".audio");
  audio.setAttribute("autoplay", true);
  // Обновление прогресса аудиодорожки
  audio.addEventListener("timeupdate", () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressControl.value = progress; // Обновляем значение полосы прокрутки
    audio.volume = volumeControl.value; // Обновляем значение уровня громкости
    currentTimeText.textContent = (audio.currentTime/100).toFixed(2);
    durationText.textContent = (audio.duration/100).toFixed(2);
  });
};
// Функции закрытия попапов
const closePopup = () => {
  const audio = modal.querySelector(".audio");
  modal.style.display = "none";
  audio.pause();
};
const closeByEsc = (evt) => {
  if (evt.key === "Escape") {
    closePopup();
  }
};
const closeByOverlay = (evt) => {
  if (evt.target === evt.currentTarget) {
    closePopup();
  }
};

// Воспроизведение аудио
function playAudio() {
  const audio = modal.querySelector(".audio");
  audio.play();
}
playButton.addEventListener("click", playAudio);

// Пауза аудио
pauseButton.addEventListener("click", () => {
  const audio = modal.querySelector(".audio");
  audio.pause();
});

// Регулировка громкости
volumeControl.addEventListener("input", function () {
  const audio = modal.querySelector(".audio");
  audio.volume = this.value;
});

// Перемотка аудио по полосе прокрутки
progressControl.addEventListener("input", function () {
  const audio = modal.querySelector(".audio");
  const newTime = (this.value / 100) * audio.duration; // Вычисляем новое время
  audio.currentTime = newTime; // Устанавливаем новое время воспроизведения
});

// Закрываем попап
closeButton.addEventListener("click", closePopup);
modal.addEventListener("touchstart", closeByOverlay);
window.addEventListener("keyup", closeByEsc);


