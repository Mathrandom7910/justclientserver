const File = require("./js/index").default;

// const file = new File("./test1.txt");


// const writer = file.writer();

// (async function() {
//     for(let i = 0; i < 100; i++) {
//         await writer.appender().append("\n");
//         await writer.appender().append("Hello " + i);
//     }
// })();

const testDir = new File("./src");

testDir.walk().then(console.log)


// reader.read("utf-8")
// .then((val) => {
//     console.log(val)
// })

// const rl = reader.readLine();
// var i = 0;
// rl.on("line", (s) => {
//     console.log(s, i++);
//     if(i == 2) rl.close();
// });

// rl.ready();

// file.access().then(console.log);


// const dir = new File("./directory/dir/d2");

// dir.mkDirs().then(() => {
//     console.log("done");
// });