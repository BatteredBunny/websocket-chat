var connection = new WebSocket("ws://localhost:8080");
const button = document.querySelector("#send");

connection.onclose = (event) => {
    console.log("WebSocket is closed now.", event);
    Swal.fire("You seem to have gotten disconnected.");
    connection = new WebSocket("ws://localhost:8080");
};
connection.onerror = (event) => {
    console.error("WebSocket error observed:", event);
};
connection.onmessage = (event) => {
  const chat = document.querySelector("#chat");
  var data = JSON.parse(event.data)
  if (data[4] == true) {
    chat.innerHTML += "<div class='discord message'><img width='25' height='25' class='discord-logo' src='./public/discord.webp'><div class='id'>" + data[3] + "</div><h2 class='name'>" + data[0] + "</h2><div class='time'>" + data[2] + "</div><div class='content'>" + data[1] + "</div></div>";
  } else {
    chat.innerHTML += "<div class='message'><div class='id'>" + data[3] + "</div><h2 class='name'>" + data[0] + "</h2><div class='time'>" + data[2] + "</div><div class='content'>" + data[1] + "</div></div>";
  }
};

function sendData() {
  const name = document.querySelector("#name");
  const content = document.querySelector("#message");

  if (name.value != "" && content.value != "" && name.value.length <= 50 && content.value.length <= 2000) {
    var data = JSON.stringify([name.value, message.value]);
    connection.send(data);
  
    content.value = "";
  };
};

addEventListener("keyup", function(event) {
  if (event.key == "Enter") {
    event.preventDefault();
    sendData()
  };
});