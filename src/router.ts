import { Request, Response, Router } from "express";

export function route(router: Router) {

	router.get("/", function (req: Request, res: Response) {

		res.render("index");
	});
}