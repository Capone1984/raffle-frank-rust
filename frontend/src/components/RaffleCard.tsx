import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { DECIMALS } from "../config";
import { getNftMetaData } from "../contexts/utils";
import Countdown from "./Countdown";
import { Skeleton } from "@mui/material";
import { useRouter } from "next/router";

export default function RaffleCard(props: {
  ticketPriceReap: number,
  ticketPriceSol: number,
  endTimestamp: number,
  ticketsCount: number,
  nftMint: string,
}) {
  const { ticketPriceReap, ticketPriceSol, endTimestamp, nftMint, ticketsCount } = props;
  const router = useRouter();
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [payType, setPayType] = useState("--");
  const [loading, setLoading] = useState(false);

  const getNFTdetail = async () => {
    setLoading(true);
    const uri = await getNftMetaData(new PublicKey(nftMint))
    await fetch(uri)
      .then(resp =>
        resp.json()
      ).then((json) => {
        setImage(json.image);
        setName(json.name);
        console.log("Card detail:", json.name, nftMint)
      })
      .catch((error) => {
        console.log(error)
      })
    if (ticketPriceReap === 0) {
      setPrice(ticketPriceSol / LAMPORTS_PER_SOL);
      setPayType("SOL");
    } else if (ticketPriceSol === 0) {
      setPrice(ticketPriceReap / DECIMALS);
      setPayType("$REAP")
    }

    setLoading(false);
  }
  useEffect(() => {
    getNFTdetail();
    // eslint-disable-next-line
  }, [])

  const cardRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (cardRef.current) {
      setDimensions({
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight
      });
    }
  }, []);
  return (
    <div className="raffle-card" >
      <div className="media" ref={cardRef}>
        {loading ?
          <Skeleton variant="rectangular" animation="wave" width={dimensions.width} height={dimensions.width} style={{ borderRadius: 14, background: "#0000002e" }} />
          :
          // eslint-disable-next-line
          <img
            src={image}
            alt=""
            style={{
              height: dimensions.width,
              filter: new Date(endTimestamp) < new Date() ? "grayscale(1)" : "grayscale(0)"
            }}
          />
        }

      </div>
      {loading ?
        <div className="card-content">
          <Skeleton variant="rectangular" animation="wave" width={200} height={28} style={{ borderRadius: 4, marginTop: 3, marginBottom: 3, background: "#0000002e" }} />
          <Skeleton variant="rectangular" animation="wave" width={120} height={24} style={{ borderRadius: 4, marginTop: 10, marginBottom: 10, background: "#0000002e" }} />
          <Skeleton variant="rectangular" animation="wave" width={80} height={16} style={{ borderRadius: 4, marginTop: 4, marginBottom: 4, background: "#0000002e" }} />
          <Skeleton variant="rectangular" animation="wave" width={120} height={18} style={{ borderRadius: 4, marginTop: 4, marginBottom: 4, background: "#0000002e" }} />
          <Skeleton variant="rectangular" animation="wave" width={140} height={40} style={{ borderRadius: 4, margin: "24px auto 4px", background: "#0000002e" }} />
        </div>
        :
        <div className="card-content">
          <h3 className="card-title title-1">{name}</h3>
          <p className="card-price">
            <span className="text-bold">{price}</span>&nbsp;
            {payType}
          </p>
          <div className="raffle-endtime">
            {new Date(endTimestamp) < new Date() ?
              <>
                <p className="close-time" style={{ fontSize: 18 }}>
                  Closed
                </p>
                {ticketsCount === 0 &&
                  <p style={{ fontSize: 18 }}>No tickets sold</p>
                }
              </>
              :
              <>
                <p className="close-time">
                  Countdown
                </p>
                <Countdown endDateTime={new Date(endTimestamp)} update={() => getNFTdetail()} />
              </>
            }
          </div>
          <div className="card-action">
            <button className="btn-image btn-view" onClick={() => router.push(`/raffle/${nftMint}`)}>
              {/* eslint-disable-next-line */}
              <img
                src="/buttons/view.png"
                alt=""
              />
            </button>
          </div>
        </div>
      }
    </div>
  )
}