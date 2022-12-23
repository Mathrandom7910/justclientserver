import e, { Request, Response, json, urlencoded, NextFunction } from "express";
import { init } from "@mathrandom7910/little-db";
import { resolve } from "path";
import { EncryptionParser } from "./parser";
import { config } from "dotenv";
import { Client, EmbedBuilder, GatewayIntentBits } from "discord.js";
import { FileClass } from "filec";
import { AES, enc } from "crypto-js";
import { key } from "./key";
import os from "os";
import { assignRole } from "./util";
import { DBConfig } from "@mathrandom7910/little-db/build/dbconfig";
import { exec } from "child_process";

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

const accVersion = "0.0.0";

if (os.platform() == "win32") config();
const app = e();
var isReady = false;
const hashSeed = parseInt(process.env.seed || "0");


var justClientCode: string | undefined;

app.use(urlencoded({ extended: true }));
app.use(json());

interface ConfigData {
    jcAdmins: Record<string, boolean>,
    logChannelId: string | undefined
}

const db = init<ConfigData>({
    parser: new EncryptionParser()
});

var cfg: DBConfig<ConfigData>;

db.on("ready", async () => {
    isReady = true;

    cfg = await db.config({ jcAdmins: { "846173524469219358": true } });
});

export interface UserDB {
    ipHash?: number,
    accessId?: string,
    locked: boolean,
    discId: string,
    dev: boolean
}

interface AuthBody {
    accessId: string
}

const User = db.entry<UserDB>("users");


declare global {
    namespace Express {
        interface Request {
            user: InstanceType<typeof User>
        }
    }
}

app.use(function (_req, res, next) {

    res.setHeader("Access-Control-Allow-Origin", "*");

    res.setHeader("Access-Control-Allow-Methods", "GET, POST");

    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");

    // res.setHeader("Access-Control-Allow-Credentials", true);

    next();
});

function hash(str: string) {
    let h1 = 0xdeadbeef ^ hashSeed,
        h2 = 0x41c6ce57 ^ hashSeed;

    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }

    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

async function auth(req: Request, res: Response, next: NextFunction) {
    if (!isReady) return;

    const tmpIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "127.0.0.1";
    const ip = tmpIp instanceof Array ? tmpIp[0] : tmpIp;

    const body: AuthBody = req.body;
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

    req.user = user as any;
    next();
}

app.post("/auth", auth as any, (_req, res) => {
    res.json({
        error: false
    }).end();
});

const jcFile = new FileClass("./justclient_js");

app.post("/justclient", auth as any, async (_req, res) => {
    if (!justClientCode) {
        res.end("onbeforeunload = null;setTimeout(() => {location.reload()}, 500);");
        const txt = await jcFile.reader().read("utf8");

        justClientCode = AES.decrypt(txt, key).toString(enc.Utf8);
        
        return;
    }
    
    // res.setHeader("con")
    res.end(justClientCode);
});

app.get("/", (_req, res) => {
    res.end("Hello World!");
});

app.post("/newjustclient", auth as any, async (req, res) => {
    if (!req.user.data.dev) {
        return res.json({ error: true });
    }

    await jcFile.writer().bulkWriter().write(AES.encrypt(req.body.code, key).toString());
    justClientCode = undefined;;
    res.json({ error: false });
});

app.get("/test", (_req, res) => {
    res.sendFile(resolve("./test.html"));
});

interface IData {
    version: string
}

app.get("/data", (_req, res) => {
    const data: IData = {
        version: accVersion
    }

    res.json(data);
});

app.get("/latest", (_req, res) => {
    res.sendFile(resolve("./latest.html"));
});

app.get("/loader.user.js", (_req, res) => {
    res.sendFile(resolve("./loader.js"));
});

app.get("/loader.js", (_req, res) => {
    res.sendFile(resolve("./loader.js"));
});

app.get("/privacy", (_req, res) => res.sendFile(resolve("./privacy.txt")));

app.all("*", (_req, res) => {
    res.end("This page does not exist");
});

app.listen(3000, () => {
    console.log("server running");
});

