let scale = 1;
let posX = 0;
let posY = 0;

const image = document.getElementById("image");
const background = document.getElementById("background");

// Увеличение/уменьшение изображения
background.addEventListener("wheel", (event) => {
  event.preventDefault();
  scale += event.deltaY * -0.01; // Изменение масштаба
  scale = Math.min(Math.max(1, scale), 5); // Ограничение масштаба от 1 до 3
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
    console.log(startY)
    updateTransform();
  }
});

background.addEventListener("mouseleave", () => {
  isDragging = false; // Остановка перетаскивания при выходе мыши
});

// Поддержка сенсорных экранов
background.addEventListener("touchstart", (event) => {
  if (event.touches.length === 1) {
    // Убедитесь, что только один палец на экране
    isDragging = true;
    startX = event.touches[0].clientX - posX;
    startY = event.touches[0].clientY - posY;
  }
});

background.addEventListener("touchmove", (event) => {
  if (isDragging && event.touches.length === 1) {
    posX = event.touches[0].clientX - startX;
    posY = event.touches[0].clientY - startY;
    updateTransform();
    event.preventDefault(); // Предотвращаем прокрутку страницы
  }
});

background.addEventListener("touchend", () => {
  isDragging = false; // Остановка перетаскивания при отпускании пальца
});
