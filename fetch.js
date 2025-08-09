fetch('http://localhost:3000/api/users', {
    method: "POST",
    headers: { "content-type": 'application/json' },
    body: JSON.stringify({
        id: "6",
        name: "Fiona White",
        age: "29",
        email: "fiona.white@example.com",
        password: "fionaPW"
    })
}).then((res) => res.json()).then((res) => console.log(res))

fetch('http://localhost:3000/api/users/1', {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
        name: "alexandra",
        email: "alexandra.linus@example.com" 
    })
}).then(res => res.json()).then(data => console.log("Updated user:", data))

fetch('http://localhost:3000/api/users/1', {
    method: "DELETE"
}).then(res => res.json()).then(data => console.log("Result:", data))