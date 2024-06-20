import {ProgramId} from "./constants.js";
import idl from '../idl/onlybags_idl.json';

let program = null;

export const getProgram = async (web3) => {
  if (!program) {
    program = await web3.createProgram(ProgramId, idl);
  }

  return program;
};
