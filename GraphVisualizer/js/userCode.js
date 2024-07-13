import { Sync } from "./sync.js";
import { console } from "./main.js";

export class UserCode extends Sync {

    async myCustomCode() {
        console.out('Running your custom code 1!');
        await this.step();
        console.out('Running your custom code 2!');
        await this.step();
        console.out('Running your custom code final!');
        this.done();
    }
}