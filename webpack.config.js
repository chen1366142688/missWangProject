const webpack = require('webpack');
const path = require('path');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const time = new Date().getTime();
module.exports = {
  entry: {
    bundle: './src/app.js',
    react: ['react'],
    reactDom: ['react-dom'],
    vendor: ['rc-queue-anim', 'moment'],
    router: ['react-router', 'react-router-dom'],
    tools: ['lodash', 'reqwest', 'js-md5', 'viewerjs'],
  },
  output: {
    path: path.resolve(__dirname, 'manager'),
    filename: 'build/[name].js',
    // publicPath: "./",
    // chunkFilename: `build/file/[name].js` //异步加载模块名字，以及路径
    chunkFilename: 'build/file/[name].[chunkhash:8].js', // 异步加载模块名字，以及路径
  },

  plugins: [
    new CommonsChunkPlugin({
      name: ['vendor', 'tools', 'react', 'router', 'reactDom'],
      minChunks: 2,
    }),

    new ExtractTextPlugin('./build/style.css'),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.LoaderOptionsPlugin({
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      options: {
        eslint: {
          configFile: './.eslintrc.js',
        },
      },
    }),
    new HtmlWebpackPlugin({
      title: 'Cashlending',
      filename: './index.html',
      hash: false,
    }),
    new CleanWebpackPlugin('manager/build'),

    // new UglifyJsPlugin({ // 生产环境压缩代码
    //   mangle: {
    //     except: ['$super', '$', 'exports', 'require', 'module', '_'],
    //   },
    //   compress: {
    //     warnings: false,
    //   },
    //   output: {
    //     comments: false,
    //   },
    // }),
  ],
  // devtool: 'cheap-module-source-map',
  devtool: false,
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            query: {
              plugins: ['transform-runtime', ['import', { // 按需引入antd, 减小项目体积
                libraryName: 'antd',
                style: 'true',
              }]],
              presets: ['es2015', 'react', 'stage-2'],
            },

          },
          // { //代码检查
          //     loader: 'eslint-loader',
          // }
        ],
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }),
      },
      {
        test: /\.(woff|svg|eot|ttf|woff2)$/,
        exclude: /node_modules/,
        loader: 'url-loader?name=../src/assets/css/[name].[ext]',
      },
      {
        test: /\.(png|jpg|gif|jpeg)$/,
        exclude: /node_modules/,
        loader: 'url-loader?name=../src/assets/img/[name].[ext]',
      },
    ],
  },
  node: {
    fs: "empty"
  },
  //别名
  resolve: {
    alias: {
      'Src': __dirname + '/src',
      'Lib': __dirname + '/src/lib',
      'Components': __dirname + '/src/lib/component',
      'Store': __dirname + '/src/stores',
      'Dispatcher': __dirname + '/src/dispatcher/dispatcher.js',
      'Constants': __dirname + '/src/constants/constants.js'
    },
    //后缀自动补全功能
    extensions: ['.js', '.jsx', '.json', '.css', '.scss', '.less', '.png', '.jpg']
  },
  devServer: {
      host: 'localhost',
      port: 8080,
      compress: true,
      contentBase: './',
      publicPath: '/manager/',
      historyApiFallback: true,
      proxy: {
          // '/msrestful': 'http://118.24.108.231:8090', // 测试服务器
          '/msrestful': 'http://111.231.209.157:8090', // 测试服务器
          // "/msrestful": "http://192.168.11.186:8000", //许哥
          // "/msrestful": "http://10.1.1.171:8083", //东哥
          // '/msrestful': 'http://localhost:8080', // 测试服务器

          // '/report-bi-restful': 'http://111.231.209.157:19181', // 测试报表
          '/report-bi-restful': 'http://localhost:19181', // 测试报表

          '/report-restful': 'http://132.232.97.63:8981', // 测试报表
          // '/report-restful': 'http://localhost:8081', // 测试报表

          //'/market': 'http://132.232.97.63:8321', // 测试贷超
          //'/market': 'http://132.232.97.63:8321', // 测试贷超

          '/collection-rest': 'http://132.232.97.63:9411', // 测试催收
          //'/collection-rest': 'http://132.232.97.63:9411', // 测试催收

          '/market': 'http://132.232.97.63:8321', // 测试贷超
          // '/market': 'http://192.168.50.111:8321', // 测试贷超

          '/risk': 'http://111.231.209.157:8601', // 测试贷超

          '/uplending-manager-restful': 'http://192.168.11.149:8080', // 涛哥
          // "/uplending-manager-restful": "http://192.168.11.61:8080", //强哥

          '/cashlending-report-restful': 'http://192.168.11.186:8080', // 许哥报表
          
          '/uplending-external-web': 'https://app.cashlending.ph'

    },
  },
};
