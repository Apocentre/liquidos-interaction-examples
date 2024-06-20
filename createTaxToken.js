import * as anchor from "@coral-xyz/anchor";
import * as accounts from "./helpers/accounts.js";
import {spl} from "@apocentre/solana-web3";
import * as constants from "./helpers/constants.js";
import {useWeb3} from "./useWeb3.js";

const {BN} = anchor.default;
const {SystemProgram, PublicKey, SYSVAR_RENT_PUBKEY} = anchor.web3

export const createTaxToken = async () => {
  const tokenName = "TOKEN_TAX_HUB_2";
  const tokenSymbol= "SYMBOL_TAX_HUB_2";
  const state = new PublicKey(constants.state);
  const tokenCreator = web3.wallet.publicKey;
  const web3 = useWeb3();
  const program = await getProgram(web3);
  const token = accounts.curveToken(state, tokenName, tokenSymbol, program.programId)[0];
  const bondingCurve = accounts.bondingCurve(state, token, program.programId)[0];

  const ix = await program.methods
  .createTaxToken(
    tokenName,
    tokenSymbol,
    "http://onlybags.fun",
    new BN(200), // 2% transfer fee
    new BN(web3.toBase("20000000", 6)), // max fee that can be charged is 2% of the total supply i.e. 20M
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
    rent: SYSVAR_RENT_PUBKEY,
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
