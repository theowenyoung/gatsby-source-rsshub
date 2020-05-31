/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const path = require(`path`);
const rsshub = require("./rsshub");
const template = require("./template");

exports.sourceNodes = async (
  { reporter, actions, cache, createNodeId, createContentDigest },
  pluginOptions
) => {
  const { createNode } = actions;
  const siteUrl = pluginOptions.siteUrl || "";
  const cacheTime = pluginOptions.cacheTime || 0;
  const rsshubConfig = pluginOptions.rsshubConfig || {};
  const sources = pluginOptions.rsshub || [];
  const globalQuery = pluginOptions.query || {};
  const globalQueryObj = new URLSearchParams(globalQuery);
  const globalQueryString = globalQueryObj.toString();
  rsshub.init(rsshubConfig);
  for (let i = 0; i < sources.length; i++) {
    if (typeof sources[i] === "string") {
      sources[i] = { url: sources[i] };
    }
    let finalUrlObj = new URL(sources[i].url, "https://example.org");
    const query = sources[i].query || {};
    const queryObj = new URLSearchParams(query);
    const queryString = queryObj.toString();
    const urlQueryString = finalUrlObj.searchParams.toString();
    let allQueryString = "";

    if (globalQueryString) {
      allQueryString = `${globalQueryString}`;
    }
    if (queryString) {
      if (allQueryString) {
        allQueryString = `${allQueryString}&${queryString}`;
      } else {
        allQueryString = `${queryString}`;
      }
    }
    if (urlQueryString) {
      if (allQueryString) {
        allQueryString = `${allQueryString}&${urlQueryString}`;
      } else {
        allQueryString = `${urlQueryString}`;
      }
    }
    finalUrlObj.search = new URLSearchParams(allQueryString);

    const finalUrl = finalUrlObj.pathname + finalUrlObj.search;

    let defaultOutputPath = finalUrlObj.pathname.slice(1);
    defaultOutputPath = defaultOutputPath;
    const ext = path.extname(defaultOutputPath).slice(1);
    const outputPath = sources[i].slug || defaultOutputPath;
    const getDataWithCache = async function (finalUrl) {
      reporter.info(`fetch rsshub ${finalUrl}`);
      let remoteData = await rsshub.get(finalUrl);
      let obj = {};
      obj = { created: Date.now() };
      obj.data = remoteData;
      await cache.set(finalUrl, obj);
      return remoteData;
    };
    // check cache
    let data;
    if (cacheTime > 0) {
      const cacheData = await cache.get(finalUrl);
      if (cacheData) {
        if (Date.now() - cacheData.created < cacheTime) {
          // exist
          reporter.info(`rsshub ${finalUrl} use cache`);
          data = cacheData.data;
        } else {
          data = await getDataWithCache(finalUrl);
        }
      } else {
        data = await getDataWithCache(finalUrl);
      }
    } else {
      data = await getDataWithCache(finalUrl);
    }
    data = {
      title: finalUrl,
      ...data,
      atomlink: siteUrl + "/" + outputPath,
      ttl: cacheTime > 0 ? Math.floor(cacheTime / 1000 / 60) : 0,
    };

    const xmlData = await template({
      sourceUrl: finalUrl,
      data: data,
      type: "xml",
    });

    const atomData = await template({
      sourceUrl: finalUrl,
      data: data,
      type: "atom",
    });
    // Data can come from anywhere, but for now create it manually
    const myData = {
      sourceUrl: finalUrl,
      slug: outputPath,
      data: data,
      json: JSON.stringify(data),
      xml: xmlData,
      atom: atomData,
    };

    const nodeContent = JSON.stringify(myData);

    const nodeMeta = {
      id: createNodeId(outputPath),
      parent: null,
      children: [],
      internal: {
        type: `rsshub`,
        mediaType: `application/rss+${ext}`,
        content: nodeContent,
        contentDigest: createContentDigest(myData),
      },
    };

    const node = Object.assign({}, myData, nodeMeta);
    createNode(node);
  }

  // You're done, return.
  return;
};
