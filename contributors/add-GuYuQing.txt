var http = require("http"); // http 模块  
     
http.createServer(function(req, res) {  
  res.writeHead( 200 , {"Content-Type":"text/html"});  
  res.write("<h1>Node.js</h1>");  
  res.write("<p>Hello World</p>");  
  res.end("<p>beyondweb.cn</p>");  
}).listen(3000); // 监听端口3000  
  
console.log("HTTP server is listening at port 3000."); //在CMD中打印日志  