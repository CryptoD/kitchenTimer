/*
 * Kitchen Timer: Gnome Shell Kitchen Timer Extension
 * Copyright (C) 2021 Steeve McCauley
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const Lang = imports.lang
const Meta = imports.gi.Meta
const Shell = imports.gi.Shell
const Main = imports.ui.main

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Logger = Me.imports.logger.Logger;

var KeyboardShortcuts = class KeyboardShortcuts {
  constructor(settings) {
    this._grabbers = {};

    this.logger = new Logger('kt kbshortcuts', settings);

    global.display.connect('accelerator-activated', (display, action, deviceId, timestamp) => {
      this.logger.debug("Accelerator Activated: [display=%s, action=%s, deviceId=%s, timestamp=%s]",
        display, action, deviceId, timestamp)
      this._onAccelerator(action)
    });
  }

  listenFor(accelerator, callback) {
    this.logger.debug('Trying to listen for hot key [accelerator=%s]', accelerator);
    let action = global.display.grab_accelerator(accelerator, 0);

    if (action == Meta.KeyBindingAction.NONE) {
      this.logger.error('Unable to grab accelerator [%s]', accelerator);
      return;
    }

    this.logger.debug('Grabbed accelerator [action={}]', action);
    let name = Meta.external_binding_name_for_action(action);
    this.logger.debug('Received binding name for action [name=%s, action=%s]',
        name, action)

    this.logger.debug('Requesting WM to allow binding [name=%s]', name)
    Main.wm.allowKeybinding(name, Shell.ActionMode.ALL)

    this._grabbers[action]={
      name: name,
      accelerator: accelerator,
      callback: callback
    };
  }

  _onAccelerator(action) {
    let grabber = this._grabbers[action];

    if (grabber) {
      grabber.callback();
    } else {
      this.logger.debug('No listeners [action=%s]', action);
    }
  }
}

