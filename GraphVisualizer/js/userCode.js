import { CoreCode } from "./coreCode.js";
import { console } from "./main.js";

export class UserCode extends CoreCode {

    async myCustomCode() {
        console.out('Running your custom code 1!');
        await this.step();
        console.out('Running your custom code 2!');
        await this.step();
        console.out('Running your custom code final!');
        this.done();
    }
}