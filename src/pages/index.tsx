import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import { Ticket, TicketPage } from "./api/ticket";

type Maybe<T> = T | undefined;

function Row({ ticket }: { ticket: Maybe<Ticket> }) {
    if (!ticket) return <div>loading</div>;
    return <div>{ticket.subject}</div>;
}

export default function Home() {
    const [ticketCount, setTicketCount] = useState<number>();
    const [tickets, setTickets] = useState<Maybe<Ticket>[]>();

    async function fetchTickets(page: number) {
        const res: TicketPage = await fetch(`/api/ticket?page=${page}`).then(
            (body) => body.json()
        );
        setTicketCount(res.count);
        const ticket_results = tickets
            ? tickets
            : new Array(res.count).fill(undefined);
        ticket_results.splice(page * 100, res.data.length, ...res.data);
        console.log(ticket_results);
        console.log(res.data);
        setTickets(ticket_results);
    }

    useEffect(() => {
        fetchTickets(0);
    }, []);

    return (
        <main className={styles.main}>
            <div>{tickets && tickets.map((d,i) => <Row key={i} ticket={d} />)}</div>
        </main>
    );
}
