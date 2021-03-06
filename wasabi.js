function startApp (web3Loaded) {
    console.log("Start app", web3Loaded);
    if (!web3Loaded)
    {
        initApp(web3Loaded);
        return;
    }

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            wasabiInit(xmlHttp.responseText);
    }
    xmlHttp.open("GET", "contracts.json", true);
    xmlHttp.send(null);

    function wasabiInit (abis) {
        var wasabi = JSON.parse(abis);
        wasabi.forEach(function (contract, index) {
            var definition = web3.eth.contract(contract.abi);
            var c = definition.at(contract.address);
            window[contract.name] = {
                deployed: function () {
                    return c;
                },
                at: function (address) {
                    return definition.at(address);
                }
            };
        });

        initApp(web3Loaded);
    }
}

window.addEventListener('load', function() {

  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
    // Now you can start your app & access web3 freely:
    startApp(true);
  } else {
    startApp(false);
    return;
  }
});