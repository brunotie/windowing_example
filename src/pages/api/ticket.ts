// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export interface TicketPage {
    count: number;
    data: Ticket[];
}

export interface Ticket {
    id: number;
    subject: string;
    priority: "Low" | "Medium" | "High";
    status: "New" | "Started" | "Finished";
    description: string;
}

let tickets: Ticket[] = new Array(10000).fill(true).map((d, i) => ({
    id: i,
    subject: `Ticket ${i}`,
    priority: "Medium",
    status: "New",
    description:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Fugiat hic necessitatibus voluptatum vel perspiciatis aperiam ea placeat iusto, architecto veniam explicabo nostrum expedita pariatur deleniti consectetur consequuntur voluptate, in molestiae.",
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
            const page_data = tickets.slice(100 * page, 100 * (page + 1));
            res.status(200).send({ count: tickets.length, data: page_data });
        }
    } else if (req.method == "POST") {
        const newTicket = JSON.parse(req.body);
        if (
            "subject" in newTicket &&
            "priority" in newTicket &&
            "description" in newTicket
        ) {
            const nextId = tickets.reduce((d, v) => Math.max(v.id, d), 1) + 1;
            const ticket: Ticket = {
                id: nextId,
                subject: newTicket.subject,
                priority: newTicket.priority,
                status: "New",
                description: newTicket.description,
            };
            tickets.push(ticket);
            res.status(200).send(ticket);
        } else {
            res.status(405).send(undefined);
        }
    } else if (req.method == "PUT") {
        const update = JSON.parse(req.body);
        if ("id" in update) {
            const index = tickets.findIndex((d) => d?.id == update.id);
            if (index != -1) {
                if ("subject" in update)
                    tickets[index].subject = update.subject;
                if ("priority" in update)
                    tickets[index].priority = update.priority;
                if ("status" in update) tickets[index].status = update.status;
                if ("description" in update)
                    tickets[index].description = update.description;
                res.status(200).send(tickets[index]);
            } else {
                res.status(404).send(undefined);
            }
        } else {
            res.status(405).send(undefined);
        }
    }
}
