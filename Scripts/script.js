//coinGecko general link
let APILinkStart = "https://api.coingecko.com/api/v3";

// future list of coins taken from coinGecko
let coinList = {};
let stableCoinList = ["USDT","USDC","WBTC","BUSD","DAI",
                      "UST","RSR","PAX","HUSD","TUSD",
                      "USDN","FEI"];

// DOM variables
let coinSelector;
let coinCurrPlace;
let coinCurrPrice;
let coinCurrCap;

let btcFields;
let checkTrackBTC;
let btcPriceInput;
let btcBtns;

let btcCurrentStats;
let btcCurrPrice;
let btcCurrCap;
let btcMultiplier;

let desiredCap;

//spinner
let spinner;
let spinnerimg;
let spinnertext;
let counter = 0;
let origtext = "Loading";
let serverCallSpinner;

//flag variables
let trackBTC = false;

//current coin chosen
let chosenCoin;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

//wait for the DOM to load, then initialize DOM variables
document.addEventListener('DOMContentLoaded', (event) => {
    //loading spinner
    spinner = document.getElementById("spinnercontainer");
    spinnerimg = document.querySelector("#initialspinner img");
    spinnertext = document.querySelector("#initialspinner h2");


    //inputs
    coinSelector = document.getElementById("coinselector");
    wantedPlaceSelector = document.getElementById("marketcapplace");
    checkTrackBTC = document.getElementById("trackBTC");

    //market status texts
    coinCurrPlace = document.getElementById("currplace");
    coinCurrPrice = document.getElementById("currprice");
    coinCurrCap = document.getElementById("currmarketcap");

    //BTC track selectors
    btcFields = document.getElementById("BtcPotential");
    btcPriceInput = document.getElementById("BTCtrackprice");
    btcBtndiv = document.querySelector("#btcPotentialBtns");
    btcBtns = document.querySelectorAll("#btcPotentialBtns button");

    //BTC status texts
    btcCurrentStats = document.getElementById("BTCcurrnum");
    btcCurrPrice = document.getElementById("BTCprice");
    btcCurrCap = document.getElementById("BTCmarket");
    
    //DesiredCap text
    desiredCap = document.getElementById("wishedcapnum");
    
    //Calculating
    calculatebtn = document.getElementById("calculatebtn");
    moontext = document.getElementById("moonprice");

    //start server ping spinner
    serverCallSpinner = setInterval(() => {
        if(counter===3)
        {
            spinnertext.innerHTML = origtext;
            counter = 0;
        }
        spinnertext.innerHTML = spinnertext.innerHTML+=".";
        counter++;
    }, 1000, counter);
})


function checkServer(){//check coinGecko for availability
    return fetch(APILinkStart+"/ping/")
    .then(status)
    .catch(error=>{
        //if the server is not available, we redirect to empty html page
        window.location.replace("../Pages/unavailable.html");
        return Promise.reject()
    })
}

function status(result){//function for server status checking
    if(!result.ok){
        throw new Error(result.statusText);
    }
}

//get 1 page of 250 result of coins, sorted by market cap with price change percentage of 24h and price compared to usd
function InitializeCoinList(list){
    //get /coins/
    return fetch(APILinkStart + "/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h")
    .then(response=>{
        return response.json();
    })
    .then((list)=>{
        coinList = list.filter(isStable); // remove stables -- fix function not launchign
        InitializeForm();
    })
}

//function for filtering stablecoins out of coin list
function isStable(coin){
    for(let i=0;i<stableCoinList.length;i++){
        if(coin.symbol.toUpperCase()===stableCoinList[i])
        {
            return false;
        }  
    }
    return true;
}

//putting coin options into selector
function InitializeForm(){
    for(let i=0;i<coinList.length;i++)
    {
        let option = document.createElement("option");
        option.setAttribute("name",coinList[i].name);
        option.innerHTML = coinList[i].symbol.toUpperCase();
        coinSelector.append(option);
    }
    //hide server loading spinner
    spinner.style.animation="dissapear 3s linear forwards";
    setTimeout(() => {
        clearInterval(serverCallSpinner);
        spinner.style.setProperty("display","none");
    }, 3000);

    addEvents();
}

//clearing form
function clearForm(){
    wantedPlaceSelector.value = "";
    moontext.innerText = "";
    desiredCap.value = "";

    lockCalculateBtn();
}

//changing calculate button styling upon data
function lockCalculateBtn(){
    calculatebtn.classList.add("calculate--disabled");
    calculatebtn.classList.remove("calculate--enabled");
}

function unlockCalculateBtn(){
    if(checkTrackBTC.checked)
    {
        if(btcPriceInput.value==="")
            return;
    }
    calculatebtn.classList.add("calculate--enabled");
    calculatebtn.classList.remove("calculate--disabled");
}

