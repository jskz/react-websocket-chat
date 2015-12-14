module.exports =
{
    entry: ['./client.js'],
    module: {
        loaders: [
            { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel' },
            { test: /\.sass$/, loader: 'style!css!sass?indentedSyntax' }
        ]
    },
    output: {
        filename: 'bundle.js',
        path: __dirname + '/static'
    }
}
