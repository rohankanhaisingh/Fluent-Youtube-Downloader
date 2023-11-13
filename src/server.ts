import express, { Express, Router } from "express";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";

import { APPLICATION_PATH, SERVER_PORT, VIEWS_PATH } from "./constants";
import { route } from "./router";

export const server: Express = express();
export const router: Router = Router();

server.set("view engine", "ejs");
server.set("views", VIEWS_PATH);

server.use("/static/icons/", express.static(path.join(APPLICATION_PATH, "res", "icons")));
server.use("/static/fonts/", express.static(path.join(APPLICATION_PATH, "res", "fonts")));
server.use("/static/media/", express.static(path.join(APPLICATION_PATH, "res", "media")));
server.use("/static/data", express.static(path.join(APPLICATION_PATH, "res", "data")))
server.use("/static/cache/", express.static(path.join(APPLICATION_PATH, "res", "cache")));
server.use("/static/scripts/", express.static(path.join(APPLICATION_PATH, "scripts", "dist")));
server.use("/static/sourcemap/", express.static(path.join(APPLICATION_PATH, "scripts")));
server.use("/static/styles/", express.static(path.join(APPLICATION_PATH, "styles", "dist")));

route(router);

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(cors());
server.use("/", router);

export function listen() {

	server.listen(SERVER_PORT, function () {

		console.log(`Server is running on port ${SERVER_PORT}`);
	});
}