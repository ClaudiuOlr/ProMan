const closeAlertBtn = document.querySelector(".alert .close");
const flashAlert = document.querySelector(".alert");
const goBackButtons = document.querySelectorAll(".go-back-btn");

if (closeAlertBtn !== null) {
    closeAlertBtn.addEventListener("click", () => {
        flashAlert.classList.toggle("hide");
    });
}

goBackButtons.forEach((button) => {
    button.addEventListener("click", () => {
        window.location.href = "../";
    });
});
