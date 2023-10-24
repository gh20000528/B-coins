const express = require('express')
const Binance = require('binance-api-node').default
const cors = require('cors')
require('dotenv').config();

const app = express()
app.use(express.json())
app.use(cors())
const apiKey = process.env.BINANCE_API_KEY;
const apiSecret = process.env.BINANCE_API_SECRET;


app.listen( 8000 , () => {
  console.log('listen app in 8000 pp');
})

// 初始化未認證的客戶端
const client = Binance();

// 初始化認證的客戶端，請替換成你的API密鑰和密碼
const authenticatedClient = Binance({
  apiKey: apiKey,
  apiSecret: apiSecret,
  getTime: () => Date.now(),
});


app.get('/api/binanceData', async (req, res) => {
  try {
    const ticker = await getAllPrice();
    res.json(ticker);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
//獲取BTC/USDT的最新價格
async function getAllPrice() {
  try {
    const accountInfo = await client.prices();
    return accountInfo
  } catch (error) {
    console.error('獲取賬戶信息時出現錯誤：', error.message);
  }
}

app.get('/api/binancePrice', async (req, res) => {
    try {
      const ticker = await getLatestPrices(['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'DOGEUSDT', 'ADAUSDT']);
      res.json(ticker);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  async function getLatestPrices(symbols) {
    try {
      // 使用 Promise.all 同時發送多個請求
      const tickers = await Promise.all(
        symbols.map(async (symbol) => {
          const ticker = await client.prices({ symbol });
          return { [symbol]: ticker[symbol] };
        })
        );
        
        // 將每個交易對的價格整理成一個對象
        const prices = Object.assign({}, ...tickers);
      // console.log('最新價格：', prices);
      return prices
    } catch (error) {
      console.error('獲取價格時出現錯誤：', error.message);
    }
  }

  
  app.get('/api/topGainers', async (req, res) => {
    try {
      const stats = await client.dailyStats();
      const sortedStats = stats.sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent));
      const top15Stats = sortedStats.slice(0, 15);
  
      const formattedData = top15Stats.map(pair => ({
        symbol: pair.symbol,
        price: pair.lastPrice,
        dailyChange: pair.priceChangePercent,
      }));
  
      res.json(formattedData);
    } catch (error) {
      console.error(error.body);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  app.get('/api/topLosers', async (req, res) => {
    try {
      const stats = await client.dailyStats();
      const sortedStats = stats.sort((a, b) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent));
      const top15Stats = sortedStats.slice(0, 15);
  
      const formattedData = top15Stats.map(pair => ({
        symbol: pair.symbol,
        price: pair.lastPrice,
        dailyChange: pair.priceChangePercent,
      }));
  
      res.json(formattedData);
    } catch (error) {
      console.error(error.body);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
// // 獲取賬戶信息
// async function getAccountInfo() {
//   try {
//     const accountInfo = await client.dailyStats({ symbol: 'ETHUSDT' });
//     console.log('賬戶信息：', accountInfo);
//   } catch (error) {
//     console.error('獲取賬戶信息時出現錯誤：', error.message);
//   }
// }


// 呼叫函數
// getLatestPrice();
// getAccountInfo();
// getAllPrice();
