/*
The laser solderer widget for ChiliPeppr that uses an Arduino to control a laser with an infrared heat sensor and a PID to ensure accurate soldering.
*/
// Test this element. This code is auto-removed by the chilipeppr.load()
cprequire_test(["inline:com-chilipeppr-widget-lasersolder"], function (ls) {
    console.log("test running of " + ls.id);
    ls.init();

    chilipeppr.load("#test-serial-port", "http://fiddle.jshell.net/chilipeppr/vetj5fvx/show/light/",

    function () {
        cprequire(
        ["inline:com-chilipeppr-widget-serialport"],

        function (sp) {
            sp.setSingleSelectMode();
            sp.init(null, "tinyg");
        });
    });
    
    // tinyg widget test load
    chilipeppr.load("#test-tinyg", "http://fiddle.jshell.net/chilipeppr/XxEBZ/show/light/",

    function () {
        cprequire(
        ["inline:com-chilipeppr-widget-tinyg"],

        function (tinyg) {
            tinyg.init();
        });
    });

} /*end_test*/ );

cpdefine("inline:com-chilipeppr-widget-lasersolder", ["chilipeppr_ready"], function () {
    return {
        id: "com-chilipeppr-widget-lasersolder",
        url: "http://fiddle.jshell.net/chilipeppr/xuu785yz/show/light/",
        fiddleurl: "http://jsfiddle.net/chilipeppr/xuu785yz/",
        name: "Widget / Laser Solderer",
        desc: "This widget lets you control a laser solderer which uses a laser to heat solder with an infrared heat sensor to control over heating.",
        publish: {
        },
        subscribe: {
        },
        foreignPublish: {
        },
        foreignSubscribe: {
        },
        init: function () {

            this.setupUiFromLocalStorage();
            this.btnSetup();
            this.setupPortList();
            this.setupWsRecv();
            this.status("Loaded...");
            this.setupWatchZ();

            this.forkSetup();
            
            console.log(this.name + " done loading.");
        },
        setupWatchZ: function() {
            // subscribe to axes updates
            // /com-chilipeppr-interface-cnccontroller/axes
            chilipeppr.subscribe("/com-chilipeppr-interface-cnccontroller/axes", this, this.onAxes);
            
            // might as well setup the z threshold box change
            $('.com-chilipeppr-widget-lasersolder-stat .z-threshold').change(this.onZThresholdChange.bind(this));
        },
        onZThresholdChange: function(evt) {
            // if user changes val
            var newval = $('.com-chilipeppr-widget-lasersolder-stat .z-threshold').val();
            newval = parseFloat(newval);
            console.log("new z threshold val:", newval);
            this.options.z = newval;
            this.saveOptionsLocalStorage();
        },
        maxTemp: 0.0,
        timeStart: Date.now(),
        timeEnd: 0,
        onAxes: function(data) {
            console.log("onAxes. data:", data);
            if ('z' in data && data.z != null) {
                // we got a z val. see if it's below our threshold
                if (data.z < this.options.z) {
                    // yes, it's below threshold. turn on laser
                    if (this.isLaserOn == false) {
                        this.laserOn();
                        //this.timeStart = Date.now();
                        //this.timeEnd = this.timeStart;
                        //this.maxTemp = 0.0;
                        //this.onMaxTempUpdate();
                        //this.onTimeUpdate();
                       
                    }
                } else {
                    // laser is above z threshold. turn laser off
                    if (this.isLaserOn) {
                        this.laserOff();
                        //this.timeEnd = Date.now();
                        //this.onMaxTempUpdate();
                        //this.onTimeUpdate();
                        
                    }
                }
            }
            
        },
        statEl: {a: null, o: null, maxTemp: null, maxTempLbl: null, time: null, timeLbl: null},
        setupWsRecv: function() {
            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/ws/recv", this, this.onWsRecvLaser);
            this.statEl.a = $('.com-chilipeppr-widget-lasersolder-stat .stat-ambient');
            this.statEl.o = $('.com-chilipeppr-widget-lasersolder-stat .stat-object');
            this.statEl.maxTemp = $('.com-chilipeppr-widget-lasersolder-stat .progress-bar-maxtemp');
            this.statEl.maxTempLbl = $('.com-chilipeppr-widget-lasersolder-stat .progress-bar-maxtemp span');
            this.statEl.time = $('.com-chilipeppr-widget-lasersolder-stat .progress-bar-time');
            this.statEl.timeLbl = $('.com-chilipeppr-widget-lasersolder-stat .progress-bar-time span');
        },
        data: "",
        onWsRecvLaser: function(data) {
            //debugger;
            //console.log("data:", data);
            // make sure we have a port defined
            if ('port' in this.options && this.options.port != null && this.options.port != "empty") {
                if (data.match(/^{/)) {
                    // it is json
                    var d = $.parseJSON(data);
                    if ('P' in d && d.P == this.options.port && 'D' in d && d.D !== undefined) {
                        // append data until we have a newline
                        this.data += d.D;
                        if (this.data.match(/\r{0,1}\n/)) {
                            console.group("laser solder - onWsRecvLaser");
                            // we found our data, but may have had more than we need on one line
                            // so remove it from buffer
                            this.data = this.data.replace(/^(.*?)\r{0,1}\n/, "");
                            var line = RegExp.$1;
                            // process the line
                            console.log("processing line:", line);
                            // see if json, cuz could just be text response from Arduino
                            if (line.match(/^{/)) {
                                var tmp = $.parseJSON(line);
                                if ('a' in tmp && 'o' in tmp) {
                                    console.log("a and o were in update a:", tmp.a, "o:", tmp.o);
                                    
                                    // double check size and toss garbage
                                    if (tmp.o > 200 || tmp.a > 200) {
                                        // toss it
                                        console.log("got garbage data");
                                    } else {
                                        // good data
                                        this.statEl.a.text(tmp.a);
                                        this.statEl.o.text(tmp.o);
                                        var objTemp = parseFloat(tmp.o);
                                        if (objTemp > this.maxTemp) {
                                            // current obj temperature is higher than we've seen. record it.
                                            console.log("cur o tmp > prev max tmp");
                                            this.maxTemp = objTemp;
                                            this.onMaxTempUpdate();
                                            this.onTimeUpdate();
                                        }
                                    }
                                }
                            }
                            console.groupEnd();
                        }
                    }
                }
            }
        },
        onMaxTempUpdate: function() {
            // update dom with new max temp
            this.statEl.maxTempLbl.html(this.maxTemp + "&deg;C");
        },
        onTimeUpdate: function() {
            // update dom with new max temp
            if (this.isLaserOn) {
                this.statEl.timeLbl.html(parseInt((Date.now() - this.timeStart) / 1000) + "s");
            } else {
                this.statEl.timeLbl.html("- s");
            }
        },
        isLaserOn: false,
        timerId: null,
        laserOn: function() {
            var cmd = "send " + this.options.port + " laser-on\n";
            chilipeppr.publish("/com-chilipeppr-widget-serialport/ws/send", cmd);
            this.isLaserOn = true;
            
            this.maxTemp = 0.0;
            this.timeStart = Date.now();
            this.timeEnd = this.timeStart;
            
            // indicate on by showing red
            $('#com-chilipeppr-widget-lasersolder').removeClass("panel-default");
            $('#com-chilipeppr-widget-lasersolder .panel-heading').addClass("alert-danger");
            
            // update button and others to indicate what's next
            //$('#com-chilipeppr-widget-tinyg .tinyg-feedhold span').css('opacity', 'initial');
            $('#com-chilipeppr-widget-lasersolder .lasersolder-off').addClass('btn-danger');
            
            // start timer callback
            this.timerId = setInterval(this.onTimer.bind(this), 1000);
            
            this.status("Turning laser on");
        },
        laserOff: function() {
            var cmd = "send " + this.options.port + " laser-off\n";
            chilipeppr.publish("/com-chilipeppr-widget-serialport/ws/send", cmd);
            this.isLaserOn = false;
            
            this.timeEnd = Date.now();

            // indicate on by turning off red
            $('#com-chilipeppr-widget-lasersolder').addClass("panel-default");
            $('#com-chilipeppr-widget-lasersolder .panel-heading').removeClass("alert-danger");
            
            $('#com-chilipeppr-widget-lasersolder .lasersolder-off').removeClass('btn-danger');
            
            if (this.timerId) clearInterval(this.timerId);
            
            var onTime = (this.timeEnd - this.timeStart) / 1000;
            this.status("Turning laser off. Time on: " + onTime + "s. Max Object Temp: " + this.maxTemp + "\xB0C");
        },
        onTimer: function() {
            this.onTimeUpdate();
        },
        setupPortList: function() {
            // populate com-chilipeppr-widget-lasersolder-port
            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/list", this, this.getPortListCallback);
            chilipeppr.publish("/com-chilipeppr-widget-serialport/getlist");
            
            // create onclick event
            $('.com-chilipeppr-widget-lasersolder-port').change(this.onPortListClick.bind(this));
        },
        onPortListClick: function(evt) {
            console.group("lasersolder - onPortListClick");
            console.log("evt:", evt);
            var port = $(".com-chilipeppr-widget-lasersolder-port option:selected" ).val();
            console.log("port:", port);
            this.options.port = port;
            this.saveOptionsLocalStorage();
            console.groupEnd();
        },
        getPortListCallback: function(data) {
            console.group("lasersolder - getPortListCallback");
            console.log("data:", data);
            var portlist = $('.com-chilipeppr-widget-lasersolder-port');
            portlist.empty();
            portlist.append($("<option />").val("empty").text("(Open serial port then choose)"));
            var that = this;
            data.forEach(function(item, indx) {
                console.log("looping. item:", item);
                if (item.IsOpen) {
                    // the port is open so use it as a potential contender
                    var itemEl = $("<option />").val(item.Name).text(item.Friendly);
                    if (item.Name == that.options.port) itemEl.attr('selected', true);
                    portlist.append(itemEl);
                }
            });
            console.groupEnd();
        },
        options: null,
        setupUiFromLocalStorage: function() {
            // read vals from cookies
            var options = localStorage.getItem('com-chilipeppr-widget-lasersolder-options');
            
            if (options) {
                options = $.parseJSON(options);
                console.log("just evaled options: ", options);
            } else {
                options = {
                    showBody: true,
                    port: null,
                    z: 1.0
                };
            }
            
            // check z
            if (!('z' in options)) options.z = 1.0;
            
            this.options = options;
            console.log("options:", options);
            
            // show/hide body
            if (options.showBody) {
                this.showBody();
            } else {
                this.hideBody();
            }
            
            // setup z threshold
            $('.com-chilipeppr-widget-lasersolder-stat .z-threshold').val(this.options.z);
        },
        saveOptionsLocalStorage: function() {
            //var options = {
            //    showBody: this.options.showBody
            //};
            var options = this.options;
                
            var optionsStr = JSON.stringify(options);
            console.log("saving options:", options, "json.stringify:", optionsStr);
            // store cookie
            localStorage.setItem('com-chilipeppr-widget-lasersolder-options', optionsStr);
        },
        showBody: function(evt) {
            $('#com-chilipeppr-widget-lasersolder .panel-body').removeClass('hidden');
            $('#com-chilipeppr-widget-lasersolder .panel-footer').removeClass('hidden');
            $('#com-chilipeppr-widget-lasersolder .hidebody span').addClass('glyphicon-chevron-up');
            $('#com-chilipeppr-widget-lasersolder .hidebody span').removeClass('glyphicon-chevron-down');
            if (!(evt == null)) {
                this.options.showBody = true;
                this.saveOptionsLocalStorage();
            }
        },
        hideBody: function(evt) {
            $('#com-chilipeppr-widget-lasersolder .panel-body').addClass('hidden');
            $('#com-chilipeppr-widget-lasersolder .panel-footer').addClass('hidden');
            $('#com-chilipeppr-widget-lasersolder .hidebody span').removeClass('glyphicon-chevron-up');
            $('#com-chilipeppr-widget-lasersolder .hidebody span').addClass('glyphicon-chevron-down');
            if (!(evt == null)) {
                this.options.showBody = false;
                this.saveOptionsLocalStorage();
            }
        },
        btnSetup: function() {
            
            // chevron hide body
            var that = this;
            $('#com-chilipeppr-widget-lasersolder .hidebody').click(function(evt) {
                console.log("hide/unhide body");
                if ($('#com-chilipeppr-widget-lasersolder .panel-body').hasClass('hidden')) {
                    // it's hidden, unhide
                    that.showBody(evt);
                } else {
                    // hide
                    that.hideBody(evt);
                }
            });
            
            $('#com-chilipeppr-widget-lasersolder .btn-toolbar .btn').popover({
                delay: 500,
                animation: true,
                placement: "auto",
                trigger: "hover",
                container: 'body'
            });
            
            // energize motors
            $('#com-chilipeppr-widget-lasersolder .lasersolder-on').click(function() {
                console.log("lasersolder-on");
                that.laserOn();
                
            });
            $('#com-chilipeppr-widget-lasersolder .lasersolder-off').click(function() {
                console.log("lasersolder-off");
                that.laserOff();
                
            });
        },
        statusEl: null, // cache the status element in DOM
        status: function(txt) {
            console.log("status. txt:", txt);
            if (this.statusEl == null) this.statusEl = $('#com-chilipeppr-widget-lasersolder-status');
            var len = this.statusEl.val().length;
            if (len > 30000) {
                console.log("truncating status area text");
                this.statusEl.val(this.statusEl.val().substring(len-5000));
            }
            this.statusEl.val(this.statusEl.val() + txt + "\n");
            this.statusEl.scrollTop(
                this.statusEl[0].scrollHeight - this.statusEl.height()
            );
        },
        forkSetup: function () {
            var topCssSelector = '#com-chilipeppr-widget-lasersolder';
            
            $(topCssSelector + ' .panel-title').popover({
                title: this.name,
                content: this.desc,
                html: true,
                delay: 200,
                animation: true,
                trigger: 'hover',
                placement: 'auto'
            });
            
            var that = this;
            chilipeppr.load("http://fiddle.jshell.net/chilipeppr/zMbL9/show/light/", function () {
                require(['inline:com-chilipeppr-elem-pubsubviewer'], function (pubsubviewer) {
                    pubsubviewer.attachTo($('#com-chilipeppr-widget-lasersolder .panel-heading .dropdown-menu'), that);
                });
            });
            
        },
    }
});