//coinGecko general link
let APILinkStart = "https://api.coingecko.com/api/v3";

// future list of coins taken from coinGecko
let coinList = {};

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
    marketCapSelector = document.getElementById("marketcapplace");
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

//get 1 page of 100 result of coins, sorted by market cap with price change percentage of 24h and price compared to usd
function InitializeCoinList(list){
    //get /coins/
    return fetch(APILinkStart + "/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h")
    .then(response=>{
        return response.json();
    })
    .then((list)=>{
        console.log("Coins fetch result");
        console.log(list);
        coinList = list;
        InitializeForm();
    })
}

//put coin options into selector
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

//replacing stats every time a new coin is chosen
function getCoinStats(){
    let name = coinSelector.selectedOptions[0].getAttribute("name");
    if(name==="empty")
    {
        coinCurrPlace.innerText = "";
        coinCurrPrice.innerText = "";

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

    coinCurrPlace.innerText = coinPlace+1;
    coinCurrPrice.innerText = chosenCoin.current_price + "$";
    coinCurrCap.innerText = formatMarketCap(chosenCoin.market_cap);

    marketCapSelector.setAttribute("max",coinPlace);
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

function btcMultiplierBtnClick(){
    let capresult = coinList[0].current_price;
    capresult = capresult * (this.innerText.slice(0,-1));
    btcPriceInput.value = formatMarketCap(capresult);
    countDesiredCap();
}

//count new market cap for your coin
function countDesiredCap(){
    if(chosenCoin)
    {
        let desiredCapNum = chosenCoin.market_cap;
        console.log(desiredCapNum);

        if(marketCapSelector.value!=0)
        {
            desiredCapNum = coinList[marketCapSelector.value-1].market_cap;
        }

        if(trackBTC && btcPriceInput.value!==0)
        {
            let BTCmultiplier;
            let BTCmultipliedPrice;
            BTCmultipliedPrice = btcPriceInput.value.replaceAll(",","").replaceAll("$","");
            btcMultiplier = BTCmultipliedPrice / (coinList[0].current_price);
            desiredCapNum *= btcMultiplier;
        }
        desiredCap.value = formatMarketCap(desiredCapNum);
        console.log(desiredCapNum);
    }
}

//add events to input fields in form
function addEvents(){
    coinSelector.onchange = getCoinStats;
    marketCapSelector.onchange = countDesiredCap;
    checkTrackBTC.onchange = btcUpsideUpdate;
    for(let i=0;i<btcBtns.length;i++)
        btcBtns[i].onclick = btcMultiplierBtnClick;
    calculatebtn.onclick = MoonmathCalculation;
}

function MoonmathCalculation(){
    let result;
    let wantedCap = parseInt(desiredCap.value.replaceAll(",","").replaceAll("$","").replaceAll(".",""), 10);
    console.log("wantedcapmoon" + wantedCap); 
    let multiplier = Math.round((wantedCap / chosenCoin.market_cap)*100);
    console.log(multiplier);
    let formattedPrice = Math.round(chosenCoin.current_price*100);
    result = (formattedPrice * multiplier)/10000;
    moontext.innerText = formatResultPrice(result.toFixed(2));
    console.log("result"+ result);
}

// checking the server here, initializing form
checkServer().then(InitializeCoinList(),()=>{console.log("Service is unavailable")})


