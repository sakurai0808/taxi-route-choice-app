const API_URL =
  "https://tokyotaximap.com/wp-json/wp/v2/posts?categories=11&per_page=100&_fields=title,link";

const DAY_TYPES = ["平日", "土休日"];

const els = {
  origin: document.getElementById("origin"),
  destination: document.getElementById("destination"),
  daytype: document.getElementById("daytype"),
  time: document.getElementById("time"),
  draw: document.getElementById("draw"),
  status: document.getElementById("status"),
};

let places = [];

function decodeHtml(html) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = html;
  return textarea.value;
}

// 記事タイトル末尾の【〜】を除いて施設名にする
function toPlaceName(title) {
  return decodeHtml(title).replace(/\s*【[^】]*】\s*$/, "").trim();
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function setPlace(el, place) {
  el.textContent = place.name;
  el.href = place.link;
}

function draw() {
  const originIndex = randomInt(places.length);
  let destinationIndex = randomInt(places.length - 1);
  if (destinationIndex >= originIndex) destinationIndex++;

  setPlace(els.origin, places[originIndex]);
  setPlace(els.destination, places[destinationIndex]);

  const dayType = DAY_TYPES[randomInt(DAY_TYPES.length)];
  els.daytype.textContent = dayType;
  els.daytype.dataset.type = dayType === "平日" ? "weekday" : "holiday";

  els.time.textContent = `${String(randomInt(24)).padStart(2, "0")}:00`;
}

async function loadPlaces() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const posts = await res.json();
    places = posts
      .map((post) => ({ name: toPlaceName(post.title.rendered), link: post.link }))
      .filter((place) => place.name && !place.name.includes("まとめ"));

    if (places.length < 2) throw new Error("施設データが不足しています");

    els.status.textContent = `${places.length}件の施設から出題します`;
    els.draw.textContent = "出題する";
    els.draw.disabled = false;
  } catch (err) {
    els.status.textContent = `施設データの取得に失敗しました（${err.message}）`;
    els.draw.textContent = "出題できません";
  }
}

els.draw.addEventListener("click", draw);
loadPlaces();
