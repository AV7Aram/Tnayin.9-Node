fetch('http://localhost:3000/api/users', {
    method: "POST",
    headers: { "content-type": 'application/json' },
    body: JSON.stringify({
        id : Date.now(),
        name: "Arman",
        email: "Arman@gmail.com"
    })
}).then((res) => res.json()).then((res) => console.log(res))