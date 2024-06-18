// scripts/classes/UserSetting.js

(function () {
    class UserSetting {
        constructor(settingName) {
            this.settingName = settingName;
        }
    
        saveSetting(value) {
            localStorage.setItem(this.settingName, JSON.stringify(value));
        }
    
        loadSetting() {
            const storedValue = localStorage.getItem(this.settingName);
            return storedValue ? JSON.parse(storedValue) : null;
        }
    }

    window.UserSetting = UserSetting;
})();
