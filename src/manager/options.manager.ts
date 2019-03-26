import 'chrome-extension-async';
import * as $ from 'jquery';

import { SavedSettings, defaultSettings } from '../types/saved-settings.type';
import { SettingsUtil } from '../util/settings.util';

export class OptionsManager {

    public constructor(private _containerDiv: HTMLDivElement) { }

    public async appendDomains(): Promise<void> {
        const ulRoot = $('<ul>');
        const options = await SettingsUtil.findConfig();
        const liElements = [];
        options.domains.forEach(current => {
            const inputEl: JQuery<HTMLInputElement> = $('<input class="domain-input">');
            const saveBtn: JQuery<HTMLButtonElement> = $('<button class="save-btn" disabled>Save changes</button>');
            const deleteBtn: JQuery = $('<button clas       s="delete-btn">Delete</button>');
            liElements.push(
                $('<li>').append(
                    inputEl
                        .val(current)
                        .on('change keyup', () => this._handleOnChange(inputEl))
                        .attr('original-value', current),
                    saveBtn
                        .click(() => this._handleClickSave(saveBtn)),
                    deleteBtn
                        .click(() => this._handleClickDelete(deleteBtn))
                )
            );
        });
        ulRoot.append(liElements);
        $(this._containerDiv).append(ulRoot);
    }

    public listenAddDomain(inputText: HTMLInputElement, actionButton: HTMLButtonElement): void {
        actionButton.onclick = async () => {
            actionButton.disabled = true;
            const options: SavedSettings = await SettingsUtil.findConfig();
            if (!options.domains.some(current => current === inputText.value)) {
                options.domains.push(inputText.value);
                await SettingsUtil.saveConfig(options);
                this._clearContainer();
                await this.appendDomains();
                actionButton.disabled = false;
            }
        };
    }

    private _clearContainer(): void {
        this._containerDiv.innerText = '';
    }

    private async _recreateContainer(): Promise<void> {
        this._clearContainer();
        await this.appendDomains();
    }
    private _handleOnChange(element: JQuery<HTMLInputElement>): void {
        const saveBtn = element.parent().find('.save-btn');
        if (element.attr('original-value') === element.val()) {
            saveBtn.attr('disabled', 'disabled');
        } else {
            saveBtn.removeAttr('disabled');
        }
    }

    private async _handleClickSave(invoker: JQuery<HTMLButtonElement>): Promise<void> {
        const textInput: JQuery = invoker.parent().find('.domain-input');
        invoker.attr('disabled', 'disabled');
        const oldValue: string = textInput.attr('original-value');
        const newValue: string = <any>textInput.val();
        if (oldValue !== newValue) {
            const settings = await SettingsUtil.findConfig();
            settings.domains = settings.domains.filter(current => current !== oldValue);
            settings.domains.push(newValue);
            await SettingsUtil.saveConfig(settings);
            textInput.attr('original-value', newValue);
            await this._recreateContainer();
        }
        invoker.removeAttr('disabled');
    }

    private async _handleClickDelete(deleteBtn: JQuery): Promise<void> {
        const settings = await SettingsUtil.findConfig();
        settings.domains = settings.domains.filter(current => current !== $(deleteBtn).parent().find('.domain-input').attr('original-value'));
        SettingsUtil.saveConfig(settings);
        this._recreateContainer();
    }
}
