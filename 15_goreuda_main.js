/* =========================================================
   15팀 고르다 - 홈 JS (15_goreuda_main.js)
   담당자: 이지현, 우은민
   - 배너 넘기기
   - 상황별 테마, 다가오는 기념일
   - 최근 본 상품 기반 추천, 카테고리별 인기 상품, 신상품
   ========================================================= */

let banners = [];
let currentBanner = 0;
let rankCategories = [];

loadProducts().then(function (products) {
  loadThemes().then(function (themes) {
    banners = themes.banners;
    rankCategories = themes.categories;

    drawBanner();
    startAutoBanner();
    showThemes(themes.occasions);
    showAnniversary();
    showRecommend(products, themes);
    showRankTabs(themes.categories);
    showNew(products);
  });
});

/* ---------- 배너 ----------
   배너 3장을 가로로 나란히 놓고, 버튼을 누르면 track을 옆으로 밀어서(transform) 넘김
   마지막 배너에서 다음을 누르면 첫 배너로, 첫 배너에서 이전을 누르면 마지막 배너로 감 */
function drawBanner() {
  let html = "";
  for (let i = 0; i < banners.length; i++) {
    html += '<a href="' + banners[i].link + '" class="banner-slide" style="background-color: ' + banners[i].color + ';">';
    html += '<img src="' + banners[i].image + '" alt="' + banners[i].alt + '"></a>';
  }
  document.querySelector("#banner-track").innerHTML = html;
  moveToBanner();
}

function moveToBanner() {
  const slideWidth = document.querySelector(".banner-slide").offsetWidth;
  document.querySelector("#banner-track").style.transform = "translateX(" + (-slideWidth * currentBanner) + "px)";
}

/* 화살표 위치 맞추기
   창이 사이트 최소 너비(1200px)보다 좁으면 가로 스크롤이 생겨 화살표가 창 밖으로 나갈 수 있음
   그래서 지금 보이는 화면의 왼쪽 끝, 오른쪽 끝에서 24px 안쪽에 화살표를 둠
   window.scrollX: 가로로 스크롤한 거리 / clientWidth: 스크롤바를 뺀 창 너비 */
function placeBannerArrows() {
  const viewLeft = window.scrollX;
  const viewWidth = document.documentElement.clientWidth;
  document.querySelector("#banner-prev").style.left = (viewLeft + 24) + "px";
  document.querySelector("#banner-next").style.left = (viewLeft + viewWidth - 24 - 48) + "px";
}

// 창 크기가 바뀌거나 가로로 스크롤하면 화살표 위치와 배너 너비를 다시 맞춤
window.addEventListener("resize", function () {
  placeBannerArrows();
  moveToBanner();
});
window.addEventListener("scroll", placeBannerArrows);
placeBannerArrows();

// 버튼으로 넘긴 뒤에는 자동 넘김 시간을 처음부터 다시 셈
document.querySelector("#banner-prev").addEventListener("click", function () {
  currentBanner--;
  if (currentBanner < 0) {
    currentBanner = banners.length - 1;
  }
  moveToBanner();
  startAutoBanner();
});

document.querySelector("#banner-next").addEventListener("click", function () {
  currentBanner++;
  if (currentBanner > banners.length - 1) {
    currentBanner = 0;
  }
  moveToBanner();
  startAutoBanner();
});

/* ---------- 배너 자동 넘김 ----------
   setTimeout으로 4초 뒤에 다음 배너로 넘기고, 넘긴 뒤 다시 setTimeout을 걸어 반복함
   마지막 배너 다음에는 첫 배너로 돌아감
   autoTurn: 자동 넘김을 새로 시작할 때마다 1씩 늘어나는 번호
   예전에 걸어둔 setTimeout은 자기 번호가 지금 번호와 다르면 아무것도 하지 않음 (멈추기, 다시 시작하기에 사용) */
const AUTO_TIME = 4000;
let autoTurn = 0;

function startAutoBanner() {
  autoTurn++;
  const myTurn = autoTurn;
  setTimeout(function () {
    if (myTurn !== autoTurn) {
      return;
    }
    if (currentBanner < banners.length - 1) {
      currentBanner++;
    } else {
      currentBanner = 0;
    }
    moveToBanner();
    startAutoBanner();
  }, AUTO_TIME);
}

function stopAutoBanner() {
  autoTurn++;
}

// 마우스를 배너 위에 올리면 멈추고, 떼면 다시 넘김
document.querySelector("#banner").addEventListener("mouseover", stopAutoBanner);
document.querySelector("#banner").addEventListener("mouseout", startAutoBanner);

