import { App } from "./app"

async function main() {
    const app: App = new App(3001);
    await app.listen()
}

main();