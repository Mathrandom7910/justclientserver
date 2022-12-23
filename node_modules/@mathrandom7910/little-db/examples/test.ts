// import { AES, enc } from "crypto-js";
import { init } from "../src/index";

interface UserData {
    userName: string,
    info: {
        age: number,
        height: number
    }
}

// class EncryptionParser implements AbstractParser {
//     toStorage(data: {}): string | Buffer {
//         return AES.encrypt(JSON.stringify(data), "testkey").toString();
//     }

//     fromStorage(data: string | Buffer): {} {
//         if(typeof data != "string") {
//             data = data.toString("utf-8");
//         }

//         return JSON.parse(AES.decrypt(data, "testkey").toString(enc.Utf8));
//     }
// }

interface ConfigData {
    someConf: string,
    confBool: boolean
}

async function begin() {
    // console.log("b");
    const res = init<ConfigData>();
    await res.wait("ready");

    const cfg = await res.config({someConf: "a diff str"});

    console.log(cfg.data);

    cfg.data.someConf = "hello";
    cfg.data.confBool = false;
    // cfg
    await cfg.save();



    const User = res.entry<UserData>("user");
    console.log("finding user")
    const user = (await User.findOne("userName", "joe1"));
    console.log("found", user);
    if(user == null) {
        const newUser = new User();

        newUser.data.userName = "joe1";
        newUser.save();
        // newUser.delete();
        return;
    }

    user.data.info ??= {} as any;

    user.data.info.age = 22;
    console.log("saving user")
    await user.save();
}

begin().then(() => {
    console.log("done")
})
