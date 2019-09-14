const path = require('path')
const ETP = require('extract-text-webpack-plugin')

const publicDir = path.join(__dirname, '/public')
module.exports = [
  {
    entry: './src/index.js',
    output: {
      path: publicDir,
      publicPath: '/',
      filename: 'bundle.js'
    },
    module: {
      loaders: [{
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'env', 'stage-3']
        }
      }]
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
     node: {
        fs: "empty"
    },
    devServer: {
      historyApiFallback: true,
      contentBase: publicDir
    }
  },
  {
    entry: {
      style: './stylesheets/index.scss'
    },
    output: {
      path: publicDir,
      publicPath: '/',
      filename: 'bundle.css'
    },
    module: {
      loaders: [
        {
          test: /\.css$/,
          loader: ETP.extract({ fallback: 'style-loader', use: 'css-loader' })
        },
        {
          test: /\.scss$/,
          loader: ETP.extract({ fallback: 'style-loader', use: 'css-loader!sass-loader' })
        },
        {
          test: /\.jpg$/,
          loader: 'file-loader',
          options: {
            limit: 8192,
            name: '[name].[ext]'
          }
        }
      ]
    },
    plugins: [
      new ETP('bundle.css')
    ]
  }
]
