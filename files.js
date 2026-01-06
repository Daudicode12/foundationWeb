// const os = require('os');
// const user = os.userInfo()
// console.log(user);

// const fs = require('fs');
// const path = require('path');

// const filePath = path.join(__dirname, 'user-info.txt');
// fs.writeFileSync(filePath, `User Info: ${JSON.stringify(user)}`);
// console.log('Wrote user info to', filePath);

// http module
// const http =require('http');
// const server = http.createServer((req,res)=>{
//     // res.writeHead(200,{'Content-Type':'text/plain'});
//     if(req.url === '/'){
//         res.writeHead(200,{'Content-Type':'text/plain'});
//     res.end('Hello from HTTP server!\n');
//     } else if (req.url === '/user'){
//         res.writeHead(200,{'Content-Type':'application/json'});
//         res.end(JSON.stringify({name:'Alice', age:30}));
//     }
// })

// server.listen(3001);

// const fs = require('fs');
// const path = require('path');

// const examplePath = path.join(__dirname, '..', 'example.txt');

// fs.readFile(examplePath, 'utf8', (err, data) => {
//     if(err){
//         console.error("Error reading file:",err);
//         return;
//     }
//     else{
//         console.log(data);
        
//     }
// });


// here we are adding http module
const http = require('http');

// create server
const server =http.createServer((req, res)=>{
    // ser the response header
    res.writeHead(200,{'Content-Type':'text/plain'});
    // send the response body
    res.end('<h1>Welcome Dave you have created your backend this is a good start</h1>');
});

// stting the server to listen to port 3000
const PORT = 3000;
server.listen(PORT,'localhost',()=>{
    console.log(`Server is running at http://localhost:${PORT}` )
    
});

