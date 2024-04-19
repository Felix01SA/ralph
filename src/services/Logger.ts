import ora from 'ora';
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

  private spinner = ora();

  public startSpinner(text: string) {
    this.spinner.start(text);
  }

  public stopSpinner(text?: string, error?: boolean) {
    if (error) {
      this.spinner.stop();
    } else this.spinner.stop().succeed(text);
  }
}
