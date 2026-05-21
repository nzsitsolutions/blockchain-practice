import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");
const contract = new ethers.Contract(contractAddress, abi, provider);

// leer balance de un inversor (gratis, no gasta gas)
const balance = await contract.balanceOf(investorAddress);

// llamar función que escribe (gasta gas, requiere firma)
const signer = new ethers.Wallet(privateKey, provider);
const receipt = await contract
  .connect(signer)
  .addToWhitelist(investorAddress);
await receipt.wait();
