import * as anchor from '@project-serum/anchor';
import {
    AccountInfo,
    PublicKey,
    SystemProgram,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { WalletContextState } from '@solana/wallet-adapter-react';
import { solConnection } from './utils';
import { IDL } from './raffle';
import { DECIMALS, GLOBAL_AUTHORITY_SEED, PROGRAM_ID, RAFFLE_SIZE, REAP_DECIMALS, REAP_TOKEN_MINT } from '../config';
import { RafflePool } from './type';
import { successAlert } from '../components/toastGroup';

export const createRaffle = async (
    wallet: WalletContextState,
    nft_mint: PublicKey,
    ticketPriceSol: number,
    ticketPriceReap: number,
    endTimestamp: number,
    winnerCount: number,
    whitelisted: number,
    max: number,
    startLoading: Function,
    closeLoading: Function,
    updatePage: Function
) => {
    if (!wallet.publicKey) return;
    startLoading();
    let cloneWindow: any = window;
    let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
    const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
    const userAddress = wallet.publicKey;

    try {
        const [globalAuthority, bump] = await PublicKey.findProgramAddress(
            [Buffer.from(GLOBAL_AUTHORITY_SEED)],
            program.programId
        );

        let ownerNftAccount = await getAssociatedTokenAccount(userAddress, nft_mint);

        let ix0 = await getATokenAccountsNeedCreate(
            solConnection,
            userAddress,
            globalAuthority,
            [nft_mint]
        );

        let ix1 = await getATokenAccountsNeedCreate(
            solConnection,
            userAddress,
            userAddress,
            [REAP_TOKEN_MINT]
        );

        let raffle;
        let i;

        for (i = 10; i > 0; i--) {
            raffle = await PublicKey.createWithSeed(
                userAddress,
                nft_mint.toBase58().slice(0, i),
                program.programId,
            );
            let state = await getStateByKey(raffle);
            if (state === null) {
                break;
            }
        }
        if (raffle === undefined) return;
        let ix = SystemProgram.createAccountWithSeed({
            fromPubkey: userAddress,
            basePubkey: userAddress,
            seed: nft_mint.toBase58().slice(0, i),
            newAccountPubkey: raffle,
            lamports: await solConnection.getMinimumBalanceForRentExemption(RAFFLE_SIZE),
            space: RAFFLE_SIZE,
            programId: program.programId,
        });

        const tx = await program.rpc.createRaffle(
            bump,
            new anchor.BN(ticketPriceReap * REAP_DECIMALS),
            new anchor.BN(ticketPriceSol * DECIMALS),
            new anchor.BN(endTimestamp),
            new anchor.BN(winnerCount),
            new anchor.BN(whitelisted),
            new anchor.BN(max),
            {
                accounts: {
                    admin: userAddress,
                    globalAuthority,
                    raffle,
                    ownerTempNftAccount: ownerNftAccount,
                    destNftTokenAccount: ix0.destinationAccounts[0],
                    nftMintAddress: nft_mint,
                    tokenProgram: TOKEN_PROGRAM_ID,
                },
                instructions: [
                    ix,
                    ...ix0.instructions,
                    ...ix1.instructions
                ],
                signers: [],
            });
        await solConnection.confirmTransaction(tx, "finalized");
        console.log("txHash =", tx);
        closeLoading();
        updatePage();
    } catch (error) {
        console.log(error);
        closeLoading();
    }
}

export const buyTicket = async (
    wallet: WalletContextState,
    nft_mint: PublicKey,
    amount: number,
    startLoading: Function,
    closeLoading: Function,
    updatePage: Function
) => {

    if (!wallet.publicKey) return;
    startLoading();
    let cloneWindow: any = window;
    let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
    const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        program.programId
    );
    const userAddress = wallet.publicKey;
    try {

        const raffleKey = await getRaffleKey(nft_mint);
        if (raffleKey === null) return;
        let raffleState = await getRaffleState(nft_mint);
        if (raffleState === null) return;
        const creator = raffleState.creator;

        let userTokenAccount = await getAssociatedTokenAccount(userAddress, REAP_TOKEN_MINT);

        const tx = await program.rpc.buyTickets(
            bump,
            new anchor.BN(amount),
            {
                accounts: {
                    buyer: userAddress,
                    raffle: raffleKey,
                    globalAuthority,
                    creator,
                    userTokenAccount,
                    tokenMint: REAP_TOKEN_MINT,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                },
                instructions: [],
                signers: [],
            });
        await solConnection.confirmTransaction(tx, "finalized");
        successAlert(`You have purchased ${amount} tickets!`, "")
        console.log("txHash =", tx);
        updatePage();
        closeLoading();
    } catch (error) {
        console.log(error);
        closeLoading();
    }

}

