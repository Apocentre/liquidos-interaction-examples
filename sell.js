import * as anchor from "@coral-xyz/anchor";
import * as accounts from "./helpers/accounts.js";
import {spl} from "@apocentre/solana-web3";
import {useWeb3} from "./useWeb3.js";

const {BN} = anchor.default;
const {SystemProgram, PublicKey, TransactionMessage, VersionedTransaction} = anchor.web3

export const sell = async () => {
  const web3 = useWeb3();
  const program = await getProgram(web3);
  const tokenName = "TOKEN_TAX_HUB_1";
  const tokenSymbol= "SYMBOL_TAX_HUB_1";
  const seller = web3.wallet.publicKey;
  const state = new PublicKey(constants.state);
  const token = accounts.curveToken(state, tokenName, tokenSymbol, program.programId)[0];
  const bondingCurve = accounts.bondingCurve(state, token, program.programId)[0];
  const amount = new BN(4355043485455);
  const minAmountOut = new BN(0); // no slippage
  const sellerAta = await web3.getAssociatedTokenAddress(token, seller, true, spl.TOKEN_2022_PROGRAM_ID);

  const sellIx = await program.methods
  .sell(amount, minAmountOut)
  .accounts({
    seller,
    state,
    treasury: new PublicKey(constants.treasury),
    bondingCurve,
    token,
    sellerAta,
    associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
    token2022: spl.TOKEN_2022_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .instruction();

  const priorityFeeIx = web3.setComputeUnitPrice(80000);
  const latestBlockhash = await web3.connection.getLatestBlockhash('confirmed');
  const messageV0 = new TransactionMessage({
    payerKey: seller,
    recentBlockhash: latestBlockhash.blockhash,
    instructions: [priorityFeeIx, sellIx],
  }).compileToV0Message([]);

  const tx = new VersionedTransaction(messageV0);

  return await program.provider.sendAndConfirm(tx);
}
