/* 담당: 우은민 */

let editIndex = -1;   // 새로 등록은 -1
let selectedType = "";
const relationNames = { friend: "친구", lover: "연인", family: "가족", coworker: "동료" };
const typeChips = document.querySelectorAll("#type-chips .chip");

loadProducts().then(function () {
  drawFriends();
});

// 오늘 날짜를 기본값으로 하기
document.querySelector("#friend-date").value = todayText();

// 버튼 활성화 할지 비활성화 할지 검사
function updateSubmitBtn() {
  const name = document.querySelector("#friend-name").value;
  const date = document.querySelector("#friend-date").value;
  const customType = document.querySelector("#friend-type-custom").value;

  let typeOk = selectedType !== "";
  if (selectedType === "직접입력" && customType === "") {
    typeOk = false;
  }

  const isAllValid = (name !== "") && (date !== "") && typeOk;
  document.querySelector("#friend-submit").disabled = !isAllValid;
}

// 칩 클릭한 상태 표시하고 직접입력은 입력칸 보여주기
for (let i = 0; i < typeChips.length; i++) {
  typeChips[i].addEventListener("click", function () {
    for (let j = 0; j < typeChips.length; j++) {
      typeChips[j].className = "chip";
    }
    this.className = "chip on";
    selectedType = this.value;

    if (selectedType === "직접입력") {
      showElement("#friend-type-custom");
    } else {
      hideElement("#friend-type-custom");
    }
    updateSubmitBtn();
  });
}

// 입력칸 변경할 때마다 버튼 상태 업데이트
document.querySelector("#friend-name").addEventListener("input", updateSubmitBtn);
document.querySelector("#friend-date").addEventListener("change", updateSubmitBtn);
document.querySelector("#friend-type-custom").addEventListener("input", updateSubmitBtn);

document.querySelector("#friend-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.querySelector("#friend-name").value;
  const date = document.querySelector("#friend-date").value;

  let finalType = selectedType;
  if (selectedType === "직접입력") {
    finalType = document.querySelector("#friend-type-custom").value;
  }

  const friend = {
    name: name,
    relation: document.querySelector("#friend-relation").value,
    type: finalType,
    date: date,
    memo: document.querySelector("#friend-memo").value
  };

  const ddayLabel = ddayText(getDday(friend.date));

  const friends = getList("goreuda_friends");
  if (editIndex === -1) {
    friends.push(friend);
    showToast(friend.name + "님의 " + friend.type + " " + ddayLabel + " 등록 완료!");
  } else {
    friends[editIndex] = friend;
    showToast(friend.name + "님의 " + friend.type + " " + ddayLabel + " 수정 완료!");
  }
  saveList("goreuda_friends", friends);
  resetForm();
  drawFriends();
});

// 수정 취소
document.querySelector("#edit-cancel").addEventListener("click", resetForm);

// 선물함에서 이름이 같은 사람에게 보낸 상품들
function getSentNames(name) {
  const giftbox = getList("goreuda_giftbox");
  const names = [];
  for (let i = 0; i < giftbox.length; i++) {
    if (giftbox[i].name === name) {
      for (let j = 0; j < giftbox[i].items.length; j++) {
        names.push(findProduct(allProducts, giftbox[i].items[j].id).name); // id 일치하는 상품 이름들
      }
    }
  }
  return names;
}

// 친구 기념일 목록
function drawFriends() {
  const friends = getList("goreuda_friends");

  const list = [];
  for (let i = 0; i < friends.length; i++) {
    list.push({ friend: friends[i], index: i, dday: getDday(friends[i].date) }); // 정렬된 상태 말고 원래 index 기억
  }
  list.sort(function (a, b) { return a.dday - b.dday; }); // D-day 작은 순서로 정렬

  let friendtext = "";
  for (let i = 0; i < list.length; i++) {
    const friend = list[i].friend;
    const index = list[i].index;

    let relationText = "";
    if (friend.relation) {
      relationText = relationNames[friend.relation] + ", ";
    }

    let memoText = "";
    if (friend.memo !== "") {
      memoText = ", " + friend.memo;
    }

    friendtext += `
      <li class="friend-item">
        <p class="friend-dday">${ddayText(list[i].dday)}</p>
        <div class="friend-info">
          <p class="friend-name">${friend.name} <span class="badge">${friend.type}</span></p>
          <p class="friend-sub">${relationText}${monthDayText(friend.date)}${memoText}</p>
    `;

    const sent = getSentNames(friend.name);
    if (sent.length > 0) {
      friendtext += `<p class="friend-gifted">이전에 보낸 선물: ${sent.join(", ")}</p>`;
    }

    friendtext += `
        </div>
        <div class="friend-buttons">
          <a href="15_goreuda_finder.html?friend=${index}" class="btn btn-primary btn-small">선물 고르기</a>
          <button type="button" class="btn btn-outline btn-small" value="${index}" onclick="startEdit(this)">수정</button>
          <button type="button" class="btn btn-outline btn-small" value="${index}" onclick="deleteFriend(this)">삭제</button>
        </div>
      </li>
    `;
  }

  document.querySelector("#friend-list").innerHTML = friendtext;

  if (friends.length === 0) { showElement("#friend-empty"); } else { hideElement("#friend-empty"); }
}

// 수정 하기
function startEdit(button) {
  editIndex = parseInt(button.getAttribute("value"));
  const friend = getList("goreuda_friends")[editIndex];

  document.querySelector("#friend-name").value = friend.name;
  document.querySelector("#friend-relation").value = friend.relation || "friend";
  document.querySelector("#friend-date").value = friend.date;
  document.querySelector("#friend-memo").value = friend.memo;

  // 칩 선택 상태
  let matched = false;
  for (let i = 0; i < typeChips.length; i++) {
    if (typeChips[i].value === friend.type) { 
      typeChips[i].className = "chip on"; 
      selectedType = friend.type;
      hideElement("#friend-type-custom");
      matched = true;
    } else {
      typeChips[i].className = "chip";
    }
  }

  // matched가 false면 직접입력 
  if (!matched) {
    for (let i = 0; i < typeChips.length; i++) {
      if (typeChips[i].value === "직접입력") {
        typeChips[i].className = "chip on";
      }
    }
    selectedType = "직접입력";
    document.querySelector("#friend-type-custom").value = friend.type;
    showElement("#friend-type-custom");
  }

  document.querySelector("#form-title").innerText = "기념일 수정";
  document.querySelector("#friend-submit").innerText = "수정하기";
  showElement("#edit-cancel");
  updateSubmitBtn();
}

// 삭제 하기
function deleteFriend(button) {
  const index = parseInt(button.getAttribute("value"));
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

// 폼 초기화
function resetForm() {
  editIndex = -1;
  selectedType = "";
  document.querySelector("#friend-name").value = "";
  document.querySelector("#friend-relation").value = "friend";
  document.querySelector("#friend-date").value = "";
  document.querySelector("#friend-memo").value = "";
  document.querySelector("#friend-type-custom").value = "";
  hideElement("#friend-type-custom");

  for (let i = 0; i < typeChips.length; i++) {
    typeChips[i].className = "chip";
  }

  document.querySelector("#form-title").innerText = "어떤 날에 선물할까요?";
  document.querySelector("#friend-submit").innerText = "등록하기";
  document.querySelector("#friend-date").value = todayText();
  hideElement("#edit-cancel");
  updateSubmitBtn();
}
