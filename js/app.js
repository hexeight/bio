function RegisterHandle (handle, email, bio, callback) {
    var dir = BioDirectory.deployed();
    var hash = md5(email.toLowerCase());
    dir.RegisterBio(handle, hash, bio, {from: web3.eth.defaultAccount}, function (e,c) {
        console.log("Registering handle", e, c);
        callback(e,c);
    });
}

function IsHandleAvailable(handle, callback) {
    var dir = BioDirectory.deployed();
    dir.GetBio.call(handle, { from: web3.eth.defaultAccount }, function (e,c) {
        console.log("Handle address", e,c);
        if (parseInt(c) <= 0)
            callback(true, c);
        else
            callback(false, c);
    });
}

function GetBio(handle, callback) {
    IsHandleAvailable(handle, function (isFree, address) {
        if (isFree) {
            callback(null);
        }
        else {
            var b = Bio.at(address);
            b.GetBio.call({from: web3.eth.defaultAccount}, function (e,c) {
                console.log("Bio for", address, c);
                callback(c);
            })
        }
    });
}

function GetEmail(handle, callback) {
    IsHandleAvailable(handle, function (isFree, address) {
        if (isFree) {
            callback(null);
        }
        else {
            var b = Bio.at(address);
            b.GetEmail.call({from: web3.eth.defaultAccount}, function (e,c) {
                console.log("Hash for", address, c);
                callback(c);
            })
        }
    });
}

function GetStatus(handle, callback) {
    IsHandleAvailable(handle, function (isFree, address) {
        if (isFree) {
            callback(null);
        }
        else {
            var b = Bio.at(address);
            b.GetStatus.call({from: web3.eth.defaultAccount}, function (e,c) {
                console.log("Status for", address, c);
                callback(c);
            })
        }
    });
}


function initApp () {
    var ViewModel = function() {
        var self = this;

        self.handle = ko.observable();
        self.hash = ko.observable("");
        self.bio = ko.observable("");

        self.load = ko.computed(function() {
            if (self.handle() == undefined)
                return;
            console.log("Query for ", self.handle());
            // Check if profile is valid, else navigate to 404
            IsHandleAvailable(self.handle(), function (status, address) {
                if (status)
                    pager.navigate("#!/404");
                else
                    self.loadProfile(self.handle());
            });
        }, self);

        self.loadProfile = function (handle) {
            // Load Email
            GetEmail(handle, function (email) {
                self.hash(email);
            });
            // Load Bio
            GetBio(handle, function (bio) {
                self.bio(bio);
            });
        }

        self.displayPic = ko.computed(function () {
            if (self.hash() != "")
                return "https://www.gravatar.com/avatar/" + self.hash() + "?s=256";
            else
                return "";
        }, self);

        self.rhandle = ko.observable("");
        self.remail = ko.observable("");
        self.rbio = ko.observable("");
        
        self.rreset = function () {
            self.rhandle("");
            self.remail("");
            self.rbio("");
        }

        self.register = function () {
            // check if handle is available
            IsHandleAvailable(self.rhandle(), function (status, address) {
                if (!status) {
                    alert("Oops! This handle is already taken. Try another.");
                    return;
                }
                console.log(md5(self.remail()));
                RegisterHandle(self.rhandle(), self.remail(), self.rbio(), function (e,c) {
                    self.rreset();
                });
            })
        }
    };

    pager.Href.hash = '#!/';
    var app = new ViewModel();
    pager.extendWithPage(app);
    ko.applyBindings(app);
    pager.start();
}