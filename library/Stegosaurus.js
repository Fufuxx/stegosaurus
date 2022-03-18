module.exports = function () {
  const fs = require("fs");
  const PNG = require("pngjs").PNG;
  const SPACING_X = 5;
  const SPACING_Y = 5;
  const DEFAULT_OUTFILE_NAME = "out.png";
  const is_cli = false;
  // Sample options:
  /*
	var options = {
		encode: true,
		decode: false,
		target: "",
		inputmessagefile: "",
		message: "",
		size: "",
	}
	*/
  // Here we handle the request for this module.
  // It checks for presense of files, and make sure the options array is passed in.
  // Note: the options are originally based on a set from nomnom (cli arguments parser)
  this.handler = (options, callback) => {
    if (options.encode) {
      // Does the target exist?
			console.log(`Check if ${options.target} exists`);
      fs.access(
        options.target,
        fs.constants.F_OK,
        ((err) => {
          // See if there's an outfile.
          if (typeof options.outfile == "undefined") {
            // Something that doesn't exist.
            options.outfile = DEFAULT_OUTFILE_NAME;
          }
          if (!options.outfile) {
            options.outfile = DEFAULT_OUTFILE_NAME;
          }
					console.log(`Check -outfile- if ${options.outfile} exists`);
          fs.access(
            options.outfile,
            fs.constants.F_OK,
            ((err) => {
              // You could handle not overwriting here.
              if (!err) {
                // Let's pack up the message
                if (typeof options.message != "undefined") {
                  if (options.message.length > 0) {
                    const message = this.packMessage(options.message);
                    this.encodeImage(
                      options.target,
                      message,
                      options.outfile,
                      () => {
                        cliMessage("File encoded as: " + options.outfile);
                        callback(false);
                      }
                    );
                  } else {
                    callback("Sorry, you left out the -m, message");
                  }
                } else {
                  // Ok, did they specify a file?
                  if (typeof options.inputmessagefile != "undefined") {
                    fs.access(
                      options.inputmessagefile,
                      fs.constants.F_OK,
                      ((err) => {
                        if (!err) {
                          fs.readFile(
                            options.inputmessagefile,
                            "utf8",
                            ((err, data) => {
                              // console.log("!trace message file?: ",options.inputmessagefile);
                              if (err) throw err;
                              const message = this.packMessage(data);
                              this.encodeImage(
                                options.target,
                                message,
                                options.outfile,
                                () => {
                                  cliMessage(
                                    "File encoded as: " + options.outfile
                                  );
                                  callback(false);
                                }
                              );
                            }).bind(this)
                          );
                        } else {
                          callback(
                            "Sorry, your input message file: " +
                              options.inputmessagefile +
                              " does not exist."
                          );
                        }
                      }).bind(this)
                    );
                  } else {
                    callback(
                      "Sorry, you left out the -i (input message file) or -m (message string) argument"
                    );
                  }
                }
              } else {
                callback(
                  "Sorry the file " +
                    options.target +
                    " does not exist (or you forgot the -t target flag)"
                );
              }
            }).bind(this)
          );
        }).bind(this)
      );
    } else if (options.decode) {
      fs.access(
        options.target,
        fs.constants.F_OK,
        ((err) => {
          // console.log("Exists? ",exists);
          if (!err) {
            // Great, I think we can just decode it.
            this.decodeImage(options.target, options.size, (message) => {
              callback(message);
            });
          } else {
            callback("Sorry, you need to specify a target for decoding.");
          }
        }).bind(this)
      );
    } else {
      callback("Sorry, you need to specify -e (encode) or -d (decode)");
    }
  };

  this.getCLIArguments = (callback) => {
    const opts = require("nomnom")
      .option("encode", {
        abbr: "e",
        flag: true,
        help: "[mode] Set to encode a TARGET file.",
      })
      .option("decode", {
        abbr: "d",
        flag: true,
        help: "[mode] Set to decode a TARGET file.",
      })
      .option("target", {
        abbr: "t",
        metavar: "FILE",
        help: "[both modes] Target steganographic file",
      })
      .option("inputmessagefile", {
        abbr: "i",
        metavar: "FILE",
        help: "[encode mode] A text file with the message to encode (used instead of -m)",
      })
      .option("outfile", {
        abbr: "o",
        metavar: "FILE",
        help: "[encode mode] Output filename",
      })
      .option("message", {
        abbr: "m",
        metavar: '"STRING"',
        help: "[encode mode] A string to encode into the resulting png",
      })
      .option("size", {
        abbr: "s",
        metavar: "NUMBER",
        help: "[decode mode] Number of bytes to decode",
      })
      .parse();

    // console.log("!trace nom opts: ",opts);
    // Handle this immediately if run from command line.
    if (opts.encode || opts.decode) {
      is_cli = true;
      this.handler(opts, (err) => {
        if (err) {
          cliMessage(err);
        }
      });
    }
  };
  // Conditionally log to the console if you're using this from the CLI.
  const cliMessage = (message) => {
    if (is_cli) {
      console.log(message);
    }
  };
  // Pad zeroes onto our "binary string"
  // TODO: This is inefficient. Was done to be written quickly.
  const padZero = (str) => {
    for (let j = str.length + 1; j <= 8; j++) {
      str = "0" + str;
    }
    return str;
  };
  // Replace a character in a string given an index.
  const replaceAt = (instr, index, character) => {
    return (
      instr.substr(0, index) +
      character +
      instr.substr(index + character.length)
    );
  };
  // This packs our message into an array of bits.
  // TODO: Done to be quick, I can unshift pieces from it easily.
  this.packMessage = (instr) => {
		console.log('Packing message ' + instr);
    // Make a new buffer, based on our incoming message.
    const buf = new Buffer.from(instr);
    // Sometimes you want to look at that buffer.
    console.log("!trace buffer: ",buf);
    // Let's make an array of bits, based on each
    let bitarray = [];
    for (let i = 0; i < buf.length; i++) {
      let binstr = buf[i].toString(2);
      binstr = padZero(binstr);
      // console.log("!trace each buf byte: ",buf[i]);
      // console.log("!trace bin str: ",binstr);
      for (let k = 0; k < 8; k++) {
        if (binstr.charAt(k) == "0") {
          bitarray.push(false);
        } else {
          bitarray.push(true);
        }
      }
      // Make it a binary string.
    }
    return bitarray;
  };

  const bitsToMesage = (bits) => {
    const buf = Buffer.alloc(bits.length / 8);
    let byteidx = -1;
    let mybyte = [];
    for (let i = 0; i < bits.length; i++) {
      mybyte.push(bits[i]);
      if (mybyte.length == 8) {
        let binstr = "";
        for (let j = 0; j < 8; j++) {
          let usebin = "0";
          if (mybyte[j]) {
            usebin = "1";
          }
          binstr = binstr + usebin;
        }
        // Now convert that to an int.
        let asciinum = parseInt(binstr, 2);
        // console.log("!trace EACH ASCII NUM: ",asciinum);
        byteidx++;
        buf[byteidx] = asciinum;
        // Clear it when done.
        mybyte = [];
      }
    }
    // console.log(buf);
    return buf.toString();
  };

  this.decodeImage = (path, size, callback) => {
    if (typeof size == "undefined") {
      console.log("Defaulting read size to 128");
      size = 128;
    }
    // Convert size to bits.
    size = size * 8;
		const png = new PNG({ filterType: 4 });
    fs.createReadStream(path)
      .pipe(
        png
      )
      .on("parsed", () => {
        // Ok, follow the pattern through the images
        let result = [];
        for (let y = 0; y < png.height; y++) {
          for (let x = 0; x < png.width; x++) {
            if (y % SPACING_Y == 0) {
              if (x % SPACING_X == 0) {
                if (result.length < size) {
                  let idx = (png.width * y + x) << 2;
                  // So let's get the value.
                  let blue = png.data[idx + 2];
                  let binstr = blue.toString(2);
                  binstr = padZero(binstr);
                  // console.log("!trace BLUE BINSTRING: ",binstr);
                  // What's the least significant?
                  let leastsig = binstr.charAt(7);
                  // console.log("!trace BLUE leastsig: ",leastsig);
                  let bitwise = false;
                  if (leastsig == "1") {
                    bitwise = true;
                  }
                  result.push(bitwise);
                }
              }
            }
            // and reduce opacity
            // this.data[idx+3] = this.data[idx+3] >> 1;
          }
        }
        const resultmessage = bitsToMesage(result);
        callback(resultmessage);
      });
  };

  this.encodeImage = (path, message, outfile, callback) => {
    const png = new PNG({ filterType: 4 });
    fs.createReadStream(path)
      .pipe(png)
      .on("parsed", (res) => {
				console.log(res, message);
        console.log("Parse img path - " + path, png.width, png.height, png.data);
        // Ok, follow the pattern through the images
        for (let y = 0; y < png.height; y++) {
          for (let x = 0; x < png.width; x++) {
            if (y % SPACING_Y == 0) {
              if (x % SPACING_X == 0) {
                if (message.length) {
                  // Let's unshift one.
                  let bit = message.shift();
                  // If you'd like to inspect it's coordinates and the message value.
                  console.log("!trace %d,%d --> %d",x,y,bit);
                  // Now we can take that pixel, and let's get it's blue value in binary.
                  // So we calculate it's index in the data from pngjs.
                  let idx = (png.width * y + x) << 2;
                  // Pick out that pixel.
                  let blue = png.data[idx + 2];
                  // We convert the integer value of the blue part of the pixel...
                  // To a binary string.
                  // TODO: Use typed arrays.
                  // This was easy for writing this quickly.
                  // I'd rather do it a sexier way, but, I was just trying to prototype this.
                  // ...It's inefficient, but, works.
                  let binstr = blue.toString(2);
                  binstr = padZero(binstr);
                  // Sometimes, you want to look at it.
                  // console.log("!trace BLUE BINSTRING: ",binstr);
                  // Replace that least significant bit with our shifted bit
                  let usestr = "0";
                  if (bit) {
                    usestr = "1";
                  }
                  binstr = replaceAt(binstr, 7, usestr);
                  // console.log("!trace blue / before after: ",blue,parseInt(binstr,2));
                  png.data[idx + 2] = parseInt(binstr, 2);
                }
              }
            }
            // and reduce opacity
            // this.data[idx+3] = this.data[idx+3] >> 1;
          }
        }
        // Finally, write it out, and return that it happened without error.
        png
          .pack()
          .pipe(fs.createWriteStream(outfile))
          .on("close", () => {
            callback(false);
          });
      });
  };
  // Instantiate this guy, and kick it off.
  // It won't do anything if you're not using it CLI-style.
  this.getCLIArguments();
};
