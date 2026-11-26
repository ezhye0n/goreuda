/* 공통 JS, 담당: 이지현 */

let allProducts = [];

/* JSON 불러오기 */
function loadProducts() {
  return fetch("15_goreuda_products.json").then(function (res) {
    return res.json();
  }).then(function (products) {
    allProducts = products;
    return products;
  });
}

function loadThemes() {
  return fetch("15_goreuda_themes.json").then(function (res) {
    return res.json();
  });
}

function findProduct(products, id) {
  for (let i = 0; i < products.length; i++) {
    if (products[i].id === id) {
      return products[i];
    }
  }
  return null;
}

function findName(list, id) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      return list[i].name;
    }
  }
  return "";
}

function inCategory(product, categoryId) {
  if (product.category === categoryId) {
    return true;
  }
  if (product.moreCategories) {
    return hasItem(product.moreCategories, categoryId);
  }
  return false;
}

function hasItem(list, value) {
  for (let i = 0; i < list.length; i++) {
    if (list[i] === value) {
      return true;
    }
  }
  return false;
}

function removeItem(list, value) {
  const result = [];
  for (let i = 0; i < list.length; i++) {
    if (list[i] !== value) {
      result.push(list[i]);
    }
  }
  return result;
}

function getParam(name) {
  const query = location.search.split("?").join("");
  const pairs = query.split("&");
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split("=");
    if (pair[0] === name) {
      return pair[1];
    }
  }
  return null;
}

/* 보이기, 숨기기 */
function showElement(selector) {
  document.querySelector(selector).style.display = "";
}

function hideElement(selector) {
  document.querySelector(selector).style.display = "none";
}

/* 웹 스토리지 */
function getList(key) {
  const saved = localStorage.getItem(key);
  if (saved === null) {
    return [];
  }
  return JSON.parse(saved);
}

function saveList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

function formatPrice(price) {
  const text = price.toString();
  let result = "";
  let count = 0;
  for (let i = text.length - 1; i >= 0; i--) {
    result = text[i] + result;
    count++;
    if (count % 3 === 0 && i !== 0) {
      result = "," + result;
    }
  }
  return result + "원";
}

/* 날짜 */
function todayText() {
  const today = new Date();
  let month = today.getMonth() + 1;
  let date = today.getDate();
  if (month < 10) { month = "0" + month; }
  if (date < 10) { date = "0" + date; }
  return today.getFullYear() + "-" + month + "-" + date;
}

function getDday(dateText) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const saved = new Date(dateText);

  const next = new Date(today.getFullYear(), saved.getMonth(), saved.getDate());
  if (next.getTime() < today.getTime()) {
    next.setFullYear(today.getFullYear() + 1);
  }
  return Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function ddayText(dday) {
  if (dday === 0) {
    return "D-DAY";
  }
  return "D-" + dday;
}

function monthDayText(dateText) {
  const date = new Date(dateText);
  return (date.getMonth() + 1) + "월 " + date.getDate() + "일";
}

/* 헤더 */
function updateHeaderCount() {
  const wishCount = getList("goreuda_wish").length;
  const cartCount = getList("goreuda_cart").length;

  const wishBadge = document.querySelector("#wish-count");
  const cartBadge = document.querySelector("#cart-count");
  wishBadge.innerText = wishCount;
  cartBadge.innerText = cartCount;

  if (wishCount === 0) { wishBadge.style.display = "none"; } else { wishBadge.style.display = ""; }
  if (cartCount === 0) { cartBadge.style.display = "none"; } else { cartBadge.style.display = ""; }
}

document.querySelector("#search-form").addEventListener("submit", function (event) {
  event.preventDefault();
  sessionStorage.setItem("goreuda_keyword", document.querySelector("#search").value);
  sessionStorage.removeItem("goreuda_filter");
  location.href = "15_goreuda_explore.html?view=search";
});

/* 알림 메시지 */
function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.innerText = message;
  toast.style.display = "block";

  setTimeout(function () {
    toast.style.display = "none";
  }, 2000);
}

/* 위시 (찜) */
function isWished(id) {
  return hasItem(getList("goreuda_wish"), id);
}

function toggleWish(id) {
  let wish = getList("goreuda_wish");
  let added = false;

  if (hasItem(wish, id)) {
    wish = removeItem(wish, id);
    showToast("위시에서 뺐어요.");
  } else {
    wish.push(id);
    added = true;
    showToast("위시에 담았어요.");
  }
  saveList("goreuda_wish", wish);
  updateHeaderCount();
  return added;
}

/* 장바구니 */
function addToCart(id, option, qty) {
  const cart = getList("goreuda_cart");
  let found = false;

  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id === id && cart[i].option === option) {
      cart[i].qty = cart[i].qty + qty;
      found = true;
    }
  }
  if (found === false) {
    cart.push({ id: id, option: option, qty: qty, checked: true });
  }
  saveList("goreuda_cart", cart);
  updateHeaderCount();
  showToast("장바구니에 담았어요.");
}

/* 상품 카드 */
const heartOff = '<svg class="heart-off" viewBox="0 0 24 24" fill="none" stroke="#222222" stroke-width="1.6"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
const heartOn = '<svg class="heart-on" viewBox="0 0 24 24" fill="#E0524A" stroke="#E0524A" stroke-width="1.6"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
const cartIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 4h2l2.4 11h11.2L21 8H7"/><circle cx="9" cy="19" r="1.5"/><circle cx="18" cy="19" r="1.5"/></svg>';

