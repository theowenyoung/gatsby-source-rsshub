# gatsby-source-rsshub

Create a rss xml from rsshub for your Gatsby site.

## Install

`npm install --save gatsby-source-rsshub`

## How to Use

```javascript
// In your gatsby-config.js

plugins: [`gatsby-source-rsshub`];
```

## Options

The options are as follows:

- `siteUrl` (string) use for atom link
- `query` (object) rsshub default query, it will set to every rsshub request search. example: `{"limit":10}`
- `rsshubConfig` (object) look here: [config](https://docs.rsshub.app/install/#pei-zhi)
- `rsshub` (array), config all rsshub url needed to request

Example:

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-rsshub`,
    options: {
      query: {
        limit: 10,
      },
      rsshubConfig: {},
      rsshub: ["/weseepro/newest"], // default output will be ${prefix}/weseepro/newest.xml
      // or
      // rsshub: [{url:"/weseepro/newest",query:{limit:10},slug:"test.xml"}]
    },
  },
];
```

## Query

```graphql
{
  allRsshub {
    edges {
      node {
        slug
        json
        xml
        atom
        sourceUrl
      }
    }
  }
}
```
