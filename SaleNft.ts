import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "@ton/crypto";
import { TonClient, WalletContractV4, internal, beginCell, Cell, Address, toNano, storeStateInit, StateInit,  SendMode } from "@ton/ton";


async function main() {

    // initialize ton rpc client on mainnet
    const endpoint = await getHttpEndpoint(); // testnet == await getHttpEndpoint({ network: "testnet" });
    const client = new TonClient({ endpoint });

    // open wallet v4 or v5 (notice the correct wallet version here)
    const mnemonic = ""; // your 24 secret words (replace ... with the rest of the words)
    const key = await mnemonicToWalletKey(mnemonic.split(" "));
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

    // make sure wallet is deployed
    if (!await client.isContractDeployed(wallet.address)) {
      return console.log("wallet is not deployed");
    }
    
    // func:0.4.4 src:op-codes.fc, imports/stdlib.fc, nft-fixprice-sale-v3r3.fc
    const NftFixPriceSaleV3R3CodeBoc = 'te6ccgECDwEAA5MAART/APSkE/S88sgLAQIBYgIDAgLNBAUCASANDgL30A6GmBgLjYSS+CcH0gGHaiaGmAaY/9IH0gfSB9AGppj+mfmBg4KYVjgGAASpiFaY+F7xDhgEoYBWmfxwjFsxsLcxsrZBZjgsk5mW8oBfEV4ADJL4dwEuuk4QEWQIEV3RXgAJFZ2Ngp5OOC2HGBFWAA+WjKFkEINjYQQF1AYHAdFmCEAX14QBSYKBSML7y4cIk0PpA+gD6QPoAMFOSoSGhUIehFqBSkCH6RFtwgBDIywVQA88WAfoCy2rJcfsAJcIAJddJwgKwjhtQRSH6RFtwgBDIywVQA88WAfoCy2rJcfsAECOSNDTiWoMAGQwMWyy1DDQ0wchgCCw8tGVIsMAjhSBAlj4I1NBobwE+CMCoLkTsPLRlpEy4gHUMAH7AATwU8fHBbCOXRNfAzI3Nzc3BPoA+gD6ADBTIaEhocEB8tGYBdD6QPoA+kD6ADAwyDICzxZY+gIBzxZQBPoCyXAgEEgQNxBFEDQIyMsAF8sfUAXPFlADzxYBzxYB+gLMyx/LP8ntVOCz4wIwMTcowAPjAijAAOMCCMACCAkKCwCGNTs7U3THBZJfC+BRc8cF8uH0ghAFE42RGLry4fX6QDAQSBA3VTIIyMsAF8sfUAXPFlADzxYBzxYB+gLMyx/LP8ntVADiODmCEAX14QAYvvLhyVNGxwVRUscFFbHy4cpwIIIQX8w9FCGAEMjLBSjPFiH6Astqyx8Vyz8nzxYnzxYUygAj+gITygDJgwb7AHFwVBcAXjMQNBAjCMjLABfLH1AFzxZQA88WAc8WAfoCzMsfyz/J7VQAGDY3EDhHZRRDMHDwBQAgmFVEECQQI/AF4F8KhA/y8ADsIfpEW3CAEMjLBVADzxYB+gLLaslx+wBwIIIQX8w9FMjLH1Iwyz8kzxZQBM8WE8oAggnJw4D6AhLKAMlxgBjIywUnzxZw+gLLaswl+kRbyYMG+wBxVWD4IwEIyMsAF8sfUAXPFlADzxYBzxYB+gLMyx/LP8ntVACHvOFnaiaGmAaY/9IH0gfSB9AGppj+mfmC3ofSB9AH0gfQAYKaFQkNDggPlozJP9Ii2TfSItkf0iLcEIIySsKAVgAKrAQAgb7l72omhpgGmP/SB9IH0gfQBqaY/pn5gBaH0gfQB9IH0AGCmxUJDQ4ID5aM0U/SItlH0iLZH9Ii2F4ACFiBqqiU' 
    const NftFixPriceSaleV3R3CodeCell = Cell.fromBoc(Buffer.from(NftFixPriceSaleV3R3CodeBoc, 'base64'))[0]

    const marketplaceAddress = Address.parse("EQBYTuYbLf8INxFtD8tQeNk5ZLy-nAX9ahQbG_yl1qQ-GEMS")    // GetGems Address (testnet: kQBZp2tZ9WUZQP8AgL2gUHkdJQe-8NyAcFksn3L7dcZxYJkN)
    const marketplaceFeeAddress = Address.parse("EQCjk1hh952vWaE9bRguFkAhDAL5jj3xj9p0uPWrFBq_GEMS") // GetGems Address for Fees (testnet: 0QD4FPq-PRDieyQKkizFTRtSDyucUIqrj0v_zXJmqaDp6xti)
    const destinationAddress = Address.parse("EQAIFunALREOeQ99syMbO6sSzM_Fa1RsPD5TBoS0qVeKQ-AR")    // GetGems sale contracts deployer (testnet: kQDZwUjVjK__PvChXCvtCMshBT1hrPKMwzRhyTAtonUbL9i9)

    const walletAddress = wallet.address
    const royaltyAddress = Address.parse("") // your wallet address if nft doesnt have rayalty fee
    const nftAddress = Address.parse("") // nft_item address

    const price = toNano(""); // sale price

    const feesData = beginCell()
                      .storeAddress(marketplaceFeeAddress)
                      .storeCoins(price / BigInt(100) * BigInt(5)) // getgems commission 
                      .storeAddress(royaltyAddress)
                      .storeCoins(price / BigInt(100) * BigInt(1))
                      .endCell();

    const saleData = beginCell()
                      .storeBit(0) // is_complete
                      .storeUint(Math.round(Date.now() / 1000), 32) // created_at
                      .storeAddress(marketplaceAddress)
                      .storeAddress(nftAddress)
                      .storeAddress(walletAddress)
                      .storeCoins(price) // full price in nanotons
                      .storeRef(feesData) // fees_cell
                      .storeUint(0, 32)
                      .storeUint(0, 64)
                      .endCell();

  const stateInit: StateInit = {
    code: NftFixPriceSaleV3R3CodeCell,
    data: saleData
  };
  const stateInitCell = beginCell()
      .store(storeStateInit(stateInit))
      .endCell();
            

    const saleContractAddress = new Address(0, stateInitCell.hash());

    const saleBody = beginCell().storeUint(1, 32).storeUint(0, 64).endCell();

    const transferNftBody = beginCell()
                        .storeUint(0x5fcc3d14, 32) // op-code
                        .storeUint(0, 64) // query_id
                        .storeAddress(destinationAddress)
                        .storeAddress(walletAddress)
                        .storeBit(0) // default parameters
                        .storeCoins(toNano("0.2")) // forward_amount (do not touch)
                        .storeBit(0) // default parameters
                        .storeUint(0x0fe0ede, 31) // op-code
                        .storeRef(stateInitCell)
                        .storeRef(saleBody)
                        .endCell();
    
    const walletContract = client.open(wallet);
    const seqno = await walletContract.getSeqno();
    await walletContract.sendTransfer({
      secretKey: key.secretKey,
      seqno: seqno,
      sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
      messages: [
        internal({
          to: "", // address of NFT Item contract, that should be placed on market
          value: toNano("0.3"), // the rest will be returned (do not touch)
          body: transferNftBody
        })
      ]
    });

    // wait until confirmed
    let currentSeqno = seqno;
    while (currentSeqno == seqno) {
      console.log("waiting for transaction to confirm...");
      await sleep(1500);
      currentSeqno = await walletContract.getSeqno();
    }
    console.log("transaction confirmed!");
}

main();

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
