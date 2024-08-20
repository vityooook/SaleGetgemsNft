/**
 * Copyright (c) Whales Corp.
 * All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/// <reference types="node" />
import { Builder, Cell, MessageRelaxed, OutActionSendMsg } from "@ton/core";
import { Maybe } from "../../utils/maybe";
import { WalletV5BetaPackedCell, WalletV5BetaSendArgs, WalletV5BetaSendArgsExtensionAuth } from "../v5beta/WalletContractV5Beta";
import { Wallet4SendArgsSignable, Wallet4SendArgsSigned } from "../WalletContractV4";
import { WalletV3SendArgsSignable, WalletV3SendArgsSigned } from "../WalletContractV3Types";
import { OutActionExtended } from "../v5beta/WalletV5OutActions";
import { Wallet5VR1SendArgsExtensionAuth, WalletV5R1PackedCell, WalletV5R1SendArgs } from "../v5r1/WalletContractV5R1";
export declare function createWalletTransferV1(args: {
    seqno: number;
    sendMode: number;
    message: Maybe<MessageRelaxed>;
    secretKey: Buffer;
}): Cell;
export declare function createWalletTransferV2(args: {
    seqno: number;
    sendMode: number;
    messages: MessageRelaxed[];
    secretKey: Buffer;
    timeout?: Maybe<number>;
}): Cell;
export declare function createWalletTransferV3<T extends WalletV3SendArgsSignable | WalletV3SendArgsSigned>(args: T & {
    sendMode: number;
    walletId: number;
}): T extends WalletV3SendArgsSignable ? Promise<Cell> : Cell;
export declare function createWalletTransferV4<T extends Wallet4SendArgsSignable | Wallet4SendArgsSigned>(args: T & {
    sendMode: number;
    walletId: number;
}): T extends Wallet4SendArgsSignable ? Promise<Cell> : Cell;
export declare function createWalletTransferV5Beta<T extends WalletV5BetaSendArgs>(args: T extends WalletV5BetaSendArgsExtensionAuth ? T & {
    actions: (OutActionSendMsg | OutActionExtended)[];
} : T & {
    actions: (OutActionSendMsg | OutActionExtended)[];
    walletId: (builder: Builder) => void;
}): WalletV5BetaPackedCell<T>;
export declare function createWalletTransferV5R1<T extends WalletV5R1SendArgs>(args: T extends Wallet5VR1SendArgsExtensionAuth ? T & {
    actions: (OutActionSendMsg | OutActionExtended)[];
} : T & {
    actions: (OutActionSendMsg | OutActionExtended)[];
    walletId: (builder: Builder) => void;
}): WalletV5R1PackedCell<T>;
