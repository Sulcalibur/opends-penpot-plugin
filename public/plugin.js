penpot.ui.open("OpenDS Sync", "/index.html", {
  width: 420,
  height: 540
});

penpot.ui.onMessage(function(message) {
  console.log("[OpenDS Plugin] Received:", message.type);
  
  if (message.type === "connection-success" && message.config) {
    penpot.localStorage.setItem("opends_config", JSON.stringify(message.config));
    console.log("[OpenDS Plugin] Config saved");
  }
});

penpot.on("themechange", function(theme) {
  penpot.ui.sendMessage({ source: "penpot", type: "themechange", theme });
});

console.log("[OpenDS Plugin] Loaded");
