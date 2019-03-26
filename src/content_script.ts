import * as $ from 'jquery';
import 'chrome-extension-async';
import { SavedSettings, defaultSettings } from './types/saved-settings.type';
import { SettingsUtil } from './util/settings.util';
import { GithubUtil } from './util/github.util';

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.color) {
        console.log('Receive color cocks = ' + msg.color);
        document.body.style.backgroundColor = msg.color;
        sendResponse('Change color to ' + msg.color + ' ' + chrome.runtime.getURL('/'));
        console.log('url', chrome.runtime.getURL('/'));
    } else {
        sendResponse('Color message is none.');
    }
});

$(document).ready(async () => {
    const settings: SavedSettings = await SettingsUtil.findConfig();

    if (SettingsUtil.isRegisteredDomain(settings)) {
        setTimeout(() => {
            GithubUtil.onSelectedTab('Issues', () => {
                console.log('Yeah');
            });
            GithubUtil.onLoadEventInsideTab('Issues', () => {
                console.log('some', $('#discussion_bucket'));
                $('.issue-link').each((_, el) => {
                    const headers = new Headers();
                    headers.append('Accept', 'application/json; charset=utf-8');
                    fetch($(el).attr('href'), {
                        headers
                    }).then(async result => {
                        const jsonResult = await result.json();
                        if (jsonResult.title) {
                            $(el).text(`${$(el).text()}(${jsonResult.title})`);
                        }
                    });
                });
                console.log('fuck you');
            });
            GithubUtil.runTabEvents();
        }, 0);
    }
});