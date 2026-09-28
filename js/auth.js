import { authApi } from "./api.js";
import {
  showToast,
  wirePasswordToggles,
  setupTheme
} from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
  setupTheme();
  wirePasswordToggles();

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);

    const params = new URLSearchParams(location.search);

    if (params.get("registered") === "1") {
      showToast("Account created. Sign in to continue.");
    }
  }

  if (registerForm) {
    registerForm.addEventListener(
      "submit",
      handleRegister
    );
  }
});

async function handleLogin(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const errorBox = document.getElementById("loginError");

  errorBox.textContent = "";
  errorBox.classList.remove("visible");

  const body = Object.fromEntries(
    new FormData(form)
  );

  if (!body.email || !body.password) {
    return showFormError(
      errorBox,
      "Email and password are required."
    );
  }

  if (!/^\S+@\S+\.\S+$/.test(body.email)) {
    return showFormError(
      errorBox,
      "Enter a valid email address."
    );
  }

  try {
    const submitButton = form.querySelector(
      'button[type="submit"]'
    );

    submitButton.disabled = true;

    await authApi.login(body);

    showToast("Signed in. Welcome back.");

    setTimeout(() => {
      location.href = "index.html";
    }, 450);
  } catch (error) {
    showFormError(
      errorBox,
      getReadableError(error)
    );

    const submitButton = form.querySelector(
      'button[type="submit"]'
    );

    submitButton.disabled = false;
  }
}

async function handleRegister(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const errorBox = document.getElementById(
    "registerError"
  );

  errorBox.textContent = "";
  errorBox.classList.remove("visible");

  const body = Object.fromEntries(
    new FormData(form)
  );

  if (body.name.trim().length < 2) {
    return showFormError(
      errorBox,
      "Name must contain at least 2 characters."
    );
  }

  if (!/^\S+@\S+\.\S+$/.test(body.email)) {
    return showFormError(
      errorBox,
      "Enter a valid email address."
    );
  }

  if (body.password.length < 8) {
    return showFormError(
      errorBox,
      "Password must contain at least 8 characters."
    );
  }

  if (body.password !== body.confirmPassword) {
    return showFormError(
      errorBox,
      "Passwords do not match."
    );
  }

  try {
    const submitButton = form.querySelector(
      'button[type="submit"]'
    );

    submitButton.disabled = true;

    await authApi.register(body);

    /*
     * Registration does not issue JWT tokens.
     * Send the user to login.
     */
    location.href = "login.html?registered=1";
  } catch (error) {
    showFormError(
      errorBox,
      getReadableError(error)
    );

    const submitButton = form.querySelector(
      'button[type="submit"]'
    );

    submitButton.disabled = false;
  }
}

function getReadableError(error) {
  if (error?.errors?.length) {
    return error.errors
      .map((item) => item.message)
      .join(" ");
  }

  return error?.message || "Something went wrong.";
}

function showFormError(element, message) {
  element.textContent = message;
  element.classList.add("visible");
}


/*

import { authApi } from "./api.js";
import { showToast, wirePasswordToggles, setupTheme } from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
  setupTheme();
  wirePasswordToggles();
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) loginForm.addEventListener("submit", handleLogin);
  if (registerForm) registerForm.addEventListener("submit", handleRegister);
});

async function handleLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const errorBox = document.getElementById("loginError");
  errorBox.textContent = "";
  const body = Object.fromEntries(new FormData(form));
  if (!body.email || !body.password)
    return showFormError(errorBox, "Email and password are required.");
  if (!/^\S+@\S+\.\S+$/.test(body.email))
    return showFormError(errorBox, "Enter a valid email address.");
  try {
    await authApi.login(body);
    showToast("Signed in. Welcome back.");
    setTimeout(() => (location.href = "index.html"), 450);
  } catch (error) {
    showFormError(errorBox, error.message);
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const errorBox = document.getElementById("registerError");
  errorBox.textContent = "";
  const body = Object.fromEntries(new FormData(form));
  if (body.name.trim().length < 2)
    return showFormError(errorBox, "Name must contain at least 2 characters.");
  if (!/^\S+@\S+\.\S+$/.test(body.email))
    return showFormError(errorBox, "Enter a valid email address.");
  if (body.password.length < 8)
    return showFormError(
      errorBox,
      "Password must contain at least 8 characters.",
    );
  if (body.password !== body.confirmPassword)
    return showFormError(errorBox, "Passwords do not match.");
  try {
    await authApi.register(body);
    showToast("Account created. You can now continue.");
    setTimeout(() => (location.href = "index.html"), 550);
  } catch (error) {
    showFormError(errorBox, error.message);
  }
}

function showFormError(element, message) {
  element.textContent = message;
  element.classList.add("visible");
}
*/