export const revealWinner = async (
    wallet: WalletContextState,
    nft_mint: PublicKey,
    startLoading: Function,
    closeLoading: Function,
    updatePage: Function
) => {

    if (!wallet.publicKey) return;
    startLoading();
    let cloneWindow: any = window;
    let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
    const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
    const userAddress = wallet.publicKey;
    try {
        const raffleKey = await getRaffleKey(nft_mint);
        if (raffleKey === null) return;
        const tx = await program.rpc.revealWinner(
            {
                accounts: {
                    buyer: userAddress,
                    raffle: raffleKey,
                },
                instructions: [],
                signers: [],
            });
        await solConnection.confirmTransaction(tx, "finalized");
        console.log("txHash =", tx);
        successAlert("Action success!", "")
        updatePage();
        closeLoading();
    } catch (error) {
        console.log(error);
        closeLoading();
    }
}

export const claimReward = async (
    wallet: WalletContextState,
    nft_mint: PublicKey,
    startLoading: Function,
    closeLoading: Function,
    updatePage: Function
) => {

    if (!wallet.publicKey) return;
    startLoading();
    let cloneWindow: any = window;
    let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
    const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
    const userAddress = wallet.publicKey;

    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        program.programId
    );

    try {

        const raffleKey = await getRaffleKey(nft_mint);
        const srcNftTokenAccount = await getAssociatedTokenAccount(globalAuthority, nft_mint);

        let ix0 = await getATokenAccountsNeedCreate(
            solConnection,
            userAddress,
            userAddress,
            [nft_mint]
        );

        let tx;
        if (raffleKey === null) return;
        if (ix0.instructions.length === 0) {
            tx = await program.rpc.claimReward(
                bump,
                {
                    accounts: {
                        claimer: userAddress,
                        globalAuthority,
                        raffle: raffleKey,
                        claimerNftTokenAccount: ix0.destinationAccounts[0],
                        srcNftTokenAccount,
                        nftMintAddress: nft_mint,
                        tokenProgram: TOKEN_PROGRAM_ID,
                    },
                    instructions: [],
                    signers: [],
                });
        } else {
            tx = await program.rpc.claimReward(
                bump,
                {
                    accounts: {
                        claimer: userAddress,
                        globalAuthority,
                        raffle: raffleKey,
                        claimerNftTokenAccount: ix0.destinationAccounts[0],
                        srcNftTokenAccount,
                        nftMintAddress: nft_mint,
                        tokenProgram: TOKEN_PROGRAM_ID,
                    },
                    instructions: [
                        ...ix0.instructions
                    ],
                    signers: [],
                });
        }
        await solConnection.confirmTransaction(tx, "finalized");
        console.log("txHash =", tx);
        updatePage();
        closeLoading();

    } catch (error) {
        console.log(error);
        closeLoading();
    }
}

/**
 * @dev WithdrawNFT function
 * @param userAddress The creator's address
 * @param nft_mint The nft_mint address
 */
export const withdrawNft = async (
    wallet: WalletContextState,
    nft_mint: PublicKey,
    startLoading: Function,
    closeLoading: Function,
    updatePage: Function
) => {

    if (!wallet.publicKey) return;
    startLoading();
    let cloneWindow: any = window;
    let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
    const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
    const userAddress = wallet.publicKey;

    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        program.programId
    );
    try {

        const raffleKey = await getRaffleKey(nft_mint);
        if (raffleKey === null) return;
        const srcNftTokenAccount = await getAssociatedTokenAccount(globalAuthority, nft_mint);

        let ix0 = await getATokenAccountsNeedCreate(
            solConnection,
            userAddress,
            userAddress,
            [nft_mint]
        );
        const tx = await program.rpc.withdrawNft(
            bump,
            {
                accounts: {
                    claimer: userAddress,
                    globalAuthority,
                    raffle: raffleKey,
                    claimerNftTokenAccount: ix0.destinationAccounts[0],
                    srcNftTokenAccount,
                    nftMintAddress: nft_mint,
                    tokenProgram: TOKEN_PROGRAM_ID,
                },
                instructions: [
                    ...ix0.instructions
                ],
                signers: [],
            });
        await solConnection.confirmTransaction(tx, "finalized");
        console.log("txHash =", tx);
        closeLoading();
        updatePage();
    } catch (error) {
        console.log(error);
        closeLoading();
    }

}

