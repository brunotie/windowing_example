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
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "50px",
                width: "300px",
                ...style,
            }}
        >
            <div style={{ textAlign: "right", color: "#626C66" }}>
                {ticket.subject} |{" "}
                <select
                    onChange={(e) => {
                        if (
                            e.target.value == "Low" ||
                            e.target.value == "Medium" ||
                            e.target.value == "High"
                        )
                            onUpdate({ ...ticket, priority: e.target.value });
                    }}
                >
                    <option value={"Low"} selected={ticket.priority == "Low"}>
                        Low
                    </option>
                    <option
                        value={"Medium"}
                        selected={ticket.priority == "Medium"}
                    >
                        Medium
                    </option>
                    <option value={"High"} selected={ticket.priority == "High"}>
                        High
                    </option>
                </select>{" "}
                |{" "}
                <select
                    onChange={(e) => {
                        if (
                            e.target.value == "New" ||
                            e.target.value == "Started" ||
                            e.target.value == "Finished"
                        )
                            onUpdate({ ...ticket, status: e.target.value });
                    }}
                >
                    <option value={"New"} selected={ticket.status == "New"}>
                        New
                    </option>
                    <option
                        value={"Started"}
                        selected={ticket.status == "Started"}
                    >
                        Started
                    </option>
                    <option
                        value={"Finished"}
                        selected={ticket.status == "Finished"}
                    >
                        Finished
                    </option>
                </select>
            </div>
            <div style={{ textAlign: "right", fontSize: "1.25rem" }}>
                {ticket.description}
            </div>
        </div>
    );
}

export default function Home() {
    const [ticketCount, setTicketCount] = useState<number>(0);
    const [tickets, setTickets] = useState<Maybe<Ticket>[]>([]);
    const [scrollPosition, setScrollPosition] = useState<number>(0);
    const ROW_HEIGHT = 60;

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
            style={{ height: "100vh", overflow: "auto", display: "flex" }}
            onScroll={updateVirtualDOM}
        >
            <div
                style={{
                    height: (ticketCount ?? 0) * ROW_HEIGHT,
                    width: "100%",
                    position: "relative",
                }}
            >
                {tickets &&
                    tickets.map((d, i) =>
                        i * ROW_HEIGHT > scrollPosition - 100 &&
                        scrollPosition + window.innerHeight > i * ROW_HEIGHT ? (
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
    );
}
