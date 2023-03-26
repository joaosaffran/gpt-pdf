#!/usr/bin/env node

import yargs from "yargs"

yargs(hideBin(process.argv))
    .commandDir('commands')
    .strict()
    .alias({
        h: 'help',
        r: 'reason'
    })
    .argv





function hideBin(argv: string[]): string | readonly string[] | undefined {
    throw new Error("Function not implemented.");
}
// new Program()
//     .loadChatFile(Options.chat)
//     .then((prog) => prog.loadPrompFile(Options.prompts))
//     .then((prog) => prog.loadPdfDocument(Options.file))
//     .then((prog) => prog.loadPdfFileContent())
//     .then((prog) => prog.replacePromptsTemplates())
//     .then((prog) => prog.loadChatIntoPrompt())
//     .then((prog) => prog.getChatGptResponse())
//     .then((prog) => prog.saveNewChatFile(Options.chat))
//     .then((prog) => prog.printState())