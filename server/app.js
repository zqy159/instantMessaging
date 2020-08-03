const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const index = require('./routes/index')
const users = require('./routes/users')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});
//监听客户端链接,回调函数会传递本次链接的socket
io.on('connection', socket => {
  // 监听客户端发送的信息
  socket.on("sentToServer", message => {
    // 给客户端返回信息
    io.emit("sendToClient", { message });
  });
  // 监听连接断开事件
  socket.on("disconnect", () => {
    console.log("连接已断开...");
  });

});

module.exports = app
