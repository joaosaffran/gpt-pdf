import type { Arguments, CommandBuilder } from "yargs";
import { getPdfDocumentContentAsync } from "../clients/pdf-client";
import { loadChatState, loadPromptsState } from "../libs/gpt-state";

//ToDo: remove this dependency
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import { replacePlaceholdersInPrompt } from "../libs/prompt";

function makeId(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

type Options = {
    chat: string,
    url: boolean,
    file: string,
    prompt: string
}


export const command = 'reason <file> <prompt>'
export const desc: string = 'Reason about a PDF file'

export const builder: CommandBuilder<Options, Options> = (yargs) =>
    yargs
        .options({
            chat: {
                alias: 'c',
                type: 'string',
                demandOption: false,
                default: `${makeId(8)}.gpt.json`,
                desc: 'The chat history file you wanna continue'
            },
            url: {
                type: 'boolean',
                desc: 'consider file an url',
                default: false
            }
        })
        .positional('file', { alias: 'f', type: 'string', demandOption: true })
        .positional('prompt', { alias: 'f', type: 'string', default: 'prompts.gpt.json', demandOption: false })


export const handler = async (argv: Arguments<Options>) => {
    const { chat: chatFilepath, url: useUrl, file: filepath, prompt: promptFilepath } = argv

    const prompt = loadPromptsState(promptFilepath)
    const chat = loadChatState(chatFilepath)

    let content: string = filepath
    if (!useUrl) {
        const pdfFile = await pdfjsLib.getDocument({ url: filepath, password: "" }).promise
        content = await getPdfDocumentContentAsync(pdfFile)
    }

    prompt.messages.map(
        (message) =>
        ({
            ...message,
            content: replacePlaceholdersInPrompt(message.content, { content })
        })
    )
}
