/* =========================================================
   15팀 고르다 - 선물 찾기 JS (15_goreuda_finder.js)
   담당자: 오현채
   - 질문을 한 단계씩 보여주고 답을 모으기
   - 상품마다 답과 맞는 정도를 점수로 계산해서 높은 순으로 추천
   - 마지막 답은 localStorage에 저장해서 다음에 그대로 다시 찾기
   - 친구 기념일에서 들어오면(?friend=번호) 받는 사람을 미리 채우고,
     그 친구에게 이미 보낸 선물은 따로 표시
   ========================================================= */

let themes = null;
let questions = [];
let step = 0;          // 지금 보고 있는 질문 번호 (0부터)
let answers = {};      // 고른 답 { recipient: "friend", occasion: "birthday", ... }
let friendName = null; // 친구 기념일에서 들어온 경우 그 친구 이름

loadProducts().then(function () {
  loadThemes().then(function (data) {
    themes = data;

    // 질문 목록: 각 질문의 선택지는 테마 JSON에서 가져옴
    questions = [
      { key: "recipient", text: "누구에게 선물하나요?", options: themes.recipients },
      { key: "occasion", text: "어떤 날인가요?", options: themes.occasions },
      { key: "budget", text: "예산은 어느 정도인가요?", options: themes.budgets },
      { key: "taste", text: "받는 분은 어떤 스타일인가요?", options: themes.tastes }
    ];

    // 친구 기념일에서 들어온 경우: 저장된 친구 정보로 첫 질문을 채우고 두 번째 질문부터
    const friendIndex = getParam("friend");
    if (friendIndex !== null) {
      const friend = getList("goreuda_friends")[parseInt(friendIndex)];
      if (friend) {
        friendName = friend.name;
        answers.recipient = friend.relation;
        step = 1;
      }
    }

    // 지난번 답이 있으면 "지난번 조건으로 찾기" 버튼을 보여줌
    if (localStorage.getItem("goreuda_finder") !== null && friendName === null) {
      showElement("#finder-last");
    }

    drawQuestion();
  });
});

/* ---------- 질문 그리기 ---------- */
function drawQuestion() {
  const question = questions[step];
  document.querySelector("#finder-step").innerText = "질문 " + (step + 1) + " / " + questions.length;
  document.querySelector("#finder-question").innerText = question.text;

  let html = "";
  for (let i = 0; i < question.options.length; i++) {
    const option = question.options[i];
    let className = "finder-option";
    if (answers[question.key] === option.id) {
      className = "finder-option on";
    }
    html += '<button type="button" class="' + className + '" data-id="' + option.id + '" onclick="chooseOption(this)">' + option.name + '</button>';
  }
  document.querySelector("#finder-options").innerHTML = html;

  // 첫 질문에서는 이전 버튼을 숨김
  if (step === 0) { hideElement("#finder-prev"); } else { showElement("#finder-prev"); }
}

// 선택지를 누르면 답을 저장하고 다음 질문으로, 마지막이면 결과 보여주기
function chooseOption(button) {
  answers[questions[step].key] = button.getAttribute("data-id");

  if (step < questions.length - 1) {
    step++;
    drawQuestion();
  } else {
    localStorage.setItem("goreuda_finder", JSON.stringify(answers));
    showResult();
  }
}

document.querySelector("#finder-prev").addEventListener("click", function () {
  if (step > 0) {
    step--;
    drawQuestion();
  }
});

document.querySelector("#finder-last").addEventListener("click", function () {
  answers = JSON.parse(localStorage.getItem("goreuda_finder"));
  showResult();
});

document.querySelector("#finder-restart").addEventListener("click", function () {
  answers = {};
  step = 0;
  friendName = null;
  hideElement("#finder-result");
  showElement("#finder-box");
  drawQuestion();
});

/* ---------- 점수 계산 ----------
   받는 사람이 맞으면 3점, 상황이 맞으면 3점, 취향이 맞으면 2점
   예산을 벗어난 상품은 -1점을 돌려줘서 결과에서 뺌 */
function findBudget(id) {
  for (let i = 0; i < themes.budgets.length; i++) {
    if (themes.budgets[i].id === id) {
      return themes.budgets[i];
    }
  }
  return null;
}

function scoreProduct(product) {
  let score = 0;
  const reasons = [];

  const budget = findBudget(answers.budget);
  if (budget !== null && (product.price < budget.min || product.price >= budget.max)) {
    return { score: -1, reasons: reasons };
  }
  if (hasItem(product.recipients, answers.recipient)) {
    score += 3;
    reasons.push(findName(themes.recipients, answers.recipient) + "에게 많이 하는 선물");
  }
  if (hasItem(product.occasions, answers.occasion)) {
    score += 3;
    reasons.push(findName(themes.occasions, answers.occasion) + "에 어울림");
  }
  if (answers.taste !== "any" && hasItem(product.tastes, answers.taste)) {
    score += 2;
    reasons.push(findName(themes.tastes, answers.taste) + " 스타일");
  }
  return { score: score, reasons: reasons };
}

// 이름이 같은 사람에게 선물함에서 보낸 상품 id 목록
function getSentIds(name) {
  const ids = [];
  if (name === null) {
    return ids;
  }
  const giftbox = getList("goreuda_giftbox");
  for (let i = 0; i < giftbox.length; i++) {
    if (giftbox[i].name === name) {
      for (let j = 0; j < giftbox[i].items.length; j++) {
        ids.push(giftbox[i].items[j].id);
      }
    }
  }
  return ids;
}

/* ---------- 결과 보여주기 ---------- */
function showResult() {
  const sentIds = getSentIds(friendName);
  const list = [];

  for (let i = 0; i < allProducts.length; i++) {
    const result = scoreProduct(allProducts[i]);
    // 받는 사람이나 상황 중 하나는 맞아야 추천
    if (result.score >= 3) {
      list.push({ product: allProducts[i], score: result.score, reasons: result.reasons });
    }
  }

  // 점수가 높은 순, 점수가 같으면 인기 순
  list.sort(function (a, b) {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.product.rank - a.product.rank;
  });

  const top = list.slice(0, 8);
  let html = "";
  for (let i = 0; i < top.length; i++) {
    let note = top[i].reasons.join(", ");
    if (hasItem(sentIds, top[i].product.id)) {
      note = "이미 " + friendName + "님에게 보낸 선물이에요";
    }
    html += makeCard(top[i].product, note);
  }
  document.querySelector("#finder-list").innerHTML = html;
  if (top.length === 0) { showElement("#finder-empty"); } else { hideElement("#finder-empty"); }

  // 고른 조건을 배지로 보여줌
  let conditionHtml = "";
  conditionHtml += '<li class="badge">' + findName(themes.recipients, answers.recipient) + '</li>';
  conditionHtml += '<li class="badge">' + findName(themes.occasions, answers.occasion) + '</li>';
  conditionHtml += '<li class="badge">' + findName(themes.budgets, answers.budget) + '</li>';
  conditionHtml += '<li class="badge">' + findName(themes.tastes, answers.taste) + '</li>';
  document.querySelector("#result-conditions").innerHTML = conditionHtml;

  if (friendName !== null) {
    document.querySelector("#result-title").innerText = friendName + "님에게 이런 선물은 어때요?";
  } else {
    document.querySelector("#result-title").innerText = "이런 선물은 어때요?";
  }

  hideElement("#finder-box");
  showElement("#finder-result");
}
