var fs = require("fs");
var c = fs.readFileSync("app/admin/users/page.tsx", "utf8");

// Find and replace the loadUsers function
var old = "const loadUsers = () => {\n    fetch('/api/admin/users?t=' + Date.now()).then(r => r.json()).then(d => setUsers(d.users || [])).catch(() => {});";
var rep = "const loadUsers = async () => {\n    const token = await getAuthToken();\n    if (!token) return;\n    fetch('/api/admin/users?t=' + Date.now(), { headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.json()).then(d => setUsers(d.users || [])).catch(() => {});";

if (c.includes(old)) {
  c = c.replace(old, rep);
  fs.writeFileSync("app/admin/users/page.tsx", c);
  console.log("Fixed loadUsers - added auth token");
} else {
  console.log("Could not find loadUsers pattern. Current content around line 45:");
  var lines = c.split("\n");
  for (var i = 43; i < 50 && i < lines.length; i++) {
    console.log((i+1) + ": " + lines[i]);
  }
}
