/* 15팀 고르다 - 위시 JS (15_goreuda_wishlist.js)
   담당자: 이예경 (localStorage의 찜 목록으로 상품 카드 만들기, 하트 눌러서 목록에서 빼기) */

loadProducts().then(function () {
  drawWish();
});

function drawWish() {
  const wish = getList("goreuda_wish");
  const list = [];
  for (let i = 0; i < wish.length; i++) {
    const product = findProduct(allProducts, wish[i]);
    if (product !== null) {
      list.push(product);
    }
  }

  renderCards(document.querySelector("#wish-list"), list);
  document.querySelector("#wish-total").innerText = "찜한 상품 " + list.length + "개";

  if (list.length === 0) {
    showElement("#wish-empty");
    hideElement("#wish-total");
  } else {
    hideElement("#wish-empty");
    showElement("#wish-total");
  }
}

// 공통 JS의 clickWish가 찜을 바꾼 뒤 이 함수를 불러서 목록을 다시 그림
function afterWishChange() {
  drawWish();
}
