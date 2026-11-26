/* 담당: 이예경 */

// 보낸 선물 목록
const giftbox = getList("goreuda_giftbox");

// 방금 보내고 온 경우 안내 문구
if (getParam("sent") === "1") {
  showElement("#sent-notice");
}

// 선물함 화면
loadProducts().then(function (products) {
  if (giftbox.length === 0) {
    showElement("#giftbox-empty");
    return;
  }

  let html = "";

  // 선물 목록 표시
  for (let i = 0; i < giftbox.length; i++) {
    const gift = giftbox[i];

    html += '<li class="giftbox-item">';
    html += '<div class="giftbox-head">';

    // 보낸 날짜, 받는 사람
    html += '<p class="giftbox-date">' + gift.date + '</p>';
    html += '<p class="giftbox-name">' + gift.name + '님에게 보낸 선물</p>';

    // 카드 보기, 다시 선물하기 버튼
    html += '<div class="giftbox-buttons">';
    html += '<button type="button" class="btn btn-outline btn-small" data-index="' + i + '" onclick="toggleCard(this)">카드 보기</button>';
    html += '<button type="button" class="btn btn-outline btn-small" data-index="' + i + '" onclick="giftAgain(this)">다시 선물하기</button>';
    html += '</div></div>';

    // 선물에 담긴 상품
    html += '<ul class="giftbox-products">';
    for (let j = 0; j < gift.items.length; j++) {
      const product = findProduct(products, gift.items[j].id);
      html += '<li class="giftbox-product">';
      html += '<img src="' + product.image + '" alt="' + product.alt + '">';
      html += '<a href="15_goreuda_detail.html?id=' + product.id + '">' + product.name + '<br>' + gift.items[j].option + ', ' + gift.items[j].qty + '개</a>';
      html += '</li>';
    }
    html += '</ul>';

    html += '<p class="giftbox-card" id="card-' + i + '" style="display: none; background-color: ' + gift.cardColor + ';"></p>';
    html += '</li>';
  }
  document.querySelector("#giftbox-list").innerHTML = html;

  // 메시지는 innerText로 넣어 태그가 실행되지 않게 함
  for (let i = 0; i < giftbox.length; i++) {
    document.querySelector("#card-" + i).innerText = giftbox[i].message;
  }
});

// 카드 열고 닫기
function toggleCard(button) {
  const card = document.querySelector("#card-" + button.getAttribute("data-index"));
  if (card.style.display === "none") {
    card.style.display = "block";
    button.innerText = "카드 닫기";
  } else {
    card.style.display = "none";
    button.innerText = "카드 보기";
  }
}

// 같은 상품으로 다시 선물하기
function giftAgain(button) {
  const items = giftbox[parseInt(button.getAttribute("data-index"))].items;
  sessionStorage.setItem("goreuda_order", JSON.stringify({ from: "giftbox", items: items }));
  location.href = "15_goreuda_gift.html";
}
