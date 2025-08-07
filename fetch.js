fetch('http://localhost:3000/api/users', {
    method: "POST",
    headers: { "content-type": 'application/json' },
    body: JSON.stringify({
        id: Date.now(),
        name: "Arman",
        email: "Arman@gmail.com"
    })
}).then((res) => res.json()).then((res) => console.log(res))

fetch('http://localhost:3000/api/users/1', {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "aram_vardanyan@gmail.com" })
}).then(res => res.json()).then(data => console.log("Updated user:", data))

fetch('http://localhost:3000/api/users/1', {
    method: "DELETE"
}).then(res => res.json()).then(data => console.log("Result:", data))