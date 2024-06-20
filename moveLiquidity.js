import * as anchor from "@coral-xyz/anchor";
import * as accounts from "./helpers/accounts.js";
import {spl} from "@apocentre/solana-web3";
import * as constants from "./helpers/constants.js";
import {useWeb3} from "./useWeb3.js";

const {SystemProgram, PublicKey, SYSVAR_RENT_PUBKEY} = anchor.web3;

export const moveLiquidity = async () => {
  const web3 = useWeb3();
  const program = await getProgram(web3);
  const tokenName = "TOKEN_3";
  const tokenSymbol= "SYMBOL_3";
  const buyer = web3.wallet.publicKey;
  const state = new PublicKey(constants.state);
  const token = accounts.curveToken(state, tokenName, tokenSymbol, program.programId)[0];
  const bondingCurve = accounts.bondingCurve(state, token, program.programId)[0];
  
  const wsol = constants.wsol;
  const ammConfig = constants.raydiumAmmConfigDevnet;
  const raydiumProgram = constants.raydiumProgramDevnet;
  const [token0, token1] = token.toBuffer() < wsol.toBuffer() ? [token, wsol] : [wsol, token];
  const poolState = accounts.raydiumPoolState(ammConfig, token0, token1, raydiumProgram)[0];
  const buyerAta = await web3.getAssociatedTokenAddress(token, buyer, true, spl.TOKEN_2022_PROGRAM_ID);
  const buyerWsolAta = await web3.getAssociatedTokenAddress(wsol, buyer);
  const [creatorToken0, creatorToken1] = token.toBuffer() < wsol.toBuffer() ? [buyerAta, buyerWsolAta] : [buyerWsolAta, buyerAta];
  const lpMint = accounts.raydiumLpMint(poolState, raydiumProgram)[0];
  const creatorLpToken = await web3.getAssociatedTokenAddress(lpMint, buyer);
  const [token0Vault, token1Vault] = token.toBuffer() < wsol.toBuffer()
  ? [accounts.raydiumTokenVault(poolState, token, raydiumProgram)[0], accounts.raydiumTokenVault(poolState, wsol, raydiumProgram)[0]] 
  : [accounts.raydiumTokenVault(poolState, wsol, raydiumProgram)[0], accounts.raydiumTokenVault(poolState, token, raydiumProgram)[0]];

  const createPoolFee = constants.raydiumCreatorPoolFeedDevnet;

  const ix = await program.methods
  .moveLiquidity()
  .accounts({
    buyer,
    state,
    bondingCurve,
    token,
    buyerAta,
    buyerWsolAta,
    ammConfig,
    raydiumAuthority: accounts.raydiumAuthority(raydiumProgram)[0],
    poolState,
    wsolToken: wsol,
    token0Mint: token0,
    token1Mint: token1,
    lpMint,
    creatorToken0,
    creatorToken1,
    creatorLpToken,
    token0Vault,
    token1Vault,
    createPoolFee,
    observationState: accounts.raydiumObservationState(poolState, raydiumProgram)[0],
    associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
    tokenProgram: spl.TOKEN_PROGRAM_ID,
    token2022: spl.TOKEN_2022_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
    rent: SYSVAR_RENT_PUBKEY,
  })
  .instruction();


  const priorityFeeIx = web3.setComputeUnitPrice(20000);
  const latestBlockhash = await web3.connection.getLatestBlockhash('confirmed');
  const messageV0 = new TransactionMessage({
    payerKey: buyer,
    recentBlockhash: latestBlockhash.blockhash,
    instructions: [priorityFeeIx, ix],
  }).compileToV0Message([]);


  const tx = new VersionedTransaction(messageV0);

  return await program.provider.sendAndConfirm(tx);
}
