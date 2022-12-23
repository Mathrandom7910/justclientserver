import { Message } from "discord.js";

export async function assignRole(m: Message<boolean>, msgOnFail = true) {
    const jcRoleName = "JustClient";

    var rle = m.guild!.roles.cache.find(role => role.name == jcRoleName);

    if(!rle) {
        try {
            rle = await m.guild?.roles.create({
                    name: jcRoleName,
                    color: "#b2cc66"
            });
        } catch(e) {
            m.channel.send("Unable to create JustClient role!");
        }
    }

    if(m.member?.roles.cache.some(role => role.name == jcRoleName)) {
        if(msgOnFail) m.channel.send("You already have that role!");
        return;
    }

    if(rle) {
        await m.member?.roles.add(rle);
    } else {
        m.channel.send("Failed to give you your role!")
        return;
    }

    m.channel.send("Gave you your role!");
}
