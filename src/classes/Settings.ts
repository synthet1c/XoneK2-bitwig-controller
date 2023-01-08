import {channelsString} from '../utils/constants';

export class SettingsHandler {

    constructor() {
        const preferences = host.getPreferences();
        preferences.getEnumSetting('Channel', 'Device 1 (Drum Rack Left)', channelsString, channelsString[0]);
        preferences.getEnumSetting('Channel', 'Device 2 (Drum Rack Right)', channelsString, channelsString[1]);
        preferences.getEnumSetting('Channel', 'Device 3 (Mixer Left)', channelsString, channelsString[2]);
        preferences.getEnumSetting('Channel', 'Device 4 (Mixer Right)', channelsString, channelsString[3]);
        preferences.getNumberSetting('Mixer', 'Max volume', 0, 128, 1, '', 100);
    }

}