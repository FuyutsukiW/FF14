let currentQuestion = null;
let currentRole = null;
let currentStep = 1; // Quiz 1
window.wasCorrect = null;


function showFeedback(message) {
  const box = document.getElementById("feedback-box");
  const text = document.getElementById("feedback-text");
  text.textContent = message;
  box.classList.remove("hidden");
}

function closeFeedback() {
  document.getElementById("feedback-box").classList.add("hidden");

  if (currentStep === 1) {
    if (window.wasCorrect) {
      // ✅ Only continue if the answer was correct
      const line = document.getElementById("tether-svg-line");
      line.setAttribute("x1", 0);
      line.setAttribute("y1", 0);
      line.setAttribute("x2", 0);
      line.setAttribute("y2", 0);

      movePlayerToCorrectIsland(); // Move player
      startSecondQuiz();          // Then show Quiz 2
    } else {
      goBackToRoleSelect();       // ❌ Wrong answer → back to role select
    }
  } else if (currentStep === 2) {
    if (window.wasCorrect) {
      currentStep = 3;
      showMechanic3And4();       // ✅ Now it will be called properly
    } else {
      goBackToRoleSelect();      // ❌ Wrong answer → reset
    }
  } else {
    goBackToRoleSelect();        // Any other step → reset
  }
}








function movePlayerToCorrectIsland() {
  // Remove all player icons first
  document.querySelectorAll(".player-icon").forEach(icon => icon.style.display = "none");

  // Map island name to player icon ID
  const iconMap = {
    "Island1": "player-on-1",
    "Island2": "player-on-2",
    "Island3": "player-on-3",
    "Island4": "player-on-4",
    "Island5": "player-on-5"
  };

  const iconId = iconMap[currentQuestion.correct];
  const playerIcon = document.getElementById(iconId);

  // Reuse the role's color
  let color = "#ccc";
  if (currentRole === "Tank") color = "#007bff";
  if (currentRole === "Healer") color = "#28a745";
  if (currentRole === "DPS") color = "#dc3545";

  playerIcon.style.backgroundColor = color;
  playerIcon.style.display = "block";
}

function startSecondQuiz() {
  currentStep = 2; // now we're in quiz 2
  // Clear all tower letters
  document.querySelectorAll(".island").forEach(div => {
    div.querySelector(".tower-text")?.remove();
  });

  // Always fixed
  addTower("island1", 3);
  addTower("island2", 1);
  addTower("island5", 1);

  const isLeft = Math.random() < 0.5;
  addTower("island3", isLeft ? 2 : 1);
  addTower("island4", isLeft ? 1 : 2);

  // Random text
  const questionText = document.getElementById("question-text");
  questionText.textContent = isLeft
    ? "Two towers appear on Upper Left (Island 3). Where will you go?"
    : "Two towers appear on Upper Right (Island 4). Where will you go?";
}


function addTower(islandId, count) {
  const island = document.getElementById(islandId);
  const towerText = document.createElement("div");
  towerText.className = "tower-text";
  towerText.textContent = "I".repeat(count);
  towerText.style.marginTop = "5px";
  towerText.style.fontSize = "24px";
  island.appendChild(towerText);
}

const stage1Questions = [
  { id: 1, role: "DPS", color: "Green", target: "Healer", correct: "Island1", text: "DPS + Green tether → to Healer" },
  { id: 2, role: "DPS", color: "Green", target: "Tank", correct: "Island4", text: "DPS + Green tether → to Tank" },
  { id: 3, role: "DPS", color: "Blue", target: "Healer", correct: "Island4", text: "DPS + Blue tether → to Healer" },
  { id: 4, role: "DPS", color: "Blue", target: "Tank", correct: "Island5", text: "DPS + Blue tether → to Tank" },
  { id: 5, role: "Tank", color: "Blue", target: "DPS", correct: "Island2", text: "Tank + Blue tether → to DPS" },
  { id: 6, role: "Tank", color: "Green", target: "DPS", correct: "Island4", text: "Tank + Green tether → to DPS" },
  { id: 7, role: "Healer", color: "Blue", target: "DPS", correct: "Island1", text: "Healer + Blue tether → to DPS" },
  { id: 8, role: "Healer", color: "Green", target: "DPS", correct: "Island1", text: "Healer + Green tether → to DPS" }
];

