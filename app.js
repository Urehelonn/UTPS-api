var app = require("express")();
var hostname      = process.env.API_HOSTNAME || "localhost:3000";
var mongoose      = require("mongoose");
var winston       = require('winston');
var bodyParser    = require('body-parser');
var cors          = require('cors');
var dbConnection  = 'mongodb://'
                    + (process.env.MONGODB_SERVICE_HOST || process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost')
                    + '/'
                    + (process.env.MONGODB_DATABASE || 'utpsdb');
var db_username = process.env.MONGODB_USERNAME || '';
var db_password = process.env.MONGODB_PASSWORD || '';
const route = require('./routes')
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
// app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));

// Dynamically set the hostname based on what environment we're in

app.use('/api', route);
  
  
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
console.log("I am here", dbConnection);
  logger.info("Connecting to:", dbConnection);
  mongoose.Promise  = global.Promise;
  mongoose.connect(dbConnection,options)
  mongoose.connection.on('connected',()=> {
    app.listen(3000, "localhost", function() {
        logger.info("Started server on port 3000");
          }
  )},   err => {
    logger.info("err:", err);
      return;
    });
