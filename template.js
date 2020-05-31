const art = require("art-template");
const path = require("path");
const config = require("rsshub/lib/config").value;

module.exports = async ({ data, type, atomlink }) => {
  type = type || "xml";
  let template;

  switch (type) {
    case "atom":
      template = path.resolve(
        __dirname,
        "node_modules/rsshub/lib/views/atom.art"
      );
      break;
    case "rss":
      template = path.resolve(
        __dirname,
        "node_modules/rsshub/lib/views/rss.art"
      );
      break;
    default:
      template = path.resolve(
        __dirname,
        "node_modules/rsshub/lib/views/rss.art"
      );
      break;
  }

  if (data) {
    data.item &&
      data.item.forEach((item) => {
        if (item.title) {
          item.title = item.title.trim();
          // trim title length
          for (let length = 0, i = 0; i < item.title.length; i++) {
            length += Buffer.from(item.title[i]).length !== 1 ? 2 : 1;
            if (length > config.titleLengthLimit) {
              item.title = `${item.title.slice(0, i)}...`;
              break;
            }
          }
        }

        if (item.enclosure_length) {
          const itunes_duration =
            Math.floor(item.enclosure_length / 3600) +
            ":" +
            (Math.floor((item.enclosure_length % 3600) / 60) / 100)
              .toFixed(2)
              .slice(-2) +
            ":" +
            (((item.enclosure_length % 3600) % 60) / 100).toFixed(2).slice(-2);
          item.itunes_duration = itunes_duration;
        }
      });
  }

  const finalData = {
    ...data,
    atomlink,
  };
  return art(template, finalData);
};
