/* =========================================================
   15팀 고르다 - 상품 상세 JS (15_goreuda_detail.js)
   담당자: 이예경, 이지현
   - 주소의 ?id= 값으로 상품을 찾아 화면 채우기
   - 옵션, 수량, 총 금액
   - 찜, 장바구니 담기, 바로 선물하기
   - 최근 본 상품 저장, 비슷한 상품 보여주기
   ========================================================= */

let product = null;
let qty = 1;

loadProducts().then(function (products) {
  loadThemes().then(function (themes) {
    product = findProduct(products, getParam("id"));

    // 없는 상품이면 안내만 보여줌
    if (product === null) {
      hideElement("#product");
      hideElement("#detail-more");
      showElement("#detail-empty");
      return;
    }

    showProduct(themes);
    saveRecent(product.id);
    showSimilar(products);
  });
});

function showProduct(themes) {
  document.title = product.name + " | 고르다";
  const img = document.querySelector("#detail-img");
  img.setAttribute("src", product.image);
  img.setAttribute("alt", product.alt);
  // 브랜드가 없는 상품은 브랜드 줄을 숨김
  if (product.brand === "") {
    hideElement("#detail-brand");
  } else {
    document.querySelector("#detail-brand").innerText = product.brand;
  }
  document.querySelector("#detail-name").innerText = product.name;
  document.querySelector("#detail-desc").innerText = product.desc;
  document.querySelector("#detail-price").innerText = formatPrice(product.price);
  document.querySelector("#detail-review").innerText = "“" + product.review + "”";

  const categoryLink = document.querySelector("#detail-category");
  categoryLink.innerText = findName(themes.categories, product.category);
  categoryLink.setAttribute("href", "15_goreuda_explore.html?category=" + product.category);

  // 추천 대상, 상황은 이름으로 바꿔서 쉼표로 이어 붙임
  const recipientNames = [];
  for (let i = 0; i < product.recipients.length; i++) {
    recipientNames.push(findName(themes.recipients, product.recipients[i]));
  }
  const occasionNames = [];
  for (let i = 0; i < product.occasions.length; i++) {
    occasionNames.push(findName(themes.occasions, product.occasions[i]));
  }
  document.querySelector("#detail-recipients").innerText = recipientNames.join(", ");
  document.querySelector("#detail-occasions").innerText = occasionNames.join(", ");

  let optionHtml = "";
  for (let i = 0; i < product.options.length; i++) {
    optionHtml += "<option>" + product.options[i] + "</option>";
  }
  document.querySelector("#detail-option").innerHTML = optionHtml;

  document.querySelector("#detail-wish").innerHTML = heartOff + heartOn;
  drawWishButton(isWished(product.id));
  updateTotal();
}

function drawWishButton(wished) {
  const button = document.querySelector("#detail-wish");
  if (wished) {
    button.className = "wish-big on";
  } else {
    button.className = "wish-big";
  }
  button.setAttribute("aria-pressed", wished);
}

function updateTotal() {
  document.querySelector("#detail-qty").innerText = qty;
  document.querySelector("#detail-total").innerText = formatPrice(product.price * qty);
}

document.querySelector("#detail-minus").addEventListener("click", function () {
  if (qty > 1) {
    qty--;
    updateTotal();
  }
});

document.querySelector("#detail-plus").addEventListener("click", function () {
  qty++;
  updateTotal();
});

document.querySelector("#detail-wish").addEventListener("click", function () {
  drawWishButton(toggleWish(product.id));
});

document.querySelector("#detail-cart").addEventListener("click", function () {
  addToCart(product.id, document.querySelector("#detail-option").value, qty);
});

// 바로 선물하기: 이 상품 하나만 주문서에 담고 선물하기 페이지로 이동
document.querySelector("#detail-gift").addEventListener("click", function () {
  const order = {
    from: "detail",
    items: [{ id: product.id, option: document.querySelector("#detail-option").value, qty: qty }]
  };
  sessionStorage.setItem("goreuda_order", JSON.stringify(order));
  location.href = "15_goreuda_gift.html";
});

// 최근 본 상품: 맨 앞에 두고, 같은 상품은 한 번만, 최대 10개까지
function saveRecent(id) {
  const recent = removeItem(getList("goreuda_recent"), id);
  const result = [id];
  for (let i = 0; i < recent.length && result.length < 10; i++) {
    result.push(recent[i]);
  }
  saveList("goreuda_recent", result);
}

// 같은 카테고리의 다른 상품 4개
function showSimilar(products) {
  const list = [];
  for (let i = 0; i < products.length; i++) {
    if (products[i].category === product.category && products[i].id !== product.id) {
      list.push(products[i]);
    }
  }
  renderCards(document.querySelector("#similar-list"), list.slice(0, 4));
}
