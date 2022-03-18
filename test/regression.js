const stego = require("../stegosaurus.js");
const fs = require("fs");

const original_png = "samples/barn.png"; // The original png file.
const generated_png = "samples/cheese.png"; // The resulting file.
const message_file = "samples/dogood.txt"; // The message we're going to use as our payload.
// const message_file_regexp = new RegExp(
//   /^\s*To the Author of the New-England Courant/
// );
const message_string = "Drink more Ovaltine.";
// stego.encodeString(original_png, generated_png, message_string, (err) => {
//   if (err) {
//     throw err;
//   }
//   fs.access(generated_png, fs.constants.F_OK, (exists) => {
//     console.log(exists, "File generates: " + generated_png);
//     // Now let's decode that.
//     stego.decode(generated_png, message_string.length, (payload) => {
//       // console.log("Decoded message: ",payload);
//       console.log(payload == message_string, "Decoded properly");
//     });
//   });
// });

stego.encodeFile(original_png, generated_png, message_file, (err) => {
  if (err) {
    throw err;
  }
  fs.access(generated_png, fs.constants.F_OK, (exists) => {
    console.log(exists, "File generates: " + generated_png);
    // How long was the message?
    fs.stat(message_file, (err, stats) => {
      // Now let's decode that.
      stego.decode(generated_png, stats.size, (payload) => {
        console.log("Decoded message: ",payload);
        // console.log(payload.indexOf('To the Author of the New-England Courant') > -1, "Decoded properly");
      });
    });
  });
});

// module.exports = {
//   setUp: (callback) => {
//     // console.log("!trace SETUP");
//     callback();
//   },
//   encodeAndDecodeFile: (test) => {
//     stego.encodeFile(original_png, generated_png, message_file, (err) => {
//       if (err) {
//         throw err;
//       }

//       fs.access(generated_png, fs.constants.F_OK, (exists) => {
//         test.ok(exists, "File generates: " + generated_png);

//         // How long was the message?
//         fs.stat(message_file, (err, stats) => {
//           // Now let's decode that.
//           stego.decode(generated_png, stats.size, (payload) => {
//             // console.log("Decoded message: ",payload);
//             test.ok(payload.match(message_file_regexp), "Decoded properly");
//             test.done();
//           });
//         });
//       });
//     });
//   },
//   encodeAndDecodeString: (test) => {
//     stego.encodeString(original_png, generated_png, message_string, (err) => {
//       if (err) {
//         throw err;
//       }
//       fs.access(generated_png, fs.constants.F_OK, (exists) => {
//         test.ok(exists, "File generates: " + generated_png);
//         // Now let's decode that.
//         stego.decode(generated_png, message_string.length, (payload) => {
//           // console.log("Decoded message: ",payload);
//           test.ok(payload == message_string, "Decoded properly");
//           test.done();
//         });
//       });
//     });
//   },
//   tearDown: (callback) => {
//     // clean up
//     // console.log("!trace TEARDOWN");
//     fs.unlink(generated_png, (err) => {
//       callback();
//     });
//   },
// };
