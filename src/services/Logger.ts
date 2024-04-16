import signale from 'signale';
import { singleton } from 'tsyringe';

@singleton()
export class Logger extends signale.Signale {
  constructor() {
    super({
      config: {
        uppercaseLabel: true,
        underlinePrefix: false,
        underlineLabel: false,
        displayTimestamp: true,
      },
      scope: 'BOT',
    });
  }
}