bot.on("messageCreate", async (m) => {
    const msg = m.content;
    if (m.author.bot || !msg.startsWith("$")) return;

    const spl = msg.split(" ");
    const cmd = spl[0].slice(1).toLowerCase();
    // const args = spl.slice(1);

    if (cfg.data.jcAdmins[m.author.id]) {
        if (cmd == "createaccess") {
            var foundUsr = false;
            m.mentions.users.forEach(async usr => {
                if (foundUsr) return;
                foundUsr = true;

                if (usr.bot) {
                    m.channel.send("Cannot give access to a bot :sweat_smile:");
                } else {
                    const searchUsr = await User.findOne("discId", usr.id);

                    if (searchUsr != null) {
                        m.channel.send("That user already has an access code!");
                        return;
                    }

                    const dbUser = new User({ locked: false, discId: usr.id, dev: false });
                    await dbUser.save();

                    m.channel.send(`${usr.tag}, make sure your dms are open and ready for me to dm you. Then once you're ready, just send $getcode here.`);

                }
            });
        } else if (cmd == "resetaccess") {
            var foundUsr = false;
            m.mentions.users.forEach(async usr => {
                if (foundUsr) return;
                foundUsr = true;

                const user = await User.findOne("discId", usr.id);

                if (user == null) {
                    m.channel.send("That user doesn't have access in the first place :sob:");
                    return;
                }

                user.data.accessId = undefined;

                await user.save();

                m.channel.send("Reset the access id for that user... Make sure they have their dms open and send $getcode")
            });
        } else if (cmd == "unlock") {
            var foundUsr = false;
            m.mentions.users.forEach(async usr => {
                if (foundUsr) return;
                foundUsr = true;

                const user = await User.findOne("discId", usr.id);

                if (user == null) {
                    m.channel.send("That user doesn't have access in the first place :sob:");
                    return;
                }


                user.data.locked = false;

                await user.save();

                m.channel.send("Unlocked that user's account... Was this a mistake?")
            });
        } else if (cmd == "lock") {
            var foundUsr = false;
            m.mentions.users.forEach(async usr => {
                if (foundUsr) return;
                foundUsr = true;

                const user = await User.findOne("discId", usr.id);

                if (user == null) {
                    m.channel.send("That user doesn't have access in the first place :sob:");
                    return;
                }


                user.data.locked = true;

                await user.save();

                m.channel.send("Locked that user's account... Finally they're gone")
            });
        } else if (cmd == "dev") {
            var foundUsr = false;
            m.mentions.users.forEach(async usr => {
                if (foundUsr) return;
                foundUsr = true;

                const user = await User.findOne("discId", usr.id);

                if (user == null) {
                    m.channel.send("That user doesn't have access in the first place :sob:");
                    return;
                }


                user.data.dev = true;

                await user.save();

                m.channel.send("Gave that user dev access, welcome!")
            });
        } else if (cmd == "admin") {
            const usr = m.mentions.users.first();
            if(!usr) {
                m.channel.send("No user specified");
                return;
            }
            cfg.data.jcAdmins[usr.id] = true;
            await cfg.save();
            m.channel.send("Made them admins");
        } else if (cmd == "status") {
            const usr = m.mentions.users.first();
            if(!usr) {
                m.channel.send("No user specified");
                return;
            }

            const user = await User.findOne("discId", usr.id);

            if(!user) {
                m.channel.send("Unable to find that user in the database");
                return;
            }

            m.channel.send({embeds: [new EmbedBuilder()
            .setTitle("User status")
        .addFields({
            name: "locked",
            value: user.data.locked.toString()
        },
        {
            name: "dev",
            value: user.data.dev.toString()
        })
    ]});
        } else if(cmd == "log") {
            cfg.data.logChannelId = m.channelId;

            await cfg.save();

            m.channel.send("Set this channel as default logging channel");
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

        assignRole(m, false);

        if (issueSending) {
            return;
        }

        var accessId = "";

        const alphabet = "qwertyuiopasdfghjklzxcvbnm1234567890";

        for (let i = 0; i < 256; i++) {
            accessId += alphabet[Math.floor(Math.random() * alphabet.length)];
        }

        accessId += `:${accVersion}`

        dbUser.data.accessId = accessId;

        await dbUser.save();

        const sentMsg = await m.author.send("```" + accessId + "```");

        setTimeout(() => {
            sentMsg.delete();
        }, 120 * 1000);
    } else if (cmd == "role") {
        const searchUsr = await User.findOne("discId", m.author.id);

        if (searchUsr == null) {
            m.channel.send("You don't currently have access!");
            return;
        }

        assignRole(m);
    } else if (cmd == "admins") {
        var sMsg = "Admins are: ";

        for(const id in cfg.data.jcAdmins) {
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
    if(!loggedIn) {
        console.log("killing");
        exec("kill 1");
    }
}, 10 * 1000);