function drawTether(fromIslandId, toIslandId, color) {
  const from = document.getElementById(fromIslandId).getBoundingClientRect();
  const to = document.getElementById(toIslandId).getBoundingClientRect();
  const svg = document.getElementById("tether-line");
  const svgRect = svg.getBoundingClientRect();

  const x1 = from.left + from.width / 2 - svgRect.left;
  const y1 = from.top + from.height / 2 - svgRect.top;
  const x2 = to.left + to.width / 2 - svgRect.left;
  const y2 = to.top + to.height / 2 - svgRect.top;

  const line = document.getElementById("tether-svg-line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("stroke", color);
}

function selectRole(role) {
  // 🧹 Reset zones and layout
  document.querySelectorAll(".zone").forEach(el => el.remove());
  document.querySelectorAll(".island").forEach(el => {
    el.classList.remove("zone-mode");
    el.style.position = "absolute"; // restore island positioning
  });

  currentStep = 1; // Reset quiz step here
  window.wasCorrect = null;

  currentRole = role;
  document.getElementById("role-select").style.display = "none";
  document.getElementById("island-map").style.display = "block";

  // Hide all player icons
  document.querySelectorAll(".player-icon").forEach(icon => icon.style.display = "none");

  // Show player at their starting island
  let islandId = "";
  let color = "";

  if (role === "Tank") {
    islandId = "player-on-3";
    color = "#007bff";
  } else if (role === "Healer") {
    islandId = "player-on-1";
    color = "#28a745";
  } else if (role === "DPS") {
    islandId = "player-on-5";
    color = "#dc3545";
  }

  const playerIcon = document.getElementById(islandId);
  playerIcon.style.backgroundColor = color;
  playerIcon.style.display = "block";

  // Random question based on role
  const available = stage1Questions.filter(q => q.role === role);
  const chosen = available[Math.floor(Math.random() * available.length)];
  currentQuestion = chosen;

  document.getElementById("question-text").textContent = chosen.text;

  let fromId = "", toId = "";
  if (chosen.role === "Tank") fromId = "island3";
  if (chosen.role === "Healer") fromId = "island1";
  if (chosen.role === "DPS") fromId = "island5";

  if (chosen.target === "Tank") toId = "island3";
  if (chosen.target === "Healer") toId = "island1";
  if (chosen.target === "DPS") toId = "island5";

  drawTether(fromId, toId, chosen.color.toLowerCase());
}

function goBackToRoleSelect() {
  currentStep = 1; // Reset quiz step
  currentQuestion = null;
  window.wasCorrect = null;

  document.getElementById("island-map").style.display = "none";
  document.getElementById("role-select").style.display = "block";
  document.getElementById("question-text").textContent = "";

  // 🧹 Remove visual leftovers
  document.querySelectorAll(".player-icon").forEach(icon => icon.style.display = "none");
  document.querySelectorAll(".tower-text").forEach(el => el.remove());
  document.querySelectorAll(".spear-icon").forEach(el => el.remove());
  document.querySelectorAll('.island').forEach(el => {
    el.classList.remove("zone-mode");
    // ✅ Remove zone overlays
    document.querySelectorAll(".zone").forEach(el => el.remove());
  });
  // 🧹 Hide sword and reset its position
  const sword = document.getElementById("boss-sword");
  sword.classList.add("hidden");
  sword.style.left = "180px";
  sword.style.top = "140px";
  sword.style.transform = "none";

  // 🧹 Clear mechanic-indicator message
  document.getElementById("mechanic-indicator").textContent = "";

  // 🧹 Clear tether
  const line = document.getElementById("tether-svg-line");
  line.setAttribute("x1", 0);
  line.setAttribute("y1", 0);
  line.setAttribute("x2", 0);
  line.setAttribute("y2", 0);
}

function showMechanic3And4() {
  // ✅ Clear towers and previous question
  document.querySelectorAll(".tower-text").forEach(el => el.remove());
  document.getElementById("question-text").textContent = "";
  document.querySelectorAll(".zone").forEach(el => el.remove());

  // ✅ Clear previous spears
  document.querySelectorAll(".spear-icon").forEach(el => el.remove());

  // ✅ Show boss sword and position it
  const sword = document.getElementById("boss-sword");
  sword.classList.remove("hidden");
  sword.style.top = "140px";
  sword.style.left = "180px";

  const bossSwordSide = Math.random() < 0.5 ? "East" : "West";
  const spearDirection = Math.random() < 0.5 ? "inward" : "outward";

  window.bossSwordSide = bossSwordSide;
  window.spearDirection = spearDirection;

  if (bossSwordSide === "West") {
    sword.style.left = "120px";
    sword.style.transform = "rotate(-30deg)";
  } else {
    sword.style.left = "240px";
    sword.style.transform = "rotate(30deg)";
  }

  const indicator = document.getElementById("mechanic-indicator");
  indicator.textContent = `⚔️ Boss raises sword on the ${bossSwordSide}! Spears face ${spearDirection}.`;

  const directionMap = {
    "Island1": { inward: "⬆️", outward: "⬇️" },
    "Island2": { inward: "↗️", outward: "↙️" },
    "Island3": { inward: "↘️", outward: "↖️" },
    "Island4": { inward: "↙️", outward: "↗️" },
    "Island5": { inward: "↖️", outward: "↘️" }
  };

  Object.keys(directionMap).forEach(islandId => {
    const island = document.getElementById(islandId.toLowerCase());
    const spear = document.createElement("div");
    spear.className = "spear-icon";
    spear.textContent = directionMap[islandId][spearDirection];
    island.appendChild(spear);
  });
  document.querySelectorAll('.island').forEach(el => {
    el.classList.add("zone-mode");
  });
  // ✅ Add island zone divisions (only needed for mechanic 3&4)
  const zones = {
    island1: ["upperLeft", "upperRight", "lowerLeft", "lowerRight"],
    island2: ["left", "right"],
    island3: ["upperLeft", "lowerRight"],
    island4: ["upperRight", "lowerLeft"],
    island5: ["left", "right"]
  };

  Object.entries(zones).forEach(([islandId, parts]) => {
    const island = document.getElementById(islandId);
    parts.forEach(part => {
      const zone = document.createElement("div");
      zone.className = "zone";
      zone.dataset.id = `${islandId}-${part}`;

      // 🔍 DEBUG STYLES FOR VISIBILITY
      zone.style.position = "absolute";
      zone.style.pointerEvents = "auto";
      zone.style.border = "2px dashed red";
      zone.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
      zone.style.boxSizing = "border-box"; // Prevent overflow padding weirdness
      zone.style.zIndex = "10"; // Ensure it's on top

      // 🧩 Optional: adjust placement by part
      if (part === "upperLeft") {
        zone.style.top = "0%";
        zone.style.left = "0%";
        zone.style.width = "50%";
        zone.style.height = "50%";
      } else if (part === "upperRight") {
        zone.style.top = "0%";
        zone.style.left = "50%";
        zone.style.width = "50%";
        zone.style.height = "50%";
      } else if (part === "lowerLeft") {
        zone.style.top = "50%";
        zone.style.left = "0%";
        zone.style.width = "50%";
        zone.style.height = "50%";
      } else if (part === "lowerRight") {
        zone.style.top = "50%";
        zone.style.left = "50%";
        zone.style.width = "50%";
        zone.style.height = "50%";
      } else if (part === "left") {
        zone.style.top = "0%";
        zone.style.left = "0%";
        zone.style.width = "50%";
        zone.style.height = "100%";
      } else if (part === "right") {
        zone.style.top = "0%";
        zone.style.left = "50%";
        zone.style.width = "50%";
        zone.style.height = "100%";
      }

      island.style.position = "relative"; // make sure parent is positioned
      island.style.overflow = "hidden";
      island.appendChild(zone);
    });
  });

}

function getSafeZones(bossSwordSide, spearDirection) {
  const safeMap = {
    West: {
      inward: [
        "island4-upperRight", 
        "island5-right", 
        "island1-lowerRight"
      ],
      outward: [
        "island4-lowerLeft", 
        "island5-left", 
        "island1-upperRight"
      ]
    },
    East: {
      inward: [
        "island3-upperLeft", 
        "island2-left", 
        "island1-lowerLeft"
      ],
      outward: [
        "island3-lowerRight", 
        "island2-right", 
        "island1-upperLeft"
      ]
    }
  };

  return safeMap[bossSwordSide][spearDirection];
}



// Setup
window.onload = () => {
  document.getElementById("feedback-ok").addEventListener("click", closeFeedback);

  document.querySelectorAll(".island").forEach(div => {
    div.addEventListener("click", () => {
      if (!currentQuestion) return;
      const selected = div.id;

      if (currentStep === 1) {
        // Quiz 1 check
        if (selected.toLowerCase() === currentQuestion.correct.toLowerCase()) {
          window.wasCorrect = true;
          showFeedback("✅ Correct!");
        } else {
          window.wasCorrect = false;
          showFeedback(`❌ Wrong! Correct answer is: ${currentQuestion.correct}`);
        }
      }
 else if (currentStep === 2) {
        // Quiz 2 logic
        const isLeft = document.getElementById("island3").textContent.includes("II"); // true if Island3 has 2 towers
        const twoTowerIsland = isLeft ? "Island3" : "Island4";
        const oneTowerIsland = isLeft ? "Island4" : "Island3";

        const { role, color, target, correct } = currentQuestion;
        let expectedIsland = correct; // default fallback

        if (
          (role === "Tank" && color === "Green" && target === "DPS") ||
          (role === "DPS" && color === "Green" && target === "Tank")
        ) {
          expectedIsland = twoTowerIsland;
        } else if (role === "DPS" && color === "Blue" && target === "Healer") {
          expectedIsland = oneTowerIsland;
        } else {
          expectedIsland = correct;
        }

   if (selected.toLowerCase().trim() === expectedIsland.toLowerCase().trim()) {
     window.wasCorrect = true;
     showFeedback("✅ Correct!");
   } else {
     window.wasCorrect = false;
     showFeedback(`❌ Wrong! Correct answer is: ${expectedIsland}`);
   }


      }
    });
  });
  
   // 🔥 Mechanic 3 & 4 zone interaction
   document.addEventListener("click", (e) => {
     if (currentStep !== 3) return;
     const zone = e.target.closest(".zone");
     if (!zone) return;

     const selectedZoneId = zone.dataset.id;
     const safeZones = getSafeZones(window.bossSwordSide, window.spearDirection);

     if (safeZones.includes(selectedZoneId)) {
       window.wasCorrect = true;
       showFeedback("✅ Correct safe zone!");
     } else {
       window.wasCorrect = false;
       showFeedback(`❌ Wrong! Safe zones were: ${safeZones.join(", ")}`);
     }
   });

};
