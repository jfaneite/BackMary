const fs = require("fs");
const path = require("path");
const { parser } = require("stream-json");
const { streamArray } = require("stream-json/streamers/StreamArray");

async function* streamDocuments() {
  const filePath = path.join(__dirname, "../../json-file-tech-test.json");

  const pipeline = fs
    .createReadStream(filePath)
    .pipe(parser())
    .pipe(streamArray());

  for await (const { value } of pipeline) {
    yield value;
  }
}

module.exports = {
  streamDocuments,
};
