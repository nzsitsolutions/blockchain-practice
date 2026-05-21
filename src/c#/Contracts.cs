// NuGet: Install-Package Nethereum.Web3

var web3 = new Web3("https://polygon-rpc.com");
var contract = web3.Eth.GetContract(abi, contractAddress);

// Leer balance de un inversor (gratis, no gasta gas)
var balanceFunc = contract.GetFunction("balanceOf");
var balance = await balanceFunc
  .CallAsync<BigInteger>(investorAddress);

// Llamar función que escribe (gasta gas, requiere firma)
var whitelistFunc = contract.GetFunction("addToWhitelist");
var receipt = await whitelistFunc
  .SendTransactionAndWaitForReceiptAsync(
    adminWallet, gas, null, investorAddress
  );