/* ---------- 상황별 테마 ----------
   맨 앞에 선물 찾기, 그 뒤에 테마 JSON의 상황 목록 */
function showThemes(occasions) {
  let html = '<li><a href="15_goreuda_finder.html" class="theme-item finder-item">';
  html += '<span class="theme-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#222222" stroke-width="1.4"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4M11 8v6M8 11h6"/></svg></span>';
  html += '선물 찾기</a></li>';
  for (let i = 0; i < occasions.length; i++) {
    html += '<li><a href="15_goreuda_explore.html?occasion=' + occasions[i].id + '" class="theme-item">';
    html += '<span class="theme-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#222222" stroke-width="1.4">' + occasions[i].icon + '</svg></span>';
    html += occasions[i].name + '</a></li>';
  }
  document.querySelector("#theme-list").innerHTML = html;
}

/* ---------- 다가오는 기념일 ----------
   등록한 친구 중 30일 안에 기념일이 있는 가장 가까운 사람 1명 */
function showAnniversary() {
  const friends = getList("goreuda_friends");
  let nearestIndex = -1;
  let nearestDday = 31;

  for (let i = 0; i < friends.length; i++) {
    const dday = getDday(friends[i].date);
    if (dday < nearestDday) {
      nearestIndex = i;
      nearestDday = dday;
    }
  }
  if (nearestIndex === -1) {
    return;
  }

  const friend = friends[nearestIndex];
  const bar = document.querySelector("#anniversary-bar");
  bar.innerHTML = "<strong>" + ddayText(nearestDday) + "</strong>" + friend.name + "님의 " + friend.type + "이 다가와요. 어울리는 선물을 찾아볼까요?<span>선물 찾기 &rsaquo;</span>";
  // 선물 찾기에 친구 번호를 넘김
  bar.setAttribute("href", "15_goreuda_finder.html?friend=" + nearestIndex);
  showElement("#anniversary");
}

/* ---------- 이 상품 어때요? ----------
   최근 본 상품이 있으면 그 상품과 같은 카테고리에서 아직 안 본 상품을 추천
   추천할 상품이 4개보다 적으면 인기 상품으로 채움 */
function showRecommend(products, themes) {
  const recent = getList("goreuda_recent");
  const list = [];

  if (recent.length > 0) {
    const lastProduct = findProduct(products, recent[0]);
    for (let i = 0; i < products.length; i++) {
      if (products[i].category === lastProduct.category && !hasItem(recent, products[i].id)) {
        list.push(products[i]);
      }
    }
    document.querySelector("#recommend-desc").innerText = "최근 본 " + findName(themes.categories, lastProduct.category) + " 상품과 비슷한 선물이에요";
  }

  const byRank = products.slice();
  byRank.sort(function (a, b) { return b.rank - a.rank; });
  for (let i = 0; i < byRank.length; i++) {
    if (list.length < 4 && !hasItem(list, byRank[i]) && !hasItem(recent, byRank[i].id)) {
      list.push(byRank[i]);
    }
  }

  renderCards(document.querySelector("#recommend-list"), list.slice(0, 4));
}

/* ---------- 카테고리별 인기 상품 ---------- */
function showRankTabs(categories) {
  let html = "";
  for (let i = 0; i < categories.length; i++) {
    html += '<button type="button" class="chip" data-category="' + categories[i].id + '" onclick="selectRankTab(this)">' + categories[i].name + '</button>';
  }
  document.querySelector("#rank-tabs").innerHTML = html;
  drawRankList(categories[0].id);
}

function selectRankTab(button) {
  drawRankList(button.getAttribute("data-category"));
}

function drawRankList(categoryId) {
  const list = [];
  for (let i = 0; i < allProducts.length; i++) {
    if (inCategory(allProducts[i], categoryId)) {
      list.push(allProducts[i]);
    }
  }
  list.sort(function (a, b) { return b.rank - a.rank; });
  renderCards(document.querySelector("#rank-list"), list.slice(0, 4));

  // 누른 탭만 선택 상태로 표시
  const buttons = document.querySelectorAll("#rank-tabs .chip");
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i].getAttribute("data-category") === categoryId) {
      buttons[i].className = "chip on";
      buttons[i].setAttribute("aria-pressed", "true");
    } else {
      buttons[i].className = "chip";
      buttons[i].setAttribute("aria-pressed", "false");
    }
  }
}

/* ---------- 신상품: 등록일이 최근인 순서 ---------- */
function showNew(products) {
  const list = products.slice();
  list.sort(function (a, b) {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  renderCards(document.querySelector("#new-list"), list.slice(0, 4));
}
