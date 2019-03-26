export class UrlChangeHelper {
    private static readonly _EVENT_NAME = 'github-issue-url-change-event';

    private static _fireEvent(data: { [key: string]: any }): void {
        document.dispatchEvent(new Event(this._EVENT_NAME, data));
    }

    private isListening = false;
    private oldHref = location.href;

    public constructor(private _delay: number = 50) {
        this._startListening();
    }

    public addListener(action: EventListenerOrEventListenerObject): void {
        document.addEventListener(UrlChangeHelper._EVENT_NAME, action);
    }

    private _startListening(): void {
        if (!this.isListening) {
            this.isListening = true;
            setInterval(() => {
                if (this.oldHref !== location.href) {
                    const eventData = {
                        oldHref: this.oldHref,
                        newHref: location.href
                    };
                    this.oldHref = location.href;
                    UrlChangeHelper._fireEvent(eventData);
                }
            }, this._delay);
        }
    }
}