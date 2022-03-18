// Constants module (w/ general configs)
// Currently, not really used. But, in case I need it later.
const constants = require("./includes/constants.js");
// Setup our primary library module, which we'll handle in our exports here.
const Stegosaurus = require("./library/Stegosaurus.js");
const stegosaurus = new Stegosaurus();
// Encode a PNG image, given a message file.
exports.encodeFile = (infile, outfile, message, callback) => {
  if (typeof callback == "undefined") {
    callback = () => {};
  }
  const sendoptions = {
    encode: true,
    decode: false,
    target: infile,
    outfile: outfile,
    inputmessagefile: message,
  };
  stegosaurus.handler(sendoptions, (err) => {
    callback(err);
  });
};

// Encode a PNG image, given a string.
exports.encodeString = (infile, outfile, messagestring, callback) => {
  if (typeof callback == "undefined") {
    callback = () => {};
  }
  const sendoptions = {
    encode: true,
    decode: false,
    target: infile,
    outfile: outfile,
    message: messagestring,
  };
  stegosaurus.handler(sendoptions, (err) => {
    callback(err);
  });
};

// Encode a message
exports.decode = (infile, length_in_bytes, callback) => {
  if (typeof callback == "undefined") {
    callback = () => {};
  }
  const sendoptions = {
    encode: false,
    decode: true,
    target: infile,
    size: length_in_bytes,
  };
  stegosaurus.handler(sendoptions, (payload) => {
    callback(payload);
  });
};
