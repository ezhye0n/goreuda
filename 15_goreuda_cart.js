/* 담당: 우은민 */

const FREE_DELIVERY = 30000;   // 3만원 이상이면 무료배송
const DELIVERY_FEE = 3000;

loadProducts().then(function () {
  drawCart();
});

function drawCart() {
  const cart = getList("goreuda_cart");
  let itemtext = "";

  for (let i = 0; i < cart.length; i++) {
    const product = findProduct(allProducts, cart[i].id);
    const link = "15_goreuda_detail.html?id=" + product.id;
    let checked = "";
    if (cart[i].checked) {
      checked = " checked";
    }

    // 상품 카드
    itemtext += '<li class="cart-item">';
    itemtext += '<input type="checkbox" value="' + i + '" onchange="checkItem(this)" aria-label="' + product.name + ' 선택"' + checked + '>';
    itemtext += '<a href="' + link + '"><img src="' + product.image + '" alt="' + product.alt + '"></a>';
    itemtext += '<div class="cart-item-info">';
    itemtext += '<a href="' + link + '" class="cart-item-name">' + product.name + '</a>';
    itemtext += '<p class="cart-item-option">옵션: ' + cart[i].option + '</p>';
    itemtext += '</div>';
    itemtext += '<div class="qty">';
    itemtext += '<button type="button" value="' + i + '" onclick="changeQty(this, -1)" aria-label="수량 빼기">-</button>';
    itemtext += '<span>' + cart[i].qty + '</span>';
    itemtext += '<button type="button" value="' + i + '" onclick="changeQty(this, 1)" aria-label="수량 더하기">+</button>';
    itemtext += '</div>';
    itemtext += '<p class="cart-item-price">' + formatPrice(product.price * cart[i].qty) + '</p>';
    itemtext += '<button type="button" class="remove-btn" value="' + i + '" onclick="removeCartItem(this)" aria-label="' + product.name + ' 삭제">×</button>';
    itemtext += '</li>';
  }
  document.querySelector("#cart-list").innerHTML = itemtext;

  if (cart.length === 0) { showElement("#cart-empty"); } else { hideElement("#cart-empty"); }
  drawSummary(cart);
}

// 체크된 상품만 금액에 넣음
function drawSummary(cart) {
  let sum = 0;
  let allChecked = cart.length > 0;
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].checked) {
      sum += findProduct(allProducts, cart[i].id).price * cart[i].qty;
    } else {
      allChecked = false;
    }
  }

  let delivery = 0;
  if (sum > 0 && sum < FREE_DELIVERY) {
    delivery = DELIVERY_FEE;
  }

  // 결제 금액
  document.querySelector("#sum-products").innerText = formatPrice(sum);
  document.querySelector("#sum-delivery").innerText = formatPrice(delivery);
  document.querySelector("#sum-total").innerText = formatPrice(sum + delivery);
  document.querySelector("#check-all").checked = allChecked;

  // 무료배송 조건
  const freeInfo = document.querySelector("#free-info");
  if (sum === 0) {
    freeInfo.innerText = "";
  } else if (sum < FREE_DELIVERY) {
    freeInfo.innerText = formatPrice(FREE_DELIVERY - sum) + " 더 담으면 무료배송이에요.";
  } else {
    freeInfo.innerText = "무료배송으로 보내 드려요.";
  }
}

// 수량 더하고 빼기
function changeQty(button, amount) {
  const cart = getList("goreuda_cart");
  const index = parseInt(button.getAttribute("value"));
  if (cart[index].qty + amount >= 1) {
    cart[index].qty += amount;
  }
  saveList("goreuda_cart", cart);
  drawCart();
}

// 상품 지우기
function removeCartItem(button) {
  const cart = getList("goreuda_cart");
  const index = parseInt(button.getAttribute("value"));
  const left = [];
  for (let i = 0; i < cart.length; i++) {
    if (i !== index) {
      left.push(cart[i]);
    }
  }
  saveList("goreuda_cart", left);  // 남은 상품 유지
  updateHeaderCount();
  drawCart();
}

// 상품 체크
function checkItem(input) {
  const cart = getList("goreuda_cart");
  cart[parseInt(input.getAttribute("value"))].checked = input.checked;
  saveList("goreuda_cart", cart);
  drawSummary(cart);
}

// 전체 체크
document.querySelector("#check-all").addEventListener("change", function () {
  const cart = getList("goreuda_cart");
  for (let i = 0; i < cart.length; i++) {
    cart[i].checked = this.checked;
  }
  saveList("goreuda_cart", cart);
  drawCart();
});

// 선택 삭제
document.querySelector("#delete-checked").addEventListener("click", function () {
  const cart = getList("goreuda_cart");
  const left = [];
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].checked === false) {
      left.push(cart[i]);
    }
  }
  saveList("goreuda_cart", left);
  updateHeaderCount();
  drawCart();
});

// 체크된 상품만 주문서에 담아 선물하기 페이지로 이동
document.querySelector("#cart-gift").addEventListener("click", function () {
  const cart = getList("goreuda_cart");
  const items = [];
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].checked) {
      items.push({ id: cart[i].id, option: cart[i].option, qty: cart[i].qty });
    }
  }
  if (items.length === 0) {
    showToast("선물할 상품을 선택해 주세요.");
    return;
  }
  sessionStorage.setItem("goreuda_order", JSON.stringify({ from: "cart", items: items }));
  location.href = "15_goreuda_gift.html";
});
