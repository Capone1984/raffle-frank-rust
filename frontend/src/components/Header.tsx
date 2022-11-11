import { useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { adminValidation } from "../contexts/utils";
import { CloseIcon, DiscordIcon, MenuIcon, TwitterIcon } from "./svgIcons";

export default function Header() {
    const [isAdmin, setIsAdmin] = useState(false);
    const wallet = useWallet();
    const router = useRouter();
    const [routerName, setRouterName] = useState("");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (wallet.publicKey !== null) {
            const admin = adminValidation(wallet);
            setIsAdmin(admin)
            setRouterName(router.pathname.split("/")[1]);
        } else {
            setIsAdmin(false);
        }
        // eslint-disable-next-line
    }, [wallet.connected, isAdmin, router])
    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    <Link href="/">
                        <a>
                            {/* eslint-disable-next-line */}
                            <img
                                src="/img/logo.png"
                                alt="logo"
                            />
                        </a>
                    </Link>
                </div>
                <div className="header-center">
                    <nav className="header-nav">
                        <ul>
                            <li>
                                <Link href="/">
                                    <a>Home</a>
                                </Link>
                            </li>
                            {isAdmin &&
                                <li>
                                    <Link href="/create-raffle">
                                        <a className={routerName === "create-raffle" ? "active" : ""}>Create Raffle</a>
                                    </Link>
                                </li>
                            }
                            <li>
                                <Link href="/raffle">
                                    <a className={routerName === "raffle" ? "active" : ""}>Raffle house</a>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
                <div className="header-right">
                    <Link href="https://twitter.com/eternalunft?s=21&t=Mgwl1SHcuvfJnt1CSSii5g">
                        <a className="social-link">
                            {/* eslint-disable-next-line */}
                            <img
                                src="/buttons/twitter.png"
                                alt=""
                            />
                        </a>
                    </Link>
                    <Link href="https://discord.gg/Ur4DFDMj">
                        <a className="social-link">
                            {/* eslint-disable-next-line */}
                            <img
                                src="/buttons/discord.png"
                                alt=""
                            />
                        </a>
                    </Link>
                    <WalletModalProvider>
                        <WalletMultiButton />
                    </WalletModalProvider>
                    <div className="mobile-menu">
                        <button onClick={() => setOpen(!open)}>
                            {open ?
                                <CloseIcon color="#fff" />
                                :
                                <MenuIcon color="#fff" />
                            }
                        </button>
                    </div>
                </div>
            </div>
            <div className="header-wallet">
            </div>
            {open &&
                <nav className="mobile-nav" onClick={() => setOpen(false)}>
                    <ul>
                        <li>
                            <Link href="https://twitter.com/eternalunft?s=21&t=Mgwl1SHcuvfJnt1CSSii5g">
                                <a className="social-link">
                                    <TwitterIcon />
                                </a>
                            </Link>
                            <Link href="https://discord.gg/Ur4DFDMj">
                                <a className="social-link">
                                    <DiscordIcon />
                                </a>
                            </Link>
                        </li>
                        <li>
                            <Link href="/">
                                <a>Home</a>
                            </Link>
                        </li>
                        {isAdmin &&
                            <li>
                                <Link href="/create-raffle">
                                    <a className={routerName === "create-raffle" ? "active" : ""}>Create Raffle</a>
                                </Link>
                            </li>
                        }
                        <li>
                            <Link href="/raffle">
                                <a className={routerName === "raffle" ? "active" : ""}>Raffle house</a>
                            </Link>
                        </li>
                    </ul>
                </nav>
            }
        </header>
    )
}