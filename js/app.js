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

function IsBioOwner(address, callback) {
    var b = Bio.at(address);
    b.IsOwner.call(web3.eth.defaultAccount, {from: web3.eth.defaultAccount}, function (e,c) {
        console.log("Is Owner", address, c);
        callback(c);
    });
}

function updateStatus(status, address, callback) {
    var b = Bio.at(address);
    b.UpdateStatus(status, { from: web3.eth.defaultAccount }, function (e, c) {
        console.log("Status transaction:", c);
        callback(e, c);
    });
}

function initApp (web3Loaded) {
    var ViewModel = function() {
        var self = this;

        self.lookupHandle = ko.observable();
        self.lookup = function () {
            self.loadProfile(self.lookupHandle());
        }

        self.handle = ko.observable();
        self.hash = ko.observable("");
        self.bio = ko.observable("");
        self.bioVisible = ko.observable(false);
        self.IsOwner = ko.observable(false);
        self.contractAddress = ko.observable();

        self.bioReset = function () {
            self.bioVisible(false);
            self.IsOwner(false);
            self.status("");
            self.bio("");
        }

        self.loadProfile = function (handle) {
            self.bioReset();
            if (handle == undefined)
                return;
            console.log("Query for ", handle);
            // Check if profile is valid, else navigate to 404
            IsHandleAvailable(handle, function (status, address) {
                if (status) {
                    self.bioVisible(false);
                }
                else {
                    self.bioVisible(true);
                    self.handle(handle);
                    self.contractAddress(address);
                    // Load Email
                    GetEmail(handle, function (email) {
                        self.hash(email);
                    });
                    // Load Bio
                    GetBio(handle, function (bio) {
                        self.bio(bio);
                    });
                    // Load Status
                    GetStatus(handle, function (status) {
                        self.status(status);
                    });
                    // Check ownership
                    IsBioOwner(address, function (IsOwner) {
                        self.IsOwner(IsOwner);
                    })
                }
            });
        }

        self.load = ko.computed(function() {
            if (self.lookupHandle() != undefined)
                pager.navigate("#!/u/" + self.lookupHandle());
        }, self);

        self.displayPic = ko.computed(function () {
            if (self.hash() != "")
                return "https://www.gravatar.com/avatar/" + self.hash() + "?s=256";
            else
                return "";
        }, self);

        self.rhandle = ko.observable("");
        self.remail = ko.observable("");
        self.rbio = ko.observable("");
        self.previewPic = ko.computed(function () {
            if (self.remail() != "")
                return "https://www.gravatar.com/avatar/" + md5(self.remail()) + "?s=250";
            else
                return "";
        }, self);

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

        self.status = ko.observable("");
        self.draftStatus = ko.observable("");
        self.publishStatus = function () {
            updateStatus(self.draftStatus(), self.contractAddress(), function (e, tx) {
                if (e) { alert("An error occured while publishing status: " + e); return; }
            })
            self.draftStatus("");
        };

        self.updateBio = function () {

        }

        self.updateEmail = function () {

        }

        self.userPageMatch = function (opts) {
            if (opts.route.length > 1 && opts.route[0] == 'u')
                self.loadProfile(opts.route[1]);
        }
        pager.onMatch.add(self.userPageMatch);
    };

    pager.Href.hash = '#!/';
    var app = new ViewModel();
    pager.extendWithPage(app);
    ko.applyBindings(app);
    pager.start();

    if (!web3Loaded)
        pager.navigate("#!/install");
}
