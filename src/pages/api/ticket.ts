// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export type Ticket = {
    id: number;
    subject: string;
    priority: "Low" | "Medium" | "High";
    status: "New" | "Started" | "Finished";
    description: string;
};

let tickets: Ticket[] = new Array(10000).map((d) => ({
    id: d,
    subject: `Ticket ${d}`,
    priority: "Medium",
    status: "New",
    description: "Some text here",
}));

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method == "GET") {
        if (req.query.id) {
            const ticket = tickets.find((d) => d.id == Number(req.query.id));
            if (ticket == undefined) res.status(404).send(undefined);
            res.status(200).send(ticket);
        } else {
            const page =
                typeof req.query.page == "string"
                    ? Number.parseInt(req.query.page)
                    : 0;
            const page_data = tickets
                .sort((a, b) => a.id - b.id)
                .slice(100 * page, 100 * (page + 1));

            res.status(200).send({ count: tickets.length, data: page_data });
        }
    } else if (req.method == "POST") {
    } else if (req.method == "PUT") {
    }
}
