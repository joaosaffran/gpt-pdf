import * as yargs from "yargs"
import { makeId } from "./utils"

export const Options = yargs.options({
    file: {
        alias: "f",
        type: "string",
        demandOption: true,
        description: "The file to reason about"
    },
    prompts: {
        alias: "p",
        type: "string",
        demandOption: false,
        default: "promps.cli.json",
        description: "The prompts to run agains chatgpt"
    },
    chat: {
        alias: "c",
        type: "string",
        demandOption: false,
        default: `${makeId(8)}.chat.json`,
        description: "The chat history file you wanna continue"
    }
}).argv as OptionsType


export type OptionsType = {
    file: string,
    prompts: string,
    chat: string
}