/* =========================================================
   15팀 고르다 - 친구 기념일 JS (15_goreuda_friends.js)
   담당자: 이지현
   - 친구 기념일 등록, 수정, 삭제 (localStorage)
   - 남은 날(D-day)이 적은 순서로 목록 보여주기
   - 선물 고르기: 그 친구 정보로 선물 찾기 시작
   - 그 친구에게 예전에 보낸 선물 표시
   ========================================================= */

const relationNames = { friend: "친구", lover: "연인", family: "가족", coworker: "동료" };
let editIndex = -1;   // 수정 중인 친구 번호, -1이면 새로 등록

loadProducts().then(function () {
  drawFriends();
});

document.querySelector("#friend-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.querySelector("#friend-name").value;
  const date = document.querySelector("#friend-date").value;
  if (name === "" || date === "") {
    showElement("#friend-error");
    return;
  }
  hideElement("#friend-error");

  const friend = {
    name: name,
    relation: document.querySelector("#friend-relation").value,
    type: document.querySelector("#friend-type").value,
    date: date,
    memo: document.querySelector("#friend-memo").value
  };

  const friends = getList("goreuda_friends");
  if (editIndex === -1) {
    friends.push(friend);
    showToast(name + "님의 " + friend.type + "을 등록했어요.");
  } else {
    friends[editIndex] = friend;
    showToast("수정했어요.");
  }
  saveList("goreuda_friends", friends);
  resetForm();
  drawFriends();
});

document.querySelector("#edit-cancel").addEventListener("click", resetForm);

// 선물함에서 이름이 같은 사람에게 보낸 상품 이름 목록
function getSentNames(name) {
  const giftbox = getList("goreuda_giftbox");
  const names = [];
  for (let i = 0; i < giftbox.length; i++) {
    if (giftbox[i].name === name) {
      for (let j = 0; j < giftbox[i].items.length; j++) {
        names.push(findProduct(allProducts, giftbox[i].items[j].id).name);
      }
    }
  }
  return names;
}

function drawFriends() {
  const friends = getList("goreuda_friends");

  // 원래 번호(index)를 함께 기억한 뒤 D-day 순으로 정렬
  const list = [];
  for (let i = 0; i < friends.length; i++) {
    list.push({ friend: friends[i], index: i, dday: getDday(friends[i].date) });
  }
  list.sort(function (a, b) { return a.dday - b.dday; });

  let html = "";
  for (let i = 0; i < list.length; i++) {
    const friend = list[i].friend;
    const index = list[i].index;

    let memoText = "";
    if (friend.memo !== "") {
      memoText = ", " + friend.memo;
    }

    html += '<li class="friend-item">';
    html += '<p class="friend-dday">' + ddayText(list[i].dday) + '</p>';
    html += '<div class="friend-info">';
    html += '<p class="friend-name">' + friend.name + ' <span class="badge">' + relationNames[friend.relation] + '</span></p>';
    html += '<p class="friend-sub">' + friend.type + ' ' + monthDayText(friend.date) + memoText + '</p>';

    const sent = getSentNames(friend.name);
    if (sent.length > 0) {
      html += '<p class="friend-gifted">이전에 보낸 선물: ' + sent.join(", ") + '</p>';
    }
    html += '</div>';

    html += '<div class="friend-buttons">';
    html += '<a href="15_goreuda_finder.html?friend=' + index + '" class="btn btn-primary btn-small">선물 고르기</a>';
    html += '<button type="button" class="btn btn-outline btn-small" data-index="' + index + '" onclick="startEdit(this)">수정</button>';
    html += '<button type="button" class="btn btn-outline btn-small" data-index="' + index + '" onclick="deleteFriend(this)">삭제</button>';
    html += '</div>';
    html += '</li>';
  }
  document.querySelector("#friend-list").innerHTML = html;

  if (friends.length === 0) { showElement("#friend-empty"); } else { hideElement("#friend-empty"); }
}

// 수정 버튼: 폼에 값을 채우고 버튼 글자를 바꿈
function startEdit(button) {
  editIndex = parseInt(button.getAttribute("data-index"));
  const friend = getList("goreuda_friends")[editIndex];

  document.querySelector("#friend-name").value = friend.name;
  document.querySelector("#friend-relation").value = friend.relation;
  document.querySelector("#friend-type").value = friend.type;
  document.querySelector("#friend-date").value = friend.date;
  document.querySelector("#friend-memo").value = friend.memo;
  document.querySelector("#form-title").innerText = "기념일 수정";
  document.querySelector("#friend-submit").innerText = "수정하기";
  showElement("#edit-cancel");
}

function deleteFriend(button) {
  const index = parseInt(button.getAttribute("data-index"));
  const friends = getList("goreuda_friends");

  if (confirm(friends[index].name + "님의 기념일을 삭제할까요?")) {
    const left = [];
    for (let i = 0; i < friends.length; i++) {
      if (i !== index) {
        left.push(friends[i]);
      }
    }
    saveList("goreuda_friends", left);
    resetForm();
    drawFriends();
  }
}

function resetForm() {
  editIndex = -1;
  document.querySelector("#friend-name").value = "";
  document.querySelector("#friend-relation").value = "friend";
  document.querySelector("#friend-type").value = "생일";
  document.querySelector("#friend-date").value = "";
  document.querySelector("#friend-memo").value = "";
  document.querySelector("#form-title").innerText = "기념일 등록";
  document.querySelector("#friend-submit").innerText = "등록하기";
  hideElement("#edit-cancel");
  hideElement("#friend-error");
}
