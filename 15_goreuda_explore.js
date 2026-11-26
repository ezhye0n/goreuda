/* 전체 상품 JS, 담당: 오현채 */

let filter = {};
let budgets = [];

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

// 라디오 버튼이 바뀌면 필터 값 바꾸고 목록 다시 그리기
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

function makeRadio(name, value, text) {
  return '<label class="filter-option"><input type="radio" name="' + name + '" value="' + value + '"> ' + text + '</label>';
}


function makeFilterOptions(name, list) {
  let html = makeRadio(name, "all", "전체");
  for (let i = 0; i < list.length; i++) {
    html += makeRadio(name, list[i].id, list[i].name);
  }
  document.querySelector("#filter-" + name).innerHTML = html;
}


function makePriceOptions() {
  let html = "";
  for (let i = 0; i < budgets.length; i++) {
    html += makeRadio("price", budgets[i].id, budgets[i].name);
  }
  document.querySelector("#filter-price").innerHTML = html;
}

/* 같은 주소면 저장된 필터, 다른 주소면 주소 값으로 */
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
  // 헤더 검색
  if (getParam("view") === "search") {
    filter.keyword = sessionStorage.getItem("goreuda_keyword") || "";
  }
}

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

// 조건 확인하기
function inBudget(price) {
  for (let i = 0; i < budgets.length; i++) {
    if (budgets[i].id === filter.price) {
      return price >= budgets[i].min && price < budgets[i].max;
    }
  }
  return true;
}

function matchFilter(product) {
  if (filter.category !== "all" && !inCategory(product, filter.category)) {
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

// 메뉴에 따라 제목 다르게 설정
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
