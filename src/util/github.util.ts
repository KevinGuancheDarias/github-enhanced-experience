import * as $ from 'jquery';
import { UrlChangeHelper } from '../helper/url-change.helper';
import { ParsedRoute } from '../types/parsed-route.type';

type validTabs = 'Code' | 'Issues';

interface ValidSections {
    code: string;
    issues: string,
    pulls: string,
    projects: string,
    wiki: string,
    pulse: string
}

interface tabAction {
    (normalizedName: string, element: HTMLElement): void;
}

export abstract class GithubUtil {
    private static readonly _SECTIONS_MAP: ValidSections = {
        code: 'code',
        issues: 'Issues',
        pulls: 'Pull requests',
        projects: 'Projects',
        wiki: 'Wiki',
        pulse: 'Insights'
    };

    private static _domChange = false;
    private static _tabSelectionActions: { [key: string]: tabAction } = {};
    private static _tabOnLoadActions: { [key: string]: tabAction } = {};
    private static _urlChangeHelper: UrlChangeHelper = new UrlChangeHelper();

    public static findSelectedRepoMenu(): string {
        const el: HTMLAnchorElement = this._findSelectedMenuItem();
        return el && this._normalizeMenuTabString(el.innerText);
    }

    public static findParsedRoute(route: string = location.href): ParsedRoute {
        const routeParts: string[] = route.split('/');
        return {
            owner: routeParts[3],
            repository: routeParts[4],
            section: routeParts[5],
            id: routeParts[6]
        };
    }

    public static isIssuesPage(): boolean {
        return this.findSelectedRepoMenu() === 'Issues';
    }

    public static onSelectedTab(name: validTabs, action: tabAction) {
        this._addListenerIfRequired();
        this._tabSelectionActions[name] = action;
    }

    public static onLoadEventInsideTab(name: validTabs, action: tabAction) {
        this._addListenerIfRequired();
        this._tabOnLoadActions[name] = action;
    }


    /**
     *
     *
     * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
     * @since 1.0.0
     * @static
     * @param {...string[]} tabs 
     * @memberof GithubUtil
     */
    public static runTabEvents(...tabs: string[]): void {
        if (tabs.length) {
            tabs.forEach(tab => {
                this._tabSelectionActions[tab](tab, null);
                this._tabOnLoadActions[tab](tab, null);
            });
        } else {
            const tab: string = this.findSelectedRepoMenu();
            this._tabSelectionActions[tab](tab, null);
            this._tabOnLoadActions[tab](tab, null);
        }
    }

    private static _addListenerIfRequired(): void {
        if (!GithubUtil._domChange) {
            this._urlChangeHelper.addListener(async () => {
                console.log('event');
                if (!$('nav.reponav').attr('issue-title-preload-events')) {
                    this._addTabMenuClickEventHandler();
                }
                await this._waitForTabLoad();
                console.log('Oliii');
                const runAction: tabAction = this._tabOnLoadActions[this.findSelectedRepoMenu()];
                runAction && runAction(this.findSelectedRepoMenu(), this._findSelectedMenuItem());
                $('nav.reponav').attr('issue-title-preload-events', 'true');
            });
            GithubUtil._domChange = true;
        }
    }

    private static _normalizeMenuTabString(menuText: string): string {
        const trimmedText: string = menuText.trim();
        if (menuText.match(/[0-9]$/)) {
            return trimmedText.substring(0, trimmedText.lastIndexOf(' '));
        } else {
            return trimmedText;
        }
    }

    private static _addTabMenuClickEventHandler(): void {
        $('nav.reponav a').click(function () {
            const normalizedName = GithubUtil._normalizeMenuTabString(this.innerText);
            const action = GithubUtil._tabSelectionActions[normalizedName];
            action && action(normalizedName, this);

        });
    }

    private static _findSelectedMenuItem(): HTMLAnchorElement {
        return document.querySelector('nav.reponav a.selected')
    }

    private static _waitForTabLoad(): Promise<void> {
        return new Promise(resolve => {
            const intervalId = setInterval(() => {
                const route: ParsedRoute = this.findParsedRoute();
                if (!route.section || this._SECTIONS_MAP[route.section] === this.findSelectedRepoMenu()) {
                    clearInterval(intervalId);
                    document.addEventListener('DOMSubtreeModified', function listener() {
                        document.removeEventListener('DOMSubtreeModified', listener, false);
                        resolve();
                    });
                }
            }, 100);
        });
    }

    private constructor() { }
}