const BEST_RANK = 90;

function makeCard(product, note) {
  const link = "15_goreuda_detail.html?id=" + product.id;

  let wishClass = "wish-btn";
  let pressed = "false";
  if (isWished(product.id)) {
    wishClass = "wish-btn on";
    pressed = "true";
  }

  let html = '<li class="product-card">';
  html += '<a href="' + link + '" class="card-thumb">';
  html += '<img src="' + product.image + '" alt="' + product.alt + '">';
  if (product.rank >= BEST_RANK) {
    html += '<span class="best-badge">베스트셀러</span>';
  }
  html += '</a>';
  html += '<button type="button" class="' + wishClass + '" data-id="' + product.id + '" aria-pressed="' + pressed + '" aria-label="' + product.name + ' 찜하기" onclick="clickWish(this)">' + heartOff + heartOn + '</button>';
  html += '<button type="button" class="cart-btn" data-id="' + product.id + '" onclick="clickCart(this)">' + cartIcon + '담기</button>';
  html += '<a href="' + link + '" class="card-info">';
  html += '<p class="card-brand">' + product.brand + '</p>';
  html += '<p class="card-name">' + product.name + '</p>';
  html += '<p class="card-price">' + formatPrice(product.price) + '</p>';
  html += '</a>';
  if (note) {
    html += '<p class="card-note">' + note + '</p>';
  }
  html += '</li>';
  return html;
}

function renderCards(listElement, products) {
  let html = "";
  for (let i = 0; i < products.length; i++) {
    html += makeCard(products[i]);
  }
  listElement.innerHTML = html;
}

function clickWish(button) {
  const added = toggleWish(button.getAttribute("data-id"));
  if (added) {
    button.className = "wish-btn on";
  } else {
    button.className = "wish-btn";
  }
  button.setAttribute("aria-pressed", added);

  if (typeof afterWishChange === "function") {
    afterWishChange();
  }
}

function clickCart(button) {
  openCartModal(findProduct(allProducts, button.getAttribute("data-id")));
}

/* 바로 담기 창 */
let modalProduct = null;
let modalQty = 1;

function openCartModal(product) {
  modalProduct = product;
  modalQty = 1;

  const img = document.querySelector("#modal-img");
  img.setAttribute("src", product.image);
  img.setAttribute("alt", product.alt);
  document.querySelector("#modal-name").innerText = product.name;
  document.querySelector("#modal-price").innerText = formatPrice(product.price);

  let optionHtml = "";
  for (let i = 0; i < product.options.length; i++) {
    optionHtml += "<option>" + product.options[i] + "</option>";
  }
  document.querySelector("#modal-option").innerHTML = optionHtml;

  updateModalTotal();
  showElement("#cart-modal");
}

function closeCartModal() {
  hideElement("#cart-modal");
}

function updateModalTotal() {
  document.querySelector("#modal-qty").innerText = modalQty;
  document.querySelector("#modal-total").innerText = formatPrice(modalProduct.price * modalQty);
}

function createCartModal() {
  let html = "";
  html += '<div class="modal" id="cart-modal" style="display: none;">';
  html += '<div class="modal-box">';
  html += '<div class="modal-product"><img id="modal-img" src="" alt=""><div><p class="modal-name" id="modal-name"></p><p class="modal-price" id="modal-price"></p></div></div>';
  html += '<div class="modal-row"><label for="modal-option">옵션</label><select id="modal-option" class="select-box"></select></div>';
  html += '<div class="modal-row"><span>수량</span><div class="qty"><button type="button" id="modal-minus" aria-label="수량 빼기">-</button><span id="modal-qty">1</span><button type="button" id="modal-plus" aria-label="수량 더하기">+</button></div></div>';
  html += '<div class="modal-row modal-total"><span>합계</span><span id="modal-total"></span></div>';
  html += '<div class="modal-buttons"><button type="button" class="btn btn-outline" id="modal-cancel">취소</button><button type="button" class="btn btn-primary" id="modal-add">장바구니 담기</button></div>';
  html += '</div></div>';
  html += '<p class="toast" id="toast" style="display: none;"></p>';

  const box = document.createElement("div");
  box.innerHTML = html;
  document.body.appendChild(box);

  document.querySelector("#modal-minus").addEventListener("click", function () {
    if (modalQty > 1) {
      modalQty--;
      updateModalTotal();
    }
  });
  document.querySelector("#modal-plus").addEventListener("click", function () {
    modalQty++;
    updateModalTotal();
  });
  document.querySelector("#modal-cancel").addEventListener("click", closeCartModal);
  document.querySelector("#modal-add").addEventListener("click", function () {
    addToCart(modalProduct.id, document.querySelector("#modal-option").value, modalQty);
    closeCartModal();
  });

  document.querySelector("#cart-modal").addEventListener("click", function (event) {
    if (event.target.id === "cart-modal") {
      closeCartModal();
    }
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeCartModal();
    }
  });
}

/* 페이지가 열리면 공통으로 실행 */
createCartModal();
updateHeaderCount();
