var webpack = require('webpack'),
	pkg = require('./package.json');

var bannerText = `${pkg.name} v${pkg.version}
${pkg.description}
${pkg.homepage||''}
(c) ${new Date().getFullYear()} ${pkg.authorName}
License: ${pkg.license}`;

module.exports = {
	// entry: './mithril-data.source.js',
	entry: './source/md.js',
	output: {
		filename: 'mithril-data.js'
	},
	externals: {
		'mithril': 'm',
		'lodash': '_'
	},
	plugins: [
		new webpack.BannerPlugin(bannerText)
	]
};