//Choosing a coin 
function getCoinStats(){
    let name = coinSelector.selectedOptions[0].getAttribute("name");
    if(name==="empty")
    {
        clearForm();
        chosenCoin = null;

        coinCurrPlace.innerText = "";
        coinCurrPrice.innerText = "";
        coinCurrCap.innerText = "";

        wantedPlaceSelector.setAttribute("disabled","");
        
        return;
    }

    let coinPlace;
    for(let i=0;i<coinList.length;i++){
        if(name==coinList[i].name)
        {
            chosenCoin = coinList[i];
            coinPlace = i;
            break;
        }
    }

    clearForm();
    wantedPlaceSelector.removeAttribute("disabled");
    coinCurrPlace.innerText = coinPlace + 1;
    coinCurrPrice.innerText = chosenCoin.current_price + "$";
    coinCurrCap.innerText = formatMarketCap(chosenCoin.market_cap);

    wantedPlaceSelector.setAttribute("max", coinPlace);
    countDesiredCap();
}

//function for formatting market cap of coins
function formatMarketCap(marketCap){
    let capFormat = marketCap + "";
    let j = capFormat.length-3;
    for(; j>=1;j-=3)
    {
        capFormat = capFormat.substr(0,j) + ',' + capFormat.substr(j,capFormat.length);
    }
    return capFormat + '$';
}

//function for formatting resulting price
function formatResultPrice(marketCap){
    let priceFormat = marketCap + "";
    let j = priceFormat.length-6;
    for(; j>=1;j-=3)
    {
        priceFormat = priceFormat.substr(0,j) + ',' + priceFormat.substr(j,priceFormat.length);
    }
    return priceFormat + '$';
}

//onChange event for BTC checkmark
function btcUpsideUpdate(){
    if (checkTrackBTC.checked){
        trackBTC = true;
        btcFields.style.setProperty("display","flex");
        btcCurrentStats.style.setProperty("display","block");
        btcBtndiv.style.setProperty("display","block");

        btcCurrPrice.innerText = coinList[0].current_price + "$";
        btcCurrCap.innerText = formatMarketCap(coinList[0].market_cap);

    }
    else
    {
        trackBTC = false;
        btcFields.style.setProperty("display","none");
        btcCurrentStats.style.setProperty("display","none");
        btcBtndiv.style.setProperty("display","none");
        getCoinStats();
    }
}

//BTC track buttons functionality
function btcMultiplierBtnClick(){
    let capresult = coinList[0].current_price;
    capresult = capresult * (this.innerText.slice(0,-1));
    btcPriceInput.value = formatMarketCap(capresult);
    countDesiredCap();
}

//count new market cap for your coin
function countDesiredCap(){
    if(chosenCoin && wantedPlaceSelector.value!=="")
    {
        let desiredCapNum = chosenCoin.market_cap;

        if(wantedPlaceSelector.value!=0)
        {
            desiredCapNum = coinList[wantedPlaceSelector.value-1].market_cap;
        }

        if(trackBTC && btcPriceInput.value!==0)
        {
            let BTCmultiplier;
            let BTCmultipliedPrice;
            BTCmultipliedPrice = btcPriceInput.value.replaceAll(",","").replaceAll("$","");
            btcMultiplier = BTCmultipliedPrice / (coinList[0].current_price);
            desiredCapNum *= btcMultiplier;
        }
        unlockCalculateBtn();
        moontext.innerText = "";
        desiredCap.value = formatMarketCap(desiredCapNum);
    }
    else{
        desiredCap.value = "";
    }
}

//Calculating resulting price
function MoonmathCalculation(){
    if(wantedPlaceSelector.value==="" || chosenCoin==null)
        return;
    let result;
    let wantedCap = parseInt(desiredCap.value.replaceAll(",","").replaceAll("$","").replaceAll(".",""), 10);
    let multiplier = Math.round((wantedCap / chosenCoin.market_cap)*100);
    let formattedPrice = Math.round(chosenCoin.current_price*100);
    result = (formattedPrice * multiplier)/10000;
    moontext.innerText = formatResultPrice(result.toFixed(2));
}

//add events to input fields in form
function addEvents(){
    coinSelector.onchange = getCoinStats;
    wantedPlaceSelector.onchange = countDesiredCap;
    checkTrackBTC.onchange = btcUpsideUpdate;
    for(let i=0;i<btcBtns.length;i++)
        btcBtns[i].onclick = btcMultiplierBtnClick;
    calculatebtn.onclick = MoonmathCalculation;
}

// Starting point: checking the server here, initializing form
checkServer().then(InitializeCoinList(),()=>{console.log("Service is unavailable")})


