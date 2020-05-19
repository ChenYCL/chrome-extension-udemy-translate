var webpack = require('webpack'),
    path = require('path'),
    fileSystem = require('fs'),
    env = require('./utils/env'),
    { CleanWebpackPlugin } = require('clean-webpack-plugin'),
    CopyWebpackPlugin = require('copy-webpack-plugin'),
    TerserPlugin = require('terser-webpack-plugin'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    WriteFilePlugin = require('write-file-webpack-plugin');

// load the secrets
var alias = {
    'react-dom': '@hot-loader/react-dom',
};

var secretsPath = path.join(__dirname, 'secrets.' + env.NODE_ENV + '.js');

var fileExtensions = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'eot',
    'otf',
    'svg',
    'ttf',
    'woff',
    'woff2',
];

if (fileSystem.existsSync(secretsPath)) {
    alias['secrets'] = secretsPath;
}

var options = {
    mode: process.env.NODE_ENV || 'development',
    entry: {
        // newtab: path.join(__dirname, 'src', 'pages', 'Newtab', 'index.jsx'),
        options: path.join(__dirname, 'src', 'pages', 'Options', 'index.jsx'),
        popup: path.join(__dirname, 'src', 'pages', 'Popup', 'index.jsx'),
        background: path.join(__dirname, 'src', 'pages', 'Background', 'index.js'),
        devtools: path.join(__dirname, 'src', 'pages', 'Devtools', 'index.js'),
        contentScript: path.join(__dirname, 'src', 'pages', 'Content', 'index.ts'),
    },
    chromeExtensionBoilerplate: {
        notHotReload: ['contentScript'],
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].bundle.js',
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true,
                    },
                    output: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
        ],
    },
    module: {
        rules: [{
                test: /\.tsx?$/,
                loader: ['babel-loader', 'ts-loader'],
            },
            {
                test: require.resolve('zepto'),
                use: 'imports-loader?this=>window',
            },
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'less-loader'],
            },

            {
                test: new RegExp('.(' + fileExtensions.join('|') + ')$'),
                loader: 'file-loader?name=[name].[ext]',
                exclude: /node_modules/,
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(js|jsx)$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        alias: alias,
        extensions: fileExtensions
            .map((extension) => '.' + extension)
            .concat(['.jsx', '.js', '.css', '.scss', 'tsx', 'ts']),
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'zepto',
        }),
        new webpack.ProgressPlugin(),
        // clean the build folder
        new CleanWebpackPlugin({}, 'build'),
        // expose and write the allowed env vars on the compiled bundle
        new webpack.EnvironmentPlugin(['NODE_ENV']),
        new CopyWebpackPlugin(
            [{
                from: 'src/manifest.json',
                to: path.join(__dirname, 'build'),
                force: true,
                transform: function(content, path) {
                    // generates the manifest file using the package.json informations
                    return Buffer.from(
                        JSON.stringify({
                            description: process.env.npm_package_description,
                            version: process.env.npm_package_version,
                            ...JSON.parse(content.toString()),
                        })
                    );
                },
            }, ], {
                logLevel: 'info',
                copyUnmodified: true,
            }
        ),
        new CopyWebpackPlugin(
            [{
                from: 'src/pages/Content/content.styles.scss',
                to: path.join(__dirname, 'build'),
                force: true,
            }, ], {
                logLevel: 'info',
                copyUnmodified: true,
            }
        ),
        // new HtmlWebpackPlugin({
        //     template: path.join(__dirname, 'src', 'pages', 'Newtab', 'index.html'),
        //     filename: 'newtab.html',
        //     chunks: ['newtab'],
        // }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'pages', 'Options', 'index.html'),
            filename: 'options.html',
            chunks: ['options'],
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'pages', 'Popup', 'index.html'),
            filename: 'popup.html',
            chunks: ['popup'],
        }),
        new HtmlWebpackPlugin({
            template: path.join(
                __dirname,
                'src',
                'pages',
                'Background',
                'index.html'
            ),
            filename: 'background.html',
            chunks: ['background'],
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'pages', 'Devtools', 'index.html'),
            filename: 'devtools.html',
            chunks: ['devtools'],
        }),
        new WriteFilePlugin(),
    ],
};

if (env.NODE_ENV === 'development') {
    options.devtool = 'cheap-module-eval-source-map';
}

module.exports = options;
