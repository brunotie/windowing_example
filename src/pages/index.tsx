import { CSSProperties, UIEventHandler, useEffect, useState } from "react";
import { Ticket, TicketPage } from "./api/ticket";

type Maybe<T> = T | undefined;

function Row({
    ticket,
    style,
    onUpdate = (e) => {},
}: {
    ticket: Maybe<Ticket>;
    style?: CSSProperties;
    onUpdate?: (ticket: Ticket) => void;
}) {
    if (!ticket) return <div style={style}>loading</div>;

    return (
        <div style={style} className="row">
            <div className="row-header">
                {ticket.subject} |{" "}
                <select
                    defaultValue={ticket.priority}
                    onChange={(e) => {
                        if (
                            e.target.value == "Low" ||
                            e.target.value == "Medium" ||
                            e.target.value == "High"
                        )
                            onUpdate({ ...ticket, priority: e.target.value });
                    }}
                >
                    <option value={"Low"}>Low</option>
                    <option value={"Medium"}>Medium</option>
                    <option value={"High"}>High</option>
                </select>{" "}
                |{" "}
                <select
                    defaultValue={ticket.status}
                    onChange={(e) => {
                        if (
                            e.target.value == "New" ||
                            e.target.value == "Started" ||
                            e.target.value == "Finished"
                        )
                            onUpdate({ ...ticket, status: e.target.value });
                    }}
                >
                    <option value={"New"}>New</option>
                    <option value={"Started"}>Started</option>
                    <option value={"Finished"}>Finished</option>
                </select>
            </div>
            <div className="row-description">{ticket.description}</div>
        </div>
    );
}

export default function Home() {
    const [ticketCount, setTicketCount] = useState<number>(0);
    const [tickets, setTickets] = useState<Maybe<Ticket>[]>([]);
    const [scrollPosition, setScrollPosition] = useState<number>(0);
    const ROW_HEIGHT = 70;

    async function fetchTickets(page: number) {
        const res: TicketPage = await fetch(`/api/ticket?page=${page}`).then(
            (body) => body.json()
        );
        setTicketCount(res.count);
        setTickets((old_tickets) => {
            let result = new Array(res.count).fill(undefined);
            result.splice(0, old_tickets.length, ...old_tickets);
            result.splice(page * 100, res.data.length, ...res.data);
            return result;
        });
    }

    const updateVirtualDOM: UIEventHandler = (event) => {
        const target = event.target as HTMLDivElement;
        setScrollPosition(target.scrollTop);

        const beginning_element = Math.floor(target.scrollTop / ROW_HEIGHT);
        const ending_element = Math.floor(
            (target.scrollTop + window.innerHeight) / ROW_HEIGHT
        );

        if (!tickets[ending_element]) {
            const page_ending = Math.floor(ending_element / 100);
            const page_beginning = Math.floor(beginning_element / 100);
            fetchTickets(page_ending);
            if (page_beginning != page_ending && !tickets[beginning_element]) {
                fetchTickets(page_beginning);
            }
        }
    };

    const onUpdate = (ticket: Ticket) => {
        fetch(`/api/ticket`, { method: "PUT", body: JSON.stringify(ticket) });
        setTickets((t) => {
            const index = t.findIndex((d) => d?.id == ticket.id);
            if (index != -1) t[index] = ticket;
            return t;
        });
    };

    useEffect(() => {
        fetchTickets(0);
    }, []);

    return (
        <div
            style={{
                display: "flex",
                margin: "0 auto",
                flexDirection: "column",
                height: "100vh",
                width: "620px",
                gap: "0.5rem",
            }}
        >
            <h1>Create new Ticket</h1>
            <div>
                <form
                    style={{
                        width: "600px",
                        display: "grid",
                        gridTemplateColumns: "120px 1fr",
                        gridAutoFlow: "row",
                        gap: "0.25rem",
                        textAlign: "right",
                    }}
                    onSubmit={(e) => {
                        e.preventDefault();
                        const formdata = new FormData(
                            e.target as HTMLFormElement
                        );
                        var json = JSON.stringify({
                            subject: formdata.get("subject"),
                            description: formdata.get("description"),
                            priority: formdata.get("priority"),
                        });
                        fetch(`/api/ticket`, {
                            method: "POST",
                            body: json,
                        }).then((d) => {
                            location.reload();
                        });
                    }}
                >
                    <label>Subject</label>
                    <input type="text" name="subject" />
                    <label>Description</label>
                    <textarea name="description" />
                    <label>Priority</label>
                    <select name="priority">
                        <option value={"Low"}>Low</option>
                        <option value={"Medium"}>Medium</option>
                        <option value={"High"}>High</option>
                    </select>
                    <span></span>
                    <input type="submit" value="Create" />
                </form>
            </div>
            <h1>All Tickets</h1>
            <div
                style={{ overflow: "auto", display: "flex", width: "620px" }}
                onScroll={updateVirtualDOM}
            >
                <div
                    style={{
                        height: (ticketCount ?? 0) * ROW_HEIGHT,
                        width: "600px",
                        position: "relative",
                    }}
                >
                    {tickets &&
                        tickets.map((d, i) =>
                            i * ROW_HEIGHT > scrollPosition - 100 &&
                            scrollPosition + window.innerHeight >
                                i * ROW_HEIGHT ? (
                                <Row
                                    key={i}
                                    ticket={d}
                                    style={{
                                        position: "absolute",
                                        top: i * ROW_HEIGHT,
                                    }}
                                    onUpdate={onUpdate}
                                />
                            ) : (
                                <></>
                            )
                        )}
                </div>
            </div>
        </div>
    );
}
