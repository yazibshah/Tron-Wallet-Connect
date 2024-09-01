const enableTronButton = document.querySelector(".enableTronButton");
const sendTransactionButton = document.querySelector(".sendTransactionButton");
const resultDom = document.querySelector(".result");
const connectedIcon = document.getElementById("connected-icon");



// enableTronButton.addEventListener("click", async () => {
const connectWallet = async () => {
  const accounts = await getAccount();
  console.log('accounts', accounts)
  if ((accounts && accounts?.code == 200) || accounts.length > 0) {
    // Wallet connected successfully
    enableTronButton.style.display = 'none'
    connectedIcon.style.display = 'inline'; // Show the connected icon
  } else {
    enableTronButton.style.display = 'inline-block'
    connectedIcon.style.display = 'none'; // Hide the connected icon
  }
};

window.onload = function () {
  // Your function call here
  connectWallet()
};

async function getAccount() {
  try {
    const accounts = await window.okxwallet.tronLink.request({
      method: "tron_requestAccounts"
    });
    return accounts;
  } catch (error) {
    console.error("Failed to get account:", error);
    return [];
  }
}

// Handle chain (network) and sign transaction
sendTransactionButton.addEventListener("click", async () => {
  if (window.okxwallet.tronLink.ready) {
    const tronweb = window.okxwallet.tronLink.tronWeb;
    const fromAddress = "TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL";
    const toAddress = "TAHQdDiZajMMP26STUnfsiRMNyXdxAJakZ";

    try {
      const tx = await tronweb.transactionBuilder.sendTrx(
        toAddress,
        10,
        fromAddress
      ); // Step1
      const signedTx = await tronweb.trx.sign(tx); // Step2
      await tronweb.trx.sendRawTransaction(signedTx); // Step3
      resultDom.innerHTML = signedTx;
    } catch (error) {
      // error handling
      console.log(error);
      resultDom.innerHTML = error?.message || error;
    }
  } else {
    alert("Wallet not connected");
  }
});

