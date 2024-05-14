import * as path from "path";
import fs from "fs";
import express from "express";
import https from "https";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const rootDir = process.cwd();
const port = 3000;
const app = express();

let usernameDb = null;

app.use(express.static('spa/build'));

app.use(express.json());
app.use(cookieParser());

app.get("/client.mjs", (_, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.sendFile(path.join(rootDir, "client.mjs"), {
        maxAge: -1,
        cacheControl: false,
    });
});

app.get("/api/users/me", (_, res) => {
    res.send(JSON.stringify({
        username: usernameDb,
    }));
});

app.post("/api/users/login", (req, res) => {
    usernameDb = req.body.username;
    res.ok;
});

app.post("/api/users/logout", (_, res) => {
    usernameDb = null;
    res.ok;
});

app.get("/*", (_, res) => {
    const filePath = path.resolve(rootDir, "spa/build/index.html");
    res.sendFile(filePath);
});

app.get("/api/about", async (_, res) => {
    fetch('https://api.spacexdata.com/v3/info')
        .then(response => response.json())
        .then(data => res.send(data))
        .catch(error => console.log(error));
});

app.get("/api/history", async (_, res) => {
    fetch('https://api.spacexdata.com/v3/history')
        .then(response => response.json())
        .then(data => res.send(data))
        .catch(error => console.log(error));
});

app.get("/api/rockets", async (_, res) => {
    fetch('https://api.spacexdata.com/v3/rockets')
        .then(response => response.json())
        .then(data => res.send(data))
        .catch(error => console.log(error));
});

app.get("/api/roadster", async (_, res) => {
    fetch('https://api.spacexdata.com/v3/roadster')
        .then(response => response.json())
        .then(data => res.send(data))
        .catch(error => console.log(error));
});

https
    .createServer(
        {
          key: fs.readFileSync('certs/server.key'),
          cert: fs.readFileSync('certs/server.cert')
        },
        app
    )
    .listen(port, () => {
    console.log(`App listening on port ${port}`);
});
