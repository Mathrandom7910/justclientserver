# Little-DB

A small, simple local and typed database written in typescript for node.js.

Install with `npm i @Mathrandom7910/little-db`

Javascript example:
```js
    // Import the package
    const { init } = require("@mathrandom7910/little-db");
    // Get entry function
    const { entry } = init();
    // Create a user entry and get the user class, with (optional) default data
    const User = entry("user", {
        info: {
            age: 23
        }
    });

    (async function() {
        // Find a user with the given property string
        const user = await User.findOne("info.age", 25);
        console.log(user);

        // Edit properties and save
        user.data.info.age = 20;
        user.save();

        // Finds a user with the `userName` of joe
        const userJoe = await User.findOne("userName", "joe");
        console.log(user);

        // Find all users that are 25 years old
        const users = await User.find("info.age", 25);
        console.log(users);

        // Get every user in the entries
        const allUsers = await User.all();
        console.log(allUsers);

        // Iterate over the entries
        await User.iter((user, cancelFn) => {
            if(user.data.userName == "joe") {
                // We found joe! Now we can cancel itering over the entries.
                cancelFn();
            }
        });
    })();
```

TypeScript example:
```ts
import { init } from "@mathrandom7910/little-db"
    // Get entry function
    const { entry } = init();

    interface IUser {
        name: string;
        age: number
    }

    // Create a user entry and get the user class, with (optional) default data
    const User = entry<IUser>("user");
```