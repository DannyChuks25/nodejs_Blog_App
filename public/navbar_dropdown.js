

document.addEventListener("DOMContentLoaded", () => {
    const dropdown = document.querySelector(".mobile-nav");
    const icon = document.querySelector("span i.fa-bars");

    icon.addEventListener('click', () => {
        console.log("clicked!");
        icon.classList.toggle("show-border");
        dropdown.classList.toggle("show");
    })

})

