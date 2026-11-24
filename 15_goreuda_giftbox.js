/*선물함 JS 담당자: 이예경
(보낸 선물 목록 보여주기, 메시지 카드 열고 닫기, 같은 상품으로 다시 선물하기)*/

//보낸 선물 목록 가져오기
const giftbox = getList("goreuda_giftbox");

//선물하기 페이지에서 방금 보내고 온 경우 안내 문구
if (getParam("sent") === "1") {
  showElement("#sent-notice");
}

//상품 데이터를 불러온 후 선물함 화면
loadProducts().then(function (products) {
  if (giftbox.length === 0) {
    showElement("#giftbox-empty");
    return;
  }

  let html = "";

   //선물 목록을 하나씩 반복해서 화면에 추가하기
  for (let i = 0; i < giftbox.length; i++) {
    const gift = giftbox[i];

     //선물을 감싸는 목록 항목 만들기
    html += '<li class="giftbox-item">';
    html += '<div class="giftbox-head">';

     //선물을 보낸 날짜와 받는 사람 이름 표시
    html += '<p class="giftbox-date">' + gift.date + '</p>';
    html += '<p class="giftbox-name">' + gift.name + '님에게 보낸 선물</p>';

     //메세지 카드 보기랑 다시 선물하기 버튼
    html += '<div class="giftbox-buttons">';
    html += '<button type="button" class="btn btn-outline btn-small" data-index="' + i + '" onclick="toggleCard(this)">카드 보기</button>';
    html += '<button type="button" class="btn btn-outline btn-small" data-index="' + i + '" onclick="giftAgain(this)">다시 선물하기</button>';
    html += '</div></div>';


     //선물에 포함된 상품 목록 표시하기
    html += '<ul class="giftbox-products">';
     
    for (let j = 0; j < gift.items.length; j++) {
      const product = findProduct(products, gift.items[j].id); //상품ID로 전체 상품 데이터에서 상품 찾기
      html += '<li class="giftbox-product">'; //상품 항목
      html += '<img src="' + product.image + '" alt="' + product.alt + '">'; //이미지
      html += '<a href="15_goreuda_detail.html?id=' + product.id + '">' + product.name + '<br>' + gift.items[j].option + ', ' + gift.items[j].qty + '개</a>'; //이름, 옵션
      html += '</li>'; //수량
    }
     
    html += '</ul>';

    html += '<p class="giftbox-card" id="card-' + i + '" style="display: none; background-color: ' + gift.cardColor + ';"></p>';
    html += '</li>';
  }
  document.querySelector("#giftbox-list").innerHTML = html;

   //저장된 메시지를 메시지 카드에 넣었고  innerText 사용해서 HTML 태그로 실행되지 않게 만듦
  for (let i = 0; i < giftbox.length; i++) {
    document.querySelector("#card-" + i).innerText = giftbox[i].message;
  }
});

// 카드 보기 버튼. 누를 때마다 카드를 열고 닫음
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

// 다시 선물하기. 같은 상품으로 주문서를 만들어 선물하기 페이지로 이동
function giftAgain(button) {
  const items = giftbox[parseInt(button.getAttribute("data-index"))].items; //클릭한 버튼의 번호로 상품 목록 가져옴
  sessionStorage.setItem("goreuda_order", JSON.stringify({ from: "giftbox", items: items })); //선택한 상품을 sessionStorage에 임시저장
  location.href = "15_goreuda_gift.html"; //저장한 상품 정보로 선물하기 페이지로 이동
}
