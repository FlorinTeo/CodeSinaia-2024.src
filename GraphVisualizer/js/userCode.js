import { CoreCode } from "./core/coreCode.js";
import { console } from "./main.js";

export class UserCode extends CoreCode {

    async run() {
        console.out("Start custom code!")
        await this.step();
        for(let i = 1; i <= 4; i++) {
            console.out(`step ${i}`);
            await this.step();
        }
        console.out('Done!');
    }
}
