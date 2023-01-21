import { CSSProperties, useEffect, useState } from "react";
import { Ticket, TicketPage } from "./api/ticket";

type Maybe<T> = T | undefined;

function Row({
    ticket,
    style,
}: {
    ticket: Maybe<Ticket>;
    style?: CSSProperties;
}) {
    if (!ticket) return <div style={style}>loading</div>;
    return <div style={style}>{ticket.subject}</div>;
}

export default function Home() {
    const [ticketCount, setTicketCount] = useState<number>();
    const [tickets, setTickets] = useState<Maybe<Ticket>[]>();
    const [scrollPosition, setScrollPosition] = useState<number>(0);
    const ROW_HEIGHT = 40;

    async function fetchTickets(page: number) {
        const res: TicketPage = await fetch(`/api/ticket?page=${page}`).then(
            (body) => body.json()
        );
        setTicketCount(res.count);
        const ticket_results = tickets
            ? tickets
            : new Array(res.count).fill(undefined);
        ticket_results.splice(page * 100, res.data.length, ...res.data);
        setTickets(ticket_results);
    }

    useEffect(() => {
        fetchTickets(0);
    }, []);

    return (
        <div
            style={{ height: "500px", overflow: "auto", display: "flex" }}
            onScroll={(e) => {
                const target = e.target as HTMLDivElement;
                setScrollPosition(target.scrollTop);
            }}
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
                            />
                        ) : (
                            <></>
                        )
                    )}
            </div>
        </div>
    );
}