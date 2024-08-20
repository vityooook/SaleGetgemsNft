/// <reference types="node" />
import { Builder, Cell } from "@ton/core";
export type SendArgsSigned = {
    secretKey: Buffer;
};
export type SendArgsSignable = {
    signer: (message: Cell) => Promise<Buffer>;
};
export declare function signPayload<T extends SendArgsSigned | SendArgsSignable>(args: T, signingMessage: Builder, packMessage: (signature: Buffer, signingMessage: Builder) => Cell): T extends SendArgsSignable ? Promise<Cell> : Cell;
