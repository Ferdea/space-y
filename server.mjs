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

app.use(express.static('spa/build'));
app.use(cookieParser());
app.use(express.json());

app.get("/client.mjs", (_, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.sendFile(path.join(rootDir, "client.mjs"), {
        maxAge: -1,
        cacheControl: false,
    });
});

app.get("/api/users/me", (req, res) => {
    let username = req.cookies.username;

    if (username) {
        res.send(JSON.stringify({
            username: username,
        }));
    } else {
        res.send(JSON.stringify({
            username: null,
        }));
    }
});

app.post("/api/users/login", (req, res) => {
    res.cookie("username", req.body.username, {
        maxAge: 3600000000,
        httpOnly: true,
        secure: true,
        sameSite: "strict"
    });

    res.send();
});

app.post("/api/users/logout", (_, res) => {
    res.clearCookie("username");
    res.send();
});

app.get("/api/about", (_, res) => {
    fetch('https://api.spacexdata.com/v3/info')
        .then(response => response.json())
        .then(data => res.send(data))
        .catch(error => console.log(error));
});

app.get("/api/history", (_, res) => {
    fetch('https://api.spacexdata.com/v3/history')
        .then(response => response.json())
        .then(data => res.send(data))
        .catch(error => console.log(error));
});

app.get("/api/rockets", (_, res) => {
    fetch('https://api.spacexdata.com/v3/rockets')
        .then(response => response.json())
        .then(data => res.send(data))
        .catch(error => console.log(error));
});

app.get("/api/roadster", (_, res) => {
    fetch('https://api.spacexdata.com/v3/roadster')
        .then(response => response.json())
        .then(data => res.send(data))
        .catch(error => console.log(error));
});

app.get("/*", (_, res) => {
    const filePath = path.resolve(rootDir, "spa/build/index.html");
    res.sendFile(filePath);
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
