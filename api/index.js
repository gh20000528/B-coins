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

async function getAllPrice() {
    try {
      const accountInfo = await client.prices();
      return accountInfo
    } catch (error) {
      console.error('獲取賬戶信息時出現錯誤：', error.message);
    }
  }
// 獲取BTC/USDT的最新價格
// async function getLatestPrice() {
//   try {
//     const ticker = await client.prices({ symbol: 'ETHUSDT' });
//     console.log(`BTC/USDT 最新價格：${ticker.ETHUSDT}`);
//   } catch (error) {
//     console.error('獲取價格時出現錯誤：', error.message);
//   }
// }

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
getAllPrice();