export const getRaffleKey = async (
    nft_mint: PublicKey
): Promise<PublicKey | null> => {

    let cloneWindow: any = window;
    let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
    const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

    let poolAccounts = await solConnection.getParsedProgramAccounts(
        program.programId,
        {
            filters: [
                {
                    dataSize: RAFFLE_SIZE
                },
                {
                    memcmp: {
                        "offset": 40,
                        "bytes": nft_mint.toBase58()
                    }
                }
            ]
        }
    );
    if (poolAccounts.length !== 0) {
        let len = poolAccounts.length;
        let max = 0;
        let maxId = 0;
        for (let i = 0; i < len; i++) {
            let state = await getStateByKey(poolAccounts[i].pubkey);
            if (state !== null && state.endTimestamp.toNumber() > max) {
                max = state.endTimestamp.toNumber();
                maxId = i;
            }
        }
        let raffleKey = poolAccounts[maxId].pubkey;
        return raffleKey;
    } else {
        return null;
    }
}

export const getStateByKey = async (
    raffleKey: PublicKey
): Promise<RafflePool | null> => {
    let cloneWindow: any = window;
    let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
    const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
    try {
        let rentalState = await program.account.rafflePool.fetch(raffleKey);
        return rentalState as RafflePool;
    } catch {
        return null;
    }
}

export const getRaffleState = async (
    nft_mint: PublicKey
): Promise<RafflePool | null> => {

    let cloneWindow: any = window;
    let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
    const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

    let poolAccounts = await solConnection.getParsedProgramAccounts(
        program.programId,
        {
            filters: [
                {
                    dataSize: RAFFLE_SIZE
                },
                {
                    memcmp: {
                        "offset": 40,
                        "bytes": nft_mint.toBase58()
                    }
                }
            ]
        }
    );
    if (poolAccounts.length !== 0) {
        let len = poolAccounts.length;
        console.log(len);
        let max = 0;
        let maxId = 0;
        for (let i = 0; i < len; i++) {
            let state = await getStateByKey(poolAccounts[i].pubkey);
            if (state !== null && state.endTimestamp.toNumber() > max) {
                max = state.endTimestamp.toNumber();
                maxId = i;
            }
        }
        let raffleKey = poolAccounts[maxId].pubkey;

        try {
            let rentalState = await program.account.rafflePool.fetch(raffleKey);
            return rentalState as RafflePool;
        } catch {
            return null;
        }
    } else {
        return null;
    }
}


export const getRaffleGlobalState = async () => {
    let cloneWindow: any = window;
    let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
    const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

    let poolAccounts = await solConnection.getParsedProgramAccounts(
        program.programId,
        {
            filters: [
                {
                    dataSize: RAFFLE_SIZE
                },
            ]
        }
    );
    if (poolAccounts.length !== 0) {
        try {
            let list = [];
            for (let i = 0; i < poolAccounts.length; i++) {
                let rentalKey = poolAccounts[i].pubkey;
                let rentalState = await program.account.rafflePool.fetch(rentalKey);
                list.push(rentalState)
            }
            return list
        } catch (error) {
            console.log(error)
        }
    } else {
        return null;
    }
}

const getAssociatedTokenAccount = async (ownerPubkey: PublicKey, mintPk: PublicKey): Promise<PublicKey> => {
    let associatedTokenAccountPubkey = (await PublicKey.findProgramAddress(
        [
            ownerPubkey.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            mintPk.toBuffer(), // mint address
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
    ))[0];
    return associatedTokenAccountPubkey;
}

export const getATokenAccountsNeedCreate = async (
    connection: anchor.web3.Connection,
    walletAddress: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey,
    nfts: anchor.web3.PublicKey[],
) => {
    let instructions = [], destinationAccounts = [];
    for (const mint of nfts) {
        const destinationPubkey = await getAssociatedTokenAccount(owner, mint);
        let response = await connection.getAccountInfo(destinationPubkey);
        if (!response) {
            const createATAIx = createAssociatedTokenAccountInstruction(
                destinationPubkey,
                walletAddress,
                owner,
                mint,
            );
            instructions.push(createATAIx);
        }
        destinationAccounts.push(destinationPubkey);
        if (walletAddress != owner) {
            const userAccount = await getAssociatedTokenAccount(walletAddress, mint);
            response = await connection.getAccountInfo(userAccount);
            if (!response) {
                const createATAIx = createAssociatedTokenAccountInstruction(
                    userAccount,
                    walletAddress,
                    walletAddress,
                    mint,
                );
                instructions.push(createATAIx);
            }
        }
    }
    return {
        instructions,
        destinationAccounts,
    };
}

export const createAssociatedTokenAccountInstruction = (
    associatedTokenAddress: anchor.web3.PublicKey,
    payer: anchor.web3.PublicKey,
    walletAddress: anchor.web3.PublicKey,
    splTokenMintAddress: anchor.web3.PublicKey
) => {
    const keys = [
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
        { pubkey: walletAddress, isSigner: false, isWritable: false },
        { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
        {
            pubkey: anchor.web3.SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        {
            pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
    ];
    return new anchor.web3.TransactionInstruction({
        keys,
        programId: ASSOCIATED_TOKEN_PROGRAM_ID,
        data: Buffer.from([]),
    });
}
