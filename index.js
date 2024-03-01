import express from "express";
import morgan from "morgan";
import config from "config";
import { fileURLToPath } from "url";
import { dirname } from "path";
import http from "http";
import path from "path";
import fileUpload from "express-fileupload";

import connectDB from "./config/db.js";
import router from "./api/secure/router.js";
import * as socketService from "./api/shared/services/socket/socket.server.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// http server
const server = http.createServer(app);

// connect to database
connectDB();

// init socket io

socketService.initSocket(server);

// @ts-ignore
app.use(express.json());
app.use(morgan("dev"));
app.use(fileUpload());

// @ts-ignore
app.use("/api", router);
app.use(express.static(path.join(__dirname, "public")));

app.use("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || config.get("PORT");

// @ts-ignore
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
