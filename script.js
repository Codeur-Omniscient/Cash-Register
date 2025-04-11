// Initial values - using let so they can be reassigned for testing
let price = 19.5;
let cid = [
  ["PENNY", 1.01],
  ["NICKEL", 2.05],
  ["DIME", 3.1],
  ["QUARTER", 4.25],
  ["ONE", 90],
  ["FIVE", 55],
  ["TEN", 20],
  ["TWENTY", 60],
  ["ONE HUNDRED", 100],
];

// Currency values in dollars
const currencyValues = {
  PENNY: 0.01,
  NICKEL: 0.05,
  DIME: 0.1,
  QUARTER: 0.25,
  ONE: 1,
  FIVE: 5,
  TEN: 10,
  TWENTY: 20,
  "ONE HUNDRED": 100,
};

// DOM Elements
const cashInput = document.getElementById("cash");
const purchaseBtn = document.getElementById("purchase-btn");
const changeDueEl = document.getElementById("change-due");
const priceDisplay = document.getElementById("price-display");
const drawerDisplay = document.getElementById("drawer-display");

// Display current price
priceDisplay.textContent = `$${price.toFixed(2)}`;

// Display cash drawer contents
function displayCashDrawer() {
  drawerDisplay.innerHTML = "";

  cid.forEach(([currency, amount]) => {
    const currencyItem = document.createElement("div");
    currencyItem.className = "currency-item";

    currencyItem.innerHTML = `
      <div class="currency-name">${currency}</div>
      <div class="currency-amount">$${amount.toFixed(2)}</div>
    `;

    drawerDisplay.appendChild(currencyItem);
  });
}

// Calculate change function
function calculateChange(price, cash, cid) {
  let changeDue = cash - price;

  if (changeDue < 0) return { status: "INSUFFICIENT_PAYMENT" };
  if (changeDue === 0) return { status: "EXACT_CASH" };

  const totalCid = calculateTotalCid(cid);
  changeDue = roundToTwo(changeDue);

  if (changeDue === totalCid) return { status: "CLOSED", change: cid };
  if (changeDue > totalCid) return { status: "INSUFFICIENT_FUNDS" };

  const sortedCurrency = getSortedCurrency();
  const register = createRegister(cid);
  const changeArray = calculateChangeArray(changeDue, sortedCurrency, register);

  if (changeArray.changeDue > 0) return { status: "INSUFFICIENT_FUNDS" };

  return { status: "OPEN", change: changeArray.change };
}

function calculateTotalCid(cid) {
  return cid.reduce((acc, [_, amount]) => acc + amount, 0);
}

function roundToTwo(num) {
  return Math.round(num * 100) / 100;
}

function getSortedCurrency() {
  return [
    ["ONE HUNDRED", 100],
    ["TWENTY", 20],
    ["TEN", 10],
    ["FIVE", 5],
    ["ONE", 1],
    ["QUARTER", 0.25],
    ["DIME", 0.1],
    ["NICKEL", 0.05],
    ["PENNY", 0.01],
  ];
}

function createRegister(cid) {
  const register = {};
  cid.forEach(([currency, amount]) => {
    register[currency] = amount;
  });
  return register;
}

function calculateChangeArray(changeDue, sortedCurrency, register) {
  const changeArray = [];

  for (const [currency, unit] of sortedCurrency) {
    let currencyAmount = register[currency];
    let currencyCount = 0;

    while (changeDue >= unit && currencyAmount >= unit) {
      changeDue = roundToTwo(changeDue - unit);
      currencyAmount = roundToTwo(currencyAmount - unit);
      currencyCount = roundToTwo(currencyCount + unit);
    }

    if (currencyCount > 0) {
      changeArray.push([currency, currencyCount]);
    }
  }

  return { change: changeArray, changeDue };
}

// Format change for display
function formatChange(changeResult) {
  if (changeResult.status === "INSUFFICIENT_PAYMENT") {
    return "Customer does not have enough money to purchase the item";
  }

  if (changeResult.status === "EXACT_CASH") {
    return "No change due - customer paid with exact cash";
  }

  if (changeResult.status === "INSUFFICIENT_FUNDS") {
    return "Status: INSUFFICIENT_FUNDS";
  }

  if (changeResult.status === "CLOSED") {
    const formattedChange = changeResult.change
      .filter(([_, amount]) => amount > 0)
      .map(([currency, amount]) => `${currency}: $${amount.toFixed(2)}`)
      .join(" ");

    return `Status: CLOSED ${formattedChange}`;
  }

  // For OPEN status
  const formattedChange = changeResult.change
    .map(([currency, amount]) => `${currency}: $${amount.toFixed(2)}`)
    .join(" ");

  return `Status: OPEN ${formattedChange}`;
}

// Handle purchase button click
purchaseBtn.addEventListener("click", function () {
  const cashValue = parseFloat(cashInput.value);

  // Validate input
  if (isNaN(cashValue)) {
    alert("Please enter a valid cash amount");
    return;
  }

  // Calculate change
  const changeResult = calculateChange(
    price,
    cashValue,
    JSON.parse(JSON.stringify(cid))
  );

  // If customer doesn't have enough money
  if (changeResult.status === "INSUFFICIENT_PAYMENT") {
    alert("Customer does not have enough money to purchase the item");
    return;
  }

  // Display change result
  const formattedChange = formatChange(changeResult);
  changeDueEl.textContent = formattedChange;

  // Update the status color
  const changeContainer = changeDueEl.parentElement;
  changeContainer.classList.remove(
    "status-open",
    "status-closed",
    "status-insufficient"
  );

  if (changeResult.status === "OPEN") {
    changeContainer.classList.add("status-open");
  } else if (changeResult.status === "CLOSED") {
    changeContainer.classList.add("status-closed");
  } else if (changeResult.status === "INSUFFICIENT_FUNDS") {
    changeContainer.classList.add("status-insufficient");
  }
});

// Initialize the display
displayCashDrawer();
