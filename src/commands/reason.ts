import type { Arguments, CommandBuilder } from "yargs";
import { getPdfDocumentContentAsync } from "../clients/pdf-client";
import { loadChatState, loadPromptsState, saveChatState } from "../libs/gpt-state";
//ToDo: remove this dependency
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import { replacePlaceholdersInPrompt } from "../libs/prompt";
import { getGptResponseAsync } from "../clients/gpt-client";

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
    prompt: string,
    apiKey?: string
}


export const command = 'reason <file> [prompt]'
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
            },
            apiKey: {
                type: 'string',
                desc: 'Open AI API Key',
                demandOption: false
            }
        })
        .positional('file', { type: 'string', demandOption: true })
        .positional('prompt', { type: 'string', default: 'prompts.gpt.json', demandOption: false })


export const handler = async (argv: Arguments<Options>) => {
    const { chat: chatFilepath, url: useUrl, file: filepath, prompt: promptFilepath, apiKey } = argv

    let gptApiKey = apiKey
    if (gptApiKey === undefined) {
        gptApiKey = process.env.OPENAI_API_KEY;
        if (gptApiKey === undefined)
            throw new Error("'OPENAI_API_KEY' environment variable is not defined")
    }

    const prompt = loadPromptsState(promptFilepath)
    const chat = loadChatState(chatFilepath)

    let content: string = filepath
    if (!useUrl) {
        const pdfFile = await pdfjsLib.getDocument({ url: filepath, password: "" }).promise
        content = await getPdfDocumentContentAsync(pdfFile)
    }

    prompt.messages = prompt.messages.map(
        (message) =>
        ({
            ...message,
            content: replacePlaceholdersInPrompt(message.content, { content })
        })
    )

    prompt.messages = [...chat.messages, ...prompt.messages]

    const gptResponse = await getGptResponseAsync(prompt, gptApiKey)

    prompt.messages = [...prompt.messages, ...gptResponse]

    prompt.messages.forEach((message) => {
        console.log(`>>> ${message.role}:\n${message.content}\n`)
    })

    saveChatState(prompt, chatFilepath)
}
