import { PublicKey } from "@solana/web3.js";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getNftMetaData } from "../contexts/utils";

export default function ReadyCard(props: {
    mint: string
}) {
    const [image, setImage] = useState("");
    const [name, setName] = useState("");
    const router = useRouter();
    const getNFTdetail = async () => {
        const uri = await getNftMetaData(new PublicKey(props.mint))
        await fetch(uri)
            .then(resp =>
                resp.json()
            ).then((json) => {
                setImage(json.image);
                setName(json.name);
            })
            .catch((error) => {
                console.log(error)
            })
    }

    useEffect(() => {
        getNFTdetail();
        // eslint-disable-next-line
    }, [])
    return (
        <div className="ready-card">
            {/* eslint-disable-next-line */}
            <img
                src={image}
                alt=""
            />
            <p>{name}</p>
            <button className="btn-primary" onClick={() => router.push(`/raffle/new/${props.mint}`)}>
                Create Raffle
            </button>
        </div>
    )
}