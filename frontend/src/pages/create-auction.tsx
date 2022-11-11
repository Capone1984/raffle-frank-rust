import { getParsedNftAccountsByOwner } from "@nfteyez/sol-rayz";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { solConnection } from "../contexts/utils";
import { MetadataKey } from "@nfteyez/sol-rayz/dist/config/metaplex";
import ReadyCard from "../components/ReadyCard";

export default function CreateRafflePage(props: {
    startLoading: Function,
    closeLoading: Function
}) {
    const wallet = useWallet()
    const { startLoading, closeLoading } = props;
    const [hide, setHide] = useState(false);

    const [nftList, setNftList] = useState<any>();

    const getNFTs = async () => {
        startLoading(true);
        if (wallet.publicKey !== null) {
            const nftsList = await getParsedNftAccountsByOwner({ publicAddress: wallet.publicKey.toBase58(), connection: solConnection });
            setNftList(nftsList);
            setHide(!hide);
            closeLoading(false);
        }
    }

    useEffect(() => {
        if (wallet.publicKey !== null)
            getNFTs();
        // eslint-disable-next-line
    }, [wallet.connected]);

    return (
        <main>
            <div className="container">
                <div className="raffle-content">
                    {nftList && nftList.length !== 0 &&
                        nftList.map((item: NFTType, key: number) => (
                            <ReadyCard
                                mint={item.mint}
                                key={key}
                            />
                        ))
                    }
                </div>
            </div>
        </main>
    )
}


interface NFTType {
    mint: string;
    updateAuthority: string;
    data: {
        creators: any[];
        name: string;
        symbol: string;
        uri: string;
        sellerFeeBasisPoints: number;
    };
    key: MetadataKey;
    primarySaleHappened: boolean;
    isMutable: boolean;
    editionNonce: number;
    masterEdition?: string;
    edition?: string;
}