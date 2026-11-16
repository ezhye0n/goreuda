/* =========================================================
   15팀 고르다 - 선물하기 JS (15_goreuda_gift.js)
   담당자: 오현채
   - sessionStorage의 주문서(goreuda_order)로 선물할 상품 보여주기
   - 친구 목록에서 받는 사람 불러오기
   - 메시지 카드 고르기, 글자 수 세기
   - 입력값 확인 후 선물함(goreuda_giftbox)에 저장
   ========================================================= */

const MESSAGE_MAX = 100;
const order = JSON.parse(sessionStorage.getItem("goreuda_order"));
let cards = [];
let selectedCard = null;

loadProducts().then(function (products) {
  loadThemes().then(function (themes) {
    // 주문서가 없으면 안내만 보여줌
    if (order === null || order.items.length === 0) {
      hideElement("#gift-form");
      showElement("#gift-empty");
      return;
    }

    cards = themes.cards;
    showOrder(products);
    showFriends();
    showCards();
  });
});

function showOrder(products) {
  let html = "";
  let sum = 0;
  for (let i = 0; i < order.items.length; i++) {
    const item = order.items[i];
    const product = findProduct(products, item.id);
    sum += product.price * item.qty;

    html += '<li class="order-item">';
    html += '<img src="' + product.image + '" alt="' + product.alt + '">';
    html += '<p class="order-item-info"><strong>' + product.name + '</strong>' + item.option + ', ' + item.qty + '개</p>';
    html += '<p class="order-item-price">' + formatPrice(product.price * item.qty) + '</p>';
    html += '</li>';
  }
  document.querySelector("#order-list").innerHTML = html;

  let delivery = 0;
  if (sum < 30000) {
    delivery = 3000;
  }
  document.querySelector("#gift-products").innerText = formatPrice(sum);
  document.querySelector("#gift-delivery").innerText = formatPrice(delivery);
  document.querySelector("#gift-total").innerText = formatPrice(sum + delivery);
}

// 친구 기념일 페이지에 등록한 친구가 있으면 고르는 칸을 보여줌
function showFriends() {
  const friends = getList("goreuda_friends");
  if (friends.length === 0) {
    return;
  }
  let html = '<option value="">직접 입력</option>';
  for (let i = 0; i < friends.length; i++) {
    html += '<option value="' + i + '">' + friends[i].name + ' (' + friends[i].type + ' ' + monthDayText(friends[i].date) + ')</option>';
  }
  document.querySelector("#friend-select").innerHTML = html;
  showElement("#friend-row");
}

document.querySelector("#friend-select").addEventListener("change", function () {
  if (this.value !== "") {
    const friends = getList("goreuda_friends");
    document.querySelector("#receiver-name").value = friends[parseInt(this.value)].name;
  }
});

// 카드 디자인 버튼 만들기
function showCards() {
  let html = "";
  for (let i = 0; i < cards.length; i++) {
    html += '<button type="button" class="card-chip" data-index="' + i + '" onclick="selectCard(this)" style="background-color: ' + cards[i].color + ';">' + cards[i].name + '</button>';
  }
  document.querySelector("#card-choice").innerHTML = html;
  selectCard(document.querySelector(".card-chip"));
}

// 카드를 고르면 미리보기 색과 기본 문구가 바뀜
function selectCard(button) {
  const index = parseInt(button.getAttribute("data-index"));
  selectedCard = cards[index];
  document.querySelector("#message-preview").style.backgroundColor = selectedCard.color;
  document.querySelector("#message").value = selectedCard.text;
  countMessage();

  const chips = document.querySelectorAll(".card-chip");
  for (let i = 0; i < chips.length; i++) {
    if (i === index) {
      chips[i].className = "card-chip on";
      chips[i].setAttribute("aria-pressed", "true");
    } else {
      chips[i].className = "card-chip";
      chips[i].setAttribute("aria-pressed", "false");
    }
  }
}

function countMessage() {
  document.querySelector("#message-count").innerText = document.querySelector("#message").value.length;
}

document.querySelector("#message").addEventListener("input", countMessage);

/* 휴대폰 번호 확인: 010-1234-5678처럼 13자리이고 4번째, 9번째 글자가 "-" 인지 */
function isPhone(phone) {
  return phone.length === 13 && phone[3] === "-" && phone[8] === "-";
}

// 입력칸 아래 오류 문구 보이기, 숨기기
function setError(inputSelector, errorSelector, hasError) {
  if (hasError) {
    document.querySelector(inputSelector).className = "input-box error";
    showElement(errorSelector);
  } else {
    document.querySelector(inputSelector).className = "input-box";
    hideElement(errorSelector);
  }
}

document.querySelector("#gift-form").addEventListener("submit", function (event) {
  event.preventDefault();   // 페이지가 새로고침되지 않게 막음

  const name = document.querySelector("#receiver-name").value;
  const phone = document.querySelector("#receiver-phone").value;
  const message = document.querySelector("#message").value;

  const nameOk = name !== "";
  const phoneOk = isPhone(phone);
  const messageOk = message.length <= MESSAGE_MAX;

  setError("#receiver-name", "#name-error", !nameOk);
  setError("#receiver-phone", "#phone-error", !phoneOk);
  if (messageOk) { hideElement("#message-error"); } else { showElement("#message-error"); }

  if (!nameOk || !phoneOk || !messageOk) {
    return;
  }

  // 선물함에 저장 (최근 선물이 맨 앞에 오도록 새 배열을 만듦)
  const giftbox = getList("goreuda_giftbox");
  const newGift = {
    date: todayText(),
    name: name,
    items: order.items,
    card: selectedCard.id,
    cardColor: selectedCard.color,
    message: message
  };
  const result = [newGift];
  for (let i = 0; i < giftbox.length; i++) {
    result.push(giftbox[i]);
  }
  saveList("goreuda_giftbox", result);

  // 장바구니에서 온 주문이면 보낸 상품을 장바구니에서 뺌
  if (order.from === "cart") {
    const cart = getList("goreuda_cart");
    const left = [];
    for (let i = 0; i < cart.length; i++) {
      if (cart[i].checked === false) {
        left.push(cart[i]);
      }
    }
    saveList("goreuda_cart", left);
  }

  sessionStorage.removeItem("goreuda_order");
  location.href = "15_goreuda_giftbox.html?sent=1";
});
