import * as anchor from "@coral-xyz/anchor";
import * as accounts from "./helpers/accounts.js";
import {spl} from "@apocentre/solana-web3";
import * as constants from "./helpers/constants.js";
import {getProgram} from "./helpers/program.js";
import {useWeb3} from "./useWeb3.js";

const {BN} = anchor.default;
const {
  SystemProgram, PublicKey, SYSVAR_RENT_PUBKEY, TransactionMessage, VersionedTransaction,
} = anchor.web3

export const buy = async () => {
  const web3 = useWeb3();
  const program = await getProgram(web3);
  const tokenName = "TOKEN_TAX_HUB_2";
  const tokenSymbol= "SYMBOL_TAX_HUB_2";
  const amount = new BN(web3.toBase("70", 9));
  const minAmountOut = new BN(0); // no slippage
  const buyer = web3.wallet.publicKey;
  const state = new PublicKey(constants.state);
  // TODO:: replace TOKEN_CREATOR with the value you will get from the API (when loading tokens)
  const tokenCreator = new PublicKey(TOKEN_CREATOR);
  const token = accounts.curveToken(state, tokenName, tokenSymbol, program.programId)[0];
  const buyerAta = await web3.getAssociatedTokenAddress(token, buyer, true, spl.TOKEN_2022_PROGRAM_ID);
  const bondingCurve = accounts.bondingCurve(state, token, program.programId)[0];
  const wsol = constants.wsol;
  const buyerWsolAta = await web3.getAssociatedTokenAddress(wsol, buyer);
  const ammConfig = constants.raydiumAmmConfigDevnet;

  const buy_ix = await program.methods
  .buy(amount, minAmountOut)
  .accounts({
    buyer,
    state,
    treasury: new PublicKey(constants.treasury),
    bondingCurve,
    tokenCreator,
    token,
    buyerAta,
    buyerWsolAta,
    wsolToken: wsol,
    ammConfig,
    associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
    tokenProgram: spl.TOKEN_PROGRAM_ID,
    token2022: spl.TOKEN_2022_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .instruction();

  const raydiumProgram = constants.raydiumProgramDevnet;
  const [token0, token1] = token.toBuffer() < wsol.toBuffer() ? [token, wsol] : [wsol, token];
  const poolState = accounts.raydiumPoolState(ammConfig, token0, token1, raydiumProgram)[0];
  const [creatorToken0, creatorToken1] = token.toBuffer() < wsol.toBuffer() ? [buyerAta, buyerWsolAta] : [buyerWsolAta, buyerAta];
  const lpMint = accounts.raydiumLpMint(poolState, raydiumProgram)[0];
  const creatorLpToken = await web3.getAssociatedTokenAddress(lpMint, buyer);
  const [token0Vault, token1Vault] = token.toBuffer() < wsol.toBuffer()
  ? [accounts.raydiumTokenVault(poolState, token, raydiumProgram)[0], accounts.raydiumTokenVault(poolState, wsol, raydiumProgram)[0]] 
  : [accounts.raydiumTokenVault(poolState, wsol, raydiumProgram)[0], accounts.raydiumTokenVault(poolState, token, raydiumProgram)[0]];

  const createPoolFee = constants.raydiumCreatorPoolFeedDevnet;

  const moveLiquidityIx = await program.methods
  .moveLiquidity()
  .accounts({
    buyer: buyer,
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
    cpSwapProgram: raydiumProgram,
    associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
    tokenProgram: spl.TOKEN_PROGRAM_ID,
    token2022: spl.TOKEN_2022_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
    rent: SYSVAR_RENT_PUBKEY,
  })
  .instruction();

  const cbIx = web3.getComputationBudgetIx(750_000);
  const priorityFeeIx = web3.setComputeUnitPrice(80000);
  const latestBlockhash = await web3.connection.getLatestBlockhash('confirmed');
  const messageV0 = new TransactionMessage({
    payerKey: buyer,
    recentBlockhash: latestBlockhash.blockhash,
    instructions: [cbIx, priorityFeeIx, buy_ix, moveLiquidityIx],
  }).compileToV0Message([]);

  const tx = new VersionedTransaction(messageV0);

  return await program.provider.sendAndConfirm(tx);
}
