"use strict";

const account1 = {
  owner: "buba",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  pin: 1234,
};

const account2 = {
  owner: "csay",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  pin: 4321,
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const form = document.querySelector(".login");
const containerBal = document.querySelector(".balance");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

const guide = document.querySelector(".guide");

containerApp.style.opacity = 0;
containerBal.style.opacity = 0;
// My Functions

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = "";

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__value">${mov}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance}€`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  const out = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner.toLowerCase();
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  displayMovements(acc.movements);

  calcDisplayBalance(acc);

  calcDisplaySummary(acc);
};

// Event handlers
let currentAccount, timer;

let starttime = function () {
  let time = 180;

  let evsec = function () {
    if (time == 0) {
      clearInterval(timer);

      labelWelcome.textContent = "Log in to get started";
      containerApp.style.opacity = 0;
      containerBal.style.opacity = 0;
    }

    let mmstr = String(Math.trunc(time / 60));

    let mm = mmstr.padStart(2, 0);

    let secstr = String(Math.trunc(time % 60));

    let sec = secstr.padStart(2, 0);

    let output = mm + ":" + sec;

    labelTimer.textContent = output;

    time = time - 1;
  };

  timer = setInterval(evsec, 1000);
};

let date = new Date();

let m = String(date.getMonth() + 1).padStart(2, 0);
let y = String(date.getFullYear());
let d = String(date.getDate()).padStart(2, 0);

let outputdate = "Today : " + d + "/" + m + "/" + y;

labelDate.textContent = outputdate;

btnLogin.addEventListener("click", function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner}`;

    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    guide.style.display = "none";

    containerApp.style.display = "";

    containerBal.style.opacity = 100;
    containerApp.style.opacity = 100;
    form.style.opacity = 0;

    starttime();

    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = "";

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    clearInterval(timer);

    starttime();

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    currentAccount.movements.push(amount);

    inputLoanAmount.value = "";

    clearInterval(timer);

    starttime();
    // Update UI
    updateUI(currentAccount);
  }
});

btnClose.addEventListener("click", function (e) {
  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );
    console.log(index);

    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
    containerBal.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = "";
  clearInterval(timer);
});

let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});
