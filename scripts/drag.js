const image = document.querySelector(".img__container");
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

dragElement(image);

let scale = 1; // Начальный масштаб
let initialDistance = null;
let isTouching = false; // Проверка на татч

// Перетаскивание элементов
function dragElement(elmnt) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  elmnt.addEventListener("mousedown", dragMouseDown);
  elmnt.addEventListener("touchstart", dragMouseDown); // Для мобильных устройств
  document.addEventListener("mouseup", closeDragElement);
  document.addEventListener("touchend", closeDragElement); // Для мобильных устройств

  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX || e.touches[0].clientX;
    pos4 = e.clientY || e.touches[0].clientY;
    document.addEventListener("mousemove", elementDrag);
    document.addEventListener("touchmove", elementDrag); // Для мобильных устройств
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - (e.clientX || e.touches[0].clientX);
    pos2 = pos4 - (e.clientY || e.touches[0].clientY);
    pos3 = e.clientX || e.touches[0].clientX;
    pos4 = e.clientY || e.touches[0].clientY;

    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    document.removeEventListener("mousemove", elementDrag);
    document.removeEventListener("touchmove", elementDrag); // Для мобильных устройств
  }
}

// Функция для вычисления расстояния между двумя касаниями
function getDistance(touch1, touch2) {
  const dx = touch2.clientX - touch1.clientX;
  const dy = touch2.clientY - touch1.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// Обработчик события touchstart для масштабирования
background.addEventListener("touchstart", (e) => {
  if (e.touches.length === 2) {
    // Проверяем, что два пальца на экране
    initialDistance = getDistance(e.touches[0], e.touches[1]);
  }
});

// Обработчик события touchmove для масштабирования
background.addEventListener("touchmove", (e) => {
  if (e.touches.length === 2 && initialDistance !== null) {
    const currentDistance = getDistance(e.touches[0], e.touches[1]);

    scale *= currentDistance / initialDistance; // Масштабируем изображение по расстоянию между пальцами
    scale = Math.min(Math.max(0.33, scale), 3); // Ограничиваем масштаб от 0.33 до 3

    image.style.transform = `translate(-50%, -50%) scale(${scale})`; // Применяем масштабирование

    initialDistance = currentDistance; // Обновляем начальное расстояние
  }
});

// Обработчик события touchend для сброса начального расстояния
background.addEventListener("touchend", () => {
  initialDistance = null; // Сбрасываем начальное расстояние при завершении касания
});

for (let i = 0; i < playback.length; i++) {
  playback[i].addEventListener("click", () => {
    if (!isTouching) {
      openPopup(i);
    }
  });
  playback[i].addEventListener("touchstart", () => {
    isTouching = true;
    openPopup(i);
  });
  playback[i].addEventListener("touchend", () => {
    isTouching = false;
  });
}

// Открываем попап
function openPopup(n) {
  modal.style.display = "flex";
  audioPlayer.innerHTML = audiobox[n].innerHTML;
  const audio = modal.querySelector(".audio");
  audio.setAttribute("autoplay", true);

  // Обновление прогресса аудиодорожки
  audio.addEventListener("timeupdate", () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressControl.value = progress; // Обновляем значение полосы прокрутки
    audio.volume = volumeControl.value; // Обновляем значение уровня громкости
    currentTimeText.textContent = (audio.currentTime / 100).toFixed(2);
    durationText.textContent = (audio.duration / 100).toFixed(2);
  });
}
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
