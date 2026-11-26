/* 담당: 이예경 */

loadProducts().then(function () {
  drawWish();
});

// 찜 목록 표시
function drawWish() {
  const wish = getList("goreuda_wish");
  const list = [];

  // 상품 데이터에 있는 것만 목록에 추가
  for (let i = 0; i < wish.length; i++) {
    const product = findProduct(allProducts, wish[i]);
    if (product !== null) {
      list.push(product);
    }
  }

  renderCards(document.querySelector("#wish-list"), list);
  document.querySelector("#wish-total").innerText = "찜한 상품 " + list.length + "개";

  // 찜한 상품이 없으면 안내 문구, 있으면 개수 표시
  if (list.length === 0) {
    showElement("#wish-empty");
    hideElement("#wish-total");
  } else {
    hideElement("#wish-empty");
    showElement("#wish-total");
  }
}

// 하트를 누르면 목록 다시 표시
function afterWishChange() {
  drawWish();
}
