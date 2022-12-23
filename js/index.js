"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const little_db_1 = require("@mathrandom7910/little-db");
const path_1 = require("path");
const parser_1 = require("./parser");
const dotenv_1 = require("dotenv");
const discord_js_1 = require("discord.js");
const filec_1 = require("filec");
const crypto_js_1 = require("crypto-js");
const key_1 = require("./key");
const os_1 = __importDefault(require("os"));
const util_1 = require("./util");
const child_process_1 = require("child_process");
const bot = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.GuildMembers,
    ]
});
const accVersion = "0.0.0";
if (os_1.default.platform() == "win32")
    (0, dotenv_1.config)();
const app = (0, express_1.default)();
var isReady = false;
const hashSeed = parseInt(process.env.seed || "0");
var justClientCode;
app.use((0, express_1.urlencoded)({ extended: true }));
app.use((0, express_1.json)());
const db = (0, little_db_1.init)({
    parser: new parser_1.EncryptionParser()
});
var cfg;
db.on("ready", async () => {
    isReady = true;
    cfg = await db.config({ jcAdmins: { "846173524469219358": true } });
});
const User = db.entry("users");
app.use(function (_req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    // res.setHeader("Access-Control-Allow-Credentials", true);
    next();
});
function hash(str) {
    let h1 = 0xdeadbeef ^ hashSeed, h2 = 0x41c6ce57 ^ hashSeed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
async function auth(req, res, next) {
    if (!isReady)
        return;
    const tmpIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "127.0.0.1";
    const ip = tmpIp instanceof Array ? tmpIp[0] : tmpIp;
    const body = req.body;
    if (typeof body.accessId != "string") {
        res.json({
            error: true
        }).end();
        return;
    }
    const user = await User.findOne("accessId", body.accessId);
    if (user == null) {
        res.json({
            error: true
        }).end();
        return;
    }
    if (user.data.locked || (user.data.ipHash != hash(ip) && user.data.ipHash)) {
        user.data.locked = true;
        // res.header.ye
        res.json({
            error: true,
            locked: true
        });
        return;
    }
    req.user = user;
    next();
}
app.post("/auth", auth, (_req, res) => {
    res.json({
        error: false
    }).end();
});
const jcFile = new filec_1.FileClass("./justclient_js");
app.post("/justclient", auth, async (_req, res) => {
    if (!justClientCode) {
        const txt = await jcFile.reader().read("utf8");
        justClientCode = crypto_js_1.AES.decrypt(txt, key_1.key).toString(crypto_js_1.enc.Utf8);
        // console.log(justClientCode);
    }
    // res.setHeader("con")
    res.end(justClientCode);
});
app.get("/", (_req, res) => {
    res.end("Hello World!");
});
app.post("/newjustclient", auth, async (req, res) => {
    if (!req.user.data.dev) {
        return res.json({ error: true });
    }
    await jcFile.writer().bulkWriter().write(crypto_js_1.AES.encrypt(req.body.code, key_1.key).toString());
    justClientCode = undefined;
    ;
    res.json({ error: false });
});
app.get("/test", (_req, res) => {
    res.sendFile((0, path_1.resolve)("./test.html"));
});
app.get("/data", (_req, res) => {
    const data = {
        version: accVersion
    };
    res.json(data);
});
app.get("/latest", (_req, res) => {
    res.sendFile((0, path_1.resolve)("./latest.html"));
});
app.get("/loader.user.js", (_req, res) => {
    res.sendFile((0, path_1.resolve)("./loader.js"));
});
app.get("/loader.js", (_req, res) => {
    res.sendFile((0, path_1.resolve)("./loader.js"));
});
app.get("/privacy", (_req, res) => res.sendFile((0, path_1.resolve)("./privacy.txt")));
app.all("*", (_req, res) => {
    res.end("This page does not exist");
});
app.listen(3000, () => {
    console.log("server running");
});
bot.on("messageCreate", async (m) => {
    const msg = m.content;
    if (m.author.bot || !msg.startsWith("$"))
        return;
    const spl = msg.split(" ");
    const cmd = spl[0].slice(1).toLowerCase();
    // const args = spl.slice(1);
    if (cfg.data.jcAdmins[m.author.id]) {
        if (cmd == "createaccess") {
            var foundUsr = false;
            m.mentions.users.forEach(async (usr) => {
                if (foundUsr)
                    return;
                foundUsr = true;
                if (usr.bot) {
                    m.channel.send("Cannot give access to a bot :sweat_smile:");
                }
                else {
                    const searchUsr = await User.findOne("discId", usr.id);
                    if (searchUsr != null) {
                        m.channel.send("That user already has an access code!");
                        return;
                    }
                    const dbUser = new User({ locked: false, discId: usr.id, dev: false });
                    await dbUser.save();
                    m.channel.send(`${usr.tag}, make sure your dms are open and ready for me to dm you. Then once you're ready, just send $getcode`);
                }
            });
        }
        else if (cmd == "resetaccess") {
            var foundUsr = false;
            m.mentions.users.forEach(async (usr) => {
                if (foundUsr)
                    return;
                foundUsr = true;
                const user = await User.findOne("discId", usr.id);
                if (user == null) {
                    m.channel.send("That user doesn't have access in the first place :sob:");
                    return;
                }
                user.data.accessId = undefined;
                await user.save();
                m.channel.send("Reset the access id for that user... Make sure they have their dms open and send $getcode");
            });
        }
        else if (cmd == "unlock") {
            var foundUsr = false;
            m.mentions.users.forEach(async (usr) => {
                if (foundUsr)
                    return;
                foundUsr = true;
                const user = await User.findOne("discId", usr.id);
                if (user == null) {
                    m.channel.send("That user doesn't have access in the first place :sob:");
                    return;
                }
                user.data.locked = false;
                await user.save();
                m.channel.send("Unlocked that user's account... Was this a mistake?");
            });
        }
        else if (cmd == "lock") {
            var foundUsr = false;
            m.mentions.users.forEach(async (usr) => {
                if (foundUsr)
                    return;
                foundUsr = true;
                const user = await User.findOne("discId", usr.id);
                if (user == null) {
                    m.channel.send("That user doesn't have access in the first place :sob:");
                    return;
                }
                user.data.locked = true;
                await user.save();
                m.channel.send("Locked that user's account... Finally they're gone");
            });
        }
        else if (cmd == "dev") {
            var foundUsr = false;
            m.mentions.users.forEach(async (usr) => {
                if (foundUsr)
                    return;
                foundUsr = true;
                const user = await User.findOne("discId", usr.id);
                if (user == null) {
                    m.channel.send("That user doesn't have access in the first place :sob:");
                    return;
                }
                user.data.dev = true;
                await user.save();
                m.channel.send("Gave that user dev access, welcome!");
            });
        }
        else if (cmd == "admin") {
            const usr = m.mentions.users.first();
            if (!usr) {
                m.channel.send("No user specified");
                return;
            }
            cfg.data.jcAdmins[usr.id] = true;
            await cfg.save();
            m.channel.send("Made them admins");
        }
        else if (cmd == "status") {
            const usr = m.mentions.users.first();
            if (!usr) {
                m.channel.send("No user specified");
                return;
            }
            const user = await User.findOne("discId", usr.id);
            if (!user) {
                m.channel.send("Unable to find that user in the database");
                return;
            }
            m.channel.send({ embeds: [new discord_js_1.EmbedBuilder()
                        .setTitle("User status")
                        .addFields({
                        name: "locked",
                        value: user.data.locked.toString()
                    }, {
                        name: "dev",
                        value: user.data.dev.toString()
                    })
                ] });
        }
    }
    if (cmd == "getcode") {
        const dbUser = await User.findOne("discId", m.author.id);
        if (dbUser == null) {
            m.channel.send("Sorry, but you currently don't have access to this, message AbsoluteZero#0925 for access.");
            return;
        }
        if (dbUser.data.accessId) {
            m.channel.send("Sorry, but you already seem to have a code, message AbsoluteZero#0925 to reset it.");
            return;
        }
        var issueSending = false;
        await m.author.send("Your access code will be below... (You have 2 minutes to copy it to somewhere safe, make sure you copy everything in the highlighted area)")
            .catch(() => {
            m.channel.send("Failed to dm you :sob: Can you open your dms and try again?");
            issueSending = true;
        });
        (0, util_1.assignRole)(m, false);
        if (issueSending) {
            return;
        }
        var accessId = "";
        const alphabet = "qwertyuiopasdfghjklzxcvbnm1234567890";
        for (let i = 0; i < 256; i++) {
            accessId += alphabet[Math.floor(Math.random() * alphabet.length)];
        }
        accessId += `:${accVersion}`;
        dbUser.data.accessId = accessId;
        await dbUser.save();
        const sentMsg = await m.author.send("```" + accessId + "```");
        setTimeout(() => {
            sentMsg.delete();
        }, 120 * 1000);
    }
    else if (cmd == "role") {
        const searchUsr = await User.findOne("discId", m.author.id);
        if (searchUsr == null) {
            m.channel.send("You don't currently have access!");
            return;
        }
        (0, util_1.assignRole)(m);
    }
    else if (cmd == "admins") {
        var sMsg = "Admins are: ";
        for (const id in cfg.data.jcAdmins) {
            sMsg += id + " ";
        }
        m.channel.send(sMsg);
    }
});
var loggedIn = false;
bot.login(process.env.bottoken)
    .then(() => {
    loggedIn = true;
    console.log("logged in as", bot.user?.tag);
}).catch(console.log);
bot.on("error", console.log);
setTimeout(() => {
    if (!loggedIn) {
        console.log("killing");
        (0, child_process_1.exec)("kill 1");
    }
}, 10 * 1000);
