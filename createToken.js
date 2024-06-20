import * as anchor from "@coral-xyz/anchor";
import * as accounts from "./helpers/accounts.js";
import {spl} from "@apocentre/solana-web3";
import * as constants from "./helpers/constants.js";
import {useWeb3} from "./useWeb3.js";

const {SystemProgram, PublicKey} = anchor.web3

export const createToken = async () => {
  const tokenName = "TOKEN_HUB";
  const tokenSymbol= "SYMBOL_HUB";
  const state = new PublicKey(constants.state);
  const tokenCreator = web3.wallet.publicKey;
  const web3 = useWeb3();
  const program = await getProgram(web3);
  const token = accounts.curveToken(state, tokenName, tokenSymbol, program.programId)[0];
  const bondingCurve = accounts.bondingCurve(state, token, program.programId)[0];

  const ix = await program.methods
  .createToken(
    tokenName,
    tokenSymbol,
    "http://onlybags.fun"
  )
  .accounts({
    state,
    token,
    tokenCreator,
    curveAta: await web3.getAssociatedTokenAddress(token, bondingCurve, true, spl.TOKEN_2022_PROGRAM_ID),
    bondingCurve,
    associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
    token2022: spl.TOKEN_2022_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .instruction();

  const priorityFeeIx = web3.setComputeUnitPrice(20000);
  const latestBlockhash = await web3.connection.getLatestBlockhash('confirmed');
  const messageV0 = new TransactionMessage({
    payerKey: tokenCreator,
    recentBlockhash: latestBlockhash.blockhash,
    instructions: [priorityFeeIx, ix],
  }).compileToV0Message([]);


  const tx = new VersionedTransaction(messageV0);

  return await program.provider.sendAndConfirm(tx);
}
