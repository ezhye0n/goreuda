/* =========================================================
   15팀 고르다 - 선물함 JS (15_goreuda_giftbox.js)
   담당자: 오현채
   - 보낸 선물 목록 보여주기
   - 메시지 카드 열고 닫기
   - 같은 상품으로 다시 선물하기
   ========================================================= */

const giftbox = getList("goreuda_giftbox");

// 선물하기 페이지에서 방금 보내고 온 경우 안내 문구
if (getParam("sent") === "1") {
  showElement("#sent-notice");
}

loadProducts().then(function (products) {
  if (giftbox.length === 0) {
    showElement("#giftbox-empty");
    return;
  }

  let html = "";
  for (let i = 0; i < giftbox.length; i++) {
    const gift = giftbox[i];

    html += '<li class="giftbox-item">';
    html += '<div class="giftbox-head">';
    html += '<p class="giftbox-date">' + gift.date + '</p>';
    html += '<p class="giftbox-name">' + gift.name + '님에게 보낸 선물</p>';
    html += '<div class="giftbox-buttons">';
    html += '<button type="button" class="btn btn-outline btn-small" data-index="' + i + '" onclick="toggleCard(this)">카드 보기</button>';
    html += '<button type="button" class="btn btn-outline btn-small" data-index="' + i + '" onclick="giftAgain(this)">다시 선물하기</button>';
    html += '</div></div>';

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

  // 메시지는 사용자가 쓴 글이라 innerText로 넣음 (태그가 그대로 실행되지 않게)
  for (let i = 0; i < giftbox.length; i++) {
    document.querySelector("#card-" + i).innerText = giftbox[i].message;
  }
});

// 카드 보기 버튼: 누를 때마다 카드를 열고 닫음
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

// 다시 선물하기: 같은 상품으로 주문서를 만들어 선물하기 페이지로 이동
function giftAgain(button) {
  const items = giftbox[parseInt(button.getAttribute("data-index"))].items;
  sessionStorage.setItem("goreuda_order", JSON.stringify({ from: "giftbox", items: items }));
  location.href = "15_goreuda_gift.html";
}
