    const socket = io.connect("http://127.0.0.1:5000"); 

    let currentChatUser = null;
    let loggedInUserId = null;

    async function register(username, password) {
        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const result = await response.json();
            if (response.ok) {
                alert("Registration successful!");
            } else {
                alert(result.error || "Registration failed.");
            }
        } catch (error) {
            console.error("Registration error:", error);
        }
    }

    async function login(username, password) {
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const result = await response.json();
            if (response.ok) {
                loggedInUserId = result.user_id;
                alert("Login successful!");
                loadSidebarUsers();
            } else {
                alert(result.error || "Login failed.");
            }
        } catch (error) {
            console.error("Login error:", error);
        }
    }

    async function loadSidebarUsers() {
        const sidebar = document.querySelector(".sidebar");
        sidebar.innerHTML = "<h2>People</h2>";

        // Dynamically fetch and list users (mocked for now)
        const users = [{ id: 1, name: "Alpha" }, { id: 2, name: "Beta" }, { id: 3, name: "Gamma" }];
        users.forEach(user => {
            const userDiv = document.createElement("div");
            userDiv.className = "user";
            userDiv.onclick = () => startChat(user.id, user.name);
            userDiv.innerHTML = `
                <img src="https://via.placeholder.com/40" alt="User">
                <span>${user.name}</span>
            `;
            sidebar.appendChild(userDiv);
        });
    }

    async function startChat(userId, userName) {
        currentChatUser = userId;
        document.getElementById("chat-with").innerText = `Chat with ${userName}`;

        const messagesContainer = document.getElementById("chat-messages");
        messagesContainer.innerHTML = "";

        try {
            const response = await fetch(`/messages/${userId}?user_id=${loggedInUserId}`);
            const messages = await response.json();
            messages.forEach(msg => {
                const messageDiv = document.createElement("div");
                messageDiv.className = `message ${msg.sender_id === loggedInUserId ? "sent" : "received"}`;
                messageDiv.innerText = msg.content;
                messagesContainer.appendChild(messageDiv);
            });
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    }

    function sendMessage() {
        const input = document.getElementById("chat-input");
        const content = input.value;
        if (!content || !currentChatUser || !loggedInUserId) return;

        // Display the message in the chat window
        const messagesContainer = document.getElementById("chat-messages");
        const userMessageDiv = document.createElement("div");
        userMessageDiv.className = "message sent";
        userMessageDiv.innerText = content;
        messagesContainer.appendChild(userMessageDiv);

        // Send the message to the server via WebSocket
        socket.emit("message", {
            sender_id: loggedInUserId,
            receiver_id: currentChatUser,
            content,
        });

        input.value = "";
    }

    // Listen for incoming messages
    socket.on("message", data => {
        if (data.receiver_id === loggedInUserId || data.sender_id === loggedInUserId) {
            const messagesContainer = document.getElementById("chat-messages");
            const messageDiv = document.createElement("div");
            messageDiv.className = "message received";
            messageDiv.innerText = data.content;
            messagesContainer.appendChild(messageDiv);
        }
    });

    // Mock login to test functionality
    document.addEventListener("DOMContentLoaded", () => {
        const username = prompt("Enter your username:");
        const password = prompt("Enter your password:");
        login(username, password);
    });
