/* 담당: 이지현 */

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

/* 배너 */
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

function placeBannerArrows() {
  const viewLeft = window.scrollX;
  const viewWidth = document.documentElement.clientWidth;
  document.querySelector("#banner-prev").style.left = (viewLeft + 24) + "px";
  document.querySelector("#banner-next").style.left = (viewLeft + viewWidth - 24 - 48) + "px";
}

window.addEventListener("resize", function () {
  placeBannerArrows();
  moveToBanner();
});
window.addEventListener("scroll", placeBannerArrows);
placeBannerArrows();

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

/* 배너 자동 넘김: 4초마다 다음 배너로, 마우스를 올리면 멈춤 */
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

document.querySelector("#banner").addEventListener("mouseover", stopAutoBanner);
document.querySelector("#banner").addEventListener("mouseout", startAutoBanner);

/* 상황별 테마 */
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

/* 다가오는 기념일 */
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
  bar.innerHTML = friend.name + "님의 " + friend.type + " <strong>" + ddayText(nearestDday) + "</strong>, 어울리는 선물을 찾아볼까요?<span>선물 찾기 &rsaquo;</span>";
  bar.setAttribute("href", "15_goreuda_finder.html?friend=" + nearestIndex);
  showElement("#anniversary");
}

/* 이 상품 어때요? */
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

/* 카테고리별 인기 상품 */
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

/* 신상품: 등록일이 최근인 순서 */
function showNew(products) {
  const list = products.slice();
  list.sort(function (a, b) {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  renderCards(document.querySelector("#new-list"), list.slice(0, 4));
}
