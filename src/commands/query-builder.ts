import { CommandFn } from './command';
import { THING_TYPE } from '../thing-type';
import * as db from '../db';

interface Config {
    top: boolean
    bottom: boolean
    [flag: string]: boolean
}

function parseFlags(flags: string[]) {
    let config: Config = {
        top: false,
        bottom: false
    };

    for (let flag of flags) {
        if (flag[0] === ':') {
            flag = flag.substr(1);
        }

        config[flag] = true;
    }

    return config;
}

export function commandBuilder(label: string, thingType: THING_TYPE): CommandFn {
    return async (flags, req, res) => {
        const config = parseFlags(flags);
        let result: db.KarmaRecord[];
        let message = `The ${label} with the `;

        if ((config.bottom && config.top) || (!config.bottom && !config.top)) {
            res.send('You must specify :top or :bottom.');
            return;
        }

        if (config.bottom) {
            message += 'least';
            result = await db.getBottom(thingType);
        } else {
            message += 'most';
            result = await db.getTop(thingType);
        }

        message += ' karma:';

        res.json({
            response_type: 'ephemeral', // only visible to user
            text: message,
            attachments: [{
                text: result.map(record => `${record.karma}  ${record.thing}`).join('\n')
            }]
        });
    };
}

export default commandBuilder;