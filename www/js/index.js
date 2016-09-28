var app = {
    // Application Constructor
    initialize: function() {

        this.bindEvents();
        this.loadSettings();
        this.loadPreviousEntries();
    },
    saveSettings: function(key, value){
      app.log("Saving settings...");
      app.saveSetting('APP_ID', $("#settingsAppID").val());
      app.saveSetting('SDK_API_KEY', $("#settingsAPIKey").val());
      app.saveSetting('SECURE_SECRET_KEY', $("#settingsSecureMode").val());
      app.saveSetting('GCM_SENDER_ID', $("#settingsGCM").val());
    },
    saveSetting: function(key, value){
      var storage = window.localStorage;
      storage.setItem(key, value||"");
    },
    getSecret: function(){
      return app.getSetting('SECURE_SECRET_KEY');
    },
    getGCMSenderID: function(){
      return app.getSetting('GCM_SENDER_ID');
    },
    loadSettings: function(){
      app.loadSetting('settingsAppID', 'APP_ID');
      app.loadSetting('settingsAPIKey', 'SDK_API_KEY');
      app.loadSetting('settingsSecureMode', 'SECURE_SECRET_KEY');
      app.loadSetting('settingsGCM', 'GCM_SENDER_ID');
    },
    loadPreviousEntries: function(){
      app.loadSetting('email', 'LAST_email');
      app.loadSetting('userid', 'LAST_userid');
      app.loadSetting('name', 'LAST_name');
      app.loadSetting('customDataName', 'LAST_customDataName');
      app.loadSetting('customDataValue', 'LAST_customDataValue');
      app.loadSetting('customDataType', 'LAST_customDataType', true);
      app.loadSetting('eventName', 'LAST_eventName');
      app.loadSetting('eventMetadataName', 'LAST_eventMetadataName');
      app.loadSetting('eventMetadataValue', 'LAST_eventMetadataValue');
    },
    getSetting: function(key){
      var storage = window.localStorage;
      return storage.getItem(key) || "";
    },
    loadSetting: function(elementID, key,radio){
      var value = app.getSetting(key);
      if(!radio)
        $("#" + elementID).val(value);
      else{
        $("[name="+elementID+"][value='" + value + "']").prop('checked', true);
      }
    },
    getEmail: function(){
      return $("#email").val();
    },
    getUserId: function(){
      return $("#userid").val();
    },
    getName: function(){
      return $("#name").val();
    },
    getAttributeName: function(){
      return $("#customDataName").val();
    },
    getAttributeValue: function(){
      return $("#customDataValue").val();
    },
    getAttributeType: function(){
      return $("[name=customDataType]:checked").val() || "";
    },
    getAttributeData: function(){
      var data = {};
      var type = app.getAttributeType();;
      var val = app.getAttributeValue();
      var name = app.getAttributeName();
      if(type == "standard"){
        data[name] = val;
      }
      else{
        data.custom_attributes = {};
        data.custom_attributes[name] = val;
      }
      return data;
    },
    getEventName: function(){
      return $("#eventName").val();
    },
    getEventMetadataName: function(){
      return $("#eventMetadataName").val();
    },
    getEventMetadataValue: function(){
      return $("#eventMetadataValue").val();
    },
    getEventData: function(){
      var data = {
        name: app.getEventName(),
        metadata: {}
      }
      var name = app.getEventMetadataName();
      if(name){
        data.metadata[name] = app.getEventMetadataValue();;
      }
      return data;
    },
    getHashData: function(){
      return app.getUserId() || app.getEmail();
    },
    getHash: function(data){
      // Get hash from the server
      // This should NEVER be calculated client side as exposing your SECRET KEY is a security issue

      // This is calculated client side so it is easier for testing and debugging
      return HMAC_SHA256_MAC(app.getSecret(), data);
    },
    logout: function(){
      app.log("logout");
      intercom.reset(app.callbackSuccess, app.callbackFail);
    },
    loginUnidentified: function(){
      app.log("login unidentified")
      intercom.registerUnidentifiedUser({}, app.callbackSuccess, app.callbackFail);
    },
    login: function(){
      app.log("login identified");
      var data = {email: app.getEmail()};
      if(app.getUserId()){
        data['userId'] = app.getUserId();
      }
      if(app.getName()){
        data['name'] = app.getName();
      }
      var hashData = app.getHashData();
      var hash = app.getHash(hashData);


      app.saveSetting('LAST_email',data.email);
      app.saveSetting('LAST_userid',data.userId);
      app.saveSetting('LAST_name',data.name);
      app.log("login data", data);
      app.log("login hash = " + hash + ", data = " + hashData);
      intercom.setSecureMode(hash, hashData, function(d){
        app.log("login secure success = " + d);
        intercom.registerIdentifiedUser(data, function(d1){
          app.log("login registered success = " + d1);
            var gcm = app.getGCMSenderID();
            if(gcm){
              intercom.registerForPush(gcm, function(d2){ app.log("GCM registered" , d2);}, app.callbackFail);
            }
            else{
              intercom.registerForPush(     function(d2){ app.log("Push registered", d2);}, app.callbackFail);
            }
        }, app.callbackFail);
      }, app.callbackFail);
    },
    callbackSuccess: function(err){
      app.log("Success: ", err);
    },
    callbackFail: function(err){
      app.log("Fail: ", err);
    },
    submitEvent: function(){
      var eventData = app.getEventData();
      app.log("submit event: " + eventData.name, eventData.metadata);
      app.saveSetting('LAST_eventName', app.getEventName());
      app.saveSetting('LAST_eventMetadataName', app.getEventMetadataName());
      app.saveSetting('LAST_eventMetadataValue', app.getEventMetadataValue());
      intercom.logEvent(eventData.name, eventData.metadata, app.callbackSuccess, app.callbackFail);
    },
    updateAttribute: function(){
      var data = app.getAttributeData();
      app.log("updateAttribute", data);

      app.saveSetting('LAST_customDataName', app.getAttributeName());
      app.saveSetting('LAST_customDataValue', app.getAttributeValue());
      app.saveSetting('LAST_customDataType', app.getAttributeType());
      intercom.updateUser(data, app.callbackSuccess, app.callbackFail);
    },
    setVisibilityHide: function(){app.log("setInAppMessageVisibilityHide"); intercom.setInAppMessageVisibility(intercom.GONE);   },
    setVisibilityShow: function(){app.log("setInAppMessageVisibilityShow"); intercom.setInAppMessageVisibility(intercom.VISIBLE);},
    setLauncherHide: function(){app.log("setLauncherHide"); intercom.setLauncherVisibility(intercom.GONE);   },
    setLauncherShow: function(){app.log("setLauncherShow"); intercom.setLauncherVisibility(intercom.VISIBLE);},
    setMessengerShow: function(){ app.log("setMessengerShow"); intercom.displayMessenger(); },
    showComposer: function(str){
      app.log("showComposer");
      intercom.displayMessageComposer(app.callbackSuccess, app.callbackFail);
    },
    showConversations: function(str){
      app.log("showConversations");
      intercom.displayConversationsList(app.callbackSuccess, app.callbackFail);
    },
    formatDate: function(i){
      return (i < 10 ? "0" + i : ""+ i);
    },
    clearLogs: function(){
      $("#log").empty();
    },
    log: function(str, data){
      var date = new Date();
      var output = date.getFullYear() + "-" +
        app.formatDate(date.getMonth()+1) + "-" +
        app.formatDate(date.getDay()+1) + " " +
        app.formatDate(date.getHours()) + ":" +
        app.formatDate(date.getMinutes()) + ":" +
        app.formatDate(date.getSeconds()) + ":-  " +
        str;
      if(data) {
        output += " [Data: " + JSON.stringify(data) + "]";
      }
      var data = $("<div></div>").text(output);
      $("#log").prepend(data);
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        $("#login").click(this.login);
        $("#loginUnidentified").click(this.loginUnidentified);
        $("#logout").click(this.logout);
        $("#submitEvent").click(this.submitEvent);
        $("#updateAttribute").click(this.updateAttribute);
        $("#showComposer").click(this.showComposer);
        $("#showConversations").click(this.showConversations);
        $("#setVisibilityHide").click(this.setVisibilityHide);
        $("#setVisibilityShow").click(this.setVisibilityShow);
        $("#setLauncherHide").click(this.setLauncherHide);
        $("#setLauncherShow").click(this.setLauncherShow);
        $("#setMessengerShow").click(this.setMessengerShow);
        $("#saveSettings").click(this.saveSettings);
        $("#clearLogs").click(this.clearLogs);
    },
    onDeviceReady: function() {
        app.receivedEvent('deviceready');

        // example from https://github.com/intercom/phonegap-plugin-push/blob/master/docs/EXAMPLES.md
        var push = PushNotification.init({
            android: {
            },
            browser: {
                pushServiceURL: 'http://push.api.phonegap.com/v1/push'
            },
            ios: {
                alert: "true",
                badge: "true",
                sound: "true"
            },
            windows: {}
        });

        push.on('registration', function(data) {
          app.log("PUSH registration: "  + data.registrationId, data);
        });

        push.on('notification', function(data) {
          app.log("PUSH notification: ", data);
            // data.message,
            // data.title,
            // data.count,
            // data.sound,
            // data.image,
            // data.additionalData
        });

        push.on('error', function(e) {
          app.log("PUSH error: ", e);
            // e.message
        });
    },
    receivedEvent: function(id) {
      app.readConfig();
    },
    readConfig: function() {
    }
};
app.initialize();
