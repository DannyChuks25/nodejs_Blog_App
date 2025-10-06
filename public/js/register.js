document.getElementById("registerForm").addEventListener("submit", async (e) => {
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    const response = await fetch("http://localhost:3000/api/blog/register", {
        method: "POST",
        body: JSON.stringify({name, email, password}),
        headers: {"Content-Type": "application/json"}
    })
    const data = await response.json();
    console.log(data);
    alert(data.message);
})
