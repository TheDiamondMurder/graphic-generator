const form = document.querySelector("#graphic-form");
const templateInput = document.querySelector("#template");
const titleInput = document.querySelector("#title");
const subtitleInput = document.querySelector("#subtitle");
const detailOneInput = document.querySelector("#detail-one");
const detailTwoInput = document.querySelector("#detail-two");
const detailThreeInput = document.querySelector("#detail-three");
const accentInput = document.querySelector("#accent");
const imageInput = document.querySelector("#image");
const canvas = document.querySelector("#graphic-canvas");
const download = document.querySelector("#download");
const ctx = canvas.getContext("2d");
let uploadedImage = null;

const templateDefaults = {
  event: {
    title: "Jakub Labs Live",
    subtitle: "one night only",
    detailOne: "Leicester",
    detailTwo: "28 Nov 2026",
    detailThree: "20:00",
  },
  f1: {
    title: "MAX VERSTAPPEN",
    subtitle: "JOINS HAAS F1 TEAM",
    detailOne: "BREAKING",
    detailTwo: "MOTORSPORT NEWS",
    detailThree: "unofficial graphic",
  },
  matchday: {
    title: "MATCHDAY",
    subtitle: "Home XI vs Away XI",
    detailOne: "King Power",
    detailTwo: "Saturday",
    detailThree: "15:00",
  },
  announcement: {
    title: "BIG NEWS",
    subtitle: "something important has happened",
    detailOne: "official-ish",
    detailTwo: "today",
    detailThree: "jakublabs.xyz",
  },
  cover: {
    title: "MIDNIGHT FILES",
    subtitle: "volume one",
    detailOne: "playlist",
    detailTwo: "2026",
    detailThree: "made by jakublabs",
  },
};

function setTemplateDefaults() {
  const defaults = templateDefaults[templateInput.value];
  titleInput.value = defaults.title;
  subtitleInput.value = defaults.subtitle;
  detailOneInput.value = defaults.detailOne;
  detailTwoInput.value = defaults.detailTwo;
  detailThreeInput.value = defaults.detailThree;
  generateGraphic();
}

function getData() {
  return {
    title: titleInput.value || "Untitled",
    subtitle: subtitleInput.value || "",
    detailOne: detailOneInput.value || "",
    detailTwo: detailTwoInput.value || "",
    detailThree: detailThreeInput.value || "",
    accent: accentInput.value || "#e9ff70",
  };
}

function fillBackground(accent) {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#111113");
  gradient.addColorStop(0.5, "#030303");
  gradient.addColorStop(1, "#17180e");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.045)";
  ctx.lineWidth = 1;
  for (let position = 0; position <= canvas.width; position += 72) {
    ctx.beginPath();
    ctx.moveTo(position, 0);
    ctx.lineTo(position, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, position);
    ctx.lineTo(canvas.width, position);
    ctx.stroke();
  }

  ctx.fillStyle = `${accent}22`;
  ctx.beginPath();
  ctx.arc(1040, 140, 320, 0, Math.PI * 2);
  ctx.fill();
}

function wrapText(text, maxWidth, font) {
  ctx.font = font;
  const words = text.trim().split(/\s+/);
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width <= maxWidth) {
      line = testLine;
      return;
    }
    if (line) lines.push(line);
    line = word;
  });

  if (line) lines.push(line);
  return lines;
}

function drawWatermark() {
  ctx.fillStyle = "rgba(245, 245, 240, 0.78)";
  ctx.font = "800 34px Inter, Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("jakublabs.xyz", 1070, 1080);
  ctx.textAlign = "left";
}

function drawCoverImage(image, x, y, width, height) {
  if (!image) {
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, "#1b1b1d");
    gradient.addColorStop(0.52, "#303035");
    gradient.addColorStop(1, "#101010");
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.font = "900 72px Inter, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("UPLOAD IMAGE", x + width / 2, y + height / 2);
    ctx.textAlign = "left";
    return;
  }

  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function drawDiagonalBand(points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.closePath();
  ctx.fill();
}

