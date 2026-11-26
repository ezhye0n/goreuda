/* 담당: 우은민 */

const MESSAGE_MAX = 100;
const order = JSON.parse(sessionStorage.getItem("goreuda_order")); // 상품 상세나 카트에서 넘어 온 주문 상품 정보
let cards = [];
let selectedCard = null;

// products 정보랑 themes 정보 불러와서 화면 세팅
loadProducts().then(function (products) {
  loadThemes().then(function (themes) {
    // 주문 정보 없이 선물하기 페이지 바로 열었을 때
    if (order === null) {
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

// 주문 정보 보여주기
function showOrder(products) {
  let producttext = "";
  let sum = 0;
  for (let i = 0; i < order.items.length; i++) {
    const item = order.items[i];
    const product = findProduct(products, item.id); //주문 상품 정보와 일치하는 상품 정보 반환
    sum += product.price * item.qty;

    producttext += `
      <li class="order-item">
        <img src="${product.image}" alt="${product.alt}">
        <p class="order-item-info"><strong>${product.name}</strong>옵션 : ${item.option}/${item.qty}개</p>
        <p class="order-item-price">${formatPrice(product.price * item.qty)}</p>
      </li>`;
  }
  document.querySelector("#order-list").innerHTML = producttext;

  // 배송비 3만원 이상 무료
  let delivery = 0;
  if (sum < 30000) {
    delivery = 3000;
  }
  document.querySelector("#gift-products").innerText = formatPrice(sum);
  document.querySelector("#gift-delivery").innerText = formatPrice(delivery);
  document.querySelector("#gift-total").innerText = formatPrice(sum + delivery);
}

// 기념일 등록한 친구 있다면 고르는 거 보여주기
function showFriends() {
  const friends = getList("goreuda_friends"); // 로컬스토리지에 저장된 친구 목록
  if (friends.length === 0) {
    return;
  }
  let selecttext = '<option value="self">직접 입력</option>';
  for (let i = 0; i < friends.length; i++) {
    selecttext += '<option value="' + i + '">' + friends[i].name + ' (' + friends[i].type + ' ' + monthDayText(friends[i].date) + ')</option>';
  }
  document.querySelector("#friend-select").innerHTML = selecttext;
  showElement("#friend-row");
}

// 친구 목록에서 고른 이름으로 세팅
document.querySelector("#friend-select").addEventListener("change", function () {
  if (this.value !== "self") {
    const friends = getList("goreuda_friends");
    document.querySelector("#receiver-name").value = friends[parseInt(this.value)].name;
    setError("#receiver-name", "#name-error", document.querySelector("#receiver-name").value === "");
    updateSubmitBtn();
  }
});

// 휴대폰 번호 형식 확인 (11자리, 앞자리 01로 시작, 숫자만)
function isPhone(phone) {
  if (phone.length !== 11) {
    return false;
  }
  if (phone[0] !== "0" || phone[1] !== "1" ) {
    return false;
  }
  for (let i = 0; i < phone.length; i++) {
    if (phone[i] < "0" || phone[i] > "9") {
      return false;
    }
  }
  return true;
}

// 입력 칸 아래 오류 문구 보일지 숨길지 세팅
function setError(inputSelector, errorSelector, hasError) {
  if (hasError) {
    document.querySelector(inputSelector).className = "input-box error";
    showElement(errorSelector);
   } else {
    document.querySelector(inputSelector).className = "input-box";
    hideElement(errorSelector);
  }
}

// 버튼 활성화 할지 비활성화 할지 검사
function updateSubmitBtn() {
  const name = document.querySelector("#receiver-name").value;
  const phone = document.querySelector("#receiver-phone").value;

  const isAllValid = (name !== "") && isPhone(phone) ;
  document.querySelector("#submit-btn").disabled = !isAllValid; //조건이 만족하지 않으면 비활성화
}

// 이름 칸을 선택했다가 뗄 때마다 검사
document.querySelector("#receiver-name").addEventListener("blur", function () {
  const name = document.querySelector("#receiver-name").value;
  setError("#receiver-name", "#name-error", name === "");
});

// 휴대폰 칸을 선택했다가 뗄 때마다 검사
document.querySelector("#receiver-phone").addEventListener("blur", function () {
  const phone = document.querySelector("#receiver-phone").value;

  // 에러 두 개 겹치지 않게 먼저 둘 다 숨기기 
  hideElement("#phone-empty-error");
  hideElement("#phone-error");

  if (phone === "") {
    setError("#receiver-phone", "#phone-empty-error", true);
  } else if (!isPhone(phone)) {
    setError("#receiver-phone", "#phone-error", true);
  } else {
    document.querySelector("#receiver-phone").className = "input-box"; // 정상일 때는 에러 클래스 제거
  }
});

// 입력할 때마다 실시간으로 버튼 상태 바꾸기
document.querySelector("#receiver-name").addEventListener("input", updateSubmitBtn);
document.querySelector("#receiver-phone").addEventListener("input", updateSubmitBtn);

// 카드 고르는 버튼
function showCards() {
  let cardtext = "";
  for (let i = 0; i < cards.length; i++) {
    cardtext += `<button type="button" class="card-chip" onclick="selectCard(${i})" style="background-color: ${cards[i].color};">${cards[i].name}</button>`;
  }
  document.querySelector("#card-choice").innerHTML = cardtext;
  selectCard(0); // 기본은 첫 번째 카드로 선택
}

// 카드를 고르면 색과 기본 문구가 바뀌는 함수
function selectCard(index) {
  selectedCard = cards[index];
  document.querySelector("#message-box").style.backgroundColor = selectedCard.color;
  document.querySelector("#message").value = selectedCard.text;
  countMessage();

  const chips = document.querySelectorAll(".card-chip");
  for (let i = 0; i < chips.length; i++) {
    if (i === index) {
      chips[i].className = "card-chip on"; // 선택된 버튼에만 강조
    } else {
      chips[i].className = "card-chip";
    }
  }
}

// 메시지  글자 수 카운트
function countMessage() {
  document.querySelector("#message-count").innerText = document.querySelector("#message").value.length;
}

// 메시지 입력할 때마다 글자 수 세고 100자 넘으면 오류메시지
document.querySelector("#message").addEventListener("input", function () {
  countMessage();
  const messageOk = this.value.length <= MESSAGE_MAX;
  if (messageOk) { hideElement("#message-error"); } else { showElement("#message-error"); }
});

// 선물하기 버튼 눌렀을 때 
document.querySelector("#gift-form").addEventListener("submit", function (event) {
  event.preventDefault();   // 페이지가 새로고침되지 않게 막음

  const name = document.querySelector("#receiver-name").value;
  const message = document.querySelector("#message").value;

  // 선물함에 저장 
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
