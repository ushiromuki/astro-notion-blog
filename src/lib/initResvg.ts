import { initWasm } from "@resvg/resvg-wasm";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

let initialized = false;

export const initResvg = async () => {
    if (initialized) {
        return;
    }
    initialized = true;

    await initWasm(
        readFile(
            join(process.cwd(), "node_modules/@resvg/resvg-wasm/index_bg.wasm")
        )
    );
};
// 参考　https://blog.sus-happy.net/astrojs-ssr/