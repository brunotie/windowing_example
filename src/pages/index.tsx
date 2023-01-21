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
    const [ticketCount, setTicketCount] = useState<number>(0);
    const [tickets, setTickets] = useState<Maybe<Ticket>[]>([]);
    const [scrollPosition, setScrollPosition] = useState<number>(0);
    const ROW_HEIGHT = 40;

    async function fetchTickets(page: number) {
        console.log(page);
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

    useEffect(() => {
        fetchTickets(0);
    }, []);

    return (
        <div
            style={{ height: "500px", overflow: "auto", display: "flex" }}
            onScroll={(e) => {
                const target = e.target as HTMLDivElement;
                setScrollPosition(target.scrollTop);

                const beginning_element = Math.floor(
                    target.scrollTop / ROW_HEIGHT
                );
                const ending_element = Math.floor(
                    (target.scrollTop + window.innerHeight) / ROW_HEIGHT
                );

                if (!tickets[ending_element]) {
                    const page_ending = Math.floor(ending_element / 100);
                    const page_beginning = Math.floor(beginning_element / 100);
                    fetchTickets(page_ending);
                    if (
                        page_beginning != page_ending &&
                        !tickets[beginning_element]
                    ) {
                        fetchTickets(page_beginning);
                    }
                }
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
