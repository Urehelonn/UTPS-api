var app = require("express")();
var hostname      = process.env.API_HOSTNAME || "localhost:3000";
var mongoose      = require("mongoose");
var winston       = require('winston');
var swaggerTools  = require("swagger-tools");
var YAML          = require("yamljs");
var swaggerConfig = YAML.load("./api/swagger/swagger.yaml");
var bodyParser    = require('body-parser');
var cors          = require('cors');
var dbConnection  = 'mongodb://'
                    + (process.env.MONGODB_SERVICE_HOST || process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost')
                    + '/'
                    + (process.env.MONGODB_DATABASE || 'utpsdb');
var db_username = process.env.MONGODB_USERNAME || '';
var db_password = process.env.MONGODB_PASSWORD || '';
// var route       = require('./route/routes');

// Logging middleware
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'logfile.log' })
    ]
  });

  // addming middleware -cors
  app.use(cors());

  //body-parser
// Increase postbody sizing
app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));

// Enable CORS
app.use(function (req, res, next) {
  logger.info(req.method, req.url);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization,responseType');
  res.setHeader('Access-Control-Expose-Headers', 'x-total-count,x-pending-comment-count,x-next-comment-id');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Cache-Control', 'max-age=4');
  next();
});
// Dynamically set the hostname based on what environment we're in
swaggerConfig.host = hostname;

if (hostname !== 'localhost:3000') {
  swaggerConfig.schemes = ['https'];
}

swaggerTools.initializeMiddleware(swaggerConfig, function(middleware) {
    app.use(middleware.swaggerMetadata());
    
    var routerConfig = {
      controllers: "./api/controllers",
      useStubs: false
    };
  
    app.use(middleware.swaggerRouter(routerConfig));
    // app.use('/api', route);
    app.use(middleware.swaggerUi({apiDocs: '/api/docs', swaggerUi: '/api/docs'}));

    var routerConfig = {
      controllers: "./api/controllers",
      useStubs: false
    };
      
  
  // Load up DB
  var options = {
    useNewUrlParser: true,
    poolSize: 10,
    user: db_username,
    pass: db_password,
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
  };
app.get('/', (req,res)=>{
    res.send('foobar');
})
  logger.info("Connecting to:", dbConnection);
  mongoose.Promise  = global.Promise;
  var db = mongoose.connect(dbConnection, options).then(
    () => {
      logger.info("Database connected");
      logger.info("loading db models.");
      require('./api/helper/model/poster');
      require('./api/helper/model/audit');
      
      app.listen(3000, "localhost", function() {
        logger.info("Started server on port 3000");
       });
    },   
    err => {
      logger.info("err:", err);
      return;
    });
  });
