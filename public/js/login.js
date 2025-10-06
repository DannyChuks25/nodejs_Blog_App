document.getElementById("loginForm").addEventListener("submit", async (e) => {
    const email = e.target.email.value;
    const password = e.target.password.value;

    const response = await fetch("http://localhost:3000/api/blog/login", {
        method: "POST",
        body: JSON.stringify({email, password}),
        headers: {"Content-Type": "application/json"}
    })
    const data = await response.json();
    console.log(data);
})