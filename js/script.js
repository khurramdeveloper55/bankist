"use strict";
//////////// BANKIST APP /////////////

// DATA
const account1 = {
  owner: "Khurram Shehzad",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // IN PERCENTS
  pin: 1111,

  movementsDates: [
    "2022-11-18T21:31:17.178Z",
    "2022-12-23T07:42:02.383Z",
    "2023-01-28T09:15:04.904Z",
    "2023-04-01T10:17:24.185Z",
    "2023-09-18T14:11:59.604Z",
    "2023-09-25T17:01:17.194Z",
    "2023-09-25T23:36:17.929Z",
    "2023-09-27T10:51:36.790Z",
  ],
  currency: "PKR",
  locale: "ur-PK",
};

const account2 = {
  owner: "Umair Shehzad",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5, // IN PERCENTS
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-24T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

// ELEMENTS
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");
const toolTip = document.querySelector(".tools");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");
const btnHelpWelcome = document.querySelector(".help-welcome");
const btnHelpTransfer = document.querySelector(".help-transfer");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

////////// FUNCTIONS //////////

// MOVEMENTS DATE FORMAT
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));
  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  return new Intl.DateTimeFormat(locale).format(date);
};

// CURRENCY FORMAT
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

// MOVEMENTS
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = "";

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  movs.forEach(function (mov, i) {
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const type = mov > 0 ? "deposit" : "withdrawal";
    const html = `
        <div class="movements__row">
            <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
            <div class="movements__value">${formattedMov}</div>
        </div>
        `;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

//////////////////////// USERNAMES ///////////////////////
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};
createUsernames(accounts);

/////////////////////// BALANCE ////////////////////
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

/////////////////////// SUMMARY /////////////////////
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);
  const out = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);
  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => deposit * (1.2 / 100))
    .filter((int) => int > 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const updateUI = function (acc) {
  displayMovements(acc);
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
};

///////////////////// LOGOUT FUNCTIONALITY ///////////////////////
const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = "Click help to get started";
      containerApp.style.opacity = 0;
    }
    time--;
  };
  let time = 300;
  const timer = setInterval(tick, 1000);
  return timer;
};

let currentAccount, timer;

//////////////////////// LOGIN BUTTON //////////////////////
btnLogin.addEventListener("click", function (e) {
  e.preventDefault();
  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );
  if (currentAccount?.pin === +inputLoginPin.value) {
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 100;

    const now = new Date();
    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    };
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();
    timer = clearInterval(timer);
    timer = startLogOutTimer();
    updateUI(currentAccount);
  }
});

/////////////////////// TRANSFER BUTTON /////////////////////////
btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
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
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

////////////////////////// LOAN BUTTON /////////////////////////
btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = +inputLoanAmount.value;
  inputLoanAmount.value = "";
  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov > amount * 0.1)
  ) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      clearInterval(timer);
      timer = startLogOutTimer();
      updateUI(currentAccount);
    }, 2500);
  }
});

///////////////////////// CLOSE BUTTON //////////////////////////
btnClose.addEventListener("click", function (e) {
  e.preventDefault();
  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === +inputClosePin.value
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === inputCloseUsername.value
    );
    accounts.splice(index, 1);
    labelWelcome.textContent = "Click help to get started";
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = "";
});

////////////////////////// SORTING ///////////////////////
let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount, sorted);
  sorted = !sorted;
});

//////////////////// WELCOME HELP ICON ///////////////////////////////
btnHelpWelcome.addEventListener("click", function () {
  alert(
    "Account 1: \nuser = ks    PIN = 1111\nAccount 2:\nuser = us    PIN = 2222"
  );
});

//////////////////////// TOOLTIP /////////////////////////////
btnHelpTransfer.addEventListener("mouseenter", function () {
  toolTip.style.opacity = 100;
});
btnHelpTransfer.addEventListener("mouseleave", function () {
  toolTip.style.opacity = 0;
});
