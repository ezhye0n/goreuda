/* =========================================================
   15팀 고르다 - 전체 상품, 랭킹 JS (15_goreuda_explore.js)
   담당자: 우은민
   - 주소의 값(?occasion=, ?recipient=, ?category=, ?sort=, ?view=search)으로 처음 필터 정하기
   - 필터, 정렬을 바꿀 때마다 목록 다시 그리기
   - 필터 상태를 sessionStorage에 저장해서 뒤로 가기를 해도 유지
   ========================================================= */

let filter = {};
let budgets = [];

// 아무 조건도 없는 처음 상태
function defaultFilter() {
  return { category: "all", recipient: "all", occasion: "all", price: "all", sort: "rank", keyword: "", view: "all" };
}

loadProducts().then(function (products) {
  loadThemes().then(function (themes) {
    budgets = themes.budgets;

    makeFilterOptions("category", themes.categories);
    makeFilterOptions("recipient", themes.recipients);
    makeFilterOptions("occasion", themes.occasions);
    makePriceOptions();

    readStartFilter();
    applyFilterToForm();
    drawList();
  });
});

// 라디오 버튼이 바뀌면 그 값을 filter에 넣고 다시 그림
document.querySelector(".filter-side").addEventListener("change", function (event) {
  filter[event.target.name] = event.target.value;
  drawList();
});

document.querySelector("#sort").addEventListener("change", function () {
  filter.sort = this.value;
  filter.view = "all";
  drawList();
});

document.querySelector("#filter-reset").addEventListener("click", function () {
  filter = defaultFilter();
  applyFilterToForm();
  drawList();
});

// 라디오 버튼 하나 만들기 (label 안에 넣어서 글자를 눌러도 선택됨)
function makeRadio(name, value, text) {
  return '<label class="filter-option"><input type="radio" name="' + name + '" value="' + value + '"> ' + text + '</label>';
}

// 테마 JSON 목록으로 라디오 버튼 만들기 (맨 앞에 "전체")
function makeFilterOptions(name, list) {
  let html = makeRadio(name, "all", "전체");
  for (let i = 0; i < list.length; i++) {
    html += makeRadio(name, list[i].id, list[i].name);
  }
  document.querySelector("#filter-" + name).innerHTML = html;
}

// 가격은 테마 JSON의 budgets(최소, 최대 금액)로 만듦
function makePriceOptions() {
  let html = "";
  for (let i = 0; i < budgets.length; i++) {
    html += makeRadio("price", budgets[i].id, budgets[i].name);
  }
  document.querySelector("#filter-price").innerHTML = html;
}

/* 처음 필터 정하기
   - 같은 주소로 다시 들어온 경우(상세 페이지에서 뒤로 가기 등)에는 저장해 둔 필터를 그대로 씀
   - 다른 주소로 들어온 경우(홈 테마, 검색, 메뉴)에는 주소의 값으로 새로 정함 */
function readStartFilter() {
  const saved = JSON.parse(sessionStorage.getItem("goreuda_filter"));
  if (saved !== null && saved.url === location.search) {
    filter = saved.filter;
    return;
  }

  filter = defaultFilter();
  if (getParam("occasion") !== null) { filter.occasion = getParam("occasion"); }
  if (getParam("recipient") !== null) { filter.recipient = getParam("recipient"); }
  if (getParam("category") !== null) { filter.category = getParam("category"); }
  if (getParam("sort") !== null) {
    filter.sort = getParam("sort");
    filter.view = getParam("sort");
  }
  // 헤더 검색으로 들어온 경우 검색어는 sessionStorage에서 꺼냄
  if (getParam("view") === "search") {
    filter.keyword = sessionStorage.getItem("goreuda_keyword") || "";
  }
}

// filter 값에 맞게 라디오, 정렬칸, 검색창을 체크
function applyFilterToForm() {
  const names = ["category", "recipient", "occasion", "price"];
  for (let i = 0; i < names.length; i++) {
    const input = document.querySelector('input[name="' + names[i] + '"][value="' + filter[names[i]] + '"]');
    if (input !== null) {
      input.checked = true;
    }
  }
  document.querySelector("#sort").value = filter.sort;
  document.querySelector("#search").value = filter.keyword;
}

// 가격이 고른 예산 안에 드는지 확인
function inBudget(price) {
  for (let i = 0; i < budgets.length; i++) {
    if (budgets[i].id === filter.price) {
      return price >= budgets[i].min && price < budgets[i].max;
    }
  }
  return true;
}

// 상품 하나가 지금 조건에 맞는지 확인
function matchFilter(product) {
  if (filter.category !== "all" && product.category !== filter.category) {
    return false;
  }
  if (filter.recipient !== "all" && !hasItem(product.recipients, filter.recipient)) {
    return false;
  }
  if (filter.occasion !== "all" && !hasItem(product.occasions, filter.occasion)) {
    return false;
  }
  if (!inBudget(product.price)) {
    return false;
  }
  // 검색어가 상품 이름이나 브랜드에 들어 있는지 확인
  if (filter.keyword !== "") {
    const text = product.name + " " + product.brand;
    if (text.indexOf(filter.keyword) === -1) {
      return false;
    }
  }
  return true;
}

function sortList(list) {
  if (filter.sort === "rank") {
    list.sort(function (a, b) { return b.rank - a.rank; });
  } else if (filter.sort === "new") {
    list.sort(function (a, b) { return new Date(b.date).getTime() - new Date(a.date).getTime(); });
  } else if (filter.sort === "low") {
    list.sort(function (a, b) { return a.price - b.price; });
  } else if (filter.sort === "high") {
    list.sort(function (a, b) { return b.price - a.price; });
  }
}

function drawList() {
  const list = [];
  for (let i = 0; i < allProducts.length; i++) {
    if (matchFilter(allProducts[i])) {
      list.push(allProducts[i]);
    }
  }
  sortList(list);

  renderCards(document.querySelector("#explore-list"), list);
  document.querySelector("#result-count").innerText = "총 " + list.length + "개";
  if (list.length === 0) { showElement("#explore-empty"); } else { hideElement("#explore-empty"); }

  // 검색어 안내
  if (filter.keyword !== "") {
    document.querySelector("#keyword-info").innerHTML = '<strong>"' + filter.keyword + '"</strong> 검색 결과예요.';
    showElement("#keyword-info");
  } else {
    hideElement("#keyword-info");
  }

  updateTitle();
  // 지금 주소와 필터를 함께 저장
  sessionStorage.setItem("goreuda_filter", JSON.stringify({ url: location.search, filter: filter }));
}

// 랭킹, 신상품 메뉴도 이 페이지를 쓰므로 어떤 메뉴로 들어왔는지(view)에 따라 제목을 바꿈
function updateTitle() {
  let title = "전체 상품";
  let navKey = "explore";
  if (filter.view === "rank") {
    title = "랭킹";
    navKey = "rank";
  } else if (filter.view === "new") {
    title = "신상품";
    navKey = "new";
  }
  document.querySelector("#explore-title").innerText = title;

  const links = document.querySelectorAll(".main-nav a");
  for (let i = 0; i < links.length; i++) {
    if (links[i].getAttribute("data-nav") === navKey) {
      links[i].className = "active";
    } else {
      links[i].className = "";
    }
  }
}
