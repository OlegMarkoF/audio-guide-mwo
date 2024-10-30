let scale = 1;
let posX = 0;
let posY = 0;

const image = document.getElementById("image");
const background = document.getElementById("background");
const playback = document.querySelectorAll(".playback");
const audio = document.querySelectorAll(".audio");
const pause = document.querySelector(".pause");

// Увеличение/уменьшение изображения с помощью колесика мыши
background.addEventListener("wheel", (event) => {
  event.preventDefault();
  scale += event.deltaY * -0.01; // Изменение масштаба
  scale = Math.min(Math.max(1, scale), 3); // Ограничение масштаба от 1 до 3
  updateTransform();
});

// Обновление трансформации с учетом ограничений
function updateTransform() {
  image.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;

  // Ограничение перемещения по оси X
  const imageRect = image.getBoundingClientRect();
  const bgRect = background.getBoundingClientRect();

  if (imageRect.left > bgRect.left) {
    posX = bgRect.left;
  }
  if (imageRect.right < bgRect.right) {
    posX = bgRect.right - imageRect.width;
  }

  // Ограничение перемещения по оси Y
  if (imageRect.top > bgRect.top) {
    posY = bgRect.top;
  }
  if (imageRect.bottom < bgRect.bottom) {
    posY = bgRect.bottom - imageRect.height;
  }

  // Обновляем трансформацию после применения ограничений
  image.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

// Перемещение изображения
let isDragging = false;
let startX, startY;

background.addEventListener("mousedown", (event) => {
  isDragging = true;
  startX = event.clientX - posX;
  startY = event.clientY - posY;
});

background.addEventListener("mouseup", () => {
  isDragging = false;
});

background.addEventListener("mousemove", (event) => {
  if (isDragging) {
    posX = event.clientX - startX;
    posY = event.clientY - startY;
    updateTransform();
  }
});

background.addEventListener("mouseleave", () => {
  isDragging = false; // Остановка перетаскивания при выходе мыши
});

// Поддержка сенсорных экранов
let initialDistance = null;

background.addEventListener("touchstart", (event) => {
  if (event.touches.length === 1) {
    // Убедитесь, что только один палец на экране
    isDragging = true;
    startX = event.touches[0].clientX - posX;
    startY = event.touches[0].clientY - posY;
    initialDistance = null; // Сброс расстояния при новом касании
  } else if (event.touches.length === 2) {
    // Если два пальца на экране
    initialDistance = getDistance(event.touches[0], event.touches[1]);
    isDragging = false; // Остановка перетаскивания при использовании двух пальцев
  }
});

background.addEventListener("touchmove", (event) => {
  if (isDragging && event.touches.length === 1) {
    posX = event.touches[0].clientX - startX;
    posY = event.touches[0].clientY - startY;
    updateTransform();
    event.preventDefault(); // Предотвращаем прокрутку страницы
  } else if (event.touches.length === 2 && initialDistance !== null) {
    const currentDistance = getDistance(event.touches[0], event.touches[1]);
    scale *= currentDistance / initialDistance; // Масштабируем изображение по расстоянию между пальцами
    scale = Math.min(Math.max(1, scale), 3); // Ограничиваем масштаб от 1 до 3
    initialDistance = currentDistance; // Обновляем начальное расстояние
    updateTransform();
    event.preventDefault(); // Предотвращаем прокрутку страницы
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

function playAudio(i) {
  if (playback[i].classList.contains("play") === false) {
    audio[i].play();
    playback[i].classList.add("play");
  } else {
    audio[i].pause();
    playback[i].classList.remove("play");
  }
}


function setVolume(volume) {
  // Установим уровень громкости по вкусу (от 0.0 до 1.0).
  for (let i = 0; i < audio.length; i++) {
    audio[i].volume = volume;
  }
}

for (let i = 0; i < playback.length; i++) {
  playback[i].addEventListener("click", () => playAudio(i));
}
