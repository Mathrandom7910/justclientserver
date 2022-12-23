const e = require("express");
const EventEmitter = require("./out/index");

// const evEm = new EventEmitter();
// evEm.on("someevent", (arg) => {
//     console.log("running some event! Argument is " + arg);
// });


// setTimeout(() => evEm.emit("someevent", "this is an argument"), 1e3);
(async function () {
    const em = new EventEmitter();
    console.log(em);
    setTimeout(() => {
        em.emit("a", "this is the result");
        em.emit("b", "this is the other");
    }, 1e3);
    em.on("a", console.log);
    em.on("b", console.log);
    console.log(em);
    // const r = await em.await("a");
    // console.log(r);
    // em.removeEvent("a");
    // setTimeout(() => {
    //     console.log(em);
    // }, 500);
    
})();
