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
    showThemes(themes.occasions);
    showAnniversary();
    showRecommend(products, themes);
    showRankTabs(themes.categories);
    showNew(products);
  });
});

/* ---------- 배너 ---------- */
// 배너 이미지, 링크, 양옆 배경색을 지금 순서의 배너로 바꿈
function drawBanner() {
  const banner = banners[currentBanner];
  const img = document.querySelector("#banner-img");
  img.setAttribute("src", banner.image);
  img.setAttribute("alt", banner.alt);
  document.querySelector("#banner-link").setAttribute("href", banner.link);
  document.querySelector("#banner").style.backgroundColor = banner.color;
  document.querySelector("#banner-page").innerText = (currentBanner + 1) + " / " + banners.length;
}

document.querySelector("#banner-prev").addEventListener("click", function () {
  currentBanner--;
  if (currentBanner < 0) {
    currentBanner = banners.length - 1;
  }
  drawBanner();
});

document.querySelector("#banner-next").addEventListener("click", function () {
  currentBanner++;
  if (currentBanner === banners.length) {
    currentBanner = 0;
  }
  drawBanner();
});

/* ---------- 상황별 테마 ----------
   맨 앞에 선물 찾기, 그 뒤에 테마 JSON의 상황 목록 */
function showThemes(occasions) {
  let html = '<li><a href="15_goreuda_finder.html" class="theme-item">';
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
    if (allProducts[i].category === categoryId) {
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