function fitText(text, maxWidth, startSize, minSize, weight = 950) {
  let size = startSize;
  do {
    ctx.font = `${weight} ${size}px Inter, Arial, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) {
      return size;
    }
    size -= 4;
  } while (size >= minSize);
  return minSize;
}

function drawPill(text, x, y, accent) {
  const width = Math.max(170, ctx.measureText(text).width + 44);
  ctx.fillStyle = "rgba(255, 255, 255, 0.055)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, width, 56, 28);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.font = "820 24px Inter, Arial, sans-serif";
  ctx.fillText(text, x + 22, y + 36);
  return width;
}

function drawEvent(data) {
  fillBackground(data.accent);
  ctx.fillStyle = data.accent;
  ctx.font = "900 34px Inter, Arial, sans-serif";
  ctx.fillText("EVENT", 98, 126);

  ctx.fillStyle = "#f5f5f0";
  ctx.font = "900 112px Inter, Arial, sans-serif";
  wrapText(data.title, 930, ctx.font).slice(0, 4).forEach((line, index) => {
    ctx.fillText(line, 96, 300 + index * 114);
  });

  ctx.fillStyle = "#a6a6a0";
  ctx.font = "720 42px Inter, Arial, sans-serif";
  wrapText(data.subtitle, 900, ctx.font).slice(0, 3).forEach((line, index) => {
    ctx.fillText(line, 100, 740 + index * 50);
  });

  drawPill(data.detailOne, 96, 918, data.accent);
  drawPill(data.detailTwo, 96, 990, data.accent);
  drawPill(data.detailThree, 420, 990, data.accent);
  drawWatermark();
}

function drawF1(data) {
  ctx.fillStyle = "#e00016";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(120, 0, 12, 0.24)";
  for (let i = -260; i < canvas.width; i += 190) {
    drawDiagonalBand(
      [
        [i, 0],
        [i + 82, 0],
        [i + 520, canvas.height],
        [i + 438, canvas.height],
      ],
      "rgba(120, 0, 12, 0.22)",
    );
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 150, canvas.width, 760);
  ctx.clip();
  drawCoverImage(uploadedImage, 0, 150, canvas.width, 760);
  ctx.restore();

  ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
  ctx.fillRect(0, 150, canvas.width, 760);

  ctx.fillStyle = "#e00016";
  ctx.fillRect(0, 0, canvas.width, 150);
  drawDiagonalBand(
    [
      [0, 150],
      [240, 150],
      [0, 340],
    ],
    "#e00016",
  );

  ctx.fillStyle = "#f5f5f0";
  ctx.font = "950 102px Inter, Arial, sans-serif";
  ctx.fillText(data.detailOne.toUpperCase(), 268, 108);

  ctx.strokeStyle = "#f5f5f0";
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(44, 86);
  ctx.lineTo(134, 44);
  ctx.lineTo(236, 44);
  ctx.moveTo(62, 104);
  ctx.lineTo(148, 66);
  ctx.lineTo(226, 66);
  ctx.stroke();

  drawDiagonalBand(
    [
      [780, 910],
      [1200, 510],
      [1200, 670],
      [930, 910],
    ],
    "#e00016",
  );
  drawDiagonalBand(
    [
      [855, 910],
      [1200, 585],
      [1200, 625],
      [900, 910],
    ],
    "#f5f5f0",
  );
  drawDiagonalBand(
    [
      [910, 910],
      [1200, 640],
      [1200, 685],
      [960, 910],
    ],
    "#e00016",
  );

  ctx.fillStyle = "#e00016";
  ctx.fillRect(0, 910, canvas.width, 290);

  const title = data.title.toUpperCase();
  const titleSize = fitText(title, 1030, 86, 48, 950);
  ctx.fillStyle = "#f5f5f0";
  ctx.font = `950 ${titleSize}px Inter, Arial, sans-serif`;
  ctx.fillText(title, 78, 1010);

  const subtitle = data.subtitle.toUpperCase();
  const subtitleSize = fitText(subtitle, 1040, 54, 32, 760);
  ctx.font = `760 ${subtitleSize}px Inter, Arial, sans-serif`;
  ctx.fillText(subtitle, 80, 1088);

  ctx.fillStyle = "rgba(245, 245, 240, 0.78)";
  ctx.font = "760 28px Inter, Arial, sans-serif";
  ctx.fillText(`${data.detailTwo.toUpperCase()} / ${data.detailThree}`, 80, 1160);
  drawWatermark();
}

function drawMatchday(data) {
  fillBackground(data.accent);
  ctx.fillStyle = data.accent;
  ctx.fillRect(82, 82, 1036, 10);
  ctx.fillRect(82, 1108, 1036, 10);

  ctx.fillStyle = "#f5f5f0";
  ctx.font = "950 120px Inter, Arial, sans-serif";
  ctx.fillText(data.title.toUpperCase(), 92, 270);

  ctx.font = "900 78px Inter, Arial, sans-serif";
  wrapText(data.subtitle, 960, ctx.font).slice(0, 3).forEach((line, index) => {
    ctx.fillText(line, 92, 500 + index * 86);
  });

  ctx.fillStyle = "#a6a6a0";
  ctx.font = "760 40px Inter, Arial, sans-serif";
  ctx.fillText(data.detailOne, 92, 872);
  ctx.fillText(`${data.detailTwo} / ${data.detailThree}`, 92, 930);
  drawWatermark();
}

function drawAnnouncement(data) {
  fillBackground(data.accent);
  ctx.fillStyle = data.accent;
  ctx.font = "900 30px Inter, Arial, sans-serif";
  ctx.fillText(data.detailOne.toUpperCase(), 96, 140);

  ctx.fillStyle = "#f5f5f0";
  ctx.font = "950 132px Inter, Arial, sans-serif";
  wrapText(data.title, 980, ctx.font).slice(0, 3).forEach((line, index) => {
    ctx.fillText(line, 92, 410 + index * 128);
  });

  ctx.fillStyle = "#a6a6a0";
  ctx.font = "760 44px Inter, Arial, sans-serif";
  wrapText(data.subtitle, 920, ctx.font).slice(0, 3).forEach((line, index) => {
    ctx.fillText(line, 96, 790 + index * 56);
  });

  drawPill(data.detailTwo, 96, 990, data.accent);
  drawPill(data.detailThree, 420, 990, data.accent);
  drawWatermark();
}

function drawCover(data) {
  fillBackground(data.accent);
  ctx.strokeStyle = data.accent;
  ctx.lineWidth = 4;
  ctx.strokeRect(100, 100, 1000, 1000);

  ctx.fillStyle = `${data.accent}33`;
  for (let i = 0; i < 7; i += 1) {
    ctx.beginPath();
    ctx.arc(600, 600, 90 + i * 54, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "#f5f5f0";
  ctx.font = "950 106px Inter, Arial, sans-serif";
  wrapText(data.title, 820, ctx.font).slice(0, 3).forEach((line, index) => {
    ctx.fillText(line, 150, 470 + index * 104);
  });

  ctx.fillStyle = "#a6a6a0";
  ctx.font = "760 38px Inter, Arial, sans-serif";
  ctx.fillText(data.subtitle, 154, 810);
  ctx.fillText(`${data.detailOne} / ${data.detailTwo}`, 154, 868);
  drawWatermark();
}

function generateGraphic() {
  const data = getData();
  const drawers = {
    event: drawEvent,
    f1: drawF1,
    matchday: drawMatchday,
    announcement: drawAnnouncement,
    cover: drawCover,
  };

  drawers[templateInput.value](data);
  download.href = canvas.toDataURL("image/png");
}

templateInput.addEventListener("change", setTemplateDefaults);
imageInput.addEventListener("change", () => {
  const [file] = imageInput.files;
  if (!file) {
    uploadedImage = null;
    generateGraphic();
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    uploadedImage = new Image();
    uploadedImage.addEventListener("load", generateGraphic);
    uploadedImage.src = reader.result;
  });
  reader.readAsDataURL(file);
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  generateGraphic();
});

[titleInput, subtitleInput, detailOneInput, detailTwoInput, detailThreeInput, accentInput].forEach(
  (input) => input.addEventListener("input", generateGraphic),
);

generateGraphic();
