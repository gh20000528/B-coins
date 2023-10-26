const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const express = require('express');
const http = require('http');
const Binance = require('node-binance-api');
const BinanceApi = require('binance-api-node').default

const binance = new Binance().options({
  APIKEY: process.env.BINANCE_API_KEY,
  APISECRET: process.env.BINANCE_API_SECRET,
});

const client = BinanceApi();
const app = express();
app.use(cors());

const io = new Server({
  cors: {
    origin: "*",
  }
});

const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT'];

let formattedData = {};

symbols.forEach((symbol) => {
  binance.futuresBookTickerStream(symbol, (miniTicker) => {
    // 更新相應交易對的數據
    formattedData[symbol] = {
      name: symbol,
      bestAsk: miniTicker.bestAsk,
    };

    // 將整理後的即時價格數據推送到所有已連接的 Socket 客戶端
    io.sockets.emit('futuresMiniTickerUpdate', formattedData);
  });
});
// binance.futuresBookTickerStream( console.log );  
async function getTopGainers() {
    try {
      const stats = await client.dailyStats();
      const sortedStats = stats.sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent));
      const top15Stats = sortedStats.slice(0, 15);
  
      const formattedData = top15Stats.map(pair => ({
        symbol: pair.symbol,
        price: pair.lastPrice,
        dailyChange: pair.priceChangePercent,
      }));

      return formattedData;
    } catch (error) {
      console.error(error.body);
    }
  }


  async function getLowerGainers() {
    try {
      const stats = await client.dailyStats();
      const sortedStats = stats.sort((a, b) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent));
      const top15Stats = sortedStats.slice(0, 15);
  
      const formattedData = top15Stats.map(pair => ({
        symbol: pair.symbol,
        price: pair.lastPrice,
        dailyChange: pair.priceChangePercent,
      }));
      console.log(formattedData);
      return formattedData;
    } catch (error) {
      console.error(error.body);
    }
  }
  
  
// 靜態資源路由或其他 API 路由...
io.on('connection',async (socket) => {
  console.log('Client connected to WebSocket');

  socket.emit('topGainers',await getTopGainers());

  const updateInterval = 30 * 1000; // 30秒
  setInterval(async () => {
    socket.emit('topGainers', await getTopGainers());
  }, updateInterval);

  socket.emit('LowerGainers',await getLowerGainers());

  setInterval(async () => {
    socket.emit('LowerGainers', await getLowerGainers());
  }, updateInterval);

  // 當客戶端斷開連接時
  socket.on('disconnect', () => {
    console.log('Client disconnected from WebSocket');
  });

  // 監聽客戶端發送的其他事件，如果有的話...
});

io.listen(8000);
