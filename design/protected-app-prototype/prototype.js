const params = new URLSearchParams(window.location.search);
const state = params.get("state") || "default";
const plus = params.get("plus") || "eligible";

if (params.get("motion") === "reduce") {
  document.documentElement.classList.add("force-reduced-motion");
}

for (const panel of document.querySelectorAll("[data-state-panel]")) {
  panel.hidden = panel.dataset.statePanel !== state;
}

for (const prompt of document.querySelectorAll("[data-plus-state]")) {
  prompt.hidden = plus === "paid" || prompt.dataset.plusState !== plus;
}

const account = document.querySelector(".account");
const accountTrigger = document.querySelector(".account-trigger");
const accountMenu = document.querySelector(".account-menu");

function closeAccountMenu() {
  accountMenu.hidden = true;
  accountTrigger.setAttribute("aria-expanded", "false");
}

accountTrigger.addEventListener("click", () => {
  const nextOpen = accountMenu.hidden;
  accountMenu.hidden = !nextOpen;
  accountTrigger.setAttribute("aria-expanded", String(nextOpen));
  if (nextOpen) accountMenu.querySelector('[role="menuitem"]')?.focus();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !accountMenu.hidden) {
    closeAccountMenu();
    accountTrigger.focus();
  }
});

document.addEventListener("pointerdown", (event) => {
  if (!account.contains(event.target)) closeAccountMenu();
});

if (params.get("focus") === "primary") {
  requestAnimationFrame(() => document.querySelector("[data-primary-action]")?.focus());
}

const prototypeDialog = document.querySelector("#prototype-dialog");
const prototypeSheet = document.querySelector("#prototype-sheet");
const dialogTrigger = document.querySelector("[data-open-dialog]");
const sheetTrigger = document.querySelector("[data-open-sheet]");

dialogTrigger?.addEventListener("click", () => prototypeDialog.showModal());
sheetTrigger?.addEventListener("click", () => prototypeSheet.showModal());

prototypeDialog?.addEventListener("close", () => dialogTrigger?.focus());
prototypeSheet?.addEventListener("close", () => sheetTrigger?.focus());

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  const openDialog = document.querySelector("dialog[open]");
  if (!openDialog) return;

  event.preventDefault();
  openDialog.close();
});
