#!/usr/bin/env node

import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { EOL } from 'node:os';


yargs(hideBin(process.argv))
    .commandDir('commands', {
        extensions: ['ts', 'js']
    })
    // Default command if none supplied - shows help.
    .command(
        '$0',
        'The Snip CLI usage',
        () => undefined,
        () => {
            yargs.showHelp();
        },
    )
    // Enable strict mode.
    .strict()
    // Useful aliases.
    .alias({ h: 'help' })
    // Handle failures.
    .fail(handleError).argv;



function printMessage(message: string) {
    process.stderr.write(`Error: ${message}` + EOL);
    process.stderr.write(
        `Hint: Use the
            '--help',
        option to get help about the usage` + EOL,
    );
};

async function handleError(message: string, error: Error): Promise<never> {
    if (message) {
        printMessage(message);
        process.exit(1);
    }

    printMessage(error.message);
    process.exit(1);
};